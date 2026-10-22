// Operates ONLY on this run's explicitly labelled synthetic QA cases.
// Sign into the normal app first. No credentials are embedded or exported.
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hem_agent/main.dart';
import 'package:hem_agent/core/supabase_config.dart';
import 'package:hem_agent/screens/cases/cases_list_screen.dart';
import 'package:hem_agent/screens/cases/case_details_screen.dart';
import 'package:hem_agent/screens/workflows/review_step.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  final results = <Map<String, dynamic>>[];
  void record(String name, bool pass, [Object? detail]) {
    results.add({'name': name, 'result': pass ? 'PASS' : 'FAIL', 'detail': detail});
    binding.reportData = {...?binding.reportData, 'checks': results};
    debugPrint('QA_CHECK $name ${pass ? "PASS" : "FAIL"}');
  }
  Future<void> settle(WidgetTester tester) async {
    await tester.pumpAndSettle(const Duration(milliseconds: 200),
        EnginePhase.sendSemanticsUpdate, const Duration(seconds: 30));
    await Future<void>.delayed(const Duration(seconds: 2));
    await tester.pumpAndSettle();
  }
  testWidgets('QA cases mobile workflows and authenticated portal APIs', (tester) async {
    await Supabase.initialize(url: SupabaseConfig.url, publishableKey: SupabaseConfig.publishableKey);
    final db = Supabase.instance.client;
    expect(db.auth.currentSession, isNotNull, reason: 'Sign in using the existing test account in the emulator first.');
    await tester.pumpWidget(const HEMApp());
    await settle(tester);
    record('Authenticated app startup', find.byType(CasesListScreen).evaluate().isNotEmpty);
    await binding.convertFlutterSurfaceToImage();
    await tester.pump();
    await binding.takeScreenshot('home');
    final router = GoRouter.of(tester.element(find.byType(CasesListScreen)));
    final cases = await db.from('cases').select('id,application_number,client:client_id(template_name),extracted_data,assigned_to').like('application_number', 'QA-20260926-%').order('application_number');
    record('All fourteen assigned QA cases are accessible', cases.length == 14, {'count': cases.length});
    const base = 'http://10.0.2.2:3000';
    Map<String, String> auth() => {'Authorization':'Bearer ${db.auth.currentSession!.accessToken}'};
    final page = await http.get(Uri.parse('$base/api/v1/cases?search=QA-20260926&pageSize=100'), headers: auth());
    record('Agent authenticated case API search', page.statusCode == 200 && (jsonDecode(page.body)['data'] as List).length == 14, {'status':page.statusCode});
    final badPage = await http.get(Uri.parse('$base/api/v1/cases?page=0'), headers: auth());
    record('API rejects invalid pagination', badPage.statusCode == 400, badPage.statusCode);
    final guest = await http.get(Uri.parse('$base/api/v1/cases?search=QA-20260926'));
    record('API rejects unauthenticated access', guest.statusCode == 401, guest.statusCode);
    final export = await http.get(Uri.parse('$base/api/export-users'), headers: auth());
    record('Agent cannot export users', export.statusCode == 403, export.statusCode);
    final anon = SupabaseClient(SupabaseConfig.url, SupabaseConfig.publishableKey);
    try {
      final rows=await anon.from('cases').select('id').like('application_number','QA-20260926-%');
      record('Anonymous database cannot read QA cases', rows.isEmpty, {'rows':rows.length});
    } on PostgrestException catch(e) { record('Anonymous database cannot read QA cases', true, e.code); }
    await anon.dispose();
    Uint8List? photoBytes;
    for(final c in cases) {
      final id=c['id'] as String;final ref=c['application_number'] as String;
      if(!ref.startsWith('QA-20260926-'))throw StateError('QA scope violation');
      try {
        router.go('/cases/$id');await settle(tester);
        record('$ref mobile details', find.byType(CaseDetailsScreen).evaluate().isNotEmpty && find.text(ref).evaluate().isNotEmpty);
        final fields=await db.from('case_field_data').select('case_id,applicant_name').eq('case_id',id).single();
        final photos=await db.from('case_photos').select('id,file_url').eq('case_id',id).order('created_at');
        record('$ref mobile persisted fields/photos', (fields['applicant_name'] as String).startsWith('QA ONLY') && photos.isNotEmpty, {'photos':photos.length});
        if(photoBytes==null){final response=await http.get(Uri.parse(photos.first['file_url'] as String));expect(response.statusCode,200);photoBytes=response.bodyBytes;}
        final uploadPath='$id/qa-20260926-agent-upload.jpg';
        await db.storage.from('photos').uploadBinary(uploadPath,photoBytes,fileOptions:const FileOptions(contentType:'image/jpeg',upsert:true));
        final exists=await db.from('case_photos').select('id').eq('case_id',id).eq('photo_type','qa_agent_upload');
        if(exists.isEmpty)await db.from('case_photos').insert({'case_id':id,'photo_type':'qa_agent_upload','file_url':db.storage.from('photos').getPublicUrl(uploadPath)});
        record('$ref mobile authenticated photo upload',true);
        router.go('/cases/$id/review');await settle(tester);
        record('$ref data review screen',find.byType(ReviewStep).evaluate().isNotEmpty && find.byType(TextFormField).evaluate().isNotEmpty);
        final template=(c['client'] as Map)['template_name'] as String;
        final request=http.MultipartRequest('POST',Uri.parse('$base/api/generate-template-report'));
        request.headers.addAll(auth());request.fields.addAll({'report_id':template,'data_json':jsonEncode(c['extracted_data'])});
        for(var i=0;i<photos.length;i++)request.files.add(http.MultipartFile.fromBytes('photo_$i',photoBytes,filename:'qa.jpg',contentType:http.MediaType('image','jpeg')));
        final response=await request.send();final bytes=await response.stream.toBytes();
        record('$ref authenticated report generation',response.statusCode==200 && bytes.length>1000 && bytes[0]==80 && bytes[1]==75, {'status':response.statusCode,'bytes':bytes.length,'template':template});
      }catch(e){record('$ref workflow',false,e.toString());}
    }
    final target=cases.first;final id=target['id'] as String;
    for(final route in ['location','documents','photos','media']){
      try{router.go('/cases/$id/$route');await settle(tester);final errors=tester.takeException();record('Mobile $route screen renders',errors==null,errors?.toString());await binding.takeScreenshot(route);}catch(e){record('Mobile $route screen renders',false,e.toString());}
    }
    router.go('/cases/$id');await settle(tester);
    router.push('/cases/$id/review');await settle(tester);
    final branch=find.byWidgetPredicate((w)=>w is TextField && w.decoration?.labelText=='Branch *');
    if(branch.evaluate().isNotEmpty){await tester.ensureVisible(branch);await tester.enterText(branch,'QA MOBILE EDIT');await tester.testTextInput.receiveAction(TextInputAction.done);}
    final save=find.text('Save Draft');await tester.ensureVisible(save);await tester.tap(save);await settle(tester);
    if(find.text('Save Anyway').evaluate().isNotEmpty){await tester.tap(find.text('Save Anyway'));}else if(find.text('Save').evaluate().isNotEmpty){await tester.tap(find.text('Save'));}
    await settle(tester);
    final saved=await db.from('cases').select('status,extracted_data').eq('id',id).single();
    record('Mobile draft save persists', saved['status']=='data_drafted' && (saved['extracted_data'] as Map)['branch']=='QA MOBILE EDIT',{'status':saved['status'],'branch':(saved['extracted_data'] as Map)['branch']});
    router.go('/profile');await settle(tester);record('Profile screen renders',find.text('Profile & Settings').evaluate().isNotEmpty);await binding.takeScreenshot('profile');
    router.go('/leaves');await settle(tester);record('Leave screen renders',find.text('Leave Management').evaluate().isNotEmpty);await binding.takeScreenshot('leaves');
    router.go('/cases');await settle(tester);
    binding.reportData={...?binding.reportData,'checks':results,'caseCount':cases.length};
    // Audit intentionally retains failed checks in JSON instead of aborting coverage on the first defect.
  }, timeout: const Timeout(Duration(minutes:20)));
}

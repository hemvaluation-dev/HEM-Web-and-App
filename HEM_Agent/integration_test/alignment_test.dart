// Only synthetic QA-20260926 cases are modified. Existing real cases are never written.
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:integration_test/integration_test.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:hem_agent/main.dart';
import 'package:hem_agent/core/supabase_config.dart';
import 'package:hem_agent/core/case_files.dart';
import 'package:hem_agent/core/case_workflow.dart';
import 'package:hem_agent/core/field_requirements.dart';
import 'package:hem_agent/screens/cases/cases_list_screen.dart';
import 'qa_document.dart';

void main() {
  final binding = IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  final checks = <Map<String,dynamic>>[];
  void record(String name, bool pass, [Object? detail]) {
    checks.add({'name':name,'pass':pass,'detail':detail});
    binding.reportData = {...?binding.reportData,'checks':checks};
    debugPrint('QA_CHECK $name ${pass ? "PASS" : "FAIL"}');
  }
  Future<void> settle(WidgetTester tester) async {
    await tester.pumpAndSettle(const Duration(milliseconds:200),EnginePhase.sendSemanticsUpdate,const Duration(seconds:45));
    await Future<void>.delayed(const Duration(seconds:1));
    await tester.pumpAndSettle();
  }
  testWidgets('Mobile alignment with production schema and portal', (tester) async {
    await Supabase.initialize(url:SupabaseConfig.url,publishableKey:SupabaseConfig.publishableKey);
    final db=Supabase.instance.client;
    expect(db.auth.currentSession,isNotNull,reason:'Sign into the existing test account first.');
    await tester.pumpWidget(const HEMApp()); await settle(tester);
    expect(find.byType(CasesListScreen),findsOneWidget);
    record('Signed-in app startup',true);
    await binding.convertFlutterSurfaceToImage(); await tester.pump();
    await binding.takeScreenshot('aligned-home');
    final router=GoRouter.of(tester.element(find.byType(CasesListScreen)));
    final rows=await db.from('cases').select('id,application_number,revision,status,extracted_data,client:client_id(template_name)').like('application_number','QA-20260926-%').eq('assigned_to',db.auth.currentUser!.id);
    expect(rows.length,14);
    for(final route in ['', '/location','/documents','/photos','/media','/review']) {
      router.go('/cases/${rows.first['id']}$route'); await settle(tester);
      final error=tester.takeException(); record('Mobile screen ${route.isEmpty?"summary":route}',error==null,error?.toString());
      if(route=='/photos'||route=='/review') await binding.takeScreenshot('aligned-${route.substring(1)}');
    }
    for(final row in rows) {
      final id=row['id'] as String, ref=row['application_number'] as String;
      try {
        final template=row['client']['template_name'] as String;
        final photos=await db.from('case_photos').select('file_url').eq('case_id',id).limit(1);
        final signed=await CaseFiles.sign(photos,'photos');
        expect((await http.get(Uri.parse(signed.single['file_url']))).statusCode,200);
        record('$ref private photo access',true);
        final docs=await db.from('case_documents').select('id').eq('case_id',id).not('document_type','in','("Audio Recording","Video Recording")');
        if(docs.isEmpty) {
          final path='$id/qa-alignment-${DateTime.now().microsecondsSinceEpoch}.pdf';
          await db.storage.from('documents').uploadBinary(path,base64Decode(qaDocument),fileOptions:const FileOptions(contentType:'application/pdf'));
          await db.from('case_documents').insert({'case_id':id,'document_type':'Sale Deed','file_name':'SYNTHETIC QA ONLY.pdf','file_url':db.storage.from('documents').getPublicUrl(path)});
        }
        final locations=await db.from('case_location').select('id').eq('case_id',id);
        if(locations.isEmpty) await db.from('case_location').upsert({'case_id':id,'latitude':12.9716,'longitude':77.5946,'address_from_gps':'SYNTHETIC QA Bengaluru'},onConflict:'case_id');
        var current=await db.from('cases').select().eq('id',id).single();
        if(['assigned','new','in_progress'].contains(current['status'])) {
          final data=Map<String,dynamic>.from(current['extracted_data']??{});
          for(final f in FieldRequirements.forTemplate(template)) {
            if(!FieldRequirements.filled(f['key']!,data)) data[f['key']!]='N/A - synthetic QA';
          }
          data.addAll({'no_of_floors':'2','floor_wise_area':[{'floor':'Ground','plinthArea':'900','slabArea':'900'},{'floor':'First','plinthArea':'900','slabArea':'900'}], 'land_area':'133.33','bua':'100','slab_area':'100','remarks_and_violations':'SYNTHETIC QA ONLY. Not for lending or valuation.'});
          current=await CaseWorkflow.save(id,data,(current['revision'] as num).toInt());
          await CaseWorkflow.submit(id,(current['revision'] as num).toInt());
          current=await db.from('cases').select().eq('id',id).single();
        }
        expect(['field_visit_done','report_drafted','in_review','reviewed','completed'],contains(current['status'])); record('$ref canonical submission',true);
        var denied=false;
        try { await CaseWorkflow.save(id,{'branch':'Must not save'},(current['revision'] as num).toInt()); } on PostgrestException { denied=true; }
        expect(denied,true);record('$ref field editing locked after submission',true);
        final request=http.MultipartRequest('POST',Uri.parse('http://10.0.2.2:3100/api/generate-template-report'));
        request.headers['Authorization']='Bearer ${db.auth.currentSession!.accessToken}';
        request.fields.addAll({'case_id':id,'revision':'${current['revision']}','report_id':template,'data_json':'{}'});
        final response=await request.send(); await response.stream.drain();
        expect(response.statusCode,403);record('$ref agent cannot generate valuation report',true);
      } catch(e) { record('$ref workflow',false,e.toString()); }
    }
    final invalid=await http.post(Uri.parse('${SupabaseConfig.url}/functions/v1/google-geocode'),headers:{'Authorization':'Bearer ${db.auth.currentSession!.accessToken}','apikey':SupabaseConfig.publishableKey,'Content-Type':'application/json'},body:jsonEncode({'latitude':91,'longitude':0}));
    record('Geocoding rejects invalid coordinates',invalid.statusCode==400,invalid.statusCode);
    router.go('/cases'); await settle(tester); await binding.takeScreenshot('submitted-cases');
    expect(checks.where((c)=>c['pass']!=true),isEmpty);
  });
}

import 'package:supabase_flutter/supabase_flutter.dart';

class CaseFiles {
  static Future<List<Map<String, dynamic>>> sign(
    List<dynamic> rows,
    String bucket,
  ) async {
    if (rows.isEmpty) return [];
    final paths = rows.map((row) {
      final uri = Uri.parse(row['file_url'] as String);
      final marker = '/$bucket/';
      final index = uri.path.indexOf(marker);
      if (index < 0) throw StateError('Invalid case file URL');
      return Uri.decodeComponent(uri.path.substring(index + marker.length));
    }).toList();
    final urls = await Supabase.instance.client.storage
        .from(bucket)
        .createSignedUrls(paths, 3600);
    return List.generate(
      rows.length,
      (i) => {
        ...Map<String, dynamic>.from(rows[i]),
        'file_url': urls[i].signedUrl,
      },
    );
  }
}

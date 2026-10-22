import '../../core/accurate_location.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../theme/app_theme.dart';
import '../../widgets/hem_confirm_dialog.dart';

class LocationStep extends StatefulWidget {
  final String caseId;
  const LocationStep({super.key, required this.caseId});

  @override
  State<LocationStep> createState() => _LocationStepState();
}

class _LocationStepState extends State<LocationStep> {
  bool _loading = false;
  bool _saving = false;
  Map<String, dynamic>? _locationData;
  Map<String, dynamic>? _amenities;
  String? _propertyType;
  String? _mappingWarning;

  @override
  void initState() {
    super.initState();
    _fetchExistingLocation();
  }

  Map<String, dynamic>? _parseAmenity(String? dbValue) {
    if (dbValue == null) return null;
    final regex = RegExp(r'^(.*?)(?:\s*\((.*?)\s*m\))?$');
    final match = regex.firstMatch(dbValue.trim());
    if (match != null) {
      return {
        'name': match.group(1)?.trim(),
        'distance': match.group(2)?.trim(),
      };
    }
    return {'name': dbValue, 'distance': null};
  }

  Future<void> _fetchExistingLocation() async {
    setState(() => _loading = true);
    try {
      final caseRes = await Supabase.instance.client
          .from('cases')
          .select('property_type, extracted_data')
          .eq('id', widget.caseId)
          .maybeSingle();

      final res = await Supabase.instance.client
          .from('case_location')
          .select()
          .eq('case_id', widget.caseId)
          .maybeSingle();

      if (mounted) {
        setState(() {
          if (caseRes != null) {
            _propertyType =
                caseRes['property_type'] ??
                caseRes['extracted_data']?['property_type'];
          }
          if (res != null) {
            _locationData = {
              'latitude': (res['latitude'] as num?)?.toDouble() ?? 0.0,
              'longitude': (res['longitude'] as num?)?.toDouble() ?? 0.0,
              'altitude': (res['altitude'] as num?)?.toDouble() ?? 0.0,
              'accuracy': (res['accuracy'] as num?)?.toDouble() ?? 0.0,
              'address_from_gps': res['address_from_gps'] ?? '',
            };

            _amenities = {
              'bus_stop':
                  _parseAmenity(res['nearest_bus_stop']) ?? {'name': 'N/A'},
              'railway_station':
                  _parseAmenity(res['nearest_railway']) ?? {'name': 'N/A'},
              'hospital':
                  _parseAmenity(res['nearest_hospital']) ?? {'name': 'N/A'},
              'airport':
                  _parseAmenity(res['nearest_airport']) ?? {'name': 'N/A'},
              'highway':
                  _parseAmenity(res['nearest_highway']) ?? {'name': 'N/A'},
              // 'park': _parseAmenity(res['nearest_park']) ?? {'name': 'N/A'},
            };
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching existing location: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _requestAndFetchLocation() async {
    setState(() => _loading = true);
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permission denied');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied');
      }

      final position = await AccurateLocation.capture();
      final res = await Supabase.instance.client.functions.invoke(
        'google-geocode',
        body: {
          'latitude': position.latitude,
          'longitude': position.longitude,
          'altitude': position.altitude,
          'accuracy': position.accuracy,
          'action': 'capture',
        },
      );
      if (!mounted) return;
      final coords = res.data['coordinates'];
      final address = res.data['address'];

      setState(() {
        _locationData = {
          'latitude':
              (coords?['latitude'] as num?)?.toDouble() ?? position.latitude,
          'longitude':
              (coords?['longitude'] as num?)?.toDouble() ?? position.longitude,
          'altitude':
              (coords?['altitude'] as num?)?.toDouble() ?? position.altitude,
          'accuracy':
              (coords?['accuracy'] as num?)?.toDouble() ?? position.accuracy,
          'address_from_gps': address?['formatted_address'] ?? '',
          'city': address?['city'] ?? '',
          'state': address?['state'] ?? '',
          'pincode': address?['pincode'] ?? '',
        };
        _amenities ??= Map<String, dynamic>.from(res.data['amenities'] ?? {});
        _mappingWarning = [
          res.data['warning'] as String?,
          if (position.accuracy > 25)
            'GPS accuracy is ±${position.accuracy.round()} m. Move outdoors and recapture for a better reading.',
        ].whereType<String>().join(' ');
        if (_mappingWarning!.isEmpty) _mappingWarning = null;
      });
    } catch (e) {
      if (!mounted) return;
      debugPrint(e.toString());
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error: $e')));
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  String? _formatAmenity(Map<String, dynamic>? amenity) {
    if (amenity == null || amenity['name'] == null) return null;
    if (amenity['name'] == 'N/A' || amenity['name'] == '') return 'N/A';
    final name = amenity['name'];
    final dist = amenity['distance'];
    if (dist != null && dist.toString().isNotEmpty) {
      return '$name ($dist m)';
    }
    return name;
  }

  Future<void> _handleSave() async {
    if (_locationData == null) return;

    final confirmed = await HemConfirmDialog.show(
      context: context,
      title: 'Confirm Location Data',
      message:
          'Save and verify these GPS coordinates and neighborhood amenities for the property report?',
      confirmLabel: 'Save Location',
      icon: LucideIcons.mapPin,
    );
    if (confirmed != true) return;

    setState(() => _saving = true);
    try {
      final supabase = Supabase.instance.client;

      await supabase.from('case_location').upsert({
        'case_id': widget.caseId,
        ..._locationData!,
        'nearest_bus_stop': _formatAmenity(_amenities?['bus_stop']),
        'nearest_railway': _formatAmenity(_amenities?['railway_station']),
        'nearest_hospital': _formatAmenity(_amenities?['hospital']),
        'nearest_airport': _formatAmenity(_amenities?['airport']),
        'nearest_highway': _formatAmenity(_amenities?['highway']),
        // 'nearest_park': _formatAmenity(_amenities?['park']), // Add this column in Supabase dashboard first
      }, onConflict: 'case_id');

      // Update case status and property_type
      await supabase
          .from('cases')
          .update({
            'status': 'in_progress',
            if (_propertyType != null && _propertyType!.isNotEmpty)
              'property_type': _propertyType,
          })
          .eq('id', widget.caseId);

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Location saved successfully!')));
      context.pop();
    } catch (e) {
      if (!mounted) return;
      debugPrint(e.toString());
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Failed to save location: $e')));
    } finally {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Property Location and Type')),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: _locationData == null ? _buildEmptyState() : _buildResults(),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 60),
      alignment: Alignment.center,
      child: Column(
        children: [
          Icon(
            LucideIcons.mapPin,
            color: Theme.of(context).colorScheme.primary,
            size: 48,
          ),
          SizedBox(height: 16),
          Text(
            'Property Location and Type',
            style: Theme.of(context).textTheme.displaySmall,
          ),
          SizedBox(height: 8),
          Text(
            'Capture your current GPS coordinates to verify that you are at the property site. Also, please specify the type of property you are evaluating.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              height: 1.5,
            ),
          ),
          SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: _loading ? null : _requestAndFetchLocation,
            icon: _loading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : Icon(LucideIcons.navigation, size: 20),
            label: Text('Capture Location'),
            style: ElevatedButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResults() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (_mappingWarning != null) ...[
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Text(_mappingWarning!),
            ),
          ),
          const SizedBox(height: 12),
        ],
        Card(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Property Type',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                SizedBox(height: 8),
                TextFormField(
                  initialValue: _propertyType,
                  style: TextStyle(fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'e.g. Residential, Commercial, Land...',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: EdgeInsets.all(12),
                  ),
                  onChanged: (val) {
                    _propertyType = val;
                  },
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 16),
        Card(
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Captured Location',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                SizedBox(height: 16),
                _buildRow(
                  'Latitude',
                  _locationData!['latitude'].toStringAsFixed(6),
                ),
                _buildRow(
                  'Longitude',
                  _locationData!['longitude'].toStringAsFixed(6),
                ),
                _buildRow(
                  'Accuracy',
                  '±${_locationData!['accuracy'].round()} meters',
                ),
                Divider(),
                Text(
                  'Reverse Geocoded Address',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontSize: 12,
                  ),
                ),
                SizedBox(height: 8),
                TextFormField(
                  key: ValueKey(_locationData!['address_from_gps']),
                  initialValue: _locationData!['address_from_gps'],
                  maxLines: 3,
                  style: TextStyle(height: 1.5, fontSize: 14),
                  decoration: InputDecoration(
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    contentPadding: EdgeInsets.all(12),
                  ),
                  onChanged: (val) {
                    _locationData!['address_from_gps'] = val;
                  },
                ),
              ],
            ),
          ),
        ),

        const Padding(
          padding: EdgeInsets.symmetric(vertical: 8),
          child: Text(
            'Address / map: © OpenStreetMap contributors. Nearby amenities can be entered and verified manually.',
          ),
        ),
        if (_amenities != null) ...[
          SizedBox(height: 16),
          Card(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Nearby Amenities',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  SizedBox(height: 16),
                  ..._amenities!.entries.map((e) {
                    final val = e.value as Map<String, dynamic>?;
                    return Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            e.key.replaceAll('_', ' ').toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: Theme.of(
                                context,
                              ).colorScheme.onSurfaceVariant,
                            ),
                          ),
                          Row(
                            children: [
                              Expanded(
                                child: TextFormField(
                                  key: ValueKey(
                                    '${e.key}_${val?['name'] ?? 'N/A'}',
                                  ),
                                  initialValue: val?['name'] ?? 'N/A',
                                  style: TextStyle(fontSize: 14),
                                  decoration: InputDecoration(
                                    isDense: true,
                                    contentPadding: EdgeInsets.symmetric(
                                      vertical: 8,
                                    ),
                                    enabledBorder: UnderlineInputBorder(
                                      borderSide: BorderSide(
                                        color: Colors.black12,
                                      ),
                                    ),
                                    focusedBorder: UnderlineInputBorder(
                                      borderSide: BorderSide(
                                        color: Theme.of(
                                          context,
                                        ).colorScheme.primary,
                                      ),
                                    ),
                                  ),
                                  onChanged: (newVal) {
                                    if (_amenities![e.key] == null) {
                                      _amenities![e.key] = {};
                                    }
                                    _amenities![e.key]['name'] = newVal;
                                  },
                                ),
                              ),
                              SizedBox(width: 8),
                              SizedBox(
                                width: 70,
                                child: TextFormField(
                                  key: ValueKey(
                                    '${e.key}_dist_${val?['distance'] ?? ''}',
                                  ),
                                  initialValue:
                                      val?['distance']?.toString() ?? '',
                                  keyboardType: TextInputType.number,
                                  style: TextStyle(
                                    color: AppColors.accent,
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                  decoration: InputDecoration(
                                    isDense: true,
                                    contentPadding: EdgeInsets.symmetric(
                                      vertical: 8,
                                    ),
                                    hintText: 'Dist (m)',
                                    hintStyle: TextStyle(
                                      fontWeight: FontWeight.normal,
                                      color: Colors.black38,
                                    ),
                                    enabledBorder: UnderlineInputBorder(
                                      borderSide: BorderSide(
                                        color: Colors.black12,
                                      ),
                                    ),
                                    focusedBorder: UnderlineInputBorder(
                                      borderSide: BorderSide(
                                        color: Theme.of(
                                          context,
                                        ).colorScheme.primary,
                                      ),
                                    ),
                                  ),
                                  onChanged: (newVal) {
                                    if (_amenities![e.key] == null) {
                                      _amenities![e.key] = {};
                                    }
                                    _amenities![e.key]['distance'] = newVal;
                                  },
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ),
        ],

        SizedBox(height: 24),
        ElevatedButton.icon(
          onPressed: _saving ? null : _handleSave,
          icon: _saving
              ? SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : Icon(LucideIcons.save, size: 20),
          label: Text('Save Location Data'),
        ),
        TextButton(
          onPressed: _requestAndFetchLocation,
          child: Text('Recapture Location'),
        ),
      ],
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
            ),
          ),
          Text(value, style: TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

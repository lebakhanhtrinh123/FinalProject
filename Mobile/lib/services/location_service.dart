import 'dart:async';

import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class LocationService {
  static const String apiKey = "AIzaSyB3BgUHYhx35MirOPlbjHgNsoBODje-0xY"; 
  static const String baseUrl = "https://maps.googleapis.com/maps/api/geocode/json";

  Future<LocationResult> getLatLngFromAddress(String address) async {
    if (address.isEmpty) {
      return LocationResult(
        success: false,
        error: 'Địa chỉ trống',
        location: null,
      );
    }

    try {
      final Uri uri = Uri.parse("$baseUrl?address=${Uri.encodeComponent(address)}&key=$apiKey");

      final response = await http.get(uri).timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException('Quá thời gian yêu cầu');
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);

        if (data['status'] == 'OK' && data['results'].isNotEmpty) {
          final location = data['results'][0]['geometry']['location'];
          final double lat = location['lat'];
          final double lon = location['lng'];

          return LocationResult(
            success: true,
            error: null,
            location: LatLng(lat, lon),
          );
        } else {
          return LocationResult(
            success: false,
            error: 'Không tìm thấy địa chỉ',
            location: null,
          );
        }
      }

      return LocationResult(
        success: false,
        error: 'Lỗi server: ${response.statusCode}',
        location: null,
      );
    } on TimeoutException {
      return LocationResult(
        success: false,
        error: 'Quá thời gian yêu cầu',
        location: null,
      );
    } catch (e) {
      return LocationResult(
        success: false,
        error: 'Lỗi không xác định: $e',
        location: null,
      );
    }
  }

  // Kiểm tra địa chỉ có hợp lệ không
  bool isValidAddress(String address) {
    return address.isNotEmpty && address.length >= 5;
  }
}

class LocationResult {
  final bool success;
  final String? error;
  final LatLng? location;

  LocationResult({
    required this.success,
    this.error,
    this.location,
  });
}

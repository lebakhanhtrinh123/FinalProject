import 'dart:convert';

import 'package:flowerops/model/Courier.dart';
import 'package:flowerops/model/DeliveryDetailResponse.dart';
import 'package:flowerops/model/DeliveryResponse.dart';
import 'package:flowerops/model/DeliveryResponse1.dart';
import 'package:flowerops/services/employee_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class DeliveryService {
  final String apiLink =
      "https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api/Delivery";
  final EmployeeService _employeeService = EmployeeService();

    Future<List<Courier>> getAvailableCouriers() async {
    return await _employeeService.getActiveCourier();
  }

  Future<DeliveryResponse1> createDelivery({
    required String orderId,
    required bool freeShip,
    required double fee,
    required String pickupLocation,
    required String shipperId,
    String? note,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$apiLink/CreateDelivery?OrderId=$orderId'),
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*',
        },
        body: jsonEncode({
          'freeShip': freeShip,
          'fee': fee,
          'pickupLocation': pickupLocation,
          'shipperId': shipperId,
          'note': note ?? '',
        }),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        return DeliveryResponse1.fromJson(responseData);
      } else {
        // Xử lý lỗi HTTP status code
        throw Exception('Failed to create delivery. Status code: ${response.statusCode}');
      }
    } catch (e) {
      print('Error creating delivery: $e');
      throw Exception('Failed to create delivery: $e');
    }
  }
  
  // Kiểm tra xem response có thành công không
  bool isSuccessResponse(DeliveryResponse1 response) {
    return response.statusCode == 200 && 
           (response.code == 'Success!' || response.data == 'Order thành công');
  }


  Future<DeliveryResponse> getDeliveriesByShipper() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? shipperId = prefs.getString('userId');

    

    if (shipperId == null) {
      throw Exception("Shipper ID not found");
    }

    final url =
        Uri.parse("$apiLink/GetDeliveryByShipperId?ShipperId=$shipperId");
    final response = await http.get(
      url,
      headers: {
        'accept': '*/*',
      },
    );

    if (response.statusCode == 200) {
      return DeliveryResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception("Failed to load deliveries");
    }
  }

  Future<DeliveryDetailResponse> getDeliveryById(String id) async {
    final url = Uri.parse("$apiLink/GetDeliveryByOrderId?OrderId=$id");

    try {
      final response = await http.get(
        url,
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        return DeliveryDetailResponse.fromJson(jsonDecode(response.body));
      } else {
        throw Exception(
            "Failed to load delivery detail. Status: ${response.statusCode}");
      }
    } catch (e) {
      throw Exception("Error getting delivery detail: $e");
    }
  }

  Future<DeliveryResponse1> updateDelivery({
    required String deliveryId,
    String? deliveryImage,
  }) async {
    final url =
        Uri.parse('$apiLink/UpdateDeliveryByShipperId?DeliveryId=$deliveryId');

    final response = await http.put(
      url,
      headers: {
        'accept': '*/*',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'timeDone': DateTime.now().toIso8601String(),
        'deliveryImage': deliveryImage,
        'status': 'Received'
      }),
    );

    if (response.statusCode == 200) {
      return DeliveryResponse1.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update delivery');
    }
  }
}

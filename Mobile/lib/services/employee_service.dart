import 'dart:convert';

import 'package:flowerops/model/Courier.dart';
import 'package:flowerops/model/employee.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class EmployeeService {
  final String apiLink =
      "https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api";
  EmployeeService();
  Future<List<Employee>> getActiveFlorists() async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? storeId = prefs.getString('storedId');

      if (storeId == null) {
        print('Store ID not found in SharedPreferences');
        return [];
      }

      final response = await http.get(
        Uri.parse(
            '$apiLink/employees/storeId-florist-status-true?storeid=$storeId'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        if (responseData['data'] != null) {
          return (responseData['data'] as List)
              .map((employee) => Employee.fromJson(employee))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error fetching active florists: $e');
      return [];
    }
  }


  Future<List<Courier>> getActiveCourier() async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? storeId = prefs.getString('storedId');

      if (storeId == null) {
        print('Store ID not found in SharedPreferences');
        return [];
      }

      final response = await http.get(
        Uri.parse(
            '$apiLink/employees/storeId-courier-status-true?storeid=$storeId'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        if (responseData['data'] != null) {
          return (responseData['data'] as List)
              .map((couter) => Courier.fromJson(couter))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error fetching active florists: $e');
      return [];
    }
  }

  Future<List<Employee>> getInactiveFlorists() async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? storeId = prefs.getString('storedId');

      if (storeId == null) {
        print('Store ID not found in SharedPreferences');
        return [];
      }

      final response = await http.get(
        Uri.parse(
            '$apiLink/employees/storeId-florist-status-false?storeid=$storeId'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        if (responseData['data'] != null) {
          return (responseData['data'] as List)
              .map((employee) => Employee.fromJson(employee))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error fetching inactive florists: $e');
      return [];
    }
  }

  Future<List<Courier>> getInactiveCourier() async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? storeId = prefs.getString('storedId');

      if (storeId == null) {
        print('Store ID not found in SharedPreferences');
        return [];
      }

      final response = await http.get(
        Uri.parse(
            '$apiLink/employees/storeId-courier-status-false?storeid=$storeId'),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        if (responseData['data'] != null) {
          return (responseData['data'] as List)
              .map((employee) => Courier.fromJson(employee))
              .toList();
        }
      }
      return [];
    } catch (e) {
      print('Error fetching inactive florists: $e');
      return [];
    }
  }

  Future<bool> approveEmployee(String employeeId) async {
    try {
      final response = await http.post(
        Uri.parse('$apiLink/employees/ApproveEmployee?employeeId=$employeeId'),
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        return responseData['statusCode'] == 200;
      }
      return false;
    } catch (e) {
      print('Error approving employee: $e');
      return false;
    }
  }

  Future<bool> rejectEmployee(String employeeId, String reason) async {
    try {
      // URL encode the reason
      final encodedReason = Uri.encodeComponent(reason);

      final response = await http.post(
        Uri.parse(
            '$apiLink/employees/RejectEmployee?employeeId=$employeeId&reason=$encodedReason'),
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseData = json.decode(response.body);
        return responseData['statusCode'] == 200;
      }
      return false;
    } catch (e) {
      print('Error rejecting employee: $e');
      return false;
    }
  }

  Future<Employee?> getEmployeeById() async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');
      final String? userId = prefs.getString('userId');

      if (token == null || userId == null) {
        print("No token or user ID found, user must login first");
        return null;
      }

      final url = Uri.parse("$apiLink/employees/Id?id=$userId");
      final response = await http.get(
        url,
        headers: {
          'accept': '*/*',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseBody = jsonDecode(response.body);
        if (responseBody['data'] != null) {
          return Employee.fromJson(responseBody['data']);
        }
      }
      print(
          "Failed to get employee: ${response.statusCode} - ${response.body}");
      return null;
    } catch (e) {
      print("Error fetching employee data: $e");
      return null;
    }
  }

  Future<Employee?> updateEmployeeInfo({
    required String fullName,
    required String phone,
  }) async {
    try {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');
      final String? userId = prefs.getString('userId');

      if (token == null || userId == null) {
        print("No token or user ID found, user must login first");
        return null;
      }

      // Build update payload with only fullName and phone
      final Map<String, dynamic> updateData = {
        'fullName': fullName,
        'phone': phone,
      };

      final url = Uri.parse("$apiLink/employees/$userId");
      final response = await http.put(
        url,
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(updateData),
      );

      if (response.statusCode == 200) {
        final Map<String, dynamic> responseBody = jsonDecode(response.body);
        if (responseBody['data'] != null) {
          print("Employee information updated successfully");
          return Employee.fromJson(responseBody['data']);
        }
      }
      print(
          "Failed to update employee: ${response.statusCode} - ${response.body}");
      return null;
    } catch (e) {
      print("Error updating employee data: $e");
      return null;
    }
  }

  Future<bool> resetPassword(String newPassword) async {
    try {
      // Get token from SharedPreferences
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      final String? token = prefs.getString('token');

      if (token == null) {
        print("No token found, user must login first");
        return false;
      }

      // First, get employee data to get the email
      final employee = await getEmployeeById();
      if (employee == null) {
        print("Failed to get employee data");
        return false;
      }

      final String email = employee.email;

      // Encode email and password for URL
      final encodedEmail = Uri.encodeComponent(email);
      final encodedPassword = Uri.encodeComponent(newPassword);
      final encodedToken = Uri.encodeComponent(token);

      final url = Uri.parse(
          "$apiLink/auth/set-password-by-employee?email=$encodedEmail&NewPassword=$encodedPassword&token=$encodedToken");

      final response = await http.post(
        url,
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        print("Password reset successfully");
        return true;
      } else {
        print(
            "Failed to reset password: ${response.statusCode} - ${response.body}");
        return false;
      }
    } catch (e) {
      print("Error resetting password: $e");
      return false;
    }
  }
}

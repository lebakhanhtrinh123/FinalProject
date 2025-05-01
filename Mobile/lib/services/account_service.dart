import 'dart:convert';

import 'package:flowerops/model/CourierRegisterRequest.dart';
import 'package:flowerops/model/CourierRegisterResponse.dart';
import 'package:flowerops/model/FloristRegisterResponse.dart';
import 'package:flowerops/model/florist_register_request.dart';
import 'package:http/http.dart' as http;
import 'package:jwt_decoder/jwt_decoder.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AccountService {
  final String apiLink =
      "https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api";

  AccountService();

  Future<bool> login(String email, String password) async {
    final url = Uri.parse("$apiLink/auth/login");
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({"email": email, "password": password}),
    );

    if (response.statusCode == 200) {
      print("Login success");
      final Map<String, dynamic> responseBody = jsonDecode(response.body);

      // Lấy thông tin từ response
      final String accessToken = responseBody['data']['accessToken'];
      final jwt = JwtDecoder.decode(accessToken);
      final String userId = jwt['Id'];
      final String storesID = jwt['StoreId'];
      final String roleName = responseBody['data']['roleName'];

      final SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString('userId', userId);
      await prefs.setString('storedId', storesID);
      await prefs.setString('token', accessToken);
      await prefs.setString('roleName', roleName);

      return true;
    } else {
      print("Login failed: ${response.body}");
      return false;
    }
  }

  Future<FloristRegisterResponse?> registerFlorist(
      FloristRegisterRequest request) async {
    var uri = Uri.parse(
        "$apiLink/auth/register-Florist-account?storeId=${request.storeId}");

    var multipartRequest = http.MultipartRequest('POST', uri);

    multipartRequest.fields.addAll(request.toFormData());

    if (request.avatar != null) {
      multipartRequest.files.add(
        await http.MultipartFile.fromPath('Avatar', request.avatar!.path),
      );
    }

    if (request.identificationFontOfPhoto != null) {
      multipartRequest.files.add(
        await http.MultipartFile.fromPath(
          'IdentificationFontOfPhoto',
          request.identificationFontOfPhoto!.path,
        ),
      );
    }

    if (request.identificationBackOfPhoto != null) {
      multipartRequest.files.add(
        await http.MultipartFile.fromPath(
          'IdentificationBackOfPhoto',
          request.identificationBackOfPhoto!.path,
        ),
      );
    }

    try {
      final response = await multipartRequest.send();
      final responseString = await response.stream.bytesToString();
      final jsonResponse = jsonDecode(responseString);

      // Trả về phản hồi đầy đủ, kể cả khi có lỗi
      return FloristRegisterResponse.fromJson(jsonResponse);
    } catch (e) {
      print("Error: $e");
      return FloristRegisterResponse(
        resultStatus: "Error",
        messages: ["Something went wrong. Please try again!"],
      );
    }
  }

  Future<CourierRegisterResponse?> registerCourier(
      CourierRegisterRequest request) async {
    var uri = Uri.parse(
        "$apiLink/auth/register-courier-account?storeId=${request.storeId}");

    var multipartRequest = http.MultipartRequest('POST', uri);

    multipartRequest.fields.addAll(request.toFormData());

    if (request.avatar != null) {
      multipartRequest.files.add(
        await http.MultipartFile.fromPath('Avatar', request.avatar!.path),
      );
    }

    if (request.identificationFontOfPhoto != null) {
      multipartRequest.files.add(
        await http.MultipartFile.fromPath(
          'IdentificationFontOfPhoto',
          request.identificationFontOfPhoto!.path,
        ),
      );
    }

    if (request.identificationBackOfPhoto != null) {
      multipartRequest.files.add(
        await http.MultipartFile.fromPath(
          'IdentificationBackOfPhoto',
          request.identificationBackOfPhoto!.path,
        ),
      );
    }

    try {
      final response = await multipartRequest.send();
      final responseString = await response.stream.bytesToString();

      // In ra phản hồi để debug
      print("API Response: $responseString");

      // Kiểm tra xem responseString có phải là JSON hợp lệ không
      try {
        final jsonResponse = jsonDecode(responseString);
        return CourierRegisterResponse.fromJson(jsonResponse);
      } catch (e) {
        print("Error decoding JSON: $e");
        print("Raw response: $responseString");
        return CourierRegisterResponse(
          resultStatus: "Error",
          messages: ["Lỗi định dạng phản hồi từ server!"],
        );
      }
    } catch (e) {
      print("Network Error: $e");
      return CourierRegisterResponse(
        resultStatus: "Error",
        messages: ["Đã xảy ra lỗi kết nối. Vui lòng thử lại!"],
      );
    }
  }

  Future<void> logOut() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userId');
  }
}

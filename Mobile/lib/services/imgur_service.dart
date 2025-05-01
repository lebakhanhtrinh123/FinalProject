import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';

class ImgurService {
  static final ImgurService _instance = ImgurService._internal();
  factory ImgurService() => _instance;
  ImgurService._internal();

  final String clientId = '30c4ce4d26debec';
  final String apiUrl = 'https://api.imgur.com/3/image';
  final dio = Dio();

  Future<String?> uploadImage(File imageFile) async {
    try {
      List<int> imageBytes = await imageFile.readAsBytes();
      String base64Image = base64Encode(imageBytes);

      final response = await dio.post(
        apiUrl,
        data: {
          'image': base64Image,
          'type': 'base64',
        },
        options: Options(
          headers: {
            'Authorization': 'Client-ID $clientId',
          },
        ),
      );

      if (response.statusCode == 200) {
        return response.data['data']['link'];
      }
      return null;
    } catch (e) {
      print('Error uploading to Imgur: $e');
      return null;
    }
  }
}
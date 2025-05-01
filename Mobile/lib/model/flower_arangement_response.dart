import 'package:flowerops/model/flower_arrangement_data.dart';

class FlowerArrangementResponse {
  final List<FlowerArrangementData>? data;
  final dynamic additionalData;
  final String? message;
  final int statusCode;
  final String code;

  FlowerArrangementResponse({
    this.data,
    this.additionalData,
    this.message,
    required this.statusCode,
    required this.code,
  });

  factory FlowerArrangementResponse.fromJson(Map<String, dynamic> json) {
    return FlowerArrangementResponse(
      data: json['data'] != null 
          ? List<FlowerArrangementData>.from(json['data'].map((x) => FlowerArrangementData.fromJson(x)))
          : null,
      additionalData: json['additionalData'],
      message: json['message'],
      statusCode: json['statusCode'],
      code: json['code'],
    );
  }
}
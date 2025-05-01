import 'package:flowerops/model/order_data.dart';

class OrderDetailResponse {
   OrderData? data;
   dynamic additionalData;
   String? message;
   int statusCode;
   String code;

  OrderDetailResponse({
    this.data,
    this.additionalData,
    this.message,
    required this.statusCode,
    required this.code,
  });

  factory OrderDetailResponse.fromJson(Map<String, dynamic> json) => OrderDetailResponse(
      data: json['data'] == null ? null : OrderData.fromJson(json["data"]),
      additionalData: json['additionalData'],
      message: json['message'],
      statusCode: json['statusCode'],
      code: json['code'],
    );
  
}
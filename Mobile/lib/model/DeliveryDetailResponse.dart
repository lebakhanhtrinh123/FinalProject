import 'package:flowerops/model/DeliveryData.dart';

class DeliveryDetailResponse {
  DeliveryData? data;
  dynamic additionalData;
  String? message;
  int? statusCode;
  String? code;

  DeliveryDetailResponse({
    this.data,
    this.additionalData,
    this.message,
    this.statusCode,
    this.code,
  });

  factory DeliveryDetailResponse.fromJson(Map<String, dynamic> json) => DeliveryDetailResponse(
        data: json["data"] == null ? null : DeliveryData.fromJson(json["data"]),
        additionalData: json["additionalData"],
        message: json["message"],
        statusCode: json["statusCode"],
        code: json["code"],
      );
}
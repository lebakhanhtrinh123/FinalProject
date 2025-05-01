import 'package:flowerops/model/DeliveryData.dart';

class DeliveryResponse {
  List<DeliveryData>? data;
  dynamic additionalData;
  String? message;
  int? statusCode;
  String? code;

  DeliveryResponse({
    this.data,
    this.additionalData,
    this.message,
    this.statusCode,
    this.code,
  });

  factory DeliveryResponse.fromJson(Map<String, dynamic> json) => DeliveryResponse(
        data: json["data"] == null
            ? []
            : List<DeliveryData>.from(
                json["data"]!.map((x) => DeliveryData.fromJson(x))),
        additionalData: json["additionalData"],
        message: json["message"],
        statusCode: json["statusCode"],
        code: json["code"],
      );
}
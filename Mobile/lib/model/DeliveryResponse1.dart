class DeliveryResponse1 {
  final String? data;
  final dynamic additionalData;
  final String? message;
  final int statusCode;
  final String code;

  DeliveryResponse1({
    this.data,
    this.additionalData,
    this.message,
    required this.statusCode,
    required this.code,
  });

  factory DeliveryResponse1.fromJson(Map<String, dynamic> json) {
    return DeliveryResponse1(
      data: json['data'],
      additionalData: json['additionalData'],
      message: json['message'],
      statusCode: json['statusCode'],
      code: json['code'],
    );
  }
}
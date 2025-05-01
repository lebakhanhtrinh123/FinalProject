import 'package:flowerops/model/florist_register_request.dart';

class FloristRegisterResponse {
  FloristRegisterRequest? data;
  String? resultStatus;
  String? roleName;
  String? promotionStatus;
  List<String>? messages;

  FloristRegisterResponse({
    this.data,
    this.resultStatus,
    this.roleName,
    this.promotionStatus,
    this.messages,
  });

  factory FloristRegisterResponse.fromJson(Map<String, dynamic> json) {
    return FloristRegisterResponse(
      data: json['data'] == null ? null : FloristRegisterRequest.fromJson(json['data']),
      resultStatus: json['resultStatus'],
      roleName: json['roleName'],
      promotionStatus: json['promotionStatus'],
      messages: json['messages'] != null
          ? List<String>.from(json['messages'])
          : [],
    );
  }
}

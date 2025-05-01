

import 'package:flowerops/model/CourierRegisterRequest.dart';

class CourierRegisterResponse {
  Map<String, dynamic>? data;
  String? resultStatus;
  String? roleName;
  String? chatRoomStatus;
  List<String>? messages;

  CourierRegisterResponse({
    this.data,
    this.resultStatus,
    this.roleName,
    this.chatRoomStatus,
    this.messages,
  });

  factory CourierRegisterResponse.fromJson(Map<String, dynamic> json) {
    return CourierRegisterResponse(
      data: json['data'],
      resultStatus: json['resultStatus'],
      roleName: json['roleName'],
      chatRoomStatus: json['chatRoomStatus'],
      messages: json['messages'] != null
          ? List<String>.from(json['messages'])
          : [],
    );
  }
}
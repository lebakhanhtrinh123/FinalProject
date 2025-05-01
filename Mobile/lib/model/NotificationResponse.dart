import 'package:flowerops/model/NotificationModel.dart';

class NotificationResponse {
  final List<NotificationModel> data;
  final String resultStatus;
  final String? roleName;
  final String? chatRoomStatus;
  final List<String> messages;

  NotificationResponse({
    required this.data,
    required this.resultStatus,
    this.roleName,
    this.chatRoomStatus,
    required this.messages,
  });

  factory NotificationResponse.fromJson(Map<String, dynamic> json) {
    var notificationList = <NotificationModel>[];
    if (json['data'] != null) {
      json['data'].forEach((notification) {
        notificationList.add(NotificationModel.fromJson(notification));
      });
    }

    return NotificationResponse(
      data: notificationList,
      resultStatus: json['resultStatus'] ?? '',
      roleName: json['roleName'],
      chatRoomStatus: json['chatRoomStatus'],
      messages: json['messages'] != null 
          ? List<String>.from(json['messages'])
          : [],
    );
  }
}

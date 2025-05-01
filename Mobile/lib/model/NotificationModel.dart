class NotificationModel {
  final String notiId;
  final String? fromUserId;
  final String toUserId;
  final String? relatedId;
  final String type;
  final String message;
  final DateTime createAt;
  final DateTime updateAt;
  final String status;
  bool isRead;

  NotificationModel({
    required this.notiId,
    this.fromUserId,
    required this.toUserId,
    this.relatedId,
    required this.type,
    required this.message,
    required this.createAt,
    required this.updateAt,
    required this.status,
    required this.isRead,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      notiId: json['notiId'] ?? '',
      fromUserId: json['fromUserId'],
      toUserId: json['toUserId'] ?? '',
      relatedId: json['relatedId'],
      type: json['type'] ?? 'Default',
      message: json['message'] ?? '',
      createAt: json['createAt'] != null 
          ? DateTime.parse(json['createAt'])
          : DateTime.now(),
      updateAt: json['updateAt'] != null 
          ? DateTime.parse(json['updateAt'])
          : DateTime.now(),
      status: json['status'] ?? 'New',
      isRead: json['isRead'] ?? false,
    );
  }
}
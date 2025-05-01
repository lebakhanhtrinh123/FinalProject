class Message {
  final String messageId;
  final String chatRoomId;
  final String senderId;
  final String receiveId;
  final String messageType;
  final String content;
  final String status;
  final DateTime createAt;
  final DateTime? updateAt;

  Message({
    required this.messageId,
    required this.chatRoomId,
    required this.senderId,
    required this.receiveId,
    required this.messageType,
    required this.content,
    required this.status,
    required this.createAt,
    this.updateAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      messageId: json['messageId'],
      chatRoomId: json['chatRoomId'],
      senderId: json['senderId'],
      receiveId: json['receiveId'],
      messageType: json['messageType'],
      content: json['content'],
      status: json['status'],
      createAt: DateTime.parse(json['createAt']),
      updateAt: json['updateAt'] != null ? DateTime.parse(json['updateAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'messageId': messageId,
      'chatRoomId': chatRoomId,
      'senderId': senderId,
      'receiveId': receiveId,
      'messageType': messageType,
      'content': content,
      'status': status,
      'createAt': createAt.toIso8601String(),
      'updateAt': updateAt?.toIso8601String(),
    };
  }
}
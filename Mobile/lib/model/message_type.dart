import 'package:flutter/material.dart';

enum MessageType {
  text,
  image,
}

class Message {
  final String id;
  final String senderId;
  final String content;
  final DateTime timestamp;
  final MessageType type;
  final String? imageUrl;

  Message({
    required this.id,
    required this.senderId,
    required this.content,
    required this.timestamp,
    required this.type,
    this.imageUrl,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      senderId: json['senderId'] as String,
      content: json['content'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      type: MessageType.values.firstWhere(
        (e) => e.toString() == 'MessageType.${json['type']}',
        orElse: () => MessageType.text,
      ),
      imageUrl: json['imageUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'content': content,
      'timestamp': timestamp.toIso8601String(),
      'type': type.toString().split('.').last,
      'imageUrl': imageUrl,
    };
  }
}

class Chat {
  final String id;
  final String customerId;
  final String customerName;
  final String staffId;
  final String requestId;
  final List<Message> messages;
  final DateTime lastActivity;

  Chat({
    required this.id,
    required this.customerId,
    required this.customerName,
    required this.staffId,
    required this.requestId,
    required this.messages,
    required this.lastActivity,
  });

  factory Chat.fromJson(Map<String, dynamic> json) {
    return Chat(
      id: json['id'] as String,
      customerId: json['customerId'] as String,
      customerName: json['customerName'] as String,
      staffId: json['staffId'] as String,
      requestId: json['requestId'] as String,
      messages: (json['messages'] as List<dynamic>)
          .map((e) => Message.fromJson(e as Map<String, dynamic>))
          .toList(),
      lastActivity: DateTime.parse(json['lastActivity'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerId': customerId,
      'customerName': customerName,
      'staffId': staffId,
      'requestId': requestId,
      'messages': messages.map((e) => e.toJson()).toList(),
      'lastActivity': lastActivity.toIso8601String(),
    };
  }
}
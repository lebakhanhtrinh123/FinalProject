import 'dart:io';

import 'package:flowerops/model/flower_arangement_response.dart';
import 'package:flowerops/model/flower_arrangement_data.dart';
import 'package:flowerops/model/flower_arrangement_detail.dart';
import 'package:flowerops/model/message_type.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class FlowerArrangementService {
  final String apiLink = "https://api-base-url/api/FlowerArrangement";
  final uuid = Uuid();
  Future<FlowerArrangementResponse> getArrangementRequests() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? staffId = prefs.getString('userId');

    if (staffId == null) {
      throw Exception("Staff ID not found");
    }

    // Tạm thời return mock data
    return FlowerArrangementResponse(
      data: [
        FlowerArrangementData(
          requestId: "REQ001",
          customerName: "pham lan Anh",
          imageUrl:
              "https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-do-tron-ven.jpg.webp",
          status: "pending",
          requestDate: DateTime.now(),
          price: 250000,
        ),
        FlowerArrangementData(
          requestId: "tEQ111",
          customerName: "Nguyễn Văn hung",
          imageUrl:
              "https://flowercorner.b-cdn.net/image/cache/catalog/products/Autumn_2024/NEWBOUQUET_086.jpg.webp",
          status: "pending",
          requestDate: DateTime.now(),
          price: 300000,
        ),
        // Thêm các mock data khác...
      ],
      statusCode: 200,
      code: "SUCCESS",
    );
  }

  Future<FlowerArrangementDetail> getArrangementById(String requestId) async {
    // Mock data for detail view
    return FlowerArrangementDetail(
      requestId: requestId,
      customerName: "Phạm Lan Anh",
      imageUrl:
          "https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-do-tron-ven.jpg.webp",
      status: "pending",
      requestDate: DateTime.now(),
      price: 250000,
      description:
          "Elegant rose bouquet with mixed flowers for wedding celebration",
      occasion: "Wedding",
      style: "Romantic",
      size: "Large",
      flowerComposition: [
        FlowerComposition(
          flowerName: "Red Rose",
          quantity: 12,
          color: "Red",
        ),
        FlowerComposition(
          flowerName: "Baby's Breath",
          quantity: 5,
          color: "White",
        ),
        FlowerComposition(
          flowerName: "Lily",
          quantity: 3,
          color: "White",
        ),
      ],
    );
  }

  // Mock data for a chat
  Chat? _mockChat;

  Future<String?> getCurrentUserId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString('userId');
  }

  Future<Chat> getChatByRequestId(String requestId) async {
    // Tạm thời trả về mock data
    if (_mockChat == null) {
      final staffId = await getCurrentUserId() ?? "staff-123";
      _mockChat = Chat(
        id: uuid.v4(),
        customerId: "customer-456",
        customerName: "Phạm Lan Anh",
        staffId: staffId,
        requestId: requestId,
        lastActivity: DateTime.now(),
        messages: [
          Message(
            id: uuid.v4(),
            senderId: "customer-456",
            content: "Xin chào, tôi muốn biết thêm về bó hoa của tôi",
            timestamp: DateTime.now().subtract(Duration(days: 1, hours: 2)),
            type: MessageType.text,
          ),
          Message(
            id: uuid.v4(),
            senderId: staffId,
            content: "Chào chị, bó hoa của chị đang được chuẩn bị ạ",
            timestamp: DateTime.now()
                .subtract(Duration(days: 1, hours: 1, minutes: 50)),
            type: MessageType.text,
          ),
          Message(
            id: uuid.v4(),
            senderId: "customer-456",
            content: "Đây là hình ảnh tham khảo tôi muốn",
            timestamp: DateTime.now()
                .subtract(Duration(days: 1, hours: 1, minutes: 40)),
            type: MessageType.text,
          ),
          Message(
            id: uuid.v4(),
            senderId: "customer-456",
            content: "",
            timestamp: DateTime.now()
                .subtract(Duration(days: 1, hours: 1, minutes: 35)),
            type: MessageType.image,
            imageUrl:
                "https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-do-tron-ven.jpg.webp",
          ),
          Message(
            id: uuid.v4(),
            senderId: staffId,
            content:
                "Cảm ơn chị đã gửi hình ảnh, chúng tôi sẽ chuẩn bị theo yêu cầu của chị",
            timestamp: DateTime.now()
                .subtract(Duration(days: 1, hours: 1, minutes: 30)),
            type: MessageType.text,
          ),
        ],
      );
    }

    return _mockChat!;
  }

  Future<Message> sendMessage(String chatId, String content, MessageType type,
      {File? imageFile}) async {
    final staffId = await getCurrentUserId() ?? "staff-123";

    // Create new message
    final message = Message(
      id: uuid.v4(),
      senderId: staffId,
      content: content,
      timestamp: DateTime.now(),
      type: type,
      imageUrl: type == MessageType.image
          ? "https://flowercorner.b-cdn.net/image/cache/catalog/products/August%202023/bo-hoa-hong-do-tron-ven.jpg.webp" // Fake upload
          : null,
    );

    // Add to mock data
    if (_mockChat != null) {
      _mockChat!.messages.add(message);
    }

    return message;
  }
}

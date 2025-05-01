import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flowerops/model/Message.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:signalr_netcore/signalr_client.dart';
import 'package:image_picker/image_picker.dart';

 enum ChatConnectionState { disconnected, connecting, connected }

class ChatService {
  // Constants
  static const String baseUrl = 'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net';
  static const String cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dvkqdbaue/image/upload';
  static const String cloudinaryPreset = 'delivery_app';
  
  // Private variables
  HubConnection? _hubConnection;
  String? _chatRoomId;
  Timer? _reconnectTimer;
  final List<Function(Message)> _messageHandlers = [];
  bool _isReconnecting = false;
  
 
  
  // Public variables
  final ValueNotifier<ChatConnectionState> connectionState = ValueNotifier<ChatConnectionState>(ChatConnectionState.disconnected);
  final ValueNotifier<List<Message>> messages = ValueNotifier<List<Message>>([]);
  
  // Singleton pattern
  static final ChatService _instance = ChatService._internal();
  factory ChatService() => _instance;
  ChatService._internal();
  
  // Initialize SignalR connection with retry mechanism
  Future<bool> initializeConnection() async {
    if (_hubConnection != null && 
        connectionState.value == ChatConnectionState.connected) {
      return true;
    }

    // Cancel any existing reconnect timer
    _reconnectTimer?.cancel();

    // Create connection
    _hubConnection = HubConnectionBuilder()
        .withUrl('$baseUrl/chatHub')
        .withAutomaticReconnect(retryDelays: [2000, 5000, 10000, 30000])
        .build();

    // Connection status changes
    _setupConnectionHandlers();

    try {
      connectionState.value = ChatConnectionState.connecting;
      await _hubConnection!.start();
      connectionState.value = ChatConnectionState.connected;
      debugPrint('SignalR Connected!');
      
      // Register message handler
      _registerCoreMessageHandler();
      
      // Rejoin room if needed
      if (_chatRoomId != null) {
        await joinChatRoom(_chatRoomId!);
      }
      
      return true;
    } catch (e) {
      debugPrint('Error starting SignalR connection: $e');
      connectionState.value = ChatConnectionState.disconnected;
      
      // Schedule reconnection if not already trying
      if (!_isReconnecting) {
        _scheduleReconnection();
      }
      return false;
    }
  }

  void _setupConnectionHandlers() {
    _hubConnection!.onclose(({error}) {
      debugPrint('SignalR connection closed: ${error.toString()}');
      connectionState.value = ChatConnectionState.disconnected;
      
      if (!_isReconnecting) {
        _scheduleReconnection();
      }
    });

    _hubConnection!.onreconnecting(({error}) {
      debugPrint('SignalR reconnecting...: ${error.toString()}');
      connectionState.value = ChatConnectionState.connecting;
    });

    _hubConnection!.onreconnected(({connectionId}) {
      debugPrint('SignalR reconnected with ID: $connectionId');
      connectionState.value = ChatConnectionState.connected;
      
      // Rejoin current room after reconnection
      if (_chatRoomId != null) {
        joinChatRoom(_chatRoomId!);
      }
    });
  }

  void _scheduleReconnection() {
    _isReconnecting = true;
    _reconnectTimer = Timer(const Duration(seconds: 5), () async {
      debugPrint('Attempting reconnection...');
      await initializeConnection();
      _isReconnecting = false;
    });
  }

  // Register core message handler
  void _registerCoreMessageHandler() {
    _hubConnection?.on('ReceiveMessage', (arguments) {
      if (arguments != null && arguments.isNotEmpty) {
        try {
          final messageData = arguments[0] as Map<String, dynamic>;
          final message = Message.fromJson(messageData);
          
          // Add to internal message list
          final currentMessages = messages.value;
          messages.value = [...currentMessages, message];
          
          // Notify all registered handlers
          for (var handler in _messageHandlers) {
            handler(message);
          }
        } catch (e) {
          debugPrint('Error processing received message: $e');
        }
      }
    });
  }

  // Register message handler
  void onReceiveMessage(void Function(Message) handler) {
    _messageHandlers.add(handler);
  }

  // Unregister message handler
  void removeMessageHandler(void Function(Message) handler) {
    _messageHandlers.remove(handler);
  }

  // Join a chat room
  Future<bool> joinChatRoom(String roomId) async {
    if (await _ensureConnection() == false) {
      return false;
    }

    try {
      _chatRoomId = roomId;
      await _hubConnection!.invoke('JoinChatRoom', args: [roomId]);
      debugPrint('Joined chat room: $roomId');
      return true;
    } catch (e) {
      debugPrint('Error joining chat room: $e');
      return false;
    }
  }

  // Leave a chat room
  Future<bool> leaveChatRoom(String roomId) async {
    if (await _ensureConnection() == false) {
      return false;
    }

    try {
      await _hubConnection!.invoke('LeaveChatRoom', args: [roomId]);
      _chatRoomId = null;
      return true;
    } catch (e) {
      debugPrint('Error leaving chat room: $e');
      return false;
    }
  }

  // Ensure connection is active
  Future<bool> _ensureConnection() async {
    if (_hubConnection == null || 
        connectionState.value != ChatConnectionState.connected) {
      debugPrint('Connection not ready, attempting to initialize...');
      return await initializeConnection();
    }
    return true;
  }

  // Fetch messages with retry mechanism
  Future<List<Message>> getMessages(String orderId, String customerId, String employeeId, {int maxRetries = 3}) async {
    int attempts = 0;
    while (attempts < maxRetries) {
      try {
        final response = await http.get(
          Uri.parse('$baseUrl/api/messages/messages/$orderId/$customerId/$employeeId'),
          headers: {'Content-Type': 'application/json'},
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode == 200) {
          final jsonResponse = jsonDecode(response.body);
          if (jsonResponse['data'] == null) {
            messages.value = [];
            return [];
          }
          
          final List<dynamic> messagesJson = jsonResponse['data'];
          final messageList = messagesJson.map((json) => Message.fromJson(json)).toList();
          
          // Update internal message list
          messages.value = messageList;
          
          // Extract chat room ID and join room
          if (messageList.isNotEmpty) {
            _chatRoomId = messageList.first.chatRoomId;
            await initializeConnection();
            if (connectionState.value == ChatConnectionState.connected) {
              joinChatRoom(_chatRoomId!);
            }
          }
          
          return messageList;
        } else {
          throw Exception('Failed to load messages: ${response.statusCode}');
        }
      } catch (e) {
        attempts++;
        debugPrint('Error fetching messages (attempt $attempts): $e');
        if (attempts >= maxRetries) {
          throw Exception('Failed to load messages after $maxRetries attempts: $e');
        }
        await Future.delayed(Duration(seconds: attempts * 2)); // Exponential backoff
      }
    }
    
    return [];
  }

  // Send a message with retry
  Future<Message> sendMessage({
    required String chatRoomId,
    required String senderId,
    required String receiveId,
    required String content,
    String messageType = 'text',
    int maxRetries = 3,
  }) async {
    // Ensure connection first
    await _ensureConnection();
    
    int attempts = 0;
    while (attempts < maxRetries) {
      try {
        final response = await http.post(
          Uri.parse('$baseUrl/api/messages/create-message'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'chatRoomId': chatRoomId,
            'senderId': senderId,
            'receiveId': receiveId,
            'messageType': messageType,
            'content': content,
          }),
        ).timeout(const Duration(seconds: 10));

        if (response.statusCode == 200) {
          final message = Message.fromJson(jsonDecode(response.body));
          
          // Add to local cache if not already in the list
          final currentMessages = messages.value;
          // Check if message already exists
          if (!currentMessages.any((m) => m.messageId == message.messageId)) {
            messages.value = [...currentMessages, message];
          }
          
          return message;
        } else {
          throw Exception('Failed to send message: ${response.statusCode}');
        }
      } catch (e) {
        attempts++;
        debugPrint('Error sending message (attempt $attempts): $e');
        if (attempts >= maxRetries) {
          throw Exception('Failed to send message after $maxRetries attempts: $e');
        }
        await Future.delayed(Duration(seconds: attempts));
      }
    }
    
    throw Exception('Failed to send message');
  }

  // Upload image to Cloudinary with progress tracking
  Future<String?> uploadImage(
    File imageFile, 
    {Function(double)? onProgress}
  ) async {
    try {
      final request = http.MultipartRequest('POST', Uri.parse(cloudinaryUrl));
      
      // Add file
      final fileStream = http.ByteStream(imageFile.openRead());
      final fileLength = await imageFile.length();
      
      // Upload with length tracking but without custom transformer
      // since it's causing issues
      final multipartFile = http.MultipartFile(
        'file', 
        fileStream, 
        fileLength, 
        filename: imageFile.path.split('/').last
      );
      
      request.files.add(multipartFile);
      request.fields['upload_preset'] = cloudinaryPreset;
      
      final streamedResponse = await request.send();
      
      // Using StreamedResponse for progress
      if (onProgress != null) {
        int received = 0;
        streamedResponse.stream.listen((data) {
          received += data.length;
          onProgress(received / fileLength);
        });
      }
      
      final response = await http.Response.fromStream(streamedResponse);
      
      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        return jsonResponse['secure_url'];
      } else {
        debugPrint('Cloudinary error: ${response.body}');
        throw Exception('Failed to upload image: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Error uploading image: $e');
      return null;
    }
  }
  
  // Pick image from gallery with compression option
  Future<File?> pickImageFromGallery({bool compress = true}) async {
    final picker = ImagePicker();
    try {
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: compress ? 70 : 100, // Compress by default
      );
      if (pickedFile != null) {
        return File(pickedFile.path);
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
    return null;
  }
  
  // Take photo with camera with compression option
  Future<File?> takePhoto({bool compress = true}) async {
    final picker = ImagePicker();
    try {
      final pickedFile = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: compress ? 70 : 100, // Compress by default
      );
      if (pickedFile != null) {
        return File(pickedFile.path);
      }
    } catch (e) {
      debugPrint('Error taking photo: $e');
    }
    return null;
  }
  
  // Check if connection is active
  bool isConnected() {
    return connectionState.value == ChatConnectionState.connected;
  }
  
  // Clean up resources
  void dispose() {
    _reconnectTimer?.cancel();
    if (_hubConnection != null) {
      if (_chatRoomId != null) {
        leaveChatRoom(_chatRoomId!);
      }
      _hubConnection!.stop();
    }
    _messageHandlers.clear();
  }
}
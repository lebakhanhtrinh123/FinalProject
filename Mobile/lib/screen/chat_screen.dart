import 'dart:io';

import 'package:flowerops/model/Message.dart';
import 'package:flowerops/services/chat_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';



class ChatScreen extends StatefulWidget {
  final String orderId;
  final String customerId;
  final String employeeId;

  const ChatScreen({
    Key? key,
    required this.orderId,
    required this.customerId,
    required this.employeeId,
  }) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final ChatService _chatService = ChatService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  List<Message> _messages = [];
  String? _chatRoomId;
  File? _selectedImage;
  bool _isLoading = true;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _initChat();
  }

  Future<void> _initChat() async {
    // Initialize SignalR connection
    await _chatService.initializeConnection();

    // Register message handler
    _chatService.onReceiveMessage((message) {
      setState(() {
        _messages.add(message);
      });
      _scrollToBottomForced();
    });

    // Load messages
    try {
      final messages = await _chatService.getMessages(
          widget.orderId, widget.customerId, widget.employeeId);

      if (messages.isNotEmpty) {
        _chatRoomId = messages.first.chatRoomId;
      }

      setState(() {
        _messages = messages;
        _isLoading = false;
      });

      _scheduleMultipleScrollAttempts();
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      _showError('Failed to load messages');
    }
  }

  void _scheduleMultipleScrollAttempts() {
    // First attempt immediately after frame
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _scrollToBottomForced();
      
      // Second attempt after short delay
      Future.delayed(const Duration(milliseconds: 200), () {
        _scrollToBottomForced();
        
        // Third attempt after layout should be fully settled
        Future.delayed(const Duration(milliseconds: 500), () {
          _scrollToBottomForced();
          
          // Final attempt with extra buffer
          Future.delayed(const Duration(milliseconds: 1000), () {
            _scrollToBottomForced();
          });
        });
      });
    });
  }
   void _scrollToBottom() {
    if (_scrollController.hasClients) {
      Future.delayed(const Duration(milliseconds: 100), () {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      });
    }
  }

  void _scrollToBottomForced() {
    if (_scrollController.hasClients) {
      try {
        // First try to calculate extra scroll to ensure we're really at the bottom
        final extraScroll = 100.0; // Extra pixels to ensure we scroll past the end
        double targetPosition = _scrollController.position.maxScrollExtent + extraScroll;
        
        // Safety check to avoid errors
        targetPosition = targetPosition.clamp(0.0, _scrollController.position.maxScrollExtent);
        
        // Jump directly without animation
        _scrollController.jumpTo(targetPosition);
      } catch (e) {
        // If direct approach fails, try again with delay
        Future.delayed(const Duration(milliseconds: 100), () {
          if (_scrollController.hasClients) {
            try {
              _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
            } catch (e) {
              // Last resort: animated scroll
              _scrollController.animateTo(
                _scrollController.position.maxScrollExtent,
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeOut,
              );
            }
          }
        });
      }
    }
  }

  Future<void> _sendMessage() async {
    if (_messageController.text.trim().isEmpty && _selectedImage == null) {
      return;
    }

    if (_chatRoomId == null || _isSending) {
      return;
    }

    setState(() {
      _isSending = true;
    });

    try {
      if (_selectedImage != null) {
        // Upload image first
        final imageUrl = await _chatService.uploadImage(_selectedImage!);
        if (imageUrl != null) {
          await _chatService.sendMessage(
            chatRoomId: _chatRoomId!,
            senderId: widget.employeeId,
            receiveId: widget.customerId,
            messageType: imageUrl,
            content: _messageController.text.trim(),
          );
        } else {
          _showError('Failed to upload image');
        }
      } else {
        // Text message only
        await _chatService.sendMessage(
          chatRoomId: _chatRoomId!,
          senderId: widget.employeeId,
          receiveId: widget.customerId,
          messageType: 'text',
          content: _messageController.text.trim(),
        );
      }

      // Clear fields
      _messageController.clear();
      setState(() {
        _selectedImage = null;
      });

      // Cuộn xuống sau khi gửi tin nhắn
      _scrollToBottom();
    } catch (e) {
      _showError('Failed to send message');
    } finally {
      setState(() {
        _isSending = false;
      });
    }
  }

  Future<void> _pickImage() async {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () async {
                Navigator.pop(context);
                final image = await _chatService.pickImageFromGallery();
                if (image != null) {
                  setState(() {
                    _selectedImage = image;
                  });
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () async {
                Navigator.pop(context);
                final image = await _chatService.takePhoto();
                if (image != null) {
                  setState(() {
                    _selectedImage = image;
                  });
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  bool _isCurrentUser(String senderId) {
    return senderId == widget.employeeId;
  }

  String _formatTime(DateTime dateTime) {
    return DateFormat('HH:mm').format(dateTime);
  }

  @override
  void dispose() {
    _chatService.dispose();
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final shortenedOrderId = widget.orderId.length > 8
        ? widget.orderId.substring(0, 8) + '...'
        : widget.orderId;

    return Scaffold(
      appBar: AppBar(
        title: Text('Chat #$shortenedOrderId'),
        elevation: 0,
        actions: [
          ValueListenableBuilder<ChatConnectionState>(
            valueListenable: _chatService.connectionState,
            builder: (context, state, _) {
              IconData icon;
              Color color;
              String tooltip;

              switch (state) {
                case ChatConnectionState.connected:
                  icon = Icons.wifi;
                  color = Colors.green;
                  tooltip = 'Connected';
                  break;
                case ChatConnectionState.connecting:
                  icon = Icons.wifi_calling;
                  color = Colors.orange;
                  tooltip = 'Connecting...';
                  break;
                default:
                  icon = Icons.wifi_off;
                  color = Colors.red;
                  tooltip = 'Disconnected';
              }

              return Padding(
                padding: const EdgeInsets.only(right: 16.0),
                child: Tooltip(
                  message: tooltip,
                  child: Icon(icon, color: color),
                ),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Messages area
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _messages.isEmpty
                    ? const Center(
                        child: Text(
                          'No messages yet. Start the conversation!',
                          style: TextStyle(color: Colors.grey),
                        ),
                      )
                    : ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[index];
                          final isCurrentUser =
                              _isCurrentUser(message.senderId);

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Row(
                              mainAxisAlignment: isCurrentUser
                                  ? MainAxisAlignment.end
                                  : MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                if (!isCurrentUser)
                                  CircleAvatar(
                                    radius: 16,
                                    backgroundColor: Colors.grey.shade300,
                                    child: const Text('C',
                                        style: TextStyle(color: Colors.black)),
                                  ),
                                const SizedBox(width: 8),
                                Flexible(
                                  child: Container(
                                    constraints: BoxConstraints(
                                      maxWidth:
                                          MediaQuery.of(context).size.width *
                                              0.7,
                                    ),
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: isCurrentUser
                                          ? Theme.of(context)
                                              .primaryColor
                                              .withOpacity(0.2)
                                          : Colors.white,
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [
                                        BoxShadow(
                                          color: Colors.black.withOpacity(0.05),
                                          blurRadius: 8,
                                          offset: const Offset(0, 2),
                                        ),
                                      ],
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        if (message.messageType
                                            .startsWith('http'))
                                          Column(
                                            children: [
                                              GestureDetector(
                                                onTap: () {
                                                  showDialog(
                                                    context: context,
                                                    builder: (context) =>
                                                        Dialog(
                                                      child: Stack(
                                                        children: [
                                                          Image.network(
                                                            message.messageType,
                                                            fit: BoxFit.contain,
                                                          ),
                                                          Positioned(
                                                            top: 8,
                                                            right: 8,
                                                            child: CircleAvatar(
                                                              backgroundColor:
                                                                  Colors
                                                                      .black54,
                                                              radius: 16,
                                                              child: IconButton(
                                                                icon: const Icon(
                                                                    Icons.close,
                                                                    size: 16,
                                                                    color: Colors
                                                                        .white),
                                                                onPressed: () =>
                                                                    Navigator.pop(
                                                                        context),
                                                              ),
                                                            ),
                                                          ),
                                                        ],
                                                      ),
                                                    ),
                                                  );
                                                },
                                                child: ClipRRect(
                                                  borderRadius:
                                                      BorderRadius.circular(8),
                                                  child: Image.network(
                                                    message.messageType,
                                                    fit: BoxFit.cover,
                                                    height: 150,
                                                    width: double.infinity,
                                                    loadingBuilder: (context,
                                                        child,
                                                        loadingProgress) {
                                                      if (loadingProgress ==
                                                          null) return child;
                                                      return Container(
                                                        height: 150,
                                                        width: double.infinity,
                                                        color: Colors
                                                            .grey.shade200,
                                                        child: const Center(
                                                          child:
                                                              CircularProgressIndicator(),
                                                        ),
                                                      );
                                                    },
                                                    errorBuilder: (context,
                                                        error, stackTrace) {
                                                      return Container(
                                                        height: 150,
                                                        width: double.infinity,
                                                        color: Colors
                                                            .grey.shade200,
                                                        child: const Center(
                                                          child: Icon(Icons
                                                              .broken_image),
                                                        ),
                                                      );
                                                    },
                                                  ),
                                                ),
                                              ),
                                              if (message.content.isNotEmpty)
                                                Padding(
                                                  padding:
                                                      const EdgeInsets.only(
                                                          top: 8.0),
                                                  child: Text(message.content),
                                                ),
                                            ],
                                          )
                                        else
                                          Text(message.content),
                                        const SizedBox(height: 4),
                                        Text(
                                          _formatTime(message.createAt),
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                if (isCurrentUser)
                                  CircleAvatar(
                                    radius: 16,
                                    backgroundColor:
                                        Theme.of(context).primaryColor,
                                    child: const Text('E',
                                        style: TextStyle(color: Colors.white)),
                                  ),
                              ],
                            ),
                          );
                        },
                      ),
          ),

          // Image preview
          if (_selectedImage != null)
            Container(
              padding: const EdgeInsets.all(8),
              color: Colors.grey.shade100,
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Stack(
                      children: [
                        Image.file(
                          _selectedImage!,
                          height: 80,
                          width: 80,
                          fit: BoxFit.cover,
                        ),
                        Positioned(
                          top: 0,
                          right: 0,
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedImage = null;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.all(2),
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Icon(
                                Icons.close,
                                size: 16,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          // Message input area
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 8,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.photo_camera),
                    onPressed: _chatService.connectionState.value ==
                            ChatConnectionState.connected
                        ? _pickImage
                        : null,
                  ),
                  Expanded(
                    child: TextField(
                      controller: _messageController,
                      enabled: _chatService.connectionState.value ==
                          ChatConnectionState.connected,
                      decoration: const InputDecoration(
                        hintText: 'Type a message...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(24)),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: Color(0xFFF2F2F2),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      ),
                      maxLines: null,
                      textInputAction: TextInputAction.newline,
                    ),
                  ),
                  const SizedBox(width: 8),
                  FloatingActionButton(
                    onPressed: () {
                      debugPrint(
                          'Text is empty: ${_messageController.text.trim().isEmpty}');
                      debugPrint('Selected image: $_selectedImage');
                      debugPrint(
                          'Connection state: ${_chatService.connectionState.value}');
                      debugPrint('Is sending: $_isSending');

                      if ((_messageController.text.trim().isNotEmpty ||
                              _selectedImage != null) &&
                          _chatService.connectionState.value ==
                              ChatConnectionState.connected &&
                          !_isSending) {
                        _sendMessage();
                      }
                    },
                    mini: true,
                    backgroundColor: Theme.of(context).primaryColor,
                    disabledElevation: 0,
                    elevation: 2,
                    child: _isSending
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Icon(Icons.send),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

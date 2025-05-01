import 'dart:async';
import 'dart:convert';

import 'package:flowerops/model/NotificationModel.dart';
import 'package:flowerops/model/NotificationResponse.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:signalr_netcore/signalr_client.dart';

class NotificationService {
  static const String baseUrl =
      'https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net';
  late HubConnection _hubConnection;
  bool _isConnected = false;
  String? _userId;

  // Stream controllers for notifications
  final _notificationsController =
      StreamController<List<NotificationModel>>.broadcast();
  final _newNotificationController =
      StreamController<NotificationModel>.broadcast();
  final _unreadCountController = StreamController<int>.broadcast();

  // Expose streams
  Stream<List<NotificationModel>> get notifications =>
      _notificationsController.stream;
  Stream<NotificationModel> get newNotification =>
      _newNotificationController.stream;
  Stream<int> get unreadCount => _unreadCountController.stream;

  // Singleton pattern
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;

  NotificationService._internal();

  // Initialize the service
  Future<void> initialize() async {
    await _getUserId();
    if (_userId != null) {
      await _setupSignalRConnection();
      await fetchNotifications();
    }
  }

  // Get user ID from SharedPreferences
  Future<void> _getUserId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final roleName = prefs.getString('roleName');
    if (roleName == 'StoreManager') {
      _userId = prefs.getString('storedId');
    } else {
      _userId = prefs.getString('userId');
    }
    if (kDebugMode) {
      print('User ID from SharedPreferences: $_userId');
    }
  }

  // Setup SignalR connection
  Future<void> _setupSignalRConnection() async {
    if (_userId == null) return;

    try {
      // Create hub connection
      _hubConnection = HubConnectionBuilder()
          .withUrl('$baseUrl/notificationHub')
          .withAutomaticReconnect()
          .build();

      // Register handler for receiving notifications
      _hubConnection.on('ReceiveNotification', _handleNewNotification);

      // Connect to hub
      await _hubConnection.start();
      _isConnected = true;

      // Join user's notification group
      await _hubConnection.invoke('JoinNotificationGroup', args: [_userId!]);

      if (kDebugMode) {
        print('SignalR connection established for user: $_userId');
      }

      // Setup reconnection logic
      _hubConnection.onclose(({error}) async {
        _isConnected = false;
        if (kDebugMode) {
          print('SignalR connection closed. Attempting to reconnect...');
        }

        await Future.delayed(const Duration(seconds: 5));
        if (!_isConnected) {
          await _hubConnection.start();
          _isConnected = true;
          await _hubConnection
              .invoke('JoinNotificationGroup', args: [_userId!]);
          if (kDebugMode) {
            print('SignalR reconnected and rejoined notification group');
          }
        }
      });
    } catch (e) {
      if (kDebugMode) {
        print('Failed to connect to SignalR hub: $e');
      }
    }
  }

  // Handle incoming notifications from SignalR
  void _handleNewNotification(List<Object?>? parameters) {
    if (parameters != null && parameters.isNotEmpty) {
      try {
        final notification = parameters[0] as Map<String, dynamic>;

        final formattedNotification = NotificationModel(
          notiId: notification['notificationId'] ?? '',
          fromUserId: notification['fromUserId'],
          toUserId: notification['toUserId'] ?? _userId ?? '',
          relatedId: notification['relatedId'],
          type: notification['type'] ?? 'Default',
          message: notification['message'] ?? '',
          createAt: notification['createdAt'] != null
              ? DateTime.parse(notification['createdAt'])
              : DateTime.now(),
          updateAt: DateTime.now(),
          status: notification['status'] ?? 'New',
          isRead: notification['isRead'] ?? false,
        );

        if (kDebugMode) {
          print('Received notification: ${formattedNotification.message}');
        }

        // Add to stream
        _newNotificationController.add(formattedNotification);

        // Update notifications list
        fetchNotifications();
      } catch (e) {
        if (kDebugMode) {
          print('Error processing notification: $e');
        }
      }
    }
  }

  // Fetch notifications from API
  Future<List<NotificationModel>> fetchNotifications() async {
    if (_userId == null) {
      return [];
    }

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/Noti/user/$_userId'),
        headers: {'accept': '*/*'},
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        final notificationResponse =
            NotificationResponse.fromJson(jsonResponse);

        // Update stream with notifications
        _notificationsController.add(notificationResponse.data);

        // Update unread count
        final unreadNotifications = notificationResponse.data
            .where((notification) => !notification.isRead)
            .length;
        _unreadCountController.add(unreadNotifications);

        return notificationResponse.data;
      } else {
        if (kDebugMode) {
          print(
              'Failed to fetch notifications. Status: ${response.statusCode}');
        }
        return [];
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error fetching notifications: $e');
      }
      return [];
    }
  }

  // Mark notification as read
  Future<bool> markAsRead(String notiId) async {
    try {
      final response = await http.put(
        Uri.parse('$baseUrl/api/Noti/read/$notiId'),
        headers: {'accept': '*/*'},
      );

      if (response.statusCode == 200) {
        // Fetch notifications to update the list
        await fetchNotifications();
        return true;
      } else {
        if (kDebugMode) {
          print(
              'Failed to mark notification as read. Status: ${response.statusCode}');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        print('Error marking notification as read: $e');
      }
      return false;
    }
  }

  // Mark all notifications as read
  Future<bool> markAllAsRead() async {
    try {
      final notifications = await fetchNotifications();
      final unreadNotifications =
          notifications.where((notification) => !notification.isRead).toList();

      bool allSuccessful = true;
      for (var notification in unreadNotifications) {
        final success = await markAsRead(notification.notiId);
        if (!success) {
          allSuccessful = false;
        }
      }

      return allSuccessful;
    } catch (e) {
      if (kDebugMode) {
        print('Error marking all notifications as read: $e');
      }
      return false;
    }
  }

  // Dispose resources
  void dispose() {
    _hubConnection.stop();
    _notificationsController.close();
    _newNotificationController.close();
    _unreadCountController.close();
  }
}

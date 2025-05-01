import 'package:flowerops/WIDGETS/notification_list_item.dart';
import 'package:flowerops/model/NotificationModel.dart';
import 'package:flowerops/screen/delivery_detail_screen.dart';
import 'package:flowerops/screen/manager_order_detail_screen.dart';
import 'package:flowerops/screen/staff_order_detail_screen.dart';
import 'package:flowerops/services/notification_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

class NotificationPanel extends StatefulWidget {
  const NotificationPanel({Key? key}) : super(key: key);

  @override
  State<NotificationPanel> createState() => _NotificationPanelState();
}

class _NotificationPanelState extends State<NotificationPanel> {
  final NotificationService _notificationService = NotificationService();
  List<NotificationModel> _notifications = [];
  String _currentFilter = 'all';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();

    // Listen for new notifications
    _notificationService.notifications.listen((notifications) {
      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });
    });
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
    });

    await _notificationService.fetchNotifications();

    setState(() {
      _isLoading = false;
    });
  }

  List<NotificationModel> _getFilteredNotifications() {
    switch (_currentFilter) {
      case 'new':
        // Filter notifications from the last 24 hours
        final oneDayAgo = DateTime.now().subtract(const Duration(days: 1));
        return _notifications
            .where((notification) => notification.createAt.isAfter(oneDayAgo))
            .toList();
      case 'unread':
        // Filter unread notifications
        return _notifications
            .where((notification) => !notification.isRead)
            .toList();
      case 'other':
        // Filter older than 24 hours and read notifications
        final oneDayAgo = DateTime.now().subtract(const Duration(days: 1));
        return _notifications
            .where((notification) =>
                notification.createAt.isBefore(oneDayAgo) &&
                notification.isRead)
            .toList();
      case 'all':
      default:
        // Return all notifications
        return _notifications;
    }
  }

  Future<void> _markAllAsRead() async {
    await _notificationService.markAllAsRead();
  }

  void _handleNotificationTap(NotificationModel notification) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final roleName = prefs.getString('roleName');
    if (!notification.isRead) {
      await _notificationService.markAsRead(notification.notiId);
    }
    Navigator.pop(context);

    // Handle navigation based on notification type
    if (notification.relatedId != null) {
      switch (notification.type) {
        case 'Order':
          if (roleName == "StoreManager") {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ManagerOrderDetailScreen(
                  orderId: notification.relatedId!,
                ),
              ),
            );
          } else if (roleName == "Courier") {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => DeliveryDetailScreen(
                  deliveryId: notification.relatedId!,
                ),
              ),
            );
          } else {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => StaffOrderDetailScreen(
                  orderId: notification.relatedId!,
                ),
              ),
            );
          }
          break;
        case 'Product':
          Navigator.pushNamed(
            context,
            '/product/detail/${notification.relatedId}',
          );
          break;
        case 'User':
          Navigator.pushNamed(
            context,
            '/user/profile/${notification.relatedId}',
          );
          break;
        case 'Inventory':
          Navigator.pushNamed(
            context,
            '/inventory/detail/${notification.relatedId}',
          );
          break;
        default:
          debugPrint('Unknown notification type: ${notification.type}');
          break;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredNotifications = _getFilteredNotifications();
    final unreadCount =
        _notifications.where((notification) => !notification.isRead).length;

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      'Notifications',
                      style: GoogleFonts.montserrat(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 8),
                    unreadCount > 0
                        ? Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              '$unreadCount',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          )
                        : const SizedBox.shrink(),
                  ],
                ),
                TextButton(
                  onPressed: _markAllAsRead,
                  child: Text(
                    'Mark all as read',
                    style: TextStyle(
                      color: Theme.of(context).primaryColor,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Filter
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: DropdownButtonFormField<String>(
              value: _currentFilter,
              decoration: InputDecoration(
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              items: const [
                DropdownMenuItem(
                    value: 'all', child: Text('All notifications')),
                DropdownMenuItem(value: 'new', child: Text('')),
                DropdownMenuItem(value: 'unread', child: Text('Unread')),
                DropdownMenuItem(value: 'other', child: Text('Others')),
              ],
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _currentFilter = value;
                  });
                }
              },
            ),
          ),

          const Divider(height: 20),

          // Notification List
          Flexible(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.7,
              ),
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : filteredNotifications.isEmpty
                      ? Center(
                          child: Text(
                            'No notifications',
                            style: GoogleFonts.montserrat(
                              fontSize: 16,
                              color: Colors.grey,
                            ),
                          ),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          itemCount: filteredNotifications.length,
                          separatorBuilder: (context, index) =>
                              const Divider(height: 1),
                          itemBuilder: (context, index) {
                            final notification = filteredNotifications[index];
                            return NotificationListItem(
                              notification: notification,
                              onTap: () => _handleNotificationTap(notification),
                            );
                          },
                        ),
            ),
          ),
        ],
      ),
    );
  }
}

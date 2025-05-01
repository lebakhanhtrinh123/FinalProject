import 'package:flowerops/model/NotificationModel.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class NotificationListItem extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;
  
  const NotificationListItem({
    Key? key,
    required this.notification,
    required this.onTap,
  }) : super(key: key);
  
  String _formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} minutes ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} hours ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else {
      return '${dateTime.day}/${dateTime.month}/${dateTime.year}';
    }
  }
  
  IconData _getNotificationIcon() {
    switch (notification.type) {
      case 'Order':
        return Icons.shopping_bag_outlined;
      case 'Product':
        return Icons.inventory_2_outlined;
      case 'User':
        return Icons.person_outline;
      case 'Inventory':
        return Icons.warehouse_outlined;
      default:
        return Icons.notifications_none;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16.0),
        color: notification.isRead ? Colors.white : Colors.blue.shade50,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar/Icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Theme.of(context).primaryColor.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getNotificationIcon(),
                color: Theme.of(context).primaryColor,
              ),
            ),
            const SizedBox(width: 16),
            
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header row with title and time
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        notification.type,
                        style: GoogleFonts.montserrat(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        _formatTime(notification.createAt),
                        style: const TextStyle(
                          color: Colors.grey,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  
                  // Message
                  Text(
                    notification.message,
                    style: GoogleFonts.montserrat(
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Status chips
                  Wrap(
                    spacing: 8,
                    children: [
                      if (!notification.isRead)
                        Chip(
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          label: const Text('Unread'),
                          labelStyle: const TextStyle(
                            color: Colors.deepOrange,
                            fontSize: 12,
                          ),
                          backgroundColor: Colors.deepOrange.shade50,
                          padding: const EdgeInsets.all(0),
                          labelPadding: const EdgeInsets.symmetric(horizontal: 8),
                        ),
                      // Chip(
                      //   materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      //   label: Text(notification.status),
                      //   labelStyle: TextStyle(
                      //     color: Theme.of(context).primaryColor,
                      //     fontSize: 12,
                      //   ),
                      //   backgroundColor: Theme.of(context).primaryColor.withOpacity(0.1),
                      //   padding: const EdgeInsets.all(0),
                      //   labelPadding: const EdgeInsets.symmetric(horizontal: 8),
                      // ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
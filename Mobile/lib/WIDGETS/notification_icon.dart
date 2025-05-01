import 'package:flowerops/WIDGETS/notification_panel.dart';
import 'package:flowerops/services/notification_service.dart';
import 'package:flutter/material.dart';

class NotificationIcon extends StatefulWidget {
  final Color? backgroundColor;
  final Color? iconColor;
  final double iconSize;
  
  const NotificationIcon({
    Key? key,
    this.backgroundColor,
    this.iconColor,
    this.iconSize = 24.0,
  }) : super(key: key);

  @override
  State<NotificationIcon> createState() => _NotificationIconState();
}

class _NotificationIconState extends State<NotificationIcon> {
  final NotificationService _notificationService = NotificationService();
  int _unreadCount = 0;
  
  @override
  void initState() {
    super.initState();
    _initializeNotifications();
  }
  
  Future<void> _initializeNotifications() async {
    await _notificationService.initialize();
    _notificationService.unreadCount.listen((count) {
      setState(() {
        _unreadCount = count;
      });
    });
    
    // Initial fetch
    await _notificationService.fetchNotifications();
  }
  
  void _showNotificationPanel() {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        insetPadding: const EdgeInsets.only(top: 60, left: 0, right: 0, bottom: 0),
        alignment: Alignment.topCenter,
        backgroundColor: Colors.transparent,
        child: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.9,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(20)),
          ),
          child: const NotificationPanel(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Container(
      decoration: BoxDecoration(
        color: widget.backgroundColor ?? theme.primaryColor.withOpacity(0.1),
        shape: BoxShape.circle,
      ),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: _showNotificationPanel,
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Badge(
            isLabelVisible: _unreadCount > 0,
            label: Text('$_unreadCount'),
            child: Icon(
              Icons.notifications_outlined,
              color: widget.iconColor ?? theme.primaryColor,
              size: widget.iconSize,
            ),
          ),
        ),
      ),
    );
  }
}
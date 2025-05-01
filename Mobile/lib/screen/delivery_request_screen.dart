import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/DeliveryData.dart';
import 'package:flowerops/screen/delivery_detail_screen.dart';
import 'package:flowerops/services/delivery_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DeliveryRequestScreen extends StatefulWidget {
  const DeliveryRequestScreen({super.key});

  @override
  State<DeliveryRequestScreen> createState() => _DeliveryRequestScreenState();
}

enum SortOrder {
  earliest,
  latest,
  none,
}

class _DeliveryRequestScreenState extends State<DeliveryRequestScreen> {
  final DeliveryService _deliveryService = DeliveryService();
  List<DeliveryData> deliveries = [];
  List<DeliveryData> filteredDeliveries = [];
  bool isLoading = true;
  SortOrder currentSort = SortOrder.none;

  @override
  void initState() {
    super.initState();
    _loadDeliveries();
  }

  Future<void> _loadDeliveries() async {
    try {
      final response = await _deliveryService.getDeliveriesByShipper();
      setState(() {
        deliveries =
            response.data?.where((d) => d.status != "Received").toList() ?? [];
        filteredDeliveries = List.from(deliveries);
        isLoading = false;
      });
    } catch (e) {
      print("Error: $e");
      setState(() {
        isLoading = false;
      });
    }
  }

  void _sortDeliveries(SortOrder order) {
    setState(() {
      currentSort = order;
      if (order == SortOrder.earliest) {
        filteredDeliveries.sort((a, b) {
          if (a.deliveryTime == null) return 1;
          if (b.deliveryTime == null) return -1;
          return a.deliveryTime!.compareTo(b.deliveryTime!);
        });
      } else if (order == SortOrder.latest) {
        filteredDeliveries.sort((a, b) {
          if (a.deliveryTime == null) return 1;
          if (b.deliveryTime == null) return -1;
          return b.deliveryTime!.compareTo(a.deliveryTime!);
        });
      } else {
        // Reset to original order
        filteredDeliveries = List.from(deliveries);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.teal[700]),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Order List',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          NotificationIcon(),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // TextField(
              //   decoration: InputDecoration(
              //     hintText: 'Where to?',
              //     prefixIcon: Icon(Icons.location_on_outlined),
              //     border: OutlineInputBorder(
              //       borderRadius: BorderRadius.circular(8),
              //     ),
              //   ),
              // ),
              // SizedBox(height: 20),
              _buildFilterOptions(),
              SizedBox(height: 10),
              Expanded(
                child: isLoading
                    ? Center(child: CircularProgressIndicator())
                    : RefreshIndicator(
                        onRefresh: _loadDeliveries,
                        child: filteredDeliveries.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.local_shipping_outlined,
                                      size: 64,
                                      color: Colors.grey,
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      'No deliveries available',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: Colors.grey,
                                      ),
                                    ),
                                    SizedBox(height: 8),
                                    ElevatedButton(
                                      onPressed: _loadDeliveries,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.teal,
                                      ),
                                      child: Text(
                                        'Refresh',
                                        style: TextStyle(color: Colors.white),
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                itemCount: filteredDeliveries.length,
                                itemBuilder: (context, index) {
                                  final delivery = filteredDeliveries[index];
                                  return Padding(
                                    padding: EdgeInsets.only(bottom: 12),
                                    child: _buildRequestCard(
                                      context: context,
                                      title: 'Delivery Request',
                                      recipient: delivery.customerName ??
                                          '',
                                      location: delivery.deliveryLocation ??
                                          '',
                                      status: delivery.status == 'IN_PROGRESS'
                                          ? DeliveryStatus.inProgress
                                          : DeliveryStatus.unprocessed,
                                      deliveryTime: delivery.deliveryTime ??
                                          DateTime.now(),
                                      deliveryId: delivery.deliveryId ?? '',
                                    ),
                                  );
                                },
                              ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterOptions() {
    return Container(
      padding: EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildFilterButton(
            title: 'Earliest',
            icon: Icons.arrow_upward,
            isActive: currentSort == SortOrder.earliest,
            onTap: () => _sortDeliveries(SortOrder.earliest),
          ),
          _buildFilterButton(
            title: 'Latest',
            icon: Icons.arrow_downward,
            isActive: currentSort == SortOrder.latest,
            onTap: () => _sortDeliveries(SortOrder.latest),
          ),
          _buildFilterButton(
            title: 'Default',
            icon: Icons.restore,
            isActive: currentSort == SortOrder.none,
            onTap: () => _sortDeliveries(SortOrder.none),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterButton({
    required String title,
    required IconData icon,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? Colors.teal[50] : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
          border: isActive ? Border.all(color: Colors.teal) : null,
        ),
        child: Row(
          children: [
            Icon(
              icon,
              size: 16,
              color: isActive ? Colors.teal : Colors.grey[700],
            ),
            SizedBox(width: 4),
            Text(
              title,
              style: TextStyle(
                color: isActive ? Colors.teal : Colors.grey[700],
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestCard({
    required BuildContext context,
    required String title,
    required String recipient,
    required String location,
    required DeliveryStatus status,
    required DateTime deliveryTime,
    required String deliveryId,
  }) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (status == DeliveryStatus.inProgress)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.teal.shade100,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      'In Progress',
                      style: TextStyle(
                        color: Colors.teal.shade800,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
              ],
            ),
            Text('Recipient: $recipient'),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.delivery_dining, size: 20),
                SizedBox(width: 8),
                Text('Drop off'),
                SizedBox(width: 8),
                Expanded(child: Text(location)),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time, size: 20, color: Colors.grey),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Delivery Time: ${DateFormat('dd/MM/yyyy HH:mm').format(deliveryTime)} ${_getTimeStatus(deliveryTime)}',
                    style: TextStyle(
                      color: _getTimeColor(deliveryTime),
                    ),
                    overflow:
                        TextOverflow.ellipsis, 
                    maxLines: 2, 
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () {},
                    child: Text('Reject'),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DeliveryDetailScreen(
                            deliveryId: deliveryId,
                          ),
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: status == DeliveryStatus.inProgress
                          ? Colors.teal.shade700
                          : Colors.teal,
                    ),
                    child: Text(
                      'Detail',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

String _getTimeStatus(DateTime deliveryTime) {
  final now = DateTime.now();
  if (now.isBefore(deliveryTime.subtract(Duration(hours: 1)))) {
    return '(Upcoming)';
  } else if (now.isAfter(deliveryTime.add(Duration(minutes: 15)))) {
    return '(Overdue)';
  } else {
    return '(Right Now)';
  }
}

Color _getTimeColor(DateTime deliveryTime) {
  final now = DateTime.now();
  if (now.isBefore(deliveryTime.subtract(Duration(hours: 1)))) {
    return Colors.green;
  } else if (now.isAfter(deliveryTime.add(Duration(minutes: 15)))) {
    return Colors.red;
  } else {
    return Colors.orange;
  }
}

enum DeliveryStatus {
  inProgress,
  unprocessed,
}

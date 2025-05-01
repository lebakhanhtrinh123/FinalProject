import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/DeliveryData.dart';
import 'package:flowerops/screen/delivery_complate_screen.dart';
import 'package:flowerops/screen/delivery_home_screen.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/services/delivery_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DeliveryHistoryScreen extends StatefulWidget {
  const DeliveryHistoryScreen({super.key});

  @override
  State<DeliveryHistoryScreen> createState() => _DeliveryHistoryScreenState();
}

class _DeliveryHistoryScreenState extends State<DeliveryHistoryScreen> {
  final DeliveryService _deliveryService = DeliveryService();
  List<DeliveryData> deliveries = [];
  List<DeliveryData> filteredDeliveries = [];
  bool isLoading = true;
  String _selectedFilter = 'All';
  int _selectedIndex = 1;

  @override
  void initState() {
    super.initState();
    _loadDeliveries();
  }

  Future<void> _loadDeliveries() async {
    try {
      setState(() {
        isLoading = true;
      });
      final response = await _deliveryService.getDeliveriesByShipper();
      setState(() {
        deliveries = response.data?.where((d) => d.status == "Received").toList() ?? [];
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

  void _applyFilter(String filter) {
    setState(() {
      _selectedFilter = filter;
      
      switch (filter) {
        case 'All':
          filteredDeliveries = List.from(deliveries);
          break;
        case 'Earliest':
          filteredDeliveries = List.from(deliveries)
            ..sort((a, b) => (a.deliveryTime ?? DateTime.now())
                .compareTo(b.deliveryTime ?? DateTime.now()));
          break;
        case 'Latest':
          filteredDeliveries = List.from(deliveries)
            ..sort((a, b) => (b.deliveryTime ?? DateTime.now())
                .compareTo(a.deliveryTime ?? DateTime.now()));
          break;
        case 'On Time':
          filteredDeliveries = deliveries
              .where((d) => (d.timeDone != null && d.deliveryTime != null) && 
                 d.timeDone!.isBefore(d.deliveryTime!))
              .toList();
          break;
        case 'Late':
          filteredDeliveries = deliveries
              .where((d) => (d.timeDone != null && d.deliveryTime != null) && 
                 d.timeDone!.isAfter(d.deliveryTime!))
              .toList();
          break;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.transparent,
        elevation: 0,
        
        
        title: Text(
          'Delivery History',
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
              _buildFilterBar(),
              SizedBox(height: 20),
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
                                      Icons.history,
                                      size: 64,
                                      color: Colors.grey,
                                    ),
                                    SizedBox(height: 16),
                                    Text(
                                      'No delivery history available',
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
                                    child: _buildHistoryCard(
                                      context: context,
                                      recipient: delivery.customerName ?? 'Không có tên',
                                      location: delivery.deliveryLocation ?? 'Không có địa chỉ',
                                      deliveryTime: delivery.deliveryTime ?? DateTime.now(),
                                      timeDone: delivery.timeDone,
                                      deliveryId: delivery.orderId ?? '',
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
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.teal,
        onTap: (index) {
          setState(() {
            _selectedIndex = index;
          });
          switch (index) {
            case 0:
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => DeliveryHomeScreen()),
              );
              break;
            case 1:
            Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => DeliveryHistoryScreen()),
              );
              break;
            case 2:
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(builder: (context) => ProfileScreen()),
              );
              break;
          }
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Orders',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'Order history',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildFilterBar() {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(25),
      ),
      child: Row(
        children: [
          _buildFilterChip('All'),
          _buildFilterChip('Earliest'),
          _buildFilterChip('Latest'),
          _buildFilterChip('On Time'),
          _buildFilterChip('Late'),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label) {
    final isSelected = _selectedFilter == label;
    
    return Expanded(
      child: GestureDetector(
        onTap: () => _applyFilter(label),
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? Colors.teal : Colors.transparent,
            borderRadius: BorderRadius.circular(25),
          ),
          child: Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black87,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryCard({
    required BuildContext context,
    required String recipient,
    required String location,
    required DateTime deliveryTime,
    DateTime? timeDone,
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
                  'Order #${deliveryId.substring(0, 8)}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: timeDone != null ? 
                           _getTimeColor(deliveryTime, timeDone).withOpacity(0.2) : 
                           Colors.grey.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    timeDone != null ? 
                      (timeDone.isBefore(deliveryTime) ? 'On Time' : 'Late') : 
                      'Unknown',
                    style: TextStyle(
                      color: timeDone != null ? 
                             _getTimeColor(deliveryTime, timeDone) : 
                             Colors.grey,
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
                Icon(Icons.location_on_outlined, size: 20),
                SizedBox(width: 8),
                Expanded(child: Text(location)),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time, size: 20),
                SizedBox(width: 8),
                Text(
                  'Expected: ${DateFormat('dd/MM/yyyy HH:mm').format(deliveryTime)}',
                ),
              ],
            ),
            if (timeDone != null) ...[
              SizedBox(height: 4),
              Row(
                children: [
                  Icon(Icons.check_circle_outline, size: 20, 
                       color: _getTimeColor(deliveryTime, timeDone)),
                  SizedBox(width: 8),
                  Text(
                    'Delivered: ${DateFormat('dd/MM/yyyy HH:mm').format(timeDone)}',
                    style: TextStyle(
                      color: _getTimeColor(deliveryTime, timeDone),
                    ),
                  ),
                ],
              ),
            ],
            SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DeliveryComplateScreen(
                        deliveryId: deliveryId,
                      ),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.teal,
                ),
                child: Text(
                  'View Details',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Hàm trả về màu dựa trên thời gian giao hàng và thời gian hoàn thành
Color _getTimeColor(DateTime deliveryTime, DateTime timeDone) {
  // Nếu timeDone trước deliveryTime thì đơn hàng giao đúng giờ (xanh)
  if (timeDone.isBefore(deliveryTime)) {
    return Colors.green;
  } 
  // Nếu timeDone sau deliveryTime thì đơn hàng trễ giờ (đỏ)
  else {
    return Colors.red;
  }
}
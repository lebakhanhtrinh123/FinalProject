import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/DeliveryData.dart';
import 'package:flowerops/screen/delivery_detail_screen.dart';
import 'package:flowerops/screen/delivery_history_screen.dart';
import 'package:flowerops/screen/delivery_request_screen.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/services/delivery_service.dart';
import 'package:flutter/material.dart';

class DeliveryHomeScreen extends StatefulWidget {
  @override
  _DeliveryHomeScreenState createState() => _DeliveryHomeScreenState();
}

class _DeliveryHomeScreenState extends State<DeliveryHomeScreen> {
  final DeliveryService _deliveryService = DeliveryService();
  List<DeliveryData> deliveries = [];
  bool isLoading = true;
  double availableBalance = 0.0;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadDeliveries();
  }

  Future<void> _loadDeliveries() async {
    try {
      final response = await _deliveryService.getDeliveriesByShipper();
      DateTime now = DateTime.now();
      DateTime today = DateTime(now.year, now.month, now.day);
      setState(() {
        deliveries =
            response.data?.where((d) => d.status != "Received").toList() ?? [];

        int totalFeeToday = response.data
                ?.where((d) =>
                    d.status == "Received" &&
                    d.timeDone != null &&
                    DateTime(d.timeDone!.year, d.timeDone!.month,
                            d.timeDone!.day) ==
                        today)
                ?.map((d) => d.fee ?? 0)
                ?.reduce((sum, fee) => sum + fee) ??
            0;
        availableBalance = totalFeeToday.toDouble();
        isLoading = false;
      });
    } catch (e) {
      print("Error: $e");
      setState(() {
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with Welcome and Profile
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome Back',
                        style: TextStyle(
                          color: Colors.grey,
                          fontSize: 14,
                        ),
                      ),
                      
                    ],
                  ),
                  Row(
                    children: [
                      NotificationIcon(),
                    ],
                  )
                ],
              ),

              SizedBox(height: 20),

              // Balance Card
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Earnings Today'),
                    SizedBox(height: 8),
                    Row(
                      children: [
                        Text(
                          '\$${availableBalance.toStringAsFixed(2)}',
                          style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.refresh),
                          onPressed: () {},
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 20),

              // Delivery Direction Input
              TextField(
                decoration: InputDecoration(
                  hintText: 'Where to?',
                  prefixIcon: Icon(Icons.location_on_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),

              SizedBox(height: 20),

              // Available Requests Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Available Requests',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => DeliveryRequestScreen(),
                        ),
                      );
                    },
                    child: Text('View all'),
                  ),
                ],
              ),

              // Request Cards

              Expanded(
                child: isLoading
                    ? Center(child: CircularProgressIndicator())
                    : RefreshIndicator(
                        onRefresh: _loadDeliveries,
                        child: deliveries.isEmpty
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
                                      child: Text('Refresh'),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.teal,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                itemCount: deliveries.length,
                                itemBuilder: (context, index) {
                                  final delivery = deliveries[index];
                                  return Padding(
                                    padding: EdgeInsets.only(bottom: 12),
                                    child: _buildRequestCard(
                                      context: context,
                                      title: 'Delivery Request',
                                      recipient:
                                          delivery.customerName ?? 'Unknown',
                                      location: delivery.deliveryLocation ??
                                          'No location',
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
                MaterialPageRoute(
                    builder: (context) => DeliveryHistoryScreen()),
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

  Widget _buildRequestCard({
    required BuildContext context,
    required String title,
    required String recipient,
    required String location,
    required String deliveryId,
  }) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
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
                      backgroundColor: Colors.teal,
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

import 'package:flowerops/model/flower_arrangement_data.dart';
import 'package:flowerops/screen/flower_arangement_detail_screen.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/screen/staff_list_order_screen.dart';
import 'package:flowerops/services/flower_arrangement_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class FlowerArangementRequestScreen extends StatefulWidget {
  const FlowerArangementRequestScreen({super.key});

  @override
  State<FlowerArangementRequestScreen> createState() => _FlowerArangementRequestScreenState();
}

class _FlowerArangementRequestScreenState extends State<FlowerArangementRequestScreen> {
  final FlowerArrangementService _service = FlowerArrangementService();
  bool isLoading = true;
  List<FlowerArrangementData>? arrangements;
  String? error;
  int _selectedIndex = 1;

  @override
  void initState() {
    super.initState();
    _loadArrangements();
  }

  Future<void> _loadArrangements() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final response = await _service.getArrangementRequests();
      setState(() {
        arrangements = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Flower Arrangement Requests',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: Icon(Icons.filter_list),
            onSelected: (value) {
              // Xử lý lọc đơn hàng
            },
            itemBuilder: (BuildContext context) => [
              PopupMenuItem(
                value: 'all',
                child: Text('All Orders'),
              ),
              PopupMenuItem(
                value: 'pending',
                child: Text('Pending'),
              ),
              PopupMenuItem(
                value: 'processing',
                child: Text('Processing'),
              ),
              PopupMenuItem(
                value: 'completed',
                child: Text('Completed'),
              ),
            ],
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : RefreshIndicator(
                  onRefresh: _loadArrangements,
                  child: ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: arrangements?.length ?? 0,
                    itemBuilder: (context, index) {
                      final item = arrangements![index];
                      return _buildArrangementCard(item);
                    },
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
                MaterialPageRoute(builder: (context) => StaffListOrderScreen()),
              );
              break;
            case 1:
              
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
            icon: Icon(Icons.local_florist),
            label: 'Arrangements',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildArrangementCard(FlowerArrangementData arrangement) {
    return Card(
      margin: EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => FlowerArangementDetailScreen(
                requestId: arrangement.requestId,
              ),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Column(
          children: [
            // Image Section
            ClipRRect(
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
              child: Image.network(
                arrangement.imageUrl,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 200,
                  color: Colors.grey[300],
                  child: Icon(
                    Icons.image_not_supported,
                    size: 50,
                    color: Colors.grey[500],
                  ),
                ),
              ),
            ),
            // Info Section
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Request #${arrangement.requestId}',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      _buildStatusChip(arrangement.status),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.person_outline,
                          size: 20, color: Colors.grey[600]),
                      SizedBox(width: 8),
                      Text(
                        arrangement.customerName,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[800],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.access_time,
                          size: 20, color: Colors.grey[600]),
                      SizedBox(width: 8),
                      Text(
                        DateFormat('dd/MM/yyyy HH:mm')
                            .format(arrangement.requestDate),
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[800],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        NumberFormat.currency(locale: 'vi_VN', symbol: '₫')
                            .format(arrangement.price),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal[700],
                        ),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  FlowerArangementDetailScreen(
                                requestId: arrangement.requestId,
                              ),
                            ),
                          );
                        },
                        child: Text(
                          'View Details',
                          style: TextStyle(
                            color: Colors.teal[700],
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
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

  Widget _buildStatusChip(String status) {
    Color chipColor;
    String displayStatus;

    switch (status.toLowerCase()) {
      case 'pending':
        chipColor = Colors.orange;
        displayStatus = 'Pending';
        break;
      case 'in_progress':
        chipColor = Colors.blue;
        displayStatus = 'In Progress';
        break;
      case 'completed':
        chipColor = Colors.green;
        displayStatus = 'Completed';
        break;
      default:
        chipColor = Colors.grey;
        displayStatus = 'Unknown';
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: chipColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: chipColor),
      ),
      child: Text(
        displayStatus,
        style: TextStyle(
          color: chipColor,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/order_data.dart';
import 'package:flowerops/model/order_response.dart';
import 'package:flowerops/screen/flower_arangement_request_screen.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/screen/staff_Schedule_calendar.dart';
import 'package:flowerops/screen/staff_order_detail_screen.dart';
import 'package:flowerops/services/notification_service.dart';
import 'package:flowerops/services/order_service.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';

class StaffListOrderScreen extends StatefulWidget {
  const StaffListOrderScreen({super.key});

  @override
  State<StaffListOrderScreen> createState() => _StaffListOrderScreenState();
}

class _StaffListOrderScreenState extends State<StaffListOrderScreen> {
  final NotificationService _notificationService = NotificationService();
  final OrderService _orderService = OrderService();
  OrderStatus _selectedStatus = OrderStatus.all;
  DeliveryDateSort _selectedDateSort = DeliveryDateSort.none;

  List<Order> _orders = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadOrders();
    _notificationService.initialize();
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _orderService.getOrdersByStaff(
        status: _selectedStatus,
        dateSort: _selectedDateSort,
      );

      setState(() {
        _orders = response.data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = "Unable to load order: $e";
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        elevation: 0,
        backgroundColor: Colors.white,
        title: Text(
          'Order List',
          style: GoogleFonts.montserrat(
            color: Colors.black87,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Center(
              child: NotificationIcon(
                backgroundColor: Colors.blue.shade50,
                iconColor: Colors.blue,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.black87),
            onPressed: () => _showFilterBottomSheet(context),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(child: Text(_errorMessage!))
              : _orders.isEmpty
                  ? _buildEmptyState()
                  : _buildOrderList(),
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
              Navigator.pushReplacement(
                context,
                MaterialPageRoute(
                    builder: (context) => StaffScheduleCalendar()),
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
            icon: Icon(Icons.calendar_month_sharp),
            label: 'Schedule',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.local_florist_outlined,
              size: 60, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            'No orders',
            style: GoogleFonts.montserrat(
              fontSize: 16,
              color: Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderList() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _orders.length,
      itemBuilder: (context, index) {
        final order = _orders[index];
        return _buildOrderCard(order);
      },
    );
  }

  Widget _buildOrderCard(Order order) {
    // Generate a unique order ID display format
    final orderIdShort = "REQ${order.orderId.substring(0, 4).toUpperCase()}";

    // Format the price
    final currencyFormatter =
        NumberFormat.currency(locale: 'vi_VN', symbol: 'đ', decimalDigits: 0);
    final formattedPrice = currencyFormatter.format(order.orderPrice);

    // Determine order type
    final bool isCustom = order.isCustomOrder();

    return GestureDetector(
      onTap: () => _navigateToOrderDetails(order),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: Colors.white,
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order header with ID and status
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE3F2FD),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Request #$orderIdShort',
                    style: GoogleFonts.montserrat(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: FittedBox(
                      fit: BoxFit.scaleDown,
                      child: _buildStatusChip(order.status ?? ''),
                    ),
                  ),
                ],
              ),
            ),

            // Customer info
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Customer and order time
                  Row(
                    children: [
                      const Icon(Icons.person_outline,
                          size: 18, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text(
                        isCustom
                            ? order.productCustomResponse?.productName ??
                                'Customer'
                            : order.orderDetails?.firstOrNull?.productName ??
                                'Customer',
                        style: GoogleFonts.montserrat(
                          color: Colors.black87,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.access_time,
                          size: 18, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text(
                        order.createAt != null
                            ? DateFormat('dd/MM/yyyy HH:mm')
                                .format(order.createAt!)
                            : 'Unknown date',
                        style: GoogleFonts.montserrat(
                          color: Colors.black54,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),

                  // Order type badge
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color:
                          isCustom ? Colors.blue.shade50 : Colors.green.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isCustom
                            ? Colors.blue.shade200
                            : Colors.green.shade200,
                        width: 1,
                      ),
                    ),
                    child: Text(
                      isCustom ? 'Custom order' : 'Regular Order',
                      style: GoogleFonts.montserrat(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isCustom
                            ? Colors.blue.shade700
                            : Colors.green.shade700,
                      ),
                    ),
                  ),

                  // Price and delivery date
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Delivery date
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'delivery date:',
                            style: GoogleFonts.montserrat(
                              fontSize: 12,
                              color: Colors.black54,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            order.deliveryDateTime != null
                                ? DateFormat('dd/MM/yyyy HH:mm')
                                    .format(order.deliveryDateTime!)
                                : 'No delivery date yet',
                            style: GoogleFonts.montserrat(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),

                      // Price
                      Text(
                        formattedPrice,
                        style: GoogleFonts.montserrat(
                          color: Colors.teal.shade700,
                          fontWeight: FontWeight.w600,
                          fontSize: 18,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // View details button
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: const BoxDecoration(
                border: Border(
                  top: BorderSide(color: Color(0xFFEEEEEE), width: 1),
                ),
              ),
              child: Center(
                child: Text(
                  'View Details',
                  style: GoogleFonts.montserrat(
                    color: Colors.teal,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChip(String status) {
    Color backgroundColor;
    Color textColor;
    String displayText;

    switch (status.toLowerCase()) {
      case 'order successfully':
        backgroundColor = const Color.fromARGB(255, 255, 255, 255);
        textColor = const Color(0xFF4CAF50);
        displayText = 'order successfully';
        break;
      case 'arranging & packing':
        backgroundColor = const Color.fromARGB(255, 255, 255, 255);
        textColor = const Color(0xFFFF9800);
        displayText = 'Arranging & Packing';
        break;
      case 'awaiting design approval':
        backgroundColor = const Color.fromARGB(255, 255, 255, 255);
        textColor = const Color(0xFFFF9800);
        displayText = 'Awaiting Design Approval';
        break;
      case 'flower completed':
        backgroundColor = const Color.fromARGB(255, 255, 255, 255);
        textColor = const Color(0xFF9C27B0);
        displayText = 'Flower Completed';
        break;
      case 'delivery':
        backgroundColor = const Color.fromARGB(255, 255, 255, 255);
        textColor = const Color(0xFF2196F3);
        displayText = 'Delivery';
        break;
      case 'received':
        backgroundColor = const Color.fromARGB(255, 255, 255, 255);
        textColor = const Color.fromARGB(255, 58, 30, 236);
        displayText = 'Received';
        break;
      default:
        backgroundColor = const Color.fromARGB(255, 255, 255, 255);
        textColor = const Color(0xFF757575);
        displayText = status; // Giữ nguyên text
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        displayText,
        style: GoogleFonts.montserrat(
          color: textColor,
          fontWeight: FontWeight.w500,
          fontSize: 13,
        ),
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.only(
                  bottom: MediaQuery.of(context).viewInsets.bottom + 20,
                ),
                child: Container(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Order Filter',
                            style: GoogleFonts.montserrat(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Status filter
                      Text(
                        'Status:',
                        style: GoogleFonts.montserrat(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: [
                          _buildFilterChip(
                            label: 'All',
                            selected: _selectedStatus == OrderStatus.all,
                            onSelected: (selected) {
                              setState(() => _selectedStatus = OrderStatus.all);
                              this.setState(
                                  () => _selectedStatus = OrderStatus.all);
                            },
                          ),
                          _buildFilterChip(
                            label: 'Arranging & Packing',
                            selected: _selectedStatus ==
                                OrderStatus.ArrangingVsPacking,
                            onSelected: (selected) {
                              setState(() => _selectedStatus =
                                  OrderStatus.ArrangingVsPacking);
                              this.setState(() => _selectedStatus =
                                  OrderStatus.ArrangingVsPacking);
                            },
                          ),
                          _buildFilterChip(
                            label: 'Awaiting Design Approval',
                            selected: _selectedStatus ==
                                OrderStatus.AwaitingDesignApproval,
                            onSelected: (selected) {
                              setState(() => _selectedStatus =
                                  OrderStatus.AwaitingDesignApproval);
                              this.setState(() => _selectedStatus =
                                  OrderStatus.AwaitingDesignApproval);
                            },
                          ),
                          _buildFilterChip(
                            label: 'Flower Completed',
                            selected:
                                _selectedStatus == OrderStatus.FlowerCompleted,
                            onSelected: (selected) {
                              setState(() => _selectedStatus =
                                  OrderStatus.FlowerCompleted);
                              this.setState(() => _selectedStatus =
                                  OrderStatus.FlowerCompleted);
                            },
                          ),
                          _buildFilterChip(
                            label: 'Delivery',
                            selected: _selectedStatus == OrderStatus.Delivery,
                            onSelected: (selected) {
                              setState(
                                  () => _selectedStatus = OrderStatus.Delivery);
                              this.setState(
                                  () => _selectedStatus = OrderStatus.Delivery);
                            },
                          ),
                          _buildFilterChip(
                            label: 'Received',
                            selected: _selectedStatus == OrderStatus.Received,
                            onSelected: (selected) {
                              setState(
                                  () => _selectedStatus = OrderStatus.Received);
                              this.setState(
                                  () => _selectedStatus = OrderStatus.Received);
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Date sort
                      Text(
                        'Sort by delivery date:',
                        style: GoogleFonts.montserrat(
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: [
                          _buildFilterChip(
                            label: 'None',
                            selected:
                                _selectedDateSort == DeliveryDateSort.none,
                            onSelected: (selected) {
                              setState(() =>
                                  _selectedDateSort = DeliveryDateSort.none);
                              this.setState(() =>
                                  _selectedDateSort = DeliveryDateSort.none);
                            },
                          ),
                          _buildFilterChip(
                            label: 'Earliest',
                            selected:
                                _selectedDateSort == DeliveryDateSort.earliest,
                            onSelected: (selected) {
                              setState(() => _selectedDateSort =
                                  DeliveryDateSort.earliest);
                              this.setState(() => _selectedDateSort =
                                  DeliveryDateSort.earliest);
                            },
                          ),
                          _buildFilterChip(
                            label: 'Latest',
                            selected:
                                _selectedDateSort == DeliveryDateSort.latest,
                            onSelected: (selected) {
                              setState(() =>
                                  _selectedDateSort = DeliveryDateSort.latest);
                              this.setState(() =>
                                  _selectedDateSort = DeliveryDateSort.latest);
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),

                      // Apply button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          onPressed: () {
                            _loadOrders();
                            Navigator.pop(context);
                          },
                          child: Text(
                            'Apply',
                            style: GoogleFonts.montserrat(
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStaffAssignment(Order order) {
    if (order.staffId == null) {
      return Row(
        children: [
          const Icon(Icons.person_off_outlined, size: 18, color: Colors.red),
          const SizedBox(width: 8),
          Text(
            'Not Assigned',
            style: GoogleFonts.montserrat(
              color: Colors.red,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      );
    } else {
      return Row(
        children: [
          const Icon(Icons.person_outline, size: 18, color: Colors.green),
          const SizedBox(width: 8),
          Text(
            'Assigned',
            style: GoogleFonts.montserrat(
              color: Colors.green,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      );
    }
  }

  Widget _buildFilterChip({
    required String label,
    required bool selected,
    required Function(bool) onSelected,
  }) {
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: onSelected,
      backgroundColor: Colors.grey.shade200,
      selectedColor: Colors.teal.shade100,
      checkmarkColor: Colors.teal,
      labelStyle: GoogleFonts.montserrat(
        color: selected ? Colors.teal.shade700 : Colors.black87,
        fontWeight: selected ? FontWeight.w500 : FontWeight.normal,
      ),
    );
  }

  void _navigateToOrderDetails(Order order) {
    // Navigate to order details screen
    // This would typically be implemented like this:
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StaffOrderDetailScreen(
          orderId: order.orderId,
        ),
      ),
    );

    // For now, just print the order ID
    print('Navigate to details for order: ${order.orderId}');
  }
}

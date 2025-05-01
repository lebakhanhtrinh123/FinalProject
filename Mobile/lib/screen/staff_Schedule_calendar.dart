import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/order_response.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/screen/staff_list_order_screen.dart';
import 'package:flowerops/screen/staff_order_detail_screen.dart';
import 'package:flowerops/services/order_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StaffScheduleCalendar extends StatefulWidget {
  const StaffScheduleCalendar({Key? key}) : super(key: key);

  @override
  State<StaffScheduleCalendar> createState() => _StaffScheduleCalendarState();
}

class _StaffScheduleCalendarState extends State<StaffScheduleCalendar> {
  DateTime _selectedWeekStart = DateTime.now().subtract(
    Duration(days: DateTime.now().weekday - 1),
  );
  final OrderService _orderService = OrderService();
  List<Order> _orders = [];
  bool _isLoading = true;
  String? _staffId;
  int _selectedIndex = 1;

  // Define time slots
  final List<TimeSlot> _morningSlots = [
    TimeSlot(startHour: 8, endHour: 9),
    TimeSlot(startHour: 9, endHour: 10),
    TimeSlot(startHour: 10, endHour: 11),
    TimeSlot(startHour: 11, endHour: 12),
  ];

  final List<TimeSlot> _afternoonSlots = [
    TimeSlot(startHour: 14, endHour: 15),
    TimeSlot(startHour: 15, endHour: 16),
    TimeSlot(startHour: 16, endHour: 17),
    TimeSlot(startHour: 17, endHour: 18),
  ];

  @override
  void initState() {
    super.initState();
    _loadStaffId().then((_) => _loadOrders());
  }

  Future<void> _loadStaffId() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    _staffId = prefs.getString('userId');
    if (_staffId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Staff ID not found')),
      );
    }
  }

  Future<void> _loadOrders() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final startDate =
          _selectedWeekStart.subtract(const Duration(hours: 1, minutes: 30));
      final endDate = _selectedWeekStart.add(const Duration(days: 7));

      // Get all orders
      final orderResponse = await _orderService.getOrdersByStaff();

      // Filter orders for the current week, but consider preparation time
      _orders = orderResponse.data.where((order) {
        final prepTime =(order.deliveryDateTime ?? DateTime.now())
            .subtract(const Duration(hours: 1, minutes: 30));
        return prepTime.isAfter(startDate.subtract(const Duration(days: 1))) &&
            (order.deliveryDateTime ?? DateTime.now()).isBefore(endDate);
      }).toList();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load schedule: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _goToPreviousWeek() {
    setState(() {
      _selectedWeekStart = _selectedWeekStart.subtract(const Duration(days: 7));
    });
    _loadOrders();
  }

  void _goToNextWeek() {
    setState(() {
      _selectedWeekStart = _selectedWeekStart.add(const Duration(days: 7));
    });
    _loadOrders();
  }

  List<Order> _getOrdersForDayAndTime(
      DateTime day, int startHour, int endHour) {
    return _orders.where((order) {
      final preparationTime = (order.deliveryDateTime ?? DateTime.now())
          .subtract(const Duration(hours: 1, minutes: 30));

      final slotStart = DateTime(day.year, day.month, day.day, startHour);
      final slotEnd = DateTime(day.year, day.month, day.day, endHour);

      return preparationTime
              .isAfter(slotStart.subtract(const Duration(minutes: 1))) &&
          preparationTime.isBefore(slotEnd);
    }).toList();
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'arranging & packing':
        return Colors.amber;
      case 'awaiting design approval':
        return Colors.deepOrange;
      case 'flower completed':
        return Colors.purple;
      case 'delivery':
      case 'received':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  void _navigateToOrderDetail(String orderId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => StaffOrderDetailScreen(orderId: orderId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Staff Weekly Schedule'),
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
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                _buildWeekSelector(),
                Expanded(
                  child: SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildTimeTable("Morning", _morningSlots),
                          const SizedBox(height: 16),
                          _buildTimeTable("Afternoon", _afternoonSlots),
                        ],
                      ),
                    ),
                  ),
                ),
                _buildStatusLegend(),
              ],
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

  Widget _buildWeekSelector() {
    final dateFormat = DateFormat('MMM d, yyyy');
    final weekEndDate = _selectedWeekStart.add(const Duration(days: 6));

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.arrow_back_ios),
            onPressed: _goToPreviousWeek,
          ),
          Column(
            children: [
              Text(
                'Week of ${DateFormat('MMMM').format(_selectedWeekStart)}',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${dateFormat.format(_selectedWeekStart)} - ${dateFormat.format(weekEndDate)}',
                style: const TextStyle(fontSize: 14),
              ),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios),
            onPressed: _goToNextWeek,
          ),
        ],
      ),
    );
  }

  Widget _buildTimeTable(String title, List<TimeSlot> timeSlots) {
    // Calculate minimum width to ensure tables are wide enough
    // Each cell should be at least 80 pixels wide, with 8 columns (time + 7 days)
    final minWidth = 8 * 100.0; // 800 pixels minimum

    return Container(
      width: minWidth,
      padding: const EdgeInsets.all(8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 8.0),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Table(
            border: TableBorder.all(color: Colors.grey.shade300),
            columnWidths: const {
              0: FixedColumnWidth(80), // Time column
              1: FixedColumnWidth(100), // Monday
              2: FixedColumnWidth(100), // Tuesday
              3: FixedColumnWidth(100), // Wednesday
              4: FixedColumnWidth(100), // Thursday
              5: FixedColumnWidth(100), // Friday
              6: FixedColumnWidth(100), // Saturday
              7: FixedColumnWidth(100), // Sunday
            },
            defaultVerticalAlignment: TableCellVerticalAlignment.middle,
            children: [
              _buildTableHeader(),
              ...timeSlots.map((slot) => _buildTimeRow(slot)).toList(),
            ],
          ),
        ],
      ),
    );
  }

  TableRow _buildTableHeader() {
    final List<Widget> headers = [
      const TableCell(
        child: Padding(
          padding: EdgeInsets.all(8.0),
          child: Text(
            'Time',
            style: TextStyle(fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    ];

    // Add headers for each day of the week
    for (int i = 0; i < 7; i++) {
      final day = _selectedWeekStart.add(Duration(days: i));
      final dayName = DateFormat('E').format(day); // Mon, Tue, etc.
      final dayDate = DateFormat('d').format(day); // 1, 2, etc.

      headers.add(
        TableCell(
          child: Container(
            padding: const EdgeInsets.all(8.0),
            alignment: Alignment.center,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  dayName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                Text(
                  dayDate,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      );
    }

    return TableRow(children: headers);
  }

  TableRow _buildTimeRow(TimeSlot slot) {
    final List<Widget> cells = [
      TableCell(
        child: Container(
          height: 80,
          padding: const EdgeInsets.all(8.0),
          alignment: Alignment.center,
          child: Text(
            '${slot.startHour}:00\n${slot.endHour}:00',
            style: const TextStyle(fontSize: 12),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    ];

    // Add cells for each day of the week
    for (int i = 0; i < 7; i++) {
      final day = _selectedWeekStart.add(Duration(days: i));
      final ordersInSlot =
          _getOrdersForDayAndTime(day, slot.startHour, slot.endHour);

      if (ordersInSlot.isEmpty) {
        cells.add(
          const TableCell(
            child: SizedBox(
              height: 80,
            ),
          ),
        );
      } else {
        cells.add(
          TableCell(
            child: Container(
              padding: const EdgeInsets.all(4.0),
              constraints: BoxConstraints(
                minHeight: 80,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: ordersInSlot.map((order) {
                  final displayId = order.orderId.length > 6
                      ? '#${order.orderId.substring(0, 6)}...'
                      : '#${order.orderId}';

                  return InkWell(
                    onTap: () => _navigateToOrderDetail(order.orderId),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(4.0),
                      margin: const EdgeInsets.only(bottom: 4.0),
                      decoration: BoxDecoration(
                        color: _getStatusColor(order.status ?? ''),
                        borderRadius: BorderRadius.circular(4.0),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            displayId,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            order.deliveryDateTime != null
                                ? DateFormat('HH:mm')
                                    .format(order.deliveryDateTime!)
                                : 'Not delivered yet',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
        );
      }
    }

    return TableRow(children: cells);
  }

  Widget _buildStatusLegend() {
    final Map<String, Color> statusColors = {
      'Arranging & Packing': Colors.amber,
      'Awaiting Design Approval': Colors.deepOrange,
      'Flower Completed': Colors.purple,
      'Delivery/Received': Colors.blue,
      'Other': Colors.grey,
    };

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 4,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Wrap(
        alignment: WrapAlignment.spaceEvenly,
        spacing: 16.0,
        runSpacing: 8.0,
        children: statusColors.entries.map((entry) {
          return Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: entry.value,
                  borderRadius: BorderRadius.circular(4.0),
                ),
              ),
              const SizedBox(width: 4),
              Text(
                entry.key,
                style: const TextStyle(fontSize: 12),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}

// Model for time slots
class TimeSlot {
  final int startHour;
  final int endHour;

  TimeSlot({required this.startHour, required this.endHour});
}

// Extension to add staffSchedule property to Order class
extension OrderScheduleExtension on Order {
  // Return scheduled work hours based on delivery time
  DateTime get scheduledWorkStart {
    // Staff should start working 2 hours before delivery time for preparation
    return (deliveryDateTime ?? DateTime.now()).subtract(const Duration(hours: 2));
  }

  // Get the estimated end time (assuming 1 hour after delivery for completion)
  DateTime get scheduledWorkEnd {
    return (deliveryDateTime ?? DateTime.now()).add(const Duration(hours: 1));
  }

  // Check if this order requires staff attention during a specific time slot
  bool isWorkingDuring(DateTime day, int startHour, int endHour) {
    final workStart = scheduledWorkStart;
    final workEnd = scheduledWorkEnd;

    // Create DateTime objects for the start and end of the time slot
    final slotStart = DateTime(day.year, day.month, day.day, startHour, 0, 0);
    final slotEnd = DateTime(day.year, day.month, day.day, endHour, 0, 0);

    // Check if the work time overlaps with the time slot
    return (workStart.isBefore(slotEnd) && workEnd.isAfter(slotStart));
  }
}

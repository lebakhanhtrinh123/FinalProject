import 'package:fl_chart/fl_chart.dart';
import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/store_overviewResponse.dart';
import 'package:flowerops/screen/florist_management_screen.dart';
import 'package:flowerops/screen/manager_employee.dart';
import 'package:flowerops/screen/manager_list_order_screen.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/services/store_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StoreOverviewScreen extends StatefulWidget {
  const StoreOverviewScreen({Key? key}) : super(key: key);

  @override
  State<StoreOverviewScreen> createState() => _StoreOverviewScreenState();
}

class _StoreOverviewScreenState extends State<StoreOverviewScreen> {
  StoreService storeService = StoreService();
  StoreOverviewResponse? storeData;
  bool isLoading = true;
  bool isYearView = true;
  int _selectedIndex = 0;

  // Get current month index (0-11)
  int currentMonthIndex = DateTime.now().month - 1;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      isLoading = true;
    });

    try {
      // Fetch data based on view type
      final data =
          await storeService.getStoreOverview(view: isYearView ? 'year' : null);
      setState(() {
        storeData = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }

  // Calculate current month totals (only used when we have data for all months)
  double get currentMonthRevenue {
    if (storeData == null || storeData!.monthlyData.isEmpty) {
      return 0;
    }

    // Find the current month data if available
    final currentMonthData = storeData!.monthlyData.firstWhere(
      (data) => data.month == _getShortMonthName(currentMonthIndex),
      orElse: () => MonthlyData(month: '', investment: 0, loss: 0, profit: 0),
    );

    // For revenue in our model
    return currentMonthData.profit + currentMonthData.investment;
  }

  double get currentMonthLoss {
    if (storeData == null || storeData!.monthlyData.isEmpty) {
      return 0;
    }

    // Find the current month data if available
    final currentMonthData = storeData!.monthlyData.firstWhere(
      (data) => data.month == _getShortMonthName(currentMonthIndex),
      orElse: () => MonthlyData(month: '', investment: 0, loss: 0, profit: 0),
    );

    return currentMonthData.loss;
  }

  double get currentMonthProfit {
    if (storeData == null || storeData!.monthlyData.isEmpty) {
      return 0;
    }

    // Find the current month data if available
    final currentMonthData = storeData!.monthlyData.firstWhere(
      (data) => data.month == _getShortMonthName(currentMonthIndex),
      orElse: () => MonthlyData(month: '', investment: 0, loss: 0, profit: 0),
    );

    return currentMonthData.profit;
  }

  // Helper method to get short month name
  String _getShortMonthName(int monthIndex) {
    final shortMonths = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];

    if (monthIndex >= 0 && monthIndex < shortMonths.length) {
      return shortMonths[monthIndex];
    }
    return '';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Store Overview'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        automaticallyImplyLeading: false,
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
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: _buildSummaryCard(
                            title: 'Total Earning',
                            value: '\$${storeData?.totalEarning ?? 0}',
                            color: const Color(0xFF5E35B1),
                            icon: Icons.account_balance_wallet,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildOrderCard(
                            title: 'Total Order',
                            value: '${storeData?.totalOrders ?? 0}',
                            color: const Color(0xFF2196F3),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    _buildFinancialsCard(),
                    const SizedBox(height: 16),
                    _buildChartCard(),
                  ],
                ),
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.teal,
        unselectedItemColor: Colors.grey,
        type: BottomNavigationBarType.fixed,
        onTap: (index) {
          if (_selectedIndex != index) {
            setState(() {
              _selectedIndex = index;
            });
            switch (index) {
              case 0:
                break;
              case 1:
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => ManagerListOrderScreen()),
                );
                break;
              case 2:
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => FloristManagementScreen()),
                );
                break;
              case 3:
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ProfileScreen()),
                );
                break;
            }
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
            backgroundColor: Colors.teal,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.receipt_long),
            label: 'Orders',
            backgroundColor: Colors.teal,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.manage_accounts),
            label: 'Employee',
            backgroundColor: Colors.teal,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
            backgroundColor: Colors.teal,
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard({
    required String title,
    required String value,
    required Color color,
    required IconData icon,
  }) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: color,
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(icon, color: Colors.white, size: 18),
                  ),
                  const Spacer(),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    overflow: TextOverflow.ellipsis,
                    maxLines: 1,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.7),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrderCard({
    required String title,
    required String value,
    required Color color,
  }) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        height: 130,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: color,
        ),
        child: Stack(
          children: [
            Positioned(
              right: 10,
              bottom: 0,
              top: 0,
              child: SizedBox(
                width: 80,
                child: LineChart(
                  LineChartData(
                    gridData: const FlGridData(show: false),
                    titlesData: const FlTitlesData(show: false),
                    borderData: FlBorderData(show: false),
                    lineBarsData: [
                      LineChartBarData(
                        spots: const [
                          FlSpot(0, 1),
                          FlSpot(1, 2),
                          FlSpot(2, 1.5),
                          FlSpot(3, 3),
                          FlSpot(4, 2.5),
                          FlSpot(5, 2),
                        ],
                        isCurved: true,
                        color: Colors.white,
                        barWidth: 2,
                        isStrokeCapRound: true,
                        dotData: const FlDotData(show: false),
                        belowBarData: BarAreaData(
                          show: true,
                          color: Colors.white.withOpacity(0.2),
                        ),
                      ),
                    ],
                    minX: 0,
                    maxX: 5,
                    minY: 0,
                    maxY: 4,
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.shopping_bag,
                            color: Colors.white, size: 18),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          _buildTimeFilterButton('M', !isYearView),
                          const SizedBox(width: 2),
                          _buildTimeFilterButton('Y', isYearView),
                        ],
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        value,
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.white.withOpacity(0.7),
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

  Widget _buildTimeFilterButton(String text, bool isSelected) {
    return InkWell(
      onTap: () {
        setState(() {
          if (text == 'M') {
            if (isYearView) {
              isYearView = false;
              _loadData(); // Reload data for month view
            }
          } else {
            if (!isYearView) {
              isYearView = true;
              _loadData(); // Reload data for year view
            }
          }
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 10,
            color: isSelected ? Colors.blue : Colors.white,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildFinancialsCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    'Total Revenue',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ),
                Expanded(
                  child: Text(
                    'Total Loss',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ),
                Expanded(
                  child: Text(
                    'Total Profit',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      '\$${(storeData?.totalRevenue ?? 0).toStringAsFixed(1)}',
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      softWrap: false,
                      maxLines: 1,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      '\$${(storeData?.totalLoss ?? 0).toStringAsFixed(1)}',
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      softWrap: false,
                      maxLines: 1,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: Text(
                      '\$${(storeData?.totalProfit ?? 0).toStringAsFixed(1)}',
                      textAlign: TextAlign.center,
                      overflow: TextOverflow.ellipsis,
                      softWrap: false,
                      maxLines: 1,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
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

  Widget _buildChartCard() {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isYearView
                      ? 'Year Financial Overview'
                      : 'Month Financial Overview',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                PopupMenuButton(
                  icon: const Icon(Icons.more_vert),
                  onSelected: (value) {
                    final bool newIsYearView = value == 'year';
                    if (isYearView != newIsYearView) {
                      setState(() {
                        isYearView = newIsYearView;
                      });
                      _loadData(); // Reload data when changing view
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'month',
                      child: Text('Month View'),
                    ),
                    const PopupMenuItem(
                      value: 'year',
                      child: Text('Year View'),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 300,
              child: storeData?.monthlyData.isEmpty ?? true
                  ? const Center(child: Text('No data available'))
                  : BarChart(
                      BarChartData(
                        alignment: BarChartAlignment.spaceAround,
                        maxY: _calculateMaxY(),
                        barTouchData: BarTouchData(
                          enabled: false,
                        ),
                        titlesData: FlTitlesData(
                          show: true,
                          bottomTitles: AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              getTitlesWidget: _getBottomTitles,
                              reservedSize: 30,
                            ),
                          ),
                          leftTitles: const AxisTitles(
                            sideTitles: SideTitles(
                              showTitles: true,
                              reservedSize: 40,
                            ),
                          ),
                          topTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                          rightTitles: const AxisTitles(
                            sideTitles: SideTitles(showTitles: false),
                          ),
                        ),
                        borderData: FlBorderData(show: false),
                        barGroups: _getBarGroups(),
                      ),
                    ),
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _buildLegendItem('Investment', Colors.blue),
                const SizedBox(width: 16),
                _buildLegendItem('Loss', Colors.green),
                const SizedBox(width: 16),
                _buildLegendItem('Profit', Colors.orange),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Calculate maximum Y value for chart based on available data
  double _calculateMaxY() {
    if (storeData == null || storeData!.monthlyData.isEmpty) {
      return 100; // Default value
    }

    double maxValue = 0;
    for (var data in storeData!.monthlyData) {
      double total = data.investment + data.loss + data.profit;
      if (total > maxValue) {
        maxValue = total;
      }
    }

    // Add some margin to the top
    return (maxValue * 1.2).ceilToDouble();
  }

  List<BarChartGroupData> _getBarGroups() {
    if (storeData == null || storeData!.monthlyData.isEmpty) {
      return [];
    }

    List<BarChartGroupData> barGroups = [];

    for (int i = 0; i < storeData!.monthlyData.length; i++) {
      final monthData = storeData!.monthlyData[i];
      barGroups.add(
        BarChartGroupData(
          x: i,
          barRods: [
            BarChartRodData(
              toY: monthData.investment + monthData.loss + monthData.profit,
              width: isYearView
                  ? 15 // Narrower bars for year view with multiple months
                  : 60, // Wider bar for single month view
              borderRadius: BorderRadius.zero,
              rodStackItems: [
                BarChartRodStackItem(0, monthData.investment, Colors.blue),
                BarChartRodStackItem(
                  monthData.investment,
                  monthData.investment + monthData.loss,
                  Colors.green,
                ),
                BarChartRodStackItem(
                  monthData.investment + monthData.loss,
                  monthData.investment + monthData.loss + monthData.profit,
                  Colors.orange,
                ),
              ],
            ),
          ],
        ),
      );
    }

    return barGroups;
  }

  Widget _getBottomTitles(double value, TitleMeta meta) {
    if (storeData == null || storeData!.monthlyData.isEmpty) {
      return const Text('');
    }

    final int index = value.toInt();
    if (index >= 0 && index < storeData!.monthlyData.length) {
      return SideTitleWidget(
        angle: 0,
        child: Text(storeData!.monthlyData[index].month),
        meta: meta,
      );
    }

    return const Text('');
  }

  Widget _buildLegendItem(String title, Color color) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 16,
          color: color,
        ),
        const SizedBox(width: 4),
        Text(title),
      ],
    );
  }
}

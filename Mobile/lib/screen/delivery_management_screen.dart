import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/Courier.dart';
import 'package:flowerops/screen/florist_management_screen.dart';
import 'package:flowerops/screen/profile_screen.dart';
import 'package:flowerops/screen/store_overview_screen.dart';
import 'package:flowerops/services/employee_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DeliveryManagementScreen extends StatefulWidget {
  const DeliveryManagementScreen({super.key});

  @override
  State<DeliveryManagementScreen> createState() => _DeliveryManagementScreenState();
}

class _DeliveryManagementScreenState extends State<DeliveryManagementScreen> 
with SingleTickerProviderStateMixin {
  final EmployeeService _employeeService = EmployeeService();
  List<Courier> _pendingFlorists = [];
  List<Courier> _currentFlorists = [];
  bool _isLoading = true;
  TabController? _tabController;
  int _selectedIndex = 2;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final inactiveFlorists = await _employeeService.getInactiveCourier();
      final activeFlorists = await _employeeService.getActiveCourier();

      setState(() {
        _pendingFlorists = inactiveFlorists;
        _currentFlorists = activeFlorists;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading data: $e');
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Delivery Management'),
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
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Pending Applications'),
            Tab(text: 'Current Florists'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildPendingFloristsList(),
                _buildCurrentFloristsList(),
              ],
            ),
      floatingActionButton: Container(
        child: FloatingActionButton(
          onPressed: _loadData,
          child: const Icon(Icons.refresh),
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
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => StoreOverviewScreen()),
                );
                break;
              case 1:
              Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => FloristManagementScreen()),
                );
                break;
              case 2:
                
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
            icon: Icon(Icons.badge),
            label: 'Florist',
            backgroundColor: Colors.teal,
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.delivery_dining_sharp),
            label: 'Delivery',
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

  Widget _buildPendingFloristsList() {
    if (_pendingFlorists.isEmpty) {
      return const Center(child: Text('No pending Courier applications'));
    }

    return ListView.builder(
      itemCount: _pendingFlorists.length,
      padding: EdgeInsets.only(bottom: 80),
      itemBuilder: (context, index) {
        final florist = _pendingFlorists[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundImage: florist.avatar != null
                          ? NetworkImage(florist.avatar!)
                          : null,
                      child: florist.avatar == null
                          ? Text(florist.fullName.substring(0, 1).toUpperCase())
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            florist.fullName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(florist.email),
                          const SizedBox(height: 4),
                          Text('Phone: ${florist.phone}'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Gender: ${florist.gender ? 'Male' : 'Female'}'),
                    Text(
                        'Birthday: ${DateFormat('dd/MM/yyyy').format(florist.birthday)}'),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.red,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        'Inactive',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.visibility, size: 16),
                        label:
                            const Text('View', style: TextStyle(fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 0),
                        ),
                        onPressed: () => _showEmployeeDetails(florist),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.check_circle, size: 16),
                        label: const Text('Approve',
                            style: TextStyle(fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 0),
                        ),
                        onPressed: () => _approveEmployee(florist),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.cancel, size: 16),
                        label: const Text('Reject',
                            style: TextStyle(fontSize: 12)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 0),
                        ),
                        onPressed: () => _showRejectDialog(florist),
                      ),
                    ),
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildCurrentFloristsList() {
    if (_currentFlorists.isEmpty) {
      return const Center(child: Text('No active florists'));
    }

    return ListView.builder(
      itemCount: _currentFlorists.length,
      itemBuilder: (context, index) {
        final florist = _currentFlorists[index];
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundImage: florist.avatar != null
                          ? NetworkImage(florist.avatar!)
                          : null,
                      child: florist.avatar == null
                          ? Text(florist.fullName.substring(0, 1).toUpperCase())
                          : null,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            florist.fullName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(florist.email),
                          const SizedBox(height: 4),
                          Text('Phone: ${florist.phone}'),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Gender: ${florist.gender ? 'Male' : 'Female'}'),
                    Text(
                        'Birthday: ${DateFormat('dd/MM/yyyy').format(florist.birthday)}'),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        'Active',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Row(
                //   mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                //   children: [
                //     ElevatedButton.icon(
                //       icon: const Icon(Icons.edit),
                //       label: const Text('Update'),
                //       style: ElevatedButton.styleFrom(
                //         backgroundColor: Colors.orange,
                //         foregroundColor: Colors.white,
                //       ),
                //       onPressed: () {
                //         // TODO: Navigate to update screen
                //       },
                //     ),
                //     ElevatedButton.icon(
                //       icon: const Icon(Icons.delete),
                //       label: const Text('Delete'),
                //       style: ElevatedButton.styleFrom(
                //         backgroundColor: Colors.red,
                //         foregroundColor: Colors.white,
                //       ),
                //       onPressed: () {
                //         // TODO: Implement delete functionality
                //       },
                //     ),
                //   ],
                // ),

              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _showEmployeeDetails(Courier employee) async {
    await showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
          child: Container(
            constraints: const BoxConstraints(maxHeight: 600),
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Center(
                    child: CircleAvatar(
                      radius: 60,
                      backgroundImage: employee.avatar != null
                          ? NetworkImage(employee.avatar!)
                          : null,
                      child: employee.avatar == null
                          ? Text(
                              employee.fullName.substring(0, 1).toUpperCase(),
                              style: const TextStyle(fontSize: 40))
                          : null,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildDetailRow('Full Name', employee.fullName),
                  _buildDetailRow('Email', employee.email),
                  _buildDetailRow('Phone', employee.phone),
                  _buildDetailRow('Address', employee.address ?? 'N/A'),
                  _buildDetailRow(
                      'Gender', employee.gender ? 'Male' : 'Female'),
                  _buildDetailRow('Birthday',
                      DateFormat('dd/MM/yyyy').format(employee.birthday)),
                  _buildDetailRow('ID Number', employee.identificationNumber),
                  _buildDetailRow("Number Moto", employee.numberMoto ?? 'N/A'),
                  _buildDetailRow("Color Moto", employee.colorMoto ?? 'N/A'),
                  _buildDetailRow("Moto Type", employee.motoType ?? 'N/A'),
                  _buildDetailRow('Role', employee.roleName),
                  _buildDetailRow(
                      'Status', employee.status ? 'Active' : 'Inactive'),
                  const SizedBox(height: 16),
                  const Text(
                    'ID Card Images',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildIDCardImage(
                          'Front', employee.identificationFontOfPhoto),
                      _buildIDCardImage(
                          'Back', employee.identificationBackOfPhoto),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Center(
                    child: ElevatedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Close'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildIDCardImage(String side, String? imageUrl) {
    return Expanded(
      child: Column(
        children: [
          Text(
            '$side Side',
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: imageUrl != null ? () => _showFullImage(imageUrl) : null,
            child: Container(
              height: 120,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8),
              ),
              child: imageUrl != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return const Center(
                              child: CircularProgressIndicator());
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return const Center(child: Icon(Icons.error));
                        },
                      ),
                    )
                  : const Center(child: Text('No image')),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showFullImage(String imageUrl) async {
    await showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          child: Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.9,
              maxHeight: MediaQuery.of(context).size.height * 0.7,
            ),
            child: Stack(
              children: [
                InteractiveViewer(
                  minScale: 0.5,
                  maxScale: 3.0,
                  child: Image.network(
                    imageUrl,
                    fit: BoxFit.contain,
                    loadingBuilder: (context, child, loadingProgress) {
                      if (loadingProgress == null) return child;
                      return const Center(child: CircularProgressIndicator());
                    },
                    errorBuilder: (context, error, stackTrace) {
                      return const Center(child: Icon(Icons.error, size: 50));
                    },
                  ),
                ),
                Positioned(
                  top: 0,
                  right: 0,
                  child: IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _approveEmployee(Courier employee) async {
    try {
      final success =
          await _employeeService.approveEmployee(employee.employeeId);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Employee approved successfully')),
        );
        _loadData(); // Refresh the lists
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to approve employee')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  Future<void> _showRejectDialog(Courier employee) async {
    final TextEditingController reasonController = TextEditingController();

    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Reject Employee'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Please provide a reason for rejection:'),
              const SizedBox(height: 16),
              TextField(
                controller: reasonController,
                decoration: const InputDecoration(
                  labelText: 'Reason',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                if (reasonController.text.trim().isNotEmpty) {
                  _rejectEmployee(employee, reasonController.text.trim());
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content: Text('Please provide a reason for rejection')),
                  );
                }
              },
              child: const Text('Reject'),
              style: TextButton.styleFrom(foregroundColor: Colors.red),
            ),
          ],
        );
      },
    );
  }

  Future<void> _rejectEmployee(Courier employee, String reason) async {
    try {
      final success =
          await _employeeService.rejectEmployee(employee.employeeId, reason);
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Employee rejected successfully')),
        );
        _loadData(); // Refresh the lists
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to reject employee')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }
}

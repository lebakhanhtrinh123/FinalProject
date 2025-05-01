import 'package:flowerops/model/order_response.dart';
import 'package:flowerops/model/staff_response.dart';
import 'package:flowerops/services/order_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ManagerOrderDetailScreen extends StatefulWidget {
  final String orderId;

  const ManagerOrderDetailScreen({
    Key? key,
    required this.orderId,
  }) : super(key: key);

  @override
  State<ManagerOrderDetailScreen> createState() =>
      _ManagerOrderDetailScreenState();
}

class _ManagerOrderDetailScreenState extends State<ManagerOrderDetailScreen> {
  final OrderService _orderService = OrderService();
  bool _isLoading = true;
  bool _isLoadingStaff = false;
  Order? _order;
  String? _errorMessage;
  List<Staff> _staffList = [];
  String? _selectedStaffId;
  Staff? _assignedStaff;
  String? _staffError;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    await _loadOrderData();

    // Only load staff data if needed based on status
    if (_order != null) {
      final status = _order!.status?.toLowerCase();

      if (status == 'arranging & packing' ||
          status == 'awaiting design approval' ||
          status == 'flower completed' ||
          status == 'delivery' ||
          status == 'received') {
        await _getOrderStaff();
      } else {
        await _loadStaffData();
      }
    }
  }

  Future<Staff?> _getOrderStaff() async {
    try {
      print("_getOrderStaff called for order status: ${_order?.status}");
      setState(() {
        _isLoadingStaff = true;
      });

      final order = await _orderService.getOrderByOrderId(widget.orderId);
      final employeeId = order.staffId;
      print("Staff ID from order: $employeeId");
      if (employeeId == null || employeeId.isEmpty) {
        setState(() {
          _isLoadingStaff = false;
          _assignedStaff = null;
        });
        return null;
      }

      final staff = await _orderService.getEmployeeById(employeeId);

      setState(() {
        _isLoadingStaff = false;
        _assignedStaff = staff;
      });

      return _assignedStaff;
    } catch (e) {
      setState(() {
        _isLoadingStaff = false;
        _staffError = 'Failed to load staff information: $e';
      });
      return null;
    }
  }

  Future<void> _loadStaffData() async {
    try {
      setState(() {
        _isLoadingStaff = true;
      });

      final order = await _orderService.getOrderByOrderId(widget.orderId);
      final currentAssignedStaffId = order.staffId;
      // Lấy danh sách nhân viên từ service
      final staffResponse = await _orderService.getStaffByOrder(widget.orderId);

      setState(() {
        _staffList = staffResponse.data;

        if (_staffList.isNotEmpty) {
          // Kiểm tra nếu đã có nhân viên được gán cho đơn hàng này
          if (currentAssignedStaffId != null &&
              _staffList
                  .any((staff) => staff.employeeId == currentAssignedStaffId)) {
            // Sử dụng nhân viên đã được gán
            _selectedStaffId = currentAssignedStaffId;
          } else {
            // Nếu không có ai được gán, sử dụng nhân viên đầu tiên
            _selectedStaffId = _staffList[0].employeeId;
          }
        } else {
          _selectedStaffId = null; // Không có nhân viên nào
        }

        _isLoadingStaff = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = "Failed to load staff data: $e";
        _isLoadingStaff = false;
      });
    }
  }

  Future<void> _loadOrderData() async {
    try {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });

      final order = await _orderService.getOrderByOrderId(widget.orderId);

      setState(() {
        _order = order;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = "Failed to load order: $e";
        _isLoading = false;
      });
    }
  }

  Future<void> _assignStaffToOrder() async {
    if (_selectedStaffId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a staff member')),
      );
      return;
    }

    try {
      setState(() {
        _isLoadingStaff = true;
      });

      final response = await _orderService.assignStaffToOrder(
          widget.orderId, _selectedStaffId!);

      setState(() {
        _isLoadingStaff = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.data)),
      );

      // Reload staff data to see updated assignments
      await _loadInitialData();
    } catch (e) {
      setState(() {
        _isLoadingStaff = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error assigning staff: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order Details'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadOrderData,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              _errorMessage!,
              style: TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadOrderData,
              child: Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_order == null) {
      return Center(child: Text('No order data found'));
    }

    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildOrderHeader(),

          SizedBox(height: 24),
          _buildDeliveryInformation(),
          SizedBox(height: 24),
          _buildPaymentInformation(),
          SizedBox(height: 24),
          // Display different content based on order type
          _order!.isCustomOrder()
              ? _buildCustomOrderDetails()
              : _buildRegularOrderDetails(),
          SizedBox(height: 24),
          _buildOrderStatus(),
          SizedBox(height: 24),
          _buildStaffSection(),
        ],
      ),
    );
  }

  Widget _buildStaffSection() {
    final status = _order!.status?.toLowerCase();

    // Case 1: Order Successfully - Show staff assignment, allow selection
    if (status == 'order successfully') {
      return _buildStaffAssignment(allowSelection: true);
    }

    // Case 2: Arranging & Packing, Awaiting Design Approval, Flower Completed, Delivery, Received
    // Show assigned staff information
    if (status == 'arranging & packing' ||
        status == 'awaiting design approval' ||
        status == 'flower completed' ||
        status == 'delivery' ||
        status == 'received') {
      return _buildStaffInfo();
    }

    // Case 3: Default - Show staff assignment, but don't allow selection
    return _buildStaffAssignment(allowSelection: false);
  }

  Widget _buildStaffInfo() {
    if (_isLoadingStaff) {
      return Card(
        margin: EdgeInsets.symmetric(vertical: 8),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Assigned Staff',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 16),
              Center(child: CircularProgressIndicator()),
            ],
          ),
        ),
      );
    }

    if (_staffError != null) {
      return Card(
        margin: EdgeInsets.symmetric(vertical: 8),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Assigned Staff',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 16),
              Text(_staffError!, style: TextStyle(color: Colors.red)),
              SizedBox(height: 8),
              ElevatedButton(
                onPressed: _getOrderStaff,
                child: Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_assignedStaff == null) {
      return Card(
        margin: EdgeInsets.symmetric(vertical: 8),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Assigned Staff',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 16),
              Text('No staff assigned to this order'),
            ],
          ),
        ),
      );
    }

    return Card(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Assigned Staff',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            _buildStaffInfoRow('ID', _assignedStaff!.employeeId),
            _buildStaffInfoRow('Name', _assignedStaff!.fullName),
            _buildStaffInfoRow('Email', _assignedStaff!.email),
            if (_assignedStaff!.phone != null)
              _buildStaffInfoRow('Phone', _assignedStaff!.phone!),
          ],
        ),
      ),
    );
  }

  Widget _buildStaffInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }

  Widget _buildStaffAssignment({required bool allowSelection}) {
    if (_isLoadingStaff) {
      return Card(
        margin: EdgeInsets.symmetric(vertical: 8),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Assign Staff',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 16),
              Center(child: CircularProgressIndicator()),
            ],
          ),
        ),
      );
    }

    if (_staffList.isEmpty) {
      return Card(
        margin: EdgeInsets.symmetric(vertical: 8),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Assign Staff',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 16),
              Text('No staff available in this store'),
              SizedBox(height: 8),
              ElevatedButton(
                onPressed: _loadStaffData,
                child: Text('Reload List'),
              ),
            ],
          ),
        ),
      );
    }

    return Card(
      margin: EdgeInsets.symmetric(vertical: 8),
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Assign Staff',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),

            // Dropdown để chọn nhân viên
            Text(
              'Select Staff:',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 8),
            SizedBox(
              width: double.infinity,
              child: DropdownButtonFormField<String>(
                value: _selectedStaffId,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                ),
                hint: Text('Select Staff'),
                items: _staffList.map((staff) {
                  return DropdownMenuItem<String>(
                    value: staff.employeeId,
                    child: Container(
                      constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.7),
                      child: Text(
                        '${staff.email}',
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  );
                }).toList(),
                onChanged: allowSelection
                    ? (value) {
                        setState(() {
                          _selectedStaffId = value;
                        });
                      }
                    : null,
              ),
            ),

            SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: allowSelection ? _assignStaffToOrder : null,
                child: Text('Confirm Assignment'),
              ),
            ),
            if (!allowSelection)
              Padding(
                padding: const EdgeInsets.only(top: 8.0),
                child: Text(
                  'Staff assignment is not available for this order status',
                  style: TextStyle(
                      color: Colors.grey, fontStyle: FontStyle.italic),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderHeader() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order #${_order!.orderId.substring(0, 8)}',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Created: ${_formatDateTime(_order!.createAt)}'),
                SizedBox(height: 4),
                Text(
                  'Total: ${_formatPrice(_order!.orderPrice ?? 0.0)}',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            if (_order!.promotionDiscount != null) ...[
              SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Text(
                      'Promotion: ${_order!.promotionName ?? "N/A"}',
                      style: TextStyle(color: Colors.green),
                      softWrap: true,
                    ),
                  ),
                  SizedBox(width: 8),
                  Text(
                    'Discount: ${_order!.promotionDiscount}%',
                    style: TextStyle(color: Colors.green),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildOrderStatus() {
    Color statusColor;

    switch (_order!.status?.toLowerCase()) {
      case 'order successfully':
        statusColor = Colors.green;
        break;
      case 'arranging & packing':
        statusColor = Colors.amber;
        break;
      case 'awaiting design approval':
        statusColor = Colors.deepOrange;
        break;
      case 'flower completed':
        statusColor = Colors.purple;
        break;
      case 'delivery':
        statusColor = Colors.blue;
        break;
      case 'received':
        statusColor = Colors.blue;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order Status',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Container(
                  width: 16,
                  height: 16,
                  decoration: BoxDecoration(
                    color: statusColor,
                    shape: BoxShape.circle,
                  ),
                ),
                SizedBox(width: 8),
                Text(
                  _order!.status ?? '',
                  style: TextStyle(
                    color: statusColor,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text('Last updated: ${_formatDateTime(_order!.updateAt)}'),
            // if (_order!.staffId != null) ...[
            //   SizedBox(height: 12),
            //   Text('Staff: ${_order!.staffFullName ?? "Unknown"}'),
            //   Text('Staff contact: ${_order!.staffEmail ?? "N/A"} | ${_order!.staffPhone ?? "N/A"}'),
            // ],
          ],
        ),
      ),
    );
  }

  Widget _buildDeliveryInformation() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Delivery Information',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.calendar_today, size: 18),
                SizedBox(width: 8),
                Text('Delivery date: ${_formatDate(_order!.deliveryDateTime)}'),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.access_time, size: 18),
                SizedBox(width: 8),
                Text('Delivery time: ${_formatTime(_order!.deliveryDateTime)}'),
              ],
            ),
            SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.phone, size: 18),
                SizedBox(width: 8),
                Text('Contact: ${_order!.phone}'),
              ],
            ),
            SizedBox(height: 8),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.location_on, size: 18),
                SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Store: ${_order!.storeName ?? "N/A"}'),
                      Text('Address: ${_order!.storeAddress ?? "N/A"}'),
                    ],
                  ),
                ),
              ],
            ),
            if (_order!.note != null && _order!.note!.isNotEmpty) ...[
              SizedBox(height: 12),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.note, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Notes: ${_order!.note}',
                      style: TextStyle(fontStyle: FontStyle.italic),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildPaymentInformation() {
    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Payment Information',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Payment status:'),
                Text(
                  _order!.transfer ?? false ? 'Transferred' : 'Pending',
                  style: TextStyle(
                    color: _order!.transfer ?? false
                        ? Colors.green
                        : Colors.orange,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Refund status:'),
                Text(
                  _order!.refund ?? false ? 'Refunded' : 'No refund',
                  style: TextStyle(
                    color: _order!.refund ?? false ? Colors.red : Colors.grey,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // For custom orders with productCustomResponse
  Widget _buildCustomOrderDetails() {
    final customProduct = _order!.productCustomResponse!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Custom Order Details'),

        // Basic custom product info
        Card(
          elevation: 2,
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  customProduct.productName,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                if (customProduct.description != null) ...[
                  Text('Description: ${customProduct.description}'),
                  SizedBox(height: 8),
                ],
                Text('Quantity: ${customProduct.quantity}'),
                SizedBox(height: 4),
                Text(
                  'Total custom product price: ${_formatPrice(customProduct.totalPrice)}',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ),
        SizedBox(height: 16),

        // Flower Basket details
        _buildFlowerBasketCard(customProduct.flowerBasketResponse),
        SizedBox(height: 16),

        // Style details
        _buildStyleCard(customProduct.styleResponse),
        SizedBox(height: 16),

        // Accessory details
        _buildAccessoryCard(customProduct.accessoryResponse),
        SizedBox(height: 16),

        // Custom flowers
        _buildSectionTitle(
            'Custom Flowers (${customProduct.flowerCustomResponses.length})'),

        ...customProduct.flowerCustomResponses.map((flowerCustom) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildFlowerCustomCard(flowerCustom),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildFlowerBasketCard(FlowerBasketResponse basket) {
    return Card(
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 180,
            width: double.infinity,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: NetworkImage(basket.image),
                fit: BoxFit.cover,
              ),
              borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Flower Basket: ${basket.flowerBasketName}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text('Category: ${basket.categoryName}'),
                SizedBox(height: 4),
                Text('Description: ${basket.decription}'),
                SizedBox(height: 4),
                Text(
                  'Price: ${_formatPrice(basket.price)}',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                SizedBox(height: 4),
                Text(
                    'Quantity limits: Min ${basket.minQuantity} - Max ${basket.maxQuantity}'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStyleCard(StyleResponse style) {
    return Card(
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: NetworkImage(style.image),
                fit: BoxFit.cover,
              ),
              borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Style: ${style.name}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text('Category: ${style.categoryName}'),
                SizedBox(height: 4),
                Text('Description: ${style.description}'),
                SizedBox(height: 4),
                Text('Note: ${style.note}'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccessoryCard(AccessoryResponse accessory) {
    return Card(
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 160,
            width: double.infinity,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: NetworkImage(accessory.image),
                fit: BoxFit.cover,
              ),
              borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
            ),
          ),
          Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Accessory: ${accessory.name}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 8),
                Text('Category: ${accessory.categoryName}'),
                SizedBox(height: 4),
                Text('Description: ${accessory.description}'),
                SizedBox(height: 4),
                Text('Note: ${accessory.note}'),
                SizedBox(height: 4),
                Text(
                  'Price: ${_formatPrice(accessory.price)}',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlowerCustomCard(FlowerCustomResponse flowerCustom) {
    final flower = flowerCustom.flowerResponse;

    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                flower.image,
                width: 100,
                height: 100,
                fit: BoxFit.cover,
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    flower.flowerName,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text('Color: ${flower.color}'),
                  Text('Category: ${flower.categoryName}'),
                  SizedBox(height: 4),
                  Text(
                    'Quantity: ${flowerCustom.quantity}',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                  Text(
                    'Price: ${_formatPrice(flower.price)} x ${flowerCustom.quantity} = ${_formatPrice(flowerCustom.totalPrice)}',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // For regular orders with orderDetails
  Widget _buildRegularOrderDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionTitle('Order Items (${_order!.orderDetails?.length})'),
        ...(_order!.orderDetails ?? []).map((detail) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: _buildOrderDetailCard(detail),
          );
        }).toList(),
        SizedBox(height: 16),
        _buildOrderSummary(),
      ],
    );
  }

  Widget _buildOrderDetailCard(OrderDetail detail) {
    // Calculate discount amount
    final originalPrice = (detail.price ?? 0) * (detail.quantity ?? 0);
    final discountAmount = originalPrice * ((detail.discount ?? 0) / 100);

    return Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                detail.productImage ?? '',
                width: 100,
                height: 100,
                fit: BoxFit.cover,
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    detail.productName ?? '',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Quantity: ${detail.quantity}',
                    style: TextStyle(fontWeight: FontWeight.w500),
                  ),
                  SizedBox(height: 4),
                  Text('Unit price: ${_formatPrice(detail.price ?? 0.0)}'),
                  if ((detail.discount ?? 0) > 0) ...[
                    Text(
                      'Discount: ${detail.discount}% (- ${_formatPrice(discountAmount)})',
                      style: TextStyle(color: Colors.green),
                    ),
                  ],
                  SizedBox(height: 4),
                  Text(
                    'Total: ${_formatPrice(detail.productTotalPrice ?? 0.0)}',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderSummary() {
    // Calculate subtotal, discount, and total
    final subtotal = _order!.orderDetails?.fold<double>(
      0,
      (sum, detail) => sum + (detail.price ?? 0.0) * (detail.quantity ?? 0),
    );

    final discountAmount = _order!.promotionDiscount != null
        ? subtotal ?? 0.0 * (_order!.promotionDiscount! / 100).toDouble()
        : 0.0;

    return Card(
      elevation: 2,
      color: Colors.grey.shade50,
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Order Summary',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Subtotal:'),
                Text(_formatPrice(subtotal ?? 0.0)),
              ],
            ),
            if (_order!.promotionDiscount != null) ...[
              SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Promotion discount (${_order!.promotionDiscount}%):',
                    style: TextStyle(color: Colors.green),
                  ),
                  Text(
                    '- ${_formatPrice(discountAmount)}',
                    style: TextStyle(color: Colors.green),
                  ),
                ],
              ),
            ],
            Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  _formatPrice(_order!.orderPrice ?? 0.0),
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 18,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(
        title,
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Colors.blue.shade800,
        ),
      ),
    );
  }

  String _formatDateTime(DateTime? dateTime) {
    if (dateTime == null) return 'No delivery time yet';
    return DateFormat('MMM dd, yyyy - HH:mm').format(dateTime);
  }

  String _formatDate(DateTime? dateTime) {
    if (dateTime == null) return 'No delivery time yet';
    return DateFormat('MMM dd, yyyy').format(dateTime);
  }

  String _formatTime(DateTime? dateTime) {
    if (dateTime == null) return 'No delivery time yet';
    return DateFormat('HH:mm').format(dateTime);
  }

  String _formatPrice(double price) {
    return NumberFormat.currency(locale: 'vi_VN', symbol: '₫', decimalDigits: 0)
        .format(price);
  }
}

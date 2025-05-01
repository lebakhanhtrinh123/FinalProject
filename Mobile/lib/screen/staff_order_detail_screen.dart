import 'package:flowerops/WIDGETS/notification_icon.dart';
import 'package:flowerops/model/Courier.dart';
import 'package:flowerops/model/order_data.dart';
import 'package:flowerops/model/order_response.dart';
import 'package:flowerops/screen/chat_screen.dart';
import 'package:flowerops/screen/delivery_screen.dart';
import 'package:flowerops/services/delivery_service.dart';
import 'package:flowerops/services/employee_service.dart';
import 'package:flowerops/services/order_service.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

class StaffOrderDetailScreen extends StatefulWidget {
  final String orderId;

  const StaffOrderDetailScreen({
    Key? key,
    required this.orderId,
  }) : super(key: key);
  @override
  State<StaffOrderDetailScreen> createState() => _StaffOrderDetailScreenState();
}

class _StaffOrderDetailScreenState extends State<StaffOrderDetailScreen> {
  final OrderService _orderService = OrderService();
  final EmployeeService _employeeService = EmployeeService();
  final DeliveryService _deliveryService = DeliveryService();

  bool _isLoading = true;
  bool _isLoadingStaff = false;
  bool _isAssigningDelivery = false;
  Order? _order;
  String? _errorMessage;
  String? _selectedStaffId;
  String? _staffError;

  final _pickupLocationController = TextEditingController();
  final _feeController = TextEditingController(text: "0");
  bool _freeShip = true;
  String? _selectedShipperId;
  List<Courier> _availableCouriers = [];

  @override
  void initState() {
    super.initState();
    _loadOrderData();
  }

  @override
  void dispose() {
    _pickupLocationController.dispose();
    _feeController.dispose();
    super.dispose();
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

      if (_order?.delivery == true &&
          _order?.status?.toLowerCase() != 'received') {
        _loadAvailableCouriers();
      }
    } catch (e) {
      setState(() {
        _errorMessage = "Failed to load order: $e";
        _isLoading = false;
      });
    }
  }

  Future<void> _loadAvailableCouriers() async {
    try {
      setState(() {
        _isLoadingStaff = true;
      });

      final couriers = await _employeeService.getActiveCourier();

      setState(() {
        _availableCouriers = couriers;
        _isLoadingStaff = false;
        // Select first courier by default if available
        if (couriers.isNotEmpty && _selectedShipperId == null) {
          _selectedShipperId = couriers.first.employeeId;
        }
      });
    } catch (e) {
      setState(() {
        _staffError = "Failed to load couriers: $e";
        _isLoadingStaff = false;
      });
    }
  }

  Future<void> _assignDelivery() async {
    if (_selectedShipperId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please select a courier')),
      );
      return;
    }

    if (_pickupLocationController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Pickup location is required')),
      );
      return;
    }

    final double fee = double.tryParse(_feeController.text) ?? 0.0;

    try {
      setState(() {
        _isAssigningDelivery = true;
      });

      final result = await _deliveryService.createDelivery(
        orderId: widget.orderId,
        freeShip: _freeShip,
        fee: fee,
        pickupLocation: _pickupLocationController.text,
        shipperId: _selectedShipperId!,
        note: "Order from staff: ${_order?.orderId ?? 'N/A'}",
      );

      setState(() {
        _isAssigningDelivery = false;
      });

      if (_deliveryService.isSuccessResponse(result)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Delivery assigned successfully')),
        );
        // Reload order to show updated status
        _loadOrderData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  'Failed to assign delivery: ${result.message ?? 'Unknown error'}')),
        );
      }
    } catch (e) {
      setState(() {
        _isAssigningDelivery = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error assigning delivery: $e')),
      );
    }
  }

  void _showDeliveryAssignmentDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Assign Delivery'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Free shipping toggle
              SwitchListTile(
                title: Text('Free Shipping'),
                value: _freeShip,
                onChanged: (value) {
                  setState(() {
                    _freeShip = value;
                    Navigator.pop(context);
                    _showDeliveryAssignmentDialog();
                  });
                },
              ),
              SizedBox(height: 16),

              // Fee input (disabled if free shipping)
              TextField(
                controller: _feeController,
                decoration: InputDecoration(
                  labelText: 'Delivery Fee',
                  hintText: 'Enter delivery fee',
                  prefixText: '\$',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                enabled: !_freeShip,
              ),
              SizedBox(height: 16),

              // Pickup location
              TextField(
                controller: _pickupLocationController,
                decoration: InputDecoration(
                  labelText: 'Pickup Location',
                  hintText: 'Enter store address',
                  border: OutlineInputBorder(),
                ),
                maxLines: 2,
              ),
              SizedBox(height: 16),

              // Courier dropdown
              _isLoadingStaff
                  ? Center(child: CircularProgressIndicator())
                  : _availableCouriers.isEmpty
                      ? Text('No couriers available',
                          style: TextStyle(color: Colors.red))
                      : DropdownButtonFormField<String>(
                          decoration: InputDecoration(
                            labelText: 'Select Courier',
                            border: OutlineInputBorder(),
                          ),
                          value: _selectedShipperId,
                          items: _availableCouriers.map((courier) {
                            return DropdownMenuItem<String>(
                              value: courier.employeeId,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    courier.email,
                                    style: TextStyle(fontSize: 14),
                                    softWrap: true,
                                    overflow: TextOverflow.ellipsis,
                                    maxLines: 2,
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                          onChanged: (value) {
                            setState(() {
                              _selectedShipperId = value;
                              Navigator.pop(context);
                              _showDeliveryAssignmentDialog();
                            });
                          },
                        ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: _isAssigningDelivery
                ? null
                : () {
                    Navigator.pop(context);
                    _assignDelivery();
                  },
            child: _isAssigningDelivery
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text('Assign Delivery'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order Details'),
        actions: [
          NotificationIcon(),
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadOrderData,
          ),
        ],
      ),
      body: _buildBody(),
      floatingActionButton: (_order?.delivery == true &&
              _order?.status?.toLowerCase() != 'received' &&
              _order?.status?.toLowerCase() != 'delivery')
          ? FloatingActionButton.extended(
              onPressed: _showDeliveryAssignmentDialog,
              label: Text('Assign Delivery'),
              icon: Icon(Icons.delivery_dining),
            )
          : null,
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
          _buildContactSection(),
        ],
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
            if (_order!.status?.toLowerCase() != 'received') ...[
              SizedBox(height: 16),
              _buildUpdateStatusButton(),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildUpdateStatusButton() {
    // Danh sách trạng thái có thể chuyển đổi dựa trên trạng thái hiện tại
    List<String> availableStatuses = [];

    switch (_order!.status?.toLowerCase()) {
      case 'arranging & packing':
        availableStatuses = [
          'Awaiting Design Approval',
          'Flower Completed',
          'Delivery',
          'Received'
        ];
        break;
      case 'awaiting design approval':
        availableStatuses = ['Flower Completed', 'Delivery', 'Received'];
        break;
      case 'flower completed':
        availableStatuses = ['Delivery', 'Received'];
        break;
      case 'delivery':
        availableStatuses = ['Received'];
        break;
      default:
        availableStatuses = [];
    }

    if (availableStatuses.isEmpty) {
      return SizedBox(); // Không hiển thị nút nếu không có trạng thái nào để cập nhật
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Update Status:',
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: availableStatuses.map((status) {
            return ElevatedButton(
              onPressed: () => _showUpdateStatusConfirmation(status),
              style: ElevatedButton.styleFrom(
                backgroundColor: _getStatusColor(status),
                foregroundColor: Colors.white,
              ),
              child: Text(status),
            );
          }).toList(),
        ),
      ],
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'awaiting design approval':
        return Colors.deepOrange;
      case 'flower completed':
        return Colors.purple;
      case 'delivery':
        return Colors.blue;
      case 'received':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  void _showUpdateStatusConfirmation(String newStatus) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Update Order Status'),
        content:
            Text('Are you sure you want to update the status to "$newStatus"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _updateOrderStatus(newStatus);
            },
            child: Text('Update'),
          ),
        ],
      ),
    );
  }

  Future<void> _updateOrderStatus(String newStatus) async {
    setState(() {
      _isLoading = true;
    });

    bool success =
        await _orderService.updateOrderStatus(widget.orderId, newStatus);

    setState(() {
      _isLoading = false;
    });

    if (success) {
      // Cập nhật thành công
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Order status updated successfully'),
          backgroundColor: Colors.green,
        ),
      );

      _loadOrderData();
    } else {
      // Cập nhật thất bại
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update order status'),
          backgroundColor: Colors.red,
        ),
      );
    }
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
        _buildSectionTitle(
            'Order Items (${_order!.orderDetails?.length ?? 0})'),
        ..._order!.orderDetails?.map((detail) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: _buildOrderDetailCard(detail),
              );
            }).toList() ??
            [],
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

  Widget _buildContactSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(height: 20),
        Text(
          'Contact Customer',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: Colors.teal[700],
          ),
        ),
        SizedBox(height: 12),
        InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => ChatScreen(
                    orderId: _order!.orderId,
                    customerId: _order!.customerId ?? '',
                    employeeId: _order!.staffId!),
              ),
            );
          },
          child: Container(
            padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.teal.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.teal.withOpacity(0.3)),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.chat_bubble_outline,
                  color: Colors.teal[700],
                  size: 24,
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Message ${_order!.customerId}',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.teal[700],
                        ),
                      ),
                      Text(
                        'Send images and updates about this arrangement',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.arrow_forward_ios,
                  color: Colors.grey[400],
                  size: 16,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

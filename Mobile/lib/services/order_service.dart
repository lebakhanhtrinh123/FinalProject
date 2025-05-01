import 'dart:convert';

import 'package:flowerops/model/order_detail_response.dart';
import 'package:flowerops/model/order_response.dart';
import 'package:flowerops/model/staff_response.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

enum OrderStatus {
  all,
  OrderSuccessfully,
  ArrangingVsPacking,
  AwaitingDesignApproval,
  FlowerCompleted,
  Delivery,
  Received,
}

enum DeliveryDateSort {
  none,
  earliest,
  latest,
}

class OrderService {
  final String apiLink =
      "https://customchainflower-ecbrb4bhfrguarb9.southeastasia-01.azurewebsites.net/api";

  Future<OrderResponse> getOrdersByStaff({
    OrderStatus status = OrderStatus.all,
    DeliveryDateSort dateSort = DeliveryDateSort.none,
  }) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? staffId = prefs.getString('userId');

    if (staffId == null) {
      throw Exception("Staff ID not found");
    }

    final url = Uri.parse("$apiLink/Order/GetOrderByStaffId?StaffId=$staffId");
    final response = await http.get(
      url,
      headers: {
        'accept': '*/*',
      },
    );

    if (response.statusCode == 200) {
      final orderResponse = OrderResponse.fromJson(jsonDecode(response.body));

      // Apply status filter if not 'all'
      if (status != OrderStatus.all) {
        final statusString = _getStatusString(status);
        orderResponse.data.removeWhere((order) => order.status != statusString);
      }

      // Apply date sorting if requested
      if (dateSort != DeliveryDateSort.none) {
        orderResponse.data.sort((a, b) {
          final aDate = a.deliveryDateTime;
          final bDate = b.deliveryDateTime;

          if (aDate == null && bDate == null) return 0;
          if (aDate == null) return 1; // null sau
          if (bDate == null) return -1; // null sau

          if (dateSort == DeliveryDateSort.earliest) {
            return aDate.compareTo(bDate);
          } else {
            return bDate.compareTo(aDate);
          }
        });
      }

      return orderResponse;
    } else {
      throw Exception("Failed to load orders: ${response.statusCode}");
    }
  }

  Future<OrderDetailResponse> getOrderById(String orderId) async {
    try {
      final url =
          Uri.parse("$apiLink/Order/GetOrderByOrderId?OrderId=$orderId");
      final response = await http.get(
        url,
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        return OrderDetailResponse.fromJson(jsonDecode(response.body));
      } else {
        throw Exception("Failed to load order details");
      }
    } catch (e) {
      throw Exception("Error fetching order details: $e");
    }
  }

  Future<bool> updateOrderStatus(String orderId, String status) async {
    try {
      final encodedStatus = Uri.encodeComponent(status);
      final url = Uri.parse(
          "$apiLink/Order/UpdateStatusOrderByStaffId?orderId=$orderId&Status=$encodedStatus");
      final response = await http.put(
        url,
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        print("Order status updated successfully");
        return true;
      } else {
        print("Failed to update order status: ${response.body}");
        return false;
      }
    } catch (e) {
      print("Error updating order status: $e");
      return false;
    }
  }

  Future<bool> updateOrderByStoreId(String orderId, String staffId) async {
    try {
      final url = Uri.parse(
          "$apiLink/Order/UpdateOrderByStoreId?orderId=$orderId&StaffId=$staffId");

      final response = await http.put(
        url,
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        print("Order updated successfully");
        return true;
      } else {
        print("Failed to update order: ${response.body}");
        return false;
      }
    } catch (e) {
      print("Error updating order: $e");
      return false;
    }
  }

  Future<OrderResponse> getOrdersByStore({
    OrderStatus status = OrderStatus.all,
    DeliveryDateSort dateSort = DeliveryDateSort.none,
  }) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String? storeId = prefs.getString('storedId');

    if (storeId == null) {
      throw Exception("Store ID not found");
    }

    final url = Uri.parse("$apiLink/Order/GetOrderByStore?StoreId=$storeId");
    final response = await http.get(
      url,
      headers: {
        'accept': '*/*',
      },
    );

    if (response.statusCode == 200) {
      final orderResponse = OrderResponse.fromJson(jsonDecode(response.body));

      // Apply status filter if not 'all'
      if (status != OrderStatus.all) {
        final statusString = _getStatusString(status);
        orderResponse.data.removeWhere((order) => order.status != statusString);
      }

      // Apply date sorting if requested
      if (dateSort != DeliveryDateSort.none) {
        orderResponse.data.sort((a, b) {
          final aDate = a.deliveryDateTime;
          final bDate = b.deliveryDateTime;

          if (aDate == null && bDate == null) return 0;
          if (aDate == null) return 1; // đưa `null` xuống dưới cùng
          if (bDate == null) return -1;

          if (dateSort == DeliveryDateSort.earliest) {
            return aDate.compareTo(bDate);
          } else {
            return bDate.compareTo(aDate);
          }
        });
      }

      return orderResponse;
    } else {
      throw Exception("Failed to load orders: ${response.statusCode}");
    }
  }

  Future<Order> getOrderByOrderId(String orderId) async {
    try {
      final url =
          Uri.parse("$apiLink/Order/GetOrderByOrderId?OrderId=$orderId");
      final response = await http.get(
        url,
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);

        final orderData = jsonResponse['data'];

        if (orderData == null) {
          throw Exception("Order not found");
        }

        final order = Order.fromJson(orderData);

        if (order.isCustomOrder()) {
          print("Retrieved custom order with ID: ${order.orderId}");
        } else if (order.isRegularOrder()) {
          print(
              "Retrieved regular order with ID: ${order.orderId} with ${order.orderDetails?.length ?? 0} items");
        } else {
          print("Warning: Order doesn't appear to be custom or regular");
        }

        return order;
      } else {
        throw Exception("Failed to load order: HTTP ${response.statusCode}");
      }
    } catch (e) {
      print("Error getting order: $e");
      rethrow;
    }
  }

  String _getStatusString(OrderStatus status) {
    switch (status) {
      case OrderStatus.OrderSuccessfully:
        return "Order Successfully";
      case OrderStatus.ArrangingVsPacking:
        return "Arranging & Packing";
      case OrderStatus.AwaitingDesignApproval:
        return "Awaiting Design Approval";
      case OrderStatus.FlowerCompleted:
        return "Flower Completed";
      case OrderStatus.Delivery:
        return "Delivery";
      case OrderStatus.Received:
        return "Received";
      default:
        return "";
    }
  }

  // Lấy danh sách nhân viên của cửa hàng
  Future<StaffResponse> getStaffByOrder(String orderId) async {
    final url = Uri.parse("$apiLink/Order/GetStaffByOrderId?OrderId=$orderId");
    final response = await http.get(
      url,
      headers: {
        'accept': '*/*',
      },
    );

    if (response.statusCode == 200) {
      return StaffResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception("Failed to load staff");
    }
  }

  Future<Staff?> getEmployeeById(String employeeId) async {
    try {
      final url = Uri.parse("$apiLink/employees/Id?id=$employeeId");
      final response = await http.get(
        url,
        headers: {
          'accept': '*/*',
        },
      );

      if (response.statusCode == 200) {
        final jsonResponse = jsonDecode(response.body);
        final staffData = jsonResponse['data'];

        if (staffData == null) {
          throw Exception("Employee not found");
        }

        return Staff.fromJson(staffData);
      } else {
        throw Exception("Failed to load employee: HTTP ${response.statusCode}");
      }
    } catch (e) {
      print("Error getting employee: $e");
      return null;
    }
  }

  // Cập nhật nhân viên cho đơn hàng
  Future<UpdateOrderResponse> assignStaffToOrder(
      String orderId, String staffId) async {
    final url = Uri.parse(
        "$apiLink/Order/UpdateOrderByStoreId?orderId=$orderId&StaffId=$staffId");
    final response = await http.put(
      url,
      headers: {
        'accept': '*/*',
      },
    );

    if (response.statusCode == 200) {
      return UpdateOrderResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception("Failed to assign staff to order");
    }
  }
}

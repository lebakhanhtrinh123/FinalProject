import 'package:flowerops/model/order_detail.dart';

class OrderData {
  final String orderId;
  final double orderPrice;
  
  final String deliveryAddress;
  final String deliveryDistrict;
  final String deliveryCity;
  final String phone;
  final String status;
  final DateTime deliveryDateTime;
  final List<OrderDetail> orderDetails;

  OrderData({
    required this.orderId,
    required this.orderPrice,
    required this.deliveryAddress,
    required this.deliveryDistrict,
    required this.deliveryCity,
    required this.phone,
    required this.status,
    required this.deliveryDateTime,
    required this.orderDetails,
  });
  OrderData copyWith({
    String? status,
  }) {
    return OrderData(
      orderId: orderId,
      orderPrice: orderPrice,
      deliveryAddress: deliveryAddress,
      deliveryDistrict: deliveryDistrict,
      deliveryCity: deliveryCity,
      phone: phone,
      status: status ?? this.status, 
      deliveryDateTime: deliveryDateTime,
      orderDetails: orderDetails,
    );
  }

  factory OrderData.fromJson(Map<String, dynamic> json) {
    return OrderData(
      orderId: json['orderId'],
      orderPrice: json['orderPrice'].toDouble(),
      deliveryAddress: json['deliveryAddress'],
      deliveryDistrict: json['deliveryDistrict'],
      deliveryCity: json['deliveryCity'],
      phone: json['phone'],
      status: json['status'],
      deliveryDateTime: DateTime.parse(json['deliveryDateTime']),
      orderDetails: List<OrderDetail>.from(
        json['orderDetails'].map((x) => OrderDetail.fromJson(x))),
    );
  }
}
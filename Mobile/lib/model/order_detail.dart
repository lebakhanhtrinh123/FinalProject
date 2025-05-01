class OrderDetail {
  final String orderDetailId;
  final String productId;
  final String productName;
  final String productImage;
  final double price;
  final double discount;
  final double productTotalPrice;
  final int quantity;
  final String orderId;
  final DateTime createAt;
  final DateTime? updateAt;
  final bool status;

  OrderDetail({
    required this.orderDetailId,
    required this.productId,
    required this.productName,
    required this.productImage,
    required this.price,
    required this.discount,
    required this.productTotalPrice,
    required this.quantity,
    required this.orderId,
    required this.createAt,
    this.updateAt,
    required this.status,
  });

  factory OrderDetail.fromJson(Map<String, dynamic> json) {
    return OrderDetail(
      orderDetailId: json['orderDetailId'],
      productId: json['productId'],
      productName: json['productName'],
      productImage: json['productImage'],
      price: json['price'].toDouble(),
      discount: json['discount'].toDouble(),
      productTotalPrice: json['productTotalPrice'].toDouble(),
      quantity: json['quantity'],
      orderId: json['orderId'],
      createAt: DateTime.parse(json['createAt']),
      updateAt: json['updateAt'] != null 
          ? DateTime.parse(json['updateAt'])
          : null,
      status: json['status'],
    );
  }
}
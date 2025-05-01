class OrderResponse {
  final List<Order> data;
  final dynamic additionalData;
  final String? message;
  final int statusCode;
  final String code;

  OrderResponse({
    required this.data,
    this.additionalData,
    this.message,
    required this.statusCode,
    required this.code,
  });

  factory OrderResponse.fromJson(Map<String, dynamic> json) {
    return OrderResponse(
      data: (json['data'] as List)
          .map((item) => Order.fromJson(item))
          .toList(),
      additionalData: json['additionalData'],
      message: json['message'],
      statusCode: json['statusCode'],
      code: json['code'],
    );
  }
}

class Order {
  final String orderId;
  final double? orderPrice;
  final String? productCustomId;
  final ProductCustomResponse? productCustomResponse;
  final String? customerId;
  final String? staffId;
  final String? staffFullName;
  final String? staffEmail;
  final String? staffPhone;
  final String? promotionId;
  final String? promotionName;
  final int? promotionDiscount;
  final String? deliveryDistrict;
  final String? deliveryCity;
  final String? deliveryAddress;
  final String? storeId;
  final String? storeName;
  final String? storeAddress;
  final String? note;
  final DateTime? deliveryDateTime;
  final String? phone;
  final bool? transfer;
  final bool? delivery;
  final String? paymentId;
  final double? paymentPrice;
  final String? paymentStatus;
  final DateTime? paymentCreateAt;
  final String? paymentMethod;
  final bool? refund;
  final DateTime? createAt;
  final DateTime? updateAt;
  final String? status;
  final List<OrderDetail>? orderDetails;

  Order({
    required this.orderId,
    this.orderPrice,
    this.productCustomId,
    this.productCustomResponse,
    this.customerId,
    this.staffId,
    this.staffFullName,
    this.staffEmail,
    this.staffPhone,
    this.promotionId,
    this.promotionName,
    this.promotionDiscount,
    this.deliveryDistrict,
    this.deliveryCity,
    this.deliveryAddress,
    this.storeId,
    this.storeName,
    this.storeAddress,
    this.note,
    this.deliveryDateTime,
    this.phone,
    this.transfer,
    this.delivery,
    this.paymentId,
    this.paymentPrice,
    this.paymentStatus,
    this.paymentCreateAt,
    this.paymentMethod,
    this.refund,
    this.createAt,
    this.updateAt,
    this.status,
    this.orderDetails,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      orderId: json['orderId'],
      orderPrice: json['orderPrice'] != null
          ? (json['orderPrice'] is int ? (json['orderPrice'] as int).toDouble() : json['orderPrice'])
          : null,
      productCustomId: json['productCustomId'],
      productCustomResponse: json['productCustomResponse'] != null
          ? ProductCustomResponse.fromJson(json['productCustomResponse'])
          : null,
      customerId: json['customerId'],
      staffId: json['staffId'],
      staffFullName: json['staffFullName'],
      staffEmail: json['staffEmail'],
      staffPhone: json['staffPhone'],
      promotionId: json['promotionId'],
      promotionName: json['promotionName'],
      promotionDiscount: json['promotionDiscount'],
      deliveryDistrict: json['deliveryDistrict'],
      deliveryCity: json['deliveryCity'],
      deliveryAddress: json['deliveryAddress'],
      storeId: json['storeId'],
      storeName: json['storeName'],
      storeAddress: json['storeAddress'],
      note: json['note'],
      deliveryDateTime: json['deliveryDateTime'] != null ? DateTime.tryParse(json['deliveryDateTime']) : null,
      phone: json['phone'],
      transfer: json['transfer'],
      delivery: json['delivery'],
      paymentId: json['paymentId'],
      paymentPrice: json['paymentPrice'] != null
          ? (json['paymentPrice'] is int ? (json['paymentPrice'] as int).toDouble() : json['paymentPrice'])
          : null,
      paymentStatus: json['paymentStatus'],
      paymentCreateAt: json['paymentCreateAt'] != null ? DateTime.tryParse(json['paymentCreateAt']) : null,
      paymentMethod: json['paymentMethod'],
      refund: json['refund'],
      createAt: json['createAt'] != null ? DateTime.tryParse(json['createAt']) : null,
      updateAt: json['updateAt'] != null ? DateTime.tryParse(json['updateAt']) : null,
      status: json['status'],
      orderDetails: json['orderDetails'] != null
          ? (json['orderDetails'] as List).map((e) => OrderDetail.fromJson(e)).toList()
          : null,
    );
  }

  bool isCustomOrder() {
    return productCustomId != null && productCustomResponse != null;
  }

  bool isRegularOrder() {
    return orderDetails != null && orderDetails!.isNotEmpty;
  }
}

class OrderDetail {
  final String orderDetailId;
  final String? productId;
  final String? productName;
  final String? productImage;
  final double? price;
  final int? discount;
  final double? productTotalPrice;
  final int? quantity;
  final String? orderId;
  final DateTime? createAt;
  final DateTime? updateAt;
  final bool? status;

  OrderDetail({
    required this.orderDetailId,
    this.productId,
    this.productName,
    this.productImage,
    this.price,
    this.discount,
    this.productTotalPrice,
    this.quantity,
    this.orderId,
    this.createAt,
    this.updateAt,
    this.status,
  });

  factory OrderDetail.fromJson(Map<String, dynamic> json) {
    return OrderDetail(
      orderDetailId: json['orderDetailId'],
      productId: json['productId'],
      productName: json['productName'],
      productImage: json['productImage'],
      price: json['price'] != null
          ? (json['price'] is int
              ? (json['price'] as int).toDouble()
              : json['price'])
          : null,
      discount: json['discount'],
      productTotalPrice: json['productTotalPrice'] != null
          ? (json['productTotalPrice'] is int
              ? (json['productTotalPrice'] as int).toDouble()
              : json['productTotalPrice'])
          : null,
      quantity: json['quantity'],
      orderId: json['orderId'],
      createAt: json['createAt'] != null ? DateTime.parse(json['createAt']) : null,
      updateAt: json['updateAt'] != null ? DateTime.parse(json['updateAt']) : null,
      status: json['status'],
    );
  }
}
class ProductCustomResponse {
  final String productCustomId;
  final String productName;
  final FlowerBasketResponse flowerBasketResponse;
  final StyleResponse styleResponse;
  final AccessoryResponse accessoryResponse;
  final List<FlowerCustomResponse> flowerCustomResponses;
  final int quantity;
  final double totalPrice;
  final String? description;
  final String customerId;
  final DateTime createAt;
  final DateTime updateAt;
  final bool status;

  ProductCustomResponse({
    required this.productCustomId,
    required this.productName,
    required this.flowerBasketResponse,
    required this.styleResponse,
    required this.accessoryResponse,
    required this.flowerCustomResponses,
    required this.quantity,
    required this.totalPrice,
    this.description,
    required this.customerId,
    required this.createAt,
    required this.updateAt,
    required this.status,
  });

  factory ProductCustomResponse.fromJson(Map<String, dynamic> json) {
    return ProductCustomResponse(
      productCustomId: json['productCustomId'],
      productName: json['productName'],
      flowerBasketResponse: FlowerBasketResponse.fromJson(json['flowerBasketResponse']),
      styleResponse: StyleResponse.fromJson(json['styleResponse']),
      accessoryResponse: AccessoryResponse.fromJson(json['accessoryResponse']),
      flowerCustomResponses: (json['flowerCustomResponses'] as List)
          .map((item) => FlowerCustomResponse.fromJson(item))
          .toList(),
      quantity: json['quantity'],
      totalPrice: json['totalPrice'] is int 
          ? (json['totalPrice'] as int).toDouble() 
          : json['totalPrice'],
      description: json['description'],
      customerId: json['customerId'],
      createAt: DateTime.parse(json['createAt']),
      updateAt: DateTime.parse(json['updateAt']),
      status: json['status'],
    );
  }
}

class FlowerBasketResponse {
  final String flowerBasketId;
  final String flowerBasketName;
  final int maxQuantity;
  final int minQuantity;
  final int quantity;
  final String image;
  final String categoryName;
  final double price;
  final String decription;
  final bool? feature;
  final bool status;
  final dynamic sold;
  final DateTime createAt;
  final DateTime updateAt;

  FlowerBasketResponse({
    required this.flowerBasketId,
    required this.flowerBasketName,
    required this.maxQuantity,
    required this.minQuantity,
    required this.quantity,
    required this.image,
    required this.categoryName,
    required this.price,
    required this.decription,
    required this.feature,
    required this.status,
    this.sold,
    required this.createAt,
    required this.updateAt,
  });

  factory FlowerBasketResponse.fromJson(Map<String, dynamic> json) {
    return FlowerBasketResponse(
      flowerBasketId: json['flowerBasketId'],
      flowerBasketName: json['flowerBasketName'],
      maxQuantity: json['maxQuantity'],
      minQuantity: json['minQuantity'],
      quantity: json['quantity'],
      image: json['image'],
      categoryName: json['categoryName'],
      price: json['price'] is int ? (json['price'] as int).toDouble() : json['price'],
      decription: json['decription'],
      feature: json['feature'],
      status: json['status'],
      sold: json['sold'],
      createAt: DateTime.parse(json['createAt']),
      updateAt: DateTime.parse(json['updateAt']),
    );
  }
}

class StyleResponse {
  final String styleId;
  final String name;
  final String note;
  final String description;
  final String? categoryName; // Thay đổi từ non-nullable sang nullable
  final String image;
  final DateTime createAt;
  final DateTime updateAt;
  final bool status;
  final bool? feature;

  StyleResponse({
    required this.styleId,
    required this.name,
    required this.note,
    required this.description,
    this.categoryName, // Cập nhật lại thuộc tính
    required this.image,
    required this.createAt,
    required this.updateAt,
    required this.status,
    required this.feature,
  });

  factory StyleResponse.fromJson(Map<String, dynamic> json) {
    return StyleResponse(
      styleId: json['styleId'],
      name: json['name'],
      note: json['note'],
      description: json['description'],
      categoryName: json['categoryName'],
      image: json['image'],
      createAt: DateTime.parse(json['createAt']),
      updateAt: DateTime.parse(json['updateAt']),
      status: json['status'],
      feature: json['feature'],
    );
  }
}

class AccessoryResponse {
  final String accessoryId;
  final String name;
  final String note;
  final double price;
  final String? categoryName; // Thay đổi từ non-nullable sang nullable
  final String description;
  final String image;
  final DateTime? createAt;
  final DateTime? updateAt;
  final bool status;
  final bool? feature;

  AccessoryResponse({
    required this.accessoryId,
    required this.name,
    required this.note,
    required this.price,
    this.categoryName, // Cập nhật lại thuộc tính
    required this.description,
    required this.image,
    this.createAt,
    this.updateAt,
    required this.status,
    required this.feature,
  });

  factory AccessoryResponse.fromJson(Map<String, dynamic> json) {
    return AccessoryResponse(
      accessoryId: json['accessoryId'],
      name: json['name'],
      note: json['note'],
      price: json['price'] is int ? (json['price'] as int).toDouble() : json['price'],
      categoryName: json['categoryName'],
      description: json['description'],
      image: json['image'],
      createAt: json['createAt'] != null ? DateTime.parse(json['createAt']) : null,
      updateAt: json['updateAt'] != null ? DateTime.parse(json['updateAt']) : null,
      status: json['status'],
      feature: json['feature'],
    );
  }
}

class FlowerCustomResponse {
  final String flowerCustomId;
  final String flowerId;
  final FlowerResponse flowerResponse;
  final int quantity;
  final double totalPrice;
  final DateTime createAt;
  final DateTime updateAt;
  final bool status;

  FlowerCustomResponse({
    required this.flowerCustomId,
    required this.flowerId,
    required this.flowerResponse,
    required this.quantity,
    required this.totalPrice,
    required this.createAt,
    required this.updateAt,
    required this.status,
  });

  factory FlowerCustomResponse.fromJson(Map<String, dynamic> json) {
    return FlowerCustomResponse(
      flowerCustomId: json['flowerCustomId'],
      flowerId: json['flowerId'],
      flowerResponse: FlowerResponse.fromJson(json['flowerResponse']),
      quantity: json['quantity'],
      totalPrice: json['totalPrice'] is int 
          ? (json['totalPrice'] as int).toDouble() 
          : json['totalPrice'],
      createAt: DateTime.parse(json['createAt']),
      updateAt: DateTime.parse(json['updateAt']),
      status: json['status'],
    );
  }
}

class FlowerResponse {
  final String flowerId;
  final String flowerName;
  final double price;
  final String color;
  final String image;
  final int quantity;
  final String categoryName;
  final String description;
  final dynamic sold;
  final bool? feature;
  final bool status;

  FlowerResponse({
    required this.flowerId,
    required this.flowerName,
    required this.price,
    required this.color,
    required this.image,
    required this.quantity,
    required this.categoryName,
    required this.description,
    this.sold,
    required this.feature,
    required this.status,
  });

  factory FlowerResponse.fromJson(Map<String, dynamic> json) {
    return FlowerResponse(
      flowerId: json['flowerId'],
      flowerName: json['flowerName'],
      price: json['price'] is int ? (json['price'] as int).toDouble() : json['price'],
      color: json['color'],
      image: json['image'],
      quantity: json['quantity'],
      categoryName: json['categoryName'],
      description: json['description'],
      sold: json['sold'],
      feature: json['feature'],
      status: json['status'],
    );
  }
}
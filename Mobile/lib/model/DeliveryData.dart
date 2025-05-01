class DeliveryData {
  String? deliveryId;
  String? orderId;
  String? shipperId;
  bool? freeShip;
  int? fee;
  String? note;
  String? pickupLocation;
  String? customerName;
  String? customerPhone;
  String? deliveryLocation;
  DateTime? deliveryTime;
  DateTime? timeDone;
  String? deliveryImage;
  String? status;

  DeliveryData({
    this.deliveryId,
    this.orderId,
    this.shipperId,
    this.freeShip,
    this.fee,
    this.note,
    this.pickupLocation,
    this.customerName,
    this.customerPhone,
    this.deliveryLocation,
    this.deliveryTime,
    this.timeDone,
    this.deliveryImage,
    this.status,
  });

  factory DeliveryData.fromJson(Map<String, dynamic> json) => DeliveryData(
        deliveryId: json["deliveryId"],
        orderId: json["orderId"],
        shipperId: json["shipperId"],
        freeShip: json["freeShip"],
        fee: json["fee"],
        note: json["note"],
        pickupLocation: json["pickupLocation"],
        customerName: json["customerName"],
        customerPhone: json["customerPhone"],
        deliveryLocation: json["deliveryLocation"],
        deliveryTime: json["deliveryTime"] == null
            ? null
            : DateTime.parse(json["deliveryTime"]),
        timeDone:
            json["timeDone"] == null ? null : DateTime.parse(json["timeDone"]),
        deliveryImage: json["deliveryImage"],
        status: json["status"],
      );
}
import 'dart:async';
import 'dart:convert';

import 'package:flowerops/model/DeliveryData.dart';
import 'package:flowerops/screen/delivery_complate_screen.dart';
import 'package:flowerops/services/delivery_service.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:intl/intl.dart';
import 'package:location/location.dart';
import 'package:flowerops/model/DeliveryDetailResponse.dart';
import 'package:flowerops/services/location_service.dart';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:http/http.dart' as http;

class DeliveryScreen extends StatefulWidget {
  final String deliveryId;
  const DeliveryScreen({
    Key? key,
    required this.deliveryId,
  }) : super(key: key);
  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> {
  final Completer<GoogleMapController> _controller = Completer();
  final LocationService _locationService = LocationService();
  LatLng? pickupLatLng;
  LatLng? deliveryLatLng;
  bool hasValidPickupLocation = false;
  bool hasValidDeliveryLocation = false;
  final String google_api_key = "AIzaSyB3BgUHYhx35MirOPlbjHgNsoBODje-0xY";
  bool isUserInteracting = false;
  double currentZoomLevel = 14.5;
  final DeliveryService _deliveryService = DeliveryService();
  bool isLoading = true;
  DeliveryData? deliveryDetail;
  String? error;
  bool _firstLocationUpdate = true;
  bool shouldFollowCurrentLocation = false;

  String estimatedDistance = '';
  String estimatedDuration = '';

  Future<DeliveryDetailResponse> _getMockDeliveryData() async {
    // Giả lập delay của network request
    await Future.delayed(const Duration(seconds: 1));

    final mockData = DeliveryData(
        deliveryId: "DEL001",
        orderId: "ORD001",
        shipperId: "SHP001",
        freeShip: false,
        fee: 35000,
        note: "Gọi trước khi giao",
        pickupLocation:
            "15-1 Lê Văn Việt, khu phố 5, Quận 9, Hồ Chí Minh, Việt Nam",
        customerName: "Nguyễn Văn A",
        customerPhone: "0923456789",
        deliveryLocation: "182 Trần Phú, Phường 9, Quận 5",
        deliveryTime: DateTime.now(),
        status: "PENDING");

    return DeliveryDetailResponse(
        data: mockData, message: "Success", statusCode: 200, code: "OK");
  }

  Future<void> _loadDeliveryDetail() async {
    try {
      // Cập nhật state để hiển thị loading
      setState(() {
        isLoading = true;
        error = null;
      });

      // Lấy thông tin delivery từ service
      final response =
          await _deliveryService.getDeliveryById(widget.deliveryId);
      // final response = await _getMockDeliveryData();

      if (response.data == null) {
        setState(() {
          error = 'Không tìm thấy thông tin đơn hàng';
          isLoading = false;
        });
        return;
      }

      // Lưu delivery detail
      setState(() {
        deliveryDetail = response.data;
      });

      // Xử lý địa điểm lấy hàng
      if (deliveryDetail?.pickupLocation?.isNotEmpty == true) {
        final pickupResult = await _locationService
            .getLatLngFromAddress(deliveryDetail!.pickupLocation!);

        if (pickupResult.success && pickupResult.location != null) {
          setState(() {
            pickupLatLng = pickupResult.location;
            hasValidPickupLocation = true;
          });
        } else {
          print('Lỗi lấy tọa độ điểm lấy hàng: ${pickupResult.error}');
          setState(() {
            hasValidPickupLocation = false;
          });
        }
      }

      await Future.delayed(const Duration(seconds: 1));

      // Xử lý địa điểm giao hàng
      if (deliveryDetail?.deliveryLocation?.isNotEmpty == true) {
        final deliveryResult = await _locationService
            .getLatLngFromAddress(deliveryDetail!.deliveryLocation!);

        if (deliveryResult.success && deliveryResult.location != null) {
          setState(() {
            deliveryLatLng = deliveryResult.location;
            hasValidDeliveryLocation = true;
          });
        } else {
          print('Lỗi lấy tọa độ điểm giao hàng: ${deliveryResult.error}');
          setState(() {
            hasValidDeliveryLocation = false;
          });
        }
      }

      // Cập nhật state cuối cùng
      setState(() {
        isLoading = false;
      });

      // Vẽ đường đi nếu có đủ 2 điểm
      if (hasValidPickupLocation && hasValidDeliveryLocation) {
        await getDirectionsData();
      } else {
        // Nếu không có đủ 2 điểm, có thể hiển thị thông báo
        print('Không thể vẽ đường đi do thiếu tọa độ điểm đầu hoặc điểm cuối');
      }
    } catch (e) {
      print('Lỗi trong _loadDeliveryDetail: $e');
      setState(() {
        error = 'Đã có lỗi xảy ra: ${e.toString()}';
        isLoading = false;
      });
    }
  }

  List<LatLng> polylineCoordinates = [];
  LocationData? currentLocation;

  double bottomSheetHeight = 400;
  final double minHeight = 400;
  final double maxHeight = 600;

  Future<void> getDirectionsData() async {
    if (pickupLatLng == null || deliveryLatLng == null) return;

    final String url = 'https://maps.googleapis.com/maps/api/directions/json'
        '?origin=${pickupLatLng!.latitude},${pickupLatLng!.longitude}'
        '&destination=${deliveryLatLng!.latitude},${deliveryLatLng!.longitude}'
        '&mode=driving'
        '&key=$google_api_key';

    try {
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['status'] == 'OK') {
          // Get route information
          final route = data['routes'][0];
          final leg = route['legs'][0];

          // Update distance and duration
          setState(() {
            estimatedDistance = leg['distance']['text'];
            estimatedDuration = leg['duration']['text'];
          });

          // Get polyline points
          final polylinePoints = PolylinePoints();
          final String encodedPoints = route['overview_polyline']['points'];
          final points = polylinePoints.decodePolyline(encodedPoints);

          polylineCoordinates = points
              .map((point) => LatLng(point.latitude, point.longitude))
              .toList();

          setState(() {});
        }
      }
    } catch (e) {
      print('Error getting directions: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    _loadDeliveryDetail();
    getDirectionsData();
    getCurrentLocation();
    setCustomMarkerIcon();
  }

  BitmapDescriptor curentLocationIcon = BitmapDescriptor.defaultMarker;
  void setCustomMarkerIcon() async {
    curentLocationIcon = await BitmapDescriptor.asset(
        ImageConfiguration(devicePixelRatio: 2.0), "images/icon_moto.png");
    setState(() {});
  }

  void getCurrentLocation() async {
    Location location = Location();
    location.getLocation().then((location) {
      currentLocation = location;
      setState(() {});
    });

    GoogleMapController googleMapController = await _controller.future;

    if (pickupLatLng != null) {
      googleMapController.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(
            zoom: currentZoomLevel,
            target: pickupLatLng!,
          ),
        ),
      );
    }

    location.onLocationChanged.listen((newLoc) {
      currentLocation = newLoc;

      if (shouldFollowCurrentLocation && !isUserInteracting) {
        googleMapController.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              zoom: currentZoomLevel,
              target: LatLng(newLoc.latitude!, newLoc.longitude!),
            ),
          ),
        );
      }
      setState(() {});
    });
  }

  void toggleLocationFollowing() async {
    // Lấy controller
    final GoogleMapController controller = await _controller.future;

    if (!shouldFollowCurrentLocation) {
      // Nếu đang tắt, bật lên và di chuyển camera đến vị trí hiện tại
      if (currentLocation != null) {
        controller.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              zoom: currentZoomLevel,
              target: LatLng(
                  currentLocation!.latitude!, currentLocation!.longitude!),
            ),
          ),
        );
      }
    } else {
      // Nếu đang bật, tắt đi và trở về vị trí pickup
      if (pickupLatLng != null) {
        controller.animateCamera(
          CameraUpdate.newCameraPosition(
            CameraPosition(
              zoom: currentZoomLevel,
              target: pickupLatLng!,
            ),
          ),
        );
      }
    }

    setState(() {
      shouldFollowCurrentLocation = !shouldFollowCurrentLocation;
    });
  }

  void getPolypoints() async {
    try {
      PolylinePoints polylinePoints = PolylinePoints();
      final request = PolylineRequest(
        origin: PointLatLng(pickupLatLng!.latitude, pickupLatLng!.longitude),
        destination:
            PointLatLng(deliveryLatLng!.latitude, deliveryLatLng!.longitude),
        mode: TravelMode.driving,
      );

      final result = await polylinePoints
          .getRouteBetweenCoordinates(
        request: request,
        googleApiKey: google_api_key,
      )
          .timeout(
        const Duration(seconds: 10),
        onTimeout: () {
          throw TimeoutException('The request timed out');
        },
      );

      if (result.points.isNotEmpty) {
        polylineCoordinates = result.points
            .map((point) => LatLng(point.latitude, point.longitude))
            .toList();
        if (mounted) {
          setState(() {});
        }
      }
    } catch (e) {
      print("Error getting polypoints: $e");
    }
  }

  void _onMapCreated(GoogleMapController controller) {
    if (!_controller.isCompleted) {
      _controller.complete(controller);
    }
  }

  Widget _buildDistanceAndDuration() {
    if (estimatedDistance.isEmpty || estimatedDuration.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          Column(
            children: [
              const Icon(Icons.directions_car, color: Color(0xFF008080)),
              const SizedBox(height: 4),
              Text(
                estimatedDistance,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Text(
                'Distance',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          Container(
            height: 40,
            width: 1,
            color: Colors.grey[300],
          ),
          Column(
            children: [
              const Icon(Icons.access_time, color: Color(0xFF008080)),
              const SizedBox(height: 4),
              Text(
                estimatedDuration,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Text(
                'Duration',
                style: TextStyle(
                  color: Colors.grey,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Map
          currentLocation == null
              ? const Center(child: Text("Loading"))
              : GoogleMap(
                  onMapCreated: _onMapCreated,
                  initialCameraPosition: CameraPosition(
                    target: pickupLatLng ?? LatLng(10.762622, 106.660172),
                    zoom: currentZoomLevel,
                  ),
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  onCameraMove: (CameraPosition position) {
                    isUserInteracting = true;
                    currentZoomLevel = position.zoom;
                  },
                  onCameraIdle: () {
                    isUserInteracting = false;
                  },
                  polylines: {
                    Polyline(
                      polylineId: const PolylineId("route"),
                      points: polylineCoordinates,
                      color: Colors.blue,
                      width: 6,
                    ),
                  },
                  markers: {
                    if (currentLocation != null)
                      Marker(
                        markerId: const MarkerId("currentLocation"),
                        icon: curentLocationIcon,
                        position: LatLng(
                          currentLocation!.latitude!,
                          currentLocation!.longitude!,
                        ),
                      ),
                    if (pickupLatLng != null)
                      Marker(
                        markerId: const MarkerId('pickup'),
                        position: pickupLatLng!,
                        infoWindow: const InfoWindow(title: 'Pickup Location'),
                      ),
                    if (deliveryLatLng != null)
                      Marker(
                        markerId: const MarkerId('delivery'),
                        position: deliveryLatLng!,
                        infoWindow:
                            const InfoWindow(title: 'Delivery Location'),
                      ),
                  },
                ),

          //Zoom In và Zoom Out
          Positioned(
            top: MediaQuery.of(context).size.height * 0.10,
            right: 8,
            child: Column(
              children: [
                FloatingActionButton(
                  mini: true,
                  heroTag: "toggleFollow",
                  backgroundColor:
                      shouldFollowCurrentLocation ? Colors.blue : Colors.white,
                  child: Icon(
                    Icons.my_location,
                    color: shouldFollowCurrentLocation
                        ? Colors.white
                        : Colors.black,
                  ),
                  onPressed: toggleLocationFollowing,
                ),
                SizedBox(height: 8),
                FloatingActionButton(
                  mini: true,
                  backgroundColor: Colors.white,
                  child: Icon(Icons.add, color: Colors.black),
                  onPressed: () async {
                    final GoogleMapController controller =
                        await _controller.future;
                    controller.animateCamera(CameraUpdate.zoomIn());
                  },
                ),
                SizedBox(height: 8),
                FloatingActionButton(
                  mini: true,
                  backgroundColor: Colors.white,
                  child: Icon(Icons.remove, color: Colors.black),
                  onPressed: () async {
                    final GoogleMapController controller =
                        await _controller.future;
                    controller.animateCamera(CameraUpdate.zoomOut());
                  },
                ),
              ],
            ),
          ),

          // Existing back button and bottom sheet code remains the same
          Positioned(
            top: 50,
            left: 20,
            child: CircleAvatar(
              backgroundColor: Colors.white,
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.black),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),

          DraggableScrollableSheet(
            initialChildSize: 0.5,
            minChildSize: 0.3,
            maxChildSize: 0.8,
            builder: (context, scrollController) {
              return Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        controller: scrollController,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Drag Handle
                            Center(
                              child: Container(
                                margin:
                                    const EdgeInsets.symmetric(vertical: 12),
                                width: 40,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: Colors.grey[300],
                                  borderRadius: BorderRadius.circular(2),
                                ),
                              ),
                            ),

                            // Title
                            const Padding(
                              padding: EdgeInsets.all(16),
                              child: Text(
                                'Instant Delivery',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),

                            _buildDistanceAndDuration(),

                            // Locations
                            _buildLocationTile(
                              'Pickup Location',
                              deliveryDetail?.pickupLocation ??
                                  'Không có địa chỉ lấy hàng',
                              Icons.location_on,
                              Colors.red,
                            ),
                            _buildLocationTile(
                              'Delivery Location',
                              deliveryDetail?.deliveryLocation ??
                                  'Không có địa chỉ giao hàng',
                              Icons.location_on_outlined,
                              Colors.green,
                            ),

                            // Package Details

                            _buildDetailTile(
                                'Receipient',
                                deliveryDetail?.customerName ??
                                    'Không có tên người nhận'),
                            _buildDetailTile(
                                'Receipient contact number',
                                deliveryDetail?.customerPhone ??
                                    'Không có số điện thoại'),
                            _buildDetailTile('Estimated fee:',
                                '\$${NumberFormat('#,##0.00').format(deliveryDetail?.fee ?? 0)}'),

                            // Add some padding at the bottom to ensure content doesn't get hidden behind the button
                            const SizedBox(height: 80),
                          ],
                        ),
                      ),
                    ),
                    // Fixed Next Button Container
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 1,
                            blurRadius: 5,
                            offset: const Offset(0, -3),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: () {
                          // Thêm navigation đến DeliveryDetailsScreen
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => DeliveryComplateScreen(
                                deliveryId: deliveryDetail!.orderId!,
                              ),
                            ),
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF008080),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'Start Drop off process',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildLocationTile(
      String title, String address, IconData icon, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          Icon(icon, color: color),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
                Text(
                  address,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailTile(String title, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}

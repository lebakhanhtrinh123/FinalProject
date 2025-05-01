import 'dart:io';

import 'package:flowerops/model/flower_arrangement_detail.dart';
import 'package:flowerops/screen/chat_screen.dart';
import 'package:flowerops/services/flower_arrangement_service.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

class FlowerArangementDetailScreen extends StatefulWidget {
  final String requestId;

  const FlowerArangementDetailScreen({
    Key? key,
    required this.requestId,
  }) : super(key: key);

  @override
  State<FlowerArangementDetailScreen> createState() =>
      _FlowerArangementDetailScreenState();
}

class _FlowerArangementDetailScreenState
    extends State<FlowerArangementDetailScreen> {
  final FlowerArrangementService _service = FlowerArrangementService();
  bool isLoading = true;
  FlowerArrangementDetail? arrangementDetail;
  String? error;
  final ImagePicker _picker = ImagePicker();
  String? _flowerImageUrl;
  bool _isUploading = false;
  File? _flowerImage;

  @override
  void initState() {
    super.initState();
    _loadArrangementDetail();
  }

  Future<void> _loadArrangementDetail() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final detail = await _service.getArrangementById(widget.requestId);
      setState(() {
        arrangementDetail = detail;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  Future<void> _captureflowerImage() async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 85,
        maxWidth: 1024,
        maxHeight: 1024,
      );

      if (photo != null) {
        final File imageFile = File(photo.path);
        setState(() {
          _flowerImage = imageFile;
        });

        // Hiển thị preview và xác nhận
        _showImagePreviewDialog(_flowerImage!);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error when taking photo: ${e.toString()}')),
      );
    }
  }

  void _showImagePreviewDialog(File imageFile) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.file(
              imageFile,
              fit: BoxFit.contain,
              height: 300,
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _captureflowerImage(); // Chụp lại
                  },
                  child: const Text('Chụp lại'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text('Xác nhận'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showFullScreenImage(String imageUrl) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => Scaffold(
          backgroundColor: Colors.black,
          body: Stack(
            children: [
              Center(
                child: InteractiveViewer(
                  minScale: 0.5,
                  maxScale: 4.0,
                  child: Image.network(
                    imageUrl,
                    fit: BoxFit.contain,
                  ),
                ),
              ),
              Positioned(
                top: 40,
                right: 20,
                child: IconButton(
                  icon: Icon(Icons.close, color: Colors.white, size: 30),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: Colors.teal[700]),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Arrangement Detail',
          style: TextStyle(
            color: Colors.black87,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Image Section with tap to enlarge
                      GestureDetector(
                        onTap: () =>
                            _showFullScreenImage(arrangementDetail!.imageUrl),
                        child: Container(
                          height: 300,
                          width: double.infinity,
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                          ),
                          child: Image.network(
                            arrangementDetail!.imageUrl,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),

                      Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Basic Information
                            _buildInfoSection(
                                'Request ID', arrangementDetail!.requestId),
                            _buildInfoSection(
                                'Customer', arrangementDetail!.customerName),
                            _buildContactSection(),

                            _buildInfoSection('Price',
                                'đ${NumberFormat('#,###').format(arrangementDetail!.price)}'),
                            _buildInfoSection(
                                'Request Date',
                                DateFormat('dd/MM/yyyy HH:mm')
                                    .format(arrangementDetail!.requestDate)),

                            // Arrangement Details
                            _buildInfoSection(
                                'Occasion', arrangementDetail!.occasion),
                            _buildInfoSection(
                                'Style', arrangementDetail!.style),
                            _buildInfoSection('Size', arrangementDetail!.size),
                            _buildInfoSection(
                                'Description', arrangementDetail!.description),

                            SizedBox(height: 20),
                            Text(
                              'Flower Composition',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.teal[700],
                              ),
                            ),
                            SizedBox(height: 12),
                            ...arrangementDetail!.flowerComposition
                                .map((flower) => _buildFlowerItem(flower))
                                .toList(),

                            _TakeAPictureSection(
                                context, 'Delivery image(s)', const []),

                            _buildSectionTitle('Order Status'),
                            _buildStatusContainer(
                                arrangementDetail?.status ?? 'N/A'),

                            // Action Button
                            if (arrangementDetail?.status != 'successfully')
                              SizedBox(
                                width: double.infinity,
                                height: 56,
                                child: ElevatedButton(
                                  onPressed: () {
                                    // _showStatusSelection(
                                    //     context, arrangementDetail?.status ?? "",
                                    //     (selectedStatus) async {
                                    //   bool result = await OrderService()
                                    //       .updateOrderStatus(
                                    //           orderDetail?.orderId ?? "",
                                    //           selectedStatus);
                                    //   if (result) {
                                    //     setState(() {
                                    //       orderDetail = orderDetail?.copyWith(
                                    //           status: selectedStatus);
                                    //     });
                                    //     ScaffoldMessenger.of(context).showSnackBar(
                                    //         SnackBar(
                                    //             content: Text(
                                    //                 "Cập nhật trạng thái thành công!")));
                                    //   } else {
                                    //     ScaffoldMessenger.of(context).showSnackBar(
                                    //         SnackBar(
                                    //             content: Text(
                                    //                 "Cập nhật trạng thái thất bại!")));
                                    //   }
                                    // });
                                  },
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(0xFF006D77),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: Text(
                                    'Update Order Status',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),

                            SizedBox(height: 32),

                            // Flower Composition Section
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: TextStyle(
          color: Colors.grey[600],
          fontSize: 16,
        ),
      ),
    );
  }

  void _showStatusSelection(BuildContext context, String currentStatus,
      Function(String) onStatusSelected) {
    List<String> statusOptions = [];
    if (currentStatus.toLowerCase() == "pending") {
      statusOptions = ["processing", "successfully"];
    } else if (currentStatus.toLowerCase() == "processing") {
      statusOptions = ["successfully"];
    } else {
      statusOptions = ["processing", "successfully"];
    }

    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Container(
          padding: EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: statusOptions.map((status) {
              return ListTile(
                title: Text(status.toUpperCase()),
                onTap: () {
                  Navigator.pop(context);
                  onStatusSelected(status);
                },
              );
            }).toList(),
          ),
        );
      },
    );
  }

  Widget _buildInfoSection(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
          SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: color ?? Colors.black87,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlowerItem(FlowerComposition flower) {
    return Container(
      margin: EdgeInsets.only(bottom: 8),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: _getColorFromString(flower.color),
              shape: BoxShape.circle,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  flower.flowerName,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  '${flower.quantity} stems',
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusContainer(String status) {
    Color statusColor;
    switch (status.toLowerCase()) {
      case 'successfully':
        statusColor = Colors.green;
        break;
      case 'pending':
        statusColor = Colors.orange;
        break;
      case 'processing': // Thêm trạng thái processing
        statusColor = Colors.blue;
        break;
      default:
        statusColor = Colors.grey;
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: statusColor,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Color _getColorFromString(String colorName) {
    switch (colorName.toLowerCase()) {
      case 'red':
        return Colors.red;
      case 'white':
        return Colors.white;
      case 'pink':
        return Colors.pink;
      case 'yellow':
        return Colors.yellow;
      default:
        return Colors.grey;
    }
  }

  Widget _TakeAPictureSection(
      BuildContext context, String title, List<String> images) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            color: Colors.grey[600],
            fontSize: 16,
          ),
        ),
        const SizedBox(height: 8),
        if (title == 'Delivery image(s)')
          Row(
            children: [
              if (_flowerImage != null)
                Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: Stack(
                    children: [
                      GestureDetector(
                        onTap: () => _showFullScreenPicture(
                            context, _flowerImage!.path,
                            isAsset: false),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            _flowerImage!,
                            width: 100,
                            height: 100,
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      if (_isUploading)
                        Positioned.fill(
                          child: Container(
                            color: Colors.black45,
                            child: const Center(
                              child: CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ElevatedButton(
                onPressed: _isUploading ? null : _captureflowerImage,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF008080),
                  minimumSize: const Size(100, 100),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.camera_alt, color: Colors.white),
                    SizedBox(height: 4),
                    Text(
                      'Chụp ảnh',
                      style: TextStyle(color: Colors.white),
                    ),
                  ],
                ),
              ),
            ],
          )
        else
          Row(
            children: images
                .map(
                  (image) => Padding(
                    padding: const EdgeInsets.only(right: 8.0),
                    child: GestureDetector(
                      onTap: () => _showFullScreenPicture(context, image),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.asset(
                          image,
                          width: 100,
                          height: 100,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
        const SizedBox(height: 16),
      ],
    );
  }

  void _showFullScreenPicture(BuildContext context, String imagePath,
      {bool isAsset = true}) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return Dialog(
          insetPadding: EdgeInsets.zero,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // Image
              InteractiveViewer(
                panEnabled: true,
                minScale: 0.5,
                maxScale: 4,
                child: isAsset
                    ? Image.asset(imagePath, fit: BoxFit.contain)
                    : Image.file(File(imagePath), fit: BoxFit.contain),
              ),
              // Close button
              Positioned(
                right: 16,
                top: 16,
                child: GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: const Icon(
                      Icons.close,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
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
            // Navigator.push(
            //   context,
            //   MaterialPageRoute(
            //     builder: (context) => ChatScreen(
            //       requestId: arrangementDetail!.requestId,
            //       customerName: arrangementDetail!.customerName,
            //     ),
            //   ),
            // );
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
                        'Message ${arrangementDetail!.customerName}',
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

import 'dart:io';

import 'package:flowerops/model/DeliveryData.dart';
import 'package:flowerops/screen/delivery_home_screen.dart';
import 'package:flowerops/services/delivery_service.dart';
import 'package:flowerops/services/imgur_service.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class DeliveryComplateScreen extends StatefulWidget {
  final String deliveryId;
  const DeliveryComplateScreen({
    Key? key,
    required this.deliveryId,
  }) : super(key: key);
  @override
  State<DeliveryComplateScreen> createState() => _DeliveryComplateScreenState();
}

class _DeliveryComplateScreenState extends State<DeliveryComplateScreen> {
  final DeliveryService _deliveryService = DeliveryService();
  bool isLoading = true;
  DeliveryData? deliveryDetail;
  String? error;
  final ImgurService _imgurService = ImgurService();
  final ImagePicker _picker = ImagePicker();
  String? _deliveryImageUrl;
  bool _isUploading = false;
  File? _deliveryImage;

  @override
  void initState() {
    super.initState();
    _loadDeliveryDetail();
  }

  Future<void> _loadDeliveryDetail() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final response =
          await _deliveryService.getDeliveryById(widget.deliveryId);
      setState(() {
        deliveryDetail = response.data;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  Future<void> _captureDeliveryImage() async {
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
          _deliveryImage = imageFile;
        });

        // Hiển thị preview và xác nhận
        _showImagePreviewDialog(_deliveryImage!);
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
                    _captureDeliveryImage();
                  },
                  child: const Text('Retake Photo'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    _uploadDeliveryImage(imageFile);
                  },
                  child: const Text('Confirm Photo'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _uploadDeliveryImage(File imageFile) async {
    if (_isUploading) return;
    try {
      setState(() {
        _isUploading = true;
      });

      final imageUrl = await _imgurService.uploadImage(imageFile);

      if (imageUrl != null) {
        setState(() {
          _deliveryImageUrl = imageUrl;
          _isUploading = false;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Image uploaded successfully!')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Unable to upload image.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error uploading image: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Delivery details',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w500),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Delivery Person Details
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundImage: AssetImage('images/avata.jpg'),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Allan Smith',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const Text('124 Deliveries'),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.star, color: Colors.amber, size: 16),
                          Icon(Icons.star, color: Colors.amber, size: 16),
                          Icon(Icons.star, color: Colors.amber, size: 16),
                          Icon(Icons.star, color: Colors.amber, size: 16),
                          Icon(Icons.star, color: Colors.grey, size: 16),
                          SizedBox(width: 4),
                          Text('4.1'),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Text(
                        'In progress',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(
                        Icons.motorcycle,
                        color: Colors.green,
                        size: 20,
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Location Details
            _buildLocationSection(
              deliveryDetail?.pickupLocation ?? 'No information available',
              deliveryDetail?.deliveryLocation ?? 'No information available',
            ),
            const SizedBox(height: 24),

            _buildInfoSection('Receipient',
                deliveryDetail?.customerName ?? 'No information available'),
            _buildInfoSection(
              'Receipient contact number',
              deliveryDetail?.customerPhone ?? 'No information available',
            ),
            _buildPaymentSection(deliveryDetail?.fee?.toString() ?? '0'),

            // Images Section
            // _buildImagesSection(context, 'Pickup image(s)', const [
            //   'images/giao_hang.jpg',
            // ]),

            if (deliveryDetail?.status == 'Received')
              _buildImagesSection(
                  context,
                  'Delivery image(s)',
                  deliveryDetail?.deliveryImage != null
                      ? [deliveryDetail!.deliveryImage!]
                      : [])
            else ...[
              _TakeAPictureSection(context, 'Delivery image(s)', const []),
              Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: ElevatedButton(
                  onPressed: () {
                    if (_deliveryImageUrl != null) {
                      _deliveryService
                          .updateDelivery(
                              deliveryId: deliveryDetail?.deliveryId ?? '',
                              deliveryImage: _deliveryImageUrl)
                          .then((_) {
                        Navigator.pushAndRemoveUntil(
                            context,
                            MaterialPageRoute(
                                builder: (context) => DeliveryHomeScreen()),
                            (route) => false);
                      }).catchError((error) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Lỗi: $error')),
                        );
                      });
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Please take a delivery photo')),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF008080),
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    'Completed',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildLocationSection(String pickup, String delivery) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.location_on, color: Colors.red),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Pickup Location',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    pickup,
                    style: const TextStyle(fontSize: 16),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 2,
                  ),
                ],
              ),
            ),
          ],
        ),
        Container(
          margin: const EdgeInsets.only(left: 12),
          height: 30,
          width: 2,
          color: Colors.grey[300],
        ),
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.location_on, color: Colors.green),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Delivery Location',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                    ),
                  ),
                  Text(
                    delivery, // Thêm delivery vào đây
                    style: const TextStyle(fontSize: 16),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 2,
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildInfoSection(String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            content,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentSection(String fee) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        _buildInfoSection('Payment', 'Card'),
        Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              'Fee:',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 16,
              ),
            ),
            Text(
              '$fee',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildImagesSection(
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
        Row(
          children: images
              .map(
                (image) => Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: GestureDetector(
                    onTap: () => _showFullScreenImage(context, image),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network(
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
              if (_deliveryImage != null)
                Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: Stack(
                    children: [
                      GestureDetector(
                        onTap: () => _showFullScreenImage(
                            context, _deliveryImage!.path,
                            isAsset: false),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(
                            _deliveryImage!,
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
                onPressed: _isUploading ? null : _captureDeliveryImage,
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
                      'Take a photo',
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
                      onTap: () => _showFullScreenImage(context, image),
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

  void _showFullScreenImage(BuildContext context, String imagePath,
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
                child: _buildImageWidget(imagePath, isAsset)
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

  Widget _buildImageWidget(String imagePath, bool isAsset) {
    if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
      return Image.network(imagePath, fit: BoxFit.contain);
    } else if (isAsset) {
      return Image.asset(imagePath, fit: BoxFit.contain);
    } else {
      return Image.file(File(imagePath), fit: BoxFit.contain);
    }
  }
}

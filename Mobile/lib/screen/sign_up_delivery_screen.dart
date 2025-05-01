import 'dart:io';

import 'package:flowerops/model/CourierRegisterRequest.dart';
import 'package:flowerops/model/store.dart';
import 'package:flowerops/screen/login_screen.dart';
import 'package:flowerops/services/account_service.dart';
import 'package:flowerops/services/store_service.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class SignUpDeliveryScreen extends StatefulWidget {
  const SignUpDeliveryScreen({super.key});

  @override
  State<SignUpDeliveryScreen> createState() => _SignUpDeliveryScreenState();
}

class _SignUpDeliveryScreenState extends State<SignUpDeliveryScreen> {
  final _formKey = GlobalKey<FormState>();
  File? _cccdFrontImage;
  File? _cccdBackImage;
  bool _isLoading = false;
  Store? _selectedStore;
  List<Store> _stores = [];
  DateTime _selectedDate = DateTime.now(); // Biến lưu ngày sinh

  // Form controllers
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _identificationNumberController = TextEditingController();
  final _numberMotoController = TextEditingController();
  final _colorMotoController = TextEditingController();
  final _motoTypeController = TextEditingController();

  bool _gender = true;

  @override
  void initState() {
    super.initState();
    _loadStores();
  }

  Future<void> _loadStores() async {
    final storeService = StoreService();
    final stores = await storeService.getAllStores();
    setState(() {
      _stores = stores;
    });
  }

  // Hàm hiển thị DatePicker
  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _pickImage(ImageSource source, String type) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(source: source);

      if (image != null) {
        setState(() {
          switch (type) {
            case 'cccdFront':
              _cccdFrontImage = File(image.path);
              break;
            case 'cccdBack':
              _cccdBackImage = File(image.path);
              break;
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error picking image: ${e.toString()}')),
      );
    }
  }

  Future<void> _handleRegistration() async {
  if (_formKey.currentState!.validate()) {
    if (_cccdFrontImage == null || _cccdBackImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload both CCCD images')),
      );
      return;
    }

    if (_selectedStore == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a store')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final request = CourierRegisterRequest(
        fullName: "Default Name", 
        address: _addressController.text,
        email: _emailController.text,
        phone: _phoneController.text,
        gender: _gender,
        birthday: _selectedDate,
        identificationNumber: _identificationNumberController.text,
        identificationFontOfPhoto: _cccdFrontImage,
        identificationBackOfPhoto: _cccdBackImage,
        numberMoto: _numberMotoController.text,
        colorMoto: _colorMotoController.text,
        motoType: _motoTypeController.text,
        storeId: _selectedStore!.storeId,
      );

      final accountService = AccountService();
      final response = await accountService.registerCourier(request);

      if (response != null) {
        if (response.resultStatus == "Success") {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Registration successful!')),
          );
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => LoginScreen()),
          );
        } else {
          
          String errorMessage = response.messages?.join("\n") ?? "Registration failed.";
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(errorMessage)),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Registration failed. Please try again.')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Store Selection Dropdown
              DropdownButtonFormField<Store>(
                value: _selectedStore,
                decoration: const InputDecoration(
                  hintText: 'Select Store',
                  filled: true,
                  fillColor: Color(0xFFEEF1F4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                    borderSide: BorderSide.none,
                  ),
                ),
                items: _stores.map((Store store) {
                  return DropdownMenuItem<Store>(
                    value: store,
                    child: Text('${store.storeName} - ${store.district}'),
                  );
                }).toList(),
                onChanged: (Store? newValue) {
                  setState(() {
                    _selectedStore = newValue;
                  });
                },
                validator: (value) {
                  if (value == null) {
                    return 'Please select a store';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                decoration: const InputDecoration(
                  hintText: 'Email address',
                  filled: true,
                  fillColor: Color(0xFFEEF1F4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                    borderSide: BorderSide.none,
                  ),
                ),
                keyboardType: TextInputType.emailAddress,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your email';
                  }
                  final emailRegex =
                      RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');

                  if (!emailRegex.hasMatch(value)) {
                    return 'Please enter a valid email address';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Birthday Selector - THÊM MỚI
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Birthday',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  GestureDetector(
                    onTap: () => _selectDate(context),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF1F4),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${_selectedDate.day}/${_selectedDate.month}/${_selectedDate.year}',
                            style: const TextStyle(fontSize: 16),
                          ),
                          const Icon(Icons.calendar_today, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Gender Selection
              Row(
                children: [
                  const Text('Gender:'),
                  Radio<bool>(
                    value: true,
                    groupValue: _gender,
                    onChanged: (bool? value) {
                      setState(() {
                        _gender = value!;
                      });
                    },
                  ),
                  const Text('Male'),
                  Radio<bool>(
                    value: false,
                    groupValue: _gender,
                    onChanged: (bool? value) {
                      setState(() {
                        _gender = value!;
                      });
                    },
                  ),
                  const Text('Female'),
                ],
              ),

              // Phone Field
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  hintText: 'Phone',
                  filled: true,
                  fillColor: Color(0xFFEEF1F4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                    borderSide: BorderSide.none,
                  ),
                ),
                keyboardType: TextInputType.phone,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your phone number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Address Field
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  hintText: 'Address',
                  filled: true,
                  fillColor: Color(0xFFEEF1F4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                    borderSide: BorderSide.none,
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your address';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Identification Number Field
              TextFormField(
                controller: _identificationNumberController,
                decoration: const InputDecoration(
                  hintText: 'Citizen Identification Number',
                  filled: true,
                  fillColor: Color(0xFFEEF1F4),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.all(Radius.circular(12)),
                    borderSide: BorderSide.none,
                  ),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your identification number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),


              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _numberMotoController,
                      decoration: const InputDecoration(
                        hintText: 'Số xe',
                        filled: true,
                        fillColor: Color(0xFFEEF1F4),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(12)),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _motoTypeController,
                      decoration: const InputDecoration(
                        hintText: 'Hãng xe',
                        filled: true,
                        fillColor: Color(0xFFEEF1F4),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(12)),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _colorMotoController,
                      decoration: const InputDecoration(
                        hintText: 'Màu xe',
                        filled: true,
                        fillColor: Color(0xFFEEF1F4),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.all(Radius.circular(12)),
                          borderSide: BorderSide.none,
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Required';
                        }
                        return null;
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Modified CCCD Images section
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Image CCCD',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Front CCCD
                  GestureDetector(
                    onTap: () => _pickImage(ImageSource.gallery, 'cccdFront'),
                    child: Container(
                      height: 200,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF1F4),
                        borderRadius: BorderRadius.circular(12),
                        image: _cccdFrontImage != null
                            ? DecorationImage(
                                image: FileImage(_cccdFrontImage!),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: _cccdFrontImage == null
                          ? const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_photo_alternate,
                                    size: 40, color: Colors.grey),
                                Text('Front side',
                                    style: TextStyle(color: Colors.grey)),
                              ],
                            )
                          : null,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Back CCCD
                  GestureDetector(
                    onTap: () => _pickImage(ImageSource.gallery, 'cccdBack'),
                    child: Container(
                      height: 200,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: const Color(0xFFEEF1F4),
                        borderRadius: BorderRadius.circular(12),
                        image: _cccdBackImage != null
                            ? DecorationImage(
                                image: FileImage(_cccdBackImage!),
                                fit: BoxFit.cover,
                              )
                            : null,
                      ),
                      child: _cccdBackImage == null
                          ? const Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_photo_alternate,
                                    size: 40, color: Colors.grey),
                                Text('Back side',
                                    style: TextStyle(color: Colors.grey)),
                              ],
                            )
                          : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Register Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegistration,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF006A60),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text(
                          'Register',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _identificationNumberController.dispose();
    _motoTypeController.dispose();
    _colorMotoController.dispose();
    _numberMotoController.dispose();
    super.dispose();
  }
}
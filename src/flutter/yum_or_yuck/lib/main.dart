import 'package:flutter/material.dart';

void main() {
  runApp(const YumOrYuckApp());
}

class YumOrYuckApp extends StatelessWidget {
  const YumOrYuckApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        body: Center(
          child: Text('🍎 Yum or Yuck', style: TextStyle(fontSize: 32)),
        ),
      ),
    );
  }
}

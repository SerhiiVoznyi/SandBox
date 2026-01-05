import 'package:flutter/material.dart';

class YumOrYuckGameScreen extends StatelessWidget {
  const YumOrYuckGameScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Text('Yum or Yuck Game', style: TextStyle(fontSize: 28)),
      ),
    );
  }
}

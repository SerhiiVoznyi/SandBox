import 'package:flutter/material.dart';
import '../../app/routes.dart';

class GamesListScreen extends StatelessWidget {
  const GamesListScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Games')),
      body: Center(
        child: ElevatedButton(
          onPressed: () {
            Navigator.pushNamed(context, AppRoutes.yumOrYuck);
          },
          child: const Text('Yum or Yuck'),
        ),
      ),
    );
  }
}

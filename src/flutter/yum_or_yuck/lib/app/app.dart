import 'package:flutter/material.dart';
import 'routes.dart';
import 'theme.dart';

class YumOrYuckApp extends StatelessWidget {
  const YumOrYuckApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Kids Games',
      routes: AppRoutes.routes,
      initialRoute: AppRoutes.splash,
      theme: AppTheme.dark(),
    );
  }
}

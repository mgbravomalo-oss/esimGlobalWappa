import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/esim_provider.dart';
import 'catalog_screen.dart';
import 'my_esims_screen.dart';

class HomeShellScreen extends StatefulWidget {
  const HomeShellScreen({super.key});

  @override
  State<HomeShellScreen> createState() => _HomeShellScreenState();
}

class _HomeShellScreenState extends State<HomeShellScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    CatalogScreen(),
    MyEsimsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        final esimsCount = ref.watch(esimsProvider).length;

        return Scaffold(
          body: _screens[_currentIndex],
          bottomNavigationBar: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) => setState(() => _currentIndex = index),
            destinations: [
              const NavigationDestination(
                icon: Icon(LucideIcons.globe),
                label: 'Catálogo Destinos',
              ),
              NavigationDestination(
                icon: Badge(
                  label: Text('$esimsCount'),
                  isLabelVisible: esimsCount > 0,
                  child: const Icon(LucideIcons.smartphone),
                ),
                label: 'Mis eSIMs',
              ),
            ],
          ),
        );
      },
    );
  }
}

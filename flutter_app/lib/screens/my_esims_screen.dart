import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/esim_provider.dart';
import '../widgets/esim_card.dart';
import 'qr_viewer_dialog.dart';
import 'top_up_dialog.dart';

class MyEsimsScreen extends ConsumerWidget {
  const MyEsimsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final esims = ref.watch(esimsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mis eSIMs Activas', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: esims.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.smartphoneNfc, size: 48, color: Colors.grey[400]),
                  const SizedBox(height: 12),
                  const Text(
                    'No tienes ninguna eSIM activa',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Explora el catálogo de países y compra tu primera eSIM.',
                    style: TextStyle(fontSize: 12, color: Colors.grey[500]),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: esims.length,
              itemBuilder: (context, index) {
                final esim = esims[index];
                return EsimCard(
                  esim: esim,
                  onShowQr: () {
                    showDialog(
                      context: context,
                      builder: (context) => QrViewerDialog(esim: esim),
                    );
                  },
                  onTopUp: () {
                    showDialog(
                      context: context,
                      builder: (context) => TopUpDialog(esim: esim),
                    );
                  },
                );
              },
            ),
    );
  }
}

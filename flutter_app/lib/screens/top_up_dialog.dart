import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/user_esim.dart';
import '../providers/esim_provider.dart';

class TopUpDialog extends ConsumerStatefulWidget {
  final UserEsim esim;

  const TopUpDialog({super.key, required this.esim});

  @override
  ConsumerState<TopUpDialog> createState() => _TopUpDialogState();
}

class _TopUpDialogState extends ConsumerState<TopUpDialog> {
  int _selectedOption = 0;
  bool _isProcessing = false;

  final List<Map<String, dynamic>> _topUpOptions = [
    {'gb': 1.0, 'label': '1 GB', 'price': 3.50, 'days': 7},
    {'gb': 3.0, 'label': '3 GB', 'price': 7.00, 'days': 15, 'popular': true},
    {'gb': 5.0, 'label': '5 GB', 'price': 11.50, 'days': 30},
    {'gb': 10.0, 'label': '10 GB', 'price': 19.00, 'days': 30},
  ];

  Future<void> _handleTopUp() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(seconds: 1));

    final opt = _topUpOptions[_selectedOption];
    ref.read(esimsProvider.notifier).topUpEsim(widget.esim.id, opt['gb'] as double);

    if (mounted) {
      setState(() => _isProcessing = false);
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('¡Recarga de ${opt['label']} completada con éxito!'),
          backgroundColor: const Color(0xFF059669),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(LucideIcons.zap, color: Colors.amber, size: 16),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Recargar ${widget.esim.country}',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(LucideIcons.x, size: 18),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            const SizedBox(height: 16),

            const Text(
              'Selecciona un paquete adicional:',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 1.8,
              ),
              itemCount: _topUpOptions.length,
              itemBuilder: (context, index) {
                final opt = _topUpOptions[index];
                final isSelected = _selectedOption == index;
                return InkWell(
                  onTap: () => setState(() => _selectedOption = index),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF059669).withOpacity(0.1)
                          : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC)),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected
                            ? const Color(0xFF059669)
                            : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                        width: isSelected ? 1.5 : 1,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          opt['label'],
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Text(
                          '\$${(opt['price'] as double).toStringAsFixed(2)}',
                          style: const TextStyle(
                            color: Color(0xFF059669),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 16),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isProcessing ? null : _handleTopUp,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF059669),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text(
                  _isProcessing
                      ? 'Procesando recarga...'
                      : 'Pagar \$${(_topUpOptions[_selectedOption]['price'] as double).toStringAsFixed(2)} y Recargar',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

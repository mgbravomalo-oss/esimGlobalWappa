import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/destination.dart';
import '../models/esim_plan.dart';
import '../providers/esim_provider.dart';

class PlanDetailBottomSheet extends ConsumerStatefulWidget {
  final Destination destination;

  const PlanDetailBottomSheet({super.key, required this.destination});

  @override
  ConsumerState<PlanDetailBottomSheet> createState() => _PlanDetailBottomSheetState();
}

class _PlanDetailBottomSheetState extends ConsumerState<PlanDetailBottomSheet> {
  late EsimPlan _selectedPlan;
  int _selectedDays = 7;
  bool _isPurchasing = false;

  @override
  void initState() {
    super.initState();
    _selectedPlan = widget.destination.plans.first;
    _selectedDays = _selectedPlan.validityDays;
  }

  double get _totalPrice => _selectedPlan.isUnlimited
      ? (_selectedPlan.priceEUR * _selectedDays)
      : _selectedPlan.priceEUR;

  Future<void> _handlePurchase() async {
    setState(() => _isPurchasing = true);
    await Future.delayed(const Duration(seconds: 1));

    ref.read(esimsProvider.notifier).purchasePlan(
      plan: _selectedPlan,
      durationDays: _selectedDays,
      userName: 'Viajero',
      userEmail: 'viajero@global.com',
    );

    if (mounted) {
      setState(() => _isPurchasing = false);
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('¡eSIM para ${widget.destination.name} generada exitosamente!'),
          backgroundColor: const Color(0xFF059669),
          duration: const Duration(seconds: 3),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0F172A) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 36,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(widget.destination.flag, style: const TextStyle(fontSize: 32)),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.destination.name,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                      ),
                      Text(
                        widget.destination.operator,
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(LucideIcons.x),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Plans Selector
          const Text('Selecciona tipo de paquete:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
          const SizedBox(height: 8),

          Wrap(
            spacing: 8,
            children: widget.destination.plans.map((plan) {
              final isSelected = plan.id == _selectedPlan.id;
              return ChoiceChip(
                label: Text(
                  plan.isUnlimited ? '♾️ Ilimitado' : '${plan.dataAmountGB.toInt()} GB',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected ? Colors.white : (isDark ? Colors.grey[300] : Colors.black87),
                  ),
                ),
                selected: isSelected,
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      _selectedPlan = plan;
                      _selectedDays = plan.validityDays;
                    });
                  }
                },
                selectedColor: const Color(0xFF059669),
              );
            }).toList(),
          ),

          const SizedBox(height: 16),

          // Unlimited Days Selector
          if (_selectedPlan.isUnlimited) ...[
            const Text('Días de cobertura:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
            const SizedBox(height: 8),
            Row(
              children: [1, 3, 5, 7, 10, 15, 30].map((days) {
                final isSelected = _selectedDays == days;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: InkWell(
                    onTap: () => setState(() => _selectedDays = days),
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? const Color(0xFF059669)
                            : (isDark ? const Color(0xFF1E293B) : const Color(0xFFF1F5F9)),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${days}d',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? Colors.white : (isDark ? Colors.white : Colors.black87),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 16),
          ],

          // Total & Buy Button
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total a Pagar', style: TextStyle(fontSize: 11, color: Colors.grey[500])),
                    Text(
                      '\$${_totalPrice.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF059669),
                      ),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: _isPurchasing ? null : _handlePurchase,
                  icon: const Icon(LucideIcons.zap, size: 16),
                  label: Text(_isPurchasing ? 'Emitiendo...' : 'Activar eSIM Ahora'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

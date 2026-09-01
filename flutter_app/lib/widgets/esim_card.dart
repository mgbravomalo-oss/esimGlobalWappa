import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/user_esim.dart';

class EsimCard extends StatelessWidget {
  final UserEsim esim;
  final VoidCallback onShowQr;
  final VoidCallback onTopUp;

  const EsimCard({
    super.key,
    required this.esim,
    required this.onShowQr,
    required this.onTopUp,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final remainingRatio = esim.remainingPercentage;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(esim.flag, style: const TextStyle(fontSize: 26)),
                    const SizedBox(width: 10),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          esim.planName,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        Text(
                          '${esim.country} • ${esim.operator}',
                          style: TextStyle(
                            fontSize: 11,
                            color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: esim.status == EsimStatus.active
                        ? Colors.emerald.withOpacity(0.12)
                        : Colors.blue.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: esim.status == EsimStatus.active ? Colors.emerald : Colors.blue,
                      width: 0.8,
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: esim.status == EsimStatus.active ? Colors.emerald : Colors.blue,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        esim.status == EsimStatus.active ? 'ACTIVA' : 'LISTA PARA INSTALAR',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: esim.status == EsimStatus.active ? Colors.emerald : Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Data consumption bar
            if (!esim.isUnlimited) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Consumo de datos',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                    ),
                  ),
                  Text(
                    '${esim.remainingGB.toStringAsFixed(1)} GB restantes de ${esim.totalDataGB.toStringAsFixed(0)} GB',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: LinearProgressIndicator(
                  value: remainingRatio,
                  minHeight: 6,
                  backgroundColor: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                  valueColor: AlwaysStoppedAnimation<Color>(
                    remainingRatio > 0.3 ? const Color(0xFF059669) : Colors.amber,
                  ),
                ),
              ),
            ] else ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Row(
                  children: [
                    Icon(LucideIcons.infinity, size: 14, color: Color(0xFF059669)),
                    SizedBox(width: 6),
                    Text(
                      'Datos ilimitados de alta velocidad 5G activos',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF059669),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 14),

            // Action Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onShowQr,
                    icon: const Icon(LucideIcons.qrCode, size: 14),
                    label: const Text('Ver QR / Códigos', style: TextStyle(fontSize: 11)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: onTopUp,
                    icon: const Icon(LucideIcons.zap, size: 14),
                    label: const Text('Recargar Datos', style: TextStyle(fontSize: 11)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/esim_provider.dart';
import '../widgets/destination_card.dart';
import 'plan_detail_bottom_sheet.dart';

class CatalogScreen extends ConsumerWidget {
  const CatalogScreen({super.key});

  static const List<String> regions = [
    'Todos',
    'Europa',
    'Asia',
    'América del Norte',
    'Latinoamérica',
    'Oriente Medio',
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final destinations = ref.watch(destinationsProvider);
    final selectedRegion = ref.watch(selectedRegionProvider);
    final searchQuery = ref.watch(searchQueryProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final filtered = destinations.where((d) {
      final matchesRegion = selectedRegion == 'Todos' || d.region == selectedRegion;
      final matchesSearch = d.name.toLowerCase().contains(searchQuery.toLowerCase()) ||
          d.region.toLowerCase().contains(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF059669).withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(LucideIcons.globe, color: Color(0xFF059669), size: 18),
            ),
            const SizedBox(width: 8),
            const Text(
              'eSIM Global',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(
              isDark ? LucideIcons.sun : LucideIcons.moon,
              size: 20,
            ),
            onPressed: () {
              ref.read(isDarkModeProvider.notifier).state = !isDark;
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              onChanged: (val) => ref.read(searchQueryProvider.notifier).state = val,
              decoration: InputDecoration(
                hintText: 'Buscar país o región (ej. Japón, Europa...)',
                hintStyle: TextStyle(
                  fontSize: 12,
                  color: isDark ? Colors.grey[500] : const Color(0xFF94A3B8),
                ),
                prefixIcon: const Icon(LucideIcons.search, size: 16),
                filled: true,
                fillColor: isDark ? const Color(0xFF0F172A) : Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                  ),
                ),
              ),
            ),
          ),

          // Region Chips
          SizedBox(
            height: 38,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: regions.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, index) {
                final region = regions[index];
                final isSelected = region == selectedRegion;
                return ChoiceChip(
                  label: Text(region, style: const TextStyle(fontSize: 11)),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) {
                      ref.read(selectedRegionProvider.notifier).state = region;
                    }
                  },
                  selectedColor: const Color(0xFF059669),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : (isDark ? Colors.grey[300] : Colors.black87),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                    side: BorderSide(
                      color: isSelected
                          ? const Color(0xFF059669)
                          : (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Destinations List
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(LucideIcons.mapPinOff, size: 40, color: Colors.grey[400]),
                        const SizedBox(height: 8),
                        Text(
                          'No se encontraron destinos para "$searchQuery"',
                          style: TextStyle(color: Colors.grey[500], fontSize: 13),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final destination = filtered[index];
                      return DestinationCard(
                        destination: destination,
                        onTap: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (context) => PlanDetailBottomSheet(destination: destination),
                          );
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

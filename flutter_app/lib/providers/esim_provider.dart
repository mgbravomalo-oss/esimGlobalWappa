import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/destination.dart';
import '../models/user_esim.dart';
import '../data/sample_data.dart';

class EsimNotifier extends StateNotifier<List<UserEsim>> {
  EsimNotifier() : super(kSampleUserEsims);

  void purchasePlan({
    required EsimPlan plan,
    required int durationDays,
    required String userName,
    required String userEmail,
  }) {
    final newEsim = UserEsim(
      id: 'esim-${DateTime.now().millisecondsSinceEpoch}',
      planId: plan.id,
      planName: '${plan.name} (${durationDays}d)',
      country: plan.country,
      flag: plan.flag,
      iccid: '89014${DateTime.now().millisecondsSinceEpoch}F',
      qrCodeUrl: 'LPA:1$smdp.globalesim.net$ACT-${DateTime.now().millisecondsSinceEpoch}',
      activationCode: 'ACT-${DateTime.now().millisecondsSinceEpoch}',
      smdpAddress: 'smdp.globalesim.net',
      apn: 'globaldata',
      totalDataGB: plan.isUnlimited ? 999.0 : plan.dataAmountGB,
      usedDataGB: 0.0,
      isUnlimited: plan.isUnlimited,
      expiryDate: '${DateTime.now().add(Duration(days: durationDays)).day}/${DateTime.now().add(Duration(days: durationDays)).month}/${DateTime.now().year}',
      status: EsimStatus.readyToInstall,
      operator: plan.operator,
      network5G: plan.network5G,
      purchasedAt: DateTime.now(),
    );

    state = [newEsim, ...state];
  }

  void topUpEsim(String esimId, double extraGB) {
    state = state.map((esim) {
      if (esim.id == esimId) {
        return esim.copyWith(
          totalDataGB: esim.totalDataGB + extraGB,
        );
      }
      return esim;
    }).toList();
  }
}

final esimsProvider = StateNotifierProvider<EsimNotifier, List<UserEsim>>((ref) {
  return EsimNotifier();
});

final destinationsProvider = Provider<List<Destination>>((ref) {
  return kSampleDestinations;
});

final selectedRegionProvider = StateProvider<String>((ref) => 'Todos');
final searchQueryProvider = StateProvider<String>((ref) => '');
final isDarkModeProvider = StateProvider<bool>((ref) => false);

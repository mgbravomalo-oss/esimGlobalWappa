enum EsimStatus {
  active,
  readyToInstall,
  expired,
  depleted,
}

class UserEsim {
  final String id;
  final String planId;
  final String planName;
  final String country;
  final String flag;
  final String iccid;
  final String qrCodeUrl;
  final String activationCode;
  final String smdpAddress;
  final String apn;
  final double totalDataGB;
  final double usedDataGB;
  final bool isUnlimited;
  final String expiryDate;
  final EsimStatus status;
  final String operator;
  final bool network5G;
  final DateTime purchasedAt;

  const UserEsim({
    required this.id,
    required this.planId,
    required this.planName,
    required this.country,
    required this.flag,
    required this.iccid,
    required this.qrCodeUrl,
    required this.activationCode,
    required this.smdpAddress,
    required this.apn,
    required this.totalDataGB,
    required this.usedDataGB,
    this.isUnlimited = false,
    required this.expiryDate,
    required this.status,
    required this.operator,
    this.network5G = true,
    required this.purchasedAt,
  });

  double get remainingGB => isUnlimited ? 999.0 : (totalDataGB - usedDataGB).clamp(0.0, totalDataGB);
  double get remainingPercentage => isUnlimited ? 1.0 : (totalDataGB > 0 ? (remainingGB / totalDataGB) : 0.0);

  UserEsim copyWith({
    double? usedDataGB,
    double? totalDataGB,
    EsimStatus? status,
  }) {
    return UserEsim(
      id: id,
      planId: planId,
      planName: planName,
      country: country,
      flag: flag,
      iccid: iccid,
      qrCodeUrl: qrCodeUrl,
      activationCode: activationCode,
      smdpAddress: smdpAddress,
      apn: apn,
      totalDataGB: totalDataGB ?? this.totalDataGB,
      usedDataGB: usedDataGB ?? this.usedDataGB,
      isUnlimited: isUnlimited,
      expiryDate: expiryDate,
      status: status ?? this.status,
      operator: operator,
      network5G: network5G,
      purchasedAt: purchasedAt,
    );
  }
}

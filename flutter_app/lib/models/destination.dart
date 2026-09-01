class EsimPlan {
  final String id;
  final String destinationId;
  final String name;
  final String country;
  final String flag;
  final double dataAmountGB;
  final bool isUnlimited;
  final int validityDays;
  final double priceEUR;
  final String operator;
  final bool network5G;
  final String coverageType; // 'local', 'regional', 'global'

  const EsimPlan({
    required this.id,
    required this.destinationId,
    required this.name,
    required this.country,
    required this.flag,
    required this.dataAmountGB,
    this.isUnlimited = false,
    required this.validityDays,
    required this.priceEUR,
    required this.operator,
    this.network5G = true,
    this.coverageType = 'local',
  });
}

class Destination {
  final String id;
  final String name;
  final String flag;
  final String region; // 'Europa', 'Asia', 'América del Norte', 'Latinoamérica', 'Oriente Medio', 'África', 'Oceanía', 'Global'
  final double startingPrice;
  final List<EsimPlan> plans;
  final String operator;
  final bool network5G;
  final String? popularBadge;

  const Destination({
    required this.id,
    required this.name,
    required this.flag,
    required this.region,
    required this.startingPrice,
    required this.plans,
    required this.operator,
    this.network5G = true,
    this.popularBadge,
  });
}

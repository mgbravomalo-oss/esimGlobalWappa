export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  country?: string;
  createdAt: string;
  walletBalanceEUR?: number;
}

export interface EsimPlan {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  region: 'local' | 'regional' | 'global';
  regionName?: string;
  dataAmountGB: number;
  isUnlimited: boolean;
  validityDays: number;
  priceEUR: number;
  operator: string;
  network5G: boolean;
  apn: string;
  voiceAndSms: boolean;
  tetheringSupported: boolean;
  coverageDetails: string;
  popular?: boolean;
}

export interface UserEsim {
  id: string;
  iccid: string;
  planId: string;
  planName: string;
  country: string;
  countryCode: string;
  flag: string;
  operator: string;
  network5G: boolean;
  qrCodeUrl: string;
  smdpAddress: string;
  activationCode: string;
  manualCode: string;
  totalDataGB: number;
  usedDataGB: number;
  isUnlimited: boolean;
  purchaseDate: string;
  activationDate?: string;
  expiryDate: string;
  durationDays?: number;
  pricePaid?: number;
  status: 'active' | 'ready_to_install' | 'expired' | 'depleted';
  autoRenew: boolean;
  apn: string;
  dataHistory?: { date: string; mbUsed: number }[];
}

export interface Destination {
  id: string;
  name: string;
  code: string;
  flag: string;
  region: 'europe' | 'asia' | 'americas' | 'global' | 'middle_east' | 'africa';
  regionLabel: string;
  startingPriceEUR: number;
  popular: boolean;
  popularBadge?: string;
  topOperators: string[];
  plansCount: number;
}

export interface CompatibleDevice {
  brand: string;
  models: string[];
  instructions: string;
}

export type MainTab = 'store' | 'myesims' | 'compatibility' | 'guide';

export interface CartItem {
  plan: EsimPlan;
  quantity: number;
}

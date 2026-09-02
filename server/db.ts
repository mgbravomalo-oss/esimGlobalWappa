import mongoose, { Schema, Document, Model } from 'mongoose';
import { DESTINATIONS as FALLBACK_DESTINATIONS, ESIM_PLANS as FALLBACK_PLANS, DEMO_USERS as FALLBACK_USERS, DEMO_USER_ESIMS as FALLBACK_USER_ESIMS } from '../src/data/esimData';
import { Destination, EsimPlan, User, UserEsim } from '../src/types';

// Fail fast when MongoDB is offline / unconfigured so in-memory fallback responds instantly
mongoose.set('bufferCommands', false);

// ----------------------------------------------------
// Helper for Country Flags
// ----------------------------------------------------
export function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return '🌍';
  const code = countryCode.toUpperCase().trim();
  if (code === 'EU' || code === 'EUR') return '🇪🇺';
  if (code === 'GLOBAL' || code === 'GL' || code === 'WORLD') return '🌐';
  if (code === 'UK') return '🇬🇧';
  if (code.length !== 2) return '🌐';
  try {
    const codePoints = [...code].map(c => 0x1F1E6 + c.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌍';
  }
}

export function normalizeRegion(region?: string): 'europe' | 'asia' | 'americas' | 'global' | 'middle_east' | 'africa' {
  if (!region) return 'global';
  const r = region.toLowerCase();
  if (r.includes('asia') || r.includes('apac')) return 'asia';
  if (r.includes('euro') || r.includes('eur')) return 'europe';
  if (r.includes('north-america') || r.includes('north america') || r.includes('latin') || r.includes('south-america') || r.includes('caribbean') || r.includes('central-america') || r.includes('americ') || r.includes('usa') || r.includes('canada') || r.includes('mexico')) return 'americas';
  if (r.includes('middle') || r.includes('east') || r.includes('gulf')) return 'middle_east';
  if (r.includes('afri')) return 'africa';
  return 'global';
}

// ----------------------------------------------------
// TypeScript Interfaces for MongoDB Documents
// ----------------------------------------------------

export interface IAtlasPlanDoc extends Document {
  planId: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  regionLabel?: string;
  dataGb: number;
  isUnlimited: boolean;
  durationDays: number;
  priceUsd?: number;
  priceEUR?: number;
  speed?: string;
  operators?: string[];
  operator?: string;
  hotspot?: boolean;
  kycRequired?: boolean;
  popular?: boolean;
  bestValue?: boolean;
  apn?: string;
  features?: string[];
  coverageDetails?: string;
  updatedAt?: Date;
}

export interface IAtlasCustomerDoc extends Document {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  country?: string;
  countryCode?: string;
  notes?: string;
  createdAt?: string | Date;
  lastLoginAt?: string | Date;
  totalSpentUsd?: number;
  totalDataUsedGb?: number;
  purchases?: any[];
  activeEsims?: any[];
}

export interface IUserEsimDoc extends Document {
  id: string;
  userId: string;
  userEmail: string;
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
  durationDays?: number;
  pricePaid?: number;
  purchaseDate: string;
  activationDate?: string;
  expiryDate: string;
  status: 'active' | 'ready_to_install' | 'expired' | 'depleted';
  autoRenew: boolean;
  apn: string;
  dataHistory?: { date: string; mbUsed: number }[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ----------------------------------------------------
// Mongoose Schemas & Models
// ----------------------------------------------------

const AtlasPlanSchema = new Schema<IAtlasPlanDoc>(
  {
    planId: { type: String, index: true },
    name: { type: String, required: true },
    country: { type: String, required: true, index: true },
    countryCode: { type: String, required: true, uppercase: true, index: true },
    region: { type: String, index: true },
    regionLabel: { type: String },
    dataGb: { type: Number, required: true },
    isUnlimited: { type: Boolean, default: false },
    durationDays: { type: Number, required: true },
    priceUsd: { type: Number },
    priceEUR: { type: Number },
    speed: { type: String, default: '5G' },
    operators: [{ type: String }],
    operator: { type: String },
    hotspot: { type: Boolean, default: true },
    kycRequired: { type: Boolean, default: false },
    popular: { type: Boolean, default: false },
    bestValue: { type: Boolean, default: false },
    apn: { type: String, default: 'globaldata' },
    features: [{ type: String }],
    coverageDetails: { type: String },
  },
  { strict: false, timestamps: true, collection: 'plans' }
);

const AtlasCustomerSchema = new Schema<IAtlasCustomerDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    phone: { type: String },
    role: { type: String, default: 'user' },
    status: { type: String, default: 'active' },
    country: { type: String },
    countryCode: { type: String },
    notes: { type: String },
    totalSpentUsd: { type: Number, default: 0 },
    totalDataUsedGb: { type: Number, default: 0 },
    purchases: [{ type: Schema.Types.Mixed }],
    activeEsims: [{ type: Schema.Types.Mixed }],
  },
  { strict: false, timestamps: true, collection: 'customers' }
);

const UserEsimSchema = new Schema<IUserEsimDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, index: true },
    iccid: { type: String, required: true },
    planId: { type: String, required: true },
    planName: { type: String, required: true },
    country: { type: String, required: true },
    countryCode: { type: String, required: true, uppercase: true },
    flag: { type: String, required: true },
    operator: { type: String, required: true },
    network5G: { type: Boolean, default: true },
    qrCodeUrl: { type: String, required: true },
    smdpAddress: { type: String, required: true },
    activationCode: { type: String, required: true },
    manualCode: { type: String, required: true },
    totalDataGB: { type: Number, required: true },
    usedDataGB: { type: Number, default: 0 },
    isUnlimited: { type: Boolean, default: false },
    durationDays: { type: Number },
    pricePaid: { type: Number },
    purchaseDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    activationDate: { type: String },
    expiryDate: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'ready_to_install', 'expired', 'depleted'],
      default: 'ready_to_install',
    },
    autoRenew: { type: Boolean, default: false },
    apn: { type: String, default: 'globaldata' },
    dataHistory: [
      {
        date: { type: String },
        mbUsed: { type: Number },
      },
    ],
  },
  { timestamps: true, collection: 'useresims' }
);

export const AtlasPlanModel: Model<IAtlasPlanDoc> =
  mongoose.models.AtlasPlan || mongoose.model<IAtlasPlanDoc>('AtlasPlan', AtlasPlanSchema);

export const AtlasCustomerModel: Model<IAtlasCustomerDoc> =
  mongoose.models.AtlasCustomer || mongoose.model<IAtlasCustomerDoc>('AtlasCustomer', AtlasCustomerSchema);

export const UserEsimModel: Model<IUserEsimDoc> =
  mongoose.models.UserEsim || mongoose.model<IUserEsimDoc>('UserEsim', UserEsimSchema);

// ----------------------------------------------------
// Memory Cache for Aggregated Destinations
// ----------------------------------------------------
let cachedDestinations: Destination[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// ----------------------------------------------------
// Connection Manager
// ----------------------------------------------------
export interface DbStatus {
  isConnected: boolean;
  state: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
  databaseName?: string;
  host?: string;
  hasUriConfigured: boolean;
  totalPlans: number;
  totalDestinations: number;
  totalCustomers: number;
  totalUserEsims: number;
  error?: string | null;
}

let connectionPromise: Promise<typeof mongoose> | null = null;
let lastError: string | null = null;

export async function connectToDatabase(): Promise<boolean> {
  const rawUri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim().replace(/^["']+|["']+$/g, '');

  if (!rawUri) {
    lastError = null;
    return false;
  }

  // Check if rawUri is a placeholder or template string (e.g. contains <cluster>, <user>, etc.)
  if (
    rawUri.includes('<') ||
    rawUri.includes('>') ||
    rawUri.includes('your-cluster') ||
    rawUri.includes('YOUR_') ||
    rawUri.includes('<cluster>') ||
    rawUri.includes('username:password') ||
    rawUri.includes('user:password') ||
    rawUri.includes('undefined') ||
    rawUri.includes('example.com')
  ) {
    lastError = 'El valor de MONGODB_URI contiene marcadores de posición (<cluster>, <user>, etc.). Catálogo local de respaldo activo.';
    console.info(`ℹ️ ${lastError}`);
    return false;
  }

  if (!rawUri.startsWith('mongodb://') && !rawUri.startsWith('mongodb+srv://')) {
    lastError = 'Formato no válido: la cadena de conexión debe comenzar con "mongodb://" o "mongodb+srv://"';
    console.info(`ℹ️ ${lastError}`);
    return false;
  }

  const currentState = mongoose.connection.readyState;
  if (currentState === mongoose.ConnectionStates.connected) {
    return true;
  }

  if (currentState === mongoose.ConnectionStates.connecting && connectionPromise) {
    try {
      await connectionPromise;
      return isDatabaseConnected();
    } catch {
      connectionPromise = null;
      return false;
    }
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas database...');
    
    // Explicitly target database 'plan' where the plans are located
    connectionPromise = mongoose.connect(rawUri, {
      dbName: process.env.MONGODB_DB_NAME || 'plan',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 6000,
    });

    await connectionPromise;
    lastError = null;
    console.log(`✅ MongoDB Atlas connected successfully to database: "${mongoose.connection.name}" on host: ${mongoose.connection.host}`);

    // Prewarm destinations cache
    await fetchDestinationsFromAtlas();

    return true;
  } catch (err: any) {
    connectionPromise = null;
    lastError = err?.message || 'Unknown MongoDB connection error';
    console.warn(`⚠️ MongoDB connection unavailable (${lastError}). The app will seamlessly serve data from the in-memory eSIM catalog.`);
    return false;
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}

export async function getDatabaseStatus(): Promise<DbStatus> {
  const stateMap: Record<number, DbStatus['state']> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = stateMap[mongoose.connection.readyState] || 'uninitialized';
  const isConnected = state === 'connected';
  const rawUri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();
  const hasUriConfigured = Boolean(rawUri && (rawUri.startsWith('mongodb://') || rawUri.startsWith('mongodb+srv://')));

  let totalPlans = 0;
  let totalDestinations = 0;
  let totalCustomers = 0;
  let totalUserEsims = 0;

  if (isConnected) {
    try {
      [totalPlans, totalCustomers, totalUserEsims] = await Promise.all([
        AtlasPlanModel.countDocuments(),
        AtlasCustomerModel.countDocuments(),
        UserEsimModel.countDocuments(),
      ]);

      const dests = await fetchDestinationsFromAtlas();
      totalDestinations = dests.length;
    } catch (err) {
      console.warn('Could not retrieve full counts from MongoDB:', err);
    }
  }

  return {
    isConnected,
    state,
    databaseName: isConnected ? mongoose.connection.name : undefined,
    host: isConnected ? mongoose.connection.host : undefined,
    hasUriConfigured,
    totalPlans: isConnected ? totalPlans : 22,
    totalDestinations: isConnected ? totalDestinations : FALLBACK_DESTINATIONS.length,
    totalCustomers: isConnected ? totalCustomers : FALLBACK_USERS.length,
    totalUserEsims,
    error: lastError,
  };
}

// ----------------------------------------------------
// Normalization Helpers for Plan & Customer Objects
// ----------------------------------------------------

export function mapAtlasPlanToEsimPlan(doc: any): EsimPlan {
  const code = (doc.countryCode || 'GL').toUpperCase().trim();
  const price = doc.priceEUR || doc.priceUsd || 5.0;
  const is5G = typeof doc.speed === 'string' ? doc.speed.includes('5G') : (doc.network5G ?? true);
  
  let operatorStr = 'Red Local 5G';
  if (Array.isArray(doc.operators) && doc.operators.length > 0) {
    operatorStr = doc.operators.join(' / ');
  } else if (typeof doc.operator === 'string' && doc.operator) {
    operatorStr = doc.operator;
  }

  let coverage = '';
  if (Array.isArray(doc.features) && doc.features.length > 0) {
    coverage = doc.features.join('. ');
  } else if (typeof doc.coverageDetails === 'string') {
    coverage = doc.coverageDetails;
  } else {
    coverage = `Cobertura nacional de alta velocidad con ${operatorStr}.`;
  }

  // Validation of isUnlimited from database:
  // A plan is unlimited if:
  // 1) isUnlimited is true in the database (boolean true, string "true", 1, or truthy)
  // 2) durationDays contains or equals the number 1 (e.g. doc.durationDays === 1, doc.durationDays === '1', or doc.validityDays === 1)
  const isUnlimitedPlan = 
    doc.isUnlimited === true || 
    doc.isUnlimited === 'true' || 
    doc.isUnlimited === 'TRUE' || 
    doc.isUnlimited === 1 || 
    (typeof doc.isUnlimited === 'boolean' && doc.isUnlimited) ||
    doc.durationDays === 1 ||
    doc.durationDays === '1' ||
    Number(doc.durationDays) === 1 ||
    doc.validityDays === 1 ||
    doc.validityDays === '1' ||
    Number(doc.validityDays) === 1;

  return {
    id: doc.planId || doc.id || doc._id?.toString() || `plan-${code.toLowerCase()}-${doc.dataGb || 1}gb`,
    name: doc.name || (isUnlimitedPlan ? `${doc.country || code} Datos Ilimitados` : `${doc.country || code} ${doc.dataGb || 1} GB`),
    country: doc.country || code,
    countryCode: code,
    flag: getCountryFlag(code),
    region: (normalizeRegion(doc.region) as any),
    regionName: doc.regionLabel || doc.region || 'Global',
    dataAmountGB: isUnlimitedPlan ? 999 : (doc.dataGb || doc.dataAmountGB || 1),
    isUnlimited: isUnlimitedPlan,
    validityDays: doc.durationDays || doc.validityDays || 30,
    priceEUR: Number(price.toFixed(2)),
    operator: operatorStr,
    network5G: is5G,
    apn: doc.apn || 'globaldata',
    voiceAndSms: Boolean(doc.voiceAndSms),
    tetheringSupported: doc.hotspot ?? (doc.tetheringSupported ?? true),
    coverageDetails: coverage,
    popular: Boolean(doc.popular || doc.bestValue),
  };
}

// ----------------------------------------------------
// Data Access Methods (Queries against 3,064 plans)
// ----------------------------------------------------

export async function fetchDestinationsFromAtlas(): Promise<Destination[]> {
  if (!isDatabaseConnected()) {
    return FALLBACK_DESTINATIONS;
  }

  const now = Date.now();
  if (cachedDestinations && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedDestinations;
  }

  try {
    const rawPlans = await AtlasPlanModel.find({}).lean();
    if (!rawPlans || rawPlans.length === 0) {
      return FALLBACK_DESTINATIONS;
    }

    const destMap = new Map<string, Destination>();

    for (const p of rawPlans) {
      const code = (p.countryCode || 'GL').toUpperCase().trim();
      const price = p.priceEUR || p.priceUsd || 5;
      const isPopular = Boolean(p.popular || p.bestValue);

      if (!destMap.has(code)) {
        const topOps: string[] = [];
        if (Array.isArray(p.operators)) {
          for (const op of p.operators) {
            if (op && !topOps.includes(op) && topOps.length < 3) topOps.push(op);
          }
        } else if (p.operator) {
          topOps.push(p.operator);
        }

        destMap.set(code, {
          id: `dest-${code.toLowerCase()}`,
          name: p.country || code,
          code: code,
          flag: getCountryFlag(code),
          region: normalizeRegion(p.region),
          regionLabel: p.regionLabel || p.region || 'Internacional',
          startingPriceEUR: Number(price.toFixed(2)),
          popular: isPopular,
          popularBadge: p.bestValue ? 'Mejor Valor' : (p.popular ? 'Popular' : undefined),
          topOperators: topOps.length > 0 ? topOps : ['Red 5G Local'],
          plansCount: 1,
        });
      } else {
        const d = destMap.get(code)!;
        d.plansCount++;
        if (price < d.startingPriceEUR) {
          d.startingPriceEUR = Number(price.toFixed(2));
        }
        if (Array.isArray(p.operators)) {
          for (const op of p.operators) {
            if (op && !d.topOperators.includes(op) && d.topOperators.length < 3) {
              d.topOperators.push(op);
            }
          }
        }
        if (isPopular) {
          d.popular = true;
          if (!d.popularBadge) d.popularBadge = 'Popular';
        }
      }
    }

    const list = Array.from(destMap.values()).sort((a, b) => b.plansCount - a.plansCount);
    cachedDestinations = list;
    lastCacheTime = now;
    return list;
  } catch (err) {
    console.error('Error computing destinations from MongoDB Atlas:', err);
    return FALLBACK_DESTINATIONS;
  }
}

export async function fetchPlansFromAtlas(filter?: {
  countryCode?: string;
  region?: string;
  search?: string;
  limit?: number;
  skip?: number;
}): Promise<{ total: number; plans: EsimPlan[] }> {
  if (!isDatabaseConnected()) {
    let list: EsimPlan[] = [];
    if (filter?.countryCode && FALLBACK_PLANS[filter.countryCode.toUpperCase()]) {
      list = FALLBACK_PLANS[filter.countryCode.toUpperCase()];
    } else {
      list = Object.values(FALLBACK_PLANS).flat();
    }
    return { total: list.length, plans: list };
  }

  try {
    const mongoQuery: any = {};

    if (filter?.countryCode) {
      mongoQuery.countryCode = filter.countryCode.toUpperCase();
    }

    if (filter?.region && filter.region !== 'all') {
      const reg = filter.region.toLowerCase();
      if (reg === 'popular') {
        mongoQuery.$or = [{ popular: true }, { bestValue: true }];
      } else {
        mongoQuery.region = { $regex: reg, $options: 'i' };
      }
    }

    if (filter?.search) {
      const s = filter.search.trim();
      mongoQuery.$or = [
        { name: { $regex: s, $options: 'i' } },
        { country: { $regex: s, $options: 'i' } },
        { countryCode: { $regex: s, $options: 'i' } },
        { 'operators': { $regex: s, $options: 'i' } },
      ];
    }

    const total = await AtlasPlanModel.countDocuments(mongoQuery);
    
    let queryBuilder = AtlasPlanModel.find(mongoQuery).sort({ priceUsd: 1, dataGb: 1 });
    if (filter?.skip) queryBuilder = queryBuilder.skip(filter.skip);
    if (filter?.limit) queryBuilder = queryBuilder.limit(filter.limit);

    const docs = await queryBuilder.lean();
    const plans = docs.map(mapAtlasPlanToEsimPlan);

    return { total, plans };
  } catch (err) {
    console.error('Error fetching plans from MongoDB Atlas:', err);
    return { total: 0, plans: [] };
  }
}

export async function fetchCustomersFromAtlas(): Promise<User[]> {
  if (!isDatabaseConnected()) {
    return FALLBACK_USERS;
  }

  try {
    const docs = await AtlasCustomerModel.find({}).lean();
    if (!docs || docs.length === 0) {
      return FALLBACK_USERS;
    }

    return docs.map(d => ({
      id: d.id || d._id?.toString(),
      name: d.name,
      email: d.email,
      phone: d.phone,
      country: d.country || 'España',
      createdAt: typeof d.createdAt === 'string' ? d.createdAt : (d.createdAt ? (d.createdAt as Date).toISOString().split('T')[0] : '2026-08-01'),
      walletBalanceEUR: d.totalSpentUsd ? Number((d.totalSpentUsd * 0.5).toFixed(2)) : 10.0,
    }));
  } catch (err) {
    console.error('Error fetching customers from Atlas:', err);
    return FALLBACK_USERS;
  }
}

export async function fetchCustomerEsimsFromAtlas(userIdOrEmail: string): Promise<UserEsim[]> {
  const esims: UserEsim[] = [];

  if (isDatabaseConnected()) {
    try {
      // 1. Check useresims collection (new purchases)
      const userEsimDocs = await UserEsimModel.find({
        $or: [{ userId: userIdOrEmail }, { userEmail: userIdOrEmail.toLowerCase() }],
      }).sort({ createdAt: -1 }).lean();

      for (const d of userEsimDocs) {
        esims.push({
          id: d.id,
          iccid: d.iccid,
          planId: d.planId,
          planName: d.planName,
          country: d.country,
          countryCode: d.countryCode,
          flag: d.flag,
          operator: d.operator,
          network5G: d.network5G,
          qrCodeUrl: d.qrCodeUrl,
          smdpAddress: d.smdpAddress,
          activationCode: d.activationCode,
          manualCode: d.manualCode,
          totalDataGB: d.totalDataGB,
          usedDataGB: d.usedDataGB,
          isUnlimited: d.isUnlimited,
          purchaseDate: d.purchaseDate,
          activationDate: d.activationDate,
          expiryDate: d.expiryDate,
          status: d.status,
          autoRenew: d.autoRenew,
          apn: d.apn,
          dataHistory: d.dataHistory,
        });
      }

      // 2. Check customer activeEsims in customers collection
      const customer = await AtlasCustomerModel.findOne({
        $or: [{ id: userIdOrEmail }, { email: userIdOrEmail.toLowerCase() }],
      }).lean();

      if (customer && Array.isArray(customer.activeEsims)) {
        for (const active of customer.activeEsims) {
          if (!esims.some(e => e.iccid === active.iccid || e.id === active.esimId)) {
            const countryCode = (active.countryCode || 'GL').toUpperCase();
            const totalGb = active.totalDataGb || 10;
            const usedGb = active.usedDataGb || 0;
            
            esims.push({
              id: active.esimId || `esim-${active.iccid?.slice(-6) || Math.random().toString(36).slice(2, 7)}`,
              iccid: active.iccid || `898520000${Math.floor(Math.random() * 1000000000)}`,
              planId: active.planId || `plan-${countryCode.toLowerCase()}`,
              planName: active.planName || `${active.country || 'Global'} 5G Pass`,
              country: active.country || 'Internacional',
              countryCode: countryCode,
              flag: getCountryFlag(countryCode),
              operator: active.activeOperator || 'Red Local 5G',
              network5G: active.networkType === '5G',
              qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=LPA:1$smdp.globalesim.net$${active.iccid || 'DEMO'}`,
              smdpAddress: 'smdp.globalesim.net',
              activationCode: `${countryCode}-${Math.floor(Math.random() * 9000 + 1000)}-ACTIVATE`,
              manualCode: `LPA:1$smdp.globalesim.net$${countryCode}-${Math.floor(Math.random() * 9000 + 1000)}-ACTIVATE`,
              totalDataGB: totalGb,
              usedDataGB: usedGb,
              isUnlimited: Boolean(
                active.isUnlimited === true || 
                active.isUnlimited === 'true' || 
                active.isUnlimited || 
                active.durationDays === 1 || 
                active.durationDays === '1' ||
                Number(active.durationDays) === 1 ||
                active.validityDays === 1 ||
                active.validityDays === '1' ||
                Number(active.validityDays) === 1
              ),
              purchaseDate: active.purchasedAt ? new Date(active.purchasedAt).toISOString().split('T')[0] : '2026-08-20',
              expiryDate: active.expiresAt ? `${new Date(active.expiresAt).toISOString().split('T')[0]} (Activa)` : '2026-09-30 (Activa)',
              status: active.status === 'ready_to_install' ? 'ready_to_install' : 'active',
              autoRenew: true,
              apn: 'globaldata',
              dataHistory: [
                { date: '26 Ago', mbUsed: 450 },
                { date: '27 Ago', mbUsed: 1100 },
                { date: '28 Ago', mbUsed: 800 },
                { date: '29 Ago', mbUsed: 1350 },
                { date: '30 Ago', mbUsed: 920 },
                { date: '31 Ago', mbUsed: 610 },
              ],
            });
          }
        }
      }
    } catch (err) {
      console.warn('Error reading customer eSIMs from MongoDB:', err);
    }
  }

  if (esims.length === 0) {
    const fallback = FALLBACK_USER_ESIMS[userIdOrEmail] || [];
    return fallback;
  }

  return esims;
}

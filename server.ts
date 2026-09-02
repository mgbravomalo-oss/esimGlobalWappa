import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { DESTINATIONS as FALLBACK_DESTINATIONS, ESIM_PLANS as FALLBACK_PLANS, DEMO_USERS as FALLBACK_USERS } from './src/data/esimData';
import {
  connectToDatabase,
  getDatabaseStatus,
  isDatabaseConnected,
  fetchDestinationsFromAtlas,
  fetchPlansFromAtlas,
  fetchCustomersFromAtlas,
  fetchCustomerEsimsFromAtlas,
  UserEsimModel,
  AtlasCustomerModel,
} from './server/db';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper for Gemini AI
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

// ----------------------------------------------------
// DATABASE STATUS & HEALTH
// ----------------------------------------------------

app.get('/api/health', async (_req: Request, res: Response) => {
  const dbStatus = await getDatabaseStatus();
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    database: {
      provider: 'MongoDB Atlas',
      connected: dbStatus.isConnected,
      state: dbStatus.state,
      databaseName: dbStatus.databaseName,
      totalPlans: dbStatus.totalPlans,
      totalDestinations: dbStatus.totalDestinations,
    },
  });
});

app.get('/api/db/status', async (_req: Request, res: Response) => {
  const status = await getDatabaseStatus();
  res.json({
    success: true,
    ...status,
    message: status.isConnected
      ? `Conectado exitosamente a MongoDB Atlas (Base de datos "${status.databaseName}"). ${status.totalPlans} planes eSIM y ${status.totalDestinations} destinos disponibles.`
      : 'Modo sin conexión o fallback.',
  });
});

// ----------------------------------------------------
// DESTINATIONS (Dynamic across all 3,064 plans)
// ----------------------------------------------------

app.get('/api/destinations', async (req: Request, res: Response) => {
  try {
    const region = req.query.region as string;
    const search = (req.query.search as string || '').toLowerCase().trim();

    let allDestinations = await fetchDestinationsFromAtlas();

    if (region && region !== 'all') {
      if (region === 'popular') {
        allDestinations = allDestinations.filter(d => d.popular);
      } else {
        allDestinations = allDestinations.filter(d => d.region === region);
      }
    }

    if (search) {
      allDestinations = allDestinations.filter(d =>
        d.name.toLowerCase().includes(search) ||
        d.code.toLowerCase().includes(search) ||
        d.regionLabel.toLowerCase().includes(search) ||
        d.topOperators.some(op => op.toLowerCase().includes(search))
      );
    }

    res.json({
      success: true,
      count: allDestinations.length,
      destinations: allDestinations,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, destinations: FALLBACK_DESTINATIONS });
  }
});

// ----------------------------------------------------
// PLANS (Full catalog of 3,064 plans with filter & search)
// ----------------------------------------------------

app.get('/api/plans', async (req: Request, res: Response) => {
  try {
    const countryCode = (req.query.countryCode as string || '').toUpperCase().trim();
    const region = req.query.region as string;
    const search = req.query.search as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const skip = req.query.skip ? parseInt(req.query.skip as string) : undefined;

    const result = await fetchPlansFromAtlas({ countryCode, region, search, limit, skip });

    res.json({
      success: true,
      total: result.total,
      count: result.plans.length,
      plans: result.plans,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// CUSTOMERS & AUTH (From MongoDB Atlas customers collection)
// ----------------------------------------------------

app.get('/api/customers', async (_req: Request, res: Response) => {
  try {
    const customers = await fetchCustomersFromAtlas();
    res.json({ success: true, count: customers.length, customers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, customers: FALLBACK_USERS });
  }
});

// ----------------------------------------------------
// USER & ESIMS MANAGEMENT (CRUD ON MONGODB ATLAS)
// ----------------------------------------------------

// Get User eSIMs
app.get('/api/user/:userId/esims', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const esims = await fetchCustomerEsimsFromAtlas(userId);
    res.json({ success: true, count: esims.length, esims });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Purchase a new eSIM
app.post('/api/user/esims/purchase', async (req: Request, res: Response) => {
  try {
    const { newEsim, user } = req.body;

    if (!newEsim || !user) {
      return res.status(400).json({ success: false, error: 'Missing newEsim or user in payload' });
    }

    if (isDatabaseConnected()) {
      const paidAmount = Number(newEsim.pricePaid || (newEsim.isUnlimited ? 15 : 10));
      const durationDays = Number(newEsim.durationDays || (newEsim.isUnlimited ? 7 : 30));

      // Upsert Customer
      await AtlasCustomerModel.findOneAndUpdate(
        { $or: [{ id: user.id }, { email: user.email.toLowerCase() }] },
        {
          $set: {
            id: user.id,
            name: user.name,
            email: user.email.toLowerCase(),
            phone: user.phone,
            country: user.country,
            lastLoginAt: new Date(),
          },
          $inc: { totalSpentUsd: paidAmount },
          $push: {
            purchases: {
              planId: newEsim.planId,
              planName: newEsim.planName,
              iccid: newEsim.iccid,
              country: newEsim.country,
              durationDays: durationDays,
              isUnlimited: Boolean(newEsim.isUnlimited),
              priceUsd: paidAmount,
              purchasedAt: new Date(),
            },
            activeEsims: {
              iccid: newEsim.iccid,
              planName: newEsim.planName,
              country: newEsim.country,
              totalGb: newEsim.totalDataGB,
              isUnlimited: Boolean(newEsim.isUnlimited),
              durationDays: durationDays,
              purchasedAt: new Date(),
              expiresAt: new Date(Date.now() + durationDays * 86400000),
              status: newEsim.status || 'ready_to_install',
            },
          },
        },
        { upsert: true, new: true }
      );

      // Insert UserEsim record
      const esimDoc = new UserEsimModel({
        id: newEsim.id,
        userId: user.id,
        userEmail: user.email.toLowerCase(),
        iccid: newEsim.iccid,
        planId: newEsim.planId,
        planName: newEsim.planName,
        country: newEsim.country,
        countryCode: (newEsim.countryCode || 'GL').toUpperCase(),
        flag: newEsim.flag || '🌍',
        operator: newEsim.operator || 'Red 5G',
        network5G: Boolean(newEsim.network5G),
        qrCodeUrl: newEsim.qrCodeUrl,
        smdpAddress: newEsim.smdpAddress,
        activationCode: newEsim.activationCode,
        manualCode: newEsim.manualCode,
        totalDataGB: newEsim.totalDataGB,
        usedDataGB: newEsim.usedDataGB || 0,
        isUnlimited: Boolean(newEsim.isUnlimited),
        durationDays: durationDays,
        pricePaid: paidAmount,
        purchaseDate: newEsim.purchaseDate || new Date().toISOString().split('T')[0],
        expiryDate: newEsim.expiryDate,
        activationDate: newEsim.activationDate,
        status: newEsim.status || 'ready_to_install',
        autoRenew: Boolean(newEsim.autoRenew),
        apn: newEsim.apn || 'globaldata',
        dataHistory: newEsim.dataHistory || [],
      });

      await esimDoc.save();
      console.log(`💾 Saved new eSIM ${newEsim.iccid} for ${user.email} in MongoDB Atlas.`);

      return res.json({ success: true, esim: esimDoc, source: 'mongodb' });
    }

    // Fallback response
    res.json({ success: true, esim: newEsim, source: 'in-memory' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Top Up eSIM
app.post('/api/user/esims/topup', async (req: Request, res: Response) => {
  try {
    const { esimId, addedGB } = req.body;

    if (!esimId || typeof addedGB !== 'number') {
      return res.status(400).json({ success: false, error: 'esimId and addedGB are required' });
    }

    if (isDatabaseConnected()) {
      const esim = await UserEsimModel.findOne({ id: esimId });
      if (esim) {
        esim.totalDataGB += addedGB;
        if (esim.status === 'depleted') {
          esim.status = 'active';
        }
        await esim.save();
        return res.json({ success: true, esim, source: 'mongodb' });
      }
    }

    res.json({ success: true, addedGB, esimId, source: 'in-memory' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// User Auth / Profile Sync
app.post('/api/auth/sync', async (req: Request, res: Response) => {
  try {
    const { user } = req.body;
    if (!user || !user.email) {
      return res.status(400).json({ success: false, error: 'User data required' });
    }

    if (isDatabaseConnected()) {
      const savedUser = await AtlasCustomerModel.findOneAndUpdate(
        { $or: [{ id: user.id }, { email: user.email.toLowerCase() }] },
        {
          $set: {
            id: user.id,
            name: user.name,
            email: user.email.toLowerCase(),
            phone: user.phone,
            country: user.country,
          },
        },
        { upsert: true, new: true }
      ).lean();

      return res.json({ success: true, user: savedUser, source: 'mongodb' });
    }

    res.json({ success: true, user, source: 'in-memory' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// AI TRAVEL ADVISOR
// ----------------------------------------------------
app.post('/api/ai/recommend', async (req: Request, res: Response): Promise<void> => {
  try {
    const { destination, days, usage } = req.body;
    const ai = getGeminiClient();

    // Query matched plans from Atlas
    const destName = destination || '';
    const plansResult = await fetchPlansFromAtlas({ search: destName, limit: 10 });
    const plans = plansResult.plans.length > 0 ? plansResult.plans : (FALLBACK_PLANS['JP'] || []);
    
    let chosenPlan = plans[1] || plans[0];
    if (usage === 'heavy' || parseInt(days) > 15) {
      chosenPlan = plans[plans.length - 1] || plans[0];
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Eres un asistente experto en viajes internacionales y telecomunicaciones eSIM para Wappa.
El usuario viaja a: "${destination}" por ${days} días, con un perfil de uso "${usage}" (donde light=básico/mensajería, standard=redes/fotos, heavy=streaming/hotspot).
Tenemos disponibles los siguientes planes para ese destino: ${plans.map(p => `${p.name} (${p.dataAmountGB}GB, ${p.validityDays} días, $${p.priceEUR})`).join('; ')}.
Plan sugerido: ${chosenPlan.name} (${chosenPlan.dataAmountGB}GB, $${chosenPlan.priceEUR}).

Genera una respuesta concisa en JSON estricto con:
{
  "summary": "Explicación breve y profesional de por qué este paquete de datos es ideal",
  "tips": ["Consejo práctico 1 para ahorrar datos en ese destino", "Consejo 2 sobre cobertura local", "Consejo 3 sobre mapas o roaming"]
}`
        });

        const text = response.text || '';
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);

        res.json({
          success: true,
          recommendation: {
            summary: parsed.summary || `Recomendación óptima para ${days} días en ${destination}.`,
            recommendedPlan: chosenPlan,
            tips: parsed.tips || [
              `Descarga mapas offline antes de salir.`,
              `Configura la copia de seguridad de fotos solo en Wi-Fi.`,
              `Disfruta de conexión 5G con la red ${chosenPlan.operator}.`
            ]
          }
        });
        return;
      } catch (geminiErr) {
        console.warn('Gemini AI fallback triggered:', geminiErr);
      }
    }

    // Default fallback
    res.json({
      success: true,
      recommendation: {
        summary: `Para tu estancia de ${days} días en ${destination || 'tu destino'} con uso ${usage === 'heavy' ? 'intensivo' : 'habitual'}, te recomendamos el plan ${chosenPlan.name} (${chosenPlan.dataAmountGB} GB) en la red ${chosenPlan.operator}.`,
        recommendedPlan: chosenPlan,
        tips: [
          `Descarga los mapas offline de la zona en Google Maps antes del vuelo.`,
          `Desactiva la sincronización en segundo plano de apps pesadas para maximizar tus ${chosenPlan.dataAmountGB} GB.`,
          `La red ${chosenPlan.operator} ofrece cobertura 5G directa y soporte para compartir datos.`
        ]
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// DATABASE OFFLINE FALLBACK ERROR MIDDLEWARE
// ----------------------------------------------------
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err && (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out')))) {
    console.warn('[AI Studio] Database offline or timed out — returning graceful fallback');
    if (req.method === 'GET') {
      return res.json({ success: true, count: 0, items: [] });
    }
    return res.status(503).json({ success: false, error: 'Database offline — operation not completed' });
  }
  next(err);
});

// ----------------------------------------------------
// VITE & SERVER INITIALIZATION
// ----------------------------------------------------
async function startServer() {
  // Connect to MongoDB Atlas (if configured)
  try {
    await connectToDatabase();
  } catch (err: any) {
    console.warn('Initial database connection note:', err?.message || err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Wappa eSIM Server running on http://localhost:${PORT}`);
  });
}

startServer();

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Globe, 
  Flame, 
  Shield, 
  Wifi, 
  Zap, 
  Check, 
  ArrowRight, 
  Smartphone, 
  Sparkles, 
  X, 
  Database, 
  Loader2, 
  RefreshCw, 
  Infinity as InfinityIcon,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { Destination, EsimPlan } from '../types';
import { DESTINATIONS as FALLBACK_DESTINATIONS, ESIM_PLANS as FALLBACK_PLANS } from '../data/esimData';

interface DestinationsCatalogProps {
  onSelectPlanForPurchase: (plan: EsimPlan) => void;
  onOpenAdvisor: () => void;
}

type SortOption = 'popular' | 'name_asc' | 'price_asc' | 'plans_desc';
type ViewMode = 'grid' | 'list';

export const DestinationsCatalog: React.FC<DestinationsCatalogProps> = ({
  onSelectPlanForPurchase,
  onOpenAdvisor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(12);
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);

  // Dynamic MongoDB Atlas data
  const [destinations, setDestinations] = useState<Destination[]>(FALLBACK_DESTINATIONS);
  const [totalAtlasPlans, setTotalAtlasPlans] = useState<number>(3064);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(true);
  
  // Destination plans loader
  const [destinationPlans, setDestinationPlans] = useState<EsimPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(false);
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<'all' | 'unlimited' | 'standard' | 'high_data'>('all');

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion, selectedLetter, sortBy, itemsPerPage]);

  // Fetch all destinations from MongoDB Atlas
  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        setIsLoadingDestinations(true);
        const [destRes, statusRes] = await Promise.all([
          fetch('/api/destinations'),
          fetch('/api/db/status'),
        ]);

        const destData = await destRes.json();
        const statusData = await statusRes.json();

        if (isMounted) {
          if (destData.success && Array.isArray(destData.destinations) && destData.destinations.length > 0) {
            setDestinations(destData.destinations);
          }
          if (statusData.totalPlans) {
            setTotalAtlasPlans(statusData.totalPlans);
          }
        }
      } catch (err) {
        console.warn('Error loading dynamic destinations from MongoDB:', err);
      } finally {
        if (isMounted) setIsLoadingDestinations(false);
      }
    }

    loadCatalog();
    return () => { isMounted = false; };
  }, []);

  // Fetch plans when opening a destination modal
  useEffect(() => {
    if (!activeDestination) {
      setDestinationPlans([]);
      return;
    }

    let isMounted = true;
    async function loadPlansForDest(code: string) {
      setIsLoadingPlans(true);
      try {
        const res = await fetch(`/api/plans?countryCode=${encodeURIComponent(code)}`);
        const data = await res.json();
        if (isMounted) {
          if (data.success && Array.isArray(data.plans) && data.plans.length > 0) {
            setDestinationPlans(data.plans);
          } else if (FALLBACK_PLANS[code.toUpperCase()]) {
            setDestinationPlans(FALLBACK_PLANS[code.toUpperCase()]);
          } else {
            setDestinationPlans(generateFallbackPlans(activeDestination!));
          }
        }
      } catch {
        if (isMounted) {
          const fallback = FALLBACK_PLANS[code.toUpperCase()] || generateFallbackPlans(activeDestination!);
          setDestinationPlans(fallback);
        }
      } finally {
        if (isMounted) setIsLoadingPlans(false);
      }
    }

    loadPlansForDest(activeDestination.code);
    return () => { isMounted = false; };
  }, [activeDestination]);

  // Helper for generating dynamic fallback if needed
  function generateFallbackPlans(dest: Destination): EsimPlan[] {
    const code = dest.code;
    return [
      {
        id: `plan-${code.toLowerCase()}-1gb`,
        name: `${dest.name} Básico 1 GB`,
        country: dest.name,
        countryCode: code,
        flag: dest.flag,
        region: 'local',
        dataAmountGB: 1,
        isUnlimited: false,
        validityDays: 7,
        priceEUR: dest.startingPriceEUR || 4.5,
        operator: dest.topOperators[0] || 'Red Local 5G',
        network5G: true,
        apn: 'globaldata',
        voiceAndSms: false,
        tetheringSupported: true,
        coverageDetails: 'Cobertura nacional en alta velocidad con entrega instantánea.',
      },
      {
        id: `plan-${code.toLowerCase()}-5gb`,
        name: `${dest.name} Estándar 5 GB`,
        country: dest.name,
        countryCode: code,
        flag: dest.flag,
        region: 'local',
        dataAmountGB: 5,
        isUnlimited: false,
        validityDays: 30,
        priceEUR: Number(((dest.startingPriceEUR || 4.5) * 2.2).toFixed(2)),
        operator: dest.topOperators[0] || 'Red Local 5G',
        network5G: true,
        apn: 'globaldata',
        voiceAndSms: false,
        tetheringSupported: true,
        coverageDetails: 'Paquete recomendado para viajes de 2 a 4 semanas.',
        popular: true,
      },
    ];
  }

  // Extract available initial letters for quick filtering
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    destinations.forEach(d => {
      if (d.name && d.name.trim().length > 0) {
        letters.add(d.name.trim()[0].toUpperCase());
      }
    });
    return Array.from(letters).sort();
  }, [destinations]);

  // Filtered and Sorted destinations list
  const sortedAndFilteredDestinations = useMemo(() => {
    const filtered = destinations.filter(dest => {
      const matchesSearch =
        dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.regionLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dest.topOperators.some(op => op.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Region Filter
      if (selectedRegion === 'popular' && !dest.popular) return false;
      if (selectedRegion !== 'all' && selectedRegion !== 'popular' && dest.region !== selectedRegion) return false;

      // Letter Filter (when in 'all' or specific search)
      if (selectedLetter !== 'all') {
        if (!dest.name.toUpperCase().startsWith(selectedLetter)) return false;
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'popular') {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return b.plansCount - a.plansCount;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name, 'es');
      }
      if (sortBy === 'price_asc') {
        return a.startingPriceEUR - b.startingPriceEUR;
      }
      if (sortBy === 'plans_desc') {
        return b.plansCount - a.plansCount;
      }
      return 0;
    });
  }, [destinations, searchTerm, selectedRegion, selectedLetter, sortBy]);

  // Pagination calculation
  const totalItems = sortedAndFilteredDestinations.length;
  const isAllShown = itemsPerPage >= 999;
  const totalPages = isAllShown ? 1 : Math.ceil(totalItems / itemsPerPage);
  const paginatedDestinations = useMemo(() => {
    if (isAllShown) return sortedAndFilteredDestinations;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredDestinations.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredDestinations, currentPage, itemsPerPage, isAllShown]);

  // Filter plans inside active destination modal
  const filteredModalPlans = useMemo(() => {
    if (selectedPlanFilter === 'unlimited') {
      return destinationPlans.filter(p => p.isUnlimited);
    }
    if (selectedPlanFilter === 'standard') {
      return destinationPlans.filter(p => !p.isUnlimited && p.dataAmountGB <= 10);
    }
    if (selectedPlanFilter === 'high_data') {
      return destinationPlans.filter(p => !p.isUnlimited && p.dataAmountGB > 10);
    }
    return destinationPlans;
  }, [destinationPlans, selectedPlanFilter]);

  return (
    <div className="space-y-6">
      
      {/* Hero Banner with Search */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sin roaming ni tarjetas SIM físicas</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>{totalAtlasPlans.toLocaleString()} Planes en MongoDB Atlas ({destinations.length} Destinos)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            eSIMs Internacionales para Viajar Conectado
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Conexión 5G/4G inmediata en {destinations.length} destinos con catálogo en vivo de {totalAtlasPlans.toLocaleString()} planes. Escanea el código QR y empieza a navegar al instante.
          </p>

          {/* Search bar inside hero */}
          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Busca por país o código (ej. Japón, España, Estados Unidos, Tailandia, EU, MX...)"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:bg-white/15 focus:border-emerald-400 transition-all backdrop-blur-xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={onOpenAdvisor}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Asistente IA de Viajes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Region Filter Chips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => { setSelectedRegion('all'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRegion === 'all'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Todos ({destinations.length})
          </button>
          <button
            onClick={() => { setSelectedRegion('popular'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              selectedRegion === 'popular'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Populares</span>
          </button>
          <button
            onClick={() => { setSelectedRegion('europe'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRegion === 'europe'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            🇪🇺 Europa
          </button>
          <button
            onClick={() => { setSelectedRegion('asia'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRegion === 'asia'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            🇯🇵 Asia
          </button>
          <button
            onClick={() => { setSelectedRegion('americas'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRegion === 'americas'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            🌎 América
          </button>
          <button
            onClick={() => { setSelectedRegion('middle_east'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRegion === 'middle_east'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            🕌 Medio Oriente
          </button>
          <button
            onClick={() => { setSelectedRegion('africa'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRegion === 'africa'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            🌍 África
          </button>
          <button
            onClick={() => { setSelectedRegion('global'); setSelectedLetter('all'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRegion === 'global'
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            🌐 Global Pass
          </button>
        </div>

        {/* Alphabet Quick Filter (Only when 'Todos' or when there are more than 15 results) */}
        {selectedRegion === 'all' && availableLetters.length > 5 && (
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 px-1 bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider shrink-0">
              Inicial:
            </span>
            <button
              onClick={() => setSelectedLetter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors shrink-0 ${
                selectedLetter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Todas
            </button>
            {availableLetters.map((letter) => (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold transition-colors shrink-0 ${
                  selectedLetter === letter
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar: Counter, Sort by, View Mode & Items per page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-100">{totalItems}</span>
          <span>{totalItems === 1 ? 'destino disponible' : 'destinos disponibles'}</span>
          {!isAllShown && totalPages > 1 && (
            <span className="text-slate-400 font-mono text-[11px]">
              • Página {currentPage} de {totalPages}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer pr-1 dark:bg-slate-900"
            >
              <option value="popular" className="dark:bg-slate-900 dark:text-slate-100">Más Populares</option>
              <option value="name_asc" className="dark:bg-slate-900 dark:text-slate-100">Alfabético (A-Z)</option>
              <option value="price_asc" className="dark:bg-slate-900 dark:text-slate-100">Menor Precio</option>
              <option value="plans_desc" className="dark:bg-slate-900 dark:text-slate-100">Más Planes</option>
            </select>
          </div>

          {/* Items per page Selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-xs text-slate-600 dark:text-slate-400 shadow-2xs">
            <button
              onClick={() => setItemsPerPage(12)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                itemsPerPage === 12 ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Mostrar 12 por página"
            >
              12
            </button>
            <button
              onClick={() => setItemsPerPage(24)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                itemsPerPage === 24 ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Mostrar 24 por página"
            >
              24
            </button>
            <button
              onClick={() => setItemsPerPage(9999)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                isAllShown ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Mostrar todos de golpe"
            >
              Todos
            </button>
          </div>

          {/* View Mode Toggle (Grid vs List) */}
          <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'list' ? 'bg-slate-900 dark:bg-emerald-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Vista en Lista Compacta"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Destinations Content (Grid or List) */}
      {isLoadingDestinations ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Cargando planes y destinos desde MongoDB Atlas...</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sincronizando catálogo en vivo.</p>
        </div>
      ) : sortedAndFilteredDestinations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-xs">
          <Globe className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No encontramos destinos para tu búsqueda</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {searchTerm ? `No hay resultados para "${searchTerm}".` : 'Prueba cambiando los filtros seleccionados.'}
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedRegion('all'); setSelectedLetter('all'); }}
            className="mt-3 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            Ver todos los destinos
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW: Clean, modern cards with calm, deliberate spacing */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedDestinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => setActiveDestination(dest)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl leading-none shrink-0">{dest.flag}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                        {dest.name}
                      </h3>
                      <span className="text-[11px] text-slate-400 block truncate">
                        {dest.regionLabel} • {dest.code}
                      </span>
                    </div>
                  </div>

                  {dest.popularBadge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      {dest.popularBadge}
                    </span>
                  )}
                </div>

                {/* Operator chips */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Redes:</span>
                  {dest.topOperators.slice(0, 2).map((op, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]"
                    >
                      {op}
                    </span>
                  ))}
                  {dest.topOperators.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{dest.topOperators.length - 2}</span>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Desde</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                    ${dest.startingPriceEUR.toFixed(2)}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-2xs">
                  <span>{dest.plansCount} {dest.plansCount === 1 ? 'Plan' : 'Planes'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW: Compact, streamlined table/list rows for easy scanning */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 shadow-2xs overflow-hidden">
          {paginatedDestinations.map((dest) => (
            <div
              key={dest.id}
              onClick={() => setActiveDestination(dest)}
              className="p-3.5 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl leading-none shrink-0">{dest.flag}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                      {dest.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">({dest.code})</span>
                    {dest.popularBadge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {dest.popularBadge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{dest.regionLabel}</span>
                    <span>•</span>
                    <span className="truncate">Redes: {dest.topOperators.join(', ')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">Desde</span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                    ${dest.startingPriceEUR.toFixed(2)}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600 text-white text-xs font-semibold transition-colors shadow-2xs">
                  <span>Ver {dest.plansCount} {dest.plansCount === 1 ? 'Plan' : 'Planes'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!isAllShown && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Mostrando <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            de <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> destinos
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition-colors shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((pageNumber, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const showEllipsis = prevPage && pageNumber - prevPage > 1;
                  return (
                    <React.Fragment key={pageNumber}>
                      {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                      <button
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                          currentPage === pageNumber
                            ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-medium flex items-center gap-1 transition-colors shadow-2xs"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Destination Plan Selector Modal / Drawer */}
      {activeDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-xl relative overflow-hidden text-slate-900 dark:text-slate-100 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-4xl leading-none">{activeDestination.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeDestination.name} ({activeDestination.code})</h2>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      5G / 4G LTE
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {destinationPlans.length} planes en MongoDB Atlas
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Operadores: {activeDestination.topOperators.join(' • ')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveDestination(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Filter Sub-tabs */}
            <div className="pt-3 pb-1 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setSelectedPlanFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedPlanFilter === 'all'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todos ({destinationPlans.length})
              </button>
              <button
                onClick={() => setSelectedPlanFilter('unlimited')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedPlanFilter === 'unlimited'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <InfinityIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ilimitados ({destinationPlans.filter(p => p.isUnlimited).length})</span>
              </button>
              <button
                onClick={() => setSelectedPlanFilter('standard')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedPlanFilter === 'standard'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                1 - 10 GB
              </button>
              <button
                onClick={() => setSelectedPlanFilter('high_data')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedPlanFilter === 'high_data'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                +10 GB
              </button>
            </div>

            {/* Plan Cards inside Modal */}
            <div className="py-4 overflow-y-auto max-h-[60vh] pr-1">
              {isLoadingPlans ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs">Consultando planes en vivo desde MongoDB Atlas...</span>
                </div>
              ) : filteredModalPlans.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No hay planes en este filtro para este destino.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredModalPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                        plan.isUnlimited
                          ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/40 dark:from-emerald-950/40 to-white dark:to-slate-900 shadow-xs'
                          : plan.popular
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div>
                        {/* Top Header Row with Title and Badge (Flex layout prevents overlapping) */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 min-w-0">
                            {plan.isUnlimited ? (
                              <>
                                <InfinityIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span className="text-emerald-800 dark:text-emerald-300 font-extrabold text-sm truncate">Datos Ilimitados</span>
                              </>
                            ) : (
                              <span className="text-sm">{plan.dataAmountGB} GB</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {plan.isUnlimited && (
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-700 text-white shadow-2xs flex items-center gap-0.5 tracking-tight uppercase">
                                <InfinityIcon className="w-2.5 h-2.5" /> Ilimitado
                              </span>
                            )}
                            {plan.popular && !plan.isUnlimited && (
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-2xs tracking-tight uppercase">
                                Popular
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                          {plan.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {plan.isUnlimited
                            ? `Precio base por día (elige tus días) • Red ${plan.operator}`
                            : `Válido por ${plan.validityDays} días • Red ${plan.operator}`}
                        </div>

                        <div className="mt-2.5 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>{plan.network5G ? '5G Ultra Low-Latency' : '4G LTE Alta Velocidad'}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span>Compartir datos (Tethering / Hotspot)</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                            {plan.isUnlimited ? 'Precio / Día' : 'Precio'}
                          </span>
                          <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                            ${plan.priceEUR.toFixed(2)}
                            {plan.isUnlimited && <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400"> /día</span>}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            onSelectPlanForPurchase(plan);
                            setActiveDestination(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


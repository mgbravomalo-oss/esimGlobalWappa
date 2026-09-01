import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Zap,
  Check,
  Copy,
  Info,
  Clock,
  Radio,
  Plus,
  Wifi,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Signal
} from 'lucide-react';
import { User, UserEsim } from '../types';
import { QrCodeModal } from './QrCodeModal';
import { TopUpModal } from './TopUpModal';

interface MyEsimsViewProps {
  user: User;
  esims: UserEsim[];
  onNavigateToStore: () => void;
  onTopUpEsim: (esimId: string, addedGB: number, price: number) => void;
}

export const MyEsimsView: React.FC<MyEsimsViewProps> = ({
  user,
  esims,
  onNavigateToStore,
  onTopUpEsim
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ready_to_install' | 'expired'>('all');
  const [selectedEsimForQr, setSelectedEsimForQr] = useState<UserEsim | null>(null);
  const [selectedEsimForTopUp, setSelectedEsimForTopUp] = useState<UserEsim | null>(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);
  const [copiedIccid, setCopiedIccid] = useState<string | null>(null);

  const filteredEsims = esims.filter(e => {
    if (filterStatus === 'all') return true;
    return e.status === filterStatus;
  });

  const handleCopyIccid = (iccid: string) => {
    navigator.clipboard.writeText(iccid);
    setCopiedIccid(iccid);
    setTimeout(() => setCopiedIccid(null), 2000);
  };

  const getStatusBadge = (status: UserEsim['status']) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Activa &amp; Conectada
          </span>
        );
      case 'ready_to_install':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Lista para Instalar
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            Caducada
          </span>
        );
      case 'depleted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Datos Agotados
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center font-bold text-xl shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Mis eSIMs Internacionales</h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {esims.length} {esims.length === 1 ? 'eSIM' : 'eSIMs'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestiona el consumo de datos, códigos QR y recargas para {user.name} ({user.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={onNavigateToStore}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>Comprar Nueva eSIM</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterStatus === 'all'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Todas ({esims.length})
        </button>
        <button
          onClick={() => setFilterStatus('active')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterStatus === 'active'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Activas ({esims.filter(e => e.status === 'active').length})
        </button>
        <button
          onClick={() => setFilterStatus('ready_to_install')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterStatus === 'ready_to_install'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Listas para Instalar ({esims.filter(e => e.status === 'ready_to_install').length})
        </button>
        <button
          onClick={() => setFilterStatus('expired')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterStatus === 'expired'
              ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          Historial / Caducadas ({esims.filter(e => e.status === 'expired' || e.status === 'depleted').length})
        </button>
      </div>

      {/* eSIMs List or Empty State */}
      {filteredEsims.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No hay eSIMs en esta categoría</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {filterStatus === 'all'
                ? 'Aún no tienes ninguna eSIM comprada. Explora nuestro catálogo de más de 140 destinos.'
                : 'No se encontraron eSIMs con el filtro seleccionado.'}
            </p>
          </div>
          <button
            onClick={onNavigateToStore}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>Explorar Destinos Disponibles</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredEsims.map((esim) => {
            const isExpanded = expandedDetailsId === esim.id;
            const remainingGB = Math.max(0, esim.totalDataGB - esim.usedDataGB);
            const remainingPct = esim.isUnlimited
              ? 100
              : Math.round((remainingGB / esim.totalDataGB) * 100);

            return (
              <div
                key={esim.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl leading-none">{esim.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{esim.country}</h3>
                          {esim.network5G && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              5G ULTRA
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">{esim.planName}</span>
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(esim.status)}
                    </div>
                  </div>

                  {/* ICCID and Network Info */}
                  <div className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono">
                      <span>ICCID:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{esim.iccid}</span>
                      <button
                        onClick={() => handleCopyIccid(esim.iccid)}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title="Copiar ICCID"
                      >
                        {copiedIccid === esim.iccid ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
                      <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{esim.operator}</span>
                    </div>
                  </div>

                  {/* Data Usage Meter */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 dark:text-slate-300">Balance de Datos:</span>
                      {esim.isUnlimited ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Datos Ilimitados</span>
                      ) : (
                        <span className="text-slate-900 dark:text-slate-100 font-mono">
                          <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{remainingGB.toFixed(1)} GB</strong> / {esim.totalDataGB} GB restantes
                        </span>
                      )}
                    </div>

                    {!esim.isUnlimited && (
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            remainingPct > 40
                              ? 'bg-emerald-500'
                              : remainingPct > 15
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${remainingPct}%` }}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {esim.expiryDate}
                      </span>
                      <span>Consumido: {esim.usedDataGB.toFixed(1)} GB</span>
                    </div>
                  </div>

                  {/* Expandable Network Settings / APN */}
                  {isExpanded && (
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl mb-3 space-y-2.5 text-xs animate-fade-in">
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 pb-1 border-b border-slate-200 dark:border-slate-700">
                        <Wifi className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Configuración de Red &amp; APN para {esim.country}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-semibold">Punto de Acceso (APN):</span>
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{esim.apn}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-semibold">Itinerancia de Datos:</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">Debe estar ACTIVA</span>
                        </div>
                      </div>
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-[11px] text-amber-900 dark:text-amber-300 leading-tight flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                        <span>Recuerda seleccionar esta eSIM como la línea principal de datos móviles al aterrizar.</span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setExpandedDetailsId(isExpanded ? null : esim.id)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>{isExpanded ? 'Ocultar APN' : 'Ver APN & Roaming'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedEsimForTopUp(esim)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Recargar Datos</span>
                    </button>
                    
                    <button
                      onClick={() => setSelectedEsimForQr(esim)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver Código QR</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      <QrCodeModal
        esim={selectedEsimForQr}
        isOpen={Boolean(selectedEsimForQr)}
        onClose={() => setSelectedEsimForQr(null)}
      />

      {/* Top Up Modal */}
      <TopUpModal
        esim={selectedEsimForTopUp}
        isOpen={Boolean(selectedEsimForTopUp)}
        onClose={() => setSelectedEsimForTopUp(null)}
        onConfirmTopUp={onTopUpEsim}
      />

    </div>
  );
};

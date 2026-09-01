import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Smartphone, Info, Download, ShieldCheck } from 'lucide-react';
import { UserEsim } from '../types';

interface QrCodeModalProps {
  esim: UserEsim | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ esim, isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [guideTab, setGuideTab] = useState<'ios' | 'android'>('ios');

  if (!isOpen || !esim) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-lg">
              {esim.flag}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{esim.planName}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">ICCID: {esim.iccid}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* QR Container */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center flex flex-col items-center">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs mb-3 inline-block">
              <img
                src={esim.qrCodeUrl}
                alt="Código QR de activación eSIM"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Escanea este código QR con la cámara de tu teléfono compatible
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Conexión Wi-Fi requerida durante la instalación (aprox. 1-2 minutos)
            </p>
          </div>

          {/* Manual Activation Codes */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              ¿No puedes escanear el QR? Instalación Manual
            </span>

            {/* SM-DP+ Address */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
              <div className="overflow-hidden pr-2">
                <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 block font-sans font-bold">Dirección SM-DP+</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate block">{esim.smdpAddress}</span>
              </div>
              <button
                onClick={() => handleCopy(esim.smdpAddress, 'smdp')}
                className="p-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-xs shrink-0 flex items-center gap-1 text-[11px]"
              >
                {copiedKey === 'smdp' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar</span>
              </button>
            </div>

            {/* Activation Code */}
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 flex items-center justify-between text-xs font-mono">
              <div className="overflow-hidden pr-2">
                <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 block font-sans font-bold">Código de Activación</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold truncate block">{esim.activationCode}</span>
              </div>
              <button
                onClick={() => handleCopy(esim.activationCode, 'act')}
                className="p-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-xs shrink-0 flex items-center gap-1 text-[11px]"
              >
                {copiedKey === 'act' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar</span>
              </button>
            </div>
          </div>

          {/* Device tabs */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setGuideTab('ios')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  guideTab === 'ios'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                iPhone (iOS)
              </button>
              <button
                onClick={() => setGuideTab('android')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                  guideTab === 'android'
                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Android / Samsung / Pixel
              </button>
            </div>

            {guideTab === 'ios' ? (
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <li>Ve a <strong>Ajustes &gt; Datos móviles</strong>.</li>
                <li>Pulsa en <strong>Añadir eSIM</strong> o <strong>Añadir plan de datos</strong>.</li>
                <li>Selecciona <strong>Usar código QR</strong> y enfoca este código.</li>
                <li>Al llegar al destino, activa la <strong>Itinerancia de datos</strong> para esta eSIM.</li>
              </ol>
            ) : (
              <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-decimal list-inside bg-slate-50 dark:bg-slate-800/70 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <li>Ve a <strong>Ajustes &gt; Conexiones &gt; Administrador de SIM</strong>.</li>
                <li>Pulsa en <strong>Añadir eSIM</strong>.</li>
                <li>Escanea el código QR y confirma la descarga.</li>
                <li>Activa la <strong>Itinerancia / Roaming de datos</strong> para comenzar a navegar.</li>
              </ol>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Listo, ya he guardado los datos
          </button>
        </div>

      </div>
    </div>
  );
};

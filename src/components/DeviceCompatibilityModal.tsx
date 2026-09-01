import React, { useState } from 'react';
import { X, Search, Check, Smartphone, AlertCircle, HelpCircle } from 'lucide-react';
import { COMPATIBLE_DEVICES } from '../data/esimData';

interface DeviceCompatibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceCompatibilityModal: React.FC<DeviceCompatibilityModalProps> = ({
  isOpen,
  onClose
}) => {
  const [searchPhone, setSearchPhone] = useState('');

  if (!isOpen) return null;

  const filteredBrands = COMPATIBLE_DEVICES.map(b => ({
    ...b,
    models: b.models.filter(m => m.toLowerCase().includes(searchPhone.toLowerCase()))
  })).filter(b => b.models.length > 0 || searchPhone === '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-xl relative overflow-hidden text-slate-900 dark:text-white max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Dispositivos Compatibles con eSIM</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Verifica si tu teléfono soporta tecnología eSIM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="py-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Buscar modelo (ej. iPhone 15, Galaxy S24, Pixel 8...)"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-2">
          {/* Quick code check */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3 text-xs text-emerald-950 dark:text-emerald-300 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Comprobación rápida mediante teclado:</span>
              <span>Marca <strong>*#06#</strong> en tu teléfono. Si aparece un número <strong>EID</strong> (código de 32 dígitos), tu dispositivo es 100% compatible con eSIM.</span>
            </div>
          </div>

          {filteredBrands.map((brand) => (
            <div key={brand.brand} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 bg-white dark:bg-slate-850/50">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>{brand.brand}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">{brand.instructions}</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-xs text-slate-700 dark:text-slate-300">
                {brand.models.map((model, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px]">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{model}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};

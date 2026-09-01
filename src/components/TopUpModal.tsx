import React, { useState } from 'react';
import { X, Zap, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { UserEsim } from '../types';

interface TopUpModalProps {
  esim: UserEsim | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmTopUp: (esimId: string, addedGB: number, price: number) => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  esim,
  isOpen,
  onClose,
  onConfirmTopUp
}) => {
  const [selectedPack, setSelectedPack] = useState<{ gb: number; price: number; days: number }>({
    gb: 3,
    price: 8.50,
    days: 15
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !esim) return null;

  const PACKS = [
    { gb: 1, price: 4.00, days: 7, label: '+1 GB' },
    { gb: 3, price: 8.50, days: 15, label: '+3 GB', popular: true },
    { gb: 5, price: 12.00, days: 30, label: '+5 GB' },
    { gb: 10, price: 19.50, days: 30, label: '+10 GB' }
  ];

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      onConfirmTopUp(esim.id, selectedPack.gb, selectedPack.price);
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative overflow-hidden text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Recargar Datos para eSIM</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{esim.country} - {esim.operator}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">¡Recarga Completada!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Se han añadido <strong>{selectedPack.gb} GB</strong> a tu eSIM existente sin necesidad de volver a escanear el QR.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Selecciona paquete de datos adicional
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {PACKS.map((pack) => {
                  const isSelected = selectedPack.gb === pack.gb;
                  return (
                    <button
                      key={pack.gb}
                      onClick={() => setSelectedPack(pack)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      {pack.popular && (
                        <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                          Popular
                        </span>
                      )}
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{pack.label}</div>
                      <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-0.5">${pack.price.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">+{pack.days} días validez</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>eSIM de Destino:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{esim.country} ({esim.iccid.slice(-6)})</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Paquete Seleccionado:</span>
                <span className="font-semibold text-slate-900 dark:text-white">+{selectedPack.gb} GB Datos de Alta Velocidad</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
                <span className="text-slate-900 dark:text-white">Total a Pagar:</span>
                <span className="text-emerald-700 dark:text-emerald-400">${selectedPack.price.toFixed(2)}</span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4 text-emerald-400 dark:text-white" />
              <span>{processing ? 'Procesando recarga instantánea...' : `Pagar $${selectedPack.price.toFixed(2)} y Recargar`}</span>
            </button>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Los datos se activan de forma inmediata en la red local.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

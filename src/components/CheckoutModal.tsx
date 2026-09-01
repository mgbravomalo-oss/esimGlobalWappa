import React, { useState, useEffect } from 'react';
import { X, CreditCard, ShieldCheck, Check, Smartphone, Sparkles, UserCheck, AlertCircle, Calendar, Plus, Minus, Infinity as InfinityIcon } from 'lucide-react';
import { EsimPlan, User, UserEsim } from '../types';

interface CheckoutModalProps {
  plan: EsimPlan | null;
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessPurchase: (newEsim: UserEsim, identifiedUser: User) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  plan,
  user,
  isOpen,
  onClose,
  onSuccessPurchase
}) => {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'wallet'>('card');
  const [selectedDays, setSelectedDays] = useState<number>(7);
  const [processing, setProcessing] = useState(false);

  // Reset or preset duration whenever the active plan changes
  useEffect(() => {
    if (plan) {
      if (plan.isUnlimited) {
        setSelectedDays(7); // default 7 days for unlimited
      } else {
        setSelectedDays(plan.validityDays || 30);
      }
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const duration = plan.isUnlimited ? Math.max(1, selectedDays) : (plan.validityDays || 30);
  const finalPrice = Number((plan.isUnlimited ? plan.priceEUR * duration : plan.priceEUR).toFixed(2));

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    // Determine target user
    let finalUser: User;
    if (user) {
      finalUser = user;
    } else {
      if (!guestEmail || !guestName) return;
      finalUser = {
        id: `user-guest-${Date.now()}`,
        name: guestName,
        email: guestEmail,
        country: 'España',
        createdAt: new Date().toISOString().split('T')[0],
        walletBalanceEUR: 0
      };
    }

    setProcessing(true);

    setTimeout(() => {
      const generatedIccid = `89${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`;
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const activationCode = `${plan.countryCode}-${randomCode}-GSMA-${Math.floor(1000 + Math.random() * 9000)}`;
      const smdp = 'smdp.globalesim.net';
      const manualCode = `LPA:1$${smdp}$${activationCode}`;

      const newEsim: UserEsim = {
        id: `esim-${Date.now()}`,
        iccid: generatedIccid,
        planId: plan.id,
        planName: plan.isUnlimited ? `${plan.name} (${duration} Días)` : plan.name,
        country: plan.country,
        countryCode: plan.countryCode,
        flag: plan.flag,
        operator: plan.operator,
        network5G: plan.network5G,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=LPA:1$${smdp}$${activationCode}`,
        smdpAddress: smdp,
        activationCode,
        manualCode,
        totalDataGB: plan.isUnlimited ? 999 : plan.dataAmountGB,
        usedDataGB: 0,
        isUnlimited: plan.isUnlimited,
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: `Válido ${duration} día${duration > 1 ? 's' : ''} tras primer uso`,
        durationDays: duration,
        pricePaid: finalPrice,
        status: 'ready_to_install',
        autoRenew: false,
        apn: plan.apn || 'globaldata'
      };

      setProcessing(false);
      onSuccessPurchase(newEsim, finalUser);
      onClose();
    }, 1200);
  };

  const dayPresets = [1, 3, 5, 7, 10, 15, 30];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative overflow-y-auto max-h-[92vh] text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{plan.flag}</span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Comprar eSIM: {plan.name}</h2>
                {plan.isUnlimited && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-700 text-white flex items-center gap-1 shadow-2xs tracking-tight uppercase">
                    <InfinityIcon className="w-2.5 h-2.5" /> Ilimitado
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {plan.isUnlimited ? `Datos Ilimitados • $${plan.priceEUR.toFixed(2)}/día` : `${plan.dataAmountGB} GB • ${plan.validityDays} Días`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="py-4 space-y-4">
          
          {/* Unlimited Plan Duration Selection Section */}
          {plan.isUnlimited && (
            <div className="p-4 bg-gradient-to-br from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 dark:text-emerald-300">
                  <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>¿Por cuántos días requieres el plan ilimitado?</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 font-mono bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                  ${plan.priceEUR.toFixed(2)} / día
                </span>
              </div>

              {/* Day presets */}
              <div className="flex flex-wrap gap-1.5">
                {dayPresets.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedDays === d
                        ? 'bg-emerald-700 text-white shadow-xs scale-105'
                        : 'bg-white dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d} {d === 1 ? 'día' : 'días'}
                  </button>
                ))}
              </div>

              {/* Stepper / custom days selector */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 border border-emerald-200 dark:border-slate-700 rounded-lg p-2 mt-2">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Personalizar duración exacta:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDays((prev) => Math.max(1, prev - 1))}
                    disabled={selectedDays <= 1}
                    className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={selectedDays}
                      onChange={(e) => setSelectedDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 1)))}
                      className="w-12 text-center font-bold text-slate-900 dark:text-white bg-transparent border border-slate-200 dark:border-slate-600 rounded-md py-0.5 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{selectedDays === 1 ? 'día' : 'días'}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDays((prev) => Math.min(90, prev + 1))}
                    disabled={selectedDays >= 90}
                    className="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 flex items-center justify-center disabled:opacity-40 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/90 flex items-center gap-1.5">
                <InfinityIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Navegación ilimitada 5G/4G durante los <strong>{duration} días</strong> completos de tu viaje.</span>
              </p>
            </div>
          )}

          {/* Guest User Information Form (if not logged in) */}
          {!user ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Datos del Viajero (Para entrega de la eSIM)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Delgado"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Email de Entrega</label>
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Te identificaremos automáticamente para que accedas a tu código QR en <strong>"Mis eSIMs"</strong>.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-300 dark:border-emerald-700"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{user.name}</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px] font-mono">{user.email}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                Usuario Identificado
              </span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Método de Pago
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                  paymentMethod === 'card'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 text-slate-700 dark:text-slate-300" />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4 mx-auto mb-1 text-slate-700 dark:text-slate-300" />
                <span>Apple / GPay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                <span>Saldo Monedero</span>
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>
                {plan.isUnlimited
                  ? `eSIM ${plan.name} (${duration} día${duration > 1 ? 's' : ''} @ $${plan.priceEUR.toFixed(2)}/día):`
                  : `eSIM ${plan.name} (${plan.validityDays} días):`}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">${finalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Activación &amp; Perfil eSIM:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">GRATIS</span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
              <span>Total:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono">${finalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={processing}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-white" />
            <span>
              {processing
                ? 'Generando perfil eSIM y código QR...'
                : plan.isUnlimited
                ? `Pagar $${finalPrice.toFixed(2)} y Obtener eSIM (${duration} ${duration === 1 ? 'día' : 'días'})`
                : `Pagar $${finalPrice.toFixed(2)} y Obtener eSIM`}
            </span>
          </button>
        </form>

      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { X, Mail, ShieldCheck, Smartphone, Check, Loader2 } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  redirectReason?: string;
}

// Google "G" official SVG icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  redirectReason = 'Para acceder a "Mis eSIMs" y ver tus códigos QR de instalación'
}) => {
  const [authMode, setAuthMode] = useState<'options' | 'google_prompt' | 'email_otp' | 'register'>('options');
  const [emailInput, setEmailInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('wappaccs@gmail.com');

  if (!isOpen) return null;

  // Google Sign In handler
  const handleGoogleSignIn = (selectedEmail?: string) => {
    setIsGoogleSigningIn(true);
    const finalEmail = selectedEmail || customGoogleEmail || 'usuario.google@gmail.com';
    const emailPrefix = finalEmail.split('@')[0];
    const formattedName = emailPrefix
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());

    setTimeout(() => {
      setIsGoogleSigningIn(false);
      const googleUser: User = {
        id: `google-${finalEmail.replace(/[^a-zA-Z0-9]/g, '-')}`,
        name: formattedName || 'Usuario Google',
        email: finalEmail.toLowerCase(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        country: 'España',
        createdAt: new Date().toISOString().split('T')[0],
        walletBalanceEUR: 15.00,
      };

      onLogin(googleUser);
      onClose();
    }, 600);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUser: User = {
      id: `user-${emailInput.replace(/[^a-zA-Z0-9]/g, '-')}`,
      name: emailInput.split('@')[0],
      email: emailInput,
      country: 'España',
      createdAt: new Date().toISOString().split('T')[0],
      walletBalanceEUR: 10.00
    };
    onLogin(finalUser);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail) return;
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: registerName,
      email: registerEmail,
      country: 'España',
      createdAt: new Date().toISOString().split('T')[0],
      walletBalanceEUR: 5.00
    };
    onLogin(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative overflow-hidden text-slate-900 dark:text-white">
        
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Identificación de Usuario
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-2">
            {redirectReason}
          </p>
        </div>

        {authMode === 'options' && (
          <div className="space-y-4">
            
            {/* Google Sign-in Primary Button */}
            <div>
              <button
                type="button"
                onClick={() => handleGoogleSignIn('wappaccs@gmail.com')}
                disabled={isGoogleSigningIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white text-sm font-semibold shadow-xs hover:shadow-sm transition-all relative overflow-hidden group active:scale-[0.99]"
              >
                {isGoogleSigningIn ? (
                  <Loader2 className="w-4 h-4 text-slate-600 dark:text-slate-300 animate-spin" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Acceso seguro con tu cuenta de Google</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('google_prompt')}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium underline"
                >
                  Personalizar correo Google
                </button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium">o con correo electrónico</span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Email OTP Option */}
            <button
              onClick={() => setAuthMode('email_otp')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Ingresar con Correo (Código OTP)</span>
            </button>

            {/* Create Account Option */}
            <div className="text-center pt-2">
              <button
                onClick={() => setAuthMode('register')}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold transition-colors"
              >
                ¿Nuevo usuario? Crear cuenta de viajero
              </button>
            </div>
          </div>
        )}

        {authMode === 'google_prompt' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <GoogleIcon className="w-4 h-4" />
                <span>Acceder con Cuenta de Google</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Indica tu cuenta de correo de Google o Workspace para vincular tus pedidos y códigos QR:
              </p>

              <div>
                <input
                  type="email"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  placeholder="tu.cuenta@gmail.com"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isGoogleSigningIn || !customGoogleEmail.includes('@')}
                  onClick={() => handleGoogleSignIn(customGoogleEmail)}
                  className="flex-1 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isGoogleSigningIn ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Iniciar con este correo</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setAuthMode('options')}
              className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              ← Volver a opciones
            </button>
          </div>
        )}

        {authMode === 'email_otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tu correo electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Te enviaremos un código de un solo uso (OTP) para acceder al instante.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Enviar Código de Acceso
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Código de seguridad enviado a {emailInput}
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-emerald-700 dark:text-emerald-400 underline"
                    >
                      Cambiar
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="Ej. 123456"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-center">
                    (En modo prueba cualquier código de 4 a 6 dígitos es válido)
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  Verificar y Entrar
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setAuthMode('options');
                setOtpSent(false);
              }}
              className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors pt-2"
            >
              ← Volver a opciones de acceso
            </button>
          </div>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                required
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Ej. Carlos Méndez"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors mt-2"
            >
              Crear Cuenta y Continuar
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('options')}
              className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors pt-2"
            >
              ← Volver a opciones de acceso
            </button>
          </form>
        )}

        {/* Security badge */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Acceso seguro sin contraseñas difíciles de recordar</span>
        </div>

      </div>
    </div>
  );
};


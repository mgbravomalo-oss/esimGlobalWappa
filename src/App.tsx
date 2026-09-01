import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DestinationsCatalog } from './components/DestinationsCatalog';
import { MyEsimsView } from './components/MyEsimsView';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { DeviceCompatibilityModal } from './components/DeviceCompatibilityModal';
import { InstallationGuideModal } from './components/InstallationGuideModal';
import { AiTravelAdvisorModal } from './components/AiTravelAdvisorModal';
import { EsimPlan, MainTab, User, UserEsim } from './types';
import { DEMO_USER_ESIMS } from './data/esimData';
import { Shield, Sparkles, UserCheck, Smartphone, CheckCircle, Wifi } from 'lucide-react';

export default function App() {
  // 1. Initial unauthenticated state (Guest mode by default upon entering)
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<MainTab>('store');

  // User's loaded eSIMs list
  const [userEsims, setUserEsims] = useState<UserEsim[]>([]);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectReason, setAuthRedirectReason] = useState<string>(
    'Para acceder a "Mis eSIMs" y gestionar tus perfiles QR de conexión'
  );
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<EsimPlan | null>(null);
  const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAdvisorModalOpen, setIsAdvisorModalOpen] = useState(false);

  // Success Toast notification
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // When user logs in
  const handleLogin = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    const existing = DEMO_USER_ESIMS[authenticatedUser.id] || [];
    setUserEsims(existing);
    setActiveTab('myesims');
    showToast(`Sesión iniciada como ${authenticatedUser.name}. Bienvenido a tu panel de eSIMs.`);

    // Async sync with MongoDB Atlas backend
    try {
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: authenticatedUser }),
      }).catch(() => {});

      const res = await fetch(`/api/user/${authenticatedUser.id}/esims`);
      const data = await res.json();
      if (data.success && Array.isArray(data.esims) && data.esims.length > 0) {
        setUserEsims(data.esims);
      }
    } catch {
      // Fallback already populated
    }
  };

  // When user logs out -> returns to guest mode
  const handleLogout = () => {
    setUser(null);
    setUserEsims([]);
    setActiveTab('store');
    showToast('Has cerrado sesión. Modo invitado activado.');
  };

  // When guest attempts to go to My eSIMs
  const handleRequestMyEsims = () => {
    if (!user) {
      setAuthRedirectReason('Para acceder a "Mis eSIMs" y ver tus códigos QR de instalación');
      setIsAuthModalOpen(true);
    } else {
      setActiveTab('myesims');
    }
  };

  // Purchase completion
  const handleSuccessPurchase = async (newEsim: UserEsim, identifiedUser: User) => {
    setUser(identifiedUser);
    setUserEsims(prev => [newEsim, ...prev]);
    setActiveTab('myesims');
    showToast(`¡eSIM para ${newEsim.country} generada con éxito! Ya puedes ver tu código QR.`);

    // Persist to MongoDB Atlas
    try {
      await fetch('/api/user/esims/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEsim, user: identifiedUser }),
      });
    } catch (err) {
      console.warn('Could not persist purchase to MongoDB:', err);
    }
  };

  // Top Up eSIM
  const handleTopUpEsim = async (esimId: string, addedGB: number, price: number) => {
    setUserEsims(prev =>
      prev.map(item => {
        if (item.id === esimId) {
          return {
            ...item,
            totalDataGB: item.totalDataGB + addedGB,
            status: item.status === 'depleted' ? 'active' : item.status
          };
        }
        return item;
      })
    );
    showToast(`Se han añadido +${addedGB} GB a tu eSIM con éxito.`);

    // Persist to MongoDB Atlas
    try {
      await fetch('/api/user/esims/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ esimId, addedGB }),
      });
    } catch (err) {
      console.warn('Could not persist topup to MongoDB:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'myesims' && !user) {
            handleRequestMyEsims();
          } else {
            setActiveTab(tab);
          }
        }}
        user={user}
        esimsCount={userEsims.length}
        onOpenAuthModal={() => {
          setAuthRedirectReason('Identifícate para sincronizar tus eSIMs y saldo');
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenCompatibilityModal={() => setIsCompatibilityModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenAdvisorModal={() => setIsAdvisorModalOpen(true)}
      />

      {/* Guest Notice Bar (if unauthenticated) */}
      {!user && (
        <div className="bg-slate-900 dark:bg-slate-900/90 text-slate-200 text-xs px-4 py-2 border-b border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                <strong>Modo Exploración:</strong> Navegando como invitado. Tus compras y códigos QR se guardarán al identificarte.
              </span>
            </div>
            <button
              onClick={() => {
                setAuthRedirectReason('Para acceder a "Mis eSIMs" y activar perfiles');
                setIsAuthModalOpen(true);
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
            >
              ¿Ya tienes eSIMs? Identifícate aquí →
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'store' && (
          <DestinationsCatalog
            onSelectPlanForPurchase={(plan) => setSelectedPlanForPurchase(plan)}
            onOpenAdvisor={() => setIsAdvisorModalOpen(true)}
          />
        )}

        {activeTab === 'myesims' && user && (
          <MyEsimsView
            user={user}
            esims={userEsims}
            onNavigateToStore={() => setActiveTab('store')}
            onTopUpEsim={handleTopUpEsim}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400 mt-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-200">eSIM Global Hub</span>
            <span className="dark:text-slate-400">• Conectividad internacional 5G / 4G sin roaming</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsCompatibilityModalOpen(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Teléfonos Compatibles
            </button>
            <button onClick={() => setIsGuideModalOpen(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Instrucciones de Instalación
            </button>
            <button onClick={() => setIsAdvisorModalOpen(true)} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Asistente IA
            </button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 dark:border-slate-700 flex items-center gap-2.5 text-xs animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        redirectReason={authRedirectReason}
      />

      {/* Purchase Checkout Modal */}
      <CheckoutModal
        plan={selectedPlanForPurchase}
        user={user}
        isOpen={Boolean(selectedPlanForPurchase)}
        onClose={() => setSelectedPlanForPurchase(null)}
        onSuccessPurchase={handleSuccessPurchase}
      />

      {/* Compatibility Modal */}
      <DeviceCompatibilityModal
        isOpen={isCompatibilityModalOpen}
        onClose={() => setIsCompatibilityModalOpen(false)}
      />

      {/* Guide Modal */}
      <InstallationGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      {/* AI Advisor Modal */}
      <AiTravelAdvisorModal
        isOpen={isAdvisorModalOpen}
        onClose={() => setIsAdvisorModalOpen(false)}
        onSelectPlan={(plan) => setSelectedPlanForPurchase(plan)}
      />

    </div>
  );
}

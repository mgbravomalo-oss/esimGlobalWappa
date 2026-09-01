import React, { useState } from 'react';
import { X, BookOpen, QrCode, Wifi, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface InstallationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallationGuideModal: React.FC<InstallationGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-xl relative overflow-hidden text-slate-900 dark:text-white max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Guía de Instalación eSIM</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pasos para activar tu plan en menos de 2 minutos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Selector */}
        <div className="py-3 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setPlatform('ios')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                platform === 'ios'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Apple iPhone (iOS)
            </button>
            <button
              onClick={() => setPlatform('android')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                platform === 'android'
                  ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Samsung / Google Pixel (Android)
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1 py-2 text-xs text-slate-700 dark:text-slate-300">
          
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Conéctate a una red Wi-Fi</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px]">
              Se requiere conexión a Internet estable antes del vuelo para descargar el perfil de la eSIM en tu dispositivo.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>{platform === 'ios' ? 'Ajustes > Datos móviles > Añadir eSIM' : 'Ajustes > Conexiones > Administrador de SIM'}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px]">
              Selecciona la opción de escanear código QR o introducir los datos manuales (SM-DP+ y código de activación).
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Escanea el código QR desde "Mis eSIMs"</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 pl-7 text-[11px]">
              Enfoca con la cámara y pulsa "Continuar" para confirmar la descarga del perfil celular.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1 text-emerald-950 dark:text-emerald-300">
            <div className="font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-700 dark:bg-emerald-500 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Al aterrizar en el país de destino:</span>
            </div>
            <p className="pl-7 text-[11px] text-emerald-900 dark:text-emerald-300">
              Activa la línea eSIM como línea principal de datos y enciende el interruptor de <strong>Itinerancia de datos (Data Roaming)</strong>. ¡Ya tendrás conexión 5G!
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold"
          >
            Cerrar Guía
          </button>
        </div>

      </div>
    </div>
  );
};

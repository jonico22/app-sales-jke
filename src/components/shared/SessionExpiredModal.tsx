import React from 'react';
import { Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLogin: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="max-w-md w-full px-6 text-center animate-in zoom-in-95 duration-300">
        
        {/* Icon Container */}
        <div className="mx-auto mb-8 relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-sky-50 rounded-full opacity-50"></div>
          <div className="relative z-10 text-[#0ea5e9]">
            <Lock className="w-12 h-12" />
          </div>
          {/* Small clock badge */}
          <div className="absolute bottom-4 right-4 bg-[#0ea5e9] rounded-full p-1 border-2 border-white text-white">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Text Content */}
        <h2 className="text-2xl font-bold text-slate-800 mb-3 font-heading">
          Tu sesión ha expirado
        </h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          Por tu seguridad, hemos cerrado la
          <br />
          sesión después de un periodo de
          <br />
          inactividad.
        </p>

        {/* Action Button */}
        <Button
          onClick={onLogin}
          className="w-full max-w-xs bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-6 rounded-xl text-base font-medium shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]"
        >
          Volver a Iniciar Sesión
        </Button>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-center gap-2 text-slate-300 text-xs">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          <span>JKE Solutions Security</span>
        </div>

      </div>
    </div>
  );
};

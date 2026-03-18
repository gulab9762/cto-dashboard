import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, X } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPanic?: boolean;
}

const LogoutModal: FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm, isPanic }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-sm rounded-3xl border overflow-hidden shadow-2xl ${
              isPanic 
                ? 'bg-zinc-900 border-red-500/30' 
                : 'bg-zinc-900/90 border-white/10'
            }`}
          >
            {/* Glossy Header */}
            <div className={`h-1.5 w-full ${isPanic ? 'bg-red-500' : 'bg-accent-blue'}`} />
            
            <div className="p-8">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 text-white/30 hover:text-white transition-colors"
                id="close-logout-modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  isPanic ? 'bg-red-500/10' : 'bg-accent-blue/10'
                }`}>
                  {isPanic ? (
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  ) : (
                    <LogOut className="w-8 h-8 text-accent-blue" />
                  )}
                </div>

                <h2 className="text-xl font-black text-white tracking-tight mb-2 uppercase italic">
                  {isPanic ? 'Abort Mission?' : 'Confirm Exit'}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  {isPanic 
                    ? 'Total system shutdown initiated. This will immediately terminate your session and clear all active buffers.' 
                    : 'Are you sure you want to exit the CTO Command Center? All secure channels will be closed.'}
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/5"
                    id="cancel-logout"
                  >
                    Stay Online
                  </button>
                  <button
                    onClick={onConfirm}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                      isPanic 
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                        : 'bg-accent-blue hover:bg-blue-600 text-white shadow-blue-500/20'
                    }`}
                    id="confirm-logout"
                  >
                    {isPanic ? 'SHUTDOWN' : 'EXIT'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutModal;

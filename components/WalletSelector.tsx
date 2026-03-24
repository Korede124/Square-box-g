import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, AlertCircle, ExternalLink } from 'lucide-react';

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (providerType: 'metamask' | 'injected') => void;
  error?: string | null;
}

const WalletSelector: React.FC<WalletSelectorProps> = ({ isOpen, onClose, onSelect, error }) => {
  const isIframe = window.self !== window.top;
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md glass-panel rounded-[2.5rem] border border-white/10 p-8 overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 blur-[100px] rounded-full"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-orbitron text-2xl font-black text-white tracking-tight">LINK INTERFACE</h2>
                <p className="text-[10px] font-orbitron font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Select EVM Protocol</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {isIframe && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-amber-200 uppercase tracking-widest leading-relaxed">
                        Iframe Detected
                      </p>
                      <p className="text-[9px] text-white/50 leading-relaxed">
                        Wallets often block connections from iframes. For the best experience, open the app in a new tab.
                      </p>
                      <button 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="flex items-center space-x-2 text-[9px] font-black text-amber-500 hover:text-amber-400 uppercase tracking-widest transition-colors"
                      >
                        <span>Open in New Tab</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-red-200 uppercase tracking-widest leading-relaxed">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* MetaMask */}
              <button
                onClick={() => onSelect('metamask')}
                className="w-full group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 rounded-2xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Mirror.svg" className="w-7 h-7" alt="MetaMask" />
                  </div>
                  <div className="text-left">
                    <div className="font-orbitron text-sm font-black text-white uppercase tracking-tight">MetaMask</div>
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Standard EVM Gateway</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-pulse"></div>
              </button>

              {/* Browser Wallet */}
              <button
                onClick={() => onSelect('injected')}
                className="w-full group flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                    <Wallet className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <div className="font-orbitron text-sm font-black text-white uppercase tracking-tight">Browser Wallet</div>
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Default Injected Provider</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-pulse"></div>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                Secure authentication via Web3 Protocol
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WalletSelector;

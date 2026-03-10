
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, CreditCard, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  onWithdraw: (amount: number, pointsUsed: number) => void;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, currentPoints, onWithdraw }) => {
  const [step, setStep] = useState<'input' | 'processing' | 'success'>('input');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000);
  const [error, setError] = useState<string | null>(null);

  const MIN_POINTS = 1000;
  const CONVERSION_RATE = 0.01; // 1000 points = $10

  const handleWithdraw = () => {
    if (currentPoints < MIN_POINTS) {
      setError(`Minimum withdrawal is ${MIN_POINTS} points.`);
      return;
    }
    if (withdrawAmount < MIN_POINTS) {
      setError(`Minimum withdrawal is ${MIN_POINTS} points.`);
      return;
    }
    if (withdrawAmount > currentPoints) {
      setError("You don't have enough points.");
      return;
    }

    setError(null);
    setStep('processing');

    // Simulate real-time withdrawal
    setTimeout(() => {
      onWithdraw(withdrawAmount * CONVERSION_RATE, withdrawAmount);
      setStep('success');
    }, 2500);
  };

  const resetAndClose = () => {
    setStep('input');
    setWithdrawAmount(1000);
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetAndClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          ></motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md glass-panel rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-orbitron text-lg font-black text-white uppercase tracking-tighter">Withdraw Funds</h3>
                </div>
                <button onClick={resetAndClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-white/40" />
                </button>
              </div>

              {step === 'input' && (
                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Available Balance</span>
                      <span className="text-xs font-orbitron font-black text-cyan-400">{currentPoints.toLocaleString()} PTS</span>
                    </div>
                    <div className="text-3xl font-orbitron font-black text-white">
                      ${(currentPoints * CONVERSION_RATE).toFixed(2)}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-widest">Amount to Withdraw (Points)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min={MIN_POINTS}
                        max={currentPoints}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-orbitron font-black focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase">PTS</div>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                      <span>Min: {MIN_POINTS} PTS</span>
                      <span>Value: ${(withdrawAmount * CONVERSION_RATE).toFixed(2)} USD</span>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleWithdraw}
                    disabled={currentPoints < MIN_POINTS}
                    className="w-full group relative bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-white/20 text-white font-orbitron font-black py-5 rounded-2xl transition-all active:scale-95 overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-3">
                      <CreditCard className="w-5 h-5" />
                      <span>WITHDRAW TO ACCOUNT</span>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </button>

                  <p className="text-center text-[9px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                    Real-time processing via EVM Protocol. Funds will be deposited directly to your linked account.
                  </p>
                </div>
              )}

              {step === 'processing' && (
                <div className="py-12 text-center space-y-8">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-t-emerald-500 rounded-full"
                    ></motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-emerald-400 animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-orbitron text-xl font-black text-white mb-2 uppercase">Processing</h4>
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Verifying transaction on Somnia mainnet...</p>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="py-12 text-center space-y-8">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                  <div>
                    <h4 className="font-orbitron text-2xl font-black text-white mb-2 uppercase tracking-tighter">Success</h4>
                    <p className="text-emerald-400/80 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Withdrawal Complete</p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                      <div className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Amount Sent</div>
                      <div className="text-3xl font-orbitron font-black text-white">${(withdrawAmount * CONVERSION_RATE).toFixed(2)}</div>
                    </div>
                  </div>
                  <button
                    onClick={resetAndClose}
                    className="w-full bg-white text-black font-orbitron font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all active:scale-95"
                  >
                    RETURN TO LOBBY
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WithdrawModal;

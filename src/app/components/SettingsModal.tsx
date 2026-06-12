import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Snowflake, Star, Ban, Heart, CloudRain } from 'lucide-react';
import { ParticleMode } from './BackgroundParticles';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  particleMode: ParticleMode;
  setParticleMode: (val: ParticleMode) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  particleMode,
  setParticleMode,
}: SettingsModalProps) {
  
  const modes: { id: ParticleMode, label: string, icon: React.ReactNode }[] = [
    { id: 'default', label: 'Magic', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'hearts', label: 'Love', icon: <Heart className="w-4 h-4" /> },
    { id: 'rain', label: 'Rain', icon: <CloudRain className="w-4 h-4" /> },
    { id: 'stars', label: 'Stars', icon: <Star className="w-4 h-4" /> },
    { id: 'snow', label: 'Snow', icon: <Snowflake className="w-4 h-4" /> },
    { id: 'none', label: 'Off', icon: <Ban className="w-4 h-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-sm rounded-3xl p-6 relative shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #180b2d, #0d0617)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-6 tracking-wide">Settings</h2>

            <div className="space-y-6">
              {/* Particles Selector */}
              <div>
                <h3 className="text-sm font-bold text-white/90">Background Theme</h3>
                <p className="text-xs text-white/50 font-mono mt-1 mb-4">Choose your visual vibe</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setParticleMode(mode.id)}
                      className="flex items-center gap-2 p-3 rounded-xl transition-all border"
                      style={{
                        background: particleMode === mode.id ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                        borderColor: particleMode === mode.id ? 'rgba(168,85,247,0.5)' : 'transparent',
                        color: particleMode === mode.id ? '#e9d5ff' : 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {mode.icon}
                      <span className="text-sm font-mono">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-mono text-white/30 tracking-widest uppercase">Kito v1.0</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

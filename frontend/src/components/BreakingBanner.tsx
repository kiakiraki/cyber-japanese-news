import { motion, AnimatePresence } from 'framer-motion';
import type { NewsItem } from '../types/news';
import { GlitchText } from './GlitchText';

interface BreakingBannerProps {
  currentBreaking: NewsItem | null;
  queueSize: number;
  onDismiss: () => void;
}

export function BreakingBanner({ currentBreaking, queueSize, onDismiss }: BreakingBannerProps) {
  return (
    <AnimatePresence>
      {currentBreaking && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 cursor-pointer"
          onClick={onDismiss}
        >
          <div
            className="relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 48, 48, 0.95) 0%, rgba(255, 136, 0, 0.95) 100%)',
              boxShadow: '0 -4px 30px rgba(255, 48, 48, 0.4)',
            }}
          >
            {/* Animated background pulse */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
              }}
            />

            <div className="relative flex items-center gap-4 px-6 py-4">
              {/* Breaking label */}
              <div className="shrink-0">
                <GlitchText
                  text="BREAKING NEWS"
                  intensity="high"
                  className="text-lg font-bold text-white tracking-[0.2em]"
                />
              </div>

              {/* Separator */}
              <div className="w-px h-8 bg-white/30 shrink-0" />

              {/* Marquee title */}
              <div className="flex-1 overflow-hidden">
                <motion.div
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="whitespace-nowrap text-white font-sans text-base font-bold"
                >
                  {currentBreaking.prefectureName !== '全国' && (
                    <span className="mr-2 opacity-70">[{currentBreaking.prefectureName}]</span>
                  )}
                  {currentBreaking.title}
                </motion.div>
              </div>

              {/* Queue indicator */}
              {queueSize > 0 && (
                <div
                  className="shrink-0 text-xs px-2 py-1 rounded"
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    color: 'white',
                  }}
                >
                  +{queueSize}
                </div>
              )}
            </div>

            {/* Progress bar */}
            <motion.div
              className="h-0.5 bg-white/50"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 20, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

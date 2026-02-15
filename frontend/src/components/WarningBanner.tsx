import { motion, AnimatePresence } from 'framer-motion';
import type { WarningAreaSummary } from '../types/jma';
import { GlitchText } from './GlitchText';

interface WarningBannerProps {
  warnings: WarningAreaSummary[];
}

export function WarningBanner({ warnings }: WarningBannerProps) {
  const specialAreas = warnings.filter((w) => w.maxSeverity === 'special');

  if (specialAreas.length === 0) return null;

  const warningNames = specialAreas.flatMap((w) =>
    w.activeWarnings
      .filter((aw) => aw.severity === 'special')
      .map((aw) => `${w.prefectureName} ${aw.name}`),
  );
  const scrollText = warningNames.join(' / ');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed top-0 left-0 right-0 z-[100]"
      >
        <div
          className="relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, rgba(139, 0, 255, 0.95) 0%, rgba(185, 28, 139, 0.95) 100%)',
            boxShadow: '0 4px 30px rgba(139, 0, 255, 0.4)',
          }}
        >
          {/* Animated pulse */}
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
            }}
          />

          <div className="relative flex items-center gap-4 px-6 py-3">
            {/* Label */}
            <div className="shrink-0">
              <GlitchText
                text="特別警報"
                intensity="high"
                className="text-lg font-bold text-white tracking-[0.2em]"
              />
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-white/30 shrink-0" />

            {/* Scrolling areas */}
            <div className="flex-1 overflow-hidden">
              <motion.div
                animate={{ x: ['100%', '-100%'] }}
                transition={{
                  duration: Math.max(10, specialAreas.length * 5),
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="whitespace-nowrap text-white font-sans text-base font-bold"
              >
                {scrollText}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

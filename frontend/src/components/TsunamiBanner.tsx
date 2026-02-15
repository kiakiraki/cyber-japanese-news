import { motion, AnimatePresence } from 'framer-motion';
import type { TsunamiItem } from '../types/jma';
import { GlitchText } from './GlitchText';

interface TsunamiBannerProps {
  tsunamis: TsunamiItem[];
}

const GRADE_STYLES: Record<string, { bg: string; label: string; pulseColor: string }> = {
  MajorWarning: {
    bg: 'linear-gradient(135deg, rgba(155, 25, 245, 0.95) 0%, rgba(185, 28, 139, 0.95) 100%)',
    label: '大津波警報',
    pulseColor: 'rgba(155, 25, 245, 0.4)',
  },
  Warning: {
    bg: 'linear-gradient(135deg, rgba(240, 62, 62, 0.95) 0%, rgba(255, 48, 48, 0.95) 100%)',
    label: '津波警報',
    pulseColor: 'rgba(255, 48, 48, 0.4)',
  },
  Watch: {
    bg: 'linear-gradient(135deg, rgba(255, 212, 59, 0.95) 0%, rgba(255, 146, 43, 0.95) 100%)',
    label: '津波注意報',
    pulseColor: 'rgba(255, 212, 59, 0.4)',
  },
};

function getHighestGrade(tsunamis: TsunamiItem[]): string {
  const active = tsunamis.filter((t) => !t.cancelled);
  const grades = active.flatMap((t) => t.areas.map((a) => a.grade));

  if (grades.includes('MajorWarning')) return 'MajorWarning';
  if (grades.includes('Warning')) return 'Warning';
  if (grades.includes('Watch')) return 'Watch';
  return 'Watch';
}

function getActiveAreas(tsunamis: TsunamiItem[]): string[] {
  const active = tsunamis.filter((t) => !t.cancelled);
  const names = new Set<string>();
  for (const t of active) {
    for (const a of t.areas) {
      names.add(a.name);
    }
  }
  return Array.from(names);
}

export function TsunamiBanner({ tsunamis }: TsunamiBannerProps) {
  const activeTsunamis = tsunamis.filter((t) => !t.cancelled);

  if (activeTsunamis.length === 0) return null;

  const grade = getHighestGrade(tsunamis);
  const style = GRADE_STYLES[grade] ?? GRADE_STYLES.Watch;
  const areas = getActiveAreas(tsunamis);
  const areaText = areas.join(' / ');

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
            background: style.bg,
            boxShadow: `0 4px 30px ${style.pulseColor}`,
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
                text={style.label}
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
                  duration: Math.max(10, areas.length * 3),
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="whitespace-nowrap text-white font-sans text-base font-bold"
              >
                {areaText}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { motion } from 'framer-motion';
import type { UpdateEvent } from '../../types/effects';

interface IncomingPulseProps {
  event: UpdateEvent;
}

export function IncomingPulse({ event }: IncomingPulseProps) {
  return (
    <motion.div
      key={event.id}
      className="fixed left-0 right-0 pointer-events-none"
      style={{
        top: 48, // StatsBar height
        height: 2,
        background: 'linear-gradient(90deg, transparent, #00ffff, transparent)',
        boxShadow: '0 0 12px #00ffff, 0 0 24px rgba(0, 255, 255, 0.4)',
        transformOrigin: 'left center',
        zIndex: 9990,
      }}
      initial={{ scaleX: 0, opacity: 0.8 }}
      animate={{ scaleX: 1, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  );
}

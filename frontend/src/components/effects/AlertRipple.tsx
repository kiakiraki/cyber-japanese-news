import { motion } from 'framer-motion';
import { GlitchText } from '../GlitchText';
import type { UpdateEvent } from '../../types/effects';

interface AlertRippleProps {
  event: UpdateEvent;
}

export function AlertRipple({ event }: AlertRippleProps) {
  return (
    <motion.div
      key={event.id}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9990 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Initial glitch flash */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'rgba(255, 48, 48, 0.15)',
          mixBlendMode: 'screen',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Red vignette edge glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 120px 40px rgba(255, 48, 48, 0.3), inset 0 0 60px 20px rgba(255, 48, 48, 0.15)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.5, 0.7, 0] }}
        transition={{ duration: 3, times: [0, 0.1, 0.4, 0.6, 1] }}
      />

      {/* SVG ripple waves */}
      <svg className="absolute inset-0 w-full h-full">
        {[0, 0.4].map((delay, i) => (
          <motion.circle
            key={i}
            cx="50%"
            cy="50%"
            r="0"
            fill="none"
            stroke="#ff3030"
            strokeWidth={1.5}
            initial={{ r: 0, opacity: 0.6 }}
            animate={{ r: '50%', opacity: 0 }}
            transition={{
              duration: 2.5,
              delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>

      {/* Headline */}
      {event.headline && (
        <motion.div
          className="absolute bottom-24 left-0 right-0 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -5] }}
          transition={{ duration: 3, times: [0, 0.1, 0.7, 1] }}
        >
          <div
            className="px-6 py-3"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 48, 48, 0.2), transparent)',
              borderTop: '1px solid rgba(255, 48, 48, 0.5)',
              borderBottom: '1px solid rgba(255, 48, 48, 0.5)',
            }}
          >
            <GlitchText
              text={event.headline}
              intensity="medium"
              as="span"
              className="text-sm font-bold tracking-wider"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

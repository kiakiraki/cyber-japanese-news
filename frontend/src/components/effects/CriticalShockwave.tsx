import { motion } from 'framer-motion';
import { GlitchText } from '../GlitchText';
import { getScaleInfo } from '../../lib/seismicScale';
import type { UpdateEvent } from '../../types/effects';

interface CriticalShockwaveProps {
  event: UpdateEvent;
  onShakeStart: () => void;
  onShakeEnd: () => void;
}

export function CriticalShockwave({ event, onShakeStart, onShakeEnd }: CriticalShockwaveProps) {
  const scaleLabel = event.maxScale ? getScaleInfo(event.maxScale).label : null;

  return (
    <motion.div
      key={event.id}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9990 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      onAnimationStart={() => onShakeStart()}
      onAnimationComplete={() => onShakeEnd()}
    >
      {/* Red flash (0.3s) */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255, 48, 48, 0.4), rgba(255, 0, 0, 0.15))',
          mixBlendMode: 'screen',
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Triple shockwave rings */}
      <svg className="absolute inset-0 w-full h-full">
        {[0, 0.3, 0.6].map((delay, i) => (
          <motion.circle
            key={i}
            cx="50%"
            cy="50%"
            r="0"
            fill="none"
            stroke={i === 0 ? '#ff3030' : i === 1 ? '#ff8800' : '#ff3030'}
            strokeWidth={2 - i * 0.5}
            initial={{ r: 0, opacity: 0.8 }}
            animate={{ r: '60%', opacity: 0 }}
            transition={{
              duration: 2,
              delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>

      {/* Full-screen glitch overlay (0.5s) */}
      <motion.div
        className="absolute inset-0"
        style={{ mixBlendMode: 'screen' }}
        initial={{ opacity: 0.8 }}
        animate={{
          opacity: [0.8, 0, 0.6, 0, 0.3, 0],
          background: [
            'linear-gradient(0deg, rgba(255,0,0,0.3) 0%, transparent 50%, rgba(0,255,255,0.2) 100%)',
            'transparent',
            'linear-gradient(180deg, rgba(255,0,0,0.2) 0%, transparent 50%, rgba(255,0,0,0.15) 100%)',
            'transparent',
            'linear-gradient(90deg, rgba(0,255,255,0.15) 0%, transparent 50%, rgba(255,0,0,0.1) 100%)',
            'transparent',
          ],
        }}
        transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
      />

      {/* Red vignette sustained glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 200px 60px rgba(255, 48, 48, 0.4), inset 0 0 100px 30px rgba(255, 48, 48, 0.2)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.7, 0.9, 0] }}
        transition={{ duration: 5, times: [0, 0.06, 0.3, 0.5, 1] }}
      />

      {/* Center telop */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{
          opacity: [0, 1, 1, 1, 0],
          scale: [1.2, 1, 1, 1, 0.98],
        }}
        transition={{ duration: 5, times: [0, 0.1, 0.3, 0.7, 1] }}
      >
        {/* Scale label */}
        {scaleLabel && (
          <motion.div
            className="mb-2 px-4 py-1 text-xs tracking-[0.5em] font-bold uppercase"
            style={{
              color: '#ff3030',
              border: '1px solid rgba(255, 48, 48, 0.5)',
              background: 'rgba(255, 48, 48, 0.1)',
              textShadow: '0 0 10px rgba(255, 48, 48, 0.8)',
            }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {scaleLabel}
          </motion.div>
        )}

        {/* Headline */}
        {event.headline && (
          <div
            className="px-8 py-4"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 48, 48, 0.25), transparent)',
              borderTop: '2px solid rgba(255, 48, 48, 0.7)',
              borderBottom: '2px solid rgba(255, 48, 48, 0.7)',
            }}
          >
            <GlitchText
              text={event.headline}
              intensity="high"
              as="h2"
              className="text-lg font-bold tracking-wider"
            />
          </div>
        )}

        {/* Source label */}
        <motion.div
          className="mt-3 text-[10px] tracking-[0.3em] uppercase"
          style={{ color: 'rgba(255, 48, 48, 0.6)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 5, times: [0, 0.15, 0.7, 1] }}
        >
          {event.source === 'earthquake' ? '// SEISMIC ALERT //' :
           event.source === 'tsunami' ? '// TSUNAMI WARNING //' :
           '// CRITICAL ALERT //'}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

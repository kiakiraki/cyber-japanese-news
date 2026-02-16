import { useState } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

const intensityConfig = {
  low: {
    duration: 4,
    offset: 1,
    clipChance: 0.02,
  },
  medium: {
    duration: 2,
    offset: 2,
    clipChance: 0.05,
  },
  high: {
    duration: 0.8,
    offset: 3,
    clipChance: 0.1,
  },
};

export function GlitchText({ text, intensity = 'low', className = '', as: Tag = 'div' }: GlitchTextProps) {
  const config = intensityConfig[intensity];
  const [clipRands] = useState(() => [
    Math.random() * 50,
    Math.random() * 50,
    Math.random() * 80,
    Math.random() * 20,
  ]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Base text */}
      <Tag className="relative z-10">{text}</Tag>

      {/* Red shadow */}
      <motion.div
        className="absolute inset-0 opacity-70"
        style={{ color: '#ff0000' }}
        aria-hidden
        animate={{
          x: [-config.offset, config.offset, 0, -config.offset],
          opacity: [0, 0.7, 0, 0.5],
        }}
        transition={{
          duration: config.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Tag>{text}</Tag>
      </motion.div>

      {/* Blue shadow */}
      <motion.div
        className="absolute inset-0 opacity-70"
        style={{ color: '#0000ff' }}
        aria-hidden
        animate={{
          x: [config.offset, -config.offset, 0, config.offset],
          opacity: [0.5, 0, 0.7, 0],
        }}
        transition={{
          duration: config.duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Tag>{text}</Tag>
      </motion.div>

      {/* Glitch clip slice */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        aria-hidden
        animate={{
          clipPath: [
            'inset(0 0 100% 0)',
            `inset(${clipRands[0]}% 0 ${clipRands[1]}% 0)`,
            'inset(0 0 100% 0)',
            `inset(${clipRands[2]}% 0 ${clipRands[3]}% 0)`,
            'inset(0 0 100% 0)',
          ],
          x: [0, -config.offset * 2, config.offset, 0],
        }}
        transition={{
          duration: config.duration * 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <Tag style={{ color: '#00ffff' }}>{text}</Tag>
      </motion.div>
    </div>
  );
}

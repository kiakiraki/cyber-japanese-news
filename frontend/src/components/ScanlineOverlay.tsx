import { motion } from 'framer-motion';

interface ScanlineOverlayProps {
  intensified?: boolean;
}

export function ScanlineOverlay({ intensified = false }: ScanlineOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 0, 0, 0.15) 2px,
          rgba(0, 0, 0, 0.15) 4px
        )`,
        mixBlendMode: 'overlay',
        zIndex: 9999,
      }}
      animate={{ opacity: intensified ? 0.2 : 0.03 }}
      transition={{ duration: 0.3 }}
    />
  );
}

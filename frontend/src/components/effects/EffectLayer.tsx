import { AnimatePresence } from 'framer-motion';
import type { UpdateEvent } from '../../types/effects';
import { IncomingPulse } from './IncomingPulse';
import { AlertRipple } from './AlertRipple';
import { CriticalShockwave } from './CriticalShockwave';

interface EffectLayerProps {
  activeEvent: UpdateEvent | null;
  onShakeStart: () => void;
  onShakeEnd: () => void;
}

export function EffectLayer({ activeEvent, onShakeStart, onShakeEnd }: EffectLayerProps) {
  return (
    <AnimatePresence mode="wait">
      {activeEvent?.level === 'incoming' && (
        <IncomingPulse key={activeEvent.id} event={activeEvent} />
      )}
      {activeEvent?.level === 'alert' && (
        <AlertRipple key={activeEvent.id} event={activeEvent} />
      )}
      {activeEvent?.level === 'critical' && (
        <CriticalShockwave
          key={activeEvent.id}
          event={activeEvent}
          onShakeStart={onShakeStart}
          onShakeEnd={onShakeEnd}
        />
      )}
    </AnimatePresence>
  );
}

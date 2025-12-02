import { EventBusContext } from '@/events/EventBusContext';
import { useContext } from 'react';

export function useEventBus() {
  return useContext(EventBusContext);
}

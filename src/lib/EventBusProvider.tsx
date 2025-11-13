import React, { createContext, useContext } from 'react';
import { eventBus, EventBus } from './EventBus';
const EventBusContext = createContext<EventBus>(eventBus);

export const EventBusProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <EventBusContext.Provider value={eventBus}>{children}</EventBusContext.Provider>;
};

export function useEventBus() {
  return useContext(EventBusContext);
}

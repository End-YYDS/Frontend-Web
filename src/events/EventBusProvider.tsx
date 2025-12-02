import { eventBus } from './EventBus';
import { EventBusContext } from './EventBusContext';

export const EventBusProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <EventBusContext.Provider value={eventBus}>{children}</EventBusContext.Provider>;
};

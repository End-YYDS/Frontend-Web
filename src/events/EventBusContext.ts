import { createContext } from 'react';
import { eventBus, type AppEventBus } from './EventBus';

export const EventBusContext = createContext<AppEventBus>(eventBus);

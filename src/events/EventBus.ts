export interface EventMap {
  'auth:unauthorized': { status: number };
  'auth:forbidden': { status: number };
}

export type Listener<E> = (payload: E) => void;

export class EventBus<Events extends object> {
  private listeners: {
    [K in keyof Events]?: Listener<Events[K]>[];
  } = {};

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(listener);
    return () => this.off(event, listener);
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>) {
    const list = this.listeners[event];
    if (!list) return;
    this.listeners[event] = list.filter((l) => l !== listener);
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    const list = this.listeners[event];
    if (!list) return;
    list.forEach((listener) => listener(payload));
  }
}
export type AppEventBus = EventBus<EventMap>;
export const eventBus: AppEventBus = new EventBus<EventMap>();

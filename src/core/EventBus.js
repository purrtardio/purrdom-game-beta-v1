window.Purrdom = window.Purrdom || {};

(function defineEventBus(P) {
  class EventBus {
    constructor() {
      this.listeners = new Map();
    }

    on(type, handler) {
      if (!this.listeners.has(type)) {
        this.listeners.set(type, new Set());
      }
      this.listeners.get(type).add(handler);
      return () => this.off(type, handler);
    }

    off(type, handler) {
      const handlers = this.listeners.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    }

    emit(type, payload) {
      const handlers = this.listeners.get(type);
      if (!handlers) return;
      handlers.forEach((handler) => handler(payload));
    }
  }

  P.EventBus = EventBus;
})(window.Purrdom);

'use client';
import { FirestorePermissionError } from './errors';

export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

type Callback<T> = (data: T) => void;

function createEventEmitter<T extends Record<string, any>>() {
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};
  return {
    on<K extends keyof T>(event: K, cb: Callback<T[K]>) {
      (events[event] ||= []).push(cb);
    },
    off<K extends keyof T>(event: K, cb: Callback<T[K]>) {
      if (!events[event]) return;
      events[event] = events[event]!.filter(fn => fn !== cb);
    },
    emit<K extends keyof T>(event: K, data: T[K]) {
      events[event]?.forEach(fn => fn(data));
    },
  };
}

export const errorEmitter = createEventEmitter<AppEvents>();

if (process.env.NODE_ENV === 'development') {
  errorEmitter.on('permission-error', (e) => {
    console.warn(`🚫 Firestore permission error @ ${e.request.path}\n${e.message}`);
  });
}

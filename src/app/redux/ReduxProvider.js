"use client";

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import { useEffect, useState } from 'react';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

export default function ReduxProvider({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const unsubscribe = persistor.subscribe(() => {
      const state = persistor.getState();
      if (state.bootstrapped) {
        setRehydrated(true);
        unsubscribe(); // Unsubscribe once rehydration is done
      }
    });
  }, []);

  if (!isClient || !rehydrated) {
    return <LoadingSpinner />;
  }

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}

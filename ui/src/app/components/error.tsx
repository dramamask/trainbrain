"use client";

import { useSyncExternalStore } from 'react';
import { store as errorStore } from '@/app/services/stores/error';

import styles from "./error.module.css";

export default function Error() {
  // This hook automatically subscribes and returns the latest snapshot
  const state = useSyncExternalStore(errorStore.subscribe, errorStore.getSnapshot, errorStore.getServerSnapshot);

  const handleClick = () => {
    errorStore.clearError();
  };

  if (state.error) {
    return (
      <div className={styles.error}>
        <h2>Error!</h2>
        {state.error}
        <div
          className={styles.closeButton}
          onClick={handleClick}
        >
          &times;
          </div>
      </div>
    )
  }

  return null
}

import { store as errorStore } from '@/app/services/stores/error';

// Key Event Handler that acts when an error is present.
// Note that all key event handlers need to be called from keynoardEventHandler.tsx
export function handleKeyDown(key: string) {
  if (errorStore.errorPresent()) {
    console.log(key);
    if (key == 'Enter' || key == 'Escape') {
      errorStore.clearError();
    }
  }
}

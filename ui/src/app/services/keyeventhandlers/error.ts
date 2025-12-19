import { store as errorStore } from '@/app/services/stores/error';

// Key Event Handler for Edit Mode
export function handleKeyDown(key: string) {
  // Only do something when there's an error
  if (errorStore.errorPresent()) {
    console.log(key);
    if (key == 'Enter' || key == 'Escape') {
      errorStore.clearError();
    }
  }
}

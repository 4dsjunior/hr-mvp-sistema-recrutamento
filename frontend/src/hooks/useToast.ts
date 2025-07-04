import { useCallback } from 'react';

export function useToast() {
  // Placeholder for toast logic
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // Implement toast logic here
    alert(`${type.toUpperCase()}: ${message}`);
  }, []);

  return { showToast };
}

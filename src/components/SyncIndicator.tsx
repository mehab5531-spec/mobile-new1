import { useEffect, useRef } from 'react';
import { toast } from 'sonner-native';
import syncService from '@/services/syncService';

export default function SyncIndicator() {
  const toastId = useRef<string | number | null>(null);

  useEffect(() => {
    const listener = (evt: { type: string; message?: string; updatesFound?: boolean }) => {
      const message = evt.message || 'An unknown sync event occurred.';

      switch (evt.type) {
        case 'sync_start':
          if (toastId.current) {
            toast.dismiss(toastId.current);
          }
          toastId.current = toast.loading(message);
          break;
        
        case 'sync_complete':
          if (toastId.current) {
            toast.dismiss(toastId.current);
          }
          if (evt.updatesFound) {
            toast.success(message);
          } else {
            toast.info(message);
          }
          toastId.current = null;
          break;

        case 'sync_error':
          if (toastId.current) {
            toast.dismiss(toastId.current);
          }
          toast.error(message);
          toastId.current = null;
          break;
      }
    };

    syncService.addSyncListener(listener);

    return () => {
      syncService.removeSyncListener(listener);
    };
  }, []);

  return null;
}

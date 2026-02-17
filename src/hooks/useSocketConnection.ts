import { useEffect } from 'react';
import { useSocietyStore } from '@/store/society.store';
import { connectSocket, disconnectSocket } from '@/services/socket.ts';

/**
 * Hook to manage socket connection based on society subscription
 */
export const useSocketConnection = () => {
    const society = useSocietyStore(state => state.society);

    useEffect(() => {
        if (society?.subscriptionId) {
            connectSocket(society.subscriptionId);
        } else {
            disconnectSocket();
        }

        // Cleanup on unmount (optional, but good practice if the app unmounts completely)
        // However, since this is likely used in App.tsx, we might want to keep it open 
        // unless society changes to null.
        return () => {
            // We only disconnect if the component unmounts, which for App.tsx means closing app.
            // But if society changes from valid to null within the lifecycle, 
            // the effect cleanup/re-run will handle it.
            // Actually, effect cleanup runs before re-running. 
            // So: 
            // 1. Mount with ID: connect.
            // 2. ID changes (or logout -> null): cleanup disconnects? 
            //    If we disconnect in cleanup, we ensure clean state.
            disconnectSocket();
        };
    }, [society?.subscriptionId]);
};

// hooks/useFollows.ts
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/types';
import { useState } from 'react';

// - Hooks are the mechanism
// - Similar to a reusable function
// - States are isolated to each component
// - Local updates

export function useFollows() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchFollows = async (userId: string, type: 'followers' | 'following') => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/${userId}/${type}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUsers(await response.json());
            }
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const clear = () => setUsers([]);

    return { users, loading, fetchFollows, clear };
}
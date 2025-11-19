import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';

export default function RootLayout() {

    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name='settings' options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
        </AuthProvider>
    );
}

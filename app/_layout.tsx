import { AuthProvider } from '@/contexts/AuthContext';
import { PostsProvider } from '@/contexts/PostsContext';
import { Stack } from 'expo-router';

export default function RootLayout() {

    return (
        <AuthProvider>
            <PostsProvider>
                <Stack>
                    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name='settings' options={{ headerShown: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                </Stack>
            </PostsProvider>
        </AuthProvider>
    );
}

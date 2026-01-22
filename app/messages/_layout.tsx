
import { Stack } from 'expo-router';

export default function MessagesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="[conversationId]" options={{ headerShown: false }} />
        </Stack>
    );
}
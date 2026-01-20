// app/(tabs)/profile/_layout.tsx
import { Stack } from 'expo-router';

export default function ProfileLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                // This enables the swipe-back gesture on iOS
                gestureEnabled: true,
            }}
        >
            {/* Own profile - the main profile tab screen */}
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            {/* Any user's profile - accessed via followers/following list */}
            <Stack.Screen
                name="[userId]"
                options={{
                    headerShown: false,
                    // Modal-like animation (slide up) or standard push
                    // animation: 'slide_from_right', // Uncomment for slide animation
                }}
            />
        </Stack>
    );
}
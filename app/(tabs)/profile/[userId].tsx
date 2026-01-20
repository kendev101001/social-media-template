// app/(tabs)/profile/[userId].tsx
import ProfileContent from '@/components/ProfileContent';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { user: currentUser } = useAuth();

    // If no userId provided, redirect to own profile
    if (!userId) {
        return <Redirect href="/(tabs)/profile" />;
    }

    // If viewing own profile through this route, still show back button
    // This handles the case where user navigates to their own profile
    // through the followers/following list
    const showBackButton = true; // Always show back since we navigated here

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ProfileContent userId={userId} showBackButton={showBackButton} />
        </SafeAreaView>
    );
}
// app/(tabs)/profile/index.tsx
import ProfileContent from '@/components/ProfileContent';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, loading } = useAuth();

    // Show loading while auth state is being determined
    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            </SafeAreaView>
        );
    }

    // Redirect to auth if not logged in
    if (!user) {
        return <Redirect href="/(auth)/login" />;
    }

    // Render own profile without back button
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ProfileContent userId={user.id} showBackButton={false} />
        </SafeAreaView>
    );
}
import { User } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserCardProps {
    user: User;
    currentUserId: string;
    showFollowButton?: boolean;
    showStats?: boolean;
    onFollow?: (userId: string) => void;
    onPress?: (userId: string) => void;
}

export default function UserCard({
    user,
    currentUserId,
    showFollowButton = true,
    showStats = true,
    onFollow,
    onPress
}: UserCardProps) {
    const followers = user.followers || [];
    const following = user.following || [];
    const isFollowing = followers.includes(currentUserId);
    const isOwnProfile = user.id === currentUserId;

    const handlePress = () => {
        if (onPress) {
            onPress(user.id);
        } else {
            // Default navigation behavior
            router.push({
                pathname: '/(tabs)/profile/[userId]',
                params: { userId: user.id }
            });
        }
    };

    const handleFollowPress = (e: any) => {
        e.stopPropagation(); // Prevent triggering the parent TouchableOpacity
        if (onFollow) {
            onFollow(user.id);
        }
    };

    return (
        <TouchableOpacity style={styles.userItem} onPress={handlePress}>
            <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                    {user.username.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.username}>@{user.username}</Text>
                {user.name && <Text style={styles.name}>{user.name}</Text>}
                {showStats && (
                    <Text style={styles.stats}>
                        {followers.length} followers • {following.length} following
                    </Text>
                )}
            </View>

            {showFollowButton && !isOwnProfile && onFollow ? (
                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowing && styles.followingButton
                    ]}
                    onPress={handleFollowPress}
                >
                    <Text style={[
                        styles.followButtonText,
                        isFollowing && styles.followingButtonText
                    ]}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userAvatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    name: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    stats: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    followButton: {
        backgroundColor: '#000',
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 6,
        minWidth: 90,
        alignItems: 'center',
    },
    followingButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dbdbdb',
    },
    followButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    followingButtonText: {
        color: '#000',
    },
});
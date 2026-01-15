import { User } from '@/types/types';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserCardProps {
    user: User;
    onFollow: (userId: string) => void;
    currentUserId: string;
}

export default function UserCard({ user, onFollow, currentUserId }: UserCardProps) {
    // These are temporary because they shouldn't be undefined
    const followers = user.followers || [];
    const following = user.following || [];
    const isFollowing = followers.includes(currentUserId);
    const isOwnProfile = user.id === currentUserId;

    return (
        <View style={styles.container}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.details}>
                    <Text style={styles.username}>@{user.username}</Text>
                    <Text style={styles.stats}>
                        {followers.length} followers • {following.length} following
                    </Text>
                </View>
            </View>

            {!isOwnProfile && (
                <TouchableOpacity
                    style={[
                        styles.followButton,
                        isFollowing && styles.followingButton
                    ]}
                    onPress={() => onFollow(user.id)}
                >
                    <Text style={[
                        styles.followButtonText,
                        isFollowing && styles.followingButtonText
                    ]}>
                        {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    details: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    stats: {
        fontSize: 13,
        color: '#666',
    },
    followButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    followingButton: {
        backgroundColor: '#e0e0e0',
    },
    followButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    followingButtonText: {
        color: '#333',
    },
});
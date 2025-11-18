

import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/types';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { user, token, logout } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('grid');
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0,
    });

    const fetchProfile = async () => {
        try {
            const [postsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/users/${user!.id}/posts`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_URL}/users/${user!.id}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setPosts(postsData);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error('Profile error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile();
    }, []);

    const handleLike = async (postId: string) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setPosts(posts.map(post => {
                    if (post.id === postId) {
                        const isLiked = post.likes.includes(user!.id);
                        return {
                            ...post,
                            likes: isLiked
                                ? post.likes.filter(id => id !== user!.id)
                                : [...post.likes, user!.id],
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const response = await fetch(`${API_URL}/posts/${postId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` },
                        });

                        if (response.ok) {
                            setPosts(posts.filter(post => post.id !== postId));
                            setStats({ ...stats, posts: stats.posts - 1 });
                        }
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete post');
                    }
                },
            },
        ]);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(auth)/login' as Href);
                },
            },
        ]);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity>
                    <Ionicons name="lock-closed-outline" size={16} color="#000" />
                </TouchableOpacity>
                <View style={styles.usernameHeader}>
                    <Text style={styles.headerUsername}>{user?.username}</Text>
                    <Ionicons name="chevron-down" size={16} color="#000" />
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/modal')}>
                        <Feather name="plus-square" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
                        <Feather name="menu" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Info Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileTop}>
                        {/* Avatar with gradient border */}
                        <View style={styles.avatarContainer}>
                            <LinearGradient
                                colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
                                style={styles.avatarGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.avatarInner}>
                                    <Text style={styles.avatarText}>
                                        {user?.username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            <TouchableOpacity style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(stats.posts)}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Name and Bio */}
                    <View style={styles.bioSection}>
                        <Text style={styles.displayName}>{user?.username}</Text>
                        <Text style={styles.bioText}>Digital creator ✨</Text>
                        <Text style={styles.bioText}>Building amazing things</Text>
                        <TouchableOpacity>
                            <Text style={styles.websiteLink}>linktr.ee/{user?.username}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.editButton}>
                            <Text style={styles.editButtonText}>Edit profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton}>
                            <Text style={styles.shareButtonText}>Share profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addFriendButton}>
                            <Ionicons name="person-add-outline" size={16} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Story Highlights */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.highlightsContainer}
                    >
                        <TouchableOpacity style={styles.highlightItem}>
                            <View style={styles.highlightCircle}>
                                <Ionicons name="add" size={24} color="#000" />
                            </View>
                            <Text style={styles.highlightLabel}>New</Text>
                        </TouchableOpacity>
                        {['Travel', 'Food', 'Fitness', 'Work'].map((item, index) => (
                            <TouchableOpacity key={index} style={styles.highlightItem}>
                                <View style={styles.highlightCircleFilled}>
                                    <Text style={styles.highlightEmoji}>
                                        {['✈️', '🍕', '💪', '💼'][index]}
                                    </Text>
                                </View>
                                <Text style={styles.highlightLabel}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Tab Bar */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
                        onPress={() => setActiveTab('grid')}
                    >
                        <Ionicons
                            name="grid-outline"
                            size={24}
                            color={activeTab === 'grid' ? '#000' : '#999'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
                        onPress={() => setActiveTab('reels')}
                    >
                        <Ionicons
                            name="play-circle-outline"
                            size={24}
                            color={activeTab === 'reels' ? '#000' : '#999'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'tagged' && styles.activeTab]}
                        onPress={() => setActiveTab('tagged')}
                    >
                        <Ionicons
                            name="person-outline"
                            size={24}
                            color={activeTab === 'tagged' ? '#000' : '#999'}
                        />
                    </TouchableOpacity>
                </View>

                {/* Posts Grid or List */}
                {posts.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIcon}>
                            <Ionicons name="camera-outline" size={48} color="#000" />
                        </View>
                        <Text style={styles.emptyTitle}>Share Photos</Text>
                        <Text style={styles.emptySubtext}>
                            When you share photos, they will appear on your profile.
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/modal')}>
                            <Text style={styles.emptyLink}>Share your first photo</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.postsGrid}>
                        {posts.map((post, index) => (
                            <TouchableOpacity key={post.id} style={styles.gridItem}>
                                <View style={styles.gridItemContent}>
                                    <Text style={styles.gridItemText} numberOfLines={3}>
                                        {post.content}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
    },
    usernameHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerUsername: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: 20,
    },
    profileSection: {
        paddingHorizontal: 16,
    },
    profileTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    avatarContainer: {
        marginRight: 28,
    },
    avatarGradient: {
        width: 86,
        height: 86,
        borderRadius: 43,
        padding: 3,
    },
    avatarInner: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#000',
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    statLabel: {
        fontSize: 13,
        color: '#000',
        marginTop: 2,
    },
    bioSection: {
        marginTop: 12,
    },
    displayName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    bioText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 20,
    },
    websiteLink: {
        fontSize: 14,
        color: '#00376b',
        fontWeight: '500',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    editButton: {
        flex: 1,
        backgroundColor: '#efefef',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    shareButton: {
        flex: 1,
        backgroundColor: '#efefef',
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    shareButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    addFriendButton: {
        backgroundColor: '#efefef',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    highlightsContainer: {
        marginTop: 16,
        marginBottom: 8,
    },
    highlightItem: {
        alignItems: 'center',
        marginRight: 16,
    },
    highlightCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: '#dbdbdb',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    highlightCircleFilled: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#efefef',
        justifyContent: 'center',
        alignItems: 'center',
    },
    highlightEmoji: {
        fontSize: 24,
    },
    highlightLabel: {
        fontSize: 12,
        marginTop: 4,
        color: '#000',
    },
    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#dbdbdb',
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#000',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyLink: {
        fontSize: 14,
        color: '#0095f6',
        fontWeight: '600',
    },
    postsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    gridItem: {
        width: width / 3,
        height: width / 3,
        borderWidth: 0.5,
        borderColor: '#fff',
    },
    gridItemContent: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 8,
        justifyContent: 'center',
    },
    gridItemText: {
        fontSize: 12,
        color: '#333',
    },
});


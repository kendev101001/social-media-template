import PostCard from '@/components/PostCard';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/types';
import { Feather, Ionicons, Octicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.usernameHeader}>
                    <Text style={styles.headerUsername}>{user?.username}</Text>
                    <Ionicons name="chevron-down" size={16} color="#000" />
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={() => router.push('/settings' as Href)}
                    >
                        <Octicons name="gear" size={24} color="black" />
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
                    </View>
                </View>

                {/* Tab Bar */}
                <Text style={styles.sectionTitle}>My Posts</Text>
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'main' && styles.activeTab]}
                        onPress={() => setActiveTab('main')}
                    >
                        <Feather
                            name="menu"
                            size={24}
                            color={activeTab === 'main' ? '#000' : '#999'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'media' && styles.activeTab]}
                        onPress={() => setActiveTab('media')}
                    >
                        <MaterialIcons
                            name="insert-photo"
                            size={24}
                            color={activeTab === 'media' ? '#000' : '#999'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'bookmarked' && styles.activeTab]}
                        onPress={() => setActiveTab('bookmarked')}
                    >
                        <Ionicons
                            name="bookmark-outline"
                            size={24}
                            color={activeTab === 'bookmarked' ? '#000' : '#999'}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.postsSection}>
                    {posts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No posts yet</Text>
                            <Text style={styles.emptySubtext}>
                                Tap the + button to create your first post
                            </Text>
                        </View>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={handleLike}
                                onDelete={handleDeletePost}
                                currentUserId={user!.id}
                                showDelete={true}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/modal')}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#F58529', '#DD2A7B', '#8134AF']}
                    style={styles.fabGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Feather name="plus" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
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
        marginBottom: 16
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

    postsSection: {
        flex: 1,
        paddingVertical: 10,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: '#333',
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50,
    },

    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5,
    },

    emptySubtext: {
        fontSize: 14,
        color: '#999',
    },

    // New FAB styles
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
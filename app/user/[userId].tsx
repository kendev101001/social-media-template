import PostCard from '@/components/PostCard';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import { Feather, Ionicons, Octicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProfileData {
    id: string;
    username: string;
    name?: string;
    bio?: string;
    link?: string;
    isFollowing: boolean;
    stats: {
        posts: number;
        followers: number;
        following: number;
    };
}

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { user: currentUser, token } = useAuth();
    const { userPosts, fetchUserPosts, toggleLike, addComment, refreshing } = usePosts();

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('main');

    const isOwnProfile = currentUser?.id === userId;

    const fetchProfile = useCallback(async () => {
        if (!userId || !token) return;

        setLoading(true);
        try {
            const [profileRes] = await Promise.all([
                fetch(`${API_URL}/users/${userId}/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetchUserPosts(userId),
            ]);

            if (profileRes.ok) {
                const data = await profileRes.json();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, token, fetchUserPosts]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleToggleFollow = async () => {
        if (!userId || !token || isOwnProfile) return;

        setFollowLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/${userId}/follow`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(prev => prev ? {
                    ...prev,
                    isFollowing: data.following,
                    stats: {
                        ...prev.stats,
                        followers: data.following
                            ? prev.stats.followers + 1
                            : prev.stats.followers - 1
                    }
                } : null);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const posts = userId ? userPosts.get(userId) || [] : [];

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            </SafeAreaView>
        );
    }

    if (!profile) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>User not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.usernameHeader}>
                    <Text style={styles.headerUsername}>{profile.username}</Text>
                </View>
                {isOwnProfile && (
                    <View style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.headerIcon}
                            onPress={() => router.push('/settings' as Href)}
                        >
                            <Octicons name="gear" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProfile} />}
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
                                        {profile.username.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Stats */}
                        <View style={styles.statsContainer}>
                            <TouchableOpacity style={styles.statItem}>
                                <Text style={styles.statNumber}>{formatNumber(profile.stats.posts)}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => router.push({
                                    pathname: '/follows-modal',
                                    params: { userId, type: 'followers' }
                                })}
                            >
                                <Text style={styles.statNumber}>{formatNumber(profile.stats.followers)}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => router.push({
                                    pathname: '/follows-modal',
                                    params: { userId, type: 'following' }
                                })}
                            >
                                <Text style={styles.statNumber}>{formatNumber(profile.stats.following)}</Text>
                                <Text style={styles.statLabel}>Following</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Name and Bio */}
                    <View style={styles.bioSection}>
                        {profile.name && <Text style={styles.displayName}>{profile.name}</Text>}
                        {profile.bio && <Text style={styles.bioText}>{profile.bio}</Text>}
                        {profile.link && (
                            <TouchableOpacity>
                                <Text style={styles.websiteLink}>{profile.link}</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Follow Button (only for other users) */}
                    {!isOwnProfile && (
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                profile.isFollowing && styles.followingButton
                            ]}
                            onPress={handleToggleFollow}
                            disabled={followLoading}
                        >
                            {followLoading ? (
                                <ActivityIndicator size="small" color={profile.isFollowing ? "#000" : "#fff"} />
                            ) : (
                                <Text style={[
                                    styles.followButtonText,
                                    profile.isFollowing && styles.followingButtonText
                                ]}>
                                    {profile.isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Bar */}
                <Text style={styles.sectionTitle}>{isOwnProfile ? 'My Posts' : 'Posts'}</Text>
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
                    {isOwnProfile && (
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
                    )}
                </View>

                <View style={styles.postsSection}>
                    {posts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No posts yet</Text>
                            {isOwnProfile && (
                                <Text style={styles.emptySubtext}>
                                    Tap the + button to create your first post
                                </Text>
                            )}
                        </View>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={toggleLike}
                                onComment={addComment}
                                currentUserId={currentUser!.id}
                                showDelete={false}
                            />
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button (only for own profile) */}
            {isOwnProfile && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/new-post-modal')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
                        style={styles.fabGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Feather name="plus" size={28} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    errorText: {
        fontSize: 16,
        color: '#666',
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

    followButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },

    followingButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dbdbdb',
    },

    followButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },

    followingButtonText: {
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

    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },

    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
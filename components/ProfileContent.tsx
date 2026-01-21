// components/ProfileContent.tsx
import PostCard from '@/components/PostCard';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import { Feather, Ionicons, Octicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileStats {
    posts: number;
    followers: number;
    following: number;
}

interface ProfileData {
    id: string;
    username: string;
    email?: string;
    name?: string;
    bio?: string;
    link?: string;
}

interface ProfileContentProps {
    userId: string;
    showBackButton?: boolean;
}

// Add this type for the active tab
type ProfileTab = 'posts' | 'bookmarks';


export default function ProfileContent({ userId, showBackButton = false }: ProfileContentProps) {
    const { user: currentUser, token } = useAuth();
    // Add fetchBookmarkedPosts to the destructured usePosts:
    const {
        userPosts,
        bookmarkedPosts,
        fetchUserPosts,
        fetchBookmarkedPosts,
        deletePost,
        toggleLike,
        toggleBookmark,
        addComment,
        refreshing
    } = usePosts();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [stats, setStats] = useState<ProfileStats>({ posts: 0, followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [followLoading, setFollowLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

    // Determine if this is the current user's own profile
    const isOwnProfile = currentUser?.id === userId;

    // Fetch profile data
    const fetchProfileData = useCallback(async () => {
        if (!userId || !token) return;
        setLoading(true);
        try {
            if (isOwnProfile && currentUser) {
                setProfile({
                    id: currentUser.id,
                    username: currentUser.username,
                    email: currentUser.email,
                    name: currentUser.name,
                    bio: currentUser.bio,
                    link: currentUser.link,
                });
                const [statsRes] = await Promise.all([
                    fetch(`${API_URL}/users/${userId}/stats`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }),
                    fetchUserPosts(userId),
                    fetchBookmarkedPosts(), // Add this
                ]);
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } else {
                // For other users, fetch full profile data
                const [profileRes] = await Promise.all([
                    fetch(`${API_URL}/users/${userId}/profile`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }),
                    fetchUserPosts(userId),
                ]);
                if (profileRes.ok) {
                    const data = await profileRes.json();
                    setProfile({
                        id: data.id,
                        username: data.username,
                        name: data.name,
                        bio: data.bio,
                        link: data.link,
                    });
                    setStats(data.stats);
                    setIsFollowing(data.isFollowing);
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, token, isOwnProfile, currentUser, fetchUserPosts, fetchBookmarkedPosts]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    // Handle follow/unfollow
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
                setIsFollowing(data.following);
                setStats(prev => ({
                    ...prev,
                    followers: data.following ? prev.followers + 1 : prev.followers - 1
                }));
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setFollowLoading(false);
        }
    };

    // Handle post deletion (only for own posts)
    const handleDeletePost = async (postId: string) => {
        Alert.alert('Delete Post', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deletePost(postId);
                        setStats(prev => ({ ...prev, posts: prev.posts - 1 }));
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete post');
                    }
                },
            },
        ]);
    };

    // Format large numbers
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    // Get posts for this user
    const posts = activeTab === 'posts'
        ? (userPosts.get(userId) || [])
        : bookmarkedPosts;


    // Loading state
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    // Error state
    if (!profile) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>User not found</Text>
                {showBackButton && (
                    <TouchableOpacity style={styles.errorBackButton} onPress={() => router.back()}>
                        <Text style={styles.errorBackButtonText}>Go Back</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }



    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Back Button - only shown when navigating to other profiles */}
                {showBackButton && (
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                )}
                <View style={[styles.usernameHeader, showBackButton && styles.usernameHeaderWithBack]}>
                    <Text style={styles.headerUsername}>{profile.username}</Text>
                    {isOwnProfile && !showBackButton}
                </View>
                {/* Settings icon - only for own profile */}
                {isOwnProfile && (
                    <View style={styles.headerRight}>
                        <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/settings' as Href)}>
                            <Octicons name="gear" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
                )}
                {/* Spacer for layout when viewing others' profiles */}
                {!isOwnProfile && <View style={styles.headerRight} />}
            </View>

            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={fetchProfileData} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Info Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileTop}>
                        {/* Avatar with gradient border */}
                        <View style={styles.avatarContainer}>
                            <LinearGradient
                                colors={['#000000', '#000000']}
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
                                <Text style={styles.statNumber}>{formatNumber(stats.posts)}</Text>
                                <Text style={styles.statLabel}>Posts</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => router.push({ pathname: '/follows-modal', params: { userId: profile.id, type: 'followers' } })}
                            >
                                <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
                                <Text style={styles.statLabel}>Followers</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.statItem}
                                onPress={() => router.push({ pathname: '/follows-modal', params: { userId: profile.id, type: 'following' } })}
                            >
                                <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
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

                    {/* Action Buttons */}
                    {!isOwnProfile &&
                        // Follow Button for other users
                        <TouchableOpacity
                            style={[styles.followButton, isFollowing && styles.followingButton]}
                            onPress={handleToggleFollow}
                            disabled={followLoading}
                        >
                            {followLoading ? (
                                <ActivityIndicator size="small" color={isFollowing ? "#000" : "#fff"} />
                            ) : (
                                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                                    {isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    }
                </View>

                {/* Tab Bar - Only show for own profile */}
                {isOwnProfile && (
                    <View style={styles.tabBar}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
                            onPress={() => setActiveTab('posts')}
                        >
                            <Feather name="grid" size={24} color={activeTab === 'posts' ? '#000' : '#999'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]}
                            onPress={() => setActiveTab('bookmarks')}
                        >
                            <Ionicons
                                name="bookmark-outline"
                                size={24}
                                color={activeTab === 'bookmarks' ? '#000' : '#999'}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {!isOwnProfile && (
                    <Text style={styles.sectionTitle}>Posts</Text>
                )}

                {/* Posts Section */}
                <View style={styles.postsSection}>
                    {posts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === 'posts' ? 'No posts yet' : 'No bookmarks yet'}
                            </Text>
                            {isOwnProfile && activeTab === 'posts' && (
                                <Text style={styles.emptySubtext}>
                                    Tap the + button to create your first post
                                </Text>
                            )}
                            {isOwnProfile && activeTab === 'bookmarks' && (
                                <Text style={styles.emptySubtext}>
                                    Posts you bookmark will appear here
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
                                onBookmark={toggleBookmark}
                                onDelete={isOwnProfile && activeTab === 'posts' ? handleDeletePost : undefined}
                                currentUserId={currentUser!.id}
                                showDelete={isOwnProfile && activeTab === 'posts'}
                                isBookmarked={bookmarkedPosts.some(p => p.id === post.id)}
                            />
                        ))
                    )}
                </View>
            </ScrollView >

            {/* Floating Action Button - only for own profile */}
            {
                isOwnProfile && (
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
                )
            }
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff'
    },

    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16
    },

    errorBackButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#007AFF',
        borderRadius: 8
    },

    errorBackButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb'
    },

    backButton: {
        padding: 4,
        marginRight: 8
    },

    usernameHeader: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },

    usernameHeaderWithBack: {
        justifyContent: 'flex-start'
    },

    headerUsername: {
        fontSize: 20,
        fontWeight: '700'
    },

    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 44
    },

    headerIcon: {
        marginLeft: 20
    },

    profileSection: {
        paddingHorizontal: 16,
        marginBottom: 16
    },

    profileTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16
    },

    avatarContainer: {
        marginRight: 28
    },

    avatarGradient: {
        width: 86,
        height: 86,
        borderRadius: 43,
        padding: 3
    },

    avatarInner: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },

    avatarText: {
        fontSize: 32,
        fontWeight: '600',
        color: '#000'
    },

    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around'
    },

    statItem: {
        alignItems: 'center'
    },

    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000'
    },

    statLabel: {
        fontSize: 13,
        color: '#000',
        marginTop: 2
    },

    bioSection: {
        marginTop: 12
    },

    displayName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000'
    },

    bioText: {
        fontSize: 14,
        color: '#000',
        lineHeight: 20
    },

    websiteLink: {
        fontSize: 14,
        color: '#00376b',
        fontWeight: '500',
        marginTop: 2
    },

    editProfileButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16
    },

    editProfileButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: '600'
    },

    followButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16
    },

    followingButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#dbdbdb'
    },

    followButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },

    followingButtonText: {
        color: '#000'
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: '#333'
    },

    postsSection: {
        flex: 1,
        paddingVertical: 10
    },

    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 50
    },

    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 5
    },

    emptySubtext: {
        fontSize: 14,
        color: '#999'
    },

    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4
        },
        shadowOpacity: 0.3,
        shadowRadius: 8
    },

    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center'
    },

    tabBar: {
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderTopColor: '#dbdbdb',
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
    },

    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'transparent',
    },

    activeTab: {
        borderBottomColor: '#000',
    },
});
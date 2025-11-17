import PostCard from '@/components/PostCard';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/types';
import { Href, router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, token, logout } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0,
    });
    const [showNewPost, setShowNewPost] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [posting, setPosting] = useState(false);

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

    useEffect(() => {
        fetchProfile();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile();
    }, []);

    const handleLike = async (postId: string) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
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
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_URL}/posts/${postId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
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
            ]
        );
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            Alert.alert('Error', 'Post content cannot be empty');
            return;
        }

        setPosting(true);
        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newPostContent }),
            });

            if (response.ok) {
                const newPost = await response.json();
                setPosts([newPost, ...posts]);
                setStats({ ...stats, posts: stats.posts + 1 });
                setNewPostContent('');
                setShowNewPost(false);
            } else {
                Alert.alert('Error', 'Failed to create post');
            }
        } catch (error) {
            console.error('Post error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setPosting(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/(auth)/login' as Href);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.username.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={styles.username}>@{user?.username}</Text>
                        <Text style={styles.email}>{user?.email}</Text>
                    </View>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.posts}</Text>
                            <Text style={styles.statLabel}>Posts</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.followers}</Text>
                            <Text style={styles.statLabel}>Followers</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{stats.following}</Text>
                            <Text style={styles.statLabel}>Following</Text>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.newPostButton}
                            onPress={() => setShowNewPost(true)}
                        >
                            <Text style={styles.newPostButtonText}>New Post</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.postsSection}>
                    <Text style={styles.sectionTitle}>My Posts</Text>
                    {posts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No posts yet</Text>
                            <Text style={styles.emptySubtext}>
                                Tap "New Post" to create your first post
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

            <Modal
                visible={showNewPost}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowNewPost(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create New Post</Text>
                            <TouchableOpacity
                                onPress={() => setShowNewPost(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.postInput}
                            placeholder="What's on your mind?"
                            multiline
                            value={newPostContent}
                            onChangeText={setNewPostContent}
                            maxLength={500}
                            editable={!posting}
                        />

                        <Text style={styles.charCount}>
                            {newPostContent.length}/500
                        </Text>

                        <TouchableOpacity
                            style={[styles.postButton, posting && styles.buttonDisabled]}
                            onPress={handleCreatePost}
                            disabled={posting}
                        >
                            <Text style={styles.postButtonText}>
                                {posting ? 'Posting...' : 'Post'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    newPostButton: {
        flex: 1,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    newPostButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
    },
    logoutButton: {
        flex: 1,
        backgroundColor: '#ff3b30',
        paddingVertical: 10,
        borderRadius: 5,
    },
    logoutButtonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: '600',
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '90%',
        borderRadius: 10,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
    },
    postInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        minHeight: 120,
        textAlignVertical: 'top',
        fontSize: 16,
    },
    charCount: {
        textAlign: 'right',
        color: '#666',
        marginTop: 5,
        marginBottom: 15,
        fontSize: 12,
    },
    postButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    postButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
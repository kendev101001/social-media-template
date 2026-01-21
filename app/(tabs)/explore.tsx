import PostCard from '@/components/PostCard';
import UserCard from '@/components/UserCard';
import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePosts } from '@/contexts/PostsContext';
import { User } from '@/types/types';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
    const { user, token } = useAuth();
    const {
        explorePosts,
        refreshing: contextRefreshing,
        toggleLike,
        addComment,
        fetchExplore,
        toggleBookmark,
        bookmarkedPosts
    } = usePosts();
    const [users, setUsers] = useState<User[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchMode, setSearchMode] = useState<'posts' | 'users'>('posts');
    const [initialLoad, setInitialLoad] = useState(true);

    const searchUsers = async () => {
        if (!searchQuery.trim()) return;

        setSearchLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/search?q=${searchQuery}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
                setSearchMode('users');
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchExplore().finally(() => setInitialLoad(false));
    }, []);

    const onRefresh = useCallback(() => {
        setSearchQuery('');
        setSearchMode('posts');
        fetchExplore();
    }, []);

    const handleFollow = async (userId: string) => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}/follow`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setUsers(users.map(u => {
                    if (u.id === userId) {
                        // Need to properly fix because u.followers should never be undefined
                        // Should just return empty []
                        const followers = u.followers || [];
                        const isFollowing = followers.includes(user!.id);
                        return {
                            ...u,
                            followers: isFollowing
                                ? followers.filter(id => id !== user!.id)
                                : [...followers, user!.id],
                        };
                    }
                    return u;
                }));
            }
        } catch (error) {
            console.error('Follow error:', error);
        }
    };

    if (initialLoad && contextRefreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={searchUsers}
                />
                <TouchableOpacity style={styles.searchButton} onPress={searchUsers}>
                    <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
            </View>

            {searchMode === 'users' ? (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <UserCard
                            user={item}
                            currentUserId={user.id}
                            onFollow={handleFollow}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={false} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>No users found</Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    data={explorePosts}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PostCard
                            post={item}
                            onLike={toggleLike}
                            onComment={addComment}
                            onBookmark={toggleBookmark}
                            currentUserId={user.id}
                            isBookmarked={bookmarkedPosts.some(p => p.id === item.id)}
                        />
                    )}
                    refreshControl={
                        <RefreshControl refreshing={contextRefreshing} onRefresh={onRefresh} />
                    }
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={
                        <View style={styles.centerContainer}>
                            <Text style={styles.emptyText}>No posts to explore</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    searchButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        justifyContent: 'center',
        borderRadius: 20,
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    listContainer: {
        paddingVertical: 10,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
    },
});
import { API_URL } from '@/config/api';
import { Post } from '@/types/types';
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

interface PostsContextType {
    posts: Map<string, Post>;
    feedPosts: Post[];
    explorePosts: Post[];
    userPosts: Map<string, Post[]>;
    bookmarkedPosts: Post[];

    fetchFeed: () => Promise<void>;
    fetchExplore: () => Promise<void>;
    fetchUserPosts: (userId: string) => Promise<void>;
    fetchBookmarkedPosts: () => Promise<void>;

    toggleLike: (postId: string) => Promise<void>;
    toggleBookmark: (postId: string) => Promise<void>;
    addComment: (postId: string, content: string) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    createPost: (content: string, imageUri?: string | null) => Promise<void>;

    loading: boolean;
    refreshing: boolean;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export function PostsProvider({ children }: { children: React.ReactNode }) {
    const { token, user } = useAuth();

    const [posts, setPosts] = useState<Map<string, Post>>(new Map());
    const [feedPostIds, setFeedPostIds] = useState<string[]>([]);
    const [explorePostIds, setExplorePostIds] = useState<string[]>([]);
    const [userPostsMap, setUserPostsMap] = useState<Map<string, string[]>>(new Map());
    const [bookmarkedPostIds, setBookmarkedPostIds] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const updatePost = useCallback((postId: string, updater: (post: Post) => Post) => {
        setPosts(prev => {
            const newPosts = new Map(prev);
            const post = newPosts.get(postId);
            if (post) {
                newPosts.set(postId, updater(post));
            }
            return newPosts;
        });
    }, []);

    const addPosts = useCallback((newPosts: Post[]) => {
        setPosts(prev => {
            const updated = new Map(prev);
            newPosts.forEach(post => {
                updated.set(post.id, post);
            });
            return updated;
        });
    }, []);

    const fetchFeed = useCallback(async () => {
        if (!token || !user) return;

        setRefreshing(true);
        try {
            const response = await fetch(`${API_URL}/posts/feed`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data: Post[] = await response.json();
                addPosts(data);
                setFeedPostIds(data.map(p => p.id));
            }
        } catch (error) {
            console.error('Feed error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [token, user, addPosts]);

    const fetchExplore = useCallback(async () => {
        if (!token) return;

        setRefreshing(true);
        try {
            const response = await fetch(`${API_URL}/posts/explore`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data: Post[] = await response.json();
                addPosts(data);
                setExplorePostIds(data.map(p => p.id));
            }
        } catch (error) {
            console.error('Explore error:', error);
        } finally {
            setRefreshing(false);
        }
    }, [token, addPosts]);

    const fetchUserPosts = useCallback(async (userId: string) => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/${userId}/posts`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data: Post[] = await response.json();
                addPosts(data);
                setUserPostsMap(prev => {
                    const updated = new Map(prev);
                    updated.set(userId, data.map(p => p.id));
                    return updated;
                });
            }
        } catch (error) {
            console.error('User posts error:', error);
        } finally {
            setLoading(false);
        }
    }, [token, addPosts]);

    const fetchBookmarkedPosts = useCallback(async () => {
        if (!token || !user) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/users/${user.id}/bookmarks`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                const data: Post[] = await response.json();
                addPosts(data);
                setBookmarkedPostIds(data.map(p => p.id));
            }
        } catch (error) {
            console.error('Bookmarked posts error:', error);
        } finally {
            setLoading(false);
        }
    }, [token, user, addPosts]);

    const toggleLike = useCallback(async (postId: string) => {
        if (!token || !user) return;

        const post = posts.get(postId);
        if (!post) return;

        const isLiked = post.likes.includes(user.id);

        updatePost(postId, (p) => ({
            ...p,
            likes: isLiked
                ? p.likes.filter(id => id !== user.id)
                : [...p.likes, user.id]
        }));

        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                updatePost(postId, (p) => ({
                    ...p,
                    likes: isLiked
                        ? [...p.likes, user.id]
                        : p.likes.filter(id => id !== user.id)
                }));
            }
        } catch (error) {
            console.error('Like error:', error);
            updatePost(postId, (p) => ({
                ...p,
                likes: isLiked
                    ? [...p.likes, user.id]
                    : p.likes.filter(id => id !== user.id)
            }));
        }
    }, [token, user, posts, updatePost]);

    const toggleBookmark = useCallback(async (postId: string) => {
        if (!token || !user) return;

        const isBookmarked = bookmarkedPostIds.includes(postId);

        // Optimistic update
        if (isBookmarked) {
            setBookmarkedPostIds(prev => prev.filter(id => id !== postId));
        } else {
            setBookmarkedPostIds(prev => [postId, ...prev]);
        }

        try {
            const response = await fetch(`${API_URL}/posts/${postId}/bookmark`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                // Rollback on error
                if (isBookmarked) {
                    setBookmarkedPostIds(prev => [postId, ...prev]);
                } else {
                    setBookmarkedPostIds(prev => prev.filter(id => id !== postId));
                }
            }
        } catch (error) {
            console.error('Bookmark error:', error);
            // Rollback on error
            if (isBookmarked) {
                setBookmarkedPostIds(prev => [postId, ...prev]);
            } else {
                setBookmarkedPostIds(prev => prev.filter(id => id !== postId));
            }
        }
    }, [token, user, bookmarkedPostIds]);

    const addComment = useCallback(async (postId: string, content: string) => {
        if (!token || !user) return;

        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content }),
            });

            if (response.ok) {
                const comment = await response.json();
                updatePost(postId, (p) => ({
                    ...p,
                    comments: [...(p.comments || []), comment]
                }));
            }
        } catch (error) {
            console.error('Comment error:', error);
            throw error;
        }
    }, [token, user, updatePost]);

    const deletePost = useCallback(async (postId: string) => {
        if (!token) return;

        try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setPosts(prev => {
                    const updated = new Map(prev);
                    updated.delete(postId);
                    return updated;
                });

                setFeedPostIds(prev => prev.filter(id => id !== postId));
                setExplorePostIds(prev => prev.filter(id => id !== postId));
                setBookmarkedPostIds(prev => prev.filter(id => id !== postId));
                setUserPostsMap(prev => {
                    const updated = new Map(prev);
                    updated.forEach((ids, userId) => {
                        updated.set(userId, ids.filter(id => id !== postId));
                    });
                    return updated;
                });
            }
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    }, [token]);

    const createPost = useCallback(async (content: string, imageUri?: string | null) => {
        if (!token || !user) return;

        try {
            const formData = new FormData();
            formData.append('content', content);

            if (imageUri) {
                const filename = imageUri.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formData.append('image', {
                    uri: imageUri,
                    name: filename,
                    type,
                } as any);
            }

            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const newPost = await response.json();

                setPosts(prev => {
                    const updated = new Map(prev);
                    updated.set(newPost.id, newPost);
                    return updated;
                });

                setFeedPostIds(prev => [newPost.id, ...prev]);

                setUserPostsMap(prev => {
                    const updated = new Map(prev);
                    const userPosts = updated.get(user.id) || [];
                    updated.set(user.id, [newPost.id, ...userPosts]);
                    return updated;
                });
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Create post error:', error);
            throw error;
        }
    }, [token, user]);

    const feedPosts = useMemo(() =>
        feedPostIds.map(id => posts.get(id)).filter(Boolean) as Post[],
        [feedPostIds, posts]
    );

    const explorePosts = useMemo(() =>
        explorePostIds.map(id => posts.get(id)).filter(Boolean) as Post[],
        [explorePostIds, posts]
    );

    const userPosts = useMemo(() => {
        const result = new Map<string, Post[]>();
        userPostsMap.forEach((ids, userId) => {
            result.set(userId, ids.map(id => posts.get(id)).filter(Boolean) as Post[]);
        });
        return result;
    }, [userPostsMap, posts]);

    const bookmarkedPosts = useMemo(() =>
        bookmarkedPostIds.map(id => posts.get(id)).filter(Boolean) as Post[],
        [bookmarkedPostIds, posts]
    );

    return (
        <PostsContext.Provider value={{
            posts,
            feedPosts,
            explorePosts,
            userPosts,
            bookmarkedPosts,
            fetchFeed,
            fetchExplore,
            fetchUserPosts,
            fetchBookmarkedPosts,
            toggleLike,
            toggleBookmark,
            addComment,
            deletePost,
            createPost,
            loading,
            refreshing,
        }}>
            {children}
        </PostsContext.Provider>
    );
}

export function usePosts() {
    const context = useContext(PostsContext);
    if (!context) {
        throw new Error('usePosts must be used within PostsProvider');
    }
    return context;
}

import { API_URL } from '@/config/api';
import { useAuth } from "@/contexts/AuthContext";
import { Post } from "@/types/types";
import { useState } from "react";

export function usePosts() {
    const { user, token } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);

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

    const handleComment = async (postId: string, content: string) => {
        if (!content.trim()) return;

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
                const newComment = await response.json();

                // Update the post's comments in the global posts array
                setPosts(posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            comments: [...(post.comments || []), newComment],
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Comment error:', error);
        }
    };

    return { posts, setPosts, handleLike, handleComment };
}
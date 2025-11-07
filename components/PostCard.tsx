import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { Comment, Post } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface PostCardProps {
    post: Post;
    onLike: (postId: string) => void;
    onDelete?: (postId: string) => void;
    currentUserId: string;
    showDelete?: boolean;
}

export default function PostCard({
    post,
    onLike,
    onDelete,
    currentUserId,
    showDelete = false
}: PostCardProps) {
    const { token } = useAuth();
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<Comment[]>(post.comments || []);
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);

    const isLiked = post.likes.includes(currentUserId);
    const isOwnPost = post.userId === currentUserId;

    const handleComment = async () => {
        if (!newComment.trim()) return;

        setCommenting(true);
        try {
            const response = await fetch(`${API_URL}/posts/${post.id}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (response.ok) {
                const comment = await response.json();
                setComments([...comments, comment]);
                setNewComment('');
            } else {
                Alert.alert('Error', 'Failed to post comment');
            }
        } catch (error) {
            console.error('Comment error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setCommenting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {post.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.username}>@{post.username}</Text>
                        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
                    </View>
                </View>
                {showDelete && isOwnPost && onDelete && (
                    <TouchableOpacity onPress={() => onDelete(post.id)}>
                        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={styles.content}>{post.content}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onLike(post.id)}
                >
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={isLiked ? "#ff3b30" : "#666"}
                    />
                    <Text style={styles.actionText}>{post.likes.length}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setShowComments(!showComments)}
                >
                    <Ionicons
                        name="chatbubble-outline"
                        size={24}
                        color="#666"
                    />
                    <Text style={styles.actionText}>{comments.length}</Text>
                </TouchableOpacity>
            </View>

            {showComments && (
                <View style={styles.commentsSection}>
                    <View style={styles.commentInputContainer}>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Add a comment..."
                            value={newComment}
                            onChangeText={setNewComment}
                            editable={!commenting}
                        />
                        <TouchableOpacity
                            style={[styles.commentButton, commenting && styles.buttonDisabled]}
                            onPress={handleComment}
                            disabled={commenting}
                        >
                            <Text style={styles.commentButtonText}>
                                {commenting ? '...' : 'Post'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {comments.map((comment, index) => (
                        <View key={index} style={styles.comment}>
                            <Text style={styles.commentUsername}>@{comment.username}</Text>
                            <Text style={styles.commentContent}>{comment.content}</Text>
                            <Text style={styles.commentTime}>{formatDate(comment.createdAt)}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    username: {
        fontWeight: '600',
        fontSize: 14,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    content: {
        fontSize: 15,
        lineHeight: 20,
        color: '#333',
        marginBottom: 10,
    },
    actions: {
        flexDirection: 'row',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    actionText: {
        marginLeft: 5,
        color: '#666',
        fontSize: 14,
    },
    commentsSection: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    commentInputContainer: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
    },
    commentButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 15,
        justifyContent: 'center',
        borderRadius: 20,
    },
    commentButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    comment: {
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 8,
        marginVertical: 3,
    },
    commentUsername: {
        fontWeight: '600',
        fontSize: 13,
        marginBottom: 2,
    },
    commentContent: {
        fontSize: 14,
        color: '#333',
    },
    commentTime: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
});
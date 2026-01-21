import { API_URL } from '@/config/api';
import { Post } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface PostCardProps {
    post: Post;
    onLike: (postId: string) => void;
    onComment: (postId: string, content: string) => void;
    onBookmark?: (postId: string) => void;  // Changed from optional void return
    onDelete?: (postId: string) => void;
    currentUserId: string;
    showDelete?: boolean;
    onUserPress?: (userId: string) => void;
    isBookmarked?: boolean;  // Add this prop
}

// Helper to get full image URL
const getImageUrl = (imageUrl: string | undefined | null): string | null => {
    if (!imageUrl) return null;

    // If it's already a full URL, return as-is
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    // Otherwise, prepend the API base URL (without /api)
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
};

export default function PostCard({
    post,
    onLike,
    onComment,
    onBookmark,
    onDelete,
    currentUserId,
    showDelete = false,
    onUserPress,
    isBookmarked = false  // Add this
}: PostCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [commenting, setCommenting] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isLiked = post.likes.includes(currentUserId);
    const isOwnPost = post.userId === currentUserId;
    const imageUrl = getImageUrl(post.imageUrl);

    const handleUserPress = () => {
        if (onUserPress) {
            onUserPress(post.userId);
        } else {
            // Default navigation behavior
            router.push({
                pathname: '/(tabs)/profile/[userId]',
                params: { userId: post.userId }
            });
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;

        setCommenting(true);
        await onComment(post.id, newComment);
        setNewComment('');
        setCommenting(false);
    };

    const handleBookmark = async () => {
        if (onBookmark) {
            await onBookmark(post.id);
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

    // Update the bookmark button to show filled/outline based on state:
    // const isBookmarked = post.bookmarks?.includes(currentUserId) || false;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={handleUserPress}
                    activeOpacity={0.7}
                >
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {post.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userTextInfo}>
                        <Text style={styles.username}>@{post.username}</Text>
                        <Text style={styles.timestamp}>{formatDate(post.createdAt)}</Text>
                    </View>
                </TouchableOpacity>
                {showDelete && isOwnPost && onDelete && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDelete(post.id)}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Post content */}
            {post.content ? (
                <Text style={styles.content}>{post.content}</Text>
            ) : null}

            {/* Post image */}
            {imageUrl && !imageError && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                        onError={() => setImageError(true)}
                    />
                </View>
            )}

            {/* Image load error fallback */}
            {imageUrl && imageError && (
                <View style={styles.imageErrorContainer}>
                    <Ionicons name="image-outline" size={40} color="#ccc" />
                    <Text style={styles.imageErrorText}>Failed to load image</Text>
                </View>
            )}

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
                    <Text style={styles.actionText}>{post.comments.length}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleBookmark}
                >
                    <Ionicons
                        name={isBookmarked ? "bookmark" : "bookmark-outline"}
                        size={24}
                        color={isBookmarked ? "#000" : "#666"}
                    />
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

                    {post.comments.map((comment, index) => (
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
        flex: 1,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#666',
    },
    userTextInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    timestamp: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    deleteButton: {
        padding: 4,
    },
    content: {
        fontSize: 15,
        lineHeight: 20,
        color: '#333',
        marginBottom: 10,
    },
    imageContainer: {
        marginVertical: 10,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    postImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
    },
    imageErrorContainer: {
        height: 200,
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    imageErrorText: {
        color: '#999',
        marginTop: 10,
        fontSize: 14,
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
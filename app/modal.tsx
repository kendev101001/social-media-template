
import { usePosts } from '@/contexts/PostsContext';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ModalScreen() {
    const [newPostContent, setNewPostContent] = useState('');
    const { createPost } = usePosts();
    // Move posting to post context 
    const [posting, setPosting] = useState(false);

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            Alert.alert('Error', 'Post content cannot be empty');
            return;
        }
        setPosting(true);
        try {
            await createPost(newPostContent);
        } catch (error) {
            console.error('Post error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setPosting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Create New Post</Text>
                    <TouchableOpacity
                        onPress={handleCreatePost}
                        disabled={posting || !newPostContent.trim()}
                    >
                        <Text style={[
                            styles.postButton,
                            (posting || !newPostContent.trim()) && styles.postButtonDisabled
                        ]}>
                            {posting ? 'Posting...' : 'Post'}
                        </Text>
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
                    autoFocus
                />

                <Text style={styles.charCount}>
                    {newPostContent.length}/500
                </Text>
            </View>

            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        fontSize: 16,
        color: '#007AFF',
    },
    postButton: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    postButtonDisabled: {
        color: '#ccc',
    },
    postInput: {
        flex: 1,
        fontSize: 16,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    charCount: {
        textAlign: 'right',
        color: '#666',
        marginTop: 10,
        fontSize: 12,
    },
});

import ImageViewer from '@/components/ImageViewer';
import { usePosts } from '@/contexts/PostsContext';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ModalScreen() {
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const { createPost } = usePosts();
    const [posting, setPosting] = useState(false);

    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        } else {
            Alert.alert('No image selected', 'You did not select any image.');
        }
    };

    const removeImage = () => {
        setSelectedImage(undefined);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            Alert.alert('Error', 'Post content cannot be empty');
            return;
        }

        setPosting(true);
        try {
            await createPost(newPostContent, selectedImage);
            setNewPostContent('');
            setSelectedImage(undefined);
            router.back();
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

                <ScrollView style={styles.scrollContent}>
                    {selectedImage && (
                        <View style={styles.imageContainer}>
                            <ImageViewer selectedImage={selectedImage} />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={removeImage}
                            >
                                <Ionicons name="close-circle" size={32} color="#ff0000" />
                            </TouchableOpacity>
                        </View>
                    )}

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
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.addImageButton}
                        onPress={pickImageAsync}
                        disabled={posting}
                    >
                        <AntDesign name="picture" size={24} color="#007AFF" />
                        <Text style={styles.addImageText}>Add Photo</Text>
                    </TouchableOpacity>

                    <Text style={styles.charCount}>
                        {newPostContent.length}/500
                    </Text>
                </View>
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
    scrollContent: {
        flex: 1,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
    },
    postInput: {
        fontSize: 16,
        minHeight: 150,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    addImageText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#007AFF',
    },
    charCount: {
        color: '#666',
        fontSize: 12,
    },
});

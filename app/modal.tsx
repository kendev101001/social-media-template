

import { usePosts } from '@/contexts/PostsContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    Alert,
    Image,
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { createPost } = usePosts();
    const [posting, setPosting] = useState(false);

    const pickImage = async () => {
        // Request permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your photo library to select images.'
            );
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        // Request camera permission
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please allow access to your camera to take photos.'
            );
            return;
        }

        // Launch camera
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
    };

    const showImageOptions = () => {
        Alert.alert(
            'Add Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Library', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedImage) {
            Alert.alert('Error', 'Please add some content or an image');
            return;
        }
        setPosting(true);
        try {
            // TODO: Modify createPost to handle image upload
            await createPost(newPostContent);
            // When you add backend support, you'll pass selectedImage here
            // await createPost(newPostContent, selectedImage);
        } catch (error) {
            console.error('Post error:', error);
            Alert.alert('Error', 'Network error');
        } finally {
            setPosting(false);
        }
    };

    const canPost = newPostContent.trim() || selectedImage;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Create New Post</Text>
                    <TouchableOpacity
                        onPress={handleCreatePost}
                        disabled={posting || !canPost}
                    >
                        <Text style={[
                            styles.postButton,
                            (posting || !canPost) && styles.postButtonDisabled
                        ]}>
                            {posting ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Scrollable Content Area */}
                <ScrollView
                    style={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Text Input */}
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

                    {/* Image Preview */}
                    {selectedImage && (
                        <View style={styles.imagePreviewContainer}>
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.imagePreview}
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={removeImage}
                                disabled={posting}
                            >
                                <Ionicons name="close-circle" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                {/* Bottom Bar */}
                <View style={styles.bottomBar}>
                    <View style={styles.mediaButtons}>
                        <TouchableOpacity
                            style={styles.mediaButton}
                            onPress={showImageOptions}
                            disabled={posting}
                        >
                            <Ionicons
                                name="image-outline"
                                size={24}
                                color={posting ? '#ccc' : '#007AFF'}
                            />
                            <Text style={[
                                styles.mediaButtonText,
                                posting && styles.mediaButtonTextDisabled
                            ]}>
                                Photo
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.mediaButton}
                            onPress={takePhoto}
                            disabled={posting}
                        >
                            <Ionicons
                                name="camera-outline"
                                size={24}
                                color={posting ? '#ccc' : '#007AFF'}
                            />
                            <Text style={[
                                styles.mediaButtonText,
                                posting && styles.mediaButtonTextDisabled
                            ]}>
                                Camera
                            </Text>
                        </TouchableOpacity>
                    </View>

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
    postInput: {
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 100,
        paddingTop: 10,
    },
    imagePreviewContainer: {
        marginTop: 15,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    imagePreview: {
        width: '100%',
        height: 250,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 14,
        padding: 2,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    mediaButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    mediaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    mediaButtonText: {
        color: '#007AFF',
        fontSize: 14,
    },
    mediaButtonTextDisabled: {
        color: '#ccc',
    },
    charCount: {
        color: '#666',
        fontSize: 12,
    },
});
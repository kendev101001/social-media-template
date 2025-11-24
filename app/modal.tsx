import { usePosts } from '@/contexts/PostsContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActionSheetIOS,
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
    const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
    const { createPost } = usePosts();
    const [posting, setPosting] = useState(false);

    const pickImageFromGallery = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera roll is required!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Permission to access camera is required!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const showImagePickerOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        takePhoto();
                    } else if (buttonIndex === 2) {
                        pickImageFromGallery();
                    }
                }
            );
        } else {
            Alert.alert(
                'Select Image',
                'Choose an option',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Take Photo',
                        onPress: takePhoto,
                    },
                    {
                        text: 'Choose from Gallery',
                        onPress: pickImageFromGallery,
                    },
                ],
                { cancelable: true }
            );
        }
    };

    const removeImage = () => {
        setSelectedImage(undefined);
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim() && !selectedImage) {
            Alert.alert('Error', 'Post must have content or an image');
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
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create post');
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
                        disabled={posting || (!newPostContent.trim() && !selectedImage)}
                    >
                        <Text style={[
                            styles.postButton,
                            (posting || (!newPostContent.trim() && !selectedImage)) && styles.postButtonDisabled
                        ]}>
                            {posting ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                                <Ionicons name="close-circle" size={30} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.imagePickerButton}
                        onPress={showImagePickerOptions}
                        disabled={posting}
                    >
                        <Ionicons
                            name="camera-outline"
                            size={24}
                            color={posting ? '#ccc' : '#007AFF'}
                        />
                        <Text style={[
                            styles.imagePickerText,
                            posting && styles.textDisabled
                        ]}>
                            {selectedImage ? 'Change Image' : 'Add Image'}
                        </Text>
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
    postInput: {
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 10,
    },
    imagePreviewContainer: {
        marginTop: 15,
        marginBottom: 15,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    imagePreview: {
        width: '100%',
        height: 300,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 15,
        marginTop: 10,
    },
    imagePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 10,
    },
    imagePickerText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500',
    },
    textDisabled: {
        color: '#ccc',
    },
    charCount: {
        color: '#666',
        fontSize: 12,
    },
});
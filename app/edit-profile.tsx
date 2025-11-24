import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const { user } = useAuth();

    // Initialize form state with current user data
    const [formData, setFormData] = useState({
        name: '',
        username: user?.username || '',
        bio: '',
        link: ''
    });

    const handleSave = () => {
        // Placeholder for save functionality
        console.log('Saving profile:', formData);
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Picture Section */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {formData.username.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity>
                            <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        {/* Name */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Your name"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Username */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.username}
                                onChangeText={(text) => setFormData({ ...formData, username: text })}
                                placeholder="Username"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Bio */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={formData.bio}
                                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                                placeholder="Tell us about yourself"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                maxLength={150}
                            />
                            <Text style={styles.charCount}>{formData.bio.length}/150</Text>
                        </View>

                        {/* Links Section */}
                        <View style={styles.linksSection}>
                            <Text style={styles.sectionTitle}>Links</Text>

                            {/* Website */}
                            <View style={styles.inputContainer}>
                                <View style={styles.linkInputWrapper}>
                                    <Ionicons name="globe-outline" size={20} color="#666" style={styles.linkIcon} />
                                    <TextInput
                                        style={styles.linkInput}
                                        value={formData.link}
                                        onChangeText={(text) => setFormData({ ...formData, link: text })}
                                        placeholder="Website"
                                        placeholderTextColor="#999"
                                        autoCapitalize="none"
                                        keyboardType="url"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#dbdbdb',
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },

    cancelText: {
        fontSize: 16,
        color: '#000',
    },

    doneText: {
        fontSize: 16,
        color: '#0095f6',
        fontWeight: '600',
    },

    scrollContent: {
        paddingBottom: 40,
    },

    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },

    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#efefef',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },

    avatarText: {
        fontSize: 36,
        fontWeight: '600',
        color: '#666',
    },

    changePhotoText: {
        color: '#0095f6',
        fontSize: 14,
        fontWeight: '600',
    },

    formSection: {
        paddingHorizontal: 16,
    },

    inputContainer: {
        marginBottom: 20,
    },

    label: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
        fontWeight: '500',
    },

    input: {
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000',
        backgroundColor: '#fafafa',
    },

    bioInput: {
        height: 100,
        paddingTop: 10,
    },

    charCount: {
        fontSize: 12,
        color: '#999',
        textAlign: 'right',
        marginTop: 4,
    },

    linksSection: {
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 16,
    },

    linkInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fafafa',
    },

    linkIcon: {
        marginRight: 10,
    },

    linkInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
        color: '#000',
    },
});
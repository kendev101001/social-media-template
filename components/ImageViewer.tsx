import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ImageViewerProps {
    selectedImage: string;
}

export default function ImageViewer({ selectedImage }: ImageViewerProps) {
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: selectedImage }}
                style={styles.image}
                resizeMode="cover"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 12,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
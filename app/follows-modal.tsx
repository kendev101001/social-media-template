import { useFollows } from "@/hooks/useFollows";
import { User } from "@/types/types";
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text, TouchableOpacity, View
} from "react-native";

export default function FollowsModalScreen() {
    // Uses userId as prop instead of context
    // Because this is reusable for any user
    // Not necessary the current user
    const { userId, type } = useLocalSearchParams<{ userId: string; type: 'followers' | 'following' }>();
    const { users, loading, fetchFollows } = useFollows();

    useEffect(() => {
        if (userId && type) {
            fetchFollows(userId, type);
        }
    }, [userId, type]);

    if (loading) {
        return <ActivityIndicator size="large" />;
    }

    const userItem = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={styles.userItem}
            activeOpacity={0.7}
        >
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.username.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                {item.name && <Text style={styles.name}>{item.name}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    const separator = () => <View style={styles.separator} />;

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.title}>{type === 'followers' ? 'Followers' : 'Following'}</Text>
            </View>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={userItem}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={separator}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        paddingTop: 10,
    },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },

    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },

    userInfo: {
        marginLeft: 12,
        flex: 1,
    },

    username: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },

    name: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },

    separator: {
        height: 0.5,
        backgroundColor: '#cbcbcb',
    },

    listContainer: {
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
});
import { useFollows } from "@/hooks/useFollows";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

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

    return (
        <View>
            <Text>{type === 'followers' ? 'Followers' : 'Following'}</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <Text>{item.username}</Text>}
            />
        </View>
    );
}
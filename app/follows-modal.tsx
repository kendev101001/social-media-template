import { useFollows } from "@/hooks/useFollows";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

export default function FollowsModalScreen() {
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
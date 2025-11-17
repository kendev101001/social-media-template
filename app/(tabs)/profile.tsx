
// START OF MODEL A ---------------------------------------------------------------------------------------------------------------------------------------

// DESIGN 1 ----------------------------------------------------------------------

// import { API_URL } from '@/config/api';
// import { useAuth } from '@/contexts/AuthContext';
// import { Post } from '@/types/types';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Href, router, useFocusEffect } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import {
//     Alert,
//     Dimensions,
//     RefreshControl,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');

// export default function ProfileScreen() {
//     const { user, token, logout } = useAuth();
//     const [posts, setPosts] = useState<Post[]>([]);
//     const [refreshing, setRefreshing] = useState(false);
//     const [activeTab, setActiveTab] = useState('grid');
//     const [stats, setStats] = useState({
//         posts: 0,
//         followers: 0,
//         following: 0,
//     });

//     const fetchProfile = async () => {
//         try {
//             const [postsRes, statsRes] = await Promise.all([
//                 fetch(`${API_URL}/users/${user!.id}/posts`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 }),
//                 fetch(`${API_URL}/users/${user!.id}/stats`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 }),
//             ]);

//             if (postsRes.ok) {
//                 const postsData = await postsRes.json();
//                 setPosts(postsData);
//             }

//             if (statsRes.ok) {
//                 const statsData = await statsRes.json();
//                 setStats(statsData);
//             }
//         } catch (error) {
//             console.error('Profile error:', error);
//         } finally {
//             setRefreshing(false);
//         }
//     };

//     useFocusEffect(
//         useCallback(() => {
//             fetchProfile();
//         }, [])
//     );

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchProfile();
//     }, []);

//     const handleLike = async (postId: string) => {
//         try {
//             const response = await fetch(`${API_URL}/posts/${postId}/like`, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}` },
//             });

//             if (response.ok) {
//                 setPosts(posts.map(post => {
//                     if (post.id === postId) {
//                         const isLiked = post.likes.includes(user!.id);
//                         return {
//                             ...post,
//                             likes: isLiked
//                                 ? post.likes.filter(id => id !== user!.id)
//                                 : [...post.likes, user!.id],
//                         };
//                     }
//                     return post;
//                 }));
//             }
//         } catch (error) {
//             console.error('Like error:', error);
//         }
//     };

//     const handleDeletePost = async (postId: string) => {
//         Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
//             { text: 'Cancel', style: 'cancel' },
//             {
//                 text: 'Delete',
//                 style: 'destructive',
//                 onPress: async () => {
//                     try {
//                         const response = await fetch(`${API_URL}/posts/${postId}`, {
//                             method: 'DELETE',
//                             headers: { 'Authorization': `Bearer ${token}` },
//                         });

//                         if (response.ok) {
//                             setPosts(posts.filter(post => post.id !== postId));
//                             setStats({ ...stats, posts: stats.posts - 1 });
//                         }
//                     } catch (error) {
//                         console.error('Delete error:', error);
//                         Alert.alert('Error', 'Failed to delete post');
//                     }
//                 },
//             },
//         ]);
//     };

//     const handleLogout = () => {
//         Alert.alert('Logout', 'Are you sure you want to logout?', [
//             { text: 'Cancel', style: 'cancel' },
//             {
//                 text: 'Logout',
//                 style: 'destructive',
//                 onPress: () => {
//                     logout();
//                     router.replace('/(auth)/login' as Href);
//                 },
//             },
//         ]);
//     };

//     const formatNumber = (num: number) => {
//         if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
//         if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
//         return num.toString();
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             {/* Header */}
//             <View style={styles.header}>
//                 <TouchableOpacity>
//                     <Ionicons name="lock-closed-outline" size={16} color="#000" />
//                 </TouchableOpacity>
//                 <View style={styles.usernameHeader}>
//                     <Text style={styles.headerUsername}>{user?.username}</Text>
//                     <Ionicons name="chevron-down" size={16} color="#000" />
//                 </View>
//                 <View style={styles.headerRight}>
//                     <TouchableOpacity style={styles.headerIcon} onPress={() => router.push('/modal')}>
//                         <Feather name="plus-square" size={24} color="#000" />
//                     </TouchableOpacity>
//                     <TouchableOpacity style={styles.headerIcon} onPress={handleLogout}>
//                         <Feather name="menu" size={24} color="#000" />
//                     </TouchableOpacity>
//                 </View>
//             </View>

//             <ScrollView
//                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//                 showsVerticalScrollIndicator={false}
//             >
//                 {/* Profile Info Section */}
//                 <View style={styles.profileSection}>
//                     <View style={styles.profileTop}>
//                         {/* Avatar with gradient border */}
//                         <View style={styles.avatarContainer}>
//                             <LinearGradient
//                                 colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
//                                 style={styles.avatarGradient}
//                                 start={{ x: 0, y: 0 }}
//                                 end={{ x: 1, y: 1 }}
//                             >
//                                 <View style={styles.avatarInner}>
//                                     <Text style={styles.avatarText}>
//                                         {user?.username.charAt(0).toUpperCase()}
//                                     </Text>
//                                 </View>
//                             </LinearGradient>
//                         </View>

//                         {/* Stats */}
//                         <View style={styles.statsContainer}>
//                             <TouchableOpacity style={styles.statItem}>
//                                 <Text style={styles.statNumber}>{formatNumber(stats.posts)}</Text>
//                                 <Text style={styles.statLabel}>Posts</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity style={styles.statItem}>
//                                 <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
//                                 <Text style={styles.statLabel}>Followers</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity style={styles.statItem}>
//                                 <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
//                                 <Text style={styles.statLabel}>Following</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>

//                     {/* Name and Bio */}
//                     <View style={styles.bioSection}>
//                         <Text style={styles.displayName}>{user?.username}</Text>
//                         <Text style={styles.bioText}>Digital creator ✨</Text>
//                         <Text style={styles.bioText}>Building amazing things</Text>
//                         <TouchableOpacity>
//                             <Text style={styles.websiteLink}>linktr.ee/{user?.username}</Text>
//                         </TouchableOpacity>
//                     </View>

//                     {/* Action Buttons */}
//                     <View style={styles.actionButtons}>
//                         <TouchableOpacity style={styles.editButton}>
//                             <Text style={styles.editButtonText}>Edit profile</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.shareButton}>
//                             <Text style={styles.shareButtonText}>Share profile</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.addFriendButton}>
//                             <Ionicons name="person-add-outline" size={16} color="#000" />
//                         </TouchableOpacity>
//                     </View>

//                     {/* Story Highlights */}
//                     <ScrollView
//                         horizontal
//                         showsHorizontalScrollIndicator={false}
//                         style={styles.highlightsContainer}
//                     >
//                         <TouchableOpacity style={styles.highlightItem}>
//                             <View style={styles.highlightCircle}>
//                                 <Ionicons name="add" size={24} color="#000" />
//                             </View>
//                             <Text style={styles.highlightLabel}>New</Text>
//                         </TouchableOpacity>
//                         {['Travel', 'Food', 'Fitness', 'Work'].map((item, index) => (
//                             <TouchableOpacity key={index} style={styles.highlightItem}>
//                                 <View style={styles.highlightCircleFilled}>
//                                     <Text style={styles.highlightEmoji}>
//                                         {['✈️', '🍕', '💪', '💼'][index]}
//                                     </Text>
//                                 </View>
//                                 <Text style={styles.highlightLabel}>{item}</Text>
//                             </TouchableOpacity>
//                         ))}
//                     </ScrollView>
//                 </View>

//                 {/* Tab Bar */}
//                 <View style={styles.tabBar}>
//                     <TouchableOpacity
//                         style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
//                         onPress={() => setActiveTab('grid')}
//                     >
//                         <Ionicons
//                             name="grid-outline"
//                             size={24}
//                             color={activeTab === 'grid' ? '#000' : '#999'}
//                         />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                         style={[styles.tab, activeTab === 'reels' && styles.activeTab]}
//                         onPress={() => setActiveTab('reels')}
//                     >
//                         <Ionicons
//                             name="play-circle-outline"
//                             size={24}
//                             color={activeTab === 'reels' ? '#000' : '#999'}
//                         />
//                     </TouchableOpacity>
//                     <TouchableOpacity
//                         style={[styles.tab, activeTab === 'tagged' && styles.activeTab]}
//                         onPress={() => setActiveTab('tagged')}
//                     >
//                         <Ionicons
//                             name="person-outline"
//                             size={24}
//                             color={activeTab === 'tagged' ? '#000' : '#999'}
//                         />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Posts Grid or List */}
//                 {posts.length === 0 ? (
//                     <View style={styles.emptyContainer}>
//                         <View style={styles.emptyIcon}>
//                             <Ionicons name="camera-outline" size={48} color="#000" />
//                         </View>
//                         <Text style={styles.emptyTitle}>Share Photos</Text>
//                         <Text style={styles.emptySubtext}>
//                             When you share photos, they will appear on your profile.
//                         </Text>
//                         <TouchableOpacity onPress={() => router.push('/modal')}>
//                             <Text style={styles.emptyLink}>Share your first photo</Text>
//                         </TouchableOpacity>
//                     </View>
//                 ) : (
//                     <View style={styles.postsGrid}>
//                         {posts.map((post, index) => (
//                             <TouchableOpacity key={post.id} style={styles.gridItem}>
//                                 <View style={styles.gridItemContent}>
//                                     <Text style={styles.gridItemText} numberOfLines={3}>
//                                         {post.content}
//                                     </Text>
//                                 </View>
//                             </TouchableOpacity>
//                         ))}
//                     </View>
//                 )}
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         borderBottomWidth: 0.5,
//         borderBottomColor: '#dbdbdb',
//     },
//     usernameHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//     },
//     headerUsername: {
//         fontSize: 20,
//         fontWeight: '700',
//     },
//     headerRight: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     headerIcon: {
//         marginLeft: 20,
//     },
//     profileSection: {
//         paddingHorizontal: 16,
//     },
//     profileTop: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginTop: 16,
//     },
//     avatarContainer: {
//         marginRight: 28,
//     },
//     avatarGradient: {
//         width: 86,
//         height: 86,
//         borderRadius: 43,
//         padding: 3,
//     },
//     avatarInner: {
//         flex: 1,
//         backgroundColor: '#fff',
//         borderRadius: 40,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     avatarText: {
//         fontSize: 32,
//         fontWeight: '600',
//         color: '#000',
//     },
//     statsContainer: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//     },
//     statItem: {
//         alignItems: 'center',
//     },
//     statNumber: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#000',
//     },
//     statLabel: {
//         fontSize: 13,
//         color: '#000',
//         marginTop: 2,
//     },
//     bioSection: {
//         marginTop: 12,
//     },
//     displayName: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#000',
//     },
//     bioText: {
//         fontSize: 14,
//         color: '#000',
//         lineHeight: 20,
//     },
//     websiteLink: {
//         fontSize: 14,
//         color: '#00376b',
//         fontWeight: '500',
//         marginTop: 2,
//     },
//     actionButtons: {
//         flexDirection: 'row',
//         marginTop: 16,
//         gap: 8,
//     },
//     editButton: {
//         flex: 1,
//         backgroundColor: '#efefef',
//         paddingVertical: 8,
//         borderRadius: 8,
//         alignItems: 'center',
//     },
//     editButtonText: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#000',
//     },
//     shareButton: {
//         flex: 1,
//         backgroundColor: '#efefef',
//         paddingVertical: 8,
//         borderRadius: 8,
//         alignItems: 'center',
//     },
//     shareButtonText: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#000',
//     },
//     addFriendButton: {
//         backgroundColor: '#efefef',
//         paddingHorizontal: 12,
//         paddingVertical: 8,
//         borderRadius: 8,
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     highlightsContainer: {
//         marginTop: 16,
//         marginBottom: 8,
//     },
//     highlightItem: {
//         alignItems: 'center',
//         marginRight: 16,
//     },
//     highlightCircle: {
//         width: 64,
//         height: 64,
//         borderRadius: 32,
//         borderWidth: 1,
//         borderColor: '#dbdbdb',
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: '#fff',
//     },
//     highlightCircleFilled: {
//         width: 64,
//         height: 64,
//         borderRadius: 32,
//         backgroundColor: '#efefef',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     highlightEmoji: {
//         fontSize: 24,
//     },
//     highlightLabel: {
//         fontSize: 12,
//         marginTop: 4,
//         color: '#000',
//     },
//     tabBar: {
//         flexDirection: 'row',
//         borderTopWidth: 0.5,
//         borderTopColor: '#dbdbdb',
//     },
//     tab: {
//         flex: 1,
//         alignItems: 'center',
//         paddingVertical: 10,
//         borderBottomWidth: 1,
//         borderBottomColor: 'transparent',
//     },
//     activeTab: {
//         borderBottomColor: '#000',
//     },
//     emptyContainer: {
//         alignItems: 'center',
//         paddingVertical: 60,
//         paddingHorizontal: 40,
//     },
//     emptyIcon: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         borderWidth: 2,
//         borderColor: '#000',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     emptyTitle: {
//         fontSize: 24,
//         fontWeight: '700',
//         color: '#000',
//         marginBottom: 8,
//     },
//     emptySubtext: {
//         fontSize: 14,
//         color: '#999',
//         textAlign: 'center',
//         marginBottom: 16,
//     },
//     emptyLink: {
//         fontSize: 14,
//         color: '#0095f6',
//         fontWeight: '600',
//     },
//     postsGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//     },
//     gridItem: {
//         width: width / 3,
//         height: width / 3,
//         borderWidth: 0.5,
//         borderColor: '#fff',
//     },
//     gridItemContent: {
//         flex: 1,
//         backgroundColor: '#f0f0f0',
//         padding: 8,
//         justifyContent: 'center',
//     },
//     gridItemText: {
//         fontSize: 12,
//         color: '#333',
//     },
// });

// // DESIGN 2 ----------------------------------------------------------------------

// import { API_URL } from '@/config/api';
// import { useAuth } from '@/contexts/AuthContext';
// import { Post } from '@/types/types';
// import { Feather, Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Href, router, useFocusEffect } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import {
//     Alert,
//     Dimensions,
//     RefreshControl,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');

// export default function ProfileScreen() {
//     const { user, token, logout } = useAuth();
//     const [posts, setPosts] = useState<Post[]>([]);
//     const [refreshing, setRefreshing] = useState(false);
//     const [activeTab, setActiveTab] = useState('posts');
//     const [stats, setStats] = useState({
//         posts: 0,
//         followers: 0,
//         following: 0,
//     });

//     const fetchProfile = async () => {
//         try {
//             const [postsRes, statsRes] = await Promise.all([
//                 fetch(`${API_URL}/users/${user!.id}/posts`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 }),
//                 fetch(`${API_URL}/users/${user!.id}/stats`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 }),
//             ]);

//             if (postsRes.ok) {
//                 const postsData = await postsRes.json();
//                 setPosts(postsData);
//             }

//             if (statsRes.ok) {
//                 const statsData = await statsRes.json();
//                 setStats(statsData);
//             }
//         } catch (error) {
//             console.error('Profile error:', error);
//         } finally {
//             setRefreshing(false);
//         }
//     };

//     useFocusEffect(
//         useCallback(() => {
//             fetchProfile();
//         }, [])
//     );

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchProfile();
//     }, []);

//     const handleLike = async (postId: string) => {
//         try {
//             const response = await fetch(`${API_URL}/posts/${postId}/like`, {
//                 method: 'POST',
//                 headers: { 'Authorization': `Bearer ${token}` },
//             });

//             if (response.ok) {
//                 setPosts(posts.map(post => {
//                     if (post.id === postId) {
//                         const isLiked = post.likes.includes(user!.id);
//                         return {
//                             ...post,
//                             likes: isLiked
//                                 ? post.likes.filter(id => id !== user!.id)
//                                 : [...post.likes, user!.id],
//                         };
//                     }
//                     return post;
//                 }));
//             }
//         } catch (error) {
//             console.error('Like error:', error);
//         }
//     };

//     const handleDeletePost = async (postId: string) => {
//         Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
//             { text: 'Cancel', style: 'cancel' },
//             {
//                 text: 'Delete',
//                 style: 'destructive',
//                 onPress: async () => {
//                     try {
//                         const response = await fetch(`${API_URL}/posts/${postId}`, {
//                             method: 'DELETE',
//                             headers: { 'Authorization': `Bearer ${token}` },
//                         });

//                         if (response.ok) {
//                             setPosts(posts.filter(post => post.id !== postId));
//                             setStats({ ...stats, posts: stats.posts - 1 });
//                         }
//                     } catch (error) {
//                         console.error('Delete error:', error);
//                         Alert.alert('Error', 'Failed to delete post');
//                     }
//                 },
//             },
//         ]);
//     };

//     const handleLogout = () => {
//         Alert.alert('Logout', 'Are you sure you want to logout?', [
//             { text: 'Cancel', style: 'cancel' },
//             {
//                 text: 'Logout',
//                 style: 'destructive',
//                 onPress: () => {
//                     logout();
//                     router.replace('/(auth)/login' as Href);
//                 },
//             },
//         ]);
//     };

//     const formatNumber = (num: number) => {
//         if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
//         if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
//         return num.toString();
//     };

//     return (
//         <View style={styles.container}>
//             <SafeAreaView style={styles.safeArea}>
//                 {/* Header */}
//                 <View style={styles.header}>
//                     <TouchableOpacity>
//                         <Ionicons name="arrow-back" size={24} color="#fff" />
//                     </TouchableOpacity>
//                     <Text style={styles.headerTitle}>Profile</Text>
//                     <TouchableOpacity onPress={handleLogout}>
//                         <Feather name="settings" size={24} color="#fff" />
//                     </TouchableOpacity>
//                 </View>

//                 <ScrollView
//                     refreshControl={
//                         <RefreshControl
//                             refreshing={refreshing}
//                             onRefresh={onRefresh}
//                             tintColor="#fff"
//                         />
//                     }
//                     showsVerticalScrollIndicator={false}
//                 >
//                     {/* Profile Hero Section */}
//                     <View style={styles.heroSection}>
//                         {/* Avatar with glow effect */}
//                         <View style={styles.avatarWrapper}>
//                             <View style={styles.avatarGlow} />
//                             <LinearGradient
//                                 colors={['#667eea', '#764ba2']}
//                                 style={styles.avatarGradient}
//                                 start={{ x: 0, y: 0 }}
//                                 end={{ x: 1, y: 1 }}
//                             >
//                                 <Text style={styles.avatarText}>
//                                     {user?.username.charAt(0).toUpperCase()}
//                                 </Text>
//                             </LinearGradient>
//                             <View style={styles.onlineIndicator} />
//                         </View>

//                         <Text style={styles.displayName}>{user?.username}</Text>
//                         <Text style={styles.handle}>@{user?.username}</Text>

//                         {/* Bio */}
//                         <Text style={styles.bio}>
//                             ✨ Creating digital experiences{'\n'}
//                             🚀 Building the future{'\n'}
//                             📍 San Francisco, CA
//                         </Text>

//                         {/* Action Buttons */}
//                         <View style={styles.actionButtons}>
//                             <TouchableOpacity style={styles.followButton}>
//                                 <LinearGradient
//                                     colors={['#667eea', '#764ba2']}
//                                     style={styles.followButtonGradient}
//                                     start={{ x: 0, y: 0 }}
//                                     end={{ x: 1, y: 0 }}
//                                 >
//                                     <Text style={styles.followButtonText}>Edit Profile</Text>
//                                 </LinearGradient>
//                             </TouchableOpacity>
//                             <TouchableOpacity style={styles.messageButton}>
//                                 <Ionicons name="mail-outline" size={20} color="#fff" />
//                             </TouchableOpacity>
//                             <TouchableOpacity style={styles.messageButton}>
//                                 <Ionicons name="notifications-outline" size={20} color="#fff" />
//                             </TouchableOpacity>
//                         </View>
//                     </View>

//                     {/* Stats Cards */}
//                     <View style={styles.statsSection}>
//                         <TouchableOpacity style={styles.statCard}>
//                             <LinearGradient
//                                 colors={['#1a1a2e', '#16213e']}
//                                 style={styles.statCardGradient}
//                             >
//                                 <Ionicons name="grid-outline" size={24} color="#667eea" />
//                                 <Text style={styles.statNumber}>{formatNumber(stats.posts)}</Text>
//                                 <Text style={styles.statLabel}>Posts</Text>
//                             </LinearGradient>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.statCard}>
//                             <LinearGradient
//                                 colors={['#1a1a2e', '#16213e']}
//                                 style={styles.statCardGradient}
//                             >
//                                 <Ionicons name="people-outline" size={24} color="#764ba2" />
//                                 <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
//                                 <Text style={styles.statLabel}>Followers</Text>
//                             </LinearGradient>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.statCard}>
//                             <LinearGradient
//                                 colors={['#1a1a2e', '#16213e']}
//                                 style={styles.statCardGradient}
//                             >
//                                 <Ionicons name="heart-outline" size={24} color="#f093fb" />
//                                 <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
//                                 <Text style={styles.statLabel}>Following</Text>
//                             </LinearGradient>
//                         </TouchableOpacity>
//                     </View>

//                     {/* Tab Section */}
//                     <View style={styles.tabSection}>
//                         <View style={styles.tabBar}>
//                             {[
//                                 { key: 'posts', icon: 'grid-outline', label: 'Posts' },
//                                 { key: 'saved', icon: 'bookmark-outline', label: 'Saved' },
//                                 { key: 'liked', icon: 'heart-outline', label: 'Liked' },
//                             ].map((tab) => (
//                                 <TouchableOpacity
//                                     key={tab.key}
//                                     style={[styles.tab, activeTab === tab.key && styles.activeTab]}
//                                     onPress={() => setActiveTab(tab.key)}
//                                 >
//                                     <Ionicons
//                                         name={tab.icon as any}
//                                         size={20}
//                                         color={activeTab === tab.key ? '#fff' : '#666'}
//                                     />
//                                     <Text style={[
//                                         styles.tabLabel,
//                                         activeTab === tab.key && styles.activeTabLabel
//                                     ]}>
//                                         {tab.label}
//                                     </Text>
//                                 </TouchableOpacity>
//                             ))}
//                         </View>

//                         {/* Posts */}
//                         {posts.length === 0 ? (
//                             <View style={styles.emptyContainer}>
//                                 <View style={styles.emptyIconContainer}>
//                                     <Ionicons name="camera-outline" size={48} color="#667eea" />
//                                 </View>
//                                 <Text style={styles.emptyTitle}>No Posts Yet</Text>
//                                 <Text style={styles.emptySubtext}>
//                                     Share your first moment with the world
//                                 </Text>
//                             </View>
//                         ) : (
//                             <View style={styles.postsGrid}>
//                                 {posts.map((post) => (
//                                     <TouchableOpacity key={post.id} style={styles.gridItem}>
//                                         <LinearGradient
//                                             colors={['#1a1a2e', '#16213e']}
//                                             style={styles.gridItemContent}
//                                         >
//                                             <Text style={styles.gridItemText} numberOfLines={4}>
//                                                 {post.content}
//                                             </Text>
//                                             <View style={styles.gridItemFooter}>
//                                                 <Ionicons name="heart" size={12} color="#f093fb" />
//                                                 <Text style={styles.gridItemLikes}>
//                                                     {post.likes.length}
//                                                 </Text>
//                                             </View>
//                                         </LinearGradient>
//                                     </TouchableOpacity>
//                                 ))}
//                             </View>
//                         )}
//                     </View>
//                 </ScrollView>

//                 {/* Floating Action Button */}
//                 <TouchableOpacity
//                     style={styles.fab}
//                     onPress={() => router.push('/modal')}
//                 >
//                     <LinearGradient
//                         colors={['#667eea', '#764ba2']}
//                         style={styles.fabGradient}
//                     >
//                         <Ionicons name="add" size={28} color="#fff" />
//                     </LinearGradient>
//                 </TouchableOpacity>
//             </SafeAreaView>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#0a0a0f',
//     },
//     safeArea: {
//         flex: 1,
//     },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 20,
//         paddingVertical: 16,
//     },
//     headerTitle: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#fff',
//     },
//     heroSection: {
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingTop: 20,
//         paddingBottom: 30,
//     },
//     avatarWrapper: {
//         position: 'relative',
//         marginBottom: 16,
//     },
//     avatarGlow: {
//         position: 'absolute',
//         width: 120,
//         height: 120,
//         borderRadius: 60,
//         backgroundColor: '#667eea',
//         opacity: 0.3,
//         top: -10,
//         left: -10,
//     },
//     avatarGradient: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     avatarText: {
//         fontSize: 40,
//         fontWeight: '700',
//         color: '#fff',
//     },
//     onlineIndicator: {
//         position: 'absolute',
//         bottom: 5,
//         right: 5,
//         width: 20,
//         height: 20,
//         borderRadius: 10,
//         backgroundColor: '#4ade80',
//         borderWidth: 3,
//         borderColor: '#0a0a0f',
//     },
//     displayName: {
//         fontSize: 24,
//         fontWeight: '700',
//         color: '#fff',
//         marginBottom: 4,
//     },
//     handle: {
//         fontSize: 14,
//         color: '#666',
//         marginBottom: 16,
//     },
//     bio: {
//         fontSize: 14,
//         color: '#999',
//         textAlign: 'center',
//         lineHeight: 22,
//         marginBottom: 20,
//     },
//     actionButtons: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//     },
//     followButton: {
//         borderRadius: 25,
//         overflow: 'hidden',
//     },
//     followButtonGradient: {
//         paddingVertical: 12,
//         paddingHorizontal: 32,
//     },
//     followButtonText: {
//         color: '#fff',
//         fontSize: 14,
//         fontWeight: '600',
//     },
//     messageButton: {
//         width: 44,
//         height: 44,
//         borderRadius: 22,
//         backgroundColor: '#1a1a2e',
//         justifyContent: 'center',
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#333',
//     },
//     statsSection: {
//         flexDirection: 'row',
//         paddingHorizontal: 20,
//         gap: 12,
//         marginBottom: 24,
//     },
//     statCard: {
//         flex: 1,
//         borderRadius: 16,
//         overflow: 'hidden',
//     },
//     statCardGradient: {
//         padding: 16,
//         alignItems: 'center',
//         borderWidth: 1,
//         borderColor: '#222',
//         borderRadius: 16,
//     },
//     statNumber: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#fff',
//         marginTop: 8,
//     },
//     statLabel: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 4,
//     },
//     tabSection: {
//         flex: 1,
//         backgroundColor: '#0f0f14',
//         borderTopLeftRadius: 24,
//         borderTopRightRadius: 24,
//         paddingTop: 20,
//     },
//     tabBar: {
//         flexDirection: 'row',
//         paddingHorizontal: 20,
//         marginBottom: 20,
//     },
//     tab: {
//         flex: 1,
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: 12,
//         gap: 6,
//     },
//     activeTab: {
//         borderBottomWidth: 2,
//         borderBottomColor: '#667eea',
//     },
//     tabLabel: {
//         fontSize: 12,
//         color: '#666',
//         fontWeight: '500',
//     },
//     activeTabLabel: {
//         color: '#fff',
//     },
//     emptyContainer: {
//         alignItems: 'center',
//         paddingVertical: 60,
//         paddingHorizontal: 40,
//     },
//     emptyIconContainer: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: '#1a1a2e',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 16,
//     },
//     emptyTitle: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#fff',
//         marginBottom: 8,
//     },
//     emptySubtext: {
//         fontSize: 14,
//         color: '#666',
//         textAlign: 'center',
//     },
//     postsGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         paddingHorizontal: 16,
//         gap: 8,
//     },
//     gridItem: {
//         width: (width - 48) / 2,
//         borderRadius: 12,
//         overflow: 'hidden',
//     },
//     gridItemContent: {
//         padding: 16,
//         minHeight: 120,
//         justifyContent: 'space-between',
//     },
//     gridItemText: {
//         fontSize: 12,
//         color: '#ccc',
//         lineHeight: 18,
//     },
//     gridItemFooter: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 4,
//         marginTop: 8,
//     },
//     gridItemLikes: {
//         fontSize: 12,
//         color: '#666',
//     },
//     fab: {
//         position: 'absolute',
//         bottom: 24,
//         right: 24,
//         borderRadius: 28,
//         overflow: 'hidden',
//         shadowColor: '#667eea',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.5,
//         shadowRadius: 12,
//         elevation: 8,
//     },
//     fabGradient: {
//         width: 56,
//         height: 56,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
// });

// DESIGN 3 ----------------------------------------------------------------------

import { API_URL } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { Post } from '@/types/types';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Href, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
    const { user, token, logout } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        posts: 0,
        followers: 0,
        following: 0,
    });

    const fetchProfile = async () => {
        try {
            const [postsRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/users/${user!.id}/posts`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
                fetch(`${API_URL}/users/${user!.id}/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                }),
            ]);

            if (postsRes.ok) {
                const postsData = await postsRes.json();
                setPosts(postsData);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }
        } catch (error) {
            console.error('Profile error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchProfile();
    }, []);

    const handleLike = async (postId: string) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (response.ok) {
                setPosts(posts.map(post => {
                    if (post.id === postId) {
                        const isLiked = post.likes.includes(user!.id);
                        return {
                            ...post,
                            likes: isLiked
                                ? post.likes.filter(id => id !== user!.id)
                                : [...post.likes, user!.id],
                        };
                    }
                    return post;
                }));
            }
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const handleDeletePost = async (postId: string) => {
        Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const response = await fetch(`${API_URL}/posts/${postId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` },
                        });

                        if (response.ok) {
                            setPosts(posts.filter(post => post.id !== postId));
                            setStats({ ...stats, posts: stats.posts - 1 });
                        }
                    } catch (error) {
                        console.error('Delete error:', error);
                        Alert.alert('Error', 'Failed to delete post');
                    }
                },
            },
        ]);
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: () => {
                    logout();
                    router.replace('/(auth)/login' as Href);
                },
            },
        ]);
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2', '#f093fb']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton}>
                        <Ionicons name="qr-code-outline" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{user?.username}</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
                        <Feather name="log-out" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#fff"
                        />
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <BlurView intensity={20} style={styles.blurContainer}>
                            <View style={styles.profileCardInner}>
                                {/* Avatar */}
                                <View style={styles.avatarSection}>
                                    <LinearGradient
                                        colors={['#fff', '#f0f0f0']}
                                        style={styles.avatarOuter}
                                    >
                                        <LinearGradient
                                            colors={['#667eea', '#764ba2']}
                                            style={styles.avatarInner}
                                        >
                                            <Text style={styles.avatarText}>
                                                {user?.username.charAt(0).toUpperCase()}
                                            </Text>
                                        </LinearGradient>
                                    </LinearGradient>

                                    <TouchableOpacity style={styles.editAvatarButton}>
                                        <Ionicons name="camera" size={14} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                {/* User Info */}
                                <View style={styles.userInfo}>
                                    <Text style={styles.displayName}>{user?.username}</Text>
                                    <Text style={styles.email}>{user?.email}</Text>

                                    <View style={styles.badgeContainer}>
                                        <View style={styles.badge}>
                                            <Ionicons name="checkmark-circle" size={12} color="#667eea" />
                                            <Text style={styles.badgeText}>Verified</Text>
                                        </View>
                                        <View style={styles.badge}>
                                            <Ionicons name="star" size={12} color="#f59e0b" />
                                            <Text style={styles.badgeText}>Creator</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Stats Row */}
                                <View style={styles.statsRow}>
                                    <TouchableOpacity style={styles.statItem}>
                                        <Text style={styles.statNumber}>{formatNumber(stats.posts)}</Text>
                                        <Text style={styles.statLabel}>Posts</Text>
                                    </TouchableOpacity>
                                    <View style={styles.statDivider} />
                                    <TouchableOpacity style={styles.statItem}>
                                        <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
                                        <Text style={styles.statLabel}>Followers</Text>
                                    </TouchableOpacity>
                                    <View style={styles.statDivider} />
                                    <TouchableOpacity style={styles.statItem}>
                                        <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
                                        <Text style={styles.statLabel}>Following</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Action Buttons */}
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.primaryButton}>
                                        <LinearGradient
                                            colors={['#667eea', '#764ba2']}
                                            style={styles.primaryButtonGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        >
                                            <Feather name="edit-2" size={16} color="#fff" />
                                            <Text style={styles.primaryButtonText}>Edit Profile</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.secondaryButton}>
                                        <Ionicons name="share-outline" size={20} color="#667eea" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.secondaryButton}>
                                        <Ionicons name="bookmark-outline" size={20} color="#667eea" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </BlurView>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.quickActions}>
                        {[
                            { icon: 'images-outline', label: 'Gallery', color: '#f093fb' },
                            { icon: 'analytics-outline', label: 'Insights', color: '#667eea' },
                            { icon: 'people-outline', label: 'Friends', color: '#4ade80' },
                            { icon: 'settings-outline', label: 'Settings', color: '#f59e0b' },
                        ].map((action, index) => (
                            <TouchableOpacity key={index} style={styles.quickActionItem}>
                                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                                    <Ionicons name={action.icon as any} size={22} color={action.color} />
                                </View>
                                <Text style={styles.quickActionLabel}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Posts Section */}
                    <View style={styles.postsSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recent Posts</Text>
                            <TouchableOpacity>
                                <Text style={styles.seeAllText}>See all</Text>
                            </TouchableOpacity>
                        </View>

                        {posts.length === 0 ? (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyIconCircle}>
                                    <Ionicons name="add" size={32} color="#667eea" />
                                </View>
                                <Text style={styles.emptyTitle}>Create Your First Post</Text>
                                <Text style={styles.emptySubtext}>
                                    Share your thoughts and connect with others
                                </Text>
                                <TouchableOpacity
                                    style={styles.createPostButton}
                                    onPress={() => router.push('/modal')}
                                >
                                    <LinearGradient
                                        colors={['#667eea', '#764ba2']}
                                        style={styles.createPostGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <Text style={styles.createPostText}>Create Post</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.postsList}>
                                {posts.map((post) => (
                                    <View key={post.id} style={styles.postCard}>
                                        <Text style={styles.postContent} numberOfLines={3}>
                                            {post.content}
                                        </Text>
                                        <View style={styles.postFooter}>
                                            <View style={styles.postStats}>
                                                <Ionicons name="heart" size={14} color="#f093fb" />
                                                <Text style={styles.postStatText}>{post.likes.length}</Text>
                                                <Ionicons name="chatbubble-outline" size={14} color="#666" style={{ marginLeft: 12 }} />
                                                <Text style={styles.postStatText}>0</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => handleDeletePost(post.id)}>
                                                <Ionicons name="ellipsis-horizontal" size={16} color="#999" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>

                {/* Floating Create Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => router.push('/modal')}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.fabGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Ionicons name="create-outline" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 280,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    profileCard: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    blurContainer: {
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    profileCardInner: {
        padding: 24,
        alignItems: 'center',
    },
    avatarSection: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 4,
    },
    avatarInner: {
        flex: 1,
        borderRadius: 46,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userInfo: {
        alignItems: 'center',
        marginBottom: 20,
    },
    displayName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#e0e0e0',
    },
    actionRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    primaryButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    secondaryButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActions: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 24,
        gap: 12,
    },
    quickActionItem: {
        flex: 1,
        alignItems: 'center',
    },
    quickActionIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickActionLabel: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
    },
    postsSection: {
        marginTop: 24,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    seeAllText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '500',
    },
    emptyCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    emptyIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#667eea10',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    createPostButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    createPostGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    createPostText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    postsList: {
        gap: 12,
    },
    postCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    postContent: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 12,
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    postStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postStatText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGradient: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

// END OF MODEL A ---------------------------------------------------------------------------------------------------------------------------------------


// import PostCard from '@/components/PostCard';
// import { API_URL } from '@/config/api';
// import { useAuth } from '@/contexts/AuthContext';
// import { Post } from '@/types/types';
// import { Href, router, useFocusEffect } from 'expo-router';
// import React, { useCallback, useState } from 'react';
// import {
//     Alert,
//     RefreshControl,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// export default function ProfileScreen() {
//     const { user, token, logout } = useAuth();
//     const [posts, setPosts] = useState<Post[]>([]);
//     const [refreshing, setRefreshing] = useState(false);
//     const [stats, setStats] = useState({
//         posts: 0,
//         followers: 0,
//         following: 0,
//     });

//     const fetchProfile = async () => {
//         try {
//             const [postsRes, statsRes] = await Promise.all([
//                 fetch(`${API_URL}/users/${user!.id}/posts`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 }),
//                 fetch(`${API_URL}/users/${user!.id}/stats`, {
//                     headers: { 'Authorization': `Bearer ${token}` },
//                 }),
//             ]);

//             if (postsRes.ok) {
//                 const postsData = await postsRes.json();
//                 setPosts(postsData);
//             }

//             if (statsRes.ok) {
//                 const statsData = await statsRes.json();
//                 setStats(statsData);
//             }
//         } catch (error) {
//             console.error('Profile error:', error);
//         } finally {
//             setRefreshing(false);
//         }
//     };

//     // Refetch when screen comes into focus (e.g., after creating a post)
//     useFocusEffect(
//         useCallback(() => {
//             fetchProfile();
//         }, [])
//     );

//     const onRefresh = useCallback(() => {
//         setRefreshing(true);
//         fetchProfile();
//     }, []);

//     const handleLike = async (postId: string) => {
//         try {
//             const response = await fetch(`${API_URL}/posts/${postId}/like`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                 },
//             });

//             if (response.ok) {
//                 setPosts(posts.map(post => {
//                     if (post.id === postId) {
//                         const isLiked = post.likes.includes(user!.id);
//                         return {
//                             ...post,
//                             likes: isLiked
//                                 ? post.likes.filter(id => id !== user!.id)
//                                 : [...post.likes, user!.id],
//                         };
//                     }
//                     return post;
//                 }));
//             }
//         } catch (error) {
//             console.error('Like error:', error);
//         }
//     };

//     const handleDeletePost = async (postId: string) => {
//         Alert.alert(
//             'Delete Post',
//             'Are you sure you want to delete this post?',
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                     text: 'Delete',
//                     style: 'destructive',
//                     onPress: async () => {
//                         try {
//                             const response = await fetch(`${API_URL}/posts/${postId}`, {
//                                 method: 'DELETE',
//                                 headers: {
//                                     'Authorization': `Bearer ${token}`,
//                                 },
//                             });

//                             if (response.ok) {
//                                 setPosts(posts.filter(post => post.id !== postId));
//                                 setStats({ ...stats, posts: stats.posts - 1 });
//                             }
//                         } catch (error) {
//                             console.error('Delete error:', error);
//                             Alert.alert('Error', 'Failed to delete post');
//                         }
//                     },
//                 },
//             ]
//         );
//     };

//     const handleLogout = () => {
//         Alert.alert(
//             'Logout',
//             'Are you sure you want to logout?',
//             [
//                 { text: 'Cancel', style: 'cancel' },
//                 {
//                     text: 'Logout',
//                     style: 'destructive',
//                     onPress: () => {
//                         logout();
//                         router.replace('/(auth)/login' as Href);
//                     },
//                 },
//             ]
//         );
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <ScrollView
//                 refreshControl={
//                     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//                 }
//             >
//                 <View style={styles.header}>
//                     <View style={styles.profileInfo}>
//                         <View style={styles.avatar}>
//                             <Text style={styles.avatarText}>
//                                 {user?.username.charAt(0).toUpperCase()}
//                             </Text>
//                         </View>
//                         <Text style={styles.username}>@{user?.username}</Text>
//                         <Text style={styles.email}>{user?.email}</Text>
//                     </View>

//                     <View style={styles.statsContainer}>
//                         <View style={styles.statItem}>
//                             <Text style={styles.statNumber}>{stats.posts}</Text>
//                             <Text style={styles.statLabel}>Posts</Text>
//                         </View>
//                         <View style={styles.statItem}>
//                             <Text style={styles.statNumber}>{stats.followers}</Text>
//                             <Text style={styles.statLabel}>Followers</Text>
//                         </View>
//                         <View style={styles.statItem}>
//                             <Text style={styles.statNumber}>{stats.following}</Text>
//                             <Text style={styles.statLabel}>Following</Text>
//                         </View>
//                     </View>

//                     <View style={styles.buttonContainer}>
//                         <TouchableOpacity
//                             style={styles.newPostButton}
//                             onPress={() => router.push('/modal')}
//                         >
//                             <Text style={styles.newPostButtonText}>New Post</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity
//                             style={styles.logoutButton}
//                             onPress={handleLogout}
//                         >
//                             <Text style={styles.logoutButtonText}>Logout</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>

//                 <View style={styles.postsSection}>
//                     <Text style={styles.sectionTitle}>My Posts</Text>
//                     {posts.length === 0 ? (
//                         <View style={styles.emptyContainer}>
//                             <Text style={styles.emptyText}>No posts yet</Text>
//                             <Text style={styles.emptySubtext}>
//                                 Tap "New Post" to create your first post
//                             </Text>
//                         </View>
//                     ) : (
//                         posts.map((post) => (
//                             <PostCard
//                                 key={post.id}
//                                 post={post}
//                                 onLike={handleLike}
//                                 onDelete={handleDeletePost}
//                                 currentUserId={user!.id}
//                                 showDelete={true}
//                             />
//                         ))
//                     )}
//                 </View>
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#ffffffff',
//     },
//     header: {
//         backgroundColor: '#fff',
//         padding: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#e0e0e0',
//     },
//     profileInfo: {
//         alignItems: 'center',
//         marginBottom: 20,
//     },
//     avatar: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         backgroundColor: '#007AFF',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 10,
//     },
//     avatarText: {
//         fontSize: 32,
//         color: '#fff',
//         fontWeight: 'bold',
//     },
//     username: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 5,
//     },
//     email: {
//         fontSize: 14,
//         color: '#666',
//     },
//     statsContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-around',
//         marginBottom: 20,
//         paddingVertical: 10,
//         borderTopWidth: 1,
//         borderTopColor: '#f0f0f0',
//     },
//     statItem: {
//         alignItems: 'center',
//     },
//     statNumber: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     statLabel: {
//         fontSize: 12,
//         color: '#666',
//         marginTop: 2,
//     },
//     buttonContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     newPostButton: {
//         flex: 1,
//         backgroundColor: '#007AFF',
//         paddingVertical: 10,
//         borderRadius: 5,
//         marginRight: 10,
//     },
//     newPostButtonText: {
//         color: '#fff',
//         textAlign: 'center',
//         fontWeight: '600',
//     },
//     logoutButton: {
//         flex: 1,
//         backgroundColor: '#ff3b30',
//         paddingVertical: 10,
//         borderRadius: 5,
//     },
//     logoutButtonText: {
//         color: '#fff',
//         textAlign: 'center',
//         fontWeight: '600',
//     },
//     postsSection: {
//         flex: 1,
//         paddingVertical: 10,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         paddingHorizontal: 20,
//         paddingVertical: 10,
//         color: '#333',
//     },
//     emptyContainer: {
//         alignItems: 'center',
//         paddingVertical: 50,
//     },
//     emptyText: {
//         fontSize: 16,
//         color: '#666',
//         marginBottom: 5,
//     },
//     emptySubtext: {
//         fontSize: 14,
//         color: '#999',
//     },
// });
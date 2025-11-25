
export interface BaseUser {
    id: string;
    email: string;
    username: string;
}

export interface User extends BaseUser {
    name?: string;
    bio?: string;
    link?: string;
    profilePictureUrl?: string;
    followers?: string[];
    following?: string[];
    createdAt?: string;
}

export interface Post {
    id: string;
    userId: string;
    username: string;
    content: string;
    imageUrl?: string;
    likes: string[];
    comments: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    username: string;
    content: string;
    createdAt: string;
}

export interface ProfileData {
    name?: string;
    username: string;
    bio?: string;
    link?: string;
}
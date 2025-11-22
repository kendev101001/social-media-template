
export interface User {
    id: string;
    email: string;
    username: string;
    followers: string[];
    following: string[];
    createdAt: string;
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
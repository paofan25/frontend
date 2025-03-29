// 添加一个扩展的 Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        isAdmin: boolean;
      }
    }
  }
}

export interface User {
  _id: string;
  username: string;
  isAdmin: boolean;
  wallet?: number;
  avatar?: string;
  activeSkin?: string;
  purchasedSkins?: string[];
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface TokenPayload {
  userId: string;
  isAdmin: boolean;
  username: string;
  exp: number;
  iat: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'avatar' | 'skin' | 'accessory' | 'boost';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
} 
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';

interface TokenPayload {
  userId: string;
  isAdmin: boolean;
  exp: number;
  iat: number;
  username?: string;
  wallet?: number;
  avatar?: string;
  activeSkin?: string;
  purchasedSkins?: string[];
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 页面加载时检查token
    const checkAuth = () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // 解析token获取用户信息
      try {
        const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
        
        // 检查token是否过期
        const currentTime = Date.now() / 1000;
        if (payload.exp && payload.exp < currentTime) {
          // token已过期，清除
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setIsAdmin(false);
          setUser(null);
        } else {
          // token有效
          setIsAuthenticated(true);
          setIsAdmin(!!payload.isAdmin);
          setUser(payload);
          
          // 尝试从API获取完整的用户信息
          authAPI.getCurrentUser()
            .then(response => {
              const fullUserData = response.data;
              setUser(prevUser => {
                if (!prevUser) return null;
                return {
                  ...prevUser,
                  wallet: fullUserData.wallet || 0,
                  avatar: fullUserData.avatar || '/avatars/default.png',
                  activeSkin: fullUserData.activeSkin || 'default',
                  purchasedSkins: fullUserData.purchasedSkins || ['default']
                };
              });
            })
            .catch(error => {
              console.error('获取完整用户信息失败:', error);
            });
        }
      } catch (error) {
        console.error('Token解析失败:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
    
    // 监听storage事件，处理多标签页同步
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      const { token, user: userData } = response.data;
      
      // 保存token到localStorage
      localStorage.setItem('token', token);
      
      // 解析token获取用户信息
      const payload = JSON.parse(atob(token.split('.')[1])) as TokenPayload;
      
      // 合并API返回的完整用户数据
      const fullUserData: TokenPayload = {
        ...payload,
        wallet: userData.wallet || 0,
        avatar: userData.avatar || '/avatars/default.png',
        activeSkin: userData.activeSkin || 'default',
        purchasedSkins: userData.purchasedSkins || ['default']
      };
      
      setIsAuthenticated(true);
      setIsAdmin(!!payload.isAdmin);
      setUser(fullUserData);
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
  };

  return { isAuthenticated, isAdmin, user, login, logout, isLoading };
}; 
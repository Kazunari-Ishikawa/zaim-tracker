// src/hooks/useZaimAuth.js
import { useState, useEffect, useCallback } from 'react';
import { zaimApi } from '../utils/zaimApi';

export const useZaimAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // 初期化時に認証状態をチェック
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (zaimApi.isAuthenticated()) {
        try {
          setIsLoading(true);
          const user = await zaimApi.verifyUser();
          setUserInfo(user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth verification failed:', error);
          zaimApi.clearAuth();
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuthStatus();
  }, []);

  // 認証開始
  const startAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await zaimApi.startAuthFlow();
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }, []);

  // コールバック処理
  const handleCallback = useCallback(async (urlParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await zaimApi.handleCallback(urlParams);
      setUserInfo(result.userInfo);
      setIsAuthenticated(true);
      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ログアウト
  const logout = useCallback(() => {
    zaimApi.clearAuth();
    setIsAuthenticated(false);
    setUserInfo(null);
    setError(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    userInfo,
    startAuth,
    handleCallback,
    logout
  };
};
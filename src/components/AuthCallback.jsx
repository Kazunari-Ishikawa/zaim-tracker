// src/components/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useZaimAuth } from '../hooks/useZaimAuth';

const AuthCallback = () => {
  const { handleCallback, isLoading } = useZaimAuth();
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const result = await handleCallback(urlParams);
        
        setStatus('success');
        
        // 3秒後にメインページにリダイレクト
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        
      } catch (error) {
        console.error('Callback processing failed:', error);
        setStatus('error');
      }
    };

    processCallback();
  }, [handleCallback]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">認証処理中...</h2>
            <p className="text-purple-200">
              Zaimとの認証を完了しています。<br />
              しばらくお待ちください。
            </p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">認証完了！</h2>
            <p className="text-green-200">
              Zaimとの認証が正常に完了しました。<br />
              メインページにリダイレクトします...
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">認証エラー</h2>
            <p className="text-red-200 mb-4">
              認証に失敗しました。<br />
              再度お試しください。
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              メインページに戻る
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
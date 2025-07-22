// src/utils/zaimApi.js
import CryptoJS from 'crypto-js';

export class ZaimAPI {
  constructor() {
    this.consumerKey = import.meta.env.VITE_ZAIM_CONSUMER_KEY;
    this.consumerSecret = import.meta.env.VITE_ZAIM_CONSUMER_SECRET;
    this.callbackUrl = import.meta.env.VITE_ZAIM_CALLBACK_URL || 'http://localhost:5173/callback';

    // API エンドポイント
    this.baseUrl = 'https://api.zaim.net';
    this.endpoints = {
      requestToken: '/v2/auth/request',
      accessToken: '/v2/auth/access',
      authorize: 'https://auth.zaim.net/users/auth',
      addMoney: '/v2/home/money',
      getCategories: '/v2/home/category',
      getAccounts: '/v2/home/account',
      getUser: '/v2/home/user/verify'
    };
  }

  // OAuth 1.0a署名生成
  generateSignature(method, url, params, tokenSecret = '') {
    // パラメータをソート
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    // 署名ベース文字列を作成
    const signatureBase = [
      method.toUpperCase(),
      encodeURIComponent(url),
      encodeURIComponent(sortedParams)
    ].join('&');

    // 署名キーを作成
    const signingKey = `${encodeURIComponent(this.consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

    // HMAC-SHA1で署名
    const signature = CryptoJS.HmacSHA1(signatureBase, signingKey);
    return CryptoJS.enc.Base64.stringify(signature);
  }

  // OAuthヘッダーを生成
  generateOAuthHeader(method, url, additionalParams = {}, token = '', tokenSecret = '') {
    const oauthParams = {
      oauth_consumer_key: this.consumerKey,
      oauth_nonce: this.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: '1.0',
      ...additionalParams
    };

    if (token) {
      oauthParams.oauth_token = token;
    }

    // 署名を生成
    const signature = this.generateSignature(method, url, oauthParams, tokenSecret);
    oauthParams.oauth_signature = signature;

    // Authorizationヘッダーを作成
    const headerParams = Object.keys(oauthParams)
      .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
      .join(', ');

    return `OAuth ${headerParams}`;
  }

  // ランダムな文字列を生成（nonce用）
  generateNonce() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Step 1: リクエストトークンを取得
  async getRequestToken() {
    try {
      const url = `${this.baseUrl}${this.endpoints.requestToken}`;
      const additionalParams = {
        oauth_callback: this.callbackUrl
      };

      const authHeader = this.generateOAuthHeader('POST', url, additionalParams);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`Request token error: ${response.status}`);
      }

      const responseText = await response.text();
      const params = new URLSearchParams(responseText);
      
      const requestToken = params.get('oauth_token');
      const requestTokenSecret = params.get('oauth_token_secret');
      const callbackConfirmed = params.get('oauth_callback_confirmed');

      if (!requestToken || !requestTokenSecret || callbackConfirmed !== 'true') {
        throw new Error('Invalid request token response');
      }

      // セッションストレージに保存
      sessionStorage.setItem('zaim_request_token', requestToken);
      sessionStorage.setItem('zaim_request_token_secret', requestTokenSecret);

      return { requestToken, requestTokenSecret };
    } catch (error) {
      console.error('Request token error:', error);
      throw error;
    }
  }

  // Step 2: ユーザーを認証ページにリダイレクト
  redirectToAuthorize(requestToken) {
    const authorizeUrl = `${this.endpoints.authorize}?oauth_token=${requestToken}`;
    window.location.href = authorizeUrl;
  }

  // Step 3: アクセストークンを取得
  async getAccessToken(verifier) {
    try {
      const requestToken = sessionStorage.getItem('zaim_request_token');
      const requestTokenSecret = sessionStorage.getItem('zaim_request_token_secret');

      if (!requestToken || !requestTokenSecret) {
        throw new Error('Request token not found in session');
      }

      const url = `${this.baseUrl}${this.endpoints.accessToken}`;
      const additionalParams = {
        oauth_verifier: verifier
      };

      const authHeader = this.generateOAuthHeader(
        'POST', 
        url, 
        additionalParams, 
        requestToken, 
        requestTokenSecret
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!response.ok) {
        throw new Error(`Access token error: ${response.status}`);
      }

      const responseText = await response.text();
      const params = new URLSearchParams(responseText);
      
      const accessToken = params.get('oauth_token');
      const accessTokenSecret = params.get('oauth_token_secret');

      if (!accessToken || !accessTokenSecret) {
        throw new Error('Invalid access token response');
      }

      // アクセストークンを保存
      localStorage.setItem('zaim_access_token', accessToken);
      localStorage.setItem('zaim_access_token_secret', accessTokenSecret);

      // リクエストトークンをクリア
      sessionStorage.removeItem('zaim_request_token');
      sessionStorage.removeItem('zaim_request_token_secret');

      return { accessToken, accessTokenSecret };
    } catch (error) {
      console.error('Access token error:', error);
      throw error;
    }
  }

  // 認証状態を確認
  isAuthenticated() {
    return !!(localStorage.getItem('zaim_access_token') && localStorage.getItem('zaim_access_token_secret'));
  }

  // 認証情報をクリア
  clearAuth() {
    localStorage.removeItem('zaim_access_token');
    localStorage.removeItem('zaim_access_token_secret');
    sessionStorage.removeItem('zaim_request_token');
    sessionStorage.removeItem('zaim_request_token_secret');
  }

  // 認証されたAPIリクエストを実行
  async authenticatedRequest(method, endpoint, data = {}) {
    const accessToken = localStorage.getItem('zaim_access_token');
    const accessTokenSecret = localStorage.getItem('zaim_access_token_secret');

    if (!accessToken || !accessTokenSecret) {
      throw new Error('Not authenticated');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const authHeader = this.generateOAuthHeader(
      method, 
      url, 
      {}, 
      accessToken, 
      accessTokenSecret
    );

    const options = {
      method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    if (method !== 'GET' && Object.keys(data).length > 0) {
      options.body = new URLSearchParams(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuth();
        throw new Error('Authentication expired');
      }
      throw new Error(`API Error: ${response.status}`);
    }

    return await response.json();
  }

  // ユーザー情報を取得（認証テスト用）
  async verifyUser() {
    return await this.authenticatedRequest('GET', this.endpoints.getUser);
  }

  // カテゴリ一覧を取得
  async getCategories() {
    return await this.authenticatedRequest('GET', this.endpoints.getCategories);
  }

  // 口座一覧を取得
  async getAccounts() {
    return await this.authenticatedRequest('GET', this.endpoints.getAccounts);
  }

  // 支出を登録
  async addExpense(expenseData) {
    const {
      category_id,
      genre_id,
      amount,
      date,
      comment = '',
      name = '',
      account_id
    } = expenseData;

    const data = {
      category_id: category_id.toString(),
      genre_id: genre_id.toString(),
      amount: amount.toString(),
      date: date, // YYYY-MM-DD形式
      comment,
      name
    };

    if (account_id) {
      data.account_id = account_id.toString();
    }

    return await this.authenticatedRequest('POST', this.endpoints.addMoney, data);
  }

  // 収入を登録
  async addIncome(incomeData) {
    const {
      category_id,
      genre_id,
      amount,
      date,
      comment = '',
      name = '',
      account_id
    } = incomeData;

    const data = {
      category_id: category_id.toString(),
      genre_id: genre_id.toString(),
      amount: amount.toString(),
      date: date, // YYYY-MM-DD形式
      comment,
      name,
      mode: 'income' // 収入モード
    };

    if (account_id) {
      data.account_id = account_id.toString();
    }

    return await this.authenticatedRequest('POST', this.endpoints.addMoney, data);
  }

  // 完全な認証フローを開始
  async startAuthFlow() {
    try {
      const { requestToken } = await this.getRequestToken();
      this.redirectToAuthorize(requestToken);
    } catch (error) {
      console.error('Auth flow error:', error);
      throw error;
    }
  }

  // コールバック処理
  async handleCallback(urlParams) {
    const verifier = urlParams.get('oauth_verifier');
    const token = urlParams.get('oauth_token');

    if (!verifier || !token) {
      throw new Error('Invalid callback parameters');
    }

    try {
      const { accessToken, accessTokenSecret } = await this.getAccessToken(verifier);
      
      // 認証成功後、ユーザー情報を取得して確認
      const userInfo = await this.verifyUser();
      
      return {
        accessToken,
        accessTokenSecret,
        userInfo
      };
    } catch (error) {
      console.error('Callback handling error:', error);
      throw error;
    }
  }
}

// シングルトンインスタンスをエクスポート
export const zaimApi = new ZaimAPI();
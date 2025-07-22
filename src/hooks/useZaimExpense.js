// src/hooks/useZaimExpense.js
import { useState, useEffect, useCallback } from 'react';
import { zaimApi } from '../utils/zaimApi';

export const useZaimExpense = () => {
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // カテゴリと口座情報を取得
  useEffect(() => {
    const fetchData = async () => {
      if (!zaimApi.isAuthenticated()) return;

      try {
        setIsLoading(true);
        const [categoriesData, accountsData] = await Promise.all([
          zaimApi.getCategories(),
          zaimApi.getAccounts()
        ]);
        
        setCategories(categoriesData.categories || []);
        setAccounts(accountsData.accounts || []);
      } catch (error) {
        console.error('Failed to fetch Zaim data:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [zaimApi.isAuthenticated()]);

  // カテゴリ名からカテゴリIDを取得
  const findCategoryByName = useCallback((categoryName) => {
    return categories.find(cat => 
      cat.name === categoryName || 
      cat.name.includes(categoryName) ||
      categoryName.includes(cat.name)
    );
  }, [categories]);

  // ジャンル名からジャンルIDを取得
  const findGenreByName = useCallback((genreName, categoryId = null) => {
    for (const category of categories) {
      if (categoryId && category.id !== categoryId) continue;
      
      const genre = category.genres?.find(g => 
        g.name === genreName || 
        g.name.includes(genreName) ||
        genreName.includes(g.name)
      );
      
      if (genre) return { genre, category };
    }
    return null;
  }, [categories]);

  // 支出を登録
  const addExpense = useCallback(async (expenseData) => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        name,
        amount,
        categoryName,
        genreName,
        comment = '',
        accountId = null,
        date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
      } = expenseData;

      // カテゴリとジャンルを検索
      let category_id, genre_id;

      if (categoryName && genreName) {
        const category = findCategoryByName(categoryName);
        if (!category) {
          throw new Error(`カテゴリ "${categoryName}" が見つかりません`);
        }

        const genreResult = findGenreByName(genreName, category.id);
        if (!genreResult) {
          throw new Error(`ジャンル "${genreName}" が見つかりません`);
        }

        category_id = category.id;
        genre_id = genreResult.genre.id;
      } else {
        // デフォルトのカテゴリ・ジャンルを使用
        const defaultCategory = categories.find(cat => cat.mode === 'payment');
        if (!defaultCategory || !defaultCategory.genres?.length) {
          throw new Error('利用可能なカテゴリが見つかりません');
        }

        category_id = defaultCategory.id;
        genre_id = defaultCategory.genres[0].id;
      }

      const result = await zaimApi.addExpense({
        category_id,
        genre_id,
        amount: Math.abs(amount), // 支出は正の値
        date,
        comment,
        name,
        account_id: accountId
      });

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [categories, findCategoryByName, findGenreByName]);

  // 収入を登録
  const addIncome = useCallback(async (incomeData) => {
    try {
      setIsLoading(true);
      setError(null);

      const {
        name,
        amount,
        categoryName,
        genreName,
        comment = '',
        accountId = null,
        date = new Date().toISOString().split('T')[0]
      } = incomeData;

      // 収入用のカテゴリを検索
      let category_id, genre_id;

      if (categoryName && genreName) {
        const category = findCategoryByName(categoryName);
        if (!category || category.mode !== 'income') {
          throw new Error(`収入カテゴリ "${categoryName}" が見つかりません`);
        }

        const genreResult = findGenreByName(genreName, category.id);
        if (!genreResult) {
          throw new Error(`ジャンル "${genreName}" が見つかりません`);
        }

        category_id = category.id;
        genre_id = genreResult.genre.id;
      } else {
        // デフォルトの収入カテゴリを使用
        const defaultCategory = categories.find(cat => cat.mode === 'income');
        if (!defaultCategory || !defaultCategory.genres?.length) {
          throw new Error('利用可能な収入カテゴリが見つかりません');
        }

        category_id = defaultCategory.id;
        genre_id = defaultCategory.genres[0].id;
      }

      const result = await zaimApi.addIncome({
        category_id,
        genre_id,
        amount: Math.abs(amount), // 収入は正の値
        date,
        comment,
        name,
        account_id: accountId
      });

      return result;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [categories, findCategoryByName, findGenreByName]);

  // 支出カテゴリのみを取得
  const getExpenseCategories = useCallback(() => {
    return categories.filter(cat => cat.mode === 'payment');
  }, [categories]);

  // 収入カテゴリのみを取得
  const getIncomeCategories = useCallback(() => {
    return categories.filter(cat => cat.mode === 'income');
  }, [categories]);

  return {
    categories,
    accounts,
    isLoading,
    error,
    addExpense,
    addIncome,
    findCategoryByName,
    findGenreByName,
    getExpenseCategories,
    getIncomeCategories
  };
};
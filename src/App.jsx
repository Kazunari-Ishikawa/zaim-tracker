import React, { useState, useEffect } from 'react';
import { Plus, Coffee, Car, Home, ShoppingCart, Utensils, Gamepad2, Settings, Trash2, Edit3, Save, X, Calendar, DollarSign } from 'lucide-react';

const ZaimExpenseTracker = () => {
  const [expenses, setExpenses] = useState([
    { id: 1, name: 'コーヒー', amount: 150, category: 'カフェ', icon: Coffee, color: 'bg-amber-500' },
    { id: 2, name: '電車代', amount: 280, category: '交通費', icon: Car, color: 'bg-blue-500' },
    { id: 3, name: '昼食', amount: 800, category: '食費', icon: Utensils, color: 'bg-green-500' },
    { id: 4, name: '光熱費', amount: 8000, category: '固定費', icon: Home, color: 'bg-purple-500' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '', category: '', icon: Coffee, color: 'bg-blue-500' });
  const [isConnected, setIsConnected] = useState(false);
  const [animation, setAnimation] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);

  const iconOptions = [
    { icon: Coffee, name: 'コーヒー', color: 'bg-amber-500' },
    { icon: Car, name: '交通', color: 'bg-blue-500' },
    { icon: Utensils, name: '食事', color: 'bg-green-500' },
    { icon: Home, name: '住居', color: 'bg-purple-500' },
    { icon: ShoppingCart, name: '買い物', color: 'bg-pink-500' },
    { icon: Gamepad2, name: '娯楽', color: 'bg-indigo-500' },
  ];

  const addExpense = () => {
    if (newExpense.name && newExpense.amount && newExpense.category) {
      const expense = {
        id: Date.now(),
        name: newExpense.name,
        amount: parseInt(newExpense.amount),
        category: newExpense.category,
        icon: newExpense.icon,
        color: newExpense.color
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ name: '', amount: '', category: '', icon: Coffee, color: 'bg-blue-500' });
      setShowAddForm(false);
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setNewExpense({
      name: expense.name,
      amount: expense.amount.toString(),
      category: expense.category,
      icon: expense.icon,
      color: expense.color
    });
  };

  const saveEdit = () => {
    setExpenses(expenses.map(expense =>
      expense.id === editingId
        ? { ...expense, name: newExpense.name, amount: parseInt(newExpense.amount), category: newExpense.category, icon: newExpense.icon, color: newExpense.color }
        : expense
    ));
    setEditingId(null);
    setNewExpense({ name: '', amount: '', category: '', icon: Coffee, color: 'bg-blue-500' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewExpense({ name: '', amount: '', category: '', icon: Coffee, color: 'bg-blue-500' });
  };

  const registerToZaim = async (expense) => {
    // ZaimのAPIを使用した支出登録のシミュレーション
    // 実際の実装では、OAuth認証とAPI呼び出しが必要
    setAnimation('pulse');

    // デモ用の処理
    setTimeout(() => {
      const transaction = {
        id: Date.now(),
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        timestamp: new Date().toLocaleString('ja-JP')
      };

      setRecentTransactions(prev => [transaction, ...prev.slice(0, 4)]);
      setAnimation('success');

      setTimeout(() => setAnimation(''), 1000);
    }, 1500);
  };

  const connectToZaim = () => {
    // OAuth認証のシミュレーション
    setAnimation('connecting');
    setTimeout(() => {
      setIsConnected(true);
      setAnimation('connected');
      setTimeout(() => setAnimation(''), 1000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Zaim Quick Pay</h1>
          <p className="text-purple-200">定型支出をワンタップで登録</p>
        </div>

        {/* 接続状態 */}
        <div className={`mb-6 p-4 rounded-2xl backdrop-blur-sm transition-all duration-300 ${isConnected
            ? 'bg-green-500/20 border border-green-400/30'
            : 'bg-red-500/20 border border-red-400/30'
          } ${animation === 'connecting' ? 'animate-pulse' : ''} ${animation === 'connected' ? 'animate-bounce' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''
                }`}></div>
              <span className="text-white font-medium">
                {isConnected ? 'Zaim に接続済み' : 'Zaim に未接続'}
              </span>
            </div>
            {!isConnected && (
              <button
                onClick={connectToZaim}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                接続する
              </button>
            )}
          </div>
        </div>

        {/* 最近の取引 */}
        {recentTransactions.length > 0 && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              最近の登録
            </h3>
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-2 bg-black/20 rounded-lg">
                  <div>
                    <div className="text-white text-sm font-medium">{transaction.name}</div>
                    <div className="text-purple-200 text-xs">{transaction.timestamp}</div>
                  </div>
                  <div className="text-green-400 font-semibold">¥{transaction.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 定型支出ボタン */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {expenses.map((expense) => {
            const IconComponent = expense.icon;
            return (
              <div key={expense.id} className="relative group">
                {editingId === expense.id ? (
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newExpense.name}
                        onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                        className="w-full p-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
                        placeholder="支出名"
                      />
                      <input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="w-full p-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
                        placeholder="金額"
                      />
                      <input
                        type="text"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="w-full p-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 text-sm"
                        placeholder="カテゴリ"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          保存
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          キャンセル
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => registerToZaim(expense)}
                    disabled={!isConnected}
                    className={`w-full p-6 rounded-2xl backdrop-blur-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${isConnected
                        ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                        : 'bg-gray-500/20 border border-gray-500/30 cursor-not-allowed'
                      } ${animation === 'pulse' ? 'animate-pulse' : ''} ${animation === 'success' ? 'animate-bounce bg-green-500/30' : ''}`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`w-12 h-12 ${expense.color} rounded-full flex items-center justify-center ${isConnected ? '' : 'opacity-50'
                        }`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-center">
                        <div className={`font-semibold ${isConnected ? 'text-white' : 'text-gray-400'}`}>
                          {expense.name}
                        </div>
                        <div className={`text-sm ${isConnected ? 'text-purple-200' : 'text-gray-500'}`}>
                          ¥{expense.amount}
                        </div>
                        <div className={`text-xs ${isConnected ? 'text-purple-300' : 'text-gray-500'}`}>
                          {expense.category}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* 編集・削除ボタン */}
                {editingId !== expense.id && (
                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(expense);
                        }}
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExpense(expense.id);
                        }}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 新規追加フォーム */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <h3 className="text-white font-semibold mb-4">新しい定型支出を追加</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newExpense.name}
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="支出名 (例: コーヒー)"
              />
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="金額 (例: 150)"
              />
              <input
                type="text"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                className="w-full p-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="カテゴリ (例: カフェ)"
              />

              <div className="grid grid-cols-3 gap-2">
                {iconOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setNewExpense({ ...newExpense, icon: option.icon, color: option.color })}
                    className={`p-3 rounded-lg transition-all ${newExpense.icon === option.icon
                        ? 'bg-white/20 border-2 border-white/40'
                        : 'bg-black/20 border border-white/20 hover:bg-white/10'
                      }`}
                  >
                    <div className={`w-8 h-8 ${option.color} rounded-full flex items-center justify-center mx-auto mb-1`}>
                      <option.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs text-white">{option.name}</div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={addExpense}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  追加
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewExpense({ name: '', amount: '', category: '', icon: Coffee, color: 'bg-blue-500' });
                  }}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 追加ボタン */}
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 active:scale-95 font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新しい定型支出を追加
        </button>

        {/* フッター */}
        <div className="mt-8 text-center text-purple-300 text-sm">
          <p>※ このアプリはZaim APIを使用して支出を登録します</p>
          <p>実際の利用には認証が必要です</p>
        </div>
      </div>
    </div>
  );
};

export default ZaimExpenseTracker;
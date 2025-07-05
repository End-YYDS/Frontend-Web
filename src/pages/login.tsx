import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

export const meta = { requiresAuth: false };

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // 已登录直接跳转
  if (!loading && user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('账号或密码错误');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-lg p-6'>
        <h2 className='text-2xl font-semibold text-center mb-6'>登录</h2>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>用户名</label>
            <input
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>密码</label>
            <input
              type='password'
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className='text-sm text-red-600 text-center'>{error}</p>}
          <button
            type='submit'
            className='w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition'
          >
            登录
          </button>
        </form>
      </div>
    </div>
  );
}

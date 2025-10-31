import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type PageMeta } from '../types';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from '@/auth';

(Login as any).meta = {
  requiresAuth: false,
  // allowedRoles: ['admin']
} satisfies PageMeta;

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Username: username, Password: password }),
      });
      if (!res.ok) throw new Error('帳號或密碼錯誤');
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-darkBlue p-4'>
      <div className='w-full max-w-md bg-white rounded-lg shadow-lg p-6'>
        <h2 className='text-2xl font-semibold text-center mb-1'>Login</h2>
        <p className='text-gray-600 text-sm text-center mb-6'>
          Log in with your username
        </p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-bold text-gray-700 mb-1'>使用者</label>
            <Input
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='block text-sm font-bold text-gray-700 mb-1'>密碼</label>
            <Input 
              type='password'
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className='text-sm text-red-600 text-center'>{error}</p>}
          <Button
            type='submit'
            className='w-full py-2 bg-[#7B86AA] hover:bg-blue-600 text-white font-extrabold rounded-md transition'
          >
            login
          </Button>
        </form>
      </div>
    </div>
  );
}
export default Login;

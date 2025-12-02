import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type PageComponent, type PageMeta } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login } from '@/api/openapi-client';
import { useAuth } from '@/hooks/useAuth';

const Login: PageComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { refresh } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      let { data } = await login({ body: { Username: username, Password: password } });
      if (data?.Type === 'Err') {
        setUsername('');
        setPassword('');
        throw new Error('帳號或密碼錯誤');
      }
      await refresh();
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setUsername('');
      setPassword('');
      setError('帳號或密碼錯誤');
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-[#7B86AA] via-[#A8AEBD] to-[#E6E6E6] p-4'>
      <div
        className='w-full
        max-w-md        
        sm:max-w-md
        md:max-w-lg
        lg:max-w-xl
        xl:max-w-2xl
        2xl:max-w-3xl 
        bg-white rounded-xl shadow-2xl
        p-8
        transition-all duration-300'
      >
        <h2 className='text-3xl font-bold text-center mb-2'>Login</h2>
        <p className='text-gray-600 text-sm text-center mb-6'>Log in with your username</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-bold text-gray-700 mb-1'>使用者</label>
            <Input
              className='w-full'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className='block text-sm font-bold text-gray-700 mb-1'>密碼</label>
            <Input
              type='password'
              className='w-full'
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
};
Login.meta = {
  requiresAuth: false,
} satisfies PageMeta;
export default Login;

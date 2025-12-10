import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, ChevronDown, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import SetupWizard from './SetupWizard';

const WIZARD_SEEN_KEY = 'setupWizardSeen';
const WIZARD_VERSION = 'v3'; // bump to force re-open if needed

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  dateGroup: string;
  read: boolean;
}

interface TopbarProps {
  onLogout: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: '伺服器 Apache 已啟動',
    message: 'Apache server 啟動成功。',
    time: '上午 09:11',
    dateGroup: '今天 - 2025年9月2日 星期二',
    read: false,
  },
  {
    id: 2,
    title: '資料庫連線成功',
    message: 'MySQL 連線測試通過。',
    time: '上午 09:05',
    dateGroup: '今天 - 2025年9月2日 星期二',
    read: false,
  },
  {
    id: 3,
    title: '伺服器 Nginx 已關閉',
    message: '手動關閉 Nginx。',
    time: '昨天下午 5:21',
    dateGroup: '昨天 - 2025年9月1日 星期一',
    read: false,
  },
  {
    id: 4,
    title: '用戶登入',
    message: '管理員 Derrick 成功登入。',
    time: '昨天凌晨 3:32',
    dateGroup: '昨天 - 2025年9月1日 星期一',
    read: false,
  },
  {
    id: 5,
    title: '備份完成',
    message: '每日備份已完成。',
    time: '2025/8/29 下午 10:00',
    dateGroup: '2025年8月29日 星期五',
    read: false,
  },
];

export default function Topbar({ onLogout }: TopbarProps) {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [, setShowUserMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const todayStr = '今天';
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (selectedNotification) {
        if (modalRef.current && !modalRef.current.contains(target)) {
          setSelectedNotification(null);
        }
        return;
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(target) &&
        userRef.current &&
        !userRef.current.contains(target)
      ) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedNotification]);

  const todaysNotifications = notifications.filter((n) => n.dateGroup.startsWith(todayStr));
  const unreadCount = todaysNotifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.dateGroup.startsWith(todayStr) ? { ...n, read: true } : n)),
    );
  };

  const getWizardKey = useCallback(() => {
    if (!user) return null;
    const uid = user.Uid ?? 'no-uid';
    const username = user.Username ?? 'no-username';
    return `${WIZARD_SEEN_KEY}:${uid}:${username}`;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;
    const key = getWizardKey();
    if (!key) {
      console.log('[SetupWizard] missing user identity, open wizard without persisting');
      setShowWizard(true);
      return;
    }
    try {
      const stored = window.localStorage.getItem(key);
      console.log('[SetupWizard] first-login check', { key, stored, expected: WIZARD_VERSION, user });
      if (stored !== WIZARD_VERSION) {
        console.log('[SetupWizard] auto-open wizard for first login or version bump', { key });
        setShowWizard(true);
        window.localStorage.setItem(key, WIZARD_VERSION);
      } else {
        console.log('[SetupWizard] skip auto-open (already seen for this user/version)', { key });
      }
    } catch (err) {
      console.warn('[SetupWizard] localStorage unavailable, opening wizard as fallback', err);
      setShowWizard(true);
    }
  }, [getWizardKey, user]);

  const closeWizard = () => {
    if (typeof window !== 'undefined') {
      const key = getWizardKey();
      if (key) {
        window.localStorage.setItem(key, WIZARD_VERSION);
        console.log('[SetupWizard] close wizard', { key });
      } else {
        console.log('[SetupWizard] close wizard (no key)');
      }
    }
    setShowWizard(false);
  };

  return (
    <header className='h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm relative'>
      {/* Search */}
      <div className='flex items-center w-80 rounded-lg px-3 py-0.5'>
        <Search className='w-4 h-4 text-gray-400 mr-2' />
        <Input
          type='text'
          placeholder='Search...'
          className='bg-transparent flex-1 text-sm outline-none placeholder-gray-400'
        />
      </div>

      {/* Icons + User */}
      <div className='flex items-center space-x-4 relative'>
        <Button
          className='gap-2 bg-[#A8AEBD] text-white hover:bg-[#8F95A9] shadow-sm'
          onClick={() => {
            if (typeof window !== 'undefined') {
              const key = getWizardKey();
              if (key) window.localStorage.setItem(key, WIZARD_VERSION);
            }
            setShowWizard(true);
            console.log('[SetupWizard] manual open from topbar button');
          }}
        >
          <Sparkles className='w-4 h-4' />
          設定精靈
        </Button>

        {/* Notification */}
        <div className='relative' ref={notifRef}>
          <Button
            className='bg-white relative text-gray-500 hover:bg-gray-100'
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <Bell className='w-5 h-5' />
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full'></span>
            )}
          </Button>

          {showNotifications && (
            <div className='absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50'>
              <div className='p-3 border-b text-sm font-semibold text-gray-700 flex justify-between items-center'>
                <span>Today's Notifications</span>
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    className='bg-white hover:bg-gray-100 text-xs text-purple-600 hover:underline'
                  >
                    Mark all as read
                  </Button>
                )}
              </div>

              <ul className='max-h-80 overflow-y-auto text-sm'>
                {todaysNotifications.length > 0 ? (
                  todaysNotifications.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        n.read ? 'text-gray-400' : 'text-gray-800 font-medium'
                      }`}
                      onClick={() => {
                        markAsRead(n.id);
                        setSelectedNotification(n);
                      }}
                    >
                      <div className='flex justify-between'>
                        <span>{n.title}</span>
                        <span className='text-xs text-gray-400'>{n.time}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className='px-4 py-2 text-gray-400 text-center'>No notifications today</li>
                )}
              </ul>

              <div
                className='p-2 border-t rounded-b-lg text-center text-xs text-purple-600 cursor-pointer hover:bg-gray-100'
                onClick={() => {
                  navigate('/notifications');
                  setShowNotifications(false);
                }}
              >
                View all notifications
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex items-center space-x-1 text-sm font-medium text-gray-800 hover:bg-transparent'
            >
              <span>{user?.Username}</span>
              <ChevronDown className='w-4 h-4 text-gray-500' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-40 p-2 mr-1 mt-1 rounded-lg shadow-lg border border-gray-200 '
            align='end'
          >
            {/* <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem> */}
            <DropdownMenuItem
              onClick={onLogout}
              className='justify-center text-red-600 font-semibold focus:bg-red-50 py-2'
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 詳細內容 Modal */}
      {selectedNotification && (
        <div className='fixed inset-0 flex items-center justify-center z-50'>
          <div className='absolute inset-0 bg-black/30'></div>
          <div
            ref={modalRef}
            className='bg-white rounded-lg shadow-lg max-w-md w-full p-4 relative z-10'
          >
            <Button
              className='absolute top-2 right-2 bg-white text-gray-400 hover:text-red-500 hover:bg-gray-100'
              onClick={() => setSelectedNotification(null)}
            >
              <X size={20} />
            </Button>
            <h3 className='font-semibold text-gray-800 mb-2'>{selectedNotification.title}</h3>
            <p className='text-sm text-gray-600'>{selectedNotification.message}</p>
            <p className='text-xs text-gray-400 mt-2'>{selectedNotification.time}</p>
          </div>
        </div>
      )}
      <SetupWizard isOpen={showWizard} onClose={closeWizard} />
    </header>
  );
}

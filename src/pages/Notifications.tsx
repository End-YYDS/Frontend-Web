import { useState } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  dateGroup: string;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    title: '伺服器 Apache 已啟動',
    message: 'Apache server 啟動成功。',
    time: '上午 09:11',
    dateGroup: '今天 - 2025年9月2日 星期二',
  },
  {
    id: 2,
    title: '資料庫連線成功',
    message: 'MySQL 連線測試通過。',
    time: '上午 09:05',
    dateGroup: '今天 - 2025年9月2日 星期二',
  },
  {
    id: 3,
    title: '伺服器 Nginx 已關閉',
    message: '手動關閉 Nginx。',
    time: '昨天下午 5:21',
    dateGroup: '昨天 - 2025年9月1日 星期一',
  },
  {
    id: 4,
    title: '用戶登入',
    message: '管理員 Derrick 成功登入。',
    time: '昨天凌晨 3:32',
    dateGroup: '昨天 - 2025年9月1日 星期一',
  },
  {
    id: 5,
    title: '備份完成',
    message: '每日備份已完成。',
    time: '2025/8/29 下午 10:00',
    dateGroup: '2025年8月29日 星期五',
  },
];
const NotificationsPage = () => {
  const [search, setSearch] = useState('');
  const [notifications] = useState<Notification[]>(mockNotifications);

  const filtered = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase()),
  );

  const grouped = filtered.reduce<Record<string, Notification[]>>((acc, n) => {
    if (!acc[n.dateGroup]) acc[n.dateGroup] = [];
    acc[n.dateGroup].push(n);
    return acc;
  }, {});

  return (
    <div className='p-6'>
      {/* 搜尋列 */}
      <div className='mb-4'>
        <input
          type='text'
          placeholder='搜尋通知'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full px-4 py-2 border rounded-full shadow-sm outline-none focus:ring-2 focus:ring-purple-500'
        />
      </div>

      {/* 通知列表 */}
      <div className='space-y-6'>
        {Object.keys(grouped).map((dateGroup) => (
          <div key={dateGroup} className='bg-white shadow rounded-lg p-4'>
            <h2 className='text-sm font-semibold text-gray-600 mb-3'>{dateGroup}</h2>
            <ul className='divide-y'>
              {grouped[dateGroup].map((n) => (
                <li
                  key={n.id}
                  className='flex items-center justify-between py-3 hover:bg-gray-50 rounded-md px-2'
                >
                  {/* 通知內容 */}
                  <div className='flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs text-gray-500'>{n.time}</span>
                      <span className='font-medium'>{n.title}</span>
                    </div>
                    <p className='text-sm text-gray-600'>{n.message}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NotificationsPage;

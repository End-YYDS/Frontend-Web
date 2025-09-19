import { useState, useEffect, useRef } from "react";
import { Search, Bell, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    title: "伺服器 Apache 已啟動",
    message: "Apache server 啟動成功。",
    time: "上午 09:11",
    dateGroup: "今天 - 2025年9月2日 星期二",
    read: false,
  },
  {
    id: 2,
    title: "資料庫連線成功",
    message: "MySQL 連線測試通過。",
    time: "上午 09:05",
    dateGroup: "今天 - 2025年9月2日 星期二",
    read: false,
  },
  {
    id: 3,
    title: "伺服器 Nginx 已關閉",
    message: "手動關閉 Nginx。",
    time: "昨天下午 5:21",
    dateGroup: "昨天 - 2025年9月1日 星期一",
    read: false,
  },
  {
    id: 4,
    title: "用戶登入",
    message: "管理員 Derrick 成功登入。",
    time: "昨天凌晨 3:32",
    dateGroup: "昨天 - 2025年9月1日 星期一",
    read: false,
  },
  {
    id: 5,
    title: "備份完成",
    message: "每日備份已完成。",
    time: "2025/8/29 下午 10:00",
    dateGroup: "2025年8月29日 星期五",
    read: false,
  },
];

export default function Topbar({ onLogout }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const navigate = useNavigate();

  const notifRef = useRef<HTMLDivElement | null>(null);
  const userRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const todayStr = "今天"; // 簡單用 dateGroup 判斷當日通知

  // 點擊空白處關閉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      // 如果詳細內容存在
      if (selectedNotification) {
        if (modalRef.current && !modalRef.current.contains(target)) {
          setSelectedNotification(null);
        }
        return;
      }

      // 沒有詳細內容時 → 點擊通知列表或使用者菜單外才關閉
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedNotification]);

  const todaysNotifications = notifications.filter((n) => n.dateGroup.startsWith(todayStr));
  const unreadCount = todaysNotifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (n.dateGroup.startsWith(todayStr) ? { ...n, read: true } : n))
    );
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm relative">
      {/* Search */}
      <div className="flex items-center w-64 bg-gray-50 rounded-lg px-3 py-1 border border-gray-200">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent flex-1 text-sm outline-none placeholder-gray-400"
        />
      </div>

      {/* Icons + User */}
      <div className="flex items-center space-x-6 relative">
        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative text-gray-500 hover:text-gray-700"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
              <div className="p-3 border-b text-sm font-semibold text-gray-700 flex justify-between items-center">
                <span>Today's Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <ul className="max-h-80 overflow-y-auto text-sm">
                {todaysNotifications.length > 0 ? (
                  todaysNotifications.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                        n.read ? "text-gray-400" : "text-gray-800 font-medium"
                      }`}
                      onClick={() => {
                        markAsRead(n.id);
                        setSelectedNotification(n);
                      }}
                    >
                      <div className="flex justify-between">
                        <span>{n.title}</span>
                        <span className="text-xs text-gray-400">{n.time}</span>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-2 text-gray-400 text-center">
                    No notifications today
                  </li>
                )}
              </ul>

              <div
                className="p-2 border-t rounded-b-lg text-center text-xs text-purple-600 cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  navigate("/notifications");
                  setShowNotifications(false);
                }}
              >
                View all notifications
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={userRef}>
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
          >
            <span className="text-sm font-medium text-gray-800">Derrick Lin</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
              <ul className="text-sm">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Profile</li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Settings</li>
                <li
                  className="px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                  onClick={onLogout}
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 詳細內容 Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30"></div>
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg max-w-md w-full p-4 relative z-10"
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              onClick={() => setSelectedNotification(null)}
            >
              <X size={20} />
            </button>
            <h3 className="font-semibold text-gray-800 mb-2">{selectedNotification.title}</h3>
            <p className="text-sm text-gray-600">{selectedNotification.message}</p>
            <p className="text-xs text-gray-400 mt-2">{selectedNotification.time}</p>
          </div>
        </div>
      )}
    </header>
  );
}

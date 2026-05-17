import React from 'react';
import { useAuthStore } from '../context/authStore';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Home, FileText, BarChart3, Settings, Zap, CheckSquare, Users as UsersIcon, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const { user, logout } = useAuthStore();
  const location = useLocation();

  // Apply dark mode to document
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const getNavItems = () => {
    if (!user) return [];

    const baseItems = [
      { label: 'Dashboard', href: '/dashboard', icon: Home, emoji: '📊' },
    ];

    if (user.role === 'EMPLOYEE') {
      return [
        ...baseItems,
        { label: 'My Goals', href: '/goals', icon: FileText, emoji: '📋' },
        { label: 'Check-ins', href: '/check-ins', icon: CheckSquare, emoji: '✔️' }
      ];
    } else if (user.role === 'MANAGER') {
      return [
        ...baseItems,
        { label: 'Team Goals', href: '/team-goals', icon: FileText, emoji: '👥' },
        { label: 'Approvals', href: '/approvals', icon: BarChart3, emoji: '✅' },
        { label: 'Check-ins', href: '/check-ins', icon: CheckSquare, emoji: '✔️' }
      ];
    } else if (user.role === 'ADMIN') {
      return [
        ...baseItems,
        { label: 'Cycles', href: '/cycles', icon: FileText, emoji: '📅' },
        { label: 'Users', href: '/users', icon: UsersIcon, emoji: '👤' },
        { label: 'Reports', href: '/reports', icon: BarChart3, emoji: '📈' },
        { label: 'Audit Logs', href: '/audit-logs', icon: Settings, emoji: '⚙️' }
      ];
    }
    return baseItems;
  };

  const navItems = getNavItems();
  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Mobile Menu Button with Dark Mode Toggle */}
      <div className="lg:hidden p-4 flex items-center justify-between bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <button
          className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        <button
          className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded transition-colors"
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block
        w-full lg:w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white
        fixed lg:relative h-screen overflow-y-auto
        z-40 shadow-2xl border-r border-slate-700
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-lg shadow-lg group-hover:shadow-blue-500/50 transition-shadow duration-300">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all">GoalQuest</h1>
              <p className="text-xs text-slate-400">Goal Tracking Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                  ${active 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700 hover:bg-opacity-50'
                  }
                `}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={20} className={active ? 'text-blue-200' : 'group-hover:text-blue-400 transition-colors'} />
                <span className="font-medium">{item.label}</span>
                {active && <div className="ml-auto w-2 h-2 bg-blue-200 rounded-full"></div>}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-gradient-to-t from-slate-900 to-slate-800 space-y-3">
          <div className="flex items-center gap-3 mb-4 p-3 bg-slate-700 bg-opacity-50 rounded-lg border border-slate-600">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full hidden lg:flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-all duration-200 font-medium"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/50 transform hover:scale-105 active:scale-95"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto animate-fadeIn">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;

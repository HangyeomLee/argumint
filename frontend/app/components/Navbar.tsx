'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';
import { useEffect, useState } from 'react';
import { Sword, Trophy, History, LayoutDashboard, Star } from 'lucide-react';
import NotificationBell from './NotificationBell';

/**
 * Renders the main navigation bar for the application.
 * It displays navigation links, authentication status, and user actions.
 * The navbar is hidden on authentication pages (login, register).
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for authentication token in local storage to determine user login status.
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [pathname]); // Re-check on route change.

  /**
   * Handles user logout by removing the token and redirecting to the homepage.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; // Force a full page reload to reset state.
  };

  const isAuthPage = pathname === '/login' || pathname === '/register';
  if (isAuthPage) return null;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-brand-100 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="bg-brand-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-brand-500/20">
              <Sword className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
              Argumint
            </span>
          </Link>

          {/* Primary navigation links for desktop */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" icon={<LayoutDashboard className="w-4 h-4" />} active={pathname === '/dashboard'}>
              Arena
            </NavLink>
            <NavLink href="/leaderboard" icon={<Trophy className="w-4 h-4" />} active={pathname === '/leaderboard'}>
              Rankings
            </NavLink>
            <NavLink href="/history" icon={<History className="w-4 h-4" />} active={pathname === '/history'}>
              History
            </NavLink>
            <NavLink href="/rules" icon={<Star className="w-4 h-4" />} active={pathname === '/rules'}>
              Rules
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <NotificationBell />
              <div className="h-6 w-px bg-zinc-100 dark:bg-zinc-800 mx-2 hidden sm:block"></div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[10px] h-9 px-4 rounded-xl">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-[10px] h-9 px-4 rounded-xl">Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="text-[10px] h-9 px-4 rounded-xl">Join Now</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

/**
 * A reusable link component for the navbar.
 * Displays an icon and text, with a distinct style for the active link.
 * @param {object} props - The component props.
 * @param {string} props.href - The URL to link to.
 * @param {React.ReactNode} props.children - The text content of the link.
 * @param {React.ReactNode} props.icon - The icon to display next to the text.
 * @param {boolean} [props.active] - Whether the link is currently active.
 */
function NavLink({ href, children, icon, active }: { href: string; children: React.ReactNode; icon: React.ReactNode; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
        active 
          ? 'bg-brand-50 text-brand-700' // Active state style
          : 'text-zinc-500 hover:text-brand-600 hover:bg-brand-50/50' // Default state style
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

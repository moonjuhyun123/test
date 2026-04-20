import { Outlet, useNavigate } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { authStorage } from '@/api/client';

export interface AppShellProps {
  userLoginId: string;
}

export function AppShell({ userLoginId }: AppShellProps) {
  const navigate = useNavigate();

  function handleSearch(query: string): void {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }
  function handleLogout(): void {
    authStorage.clear();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <AppHeader
        userLoginId={userLoginId}
        onSubmitSearch={handleSearch}
        onOpenNotifications={() => { /* /implement-front notification */ }}
        onLogout={handleLogout}
      />
      <div className="app-body">
        <AppSidebar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

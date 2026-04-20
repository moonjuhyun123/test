import { Avatar } from '@/components/Avatar';
import { DropdownMenu } from '@/components/DropdownMenu';
import { IconButton } from '@/components/IconButton';
import { SearchBar } from '@/components/SearchBar';

export interface AppHeaderProps {
  userLoginId: string;
  onSubmitSearch: (query: string) => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export function AppHeader({ userLoginId, onSubmitSearch, onOpenNotifications, onLogout }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header-left">
        <span className="app-logo">캘린더</span>
      </div>
      <div className="app-header-center">
        <SearchBar placeholder="일정·메모 통합 검색" onSubmit={onSubmitSearch} />
      </div>
      <div className="app-header-right">
        <IconButton tooltip="알림" icon={<span>🔔</span>} onClick={onOpenNotifications} />
        <DropdownMenu
          trigger={<Avatar name={userLoginId} size="sm" />}
          items={[{ key: 'logout', label: '로그아웃', onSelect: onLogout }]}
        />
      </div>
    </header>
  );
}

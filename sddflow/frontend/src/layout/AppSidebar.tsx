import { NavLink } from 'react-router-dom';

export function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <nav className="app-sidebar-nav">
        <NavLink to="/calendar" className="app-sidebar-link">캘린더</NavLink>
        <NavLink to="/memos" className="app-sidebar-link">메모</NavLink>
        <NavLink to="/tags" className="app-sidebar-link">태그 관리</NavLink>
      </nav>
    </aside>
  );
}

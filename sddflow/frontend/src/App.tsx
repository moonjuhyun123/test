import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/layout/AppShell';

// /implement-front 단계에서 각 도메인 페이지를 연결.
// 현재는 미인증 전역 가드 + 레이아웃 + 플레이스홀더.

function Placeholder({ name }: { name: string }) {
  return <div className="placeholder">{name} — /implement-front에서 구현</div>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Placeholder name="로그인" />} />
        <Route element={<AppShell userLoginId="demo" />}>
          <Route path="/calendar" element={<Placeholder name="캘린더 월 뷰" />} />
          <Route path="/calendar/week" element={<Placeholder name="캘린더 주 뷰" />} />
          <Route path="/schedules/new" element={<Placeholder name="일정 생성" />} />
          <Route path="/schedules/:id" element={<Placeholder name="일정 상세" />} />
          <Route path="/memos" element={<Placeholder name="메모 목록" />} />
          <Route path="/memos/new" element={<Placeholder name="메모 생성" />} />
          <Route path="/memos/:id" element={<Placeholder name="메모 상세" />} />
          <Route path="/tags" element={<Placeholder name="태그 관리" />} />
          <Route path="/search" element={<Placeholder name="검색 결과" />} />
          <Route path="/" element={<Navigate to="/calendar" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

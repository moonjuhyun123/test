# FRONT_SPEC: 공통 (로그인·메인 셸·검색)

## 포함 화면
| 번호 | 화면명 | 경로 |
|------|--------|------|
| S001 | 로그인 | /login |
| S002 | 메인 셸 (공통 레이아웃) | — (레이아웃, `<Outlet/>`) |
| S003 | 통합 검색 결과 | /search |

---

## S001: 로그인

### 화면 정보
- 경로: /login
- 접근 권한: 공개 (미인증 진입점)
- 소속 그룹: 공통

### 사용하는 공통 컴포넌트
Card, TextField, Button, ErrorState

### 레이아웃
- 중앙 카드(폭 360px)
- 로고 + 제목 → TextField(아이디) → TextField(비밀번호) → Button(primary, fullWidth) → 에러 문구 영역

### 표시 데이터
| 영역 | 데이터 항목 | 타입 | 출처 |
|------|-----------|------|------|
| 카드 | 앱 이름 | String | 정적 |
| ErrorState | 실패 메시지 | String | 서버 error.message |

### API 호출
| 시점 | API | Mock 파일 |
|------|-----|----------|
| 제출 | POST /api/auth/login | auth/login_success.json, auth/login_unauthorized.json, auth/login_server_error.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 버튼 spinner, 입력 disabled | Button(loading) |
| API 에러(401) | "아이디 또는 비밀번호가 일치하지 않습니다" | TextField.error + 카드 inline |
| API 에러(5xx) | "잠시 후 다시 시도해 주세요" + retry | ErrorState |
| 입력 검증 실패 | 빈값 시 "필수 입력" | TextField.error |
| 성공 | Toast("로그인되었습니다") + S101 이동 | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| 입력 | 로컬 state 갱신 |
| 엔터/로그인 버튼 | POST /api/auth/login → 성공 시 JWT 저장 + /calendar로 이동 |

---

## S002: 메인 셸 (공통 레이아웃)

### 화면 정보
- 경로: 없음 (모든 인증 라우트의 레이아웃)
- 접근 권한: isAuthenticated (전역 가드, 미인증 시 /login 리다이렉트)
- 소속 그룹: 공통

### 사용하는 공통 컴포넌트
Header slots, Sidebar, SearchBar, IconButton, Avatar, DropdownMenu, Toast root, Modal root, NotificationToast

### 레이아웃
- Header (z-header, h=56px): 로고 + SearchBar(center) + Bell IconButton + Avatar DropdownMenu
- Sidebar (w=240px): 링크 3종 (캘린더/메모/태그)
- Content: padding 24px, `<Outlet/>`
- Portal: ToastContainer, ModalRoot

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| Avatar | 이니셜 | String | user.loginId (API /auth/me) |
| Sidebar | 현재 메뉴 활성화 | boolean | 현재 URL |
| Notification Popover | 세션 내 받은 알림 목록 | List | 인메모리 (SSE 수신 누적) |

### API 호출
| 시점 | API | Mock 파일 |
|------|-----|----------|
| 앱 초기 로드(인증 후) | GET /api/auth/me | auth/me_success.json, auth/me_unauthorized.json |
| 상시 | GET /api/notifications/stream (SSE) | notifications/schedule_reminder_sample.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 권한 없음 | /login 리다이렉트 | (전역 가드) |
| SSE 끊김 | 상단 배너 "알림 연결이 끊겼습니다. 재접속 중..." | Toast/Banner |
| SSE 복구 | Toast("알림 연결이 복구되었습니다") | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| SearchBar 제출 | `/search?q=...`로 라우팅 |
| Bell 클릭 | Notification Popover open |
| 사이드바 링크 | 해당 라우트 이동 + active 스타일 |
| Avatar 클릭 | DropdownMenu open |
| "로그아웃" 선택 | JWT 제거 + /login으로 이동 (서버 API 호출 없음) |

---

## S003: 통합 검색 결과

### 화면 정보
- 경로: /search?q=...&type=...&tagIds=...&page=...
- 접근 권한: isAuthenticated
- 소속 그룹: 공통

### 사용하는 공통 컴포넌트
SearchBar, RadioGroup, TagPicker, List, Skeleton, EmptyState, ErrorState, Pagination, Tag

### 레이아웃
- 상단: SearchBar + RadioGroup(ALL/SCHEDULE/MEMO) + TagPicker(필터)
- 본문: List — 각 항목은 타입 아이콘 + 제목 + 요약(summary) + tags Chip
- 하단: Pagination

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| 툴바 | 키워드/필터 | String/enum/List | URL 쿼리 |
| TagPicker 옵션 | 태그 목록 | List<TagSummary> | `GET /api/tags` |
| 결과 항목 | type/id/title/summary/startAt/endAt/updatedAt/sortAt/tags | SearchItem | `GET /api/search` |
| Pagination | totalPages/hasNext | Integer/Boolean | PagedResponse |

### API 호출
| 시점 | API | Mock 파일 |
|------|-----|----------|
| 진입 | GET /api/tags | tags/list_success.json, tags/list_empty.json |
| 진입/필터 변경 | GET /api/search | search/mixed_success.json, search/empty.json, search/bad_request.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 결과 5~10 Skeleton | Skeleton |
| 빈값 | "검색 결과가 없습니다" | EmptyState |
| API 에러(400) | "검색어를 다시 확인하세요" | TextField.error + Toast |
| API 에러(5xx) | "검색 중 오류" + retry | ErrorState |
| 성공 | 결과 즉시 갱신 | List |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| SearchBar 제출 | URL q 갱신 + 재조회 |
| RadioGroup 선택 | URL type 갱신 |
| TagPicker 선택 | URL tagIds 갱신 |
| 결과 클릭(일정) | /schedules/:id 이동 |
| 결과 클릭(메모) | /memos/:id 이동 |
| Pagination 이동 | URL page 갱신 |

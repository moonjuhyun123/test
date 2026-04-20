# 리뷰: 09_화면_상세_명세서.md
- 일시: 2026-04-20
- 기준: 07_화면목록.md, 08_디자인_시스템_명세서.md

## 화면 존재 매핑
| 화면번호 | 화면명(07) | 09 상세 존재 | 상태 |
|---------|-----------|------------|------|
| S001 | 로그인 | ✅ | OK |
| S002 | 메인 셸 | ✅ (공통 레이아웃으로 처리) | OK |
| S003 | 통합 검색 결과 | ✅ | OK |
| S101 | 캘린더 월 뷰 | ✅ | OK |
| S102 | 캘린더 주 뷰 | ✅ | OK |
| S103 | 일정 상세·수정 | ✅ | OK |
| S104 | 일정 생성 | ✅ | OK |
| S201 | 메모 목록 | ✅ (선택 모드 포함) | OK |
| S202 | 메모 상세·수정 | ✅ | OK |
| S203 | 메모 생성 | ✅ | OK |
| S301 | 태그 관리 | ✅ | OK |
| S401 | 알림 토스트/패널 | ✅ | OK |

- 12/12 모두 상세 존재.

## 컴포넌트 배치 정의 여부
| 화면 | 배치 설명 | 상태 |
|------|---------|------|
| S001~S401 전 화면 | "컴포넌트 배치" 섹션 명시 | ✅ 전체 |

## 08에 없는 컴포넌트 사용 검사

| 화면 | 사용된 컴포넌트 | 08 존재 | 비고 |
|------|---------------|--------|------|
| S001 | Card, TextField, Button, ErrorState | ✅ | |
| S002 | Header slots, Sidebar, SearchBar, IconButton, Avatar, DropdownMenu, Toast root, Modal portal | ✅ | 08 §레이아웃 구조에 정의 |
| S003 | SearchBar, RadioGroup, TagPicker, List, Skeleton, EmptyState, ErrorState, Pagination(?) | ⚠️ 부분 | 08에 **Pagination 컴포넌트 명시 없음** |
| S101 | IconButton, Tabs(?), Button, CalendarGrid(Month), ScheduleEventChip, Popover, Skeleton, ErrorState, Toast | ⚠️ 부분 | **Tabs 컴포넌트 08에 없음** |
| S102 | 동일 (Week) | ⚠️ | Tabs 동일 이슈 |
| S103 | IconButton, Button, Badge, Tag, List, Modal, FileUploader, MarkdownRenderer, EmptyState, ErrorState, TextField, Toast, Skeleton | ✅ | |
| S104 | TextField, DateTimePicker, Select, NumberInput, TagPicker, FileUploader, Button, Toast | ✅ | |
| S201 | SearchBar, TagPicker, Card, List, EmptyState, ErrorState, Button, Skeleton, Toast, Pagination(?) | ⚠️ | Pagination 이슈 |
| S202 | MarkdownRenderer, MarkdownEditor, TagPicker, FileUploader, List, Modal, IconButton, Button, Toast, EmptyState, TextField | ✅ | |
| S203 | TextField, MarkdownEditor, TagPicker, FileUploader, Button, Toast | ✅ | |
| S301 | Button, TagTreeEditor, Modal, TextField, EmptyState, ErrorState, Skeleton, Toast | ✅ | |
| S401 | NotificationToast, List, Popover, Toast | ✅ | |

### 지적 (컴포넌트 누락)
1. **Pagination** — 09에서 S003, S201이 사용하지만 08에 정의 없음.
2. **Tabs** — 09에서 S101/S102 뷰 전환에 사용하지만 08에 정의 없음.

→ 08 보완 필요 또는 09에서 다른 조합(IconButton + 상태 표시)로 우회해야 함. **경미 ~ 중경중 지적**.

## 상태 정의 완전성
| 화면 | 로딩 | 데이터있음 | 빈값 | 에러 | 권한없음 | 검증실패 | 성공 | 상태 |
|------|------|---------|------|------|---------|---------|------|------|
| S001 | ✅ | n/a(폼) | n/a(폼) | ✅ | n/a(공개) | ✅ | ✅ | ✅ |
| S002 | n/a(정적셸) | ✅ | n/a | n/a | ✅ | n/a | ✅ | ✅ |
| S003 | ✅ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ | ✅ |
| S101 | ✅ | ✅ | n/a(캘린더 자체) | ✅ | n/a | n/a | ✅ | ✅ |
| S102 | ✅ | ✅ | n/a | ✅ | n/a | n/a | ✅ | ✅ |
| S103 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| S104 | ✅ | n/a | n/a | ✅ | n/a | ✅ | ✅ | ✅ |
| S201 | ✅ | ✅ | ✅ | ✅ | n/a | n/a | ✅ | ✅ |
| S202 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| S203 | ✅ | n/a | n/a | ✅ | n/a | ✅ | ✅ | ✅ |
| S301 | ✅ | ✅ | ✅ | ✅ | n/a | ✅ | ✅ | ✅ |
| S401 | n/a(SSE 즉시) | ✅ | ✅ | ✅ | n/a | n/a | ✅ | ✅ |

- 12/12 화면의 7개 상태 컬럼 모두 `✅` 또는 `n/a + 사유`. 누락 0건.

## "해당 없음" 사유 기재 검증
| 화면 | n/a 항목 | 사유 | 판단 |
|------|---------|------|------|
| S001 | 데이터/빈값 | "입력 폼 화면, 데이터 표시 아님" | ✅ |
| S001 | 권한 없음 | "공개 진입점" | ✅ |
| S002 | 로딩 | "정적 셸" | ✅ |
| S101/102 | 빈값 | "캘린더 자체가 주 UI" | ✅ |
| S101/102 | 검증 실패 | "조회 전용" | ✅ |
| S104/S203 | 데이터/빈값 | "생성 폼" | ✅ |
| S201 | 검증 실패 | "조회 전용" | ✅ |
| S401 | 로딩 | "SSE 수신 즉시 반영" | ✅ |
| 전역 | 권한 없음 | "단일 역할, 본인 데이터 자동 필터" | ✅ |

- 전원 사유 기재 완비.

## 07에 없는데 09에만 있는 화면
- 없음. S002는 07의 "메인 셸" 그대로 처리 (독립 라우트 없음이라는 07 주석 준수).

## AI 추가 의심 (근거 없는 행위)
| 행위/요소 | 09 기재 | 판단 |
|----------|--------|------|
| S202 체크박스 자동 저장 | 01 F010 "체크박스 클릭으로 토글되어 본문이 자동 저장됨" | ✅ 직접 근거 |
| S103 편집 모드 ↔ 읽기 모드 | 01 F002 "상세를 보고 수정" — 편집/읽기 분리는 실무 관례 | ⚠️ 경미 허용 |
| 낙관적 업데이트 "미사용" 명시 | 과도한 복잡도 제거 | ✅ 건전한 결정 |
| S301 드래그앤드롭 "제외" 명시 | 01 근거 없음 + 안정 우선 | ✅ 건전한 결정 |
| S002 DropdownMenu "로그아웃" | 02_review/07_review 지적 반영(로그아웃 귀속 확정) | ⚠️ 경미 — 여전히 01 근거 없음. 허용하되 /session1 보완 또는 본 화면에서 제거 중 선택 필요 |

## 수치
- 화면 커버율: 12/12 (100%)
- 상태 정의 완전율: 84/84 (12화면 × 7상태, n/a 포함 모두 명시) = 100%
- 08 외 컴포넌트 사용: 2건 (Pagination, Tabs)
- AI 추가 의심: 1건 경미 (로그아웃 DropdownMenu)

## 판단
✅ 다음 진행 가능 (단, 아래 보완 필요)

### 보완 필요 (중경도)
1. **08에 Pagination 추가** — S003 검색 결과, S201 메모 목록에서 사용. 기본 props: `page/size/totalPages/onChange`.
2. **08에 Tabs 추가 또는 09 우회** — S101/S102 월/주 뷰 전환. 대안: 단순 `SegmentedControl`처럼 IconButton + 상태 표시로도 가능.
→ /session10 진입 전에 08을 미니 보완하거나 /session14~16에서 FRONT_SPEC 작성 시 반영.

### 경미 메모
3. "로그아웃" 동작이 여전히 01 근거 없음 — /session1로 돌아가 추가할지, 09에서 제거할지 선택 필요. 기능 영향 낮음.
4. S101 Popover "셀 클릭해 일정 만들기" 힌트는 08 Popover 정의 내이지만, 힌트 텍스트 빈번 노출 UX는 /session10에서 실제 텍스트 확정 권장.

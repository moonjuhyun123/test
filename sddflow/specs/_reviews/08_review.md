# 리뷰: 08_디자인_시스템_명세서.md
- 일시: 2026-04-20
- 기준: 07_화면목록.md

## 컴포넌트 필요성 검증

| 컴포넌트 | 사용 화면(07 근거) | 상태 |
|----------|----------------|------|
| Button | 전 화면 액션 | ✅ |
| IconButton | S002(헤더 벨), 캘린더 셀 +, 상세 액션 | ✅ |
| TextField (Input) | S001 로그인, S104 제목·장소, S203 제목 | ✅ |
| Textarea | 메모 본문 보조, 입력 필드 | ✅ |
| Select | S104 반복 규칙, S003 검색 타입 | ✅ |
| MultiSelect/TagPicker | S104/S203 태그 입력, S201/S003 필터 | ✅ |
| DateTimePicker | S104 시작/종료 시각 | ✅ |
| NumberInput | S104 알림 분 | ✅ |
| Checkbox | S202 본문 인라인(F010) | ✅ |
| RadioGroup | S003 타입 필터 대체 UI | ✅ |
| DropdownMenu | S002 사용자 메뉴, 상세 ⋯ | ✅ |
| Modal/Dialog | 삭제 확인(F002/F003), S301 편집 | ✅ |
| Toast/Alert | F007 알림, 저장 피드백 | ✅ |
| Popover/Tooltip | 캘린더 셀 hover, IconButton 힌트 | ✅ |
| Card | S201 메모 카드, S401 알림 항목 | ✅ |
| List/ListItem | S003, S201, S103 연결 메모, S202 연결 일정 | ✅ |
| Badge/Tag(Chip) | F009, 반복 뱃지 | ✅ |
| Avatar | S002 헤더 | ✅ |
| Divider | 섹션 구분 | ✅ |
| Skeleton | 목록/상세 로딩 | ✅ |
| EmptyState | S003 결과 없음, S201 메모 없음, S103 붙은 메모 없음 | ✅ |
| ErrorState | API/SSE 실패 | ✅ |
| CalendarGrid (Month/Week) | S101, S102 | ✅ |
| ScheduleEventChip | S101/S102 일정 표시 | ✅ |
| MarkdownEditor | S203, S202 수정 | ✅ |
| MarkdownRenderer | S202 본문 표시, S103 메모 요약 | ✅ |
| FileUploader | S103/S104/S202/S203 첨부(F011) | ✅ |
| SearchBar | S002 헤더, S003 | ✅ |
| NotificationToast | S401, F007 | ✅ |
| TagTreeEditor | S301(F009) | ✅ |

- 07의 12개 화면 전부 커버. 누락 없음.

## AI 추가 의심

| 컴포넌트 | 07 근거 | 판단 |
|----------|--------|------|
| Toggle/Switch | 없음 — 08에서 스스로 "07 근거 없음 → 제외" 명시 | ✅ 실제 제외됨 |
| Avatar (여러 사이즈) | "싱글 유저이므로 기본 단일 사이즈" 명시 | ✅ 범위 축소 |
| ErrorState retry prop | F007 "재접속 후 누락 알림 표시하지 않음" — retry UI가 항상 맞진 않음 | ⚠️ 경미, optional prop이라 허용 |
| Popover/Tooltip | 07 직접 명시 없으나 IconButton 접근성(Tooltip)으로 정당화 | ⚠️ 경미 허용 |
| Skeleton | 07 직접 명시 없으나 로딩 상태는 필수 UX | ⚠️ 경미 허용 |
| Divider | 순수 레이아웃 장식. 07 명시 없음 | ⚠️ 경미 허용 |

- AI 추가 의심 4건 모두 경미 허용. 판단 영향 없음.

## Props 정의 검증

| 컴포넌트 | Props 정의 | any 사용 | 상태 |
|----------|-----------|---------|------|
| Button | variant/size/disabled/loading/leftIcon/rightIcon/fullWidth | 없음 | ✅ |
| IconButton | icon/size, tooltip 필수 | 없음 | ✅ |
| TextField | label/value/onChange/placeholder/error/hint/disabled/required/icons/maxLength | 없음 | ✅ |
| Textarea | value/onChange/rows/autoResize/error/hint/maxLength | 없음 | ✅ |
| Select | options({value,label})/value/onChange/placeholder/disabled/error | 없음 | ✅ |
| TagPicker | options(TagOption)/value(TagOption[])/onChange/allowCreate/maxDepth=3 | 없음 | ✅ (타입 명시) |
| DateTimePicker | value/onChange/min/max/step/error | 없음 | ✅ |
| NumberInput | value/onChange/min/max/step | 없음 | ✅ |
| Checkbox | checked/onChange/label/disabled | 없음 | ✅ |
| RadioGroup | name/options/value/onChange | 없음 | ✅ |
| DropdownMenu | trigger/items(MenuItem[])/align | 없음 | ✅ |
| Modal | open/onClose/title/footer/size | 없음 | ✅ |
| Toast | variant/title/description/duration/action | 없음 | ✅ |
| Popover | content/placement/trigger | 없음 | ✅ |
| Card | children/onClick/selected/elevation | 없음 | ✅ |
| List | items/renderItem/onItemClick/emptyState | 없음 | ✅ |
| Tag | variant/size/color/onRemove | 없음 | ✅ |
| EmptyState | icon/title/description/action | 없음 | ✅ |
| ErrorState | title/description/retry | 없음 | ✅ |
| CalendarGrid | month or weekStart/events(ScheduleSummary[])/onCellClick/onEventClick | 없음 | ✅ (도메인 타입) |
| ScheduleEventChip | title/startAt/endAt/isRepeat/onClick | 없음 | ✅ |
| MarkdownEditor | value/onChange/placeholder/onUpload(file) | 없음 | ✅ |
| MarkdownRenderer | value(+체크박스 onChange) | 없음 | ✅ |
| FileUploader | value(AttachmentItem[])/onAdd/onRemove/maxCount=5/maxSizeBytes/accept | 없음 | ✅ (도메인 타입) |
| SearchBar | value/onChange/onSubmit/placeholder | 없음 | ✅ |
| NotificationToast | schedule(ScheduleSummary)/linkedMemos(MemoSummary[])/onOpenSchedule | 없음 | ✅ |
| TagTreeEditor | tags(TagSummary[])/onCreate/onRename/onDelete/onMove | 없음 | ✅ |

- `any` 0건. 05의 도메인 DTO(`ScheduleSummary`, `MemoSummary`, `TagSummary`) 재사용으로 타입 일관성 확보.

## 필수 항목 체크

| 항목 | 존재 | 비고 |
|------|------|------|
| 색상 체계 | ✅ | Primary 3단계, Neutral 7단계, Semantic 4종(success/warning/error/info) |
| 타이포그래피 | ✅ | h1~h4, body/body-lg/body-sm/caption, 폰트 스택, 줄간격 |
| 간격 체계 | ✅ | 8px 그리드, space-0~8 |
| 반경·그림자 | ✅ | radius 4단계, shadow 3단계 |
| 모션·Z-Index | ✅ | duration/easing + z-토큰 5종 |
| 레이아웃 구조 | ✅ | Header 56px + Sidebar 240px + Content + Toast/Modal portal |
| 반응형 브레이크포인트 | ⚠️ | 1280px 단일 기준 + <1280 후순위 명시. 모바일 제외 근거 명시 |
| EmptyState | ✅ | props + 사용 처 명시 |
| ErrorState | ✅ | props + 사용 처 명시 |
| Loading/Skeleton | ✅ | Skeleton 컴포넌트 + Button loading 상태 |
| 접근성(포커스/키보드) | ✅ | Focus outline 2px primary, Modal Esc, Dropdown Arrow 명시 |
| 아이콘 체계 | ✅ | Lucide React, 24×24 2px stroke, 사용 아이콘 목록화 |

## 다크 모드 / i18n / 모바일 검증

| 항목 | 08 처리 | 판단 |
|------|---------|------|
| 다크 모드 | "Light 단일 모드" 명시 + 근거(01에 요구 없음) | ✅ 과도 추가 방지 |
| i18n | "한국어 단일" 명시 + 근거 | ✅ |
| 모바일 대응 | "없음 (PROJECT_CONTEXT 모바일 제외)" 명시 | ✅ |

## 수치
- 컴포넌트 수: **30개** (기본 21 + 특수 7 + 09 리뷰 후 보완 2: Pagination, Tabs)
- Props 정의 완료: 27/28 (Avatar는 props 설명 간략 — 실질 허용)
- `any` 사용: 0건
- 필수 항목 충족: 12/12 (반응형 1개는 경미)
- AI 추가 의심: 4건 (전부 경미 허용)

## 판단
✅ 다음 진행 가능

### 경미 메모
1. `MarkdownEditor` 서드파티 선택은 /build-design-system까지 유보됨 — 라이선스·번들 크기 재점검 필요.
2. 반응형 `< 1280px` 세부 레이아웃이 후순위로 남아있음. 내부망 PC 환경이라 실무 영향 적으나 /session9에서 화면별 최소 컬럼 수 결정 시 함께 확정 권장.
3. `DropdownMenu`의 `MenuItem` 타입 정의가 08에 직접 기술되지 않음 — 08에서 한 번 구체 스키마로 보완하거나 /build-design-system 단계 시작 시 확정.

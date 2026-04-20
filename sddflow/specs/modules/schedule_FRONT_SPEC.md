# FRONT_SPEC: 일정

## 포함 화면
| 번호 | 화면명 | 경로 |
|------|--------|------|
| S101 | 캘린더 월 뷰 | /calendar |
| S102 | 캘린더 주 뷰 | /calendar/week |
| S103 | 일정 상세·수정 | /schedules/:id |
| S104 | 일정 생성 | /schedules/new (또는 Modal) |

---

## S101: 캘린더 월 뷰

### 화면 정보
- 경로: /calendar
- 접근 권한: isAuthenticated
- 소속 그룹: 일정

### 사용하는 공통 컴포넌트
IconButton, Tabs, Button, CalendarGrid(Month), ScheduleEventChip, Popover, Skeleton, ErrorState, Toast

### 레이아웃
- 상단 툴바: ChevronLeft + 월 라벨 + ChevronRight + Tabs(월/주) + Button(primary, "일정 만들기")
- 본문: 월 그리드 7×(5~6) 셀 + 각 셀에 ScheduleEventChip 스택

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| 툴바 | 현재 월 라벨 | String | 계산값 |
| Chip | title/startAt/endAt | String/DateTime | schedule.* |
| Chip | isRepeat 뱃지 | boolean | schedule.repeat_rule ≠ NONE |

### API 호출
| 시점 | API | Mock 파일 |
|------|-----|----------|
| 월 진입/변경 | GET /api/schedules?from=월1일&to=월말일 | schedules/month_success.json, schedules/month_empty.json, schedules/server_error.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 그리드 Skeleton | Skeleton |
| 데이터 있음 | 그리드 + 칩 | CalendarGrid |
| 빈값 | 그리드만(이벤트 없음) | — |
| 에러 | ErrorState + retry | ErrorState |
| 성공 | 갱신 시 Toast | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| Chevron | 이전/다음 월 |
| Tabs(주) | /calendar/week로 이동 |
| 셀 클릭 | /schedules/new?startAt=셀 기본 시각 |
| Chip 클릭 | /schedules/:id |
| "일정 만들기" | /schedules/new |

---

## S102: 캘린더 주 뷰

### 화면 정보
- 경로: /calendar/week?weekStart=yyyy-MM-dd
- 접근 권한: isAuthenticated
- 소속 그룹: 일정

### 사용하는 공통 컴포넌트
IconButton, Tabs, Button, CalendarGrid(Week), ScheduleEventChip, Skeleton, ErrorState, Toast

### 레이아웃
S101과 동일 툴바 구조, 본문은 주 타임라인 그리드(시간축 × 요일)

### 표시 데이터 / API / 상태 / 행위
S101과 동일. API 쿼리만 `from=weekStart, to=weekStart+7`.
- Mock: schedules/week_success.json

---

## S103: 일정 상세 · 수정

### 화면 정보
- 경로: /schedules/:id
- 접근 권한: isAuthenticated (소유자는 서버 404로 보호)
- 소속 그룹: 일정

### 사용하는 공통 컴포넌트
Button, IconButton, Badge, Tag, List, Modal, FileUploader, MarkdownRenderer, EmptyState, ErrorState, TextField, Toast, Skeleton, TagPicker, DateTimePicker, Select, NumberInput

### 레이아웃
- 상단 툴바: 뒤로 + 제목 + 반복 Badge + IconButton(Edit/Trash)
- 좌측 2/3: 시간·장소·반복·알림분·태그·첨부(FileUploader 카드)
- 우측 1/3: "붙은 메모" 헤더 + Button("메모 붙이기") + List (MarkdownRenderer 요약 + 연결 해제 IconButton)

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| 좌측 | schedule.* | 다수 | `GET /api/schedules/:id` |
| 좌측 | tags[] | List<TagSummary> | 동일 응답 임베드 |
| 좌측 | attachments | List<AttachmentItem> | `GET /api/schedules/:id/attachments` |
| 우측 | linkedMemos | List<LinkedMemoItem> | `GET /api/schedules/:id/linked-memos` |

### API 호출
| 시점 | API | Mock 파일 |
|------|-----|----------|
| 진입 | GET /api/schedules/:id | schedules/detail_success.json, schedules/detail_not_found.json |
| 진입 | GET /api/schedules/:id/linked-memos | schedules/linked_memos_success.json, schedules/linked_memos_empty.json |
| 진입 | GET /api/schedules/:id/attachments | schedules/attachments_success.json |
| 저장 | PATCH /api/schedules/:id | schedules/update_success.json, schedules/update_validation.json |
| 삭제 | DELETE /api/schedules/:id | schedules/delete_success.json |
| 업로드 | POST /api/attachments (SCHEDULE) | attachments/upload_success.json, attachments/upload_too_large.json |
| 첨부 삭제 | DELETE /api/attachments/:id | |
| 링크 해제 | DELETE /api/links/:linkId | links/delete_success.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 헤더 + 좌우 Skeleton | Skeleton |
| 빈값(붙은 메모) | EmptyState + "메모 붙이기" | EmptyState |
| 404 소유 불일치 | "일정을 찾을 수 없습니다" + 캘린더 복귀 | EmptyState |
| 입력 검증(편집) | startAt>endAt "종료는 시작 이후여야 합니다" | TextField.error |
| 성공 | Toast("저장되었습니다" / "삭제되었습니다") | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| Edit | 편집 모드 전환 |
| 저장/취소 | PATCH 또는 원복 |
| Trash | Modal 확인 → DELETE → /calendar |
| "메모 붙이기 → 새 메모" | /memos/new?attachToScheduleId=:id |
| "메모 붙이기 → 기존" | /memos?mode=select&attachToScheduleId=:id |
| 연결 해제 | 확인 Modal → DELETE /api/links/:linkId |
| 업로드 | POST /api/attachments |

---

## S104: 일정 생성

### 화면 정보
- 경로: /schedules/new[?sourceMemoId=&startAt=...]
- 접근 권한: isAuthenticated
- 소속 그룹: 일정

### 사용하는 공통 컴포넌트
TextField, DateTimePicker, Select, NumberInput, TagPicker, FileUploader, Button, Toast

### 레이아웃
- 상단: 뒤로 + 제목 "새 일정" + (sourceMemoId 있을 때) 배너 "'(원본 메모 제목)'에서 생성됩니다"
- 폼 2컬럼: title, DateTimePicker×2, location, Select(repeat), NumberInput(remindBeforeMinutes), TagPicker, FileUploader
- 하단: Button(primary, "저장") + Button(ghost, "취소")

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| Select 옵션 | NONE/DAILY/WEEKLY/MONTHLY | enum | 정적 |
| TagPicker 옵션 | 태그 목록 | List<TagSummary> | `GET /api/tags` |
| 배너 | 원본 메모 제목 | String | `GET /api/memos/:sourceMemoId` |

### API 호출
| 시점 | API | Mock 파일 |
|------|-----|----------|
| 진입 | GET /api/tags | tags/list_success.json |
| 진입 (sourceMemoId) | GET /api/memos/:id | memos/detail_success.json |
| 저장 | POST /api/schedules (+ sourceMemoId → 자동 링크) | schedules/create_success.json, schedules/create_validation.json |
| 저장 후 첨부 | POST /api/attachments (루프) | attachments/upload_success.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 저장 버튼 loading | Button(loading) |
| API 에러 | Toast(error) + 폼 유지 | Toast |
| 입력 검증 | 필드 에러(title 빈값, startAt>endAt) | TextField.error |
| 성공 | Toast + /schedules/:id 이동 | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| 필드 입력 | 로컬 state |
| 저장 | POST → 성공 시 상세로 이동 |
| 취소 | 뒤로 |

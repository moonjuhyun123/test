# FRONT_SPEC: 메모

## 포함 화면
| 번호 | 화면명 | 경로 |
|------|--------|------|
| S201 | 메모 목록 | /memos |
| S202 | 메모 상세·수정 | /memos/:id |
| S203 | 메모 생성 | /memos/new (또는 Modal) |

---

## S201: 메모 목록

### 화면 정보
- 경로: /memos (옵션: `?keyword=&tagIds=&page=` 또는 `?mode=select&attachToScheduleId=`)
- 접근 권한: isAuthenticated
- 소속 그룹: 메모

### 사용하는 공통 컴포넌트
SearchBar, TagPicker, Card, List, EmptyState, ErrorState, Button, Skeleton, Toast, Pagination, Tag

### 레이아웃
- 상단: 제목 "메모" + Button(primary, "새 메모")
- 둘째 줄: SearchBar + TagPicker(필터)
- (선택 모드) 상단 배너: "'(대상 일정 제목)'에 붙일 메모 선택" + Button(ghost, "취소")
- 본문: List — 각 카드(title, bodyExcerpt 3줄, updatedAt, Tag 칩) + (선택 모드) Radio 표시
- (선택 모드) 하단 고정 바: Button(primary, "붙이기")
- 하단: Pagination

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| Card | title/bodyExcerpt/updatedAt/tags | MemoCardItem | `GET /api/memos` |
| TagPicker 옵션 | 태그 | List<TagSummary> | `GET /api/tags` |
| 선택 모드 배너 | 일정 제목 | String | `GET /api/schedules/:id` |
| Pagination | totalPages/hasNext | Integer/Boolean | PagedResponse |

### API 호출
| 시점 | API | Mock |
|------|-----|------|
| 진입 | GET /api/tags | tags/list_success.json |
| 진입/필터 | GET /api/memos | memos/list_success.json, memos/list_empty.json, memos/list_error.json |
| 선택 모드 진입 | GET /api/schedules/:id | schedules/detail_success.json |
| 선택 "붙이기" | POST /api/links (SCHEDULE_TO_MEMO) | links/create_success.json, links/create_idempotent.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | Card Skeleton 5개 | Skeleton |
| 빈값 | "작성된 메모가 없습니다" + "새 메모" | EmptyState |
| 에러 | ErrorState + retry | ErrorState |
| 성공(선택 붙이기) | Toast + /schedules/:id 복귀 | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| "새 메모" | /memos/new |
| SearchBar/TagPicker | URL 파라미터 갱신 + 재조회 |
| Card 클릭(일반) | /memos/:id |
| Card 클릭(선택) | 선택 토글 |
| "붙이기"(선택) | POST /api/links → 복귀 |
| "취소"(선택) | /schedules/:id 복귀 |

---

## S202: 메모 상세 · 수정

### 화면 정보
- 경로: /memos/:id
- 접근 권한: isAuthenticated (소유자는 서버 404)
- 소속 그룹: 메모

### 사용하는 공통 컴포넌트
MarkdownRenderer, MarkdownEditor, TagPicker, FileUploader, List, Modal, IconButton, Button, Toast, EmptyState, TextField, Skeleton, Badge

### 레이아웃
- 상단 툴바: 뒤로 + 제목 + IconButton(Edit/Trash) + Button(secondary, "일정 만들기")
- 본문 2컬럼:
  - 좌측 2/3: MarkdownRenderer(체크박스 인라인 토글) / 편집 모드에선 MarkdownEditor
  - 하단: TagPicker(수정 가능) + FileUploader + "연결된 일정" 섹션(List + 연결 해제)
  - 우측 1/3: 메타 — createdAt/updatedAt + 태그 표시

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| 좌측 | body/title/tags/createdAt/updatedAt | MemoDetail | `GET /api/memos/:id` |
| 좌측 | attachments | List<AttachmentItem> | `GET /api/memos/:id/attachments` |
| 하단 | linkedSchedules | List<LinkedScheduleItem> | `GET /api/memos/:id/linked-schedules` |

### API 호출
| 시점 | API | Mock |
|------|-----|------|
| 진입 | GET /api/memos/:id | memos/detail_success.json, memos/detail_not_found.json |
| 진입 | GET /api/memos/:id/linked-schedules | memos/linked_schedules_success.json, memos/linked_schedules_empty.json |
| 진입 | GET /api/memos/:id/attachments | memos/attachments_success.json |
| 체크박스 토글 | PATCH /api/memos/:id (body 교체) | memos/update_success.json |
| 편집 저장 | PATCH /api/memos/:id | 동일 |
| 삭제 | DELETE /api/memos/:id | |
| 업로드 | POST /api/attachments (MEMO) | attachments/upload_success.json |
| 첨부 삭제 | DELETE /api/attachments/:id | |
| 링크 해제 | DELETE /api/links/:linkId | links/delete_success.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 좌우 Skeleton | Skeleton |
| 빈값(연결 일정 없음) | EmptyState | EmptyState |
| 404 | "메모를 찾을 수 없습니다" | EmptyState |
| 입력 검증 | title 빈값 시 필드 에러 | TextField.error |
| 성공 | Toast | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| 체크박스 토글 | body 업데이트 + 자동 PATCH |
| Edit | 편집 모드(MarkdownEditor) |
| 저장/취소 | PATCH 또는 원복 |
| Trash → 확인 | DELETE → /memos 복귀 |
| "일정 만들기" | /schedules/new?sourceMemoId=:id |
| 연결 일정 클릭 | /schedules/:id |
| 연결 해제 | 확인 Modal → DELETE /links |

---

## S203: 메모 생성

### 화면 정보
- 경로: /memos/new[?attachToScheduleId=...]
- 접근 권한: isAuthenticated
- 소속 그룹: 메모

### 사용하는 공통 컴포넌트
TextField, MarkdownEditor, TagPicker, FileUploader, Button, Toast

### 레이아웃
- 상단: 뒤로 + 제목 "새 메모" + (attachToScheduleId 있을 때) 배너 "'(일정 제목)'에 자동으로 붙습니다"
- 폼: title, MarkdownEditor(body), TagPicker, FileUploader
- 하단: Button(primary, "저장") + Button(ghost, "취소")

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| TagPicker 옵션 | 태그 | List<TagSummary> | `GET /api/tags` |
| 배너 | 일정 제목 | String | `GET /api/schedules/:attachToScheduleId` |

### API 호출
| 시점 | API | Mock |
|------|-----|------|
| 진입 | GET /api/tags | tags/list_success.json |
| 진입 (attachTo) | GET /api/schedules/:id | schedules/detail_success.json |
| 저장 | POST /api/memos (+attachToScheduleId → 자동 링크) | memos/create_success.json, memos/create_validation.json |
| 저장 후 첨부 | POST /api/attachments (루프) | |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 버튼 loading | Button(loading) |
| API 에러 | Toast(error) + 폼 유지 | Toast |
| 입력 검증 | title 빈값/첨부 규칙 | TextField, FileUploader error |
| 성공 | Toast + /memos/:id 이동 (또는 /schedules/:id if attachTo) | Toast |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| 입력 | 로컬 state |
| 저장 | POST → 성공 이동 |
| 취소 | 뒤로 |

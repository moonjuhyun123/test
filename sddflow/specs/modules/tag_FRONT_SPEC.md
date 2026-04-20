# FRONT_SPEC: 태그

## 포함 화면
| 번호 | 화면명 | 경로 |
|------|--------|------|
| S301 | 태그 관리 | /tags |

---

## S301: 태그 관리

### 화면 정보
- 경로: /tags
- 접근 권한: isAuthenticated
- 소속 그룹: 태그

### 사용하는 공통 컴포넌트
Button, TagTreeEditor, Modal, TextField, EmptyState, ErrorState, Skeleton, Toast

### 레이아웃
- 상단: 제목 "태그" + Button(primary, "루트 태그 추가")
- 본문: TagTreeEditor (3단계 트리)
  - 각 노드: 태그 이름 + depth 표시 + IconButton(Edit/Trash) + "자식 추가" 버튼
- Modal: 이름 입력/수정/삭제 확인

### 표시 데이터
| 영역 | 항목 | 타입 | 출처 |
|------|------|------|------|
| 트리 | id/name/parentId/depth | List<TagNode> | `GET /api/tags` |
| Modal | 입력 이름 | String | 사용자 입력 |

### API 호출
| 시점 | API | Mock |
|------|-----|------|
| 진입/갱신 | GET /api/tags | tags/list_success.json, tags/list_empty.json |
| 추가 | POST /api/tags | tags/create_success.json, tags/create_conflict.json |
| 수정 | PATCH /api/tags/:id | tags/update_success.json |
| 삭제 | DELETE /api/tags/:id | tags/delete_success.json, tags/delete_conflict.json |

### 상태별 표시
| 상태 | 표시 | 컴포넌트 |
|------|------|----------|
| 로딩 | 트리 Skeleton | Skeleton |
| 빈값 | "태그가 없습니다" + "루트 태그 추가" | EmptyState |
| 에러 | ErrorState + retry | ErrorState |
| 입력 검증 | 빈값/동명/depth>3 에러 | TextField.error |
| 성공 | Toast + 트리 갱신 | Toast |
| 409(자식 존재 삭제) | Modal에 "자식 태그부터 삭제해야 합니다" | Modal |

### 사용자 행위
| 행위 | 동작 |
|------|------|
| "루트 태그 추가" | Modal(이름) → POST |
| "자식 추가" | Modal(이름, parentId=해당) → POST |
| Edit | Modal(이름 수정) → PATCH |
| Trash | 확인 Modal → DELETE |

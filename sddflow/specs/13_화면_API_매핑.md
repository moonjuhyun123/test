# 화면-API 매핑

기준 입력: 09_화면_상세_명세서.md, 11_API_스펙.md

Mock 파일 규약: `mocks/{domain}/{case}.json`. 응답은 11의 `ApiResponse<T>` 봉투 형식 준수.

---

## S001: 로그인

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 로그인 버튼 클릭 | POST /api/auth/login | Body: id, password | success → localStorage에 accessToken 저장 + user 정보 저장 → S101 이동 / 실패(USER-4010) → 카드 하단 에러 메시지 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| POST /api/auth/login | auth/login_success.json | 정상 JWT 발급 |
| POST /api/auth/login | auth/login_unauthorized.json | 401 USER-4010 |
| POST /api/auth/login | auth/login_server_error.json | 500 COMM-5000 |

---

## S002: 메인 셸

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 앱 초기 로드(인증 후) | GET /api/auth/me | — | loginId → Avatar 이니셜, id → 전역 스토어 |
| SearchBar submit | (클라이언트 라우팅) | — | `/search?q=...`로 이동 (S003 진입 시 API 호출) |
| 알림 벨 클릭 | (프론트 전용) | — | SSE 연결 이미 열려있다면 패널만 open |
| 로그아웃 클릭 | (클라이언트 전용) | — | JWT 제거 + S001로 이동 (서버 API 없음, 11 결정) |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/auth/me | auth/me_success.json | 정상 |
| GET /api/auth/me | auth/me_unauthorized.json | 401 AUTH-4010 |

---

## S003: 통합 검색 결과

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/tags | — | TagPicker 옵션 (필터) |
| 화면 진입 / 파라미터 변경 | GET /api/search | Query: q, type?, tagIds?, page, size | items → List 렌더(일정/메모 분기), sortAt → 표시 시각, totalPages → Pagination |
| 결과 클릭(일정) | — | — | S103으로 라우팅(`/schedules/:id`) |
| 결과 클릭(메모) | — | — | S202으로 라우팅 |
| Pagination 이동 | GET /api/search (page 변경) | — | 동일 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/tags | tags/list_success.json | 트리 4개 |
| GET /api/tags | tags/list_empty.json | `[]` |
| GET /api/search | search/mixed_success.json | 일정+메모 혼합 10건 |
| GET /api/search | search/empty.json | totalElements=0 |
| GET /api/search | search/bad_request.json | 400 SRCH-4000 |

---

## S101: 캘린더 월 뷰

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 월 진입/변경 | GET /api/schedules | Query: from=월1일, to=월말일, tagIds? | items → CalendarGrid cells의 ScheduleEventChip |
| "일정 만들기" 버튼 | — | — | S104으로 라우팅 |
| 셀 클릭 | — | — | S104으로 라우팅 (startAt prefill) |
| 칩 클릭 | — | — | S103으로 라우팅 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/schedules | schedules/month_success.json | 이벤트 8건(반복 전개 포함) |
| GET /api/schedules | schedules/month_empty.json | `[]` |
| GET /api/schedules | schedules/server_error.json | 500 |

---

## S102: 캘린더 주 뷰

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 주 진입/변경 | GET /api/schedules | Query: from=주 시작, to=+7일 | S101과 동일 |
| 월 탭 | — | — | S101로 라우팅 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/schedules | schedules/week_success.json | 주간 이벤트 5건 |

(다른 두 케이스는 S101과 공유)

---

## S103: 일정 상세 · 수정

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/schedules/{id} | Path: id | title/startAt/endAt/location/repeat/remind/tags → 상세 필드 |
| 화면 진입 | GET /api/schedules/{id}/linked-memos | Path: id | items → 우측 패널 |
| 화면 진입 | GET /api/schedules/{id}/attachments | Path: id | items → 첨부 카드 |
| 저장(편집 모드) | PATCH /api/schedules/{id} | Body: 부분 수정 | 응답 → 화면 상태 갱신 + Toast |
| 삭제 | DELETE /api/schedules/{id} | Path: id | 204 → S101 이동 + Toast |
| 업로드 | POST /api/attachments | multipart: targetType=SCHEDULE, targetId=id, file | 응답 → 첨부 카드 추가 |
| 첨부 삭제 | DELETE /api/attachments/{id} | — | 204 → 카드 제거 |
| "메모 붙이기 → 새 메모" | — | — | S203으로 `?attachToScheduleId=id` 전달 |
| "메모 붙이기 → 기존 메모" | — | — | S201 선택 모드로 이동 |
| 링크 해제 | DELETE /api/links/{linkId} | Path: linkId | 204 → 목록에서 제거 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/schedules/{id} | schedules/detail_success.json | 태그 포함 |
| GET /api/schedules/{id} | schedules/detail_not_found.json | 404 SCHED-4040 |
| GET /api/schedules/{id}/linked-memos | schedules/linked_memos_success.json | 2건 |
| GET /api/schedules/{id}/linked-memos | schedules/linked_memos_empty.json | `[]` |
| GET /api/schedules/{id}/attachments | schedules/attachments_success.json | 3건 |
| PATCH /api/schedules/{id} | schedules/update_success.json | 변경 반영 |
| PATCH /api/schedules/{id} | schedules/update_validation.json | 400 SCHED-4000 |
| DELETE /api/schedules/{id} | schedules/delete_success.json | 204 (파일명은 관례, 실제는 빈 응답) |
| POST /api/attachments | attachments/upload_success.json | |
| POST /api/attachments | attachments/upload_too_large.json | 400 FILE-4000 |
| DELETE /api/links/{id} | links/delete_success.json | 204 |

---

## S104: 일정 생성

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/tags | — | TagPicker 옵션 |
| 화면 진입 (F005 sourceMemoId 있을 때) | GET /api/memos/{sourceMemoId} | Path | title → 배너 문구 "'(title)'에서 생성됩니다" |
| 저장 | POST /api/schedules | Body: title/startAt/endAt/.../tagIds, sourceMemoId? | 201 → 새 schedule.id로 S103 이동 |
| 저장(첨부 동반) | POST /api/attachments | 생성 완료 후 첨부마다 호출 | 완료 후 이동 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| POST /api/schedules | schedules/create_success.json | 생성된 스케줄 반환 |
| POST /api/schedules | schedules/create_validation.json | 400 SCHED-4000 |
| GET /api/memos/{id} | memos/detail_success.json | sourceMemo 정보 |

---

## S201: 메모 목록

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/tags | — | TagPicker 옵션 |
| 화면 진입 / 필터 변경 / 페이지 | GET /api/memos | Query: keyword?, tagIds?, page, size | items → 카드 목록, totalPages → Pagination |
| "새 메모" 클릭 | — | — | S203으로 이동 |
| (선택 모드 진입) | GET /api/schedules/{attachToScheduleId} | — | title → 배너 문구 |
| (선택 모드) "붙이기" 버튼 | POST /api/links | Body: scheduleId, memoId, origin=SCHEDULE_TO_MEMO | 201/200 → S103으로 복귀 + Toast |
| 카드 클릭(일반) | — | — | S202으로 이동 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/memos | memos/list_success.json | 카드 10건 |
| GET /api/memos | memos/list_empty.json | `[]` |
| GET /api/memos | memos/list_error.json | 500 |
| GET /api/schedules/{id} | schedules/detail_success.json | |
| POST /api/links | links/create_success.json | alreadyExisted=false |
| POST /api/links | links/create_idempotent.json | 200 alreadyExisted=true |

---

## S202: 메모 상세 · 수정

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/memos/{id} | Path | body/title/tags → 렌더 |
| 화면 진입 | GET /api/memos/{id}/linked-schedules | Path | items → 하단 섹션 |
| 화면 진입 | GET /api/memos/{id}/attachments | Path | items → 첨부 카드 |
| 체크박스 토글(인라인) | PATCH /api/memos/{id} | Body: body (교체) | 응답 → 본문 반영 |
| 편집 저장 | PATCH /api/memos/{id} | Body: title/body/tagIds | 응답 → 읽기 모드 복귀 + Toast |
| 삭제 | DELETE /api/memos/{id} | Path | 204 → S201 이동 |
| 업로드 | POST /api/attachments | multipart: targetType=MEMO, targetId=id | 응답 → 카드 추가 |
| 첨부 삭제 | DELETE /api/attachments/{id} | | 204 |
| 링크 해제 | DELETE /api/links/{linkId} | | 204 |
| "일정 만들기" 클릭 | — | — | S104으로 `?sourceMemoId=id` 전달 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/memos/{id} | memos/detail_success.json | |
| GET /api/memos/{id} | memos/detail_not_found.json | 404 MEMO-4040 |
| GET /api/memos/{id}/linked-schedules | memos/linked_schedules_success.json | 2건 |
| GET /api/memos/{id}/linked-schedules | memos/linked_schedules_empty.json | `[]` |
| GET /api/memos/{id}/attachments | memos/attachments_success.json | |
| PATCH /api/memos/{id} | memos/update_success.json | |

---

## S203: 메모 생성

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/tags | — | TagPicker 옵션 |
| 화면 진입 (F004 attachToScheduleId 있을 때) | GET /api/schedules/{id} | | title → 배너 |
| 저장 | POST /api/memos | Body: title/body/tagIds, attachToScheduleId? | 응답 → S202로 이동 (또는 S103 + 자동 링크) |
| 첨부 동반 업로드 | POST /api/attachments | 저장 후 루프 | |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| POST /api/memos | memos/create_success.json | |
| POST /api/memos | memos/create_validation.json | 400 MEMO-4000 |

---

## S301: 태그 관리

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/tags | — | TagTreeEditor 입력 |
| 루트/자식 추가 저장 | POST /api/tags | Body: name, parentId? | 응답 추가 → 트리 갱신 |
| 수정 저장 | PATCH /api/tags/{id} | Body: name?, parentId? | 응답 → 노드 갱신 |
| 삭제 확인 | DELETE /api/tags/{id} | Path | 204 → 노드 제거 / 409 TAG-4090 → 에러 Modal |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/tags | tags/list_success.json | 공유 |
| POST /api/tags | tags/create_success.json | |
| POST /api/tags | tags/create_conflict.json | 400 TAG-4000 (동명) |
| PATCH /api/tags/{id} | tags/update_success.json | |
| DELETE /api/tags/{id} | tags/delete_success.json | 204 |
| DELETE /api/tags/{id} | tags/delete_conflict.json | 409 TAG-4090 (자식 존재) |

---

## S401: 알림 토스트/패널

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 로그인 직후(상시) | GET /api/notifications/stream (SSE) | Authorization 헤더 | event=schedule_reminder → Toast 자동 표시 |
| 토스트 항목 클릭 | — | — | S103으로 라우팅(scheduleId) |

### Mock 데이터
- SSE는 정적 JSON 파일로 Mock 불가. 개발용 **Mock SSE 서버**: 로컬 프로파일(`local`) 시 10초마다 가상 이벤트 1건 푸시(개발 환경 한정). 구현은 /build-design-system / /implement 단계.
- 대안: `mocks/notifications/schedule_reminder_sample.json` (SSE 한 건의 data 샘플)

| 파일 | 설명 |
|------|------|
| notifications/schedule_reminder_sample.json | 정상 페이로드 1건 |
| notifications/schedule_reminder_empty_memos.json | linkedMemos=[] 케이스 |

---

# 매핑 수치

- 화면 수: **12개**
- 09의 사용자 행위 총합(API 관련): 약 60건 — 전부 매핑 (나머지는 순수 프론트: 라우팅/모달 open/state toggle)
- 11 엔드포인트 27개 중 **27개 모두 최소 1개 화면에 매핑**
- 매핑 안 된 API: **없음**

## API → 화면 역매핑 (11의 엔드포인트가 어떤 화면에서 호출되는가)

| API | 호출 화면 |
|-----|----------|
| POST /api/auth/login | S001 |
| GET /api/auth/me | S002 |
| POST /api/schedules | S104 |
| GET /api/schedules | S101, S102 |
| GET /api/schedules/{id} | S103, S104(F005), S201(선택 모드), S203(F004) |
| PATCH /api/schedules/{id} | S103 |
| DELETE /api/schedules/{id} | S103 |
| GET /api/schedules/{id}/linked-memos | S103 |
| GET /api/schedules/{id}/attachments | S103 |
| POST /api/memos | S203 |
| GET /api/memos | S201 |
| GET /api/memos/{id} | S202, S104(F005 배너) |
| PATCH /api/memos/{id} | S202 |
| DELETE /api/memos/{id} | S202 |
| GET /api/memos/{id}/linked-schedules | S202 |
| GET /api/memos/{id}/attachments | S202 |
| POST /api/links | S201(선택 모드), (자동: S203+F004, S104+F005) |
| DELETE /api/links/{id} | S103, S202 |
| GET /api/tags | S003, S104, S201, S203, S301 |
| POST /api/tags | S301 (또는 TagPicker allowCreate) |
| PATCH /api/tags/{id} | S301 |
| DELETE /api/tags/{id} | S301 |
| POST /api/attachments | S103, S104, S202, S203 |
| GET /api/attachments/{id}/download | S103, S202 (썸네일/클릭) |
| DELETE /api/attachments/{id} | S103, S202 |
| GET /api/search | S003 |
| GET /api/notifications/stream | S002/S401 (전역 SSE) |

- 미사용 API: 0개.

## 자체 검증
- [x] 09의 모든 API 관련 사용자 행위가 매핑됨
- [x] 11의 27개 엔드포인트가 모두 최소 1개 화면에 매핑됨
- [x] Mock 데이터가 11의 응답 형식을 따름 (ApiResponse 봉투 + 도메인 DTO 필드명)
- [x] 필드명·타입을 임의 변경하지 않음

## 역행 사유 없음
- 11에서 필요한 엔드포인트 없음 누락 없음. GET /api/memos/{id}, GET /api/schedules/{id}가 S104/S201/S203의 배너·선택 모드에 재사용되어 11에 별도 엔드포인트 추가 불요(11 리뷰 경미 메모 1번 해소).

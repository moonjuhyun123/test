# MODULE_SPEC: attachment (첨부)

## 소유 테이블
`attachment` — id, owner_id, target_type (SCHEDULE/MEMO), target_id, file_name, content_type, file_size, storage_path, created_at
- 인덱스: `idx_attachment_target(target_type, target_id)`, `idx_attachment_owner(owner_id)`
- DB FK 없음(다형 참조) — 앱 레벨 검증

## 사용하는 공용 테이블
| 테이블 | 읽기/쓰기 |
|--------|----------|
| schedule | 읽기 (target_type=SCHEDULE 시 존재/소유자 검증) |
| memo | 읽기 (target_type=MEMO 시 동일) |
| user | 읽기 |

## API 엔드포인트 (11)
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/attachments | 업로드 (multipart, target 검증, ≤10MB/5개, 확장자 4종) |
| GET | /api/attachments/{id}/download | 바이너리 반환 |
| DELETE | /api/attachments/{id} | 삭제 + 스토리지 파일 제거 |
| GET | /api/schedules/{id}/attachments | 실구현(첨부 모듈) — 일정 첨부 목록 |
| GET | /api/memos/{id}/attachments | 실구현(첨부 모듈) — 메모 첨부 목록 |

## 테스트 케이스 (12)
- POST: jpg/png/gif/pdf 각 / 10MB 경계 / 10MB+1(FILE-4000) / 확장자 외 / 6번째 / target 미존재/타인 / targetType 잘못
- GET download: 본인/타인(FILE-4040)/미존재
- DELETE: 본인/타인/미인증
- linked 조회: 있음/없음(`[]`)/타인

## 사용하는 공통 인터페이스
| 인터페이스 | 용도 |
|-----------|------|
| CurrentUser | owner 식별 |
| ScheduleReader | target_type=SCHEDULE 검증 |
| MemoReader | target_type=MEMO 검증 |
| @TransactionalEventListener<ResourceDeletedEvent> | SCHEDULE/MEMO 삭제 시 첨부 행+파일 정리 |

### 본 모듈이 제공하는 인터페이스
- 없음 (첨부 데이터는 다른 모듈이 인터페이스로 조회하지 않음 — 화면에서 직접 호출)

## 필수 외부 연동 어댑터
없음 — **내부 파일 스토리지** 사용 (01 F011). 서버 로컬 파일 시스템 또는 볼륨 마운트. 외부 S3 등 제외.

## Stub 사용 목록
| interface | stub | real_module | real_class |
|-----------|------|-------------|-----------|
| ScheduleReader | ScheduleReaderStub | schedule | DefaultScheduleReader |
| MemoReader | MemoReaderStub | memo | DefaultMemoReader |
| CurrentUser | CurrentUserStub | user | DefaultCurrentUser |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| attachment | 0 | 실제 파일이 필요하므로 시드 없음 |

## 권한
- 전 API `@PreAuthorize("isAuthenticated()")`
- Service에서 owner 검사 + target 소유자와 동일성 검사

## 에러 코드
- FILE-4000 (400) 확장자/용량/개수 위반
- FILE-4040 (404) 미존재/소유 불일치
- SCHED-4040, MEMO-4040 (404) target 관련

## 저장소 규약
- `storage_path`: `./data/attachments/{ownerId}/{yyyyMM}/{uuid}.{ext}`
- 다운로드 URL: `/api/attachments/{id}/download` (토큰 필수)
- 일정·메모 삭제 이벤트 처리 시 DB 삭제 + 파일 삭제 (실패 시 로그 + retry 없음 — MVP)

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE|MEMO, id)` → `attachment WHERE (target_type, target_id)` 매칭 삭제

## 의존 방향
- 의존: user, schedule(Reader), memo(Reader)
- 이 모듈을 의존: 없음 (화면이 직접 API 호출)

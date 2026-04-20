# /implement-attachment — attachment 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다.

## 읽을 파일
1. CLAUDE.md
2. specs/modules/attachment_SPEC.md
3. specs/06_공통_구조_설계서.md
4. src/common/

## 할 일

### 0. 체크포인트 생성
```bash
git add -A && git commit -m "checkpoint: pre-implement-attachment" --allow-empty
git tag -f pre-implement-attachment
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/attachment/main/java/calendar/attachment/
├── controller/
│   ├── AttachmentController.java              (POST /api/attachments, GET/DELETE /api/attachments/{id})
│   ├── ScheduleAttachmentController.java      (GET /api/schedules/{id}/attachments)
│   └── MemoAttachmentController.java          (GET /api/memos/{id}/attachments)
├── service/AttachmentService.java
├── storage/FileStorage.java                    (내부 파일 스토리지 — 로컬 FS)
├── repository/AttachmentRepository.java
├── entity/
│   ├── Attachment.java                        (BaseEntity 상속)
│   └── AttachmentTargetType.java              (enum: SCHEDULE / MEMO)
├── dto/
│   └── AttachmentItemResponse.java
├── listener/AttachmentCleanupListener.java    (ResourceDeletedEvent 구독)
└── src/attachment/test/java/calendar/attachment/
    ├── service/AttachmentServiceTest.java
    ├── storage/FileStorageTest.java
    ├── listener/AttachmentCleanupListenerTest.java
    └── controller/AttachmentControllerTest.java

## 이 모듈의 테이블
- `attachment` — id, owner_id, target_type (SCHEDULE/MEMO), target_id, file_name, content_type, file_size, storage_path, created_at
  - 인덱스: `idx_attachment_target(target_type, target_id)`, `idx_attachment_owner(owner_id)`
  - DB FK 없음(다형 참조) — 앱 레벨 검증

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| POST | /api/attachments | 업로드 (multipart: targetType, targetId, file) |
| GET | /api/attachments/{id}/download | 바이너리 반환 (Content-Type=원본 MIME) |
| DELETE | /api/attachments/{id} | 삭제 + 스토리지 파일 제거 |
| GET | /api/schedules/{id}/attachments | 일정 첨부 목록 |
| GET | /api/memos/{id}/attachments | 메모 첨부 목록 |

## 제한 (F011 명시)
- 확장자: jpg/jpeg/png/gif/pdf (content-type 기반 + 확장자 이중 검사)
- 파일당: ≤ 10MB
- 건당: ≤ 5개 (target 1건당 5개)

## 이 모듈이 사용하는 공통 인터페이스
- `CurrentUser`
- `ScheduleReader` (target_type=SCHEDULE 검증)
- `MemoReader` (target_type=MEMO 검증)
- `@TransactionalEventListener<ResourceDeletedEvent>` — 해당 target의 첨부 행+파일 정리
- 공통 유틸: `OwnershipGuard`

## 본 모듈이 제공하는 공통 인터페이스
- 없음 (다른 모듈이 첨부 데이터를 인터페이스로 조회하지 않음)

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub | user.security.DefaultCurrentUser |
| ScheduleReader | common.stub.ScheduleReaderStub | schedule.reader.DefaultScheduleReader |
| MemoReader | common.stub.MemoReaderStub | memo.reader.DefaultMemoReader |

## 시드 데이터
| table | count | description |
|-------|-------|-------------|
| attachment | 0 | 실제 파일이 필요하므로 시드 없음 |

## 저장소 규약
- `storage_path`: `./data/attachments/{ownerId}/{yyyyMM}/{uuid}.{ext}`
- 다운로드 URL: `/api/attachments/{id}/download` (토큰 필수)
- 삭제 실패 시: 로그만 남기고 계속 (MVP, retry 없음)

## 에러 코드
- FILE-4000 (400): 확장자/용량/개수 위반
- FILE-4040 (404): 미존재/소유 불일치
- SCHED-4040, MEMO-4040 (404): target 관련
- COMM-4000 (400): targetType 잘못된 값

## 이벤트 구독
- `ResourceDeletedEvent(SCHEDULE|MEMO, id)` → `attachment WHERE (target_type, target_id)` 삭제 + 스토리지 파일 제거

## 검증 절차
1. `./gradlew :attachment:build` → 통과
2. 테스트 API 확인:
   - POST /attachments jpg 1MB → 201
   - POST /attachments png/gif/pdf → 201
   - POST /attachments 10MB → 201 (경계)
   - POST /attachments 10MB+1 → 400 FILE-4000
   - POST /attachments txt → 400 FILE-4000
   - POST /attachments 6번째 → 400 FILE-4000
   - POST /attachments 타인 target → 404 SCHED/MEMO-4040
   - GET /attachments/{id}/download 본인 → 200, binary
   - GET /attachments/{id}/download 타인 → 404 FILE-4040
   - DELETE /attachments/{id} 본인 → 204 + 파일 제거
   - 일정 삭제 → 해당 첨부 제거 (이벤트)
   - 메모 삭제 → 동일
3. `.http` 파일 생성
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/attachment_SPEC.md
2. 롤백: /rollback attachment
3. 재시작: 새 세션에서 /implement-attachment 재실행
```

## 절대 규칙
- 명세 없는 API 추가 금지 (예: 썸네일 생성, 이미지 변환)
- 외부 스토리지(S3 등) 사용 금지 — 내부 로컬 FS만 (01 F011)
- schedule/memo 모듈 직접 import 금지
- 확장자·용량·개수 제한을 임의로 완화하지 마라
- 수정 3회 초과 시 멈춤
- Step 0 체크포인트 건너뛰지 마라

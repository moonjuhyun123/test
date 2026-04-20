# /implement-search — search 모듈 구현

## 역할
너는 Dev다. 명세에 있는 것만 구현한다.

## 읽을 파일
1. CLAUDE.md
2. specs/modules/search_SPEC.md
3. specs/06_공통_구조_설계서.md
4. src/common/

## 할 일

### 0. 체크포인트 생성
```bash
git add -A && git commit -m "checkpoint: pre-implement-search" --allow-empty
git tag -f pre-implement-search
```

### 1. 모듈 전체 구현

## 만들 파일 위치
src/search/main/java/calendar/search/
├── controller/SearchController.java
├── service/
│   ├── SearchService.java
│   └── SearchResultMerger.java    (일정+메모 결과 병합 + sortAt DESC 정렬)
├── dto/
│   ├── SearchQuery.java
│   └── SearchItemResponse.java
└── src/search/test/java/calendar/search/
    ├── service/SearchServiceTest.java
    ├── service/SearchResultMergerTest.java
    └── controller/SearchControllerTest.java

## 이 모듈의 테이블
- 없음 (03 §검색 "별도 테이블 없음" 확정)

## 이 모듈의 API
| METHOD | 경로 | 설명 |
|--------|-----|------|
| GET | /api/search | 통합 검색 (q, type?, tagIds?, page?, size?). sortAt DESC |

## 이 모듈이 사용하는 공통 인터페이스
- `CurrentUser` (범위 한정)
- `ScheduleReader.search` (일정 결과)
- `MemoReader.search` (메모 결과)
- `TagReader` (태그 필터 검증 + 결과 렌더링 태그명)
- 공통 유틸: `PageRequestFactory`

## 본 모듈이 제공하는 공통 인터페이스
- 없음

## 이 모듈의 Stub 사용 목록
| interface | stub (local) | real |
|-----------|--------------|------|
| CurrentUser | common.stub.CurrentUserStub | user.security.DefaultCurrentUser |
| ScheduleReader | common.stub.ScheduleReaderStub | schedule.reader.DefaultScheduleReader |
| MemoReader | common.stub.MemoReaderStub | memo.reader.DefaultMemoReader |
| TagReader | common.stub.TagReaderStub | tag.reader.DefaultTagReader |

## 시드 데이터
- 없음 (다른 모듈 시드가 검색 대상)

## 에러 코드
- SRCH-4000 (400): q 빈값 (1자 이상 필수)
- COMM-4000 (400): size>100 등 페이징 제약

## 통합 정렬 구현 (06 결정)
- `sortAt` = 일정 `start_at` / 메모 `updated_at`. DESC 기본.
- 일정·메모 각각 `search(...)` 결과를 받아 메모리 병합 후 sortAt DESC 정렬, skip=page*size, limit=size.
- totalElements = 양쪽 COUNT 합산.
- type=SCHEDULE이면 메모 쿼리 건너뛰기. type=MEMO 동일.

## 권한
- `@PreAuthorize("isAuthenticated()")`
- 범위: `ScheduleReader.search`/`MemoReader.search`가 내부에서 ownerId=currentUser로 필터 (본 모듈 자체 검사 없음)

## 검증 절차
1. `./gradlew :search:build` → 통과
2. 테스트 API 확인:
   - GET /search q="기획" type=ALL → 200, 일정+메모 혼합 sortAt DESC
   - GET /search type=SCHEDULE → 일정만
   - GET /search type=MEMO → 메모만
   - GET /search tagIds=[x] → 태그 포함만
   - GET /search q="없음" → 200 items=[]
   - GET /search q="" → 400 SRCH-4000
   - GET /search size=101 → 400 COMM-4000
   - 본인 범위 한정 → 타인 데이터 미포함
   - 시간 역순 통합 정렬 검증 (일정 start_at=Apr10, 메모 updated_at=Apr20 → 메모가 먼저)
3. `.http` 파일 생성
4. 전부 통과 → git commit

## 수정 3회 초과 시 — 멈추고 안내
```
⛔ 수정 3회 초과 — 이 세션을 중단합니다.

권장 조치:
1. SPEC 점검: specs/modules/search_SPEC.md
2. 롤백: /rollback search
3. 재시작: 새 세션에서 /implement-search 재실행
```

## 절대 규칙
- 명세 없는 API 추가 금지 (예: 검색 히스토리, 자동완성, 추천)
- 자기 테이블 생성 금지 (search 전용 인덱스 테이블 금지)
- schedule/memo/tag 모듈 직접 import 금지 — Reader 인터페이스만 사용
- 수정 3회 초과 시 멈춤
- Step 0 체크포인트 건너뛰지 마라

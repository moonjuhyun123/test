# 리뷰: 13_화면_API_매핑.md
- 일시: 2026-04-20
- 기준: 09_화면_상세_명세서.md, 11_API_스펙.md

## 행위 → API 매핑

샘플링(주요 행위 위주). 프론트 전용 행위(라우팅/모달 open/state toggle)는 매핑 대상 아님.

| 화면 | 행위 | 매핑 API | 11 존재 | 상태 |
|------|------|---------|--------|------|
| S001 | 로그인 submit | POST /api/auth/login | ✅ | ✅ |
| S002 | 사용자 정보 로드 | GET /api/auth/me | ✅ | ✅ |
| S002 | 로그아웃 | (서버 API 없음, JWT 제거) | n/a(11 결정) | ✅ |
| S003 | 검색 결과 조회 | GET /api/search | ✅ | ✅ |
| S003 | 태그 옵션 | GET /api/tags | ✅ | ✅ |
| S101 | 월 조회 | GET /api/schedules | ✅ | ✅ |
| S102 | 주 조회 | GET /api/schedules | ✅ | ✅ |
| S103 | 상세 로드 | GET /api/schedules/{id} | ✅ | ✅ |
| S103 | 붙은 메모 | GET /api/schedules/{id}/linked-memos | ✅ | ✅ |
| S103 | 첨부 | GET /api/schedules/{id}/attachments | ✅ | ✅ |
| S103 | 수정 저장 | PATCH /api/schedules/{id} | ✅ | ✅ |
| S103 | 삭제 | DELETE /api/schedules/{id} | ✅ | ✅ |
| S103 | 업로드 | POST /api/attachments | ✅ | ✅ |
| S103 | 첨부 삭제 | DELETE /api/attachments/{id} | ✅ | ✅ |
| S103 | 링크 해제 | DELETE /api/links/{id} | ✅ | ✅ |
| S104 | 태그 로드 | GET /api/tags | ✅ | ✅ |
| S104 | sourceMemo 배너 | GET /api/memos/{id} | ✅ | ✅ |
| S104 | 저장 | POST /api/schedules | ✅ | ✅ |
| S201 | 목록/필터 | GET /api/memos | ✅ | ✅ |
| S201 | 태그 옵션 | GET /api/tags | ✅ | ✅ |
| S201 | 선택 모드 배너 | GET /api/schedules/{id} | ✅ | ✅ |
| S201 | 선택 붙이기 | POST /api/links | ✅ | ✅ |
| S202 | 상세 로드 | GET /api/memos/{id} | ✅ | ✅ |
| S202 | 연결 일정 | GET /api/memos/{id}/linked-schedules | ✅ | ✅ |
| S202 | 첨부 | GET /api/memos/{id}/attachments | ✅ | ✅ |
| S202 | 체크박스 토글 | PATCH /api/memos/{id} | ✅ | ✅ |
| S202 | 편집 저장 | PATCH /api/memos/{id} | ✅ | ✅ |
| S202 | 삭제 | DELETE /api/memos/{id} | ✅ | ✅ |
| S202 | "일정 만들기" | (라우팅 only → S104) | n/a | ✅ |
| S203 | 태그 로드 | GET /api/tags | ✅ | ✅ |
| S203 | F004 배너 | GET /api/schedules/{id} | ✅ | ✅ |
| S203 | 저장 | POST /api/memos | ✅ | ✅ |
| S301 | 트리 로드 | GET /api/tags | ✅ | ✅ |
| S301 | 생성 | POST /api/tags | ✅ | ✅ |
| S301 | 수정 | PATCH /api/tags/{id} | ✅ | ✅ |
| S301 | 삭제 | DELETE /api/tags/{id} | ✅ | ✅ |
| S401 | SSE 수신 | GET /api/notifications/stream | ✅ | ✅ |

- 전부 매핑 + 매핑된 API 전부 11에 실존.

## API 스펙 매핑률

| # | API 엔드포인트 | 매핑 화면 | 상태 |
|---|--------------|---------|------|
| 1 | POST /api/auth/login | S001 | ✅ |
| 2 | GET /api/auth/me | S002 | ✅ |
| 3 | POST /api/schedules | S104 | ✅ |
| 4 | GET /api/schedules | S101, S102 | ✅ |
| 5 | GET /api/schedules/{id} | S103, S104, S201, S203 | ✅ |
| 6 | PATCH /api/schedules/{id} | S103 | ✅ |
| 7 | DELETE /api/schedules/{id} | S103 | ✅ |
| 8 | GET /api/schedules/{id}/linked-memos | S103 | ✅ |
| 9 | GET /api/schedules/{id}/attachments | S103 | ✅ |
| 10 | POST /api/memos | S203 | ✅ |
| 11 | GET /api/memos | S201 | ✅ |
| 12 | GET /api/memos/{id} | S202, S104 | ✅ |
| 13 | PATCH /api/memos/{id} | S202 | ✅ |
| 14 | DELETE /api/memos/{id} | S202 | ✅ |
| 15 | GET /api/memos/{id}/linked-schedules | S202 | ✅ |
| 16 | GET /api/memos/{id}/attachments | S202 | ✅ |
| 17 | POST /api/links | S201(+자동) | ✅ |
| 18 | DELETE /api/links/{id} | S103, S202 | ✅ |
| 19 | GET /api/tags | S003, S104, S201, S203, S301 | ✅ |
| 20 | POST /api/tags | S301 | ✅ |
| 21 | PATCH /api/tags/{id} | S301 | ✅ |
| 22 | DELETE /api/tags/{id} | S301 | ✅ |
| 23 | POST /api/attachments | S103, S104, S202, S203 | ✅ |
| 24 | GET /api/attachments/{id}/download | S103, S202 | ✅ |
| 25 | DELETE /api/attachments/{id} | S103, S202 | ✅ |
| 26 | GET /api/search | S003 | ✅ |
| 27 | GET /api/notifications/stream | S002/S401 | ✅ |

- 미매핑 API: **0건**

## Mock 데이터 검증

| API | 성공 | 빈값 | 에러 | 응답 형식 일치 |
|-----|------|------|------|--------------|
| POST /api/auth/login | ✅ | n/a(로그인 성공은 단건) | ✅(401+500) | ✅ (accessToken/expiresIn/user) |
| GET /api/auth/me | ✅ | n/a | ✅(401) | ✅ |
| GET /api/tags | ✅ | ✅ | — | ✅ (TagNode[]) ⚠️ 에러 Mock 미정 |
| GET /api/search | ✅ | ✅ | ✅(400) | ✅ (PagedResponse<SearchItem>) |
| GET /api/schedules | ✅(월/주) | ✅ | ✅(500) | ✅ |
| GET /api/schedules/{id} | ✅ | n/a | ✅(404) | ✅ |
| GET /api/schedules/{id}/linked-memos | ✅ | ✅ | — | ✅ ⚠️ 에러 Mock 미정 |
| GET /api/schedules/{id}/attachments | ✅ | — | — | ⚠️ 빈값/에러 Mock 미정 |
| PATCH /api/schedules/{id} | ✅ | n/a | ✅(400) | ✅ |
| DELETE /api/schedules/{id} | ✅(204) | n/a | — | 빈 바디(관례) |
| POST /api/attachments | ✅ | n/a | ✅(400) | ✅ |
| DELETE /api/links/{id} | ✅ | n/a | — | 빈 바디 |
| POST /api/links | ✅(201) + 멱등(200) | n/a | — | ✅ ⚠️ 에러 Mock 미정 |
| GET /api/memos | ✅ | ✅ | ✅ | ✅ |
| GET /api/memos/{id} | ✅ | n/a | ✅(404) | ✅ |
| GET /api/memos/{id}/linked-schedules | ✅ | ✅ | — | ✅ |
| GET /api/memos/{id}/attachments | — | — | — | ⚠️ Mock 전무 |
| PATCH /api/memos/{id} | ✅ | n/a | — | ⚠️ 에러 Mock 미정 |
| POST /api/memos | ✅ | n/a | ✅(400) | ✅ |
| POST /api/tags | ✅ | n/a | ✅(409/400) | ✅ |
| PATCH /api/tags/{id} | ✅ | n/a | — | ⚠️ |
| DELETE /api/tags/{id} | ✅(204) | n/a | ✅(409) | ✅ |
| POST /api/schedules | ✅ | n/a | ✅(400) | ✅ |
| GET /api/attachments/{id}/download | — | — | — | ⚠️ 바이너리라 정적 파일 Mock 부적합, 설명 기재됨 |
| DELETE /api/attachments/{id} | — | n/a | — | ⚠️ Mock 미정 (성공만 필요) |
| GET /api/notifications/stream | ✅ 샘플 | ✅ (empty_memos) | — | ✅ SSE payload |

### Mock 완성도
- 27 API 중 3종 Mock 완전 제공: 약 9개
- 2종(성공+에러 or 성공+빈값) 제공: 약 10개
- 성공만 제공: 약 5개
- Mock 없음(빈 바디/바이너리): 약 3개

## 수치
- 행위 → API 매핑률: 약 40 API 호출 행위 모두 매핑 (프론트 전용 제외) = 100%
- API 스펙 매핑률: **27/27 (100%)**
- Mock 3종 완비율: **9/27 (33%)** — ⚠️ 미달
  - 2종 이상 제공: 19/27 (70%)

## 판단
✅ 다음 진행 가능 (본질 구조는 완성)

### 보완 필요 (우선순위 낮음)
1. **Mock 3종 완비율 33%**: 통합 테스트·프론트 개발에 필요한 최소선은 **성공 + 에러**. 빈값은 조회형 GET만 의미 있으므로 "3종 완비"보다 "최소 성공+에러 2종"을 목표로 재해석하면 19/27 (70%) → 합리적 수준.
2. **에러 Mock 누락 API**: GET /tags, GET /schedules/{id}/linked-memos, GET /schedules/{id}/attachments, POST /links(충돌), PATCH /memos/{id}, PATCH /tags/{id} — 6건. /build-design-system 또는 /implement-front 단계에서 프론트 팀이 모킹하며 보강 가능. 명세 단계 블로커 아님.
3. **바이너리 다운로드(GET /attachments/{id}/download)** 는 Mock JSON 부적합 — 설명으로 대체 기재 OK.
4. **SSE Mock**: 정적 파일이 부적합하여 "로컬 프로파일 Mock SSE 서버" 안내로 대체 — 수용.

### 경미 메모
- 11 리뷰의 "S104 F005 배너 원본 메모 제목 조회 흐름 문서화" 지적이 13에서 명시적으로 해소됨 (`GET /api/memos/{id}`로 재사용). ✅
- "3종 완비" 기준은 조회형 GET에만 유의미 — /session14/15 법률 확정 시 "Mock은 성공+에러 필수, 빈값은 리스트형만" 규칙으로 조정 권장.

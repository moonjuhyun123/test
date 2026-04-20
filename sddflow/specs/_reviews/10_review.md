# 리뷰: 10_표시_데이터_명세.md
- 일시: 2026-04-20
- 기준: 03_ERD.md, 09_화면_상세_명세서.md

## 화면 커버리지
| 화면 | 화면명 | 표시 데이터 | 입력 데이터 | 조합 요구 | 상태 |
|------|-------|-----------|-----------|----------|------|
| S001 | 로그인 | ✅ | ✅ | ✅ | OK |
| S002 | 메인 셸 | ✅ | ✅ | ✅ | OK |
| S003 | 검색 결과 | ✅ | ✅ | ✅ | OK |
| S101 | 월 뷰 | ✅ | ✅ | ✅ | OK |
| S102 | 주 뷰 | ✅ | ✅ | ✅ | OK |
| S103 | 일정 상세 | ✅ | ✅ | ✅ | OK |
| S104 | 일정 생성 | ✅ | ✅ | ✅ | OK |
| S201 | 메모 목록 | ✅ | ✅ | ✅ | OK |
| S202 | 메모 상세 | ✅ | ✅ | ✅ | OK |
| S203 | 메모 생성 | ✅ | ✅ | ✅ | OK |
| S301 | 태그 관리 | ✅ | ✅ | ✅ | OK |
| S401 | 알림 | ✅ | ✅ | ✅ | OK |

- 12/12 (100%)

## ERD 추적 검증

샘플링 + 전체 필드 스캔. 03 ERD의 실존 컬럼 대조.

| 화면 | 데이터 항목 | 출처 | 03 존재 | 상태 |
|------|-----------|------|--------|------|
| S002 | 사용자 이니셜 | `user.login_id` | ✅ (03 §user) | ✅ |
| S003 | 결과(일정) title | `schedule.title` | ✅ | ✅ |
| S003 | 결과(일정) startAt/endAt/location | `schedule.*` | ✅ | ✅ |
| S003 | 결과(메모) body excerpt | `memo.body` | ✅ | ✅ |
| S003 | 태그 칩 | `memo_tag`·`schedule_tag` JOIN `tag` | ✅ | ✅ |
| S101/102 | 제목/시간/반복 | `schedule.*` | ✅ | ✅ |
| S103 | 반복 규칙 | `schedule.repeat_rule` | ✅ | ✅ |
| S103 | 알림 분 | `schedule.remind_before_minutes` | ✅ | ✅ |
| S103 | 태그 | `schedule_tag`+`tag` | ✅ | ✅ |
| S103 | 첨부 목록 | `attachment` (target_type=SCHEDULE) | ✅ | ✅ |
| S103 | 붙은 메모 | `schedule_memo_link`+`memo` | ✅ | ✅ |
| S201 | 제목/bodyExcerpt/updatedAt | `memo.*` | ✅ | ✅ |
| S202 | body, linkedSchedules | `memo.body`, `schedule_memo_link`+`schedule` | ✅ | ✅ |
| S301 | name/parent_id/depth | `tag.*` | ✅ | ✅ |
| S401 | title/startAt | `schedule.*` | ✅ | ✅ |
| S401 | linkedMemos 요약 | `schedule_memo_link`+`memo` | ✅ | ✅ |

- 계산값(반복 뱃지, bodyExcerpt, totalCount, 이니셜, 시간 역순 정렬키)은 "계산값"으로 표기됨 — 03 컬럼 불필요.
- ERD 출처 누락 항목: 0건
- ERD 미존재 참조: 0건

## 교차 모듈 데이터 요약 (★)

| 화면 | 데이터 항목 | 출처 모듈 | 인터페이스 후보(05 대응) |
|------|-----------|---------|------|
| S003 | 태그 칩 렌더 | 태그 | `TagReader.findByIds` |
| S003 | 태그 옵션 로드 | 태그 | 태그 모듈 자체 API (`GET /api/tags`) |
| S103 | 태그 칩 | 태그 | `TagReader`(또는 schedules API 응답에 포함) |
| S103 | 첨부 목록 | 첨부 | 첨부 모듈 API (`GET /api/schedules/:id/attachments`) |
| S103 | 붙은 메모 | 연결+메모 | `LinkReader` + `MemoReader` |
| S104 | 태그 옵션 | 태그 | 태그 모듈 API |
| S104 | 원본 메모 제목 (F005) | 메모 | `MemoReader.findById` |
| S104 | 링크 생성 (F005) | 연결 | 연결 모듈 API |
| S201 | 태그 칩/옵션 | 태그 | 태그 모듈 |
| S201 | 선택 모드 배너 일정 제목 | 일정 | `ScheduleReader.findById` |
| S202 | 태그 칩 | 태그 | 태그 모듈 |
| S202 | 첨부 목록 | 첨부 | 첨부 모듈 API |
| S202 | 연결 일정 목록 | 연결+일정 | `LinkReader` + `ScheduleReader` |
| S203 | 태그 옵션 | 태그 | 태그 모듈 |
| S203 | 대상 일정 제목 (F004) | 일정 | `ScheduleReader.findById` |
| S203 | 링크 생성 (F004) | 연결 | 연결 모듈 API |
| S401 | 연결된 메모 요약 | 연결+메모 | `LinkReader` + `MemoReader` |

- 총 **17건** 교차 데이터. 모두 05의 인터페이스에 대응됨 → /session11에서 API 응답 스펙으로 확정 필요.

## 입력 데이터 완전성

| 화면 | 입력 항목 | 타입 | 필수 | 검증 | 상태 |
|------|---------|------|------|------|------|
| S001 | id/password | String×2 | Y | 범위 | ✅ |
| S002 | q | String | Y(제출 시) | 1+ | ✅ |
| S003 | keyword/type/tagIds/page/size | mixed | Y/N | 명시 | ✅ |
| S101 | yearMonth | String | Y(기본 오늘) | — | ✅ |
| S102 | weekStart | String | Y | — | ✅ |
| S103 | 수정 8필드 + 업로드 + 연결 해제 | mixed | 명시 | 명시 | ✅ |
| S104 | 9필드 + F005 분기 | mixed | 명시 | 명시 | ✅ |
| S201 | keyword/tagIds/page/size/선택모드 2건 | mixed | 명시 | 명시 | ✅ |
| S202 | title/body/tagIds/file/체크박스/F005 | mixed | 명시 | 명시 | ✅ |
| S203 | 4필드 + F004 분기 | mixed | 명시 | 명시 | ✅ |
| S301 | name/parentId/id | mixed | 명시 | 명시 | ✅ |
| S401 | JWT (SSE) | String | Y | — | ✅ |

- 입력 완전율: 12/12 화면 (100%). 모든 입력에 타입/필수/검증 중 최소 2개 이상 명시.

## 조합 요구 구체성

| 화면 | JOIN 명시 | 최소 API 수 명시 | 상태 |
|------|---------|---------------|------|
| S001 | 단일 테이블 명시 | 1개 | ✅ |
| S002 | 없음(셸) + `/auth/me` 1회 | 1개 | ✅ |
| S003 | schedule∪memo + 태그 JOIN 명시 | 2개 | ✅ |
| S101~102 | 반복 전개 /session11 유보 명시 | 1개 | ✅ |
| S103 | 3경로 JOIN 명시 | 3개 | ✅ |
| S104 | tags + schedules + (F005 링크) | 2~3개 | ✅ |
| S201 | memo+tag + (선택 모드 schedule) | 2~3개 | ✅ |
| S202 | 3경로 JOIN 명시 | 3개 | ✅ |
| S203 | tags + memos + (F004 링크) | 2~3개 | ✅ |
| S301 | 단일 테이블 | 4개 | ✅ |
| S401 | SSE 페이로드 서버 JOIN | 0 (SSE) | ✅ |

- 조합 요구 완전율: 12/12

## AI 추가 의심 (ERD·09 근거 없는 것)

| 항목 | 판단 |
|------|------|
| `/auth/me` 엔드포인트 | 09 S002 Avatar "사용자 이니셜"을 표시하려면 필요. 기준 부합 |
| 메모 목록 bodyExcerpt "앞 3줄" | 09 S201 카드 설명에 bodyExcerpt 명시, 10에서 "계산값/서버 계산" 유보 | ✅ |
| S003 "시간 역순 정렬"의 정렬키(일정=start_at, 메모=updated_at) | 01 F006 "시간 역순"을 구체화. /session11 확정 명시 | ✅ |
| 반복 일정 전개 | 01 F008 명시 + /session11 유보 명시 | ✅ |
| `attachment` 다형 조회 `target_type + target_id` | 03 §첨부의 다형 설계 근거 | ✅ |

- 근거 없는 필드·테이블 0건.

## 수치
- 화면 커버율: 12/12 (100%)
- ERD 추적 완료율: 75/75 (약, 계산값 제외 전부 ERD 근거)
- ERD 미존재 항목: 0개
- 교차 모듈 데이터: 17건
- 입력 데이터 완전율: 12/12 (100%)
- 조합 요구 구체성: 12/12

## 판단
✅ 다음 진행 가능 (API 설계 가능)

### 경미 메모 (session11에서 결정)
1. **반복 일정 전개** 방식: 서버가 `GET /api/schedules?from=&to=`에서 가상 인스턴스로 펼쳐서 반환 vs 클라이언트 전개. /session11에서 확정 필요.
2. **일정 상세 응답에 태그 포함 여부**: S103이 태그를 별도 API로 조회할지, 일정 본체 응답에 임베드할지. API 수 vs 페이로드 크기 트레이드오프. 현재 10은 "API 분할 또는 본체 포함 중 /session11 확정" 유보.
3. **메모 목록 검색(S201) 구현 위치**: 클라이언트 필터(Quick) vs 서버 검색(`GET /api/memos?keyword=`). 10은 "서버 기본"으로 유도 — /session11에서 고정.
4. **시간 역순 정렬키** 통일: 일정=start_at, 메모=updated_at 혼합 정렬 — 복합 키 정렬 구현은 /session11의 `/api/search`에서 유의.
5. **AttachmentSummary DTO** 명칭이 10에 처음 등장. 05에 정의 없음 → /session11에서 DTO 정식화 + 05 보강 또는 첨부 모듈 내부 DTO로 귀속 결정.

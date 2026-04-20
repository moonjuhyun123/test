# /session13 — 화면-API 매핑

## 역할
너는 Architect다. 각 화면이 호출하는 API를 매핑하고 Mock 데이터를 정의한다.

## 입력
1. specs/PROJECT_CONTEXT.md
2. specs/09_화면_상세_명세서.md
3. specs/11_API_스펙.md

모두 처음부터 읽어라.

## 할 일

### 1. 화면별 API 매핑
각 화면의 사용자 행위마다 호출하는 API를 매핑한다:
- 호출 시점 (화면 진입, 버튼 클릭, 스크롤, 입력 등)
- API 엔드포인트 (11_API_스펙에서 찾는다)
- 요청 파라미터 (Query, Path, Body)
- 응답 → 화면 데이터 변환 (API 응답 필드 → 화면에 표시할 항목)

### 2. Mock 데이터 정의
각 API별로 3가지 Mock 응답을 정의한다:
- 성공 (데이터 있음)
- 성공 (빈값)
- 에러

Mock 데이터는 11_API_스펙의 응답 형식을 정확히 따른다.

### 3. 매핑 누락 확인
- 09_화면_상세_명세서의 모든 사용자 행위에 API가 매핑되었는지 확인
- 11_API_스펙의 모든 엔드포인트가 최소 1개 화면에 매핑되었는지 확인

## 출력 형식 (화면마다 반복)
```markdown
## S001: {화면명}

### API 매핑
| 시점 | API | 요청 | 응답 → 화면 |
|------|-----|------|-----------|
| 화면 진입 | GET /api/posts?page=0&size=10 | Query: page, size | content → 테이블 행, totalPages → 페이징 |
| 검색 클릭 | GET /api/posts?keyword=xxx | Query: keyword | 동일 |
| 삭제 클릭 | DELETE /api/posts/{id} | Path: id | 성공 → 목록 새로고침 |

### Mock 데이터
| API | 파일명 | 설명 |
|-----|--------|------|
| GET /api/posts | posts_list_success.json | 데이터 10건 |
| GET /api/posts | posts_list_empty.json | 빈 목록 |
| GET /api/posts | posts_list_error.json | 500 에러 |
| DELETE /api/posts/{id} | posts_delete_success.json | 삭제 성공 |

## 매핑 수치
- 화면 수: {N}개
- API 매핑 완료 행위: {N}/{M} ({%})
- API 스펙 엔드포인트 매핑률: {N}/{M} ({%})
- 매핑 안 된 API: {목록 또는 "없음"}
```

## 출력 파일
specs/13_화면_API_매핑.md

## 역행 규칙
- API 스펙에 필요한 엔드포인트가 없으면 "/session11부터 다시 실행하세요" 보고
- 화면 상세에 행위는 있는데 대응하는 API가 없으면 보고만 한다 (프론트 전용 행위일 수 있음)

## 절대 규칙
- API 스펙에 없는 엔드포인트를 만들어내지 마라
- Mock 데이터는 API 스펙의 응답 형식을 정확히 따라라
- 응답 필드명을 임의로 바꾸지 마라

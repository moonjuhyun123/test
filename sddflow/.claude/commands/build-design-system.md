# /build-design-system — 프론트 디자인 시스템 코드 생성

## 역할
너는 Dev다. 디자인 시스템 명세를 실제 코드로 변환한다.

## 입력
1. CLAUDE.md (자동 인식)
2. specs/F2_디자인_시스템_명세서.md

읽어라.

## 할 일 (순서대로)

### 1. 프로젝트 구조 생성
- TypeScript strict 모드 (tsconfig.json: "strict": true)
- 디렉토리 구조 생성

### 2. 공통 타입 정의
- ApiResponse<T> — 백엔드와 동일 구조
- PagedData<T>
- ApiError
- 각 도메인 응답 타입 (specs/07_API_스펙.md 참조)

### 3. 공통 컴포넌트 코드 생성
디자인 시스템 명세의 모든 컴포넌트 구현:
- Button (Primary, Secondary, Danger, 크기별)
- Input (Text, Select, DatePicker, FileUpload)
- Table (정렬, 페이징, 선택)
- Modal / Dialog
- Toast / Alert
- Card
- Navigation (GNB, LNB, Breadcrumb)
- Badge, Tag, Avatar
- EmptyState, ErrorState, Loading
- 기타 (명세에 있는 것만)

모든 컴포넌트:
- Props는 반드시 interface로 정의
- any 타입 사용 금지

### 4. 디자인 토큰
- 색상 체계 (CSS Variables 또는 Theme)
- 타이포그래피 (폰트, 크기 단계)
- 간격 체계 (spacing scale)

### 5. 레이아웃 컴포넌트
- Header, Sidebar, Content, Footer
- 전체 레이아웃 래퍼

### 6. API 클라이언트 공통 모듈
```typescript
// 타입 세이프 API 클라이언트
async function apiGet<T>(path: string): Promise<ApiResponse<T>>
async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>>
async function apiPut<T>(path: string, body: unknown): Promise<ApiResponse<T>>
async function apiDelete<T>(path: string): Promise<ApiResponse<T>>
```
- 에러 핸들링 공통 처리
- 인증 토큰 자동 첨부
- 환경 변수로 Mock ↔ 실제 API 전환

### 7. Mock 데이터 설정
- 환경 변수로 Mock 모드 전환
```
development  → Mock 데이터 사용
staging      → 실제 API 연결
production   → 실제 API 연결
```

### 8. 빌드 + 확인
- 빌드 통과 확인
- 공통 컴포넌트 샘플 페이지로 동작 확인

## 절대 규칙
- 디자인 시스템 명세에 있는 컴포넌트만 만들어라
- any 타입 사용 금지
- 모든 Props는 interface 정의 필수
- "있으면 좋을 것 같은" 컴포넌트를 추가하지 마라
- API 타입은 specs/07_API_스펙.md과 일치시켜라

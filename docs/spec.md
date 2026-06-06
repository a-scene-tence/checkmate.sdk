# 체크메이트 PWA 사양서

> 본 문서는 `checkmate.sdk` 리포지토리 내 `html/` 폴더에 있는 정적 PWA "체크메이트"의 기획 및 기술 사양을 정의합니다.
> 코드 변경 시 해당 섹션을 반드시 함께 업데이트해야 합니다.
>
> 관련 문서:
> - SDK 사양: [`sdk-spec.md`](./sdk-spec.md) — `src/` React + AiT SDK
> - 작업 규칙: [`CLAUDE.md`](./CLAUDE.md)

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 앱명 | 체크메이트 (checkmate) |
| 카테고리 | finance, productivity |
| 설명 | 여유자금 모니터링 가계부 |
| 배포 플랫폼 | Vercel (자동 배포) |
| 소스 위치 | `checkmate.sdk/html/` |
| 라이선스 | (미정) |
| 마지막 업데이트 | 2026-05-21 |

---

## 2. 기술 스택

- **프론트엔드**: Vanilla HTML/CSS/JavaScript (빌드 도구 없음)
- **PWA**: Service Worker + `manifest.json`
- **인증**: Google Identity Services (GIS) OAuth 2.0 — `feature/google-sync` 브랜치 한정
- **데이터 저장**: 브라우저 로컬스토리지 + Google Drive appDataFolder 동기화 (`feature/google-sync` 한정)
- **백업**: Google Drive 자동 동기화 (30초 debounce) + 수동 JSON 내보내기/복원
- **디자인 시스템**: 29cm 에디토리얼(모노크롬 + 차콜 포인트) — 상세 [`design.md`](./design.md)
- **외부 의존성** (CDN):
  - Pretendard 웹폰트 (`cdn.jsdelivr.net/gh/orioncactus/pretendard`) — 2026-06-05 NanumSquareNeo에서 교체
  - Google Identity Services (`accounts.google.com/gsi/client`) — `feature/google-sync` 한정

> 📜 이전에는 Supabase OAuth(Google) + Google Drive 백업이 있었으나, 2026-05-21에 완전 제거됨(§ 7.3). 이후 2026-05-28에 Supabase 없이 GIS 직접 연동으로 재도입 — `feature/google-sync` 브랜치 전용. `main` 브랜치는 여전히 로컬 전용.

---

## 3. 파일 구조 (`html/`)

| 파일 | 크기 | 역할 |
|------|------|------|
| `index.html` | (입증서 제거 후 축소) | 메인 앱 (단일 HTML, 인라인 CSS/JS) |
| `privacy.html` | ~7 KB | 개인정보처리방침 |
| `sw.js` | ~1.9 KB | Service Worker |
| `manifest.json` | ~1.6 KB | PWA 메타데이터 |
| `icon-192.png`, `icon-512.png` | - | PWA 아이콘 (maskable 포함) |
| `apple-touch-icon.png`, `favicon.png` | - | iOS / 브라우저 아이콘 |
| `screenshot1~3.png` | - | PWA 설치 시 갤러리용 |

> 🗑️ 제거된 파일: `auth.html` (Google OAuth 콜백 페이지 — 2026-05-21 삭제)
> ⚠️ `html/vercel.json`은 존재하지 않음. 라우팅 설정은 루트 `vercel.json` 단일 진실.

---

## 4. 라우팅 (루트 `vercel.json`)

| 패턴 | 대상 |
|------|------|
| `/(.*)` | `/$1` (정적 파일 그대로 서빙) |

Vercel 배포 설정:
- `framework: null` — Vite 자동 감지 차단
- `buildCommand: ""` — 빌드 단계 없음 (정적 서빙)
- `outputDirectory: "html"` — `html/` 폴더를 서빙 루트로 지정

> 🗑️ 제거된 라우팅: `/auth`, `/auth/callback` (auth.html 삭제와 함께)

---

## 5. 기능 명세

### 5.1 자산 관리
- **개인 자산**: 개인계좌, 현금, 신용카드 분류
- **공동 자산**: 별도 분리 관리
- 자산별 잔액 실시간 집계

### 5.2 거래 기록
- 수입/지출 추가 (FAB - 부동 작업 버튼)
- 카테고리별 분류
- 거래 검색
- 기간별 합산 및 집계

### 5.3 예산 관리
- 월별 카테고리별 예산 설정
- 진행률 바 시각화 (실시간)
- 초과 시 알림

### 5.4 탭 구조
| 탭 | 주요 기능 |
|----|-----------|
| 대시보드 | 전체 자산 요약, 이번 달 지출 현황 |
| 거래내역 | 모든 거래 목록, 검색, 필터 |
| 요약 | 월별/카테고리별 통계, 차트 |
| 설정 (개인) | ①시작 잔고 ②카테고리 예산 ③자산 ④백업/복원 |
| 설정 (공동) | ①공동 시작 잔고 ②공동 카테고리 예산 |

### 5.5 인증 (`feature/google-sync` 브랜치)
- **Google Identity Services (GIS)** OAuth 2.0 — `accounts.google.com/gsi/client` CDN
- 설정 탭 → "Google 동기화" 카드 → "Google로 로그인" 버튼
- 인증 후 이름·이메일·프로필 사진 표시
- 로그인 상태는 `hb5_gauth` 키(localStorage)에 토큰 + 만료일시 저장 → 재방문 시 자동 복원
- Supabase 미사용 — GIS 단독으로 OAuth 토큰 관리

### 5.6 백업/복원
- **Google Drive 자동 동기화** (`feature/google-sync` 한정):
  - Google 로그인 후 데이터 변경 시 30초 debounce 후 Drive 자동 저장
  - Drive appDataFolder의 `checkmate_backup.json` 단일 파일 — 사용자 Drive 목록에 노출 안 됨
  - 여러 기기에서 동일 계정 로그인 시 데이터 공유
  - 설정 탭 → "🔄 지금 동기화" 버튼으로 수동 동기화 가능
- **로컬 JSON 백업/복원** (공통):
  - 설정 탭 → "데이터 백업/복원" 카드
  - 내보내기: 전체 데이터 JSON 파일 다운로드
  - 복원하기: JSON 파일 업로드 → 데이터 복원

---

## 6. PWA 설정

### 6.1 `manifest.json`
```json
{
  "name": "체크메이트",
  "short_name": "체크메이트",
  "description": "여유자금 모니터링 가계부",
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone",
  "categories": ["finance", "productivity"],
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

### 6.2 Service Worker (`sw.js`)
- **현재 캐시 버전**: `checkmate-v6` (2026-06-03에 v5 → v6 증가 — 전문가용 UI 전환으로 캐시 강제 갱신)
- **캐시 전략**: Network First + Cache Fallback
- **코어 자산** (설치 시 필수 캐시, 실패 시 설치 중단):
  - `index.html`, `manifest.json`, 아이콘들
- **선택 자산** (실패해도 설치 계속): apple-touch-icon
- **외부 CDN** (NanumSquareNeo 폰트): 네트워크 우선 → 실패 시 캐시
- **로컬 자산**: 네트워크 시도 → 실패 시 캐시 반환
- **오프라인 지원**: 캐시된 자산은 오프라인 접근 가능

> ⚠️ Service Worker 변경 시 캐시 키 버전을 반드시 증가시킬 것 (사용자 기기에 잔여 캐시 문제 방지)

---

## 7. 개인정보 정책 요약 (`privacy.html`)

| 항목 | 내용 |
|------|------|
| 수집 정보 | **없음** (서버로 전송되는 개인정보 일체 없음) |
| 저장 위치 | **브라우저 로컬스토리지만** |
| 백업 | 사용자가 수동으로 JSON 파일 내보내기/불러오기 |
| 제3자 공유 | 없음 (광고/분석/외부 서비스 일체 연동 없음) |
| 외부 리소스 로딩 | 공개 웹폰트(나눔스퀘어네오) 만 CDN 로드 |
| 권한 요청 | 카메라/마이크/위치 미요청 |
| 데이터 삭제 | 사용자가 브라우저 데이터 삭제 또는 PWA 재설치로 직접 제거 |
| 아동 보호 | (이전 언급 제거 — 계정 없으므로 연령 식별 자체 불가) |
| 변경 알림 | 변경 7일 후 효력 발생 |
| 문의처 | skynjy050@gmail.com |
| 시행일 | 2026-05-21 |

---

## 8. 변경 이력

| 날짜 | 변경 내용 | PR |
|------|-----------|-----|
| 2026-05-02 | 초기 spec 작성 | #2 |
| 2026-05-02 | Vercel 배포를 checkmate.sdk로 통합 (`html/vercel.json` 제거, 루트 `vercel.json` 신설) | #1 |
| 2026-05-21 | Google OAuth(Supabase) + Google Drive 백업 완전 제거, 로컬 JSON 백업만 유지 | #4 |
| 2026-05-23 | UX 온보딩 1단계: 자산 Empty state, 결제수단 2-열 시각화, 거래 실시간 잔고 미리보기, 설정 탭 카드 번호화·여유자금 미리보기·신규 가이드, 카테고리 행 세그먼트 컨트롤·자연어 고급 설정 | #6 |
| 2026-05-23 | UX 온보딩 2단계: 요약 탭 여유자금 부제·계산식 힌트, 결산 탭 순지출·남음 라벨 평이화 + 설명 note, 자산 카드 현재 잔액 라벨, 내역 탭 빈 상태 CTA 보완·필터 라벨 추가 | #7 |
| 2026-05-23 | UX 온보딩 3단계: 수입 모드 금액 placeholder 모순 수정, 적금 항목 라벨 + 자산 적립 안내, 매도 목적지 라벨 명확화, 백업 복원 덮어쓰기 경고 가시화, 요약 탭 계산식 힌트 위치 조정 | #8 |
| 2026-05-28 | Google 동기화 재도입 (`feature/google-sync`): GIS OAuth 2.0 + Google Drive appDataFolder 자동 동기화, Supabase 미사용, main 브랜치와 분리 관리 | — |
| 2026-06-03 | 전문가용 UI 전환: 온보딩 마법사·가이드 카드·계산식 힌트·자연어 설명 제거, 빈 화면 최소 CTA 유지, 설정 카드 ①②③ 스텝 라벨, SW 캐시 v6 | — |
| 2026-06-05 | 29cm 에디토리얼 전면 리디자인: NanumSquareNeo→Pretendard, 모노크롬+차콜 포인트 토큰, 플랫(헤어라인/그림자 제거), 개인·공동 색 구분 제거, 데이터 도트 뮤트화, `docs/design.md` 신설, SW 캐시 v7 | — |

---

## 9. SDK와의 관계 / 마이그레이션

`html/`은 Vercel(정적 서빙)과 앱인토스 AiT(Vite 빌드 번들) 양쪽의 **단일 소스**다.

- **Vercel**: `buildCommand: ""`, `outputDirectory: "html"` — `html/`을 정적으로 서빙.
- **앱인토스 AiT**: `vite build`(root: html/) → `dist/` → `npm run deploy`. 토스 AiT 계정 인증 필요.
- `html/` 파일 수정 시 두 배포 경로 모두에 반영됨. `html/` 외부에 앱 파일 복제 금지.
- SDK 상세 사양(설정, 빌드 파이프라인, 배포 절차): **[`sdk-spec.md`](./sdk-spec.md)**

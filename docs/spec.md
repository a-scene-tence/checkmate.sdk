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
| 마지막 업데이트 | 2026-05-02 |

---

## 2. 기술 스택

- **프론트엔드**: Vanilla HTML/CSS/JavaScript (빌드 도구 없음)
- **PWA**: Service Worker + `manifest.json`
- **인증**: Supabase OAuth (Google)
- **데이터 저장**:
  - 1차: 브라우저 로컬스토리지
  - 2차: Google Drive 앱 전용 폴더 (`appDataFolder`)
- **외부 의존성**:
  - Supabase JS 라이브러리 (CDN)
  - NanumSquareNeo 웹폰트 (CDN)

---

## 3. 파일 구조 (`html/`)

| 파일 | 크기 | 역할 |
|------|------|------|
| `index.html` | ~223 KB | 메인 앱 (단일 HTML, 인라인 CSS/JS) |
| `auth.html` | ~15 KB | OAuth 콜백 처리 페이지 |
| `privacy.html` | ~13 KB | 개인정보처리방침 |
| `sw.js` | ~1.9 KB | Service Worker |
| `manifest.json` | ~1.6 KB | PWA 메타데이터 |
| `icon-192.png`, `icon-512.png` | - | PWA 아이콘 (maskable 포함) |
| `apple-touch-icon.png`, `favicon.png` | - | iOS / 브라우저 아이콘 |
| `screenshot1~3.png` | - | PWA 설치 시 갤러리용 |

> ⚠️ `html/vercel.json`은 더 이상 존재하지 않음. 라우팅 설정은 루트 `vercel.json` 단일 진실.

---

## 4. 라우팅 (루트 `vercel.json`)

| 패턴 | 대상 |
|------|------|
| `/auth` | `/auth.html` |
| `/auth/callback` | `/auth.html` |
| `/(.*)` | `/$1` (정적 파일 그대로 서빙) |

Vercel 배포 설정:
- `framework: null` — Vite 자동 감지 차단
- `buildCommand: ""` — 빌드 단계 없음 (정적 서빙)
- `outputDirectory: "html"` — `html/` 폴더를 서빙 루트로 지정

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
| 설정 | 계정, 동기화, 백업/복원, 환경설정 |

### 5.5 인증 흐름 (`auth.html`)
- **OAuth 제공자**: Google (Supabase 경유)
- **Supabase Project URL**: `https://mtrnuryyyfjelmwidpxy.supabase.co`
- **흐름**:
  1. 사용자가 "Google로 로그인" 클릭
  2. Supabase Auth로 리다이렉트 → Google OAuth 진행
  3. `/auth/callback`으로 콜백 (URL 해시/쿼리에 `access_token` 또는 `code`)
  4. `auth.html`이 세션 확인 후 `index.html`로 리다이렉트
- **로컬 모드**: Google 계정 없이 브라우저 로컬스토리지만 사용 가능 (가입 없이 즉시 사용)

### 5.6 동기화
- **Google Drive 백업 파일**: `checkmate_backup.json` (앱 전용 폴더 = `appDataFolder`)
- **자동 동기화**: 앱 시작 시 기기 로컬 vs Drive 최신본 비교 → 최신 데이터 채택
- **수동 백업/복원**: 설정에서 JSON 파일 직접 내보내기/불러오기

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
- **캐시 전략**: Network First + Cache Fallback
- **코어 자산** (설치 시 필수 캐시, 실패 시 설치 중단):
  - `index.html`, `auth.html`, `privacy.html`
  - `manifest.json`, 아이콘들
- **선택 자산** (실패해도 설치 계속): 스크린샷 등
- **외부 CDN** (폰트, Supabase JS): 네트워크 우선 → 실패 시 캐시
- **로컬 자산**: 네트워크 시도 → 실패 시 캐시 반환
- **오프라인 지원**: 캐시된 자산은 오프라인 접근 가능

> ⚠️ Service Worker 변경 시 캐시 키 버전을 반드시 증가시킬 것 (사용자 기기에 잔여 캐시 문제 방지)

---

## 7. 개인정보 정책 요약 (`privacy.html`)

| 항목 | 내용 |
|------|------|
| 수집 정보 | 이름, 이메일, 프로필 사진 (민감정보 없음) |
| 저장 위치 | 브라우저 로컬스토리지 + Google Drive 앱 전용 폴더 |
| 백업 파일명 | `checkmate_backup.json` |
| 로컬 모드 | 개인정보 수집 없음 |
| 제3자 공유 | 없음 (분석/광고 미연동) |
| 권한 요청 | 카메라/마이크/위치 미요청 |
| 아동 보호 | 14세 미만 미지원 |
| 변경 알림 | 변경 7일 후 효력 발생 |
| 문의처 | skynjy050@gmail.com |
| 발효일 | 2026-04-10 |

---

## 8. 변경 이력

| 날짜 | 변경 내용 | PR |
|------|-----------|-----|
| 2026-05-02 | 초기 spec 작성 | #2 |
| 2026-05-02 | Vercel 배포를 checkmate.sdk로 통합 (`html/vercel.json` 제거, 루트 `vercel.json` 신설) | #1 |

---

## 9. SDK와의 관계 / 마이그레이션

현재 운영은 본 PWA(`html/`)가 단독 담당. 동일 리포지토리의 `src/`에는 별도의 React + AiT SDK가 존재하며 향후 마이그레이션 대상.

- SDK 상세 사양: **[`sdk-spec.md`](./sdk-spec.md)**
- 마이그레이션 시나리오: `sdk-spec.md` § 10 참조
- 마이그레이션 시점에 본 문서 § 2(기술 스택), § 3(파일 구조), § 4(라우팅) 전면 재작성 필요

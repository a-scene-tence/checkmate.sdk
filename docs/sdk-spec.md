# 체크메이트 SDK 사양서 (Apps in Toss)

> 본 문서는 `checkmate.sdk` 리포지토리 내 `src/` 폴더에 있는 **Apps in Toss(AiT) 기반 React SDK**의 기획·기술 사양을 정의합니다.
>
> 정적 PWA(`html/`)의 사양은 [`spec.md`](./spec.md)를, 작업 규칙은 [`CLAUDE.md`](./CLAUDE.md)를 참조하세요.

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 앱명 (코드) | `check-mate` (`granite.config.ts` 의 `appName`) |
| 디스플레이명 | 체크메이트 |
| 브랜드 색상 | `#00C896` |
| 플랫폼 | **Apps in Toss (AiT)** — 토스 모바일 앱 내 웹 미니앱 |
| 호스트 환경 | 토스 모바일 클라이언트(iOS/Android) 내 WebView 샌드박스 |
| 진입점 | `src/main.tsx` → `<App />` (DOM `#root`) |
| 빌드 산출물 | `dist/`(웹 번들) + `check-mate.ait`(AiT 아티팩트) |
| 현재 상태 | **데모/템플릿 단계** — 본격 기능 미구현. PWA 마이그레이션 대상 |
| 마지막 업데이트 | 2026-05-02 |

---

## 2. 기술 스택

### 2.1 런타임
| 카테고리 | 패키지 | 버전 | 역할 |
|----------|--------|------|------|
| UI 라이브러리 | `react` | ^18.3.1 | 컴포넌트 모델 |
| DOM 렌더러 | `react-dom` | ^18.3.1 | 클라이언트 사이드 렌더링 (`createRoot`) |
| 디자인 시스템 | `@toss/tds-mobile` | ^2.3.0 | Toss Design System(TDS) 모바일 컴포넌트. AiT가 모바일 호스트이므로 모바일 UI 패러다임 사용 |
| AiT 프레임워크 | `@apps-in-toss/web-framework` | ^2.4.7 | AiT 플랫폼 통합. `granite`/`ait` CLI, 호스트 브릿지 API 제공 |

### 2.2 빌드/개발 도구
| 카테고리 | 패키지 | 버전 | 역할 |
|----------|--------|------|------|
| 번들러 | `vite` | ^8.0.10 | dev 서버 + 프로덕션 번들 |
| React 통합 | `@vitejs/plugin-react` | ^6.0.1 | JSX 변환 (Oxc 기반) |
| 언어 | `typescript` | ~6.0.2 | 타입 시스템 |
| 린터 | `eslint` | ^10.2.1 | 코드 품질 검사 |
| TS 린트 | `typescript-eslint` | ^8.58.2 | TS 인식형 린트 규칙 |
| React 훅 린트 | `eslint-plugin-react-hooks` | ^7.1.1 | 훅 사용 규칙 검증 |
| HMR 린트 | `eslint-plugin-react-refresh` | ^0.5.2 | Fast Refresh 호환성 검사 |

---

## 3. 파일 구조

```
checkmate.sdk/
├── html/                 # PWA 단일 소스 — Vercel(정적) + AiT(Vite 빌드) 공통
│   ├── index.html        # 앱 본체 (인라인 CSS/JS, 외부 의존성 없음)
│   ├── sw.js             # Service Worker (CACHE_NAME checkmate-v3)
│   ├── manifest.json     # PWA 매니페스트
│   ├── icon-*.png        # 앱 아이콘
│   └── privacy.html      # 개인정보 처리방침
├── src/                  # React 카운터 데모 (미사용 — 추후 정리 예정)
│   ├── main.tsx
│   └── App.tsx
├── granite.config.ts     # AiT 프레임워크 설정 (브랜드, 호스트, outdir)
├── vite.config.ts        # Vite 설정 — root: html/, 해싱 비활성화, 복사 플러그인
├── tsconfig.json         # 프로젝트 레퍼런스 루트
├── tsconfig.app.json     # 애플리케이션 코드용 TS 설정
├── tsconfig.node.json    # 설정 파일용 TS 설정
├── eslint.config.js      # Flat Config
└── package.json
```

> 📌 `html/`은 **Vercel과 AiT 양쪽의 단일 소스**. Vercel은 정적으로 서빙하고, AiT는 `vite build`(root: html/)로 번들해 `dist/`를 산출한다. 두 배포 경로 모두 `html/`의 파일을 직접 사용하므로 `html/` 외부에 앱 파일을 복제해서는 안 된다.

---

## 4. NPM Scripts

| 명령 | 실제 실행 | 용도 |
|------|-----------|------|
| `npm run dev` | `granite dev` | AiT 개발 서버. 내부적으로 Vite를 래핑하여 `localhost:5173` 기동. AiT 호스트 브릿지 시뮬레이션 포함 |
| `npm run build` | `ait build` | 프로덕션 빌드 → `dist/` + `check-mate.ait` 아티팩트 생성 |
| `npm run lint` | `eslint .` | 전체 ESLint 검사 |
| `npm run preview` | `vite preview` | 빌드 결과물 로컬 프리뷰 |
| `npm run deploy` | `ait deploy` | AiT 플랫폼에 `.ait` 아티팩트 업로드 |

### 4.1 `granite` vs `ait`
둘 다 `@apps-in-toss/web-framework` 패키지에서 제공되는 CLI:
- **`granite`**: 개발 단계 도구. dev 서버, 환경 검사, 로컬 시뮬레이션
- **`ait`**: 배포 단계 도구. 프로덕션 빌드, AiT 플랫폼 배포

---

## 5. 빌드 산출물

### 5.1 `dist/` (Vite 번들)
- `index.html` (Vite가 생성한 entry HTML)
- `assets/*.js`, `assets/*.css` (해시 파일명)
- 일반 SPA 정적 자산

### 5.2 `check-mate.ait`
- AiT 플랫폼이 이해할 수 있는 압축 아티팩트
- 메타데이터(`appName`, 브랜드, 권한 등)와 `dist/` 콘텐츠를 포함
- **2단계 빌드**:
  - `Built for RN 0.84.0` (최신 토스 클라이언트용)
  - `Built for RN 0.72.6` (구버전 호환)
- 빌드 시 `deploymentId` UUID 발급 (예: `019de7c8-2eb2-719d-902c-d487d80d9136`)

> 📌 **RN 버전 의미**: AiT는 React Native WebView 기반. 호스트(토스 앱)의 RN 버전에 따라 사용 가능한 Native API가 달라지므로 멀티 타깃 빌드 수행.

---

## 6. 설정 파일 상세

### 6.1 `granite.config.ts`
```typescript
{
  appName: 'check-mate',
  brand: {
    displayName: '체크메이트',
    primaryColor: '#00C896',
    iconUrl: '...'
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: { dev: 'vite', build: 'vite build' }
  },
  outdir: 'dist',
  permissions: []   // AiT 플랫폼 권한 요청 (카메라, 위치 등)
}
```

### 6.2 `vite.config.ts`
- `root: 'html'` — `html/index.html`이 빌드 엔트리. `src/main.tsx` 불사용.
- `base: './'` — AiT WebView 서빙 경로 불확실 → 상대 경로
- `publicDir: false` — 루트 `public/`(삭제됨)이 `dist/`로 복사되지 않도록
- `assetsInlineLimit: 0` + `assetFileNames: '[name][extname]'` — 해싱 전면 비활성화. `sw.js` CORE_ASSETS와 `manifest.json` icons가 평문 이름으로 에셋을 참조하므로 해싱 시 SW install 실패.
- `copyPwaAssets` 인라인 플러그인 (의존성 추가 없음) — Vite가 탐지하지 못하는 `sw.js`, `privacy.html` 등을 `closeBundle`에서 `dist/`로 복사
- `@vitejs/plugin-react` 제거 — 빌드가 React를 사용하지 않음

### 6.3 TypeScript (`tsconfig.app.json`)
- `target: ES2023`
- `module: esnext`
- `moduleResolution: bundler`
- `jsx: react-jsx` (자동 import)
- 엄격 옵션: `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`

### 6.4 ESLint (`eslint.config.js`)
- Flat Config 방식
- `js.recommended` + `tseslint.recommended` + React Hooks/Refresh 규칙
- `dist/` 제외

---

## 7. 진입 흐름

```
토스 앱 (RN 호스트)
     │
     ▼
WebView 샌드박스
     │
     ▼
index.html (Vite 빌드 결과)
     │
     ▼  html/index.html (인라인 CSS+JS, 외부 의존성 없음)
     │
     │  localStorage('hb5') — 트랜잭션·카테고리·에셋 데이터
     ▼
5개 탭 (요약 / 결산 / 내역 / 자산 / 설정) — 순수 바닐라 JS
```

---

## 8. 권한 모델 (`permissions`)

현재 `granite.config.ts`의 `permissions: []` (빈 배열). 향후 다음 기능을 사용하려면 추가 필요:

| 기능 | 예상 permission 키 | 비고 |
|------|-------------------|------|
| 푸시 알림 | `notification` | 예산 초과 알림 등 |
| 생체 인증 | `biometric` | 잠금 |
| 클립보드 | `clipboard` | 거래 정보 공유 |
| 파일 다운로드 | `file:download` | 백업 JSON 내보내기 |

> ⚠️ 정확한 키 이름과 사용법은 AiT 공식 문서 확인 필요 (현재 미확정).

---

## 9. 현재 구현 상태

- ✅ AiT 프로젝트 스캐폴딩 완료
- ✅ Vite 빌드 환경 구성 (`root: 'html'`, 해싱 비활성화, 복사 플러그인)
- ✅ **`ait build`가 현행 PWA(`html/index.html`)를 번들** — `dist/` + `check-mate.ait` 산출
- ✅ `html/`이 Vercel(정적)·AiT(Vite 빌드) 공통 단일 소스로 정립
- ⚠️ `ait deploy`는 토스 AiT 계정 인증 필요 → 사용자 수동 실행 (`npm run deploy`)
- ❌ `src/` React 카운터 데모는 미사용 상태 (추후 정리 예정)

---

## 10. 배포 전략

### 현재 채택 방향: PWA 웹번들 배포 (2026-05-23 시행)

- `html/index.html`(완성된 기능의 PWA)을 Vite로 번들해 AiT 웹앱으로 배포하는 접근을 채택.
- 이는 문서화된 시나리오 A/B/C의 변형: React 재작성 없이 현행 PWA를 즉시 배포.
- `html/`이 Vercel(정적 서빙)·AiT(`vite build` 번들) 양쪽의 단일 소스.

**AiT 배포 절차** (인증 필요):
```bash
npm ci              # 의존성 설치
npm run build       # dist/ + check-mate.ait 생성
npm run deploy      # 사용자 토스 AiT 계정으로 수동 실행
```

### 향후 선택지

#### 시나리오 A: React + TDS Mobile 재작성
- `src/`의 React 컴포넌트로 PWA 기능 전면 포팅, TDS Mobile UI 적용.
- 대규모 작업. `html/` 역할 종료 후 삭제.

#### 시나리오 B: Vercel도 빌드 결과물 서빙
- `vercel.json`의 `buildCommand: npm run build`, `outputDirectory: dist`로 변경.
- PWA/AiT 동일 번들, `html/` 삭제.

> 시나리오 변경 결정 시 본 문서와 `docs/spec.md`, `docs/CLAUDE.md`를 동시 갱신.

---

## 11. 알려진 제약 / 주의사항

- **React Native peer dependency 충돌 경고**: 빌드 시 `@apps-in-toss/analytics`가 `react@^19.2.3`을 요구하지만 본 프로젝트는 `react@18.3.1`. npm이 자동 오버라이드하므로 빌드는 성공하나, RN 0.85.x 의존 트리에서 잠재적 호환성 이슈 가능. 향후 React 19 업그레이드 검토 필요.
- **CSS @import 위치 경고**: 빌드 로그에서 `@import url(...nanumSquareNeo.css)`가 다른 규칙 뒤에 위치한다는 PostCSS 경고. 동작에는 영향 없으나 정리 권장.
- **deprecated 패키지 다수**: 트랜지티브 의존성에 `glob@7`, `rimraf@2/3`, `inflight` 등 deprecated 패키지 다수. AiT 프레임워크 측 업데이트 대기.

---

## 12. 변경 이력

| 날짜 | 변경 내용 | PR |
|------|-----------|-----|
| 2026-05-02 | 초기 SDK 사양서 작성 | (이 PR) |
| 2026-05-23 | AiT 빌드 파이프라인 정비: Vite root를 `html/`로 재지정, 에셋 해싱 비활성화, 복사 플러그인 추가 — `ait build`가 현행 PWA를 번들하도록 수정. 구버전 루트 `index.html`·`public/` 삭제, `*.ait` gitignore 추가 | #9 |

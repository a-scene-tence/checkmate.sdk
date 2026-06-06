# CLAUDE.md — checkmate.sdk 작업 규칙

> 본 문서는 Claude(또는 모든 작업자)가 `checkmate.sdk` 리포지토리에서 작업할 때 따라야 할 규칙과 누적 학습 기록입니다.
> 작업 시작 전 반드시 본 문서와 [`spec.md`](./spec.md), [`sdk-spec.md`](./sdk-spec.md), [`design.md`](./design.md)를 읽고 시작하세요.

---

## 0. 이 문서의 역할

1. **작업 규칙 정의**: 리포지토리에서 무엇을 해야 하고, 무엇을 절대 하지 말아야 하는지 명시
2. **버그/오류 누적 기록**: 발생한 모든 오류를 §7에 기록하여 동일 실수 반복 방지
3. **사양서 동기화 강제**: 코드 변경 시 `docs/spec.md`, `docs/sdk-spec.md` 동시 업데이트 의무화

---

## 1. 리포지토리 개요

리포지토리는 **두 개의 배포 경로**가 `html/`을 단일 소스로 공유:

| 배포 경로 | 소스 | 방식 | 사양서 |
|-----------|------|------|--------|
| Vercel (웹 PWA) | `html/` | 정적 서빙 (`buildCommand: ""`) | [`spec.md`](./spec.md) |
| 앱인토스 (AiT) | `html/` | Vite 빌드 → `dist/` → `npm run deploy` | [`sdk-spec.md`](./sdk-spec.md) |

**두 배포의 공통 소스**: `html/index.html`과 `html/` 에셋이 **유일한 진실 소스**. Vercel은 직접 서빙, AiT는 `vite build`(root: html/)로 번들 후 `ait deploy`.  
`src/`의 React 카운터 데모는 현재 빌드에서 사용되지 않음(추후 정리 예정).  
`npm run deploy`(= `ait deploy`)는 토스 AiT 계정 인증 필요 — 사용자가 직접 실행해야 함.

> **`main` 브랜치 PWA는 외부 서버 연동 없는 100% 로컬 전용 앱입니다.** 과거에는 Google OAuth(Supabase) + Google Drive 백업이 있었으나 2026-05-21 제거됨 (§ 7.3 참조).
> **`feature/google-sync` 브랜치**는 GIS OAuth + Google Drive 자동 동기화가 추가된 개인용 버전. AiT 빌드는 항상 `main` 기준.

---

## 2. 작업 흐름 (필수)

### 2.1 PWA(`html/`) 작업 시
1. `html/` 폴더 내 파일을 직접 수정
2. 변경사항을 feature 브랜치에 push → PR 생성 → main 머지
3. main 머지 시 Vercel이 자동으로 재배포
4. **기능 추가/변경 시 `docs/spec.md` 해당 섹션을 동시 업데이트**
5. **버그/오류 발생 시 본 문서 §7에 기록**

### 2.2 AiT 빌드 작업 시
1. `html/` 내 파일을 수정 (Vercel과 동일 소스)
2. `npm run dev` (= `granite dev`)로 AiT 환경 로컬 검증 — `localhost:5173`
3. `npm run build` (= `ait build` → `vite build`)로 `dist/` + `check-mate.ait` 생성 확인  
   - `html/index.html` → `dist/index.html`  
   - `sw.js`, `manifest.json`, 아이콘 등이 미해싱 평문 이름으로 `dist/`에 존재하는지 확인
4. feature 브랜치에 push → PR 생성 → main 머지
5. **AiT 배포는 `npm run deploy` (= `ait deploy`)로 수동** — 토스 AiT 계정 인증 필요, Vercel 자동 배포 안 됨
6. **설정 변경 시 `docs/sdk-spec.md` 해당 섹션 동시 업데이트**
7. **버그/오류 발생 시 본 문서 §7에 기록**

---

## 3. 절대 하지 말 것 (Do NOT)

### 3.1 PWA / Vercel 관련
- ❌ **`html/vercel.json` 재생성 금지** — 라우팅 설정은 루트 `vercel.json` 단일 진실. 중복 시 Vercel 동작 예측 불가
- ❌ **루트 `vercel.json`의 `outputDirectory`를 `html` 외 값으로 변경 금지** — 현재 PWA 배포가 즉시 중단됨
- ❌ **루트 `vercel.json`의 `buildCommand`를 `npm run build` 등으로 변경 금지** — Vite가 작동하여 `dist/` 생성, 그러나 `html/` 자산이 아닌 React 데모만 배포됨 (마이그레이션 완료 전까지)
- 🔄 **`main` 브랜치는 이제 Google Drive 동기화 기능 포함** (2026-05-29) — GIS OAuth + Google Drive appDataFolder. AiT 배포 시 Google Client ID 설정 필수
- ❌ **Service Worker(`sw.js`) 캐시 키 무단 변경 금지** — 사용자 기기에 잔여 캐시 충돌 발생. 변경 시 반드시 캐시 버전 숫자 증가
- ❌ **`html/` 외부에 PWA 자산 복제 금지** — `html/`이 Vercel·AiT 공통 단일 소스. 루트나 `public/`에 복사본 두지 말 것 (구 `public/`은 삭제됨, 재생성 금지)
- ❌ **로컬스토리지 키 이름 변경 금지** — 기존 사용자의 데이터가 유실됨. 스키마 마이그레이션이 필요한 경우 마이그레이션 코드 작성 후 수정

### 3.2 SDK / AiT 관련
- ❌ **`granite.config.ts`의 `appName` 변경 금지** — AiT 플랫폼에서 앱 식별자로 사용됨. 변경 시 별도 앱으로 인식되어 사용자 데이터 분리
- ❌ **`granite.config.ts`의 `permissions` 배열 무분별 추가 금지** — 사용하지 않는 권한 요청 시 AiT 심사 거부 가능. 실제 필요 시점에만 추가
- ❌ **`React` 버전을 19로 임의 업그레이드 금지** — `@toss/tds-mobile`, `@apps-in-toss/web-framework` 호환성 미검증. 업그레이드 시 전체 회귀 테스트 필수
- ❌ **`dist/`, `.granite/`, `*.ait` 파일을 git에 커밋 금지** — `.gitignore`에 명시되어 있음
- ❌ **`ait deploy`를 사용자 승인 없이 실행 금지** — 실제 AiT 플랫폼 라이브 배포가 발생

### 3.3 공통
- ❌ **main 브랜치에 직접 push 금지** — 항상 feature 브랜치 → PR → 머지
- ❌ **`docs/spec.md`, `docs/sdk-spec.md`, `docs/CLAUDE.md`를 사양 변경 없이 "정리" 목적으로 단독 수정 금지** — 코드 변경 PR과 함께 갱신

---

## 4. 권장 사항 (Do)

### 4.1 PWA 작업
- ✅ **대형 파일 수정 시**: `html/index.html`은 grep으로 정확한 위치 찾은 후 부분 수정
- ✅ **로컬 검증**: `cd html && python -m http.server 8000`으로 정적 서빙 후 미리보기
- ✅ **라우팅 검증**: PR 머지 전 `/`, `/privacy.html` 정상 응답 확인
- ✅ **Service Worker 변경 시**: 캐시 버전 숫자 증가 (`const CACHE_NAME = 'checkmate-vN'` → `vN+1`)
- ✅ **데이터 스키마 변경 시**: 기존 로컬스토리지 데이터 마이그레이션 코드 작성. JSON 백업/복원 포맷도 함께 갱신

### 4.2 SDK 작업
- ✅ **컴포넌트 추가 시**: `@toss/tds-mobile`의 기존 컴포넌트 사용 우선 검토 (재발명 방지)
- ✅ **빌드 검증**: `npm run build` 성공 + RN 0.84.0 / 0.72.6 두 타깃 모두 빌드되는지 로그 확인
- ✅ **린트 통과**: PR 전 `npm run lint` 0 errors / 0 warnings
- ✅ **TS strict 유지**: `noUnusedLocals`, `noUnusedParameters` 비활성화 금지

### 4.3 공통
- ✅ **PR 제목/본문**: 변경 의도와 영향 범위(PWA / SDK / 공통)를 명확히 기재
- ✅ **사양 변경 시**: 같은 PR에서 해당 spec 문서 동시 수정 (분리 PR 금지)

---

## 5. Vercel 배포 설정 (불변 진실)

루트 `vercel.json` (현재):
```json
{
  "version": 2,
  "framework": null,
  "buildCommand": "",
  "outputDirectory": "html",
  "routes": [
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

각 옵션의 의미:
- `framework: null` → Vercel의 Vite 자동 감지 차단
- `buildCommand: ""` → 빌드 단계 스킵
- `outputDirectory: "html"` → `html/` 폴더를 정적 서빙 루트로 지정
- `routes` → catch-all 만 존재 (auth.html 제거 후 별도 라우팅 없음)

---

## 6. 향후 SDK 마이그레이션 시 가이드

`src/` React 앱을 운영 배포로 전환할 때 (시나리오는 [`sdk-spec.md`](./sdk-spec.md) §10 참조):

1. 루트 `vercel.json` 수정 (시나리오 B의 경우):
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```
2. `html/` 폴더 삭제 또는 `legacy/`로 이동
3. 본 문서 §1, §2, §3, §5 모두 갱신
4. `docs/spec.md` 전반 재작성
5. `docs/sdk-spec.md` § 9, § 10 갱신

---

## 7. 오류 및 버그 기록 (누적 학습용)

> **형식**: 새 버그 발생 시 아래 양식으로 §7.X에 추가. 동일/유사 패턴이 반복되면 §3 "하지 말 것"에 영구 반영.

```markdown
### 7.X [YYYY-MM-DD] 짧은 제목
**증상**: 사용자가 본 현상
**원인**: 근본 원인 (왜 발생했는가)
**해결**: 어떻게 해결했는가
**예방책**: 다음에 같은 실수를 막기 위한 체크리스트
```

---

### 7.1 [2026-05-02] Vercel 신규 프로젝트 배포 시 404 NOT_FOUND

**증상**:
- `checkmate.sdk` 리포지토리를 신규 Vercel 프로젝트로 임포트한 후 사이트 접속 시 404 NOT_FOUND 에러 발생
- Vercel 빌드 로그상으로는 "Deployment completed" 정상 표시

**원인**:
1. `vercel.json` 변경사항이 `main` 브랜치에 머지되지 않은 상태에서 Vercel 프로젝트가 main을 기준으로 배포됨
2. Vercel이 Vite를 자동 감지하여 `npm run build` 실행 → `dist/` 폴더 생성
3. 그러나 사용자가 기대한 `html/` 폴더는 배포되지 않음 → 루트 경로에서 `index.html`을 찾지 못해 404

**해결**:
1. 작업 브랜치(`claude/consolidate-sdk-deployment-H1RJb`)를 main에 머지
2. Vercel이 자동으로 재배포하면서 새 `vercel.json` 적용
3. `outputDirectory: "html"` 설정에 따라 `html/index.html`이 정상 서빙됨

**예방책**:
- ✅ Vercel 신규 프로젝트 생성 **이전에** `vercel.json`이 main 브랜치에 반영되어 있는지 먼저 확인
- ✅ 신규 프로젝트 임포트 후에는 항상 첫 배포 결과(URL 접속)를 확인할 것
- ✅ Production 적용 전 Preview 배포로 라우팅 검증 권장
- ✅ 빌드 로그에서 `Building client environment`, `dist/index.html` 같은 Vite 빌드 흔적이 보이면 `vercel.json`이 제대로 인식되지 않은 것 — 즉시 중단하고 설정 확인

---

### 7.2 [2026-05-02] 로컬 git 명령어로 원격 브랜치 머지 실패

**증상**:
```
merge: claude/consolidate-sdk-deployment-H1RJb - not something we can merge
```

**원인**:
- GitHub MCP로 원격에만 브랜치를 생성했고, 로컬에는 해당 브랜치 추적본이 없는 상태에서 `git merge <branch명>` 실행
- Git은 로컬 ref만 보고 머지 시도하므로 "not something we can merge" 에러 반환

**해결**:
- 옵션 A: `git fetch origin <branch>` 후 `git merge origin/<branch>` 사용
- 옵션 B (실제 적용): GitHub MCP의 `create_pull_request` + `merge_pull_request`로 원격에서 직접 머지

**예방책**:
- ✅ MCP로 만든 원격 브랜치를 머지할 때는 `origin/<branch>` 형식 사용
- ✅ 또는 처음부터 PR 기반 워크플로 사용 (권장: GitHub MCP가 PR을 자동 처리하므로 일관성 유지)

---

### 7.3 [2026-05-21] Google 인증 / Drive 동기화 완전 제거

**상황** (버그 아닌 의사결정 기록):
- PWA는 Supabase OAuth(Google 로그인) + Google Drive 앱 전용 폴더 자동 동기화를 제공하고 있었음
- 외부 서비스 의존성(Supabase URL/Key, Google OAuth Client ID, Drive Scope)이 유지보수 부담
- 개인정보 처리 범위 넓음 (이름/이메일/프로필 수집)

**결정**:
- 외부 인증/동기화 완전 제거 → 100% 로컬 전용 앱으로 전환
- 로컬 JSON 백업/복원만 유지 (기존에 이미 구현되어 있으므로 자연스러운 대체재)
- 기존 Drive 사용자 대상 마이그레이션 안내는 제공하지 않음 (사용자 판단)

**수행**:
- `html/auth.html` 삭제
- `html/index.html`에서 Supabase/Drive/OAuth 관련 코드 전면 제거
- `vercel.json`에서 `/auth`, `/auth/callback` 라우팅 제거
- `html/sw.js` CACHE_NAME v2 → v3 증가
- `html/privacy.html` 전면 개정

**예방책 / 향후 규칙**:
- ✅ 외부 인증/저장 서비스 재도입은 사용자 명시적 요구 시에만으로 제한 (§ 3.1 규칙 적용)
- ✅ 재도입 결정 시 privacy.html, spec.md § 5.5/5.6/7, 본 문서 § 1, § 3.1 모두 사전 갱신
- ✅ 외부 CDN 추가 시 Service Worker 캐시 전략 검토 필수
- ✅ 이전 코드 참조 용도명: `git log --all -- html/auth.html` 또는 PR #4 history 확인

---

### 7.4 [2026-05-22] PR #4 회귀 — cm-modal CSS 누락

**증상**:
- 설정 → "JSON에서 불러오기" 클릭 시 확인 다이얼로그(`백업 복원` 제목, `[취소][확인]` 버튼)가 모달 박스 없이 화면 좌하단 영역 밖에 unstyled raw text로 노출
- 동일 증상: `resetData`(데이터 초기화), 자산/카테고리/내역 삭제 등 `cmConfirm()` 호출 모든 위치

**원인**:
- PR #4에서 `html/index.html`의 Google Drive 관련 CSS 블록(원본 main 라인 386-438)을 연속 범위로 일괄 삭제
- 그 범위 **중간** 라인 401-411에 Drive와 무관한 `#cm-modal-overlay`, `#cm-modal-box` 등 11줄의 커스텀 Confirm/Alert 모달 CSS가 끼어 있었음
- 시작·끝 마커(`/* ── Google Drive 동의 모달 ── */` → `.drive-sync-btn .dsb-desc{...}`)만 확인하고 중간 selector를 검증하지 않아 무관한 CSS가 함께 사라짐
- JS의 `cmConfirm()`과 HTML의 `<div id="cm-modal-overlay">`는 그대로 남아 있어 모달은 DOM에 생성되지만, CSS 부재로 `position:fixed`·`display:flex`·`z-index:9000` 적용 실패 → 일반 흐름(static)에서 body 끝에 텍스트로 노출

**해결**:
- `html/index.html`의 `</style>` 직전에 원본 11줄 CSS를 글자 단위 동일하게 복원

**예방책**:
- ⛔️ **연속 라인 범위 일괄 삭제 금지** — 시작·끝 마커가 명확해도 범위 내 모든 selector/식별자가 삭제 대상에 속하는지 사전 검증할 것
- ✅ 대량 코드 제거 작업 시: `grep -n` 으로 삭제 대상 키워드(`drive-`, `sb-`, `supabase` 등) 매치 라인만 추출 → 그 라인들만 제거. 라인 범위 기반 일괄 삭제는 지양
- ✅ 대량 제거 후 자동 검증 grep에 **무관 잔존 코드의 존재 확인**도 포함 (예: cmConfirm 호출 5건이 있는데 cm-modal CSS가 0건이면 즉시 경고)
- ✅ 시각적 회귀가 우려되는 UI 컴포넌트 변경 시 Vercel Preview에서 모든 cmConfirm 사용처 클릭 테스트 (백업 복원, 데이터 초기화, 자산/카테고리/내역 삭제)

---

### 7.5 [2026-05-23] UX 온보딩 개선 — 마법사 단계 추가의 역효과

**상황**:
- "처음 접한 사람도 설명 없이 쓸 수 있어야 한다"는 요구로 우선순위 1단계 UX 개선 진행
- 1차 시도: 마법사에 고정비 4종(통신·보험·적금·할부) 입력 step-1b를 추가하여 여유자금을 즉시 의미있게 표시하려 함

**문제**:
- 사용자 피드백: "고정 지출을 4개 보여주는 것은 더 헷갈려요"
- 신규 사용자에게 마법사 단계가 늘어날수록 부담이 증가, 도리어 진입 장벽이 됨

**해결 방향 (롤백 + 재설계)**:
1. 마법사는 잔고 입력만 받는 3-step으로 복원
2. 고정비 입력은 설정 탭에서 진행하되, **설정 탭 자체를 신규 사용자가 흐름을 알 수 있게 재설계**:
   - 카드 제목에 번호(1️⃣2️⃣3️⃣) 추가하여 순서 명시
   - 잔고·예산 비어있는 신규 사용자에게만 상단 가이드 카드 자동 표시
   - 잔고 입력 즉시 여유자금 미리보기 표시 (입력 결과를 즉각 체감)
3. 카테고리 행 UI도 클릭 가능성을 시각화:
   - 단일 토글 버튼 → `[📌 고정][📊 평균]` 세그먼트 컨트롤
   - "미설정" 배지 → "예산 미입력" 흐릿한 스타일 (버튼과 구분)
   - "세부 조정" → "고급 설정 (보통은 그냥 두세요)" + 내부 항목 자연어 풀이

**교훈**:
- ⛔️ 온보딩 단계 추가는 직관적 해결책처럼 보이지만 인지 부담 증가로 역효과 가능
- ✅ 마법사는 **최소한의 필수 입력**만 받고, 나머지는 본 화면(설정 탭)에서 시각적 가이드로 안내
- ✅ "처음 사용자도 이해할 수 있게" = 라벨을 자연어로 풀어쓰기 + 클릭 가능 요소를 명확한 토글 UI로 표현
- ✅ 즉각적 피드백(여유자금 미리보기, 거래 모달 잔고 미리보기)이 사용자에게 시스템 동작을 학습시킴

---

### 7.6 [2026-05-28] Google Drive 동기화 재도입 (`feature/google-sync`)

**상황** (버그 아닌 의사결정 기록):
- 앱인토스 게시 완료 후, 개인 기기(모바일/아이패드 등) 간 데이터 동기화 요구
- 사용자가 명시적으로 Google 로그인 + Drive 동기화 재도입 요청 → §3.1 제약 해제

**결정**:
- `main`은 AiT 빌드 소스이자 로컬 전용 PWA로 유지
- `feature/google-sync` 브랜치에서만 Google 동기화 기능 관리
- Supabase 제거 → **GIS (Google Identity Services) 단독** OAuth로 단순화
- Google Drive appDataFolder에 `checkmate_backup.json` 단일 파일로 동기화

**수행**:
- `html/index.html` `<head>`에 GIS CDN 스크립트 추가 (`async defer`)
- JS 상수: `GDRIVE_CLIENT_ID`, `GDRIVE_SCOPE`, `GDRIVE_FILE_NAME`, `GAUTH_STORAGE_KEY`
- 함수: `initGoogleAuth`, `signInWithGoogle`, `signOutGoogle`, `driveLoad`, `driveSave`, `scheduleDriveSave`, `updateSyncUI`
- `save()` 훅: `_driveToken` 있으면 30초 debounce 후 Drive 자동 저장
- 설정 탭 "Google 동기화" 카드 추가 (로그인/연결됨 뷰 토글)
- `html/sw.js` CACHE_NAME v3 → v4

**사용자 직접 수행 필요**:
- Google Cloud 콘솔 → OAuth Client ID `713865118042-...` → Authorized JS origins에 Vercel 도메인 추가
- Vercel Production Branch를 `feature/google-sync`로 전환 (선택)

---

### 7.7 [2026-06-03] 전문가용 UI 전환 — 온보딩·설명 제거

**배경**: 사용자가 "가계부 로직을 전부 이해한 사람이 쓴다"고 전제하고, PR #6~#8에서 추가된 온보딩 마법사·가이드 카드·계산식 힌트·자연어 설명을 전면 제거 요청. 단, 로직의 단계 흐름(①②③)은 유지.

**수행**:
- `openWizard()` → `switchMain('settings')` 스텁으로 교체, 마법사 HTML(#mo-wizard) 완전 삭제
- `#set-guide` 가이드 카드, `#set-flex-preview` 여유자금 미리보기 블록 제거
- 설정 카드 제목: `1️⃣` 등 이모지 번호 → `①②③` 유니코드 순서 기호로 통일
- 개인·공동 카테고리 예산 섹션의 고정/평균 설명 그리드 제거; `renderBudgetSection()` 내 설명 텍스트 제거
- 결산 탭 💡 계산식 note 제거, 대시보드 여유자금 공식 hint 제거
- 거래 모달 `#jnote`·`#tx-preview` HTML 제거; `updatePaymentNote()`, `updateTxPreview()`, `updateFlexPreview()` no-op 스텁으로 교체
- 자산 필드 부가 설명, 백업 안내 note 제거 (덮어쓰기 경고는 유지)
- 빈 화면 CTA: h3+p 제거 → 버튼 1개만 유지
- placeholder 간결화: `inp-amt` → "금액", `inp-desc` → "내용", 검색 → "검색", `liq-desc` → "내용", 예산 입력 → "금액"
- `html/sw.js` CACHE_NAME v5 → v6

**예방책**: 온보딩 텍스트·마법사 재추가는 사용자 명시 요청 시에만. 빈 화면 최소 CTA(`openWizard()` 버튼)는 유지하여 첫 진입 경험 완전 차단 방지.

---

### 7.9 [2026-06-06] 이모지 → 모노크롬 라인 아이콘 전환 + 캐주얼 요소 정리

**배경** (의사결정 기록): 29cm 리디자인 후에도 화면이 "캐주얼"해 보이는 주원인이 **이모지 아이콘**(카테고리·자산·UI ~50개)과 **컬러 타일/pill 형태**였음. 에디토리얼 느낌 강화를 위해 전면 교체.

**결정**:
- 아이콘: 이모지 → **차콜 단색 SVG 라인 아이콘**(인라인 SVG, 의존성 없음, Lucide 류 기하학).
- 컬러 타일: 자산 아이콘 뒤 컬러 타일 제거(모노크롬). 거래 아이콘 틴트 → 수입=`--olt` 그린 / 지출=`--s2` 중립.
- 카테고리 도트(`.cdot`/`.srow-dot`): 저채도 색 유지(스캔성 보조).
- 라디우스: `.chip`/`.txftab`/`.srow-type`/`.brow-typebtn` pill→`--radius-sm`(4px) 샤프닝.
- 마이크로카피: 구어체("~어요") → 선언형 명사형(에디토리얼 톤).

**비파괴 원칙**: 로컬스토리지 `emoji` 필드 **변경 없음**. `gi()`/`giL()` 헬퍼가 렌더 시점에 E2I 매핑으로 SVG 변환. 매핑 없는 커스텀 이모지는 원래 이모지 폴백 → 기존 사용자 데이터 100% 보존.

**수행**: ICON(35슬러그)/E2I/gi/giL JS 레지스트리 추가 → CSS `.ic`/`.ic-lg` 추가 → 렌더 사이트(~20곳) `${c.emoji}` → `${gi(c.emoji)}` 교체 → 자산/거래 컬러 타일 제거 → 결산 행 typeBadge 제거(좁은 열에서 이름 가림 해소) → 라디우스 샤프닝 5곳 → SW v8→v9.

**교훈/예방책**: 이모지→라인 아이콘 전환은 로컬스토리지 스키마 불변 원칙과 충돌 없이 **렌더 레이어에서만** 처리 가능. 신규 카테고리/자산 추가 시 E2I 매핑도 함께 확장할 것. 아이콘 추가 시 `ICON` dict에 슬러그 추가 후 `E2I`에 이모지→슬러그 매핑 등록. `design.md §3` 참조.

---

### 7.8 [2026-06-05] 29cm 에디토리얼 리디자인 — 폰트/토큰 전면 교체

**배경** (의사결정 기록): Toss 스타일(블루/퍼플, 라운드, 그림자)에서 **29cm 스타일**(모노크롬 + 차콜 포인트, 플랫, 에디토리얼)로 전체 재편성. 디자인 시스템은 신규 `docs/design.md`로 관리.

**결정**:
- 컬러: 모노크롬 + 포인트 1개 = 차콜 `#111111`. 기능색(수입 그린/위험 레드/경고 오렌지)만 유지.
- 폰트: NanumSquareNeo → **Pretendard** (`@import` 제거, `<head>` `<link>`로 비차단 로드).
- 개인/공동 색 구분 제거 → 라벨·굵기로만 구분(`--p`·`--j` 모두 차콜로 리맵).
- 플랫: `--shadow:none`, 헤어라인 보더, 카드 호버 리프트 제거, radius 20→8.

**수행**: `:root` 토큰 리맵(키스톤) → 컴포넌트 CSS 재스타일 → 하드코딩 색/그라데이션 스윕 → 숫자 Arial→tabular-nums → SW v6→v7 → `design.md` 신설 + spec/CLAUDE 동기화.

**교훈/예방책**: **`var()` 토큰 리맵이 인라인 `var(--p)` 사용처(~49곳)를 자동 변환하지만, 하드코딩 hex(약 30개: 예산타입 배지 #5555AA/#F0F0FF, 자산 그라데이션 #1A3A5C/#2D5016, 토스트, 데이터 팔레트 등)는 변환되지 않아 수동 스윕 필요.** 향후 신규 스타일은 반드시 토큰(`var(--*)`)을 사용하고 hex 직접 입력 금지. 색 변경 시 `grep "#[0-9A-Fa-f]{6}"`로 잔존 확인. 데이터 식별색(카테고리/자산 도트)은 `design.md §10`의 유일한 예외.

---

## 8. 문서 업데이트 트리거

다음 작업을 수행한 경우 반드시 해당 문서를 업데이트하세요:

| 작업 | 업데이트 대상 |
|------|---------------|
| `html/` 내 파일 추가/삭제 | `docs/spec.md` §3 |
| PWA에 새 기능 추가 (탭, 뷰 등) | `docs/spec.md` §5 |
| `html/manifest.json` 변경 | `docs/spec.md` §6.1 |
| Service Worker 캐시 전략 변경 | `docs/spec.md` §6.2, `docs/CLAUDE.md` §3.1 (필요 시) |
| 개인정보 정책 변경 | `docs/spec.md` §7, `html/privacy.html` |
| `vercel.json` 변경 | `docs/spec.md` §4, `docs/CLAUDE.md` §5 |
| 외부 의존성 추가 (CDN, 서비스) | `docs/spec.md` §2, `docs/CLAUDE.md` §3.1 검토 |
| 디자인 토큰/컴포넌트 스타일 변경 | `docs/design.md` (해당 섹션) |
| 외부 폰트(CDN) 변경 | `docs/spec.md` §2 + `docs/design.md` §3 |
| 외부 인증/저장 서비스 재도입 | 독립 PR + 사용자 승인 필수 → 본 문서 전면 갱신 |
| `src/` 컴포넌트/로직 변경 | `docs/sdk-spec.md` §3, §7 |
| `package.json` dependency 변경 | `docs/sdk-spec.md` §2 |
| `granite.config.ts` 변경 | `docs/sdk-spec.md` §6.1 |
| `vite.config.ts` / `tsconfig.*` 변경 | `docs/sdk-spec.md` §6.2 / §6.3 |
| AiT 권한 추가 | `docs/sdk-spec.md` §8 |
| 신규 버그 발생 → 수정 | `docs/CLAUDE.md` §7 |

---

## 9. 빠른 체크리스트 (PR 머지 전)

### 9.1 모든 PR 공통
- [ ] 변경 의도와 영향 범위(PWA/SDK/공통)를 PR 본문에 명시했는가?
- [ ] 사양 문서(`spec.md` 또는 `sdk-spec.md`) 관련 섹션을 함께 수정했는가?
- [ ] 새 버그를 만났다면 `CLAUDE.md` §7에 기록했는가?
- [ ] main에 직접 push하지 않고 feature 브랜치 → PR 흐름을 지켰는가?

### 9.2 PWA(`html/`) PR
- [ ] `html/vercel.json`을 새로 만들지 않았는가?
- [ ] 루트 `vercel.json`의 `outputDirectory`를 변경하지 않았는가?
- [ ] Service Worker 변경 시 캐시 버전을 올렸는가?
- [ ] 로컬에서 정적 서버로 검증했는가?
- [ ] 외부 인증/저장 서비스 재도입이 없는가? (있다면 사용자 승인 받았는가?)

### 9.3 SDK(`src/`) PR
- [ ] `npm run lint` 통과 (0 errors)?
- [ ] `npm run build` 성공? (RN 0.84.0 / 0.72.6 둘 다)
- [ ] `granite.config.ts`의 `appName` 변경하지 않았는가?
- [ ] `dist/`, `.granite/`, `*.ait`을 git에 커밋하지 않았는가?
- [ ] React 19로 업그레이드하지 않았는가?

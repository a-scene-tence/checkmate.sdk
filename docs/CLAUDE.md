# CLAUDE.md — checkmate.sdk 작업 규칙

> 본 문서는 Claude(또는 모든 작업자)가 `checkmate.sdk` 리포지토리에서 작업할 때 따라야 할 규칙과 누적 학습 기록입니다.
> 작업 시작 전 반드시 본 문서와 `docs/spec.md`를 읽고 시작하세요.

---

## 0. 이 문서의 역할

1. **작업 규칙 정의**: 리포지토리에서 무엇을 해야 하고, 무엇을 절대 하지 말아야 하는지 명시
2. **버그/오류 누적 기록**: 발생한 모든 오류를 §7에 기록하여 동일 실수 반복 방지
3. **사양서 동기화 강제**: 코드 변경 시 `docs/spec.md` 동시 업데이트 의무화

---

## 1. 리포지토리 개요

- **운영 중인 영역**: `html/` 정적 PWA — Vercel에 자동 배포 중 (사용자가 실제로 사용)
- **마이그레이션 대상**: `src/` React + AiT(Apps in Toss) SDK — 현재 데모 수준
- **두 영역의 관계**: 루트 `vercel.json` 설정에 따라 **현재는 `html/`만 배포됨**
- **상세 사양**: `docs/spec.md` 참조

---

## 2. 작업 흐름 (필수)

1. `html/` 폴더 내 파일을 직접 수정
2. 변경사항을 브랜치에 push → PR 생성 → main 머지
3. main 머지 시 Vercel이 자동으로 재배포
4. **기능 추가/변경 시 `docs/spec.md` 해당 섹션을 동시 업데이트**
5. **버그/오류 발생 시 본 문서 §7에 기록**

---

## 3. 절대 하지 말 것 (Do NOT)

- ❌ **`html/vercel.json` 재생성 금지** — 라우팅 설정은 루트 `vercel.json` 단일 진실. 중복 시 Vercel 동작 예측 불가
- ❌ **루트 `vercel.json`의 `outputDirectory`를 `html` 외 값으로 변경 금지** — 현재 PWA 배포가 즉시 중단됨
- ❌ **루트 `vercel.json`의 `buildCommand`를 `npm run build` 등으로 변경 금지** — Vite가 작동하여 `dist/` 생성, 그러나 `html/` 자산이 아닌 React 데모만 배포됨 (마이그레이션 완료 전까지)
- ❌ **`html/index.html`의 인라인 Supabase URL/Key 무단 변경 금지** — 변경 시 `docs/spec.md` §5.5 동시 갱신 필수
- ❌ **Service Worker(`sw.js`) 캐시 키 무단 변경 금지** — 사용자 기기에 잔여 캐시 충돌 발생. 변경 시 반드시 캐시 버전 숫자 증가
- ❌ **공개 디렉토리(`public/`)에 중복 PWA 자산 추가 금지** — 현재 `public/`은 Vite용이며 Vercel 배포 시 사용되지 않음. 혼란 방지를 위해 `html/`만 단일 진실로 유지
- ❌ **main 브랜치에 직접 push 금지** — 항상 feature 브랜치 → PR → 머지

---

## 4. 권장 사항 (Do)

- ✅ **대형 파일 수정 시**: `html/index.html`(223KB)은 grep으로 정확한 위치 찾은 후 부분 수정
- ✅ **로컬 검증**: 변경 후 정적 서버로 미리보기 (예: `cd html && python -m http.server 8000`)
- ✅ **라우팅 검증**: PR 머지 전 `/`, `/auth`, `/auth/callback`, `/privacy.html` 모두 정상 응답하는지 확인
- ✅ **Service Worker 변경 시**: 캐시 버전 숫자 증가 (`const CACHE_NAME = 'checkmate-vN'` → `vN+1`)
- ✅ **PR 제목/본문**: 변경 의도와 영향 범위를 명확히 기재
- ✅ **사양 변경 시**: 같은 PR에서 `docs/spec.md`도 함께 수정 (분리 PR 금지)

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
    { "src": "/auth", "dest": "/auth.html" },
    { "src": "/auth/callback", "dest": "/auth.html" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

각 옵션의 의미:
- `framework: null` → Vercel의 Vite 자동 감지 차단
- `buildCommand: ""` → 빌드 단계 스킵
- `outputDirectory: "html"` → `html/` 폴더를 정적 서빙 루트로 지정
- `routes` → `/auth`, `/auth/callback`이 `auth.html`로 라우팅, 나머지는 그대로

---

## 6. 향후 SDK 마이그레이션 시 가이드

`src/` React 앱을 운영 배포로 전환할 때:

1. 루트 `vercel.json` 수정:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```
2. `html/` 폴더 삭제 또는 `legacy/`로 이동
3. 본 문서 §1, §2, §3, §5 모두 갱신
4. `docs/spec.md` 전반 재작성

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

## 8. 문서 업데이트 트리거

다음 작업을 수행한 경우 반드시 해당 문서를 업데이트하세요:

| 작업 | 업데이트 대상 |
|------|---------------|
| `html/` 내 파일 추가/삭제 | `docs/spec.md` §3 |
| 새 기능 추가 (탭, 뷰, 인증 흐름 등) | `docs/spec.md` §5 |
| `vercel.json` 변경 | `docs/spec.md` §4, `docs/CLAUDE.md` §5 |
| Service Worker 캐시 전략 변경 | `docs/spec.md` §6.2, `docs/CLAUDE.md` §3 (필요 시) |
| 외부 의존성 추가 (Supabase, Drive 외 신규) | `docs/spec.md` §2 |
| `manifest.json` 변경 | `docs/spec.md` §6.1 |
| 개인정보 정책 변경 | `docs/spec.md` §7 |
| 신규 버그 발생 → 수정 | `docs/CLAUDE.md` §7 |

---

## 9. 빠른 체크리스트 (PR 머지 전)

- [ ] `docs/spec.md` 관련 섹션이 변경되었는가?
- [ ] 새 버그를 만났다면 `docs/CLAUDE.md` §7에 기록했는가?
- [ ] `html/vercel.json`을 새로 만들지 않았는가?
- [ ] 루트 `vercel.json`의 `outputDirectory`를 변경하지 않았는가?
- [ ] Service Worker 변경 시 캐시 버전을 올렸는가?
- [ ] 로컬에서 정적 서버로 검증했는가?
- [ ] PR 본문에 변경 의도와 영향 범위를 명시했는가?

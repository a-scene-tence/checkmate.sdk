# design.md — 체크메이트 디자인 시스템 (29cm 에디토리얼)

> 본 문서는 `checkmate.sdk/html/index.html`(단일 파일 PWA "체크메이트")의 **시각 디자인 시스템**을 정의한다.
> 디자인 토큰·컴포넌트 스타일을 변경할 때 본 문서를 반드시 함께 갱신한다.
>
> 관련 문서: 기능 사양 [`spec.md`](./spec.md) · 작업 규칙 [`CLAUDE.md`](./CLAUDE.md)
> 마지막 업데이트: 2026-06-06 (이모지 → 모노크롬 라인 아이콘 전환 + 캐주얼 요소 정리)

---

## 1. 디자인 원칙

1. **모노크롬 + 단일 포인트**: 블랙/화이트/그레이 + 포인트 1개(차콜 `#111111`). 강조·버튼·활성 상태는 차콜.
2. **기능색은 가독성 위해 유지**: 수입=그린, 위험/초과=레드, 경고=오렌지. UI 크롬에는 절대 쓰지 않고 데이터/상태 표시에만.
3. **플랫**: 그림자 대신 헤어라인 보더(`1px var(--border)`). `--shadow:none`. 예외는 FAB·토스트·팝업 오버레이만.
4. **여백 우선**: 넉넉한 패딩과 행간으로 위계를 만든다. 장식 대신 공백.
5. **타이포가 주인공**: Pretendard. 제목은 굵게(800), 본문은 보통(400~500), 숫자는 tabular.
6. **개인/공동은 색으로 구분하지 않는다**: 라벨·굵기·위치로만 구분(§7).

---

## 2. 컬러 토큰 (`:root`)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--bg` / `--surface` / `--card` | `#FFFFFF` | 캔버스·카드 (에디토리얼 화이트) |
| `--s2` | `#F7F7F8` | 옅은 채움(토글 배경, 보조 칩) |
| `--border` | `#EAEAEA` | 헤어라인 보더·구분선 |
| `--text` | `#111111` | 주 텍스트 **+ 포인트 컬러**(버튼·활성·FAB) |
| `--muted` | `#8A8A8E` | 보조 텍스트·라벨 |
| `--g1`~`--g5` | `#FAFAFA` `#F2F2F2` `#E5E5E5` `#C7C7CC` `#6E6E73` | 그레이 램프(배지·비활성·세그먼트) |
| `--p` / `--plt` | `#111111` / `#F2F2F2` | (구 개인 블루) → 차콜. 인라인 `var(--p)` 자동 변환 |
| `--j` / `--jlt` | `#111111` / `#F2F2F2` | (구 공동 퍼플) → 차콜. 색 구분 제거 |
| `--danger` / `--dlt` | `#F04452` / `#FCECEE` | 위험·초과·삭제 |
| `--warn` / `--wlt` | `#FF9500` / `#FFF4E5` | 경고 |
| `--ok` / `--olt` | `#00B884` / `#E6F7F1` | 수입·성공 |
| `--hairline` | `1px solid var(--border)` | 공통 보더 |
| `--radius` / `--radius-sm` / `--radius-pill` | `8px` / `4px` / `999px` | 카드 / 인풋·배지 / 칩·FAB·프로그레스 |
| `--shadow` / `--shadow-soft` | `none` / `0 1px 2px rgba(0,0,0,.04)` | 플랫 기본 / 예외용 |

> `--p`·`--j`를 차콜로 리맵해 마크업/JS의 기존 `var(--p)`·`var(--j)`·`var(--plt)`·`var(--jlt)` 사용처가 자동 변환된다.

---

## 3. 아이콘 시스템

### 3.1 라인 아이콘 레지스트리 (`ICON` / `E2I`)

- **ICON**: `{ slug: '<path .../>' }` — JS 상수. Lucide 류 기하학, 24×24 viewBox, `stroke:currentColor; fill:none; stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round`. 의존성 없음(인라인 SVG).
- 등록 슬러그(35개): 카테고리 `utensils·coffee·bus·car·phone·scissors·piggy·shield·film·wrench·card·box·wallet·flame·building·home·bank`; 자산 `coin·medal·chart-line·chart-bar`; UI `user·users·search·x·arrow-up·arrow-down·pencil·trash·upload·download·calendar·list·cloud·folder·key·refresh·gear·target·pin·star·ban·plus·inbox`.
- **E2I**: `{ '🍽️':'utensils', ... }` — 이모지 문자열 → ICON 슬러그 매핑.
- **gi(emoji)**: 이모지→`<svg class="ic">` 헬퍼. E2I 매핑 없는 커스텀 이모지는 원래 이모지로 폴백(사용자 데이터 보존).
- **giL(emoji)**: `.ic-lg` 버전(타일·카드 컨텍스트용).

### 3.2 아이콘 CSS

```css
.ic   { width:1.05em; height:1.05em; vertical-align:-.15em; stroke:currentColor; fill:none;
        stroke-width:1.6; stroke-linecap:round; stroke-linejoin:round; flex-shrink:0; }
.ic-lg{ width:20px; height:20px; stroke-width:1.5; }
```

`currentColor` 상속으로 별도 색 지정 없이 차콜(`--text`)/뮤트 컨텍스트를 자동 따름.

### 3.3 비파괴 이모지 마이그레이션 원칙

로컬스토리지 `emoji` 필드는 **그대로 유지**(이모지 문자열 저장). 렌더 시점에 `gi()`/`giL()`이 SVG로 변환. E2I에 없는 커스텀 이모지는 원래 이모지로 표시되어 기존 사용자 데이터가 유실되지 않는다.

---

## 4. 타이포그래피

- **폰트**: `Pretendard` (CDN `cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.css`),
  폴백 `-apple-system, system-ui, sans-serif`.
- **숫자**: 전역 `font-variant-numeric:tabular-nums` (구 Arial 통화 폰트 제거). 금액 정렬 일관성 확보.
- **기본**: 14px / line-height 1.5 / `letter-spacing:-0.01em`.

| 용도 | size | weight |
|------|------|--------|
| 잔액 대형(`.balamt`) | 34px | 800 (`-1.2px`) |
| 자산 총액(`.asset-total .amount`) | 30px | 800 |
| 앱 타이틀(`.htitle`) | 18px | 800 |
| 카드 제목(`.ctitle`) | 14px | 800 |
| 본문 | 13~14px | 400~500 |
| 라벨·보조(`.fl`, `.muted`) | 11~12px | 500 |

---

## 5. 스페이싱 & 라디우스

- **스페이싱**: 8pt 기반(2/4/6/8/10/12/14/16/18/20/24). 카드 패딩 `20px 18px`.
- **라디우스**: 카드·버튼·토글 = `--radius`(8), 인풋·배지·칩·필터탭·타입배지 = `--radius-sm`(4), FAB·프로그레스바 = `--radius-pill`(999).
  바텀시트 `16px 16px 0 0`, 모달 박스 12~16px(예외).
- **칩/필 형태**: 에디토리얼 느낌을 위해 `.chip`/`.txftab`/`.srow-type`/`.brow-typebtn` 등 pill 라디우스를 `--radius-sm`(4px)으로 샤프닝. FAB·프로그레스는 pill 유지.

---

## 6. 보더 vs 섀도우

- **헤어라인 우선**: 카드·인풋·자산카드·세그먼트는 `border:var(--hairline)`, `box-shadow:none`.
- **그림자 예외(엘리베이션 필요)**: FAB(`0 4px 16px`), 토스트, 월 피커/Google 메뉴/cm-modal 팝업(스크림 위 부유).
- **호버**: 카드 리프트(translateY) 제거 → `border-color:var(--g4)`만. `:active` 마이크로 스케일 피드백은 유지.

---

## 7. 컴포넌트 스펙

| 컴포넌트 | 스펙 |
|----------|------|
| `.card` | 화이트 + 헤어라인, radius 8, 패딩 20/18, 그림자 없음 |
| 기본 버튼 `.bsub` | 차콜 배경 + 화이트, radius 8, weight 700 |
| 아웃라인 `.btn-outline` | 헤어라인, hover 시 차콜 |
| 토글 `.tg/.tb` | 그레이 트랙, 활성 = 화이트+헤어라인+weight 700+**밑줄**(offset 3px, 그림자 없음) |
| 인풋 `.fi/.sinp` | 화이트 + 헤어라인, radius 4, focus 차콜 보더 |
| 금액 연산자 버튼 `.amt-op` | 헤어라인 + radius 4, 36px 폭, 금액칸 계산식 입력용(`− + × ÷ ⌫`). `.amt-expr`=뮤트 `= ₩…` 미리보기(오류 시 `--danger`) |
| 칩 `.chip` | **radius 4(샤프)**, 미선택 아웃라인 / 선택(`.sp/.sj`) = 차콜 채움+화이트 |
| 필터탭 `.txftab` | radius 4 |
| 타입배지 `.srow-type` | radius 4 |
| 즐겨찾기 버튼 `.fav-btn` | radius 8 |
| 상단탭 `.ntab` | 활성 = 차콜 텍스트+차콜 언더라인, 비활성 `--g4` |
| 서브탭 `.stab` | 개인/공동 동일 차콜 언더라인, **굵기로 구분**(비활성 500 / 활성 800) |
| 프로그레스 `.pfill` | p-ok/j-ok = 차콜, warn/over = 기능색 |
| 배지 `.badge` | radius 4, 결제수단(b-card/cash/acc) 전부 그레이, 수입(b-income) 그린 |
| 예산타입 배지 | 평균 = 차콜 텍스트(`--plt`), 고정 = 그레이(`--g5/--g2`) |
| 자산 아이콘 `.asset-icon` | **컬러 타일 없음** — 배경·라디우스 제거, 차콜 라인 아이콘(24px)만 |
| 거래 아이콘 `.txicon` | 수입 = `--olt` 그린 틴트, 지출/이체 = `--s2` 중립(컬러 틴트 제거) |
| 바텀시트 `.mb/.mh` | radius 16 상단, 핸들 유지, 슬라이드·스와이프 닫기 유지 |
| FAB | 차콜 원형, 그림자 `0 4px 16px` |
| 자산 총액 카드 | (구 그라데이션) → 차콜 블록 + 화이트 텍스트 |
| 토스트 | success=ok / error=danger / warning=warn / info=차콜 |

---

## 8. 개인 vs 공동 표현 규칙

- **색으로 구분 금지.** 구 개인=블루·공동=퍼플은 모두 차콜로 통일.
- 구분은 **탭 라벨("개인"/"공동")·활성 굵기·위치**로만.
- `var(--p)`/`var(--j)`/`var(--plt)`/`var(--jlt)`는 동일 차콜 토큰을 가리키므로 신규 코드에서 둘을 색으로 나누지 말 것.

---

## 9. 기능색 사용 규칙

- **수입 = `--ok`(그린)**, **지출/위험/초과 = `--danger`(레드)**, **경고 = `--warn`(오렌지)**.
- 가독성·상태 전달 목적에만 사용. 버튼·탭·카드 등 크롬에는 사용하지 않는다.

---

## 10. Do / Don't

**Do**: 헤어라인 보더, 차콜 강조, tabular 숫자, 넉넉한 여백, 굵기로 위계, 라인 아이콘.
**Don't**: 그라데이션, 20px 라운드, 무거운 그림자, 블루/퍼플 계정 구분색, 장식적 색, 이모지 아이콘, 컬러 타일(자산·거래 아이콘 뒤).

---

## 11. 카테고리/자산 데이터 컬러 정책

- **카테고리 식별 도트(`.cdot`/`.srow-dot`)**: 데이터 스캔성 보조 목적의 유일한 컬러 예외. 저채도 에디토리얼 톤으로 제한(`PC`/`JC` 팔레트 뮤트 톤).
- **자산·거래 아이콘**: 컬러 타일 없음. `.asset-icon` 배경 제거, `.txicon` 수입=`--olt` 그린 / 지출=`--s2` 중립.
- 신규 카테고리/자산 기본색은 차콜(`#111111`) 또는 위 뮤트 팔레트 범위에서 선택.
- `DEF_ASSETS` 색은 뮤트 톤으로 재정의됨.

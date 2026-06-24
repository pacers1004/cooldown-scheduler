# Feature 02: Cooldown Auto Post (쿨다운 자동 게시)

## 개요
- **기능**: 매일 9회 쿨다운 게시글 자동 생성
- **스케줄러**: ~~GitHub Actions~~ → **cron-job.org** (2026-06-17 전환 완료)
- **GitHub**: `pacers1004/cooldown-scheduler`
- **로컬**: `~/cooldown-scheduler/`

## ⚠️ 실제 구조 (2026-06-24 감사로 정정)
**이 레포는 사실상 죽음.** cron-job.org 7개 잡은 전부 **Vercel `/api/cooldown`** 를 침 (Bubble 직접 아님). 이 레포의 `examples.json`(139개)도 라이브에서 안 읽힘 — 라이브는 `weather-app/api/examples.json`(148개)만 사용.

```
[실제 라이브 흐름]
cron-job.org (7개 잡, 타이밍)
  → POST https://weather-app-pied-theta.vercel.app/api/cooldown   ← Vercel
  → api/cooldown.js: examples.json(148) + Claude API로 글 생성
  → Bubble create_cooldown_post_v2 DB 저장
```
> 상세는 `weather-app/CLAUDE.md` Feature 02-B 참고. 이 레포 코드/examples.json은 미사용(아카이브 검토).

<details><summary>구버전(틀린) 흐름 — 기록용</summary>

```
cron-job.org → POST https://pacers.kr/api/1.1/wf/create_cooldown_post → Bubble가 Claude 호출
```
실제로 이렇게 동작하지 않음.
</details>

## 실행 시간 (KST) — 7회/일 (2026-06-22 변경)
06:00 / 08:00 / 10:00 / 12:00 / 15:00 / 18:00 / 21:00

## cron-job.org 설정 (2026-06-17 전환)
- **계정**: bimhara@gmail.com
- **대시보드**: https://console.cron-job.org/dashboard
- **API Key**: `6rYWbCOR6oIWjQDRGtJAwIFSzwgY39CAsm3HjRku6hY=`
- **전환 이유**: GitHub Actions 무료 플랜 큐 지연 (최대 17시간) → 새벽에 9개 몰려서 게시되는 문제
- **주의**: 60일간 로그인 안 하면 계정 비활성화 → 2달에 한 번 대시보드 접속 필요

### 등록된 Job ID (7개, 2026-06-22 업데이트)
| 시간 (KST) | UTC | Job ID |
|---|---|---|
| 06:00 | 21:00 | 7842745 |
| 08:00 | 23:00 | 7842747 |
| 10:00 | 01:00 | 7842760 |
| 12:00 | 03:00 | 7842749 |
| 15:00 | 06:00 | 7842751 |
| 18:00 | 09:00 | 7842762 |
| 21:00 | 12:00 | 7842763 |

### cron-job.org API로 작업하기
```bash
# 전체 잡 목록 조회
curl -s "https://api.cron-job.org/jobs" \
  -H "Authorization: Bearer 6rYWbCOR6oIWjQDRGtJAwIFSzwgY39CAsm3HjRku6hY="

# 특정 잡 수동 실행 (테스트용)
curl -s -X POST "https://api.cron-job.org/jobs/{jobId}/run" \
  -H "Authorization: Bearer 6rYWbCOR6oIWjQDRGtJAwIFSzwgY39CAsm3HjRku6hY="

# 새 잡 추가 (PUT 메서드)
curl -s -X PUT "https://api.cron-job.org/jobs" \
  -H "Authorization: Bearer 6rYWbCOR6oIWjQDRGtJAwIFSzwgY39CAsm3HjRku6hY=" \
  -H "Content-Type: application/json" \
  -d '{"job":{"url":"https://pacers.kr/api/1.1/wf/create_cooldown_post","enabled":true,"title":"Pacers Cooldown HH:MM KST","schedule":{"timezone":"UTC","hours":[H],"minutes":[M],"mdays":[-1],"months":[-1],"wdays":[-1]},"requestMethod":1,"extendedData":{"headers":{"Authorization":"Bearer 36aa51d61c70995e64e40de1f78a3fa6","Content-Type":"application/json"},"body":"{}"}}}'
```

## Bubble API
- **URL**: `https://pacers.kr/api/1.1/wf/create_cooldown_post`
- **Token**: `36aa51d61c70995e64e40de1f78a3fa6`
- **Method**: POST, body `{}` 비워도 됨

## GitHub Actions (비활성 상태 ✅)
- `cooldown.yml` — `schedule:` 제거 완료 (2026-06-17), `workflow_dispatch`(수동)만 남음
- cron-job.org가 단독으로 9회 실행 중 → 중복 없음

## 주요 파일
- `.github/workflows/cooldown.yml` — 구 스케줄러 (schedule 제거 예정)
- `index.js` — 로컬 테스트용 (미사용)

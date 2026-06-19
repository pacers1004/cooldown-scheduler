# Feature 02: Cooldown Auto Post (쿨다운 자동 게시)

## 개요
- **기능**: 매일 9회 쿨다운 게시글 자동 생성
- **스케줄러**: ~~GitHub Actions~~ → **cron-job.org** (2026-06-17 전환 완료)
- **GitHub**: `pacers1004/cooldown-scheduler`
- **로컬**: `~/cooldown-scheduler/`

## 구조
```
cron-job.org (타이밍 담당)
  → POST https://pacers.kr/api/1.1/wf/create_cooldown_post
  
Bubble 워크플로우 (콘텐츠 담당)
  → Step 1: Claude API로 게시글 생성 (claude-sonnet-4-6)
  → Step 2: Cooldown_post DB 저장
```

## 실행 시간 (KST)
06:00 / 07:17 / 09:43 / 11:08 / 12:51 / 14:29 / 16:14 / 18:37 / 20:22

## cron-job.org 설정 (2026-06-17 전환)
- **계정**: bimhara@gmail.com
- **대시보드**: https://console.cron-job.org/dashboard
- **API Key**: `6rYWbCOR6oIWjQDRGtJAwIFSzwgY39CAsm3HjRku6hY=`
- **전환 이유**: GitHub Actions 무료 플랜 큐 지연 (최대 17시간) → 새벽에 9개 몰려서 게시되는 문제
- **주의**: 60일간 로그인 안 하면 계정 비활성화 → 2달에 한 번 대시보드 접속 필요

### 등록된 Job ID
| 시간 (KST) | UTC | Job ID |
|---|---|---|
| 06:00 | 21:00 | 7842745 |
| 07:17 | 22:17 | 7842747 |
| 09:43 | 00:43 | 7842760 |
| 11:08 | 02:08 | 7842749 |
| 12:51 | 03:51 | 7842750 |
| 14:29 | 05:29 | 7842751 |
| 16:14 | 07:14 | 7842761 |
| 18:37 | 09:37 | 7842762 |
| 20:22 | 11:22 | 7842763 |

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

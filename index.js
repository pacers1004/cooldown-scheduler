require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

const POST_COUNT = 10;

function generateRandomTimes(count) {
  const times = new Set();
  while (times.size < count) {
    const hour = Math.floor(Math.random() * 18) + 6; // 6~23시
    const minute = Math.floor(Math.random() * 60);
    times.add(hour * 60 + minute);
  }
  return Array.from(times).sort((a, b) => a - b);
}

async function triggerBubble(index) {
  try {
    await axios.post(
      process.env.BUBBLE_API_URL,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.BUBBLE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[${new Date().toISOString()}] 게시 완료 (${index + 1}/${POST_COUNT})`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 게시 실패 (${index + 1})`, err.response?.data || err.message);
  }
}

async function scheduleDailyPosts() {
  console.log(`\n[${new Date().toISOString()}] ===== 오늘의 쿨다운 스케줄 생성 =====`);

  const times = generateRandomTimes(POST_COUNT);

  times.forEach((minuteOffset, i) => {
    const delayMs = minuteOffset * 60 * 1000;
    const h = String(Math.floor(minuteOffset / 60)).padStart(2, '0');
    const m = String(minuteOffset % 60).padStart(2, '0');
    console.log(`  ${h}:${m} 예약 (${i + 1}번째)`);
    setTimeout(() => triggerBubble(i), delayMs);
  });

  console.log(`[${new Date().toISOString()}] ${POST_COUNT}개 예약 완료\n`);
}

// 매일 자정 KST 실행
cron.schedule('0 0 * * *', scheduleDailyPosts, { timezone: 'Asia/Seoul' });

console.log('Pacers 쿨다운 스케줄러 시작 (매일 00:00 KST)');

if (process.env.TEST_MODE === 'true') {
  scheduleDailyPosts();
}

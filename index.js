require('dotenv').config();
const cron = require('node-cron');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generatePosts() {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `페이서스 러닝 소셜 앱의 쿨다운 커뮤니티 게시판에 올릴 자연스러운 게시글 10개를 만들어줘.

페이서스는 동네 러너들이 만나는 소셜 러닝 플랫폼이야. 쿨다운 게시판은 러너들의 일상적인 이야기를 나누는 공간이야.
핵심 철학: "멀리, 빨리 뛰는 법보다 오늘도 운동화를 다시 신는 법을 제안합니다."

카테고리: 자유, 러닝후기, 마라톤준비 중 하나

다음 JSON 배열만 반환해 (다른 텍스트 없이):
[
  {
    "title": "제목 (20자 이내)",
    "content": "본문 (실제 러너가 쓴 것처럼, 2-4문장, 자연스럽고 다양하게)",
    "category": "자유|러닝후기|마라톤준비"
  }
]

10개 작성, 카테고리 골고루 섞어서.`
    }]
  });

  const text = message.content[0].text.trim();
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Claude 응답에서 JSON 파싱 실패:\n' + text);
  return JSON.parse(jsonMatch[0]);
}

function generateRandomTimes(count) {
  const times = new Set();
  while (times.size < count) {
    const hour = Math.floor(Math.random() * 18) + 6; // 6~23시
    const minute = Math.floor(Math.random() * 60);
    times.add(hour * 60 + minute);
  }
  return Array.from(times).sort((a, b) => a - b);
}

async function postToBubble(post) {
  try {
    await axios.post(
      process.env.BUBBLE_API_URL,
      {
        title: post.title,
        content: post.content,
        category: post.category
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BUBBLE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`[${new Date().toISOString()}] 게시 완료: "${post.title}"`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] 게시 실패: "${post.title}"`, err.response?.data || err.message);
  }
}

async function scheduleDailyPosts() {
  console.log(`\n[${new Date().toISOString()}] ===== 오늘의 쿨다운 스케줄 생성 시작 =====`);

  let posts;
  try {
    posts = await generatePosts();
  } catch (err) {
    console.error('게시글 생성 실패:', err.message);
    return;
  }

  const times = generateRandomTimes(posts.length);

  times.forEach((minuteOffset, i) => {
    const delayMs = minuteOffset * 60 * 1000;
    const h = String(Math.floor(minuteOffset / 60)).padStart(2, '0');
    const m = String(minuteOffset % 60).padStart(2, '0');
    console.log(`  ${h}:${m} 예약 → "${posts[i].title}" [${posts[i].category}]`);
    setTimeout(() => postToBubble(posts[i]), delayMs);
  });

  console.log(`[${new Date().toISOString()}] ${posts.length}개 게시글 예약 완료\n`);
}

// 매일 자정 KST 실행
cron.schedule('0 0 * * *', scheduleDailyPosts, { timezone: 'Asia/Seoul' });

console.log('Pacers 쿨다운 스케줄러 시작 (매일 00:00 KST)');

// TEST_MODE=true 이면 즉시 실행
if (process.env.TEST_MODE === 'true') {
  scheduleDailyPosts();
}

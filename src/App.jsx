import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Sparkles, Users, User, Send, Wand2 } from 'lucide-react';

// 100種類の占いカード
const fortuneCards = [
  // 運命系 (1-20)
  { id: 1, name: '運命の出会い', result: '素敵な出会いが待っています。心を開いて、新しい人との交流を楽しんでみて。', emoji: '💝' },
  { id: 2, name: '赤い糸', result: '運命の人との絆が深まる時期。信じる気持ちを大切に。', emoji: '🎀' },
  { id: 3, name: '永遠のハート', result: '長く続く愛情に恵まれる暗示。小さな幸せを積み重ねて。', emoji: '💖' },
  { id: 4, name: '運命の扉', result: '新しい恋のチャンスが訪れます。勇気を持って一歩踏み出して。', emoji: '🚪' },
  { id: 5, name: '真実の愛', result: '本当の愛を見つける時期。表面的なものに惑わされないで。', emoji: '💕' },
  { id: 6, name: '奇跡の瞬間', result: '思いがけない幸運が舞い込みます。準備をして待っていて。', emoji: '✨' },
  { id: 7, name: '運命の星', result: '星の導きに従えば、素晴らしい出会いが待っています。', emoji: '⭐' },
  { id: 8, name: 'ソウルメイト', result: '魂のつながりを感じる相手との出会いが近づいています。', emoji: '👫' },
  { id: 9, name: '約束の虹', result: '過去の努力が実を結ぶ時。希望を持ち続けて。', emoji: '🌈' },
  { id: 10, name: '永遠の誓い', result: '大切な約束を交わす好機。心からの想いを伝えて。', emoji: '💍' },
  { id: 11, name: '運命の輪', result: '人生の転機が訪れます。変化を恐れずに前へ進んで。', emoji: '🎡' },
  { id: 12, name: '縁結び', result: '良縁に恵まれる時期。周りの人との繋がりを大切に。', emoji: '🎎' },
  { id: 13, name: '幸運の鍵', result: '幸せの扉を開く鍵を手にしています。自信を持って。', emoji: '🔑' },
  { id: 14, name: '天使の祝福', result: '守護の存在があなたを見守っています。安心して進んで。', emoji: '👼' },
  { id: 15, name: '運命の糸車', result: '紡がれる運命の糸。すべてのことに意味があります。', emoji: '🧵' },
  { id: 16, name: '魔法の時間', result: '特別な時間が訪れる予感。大切な人と過ごして。', emoji: '🕐' },
  { id: 17, name: '約束の地', result: '二人の楽園が見つかる暗示。一緒に夢を描いて。', emoji: '🏝️' },
  { id: 18, name: '永遠の絆', result: '切れない絆で結ばれています。信頼を深めて。', emoji: '🔗' },
  { id: 19, name: '運命の再会', result: '大切な人との再会が待っています。過去を大切に。', emoji: '🤝' },
  { id: 20, name: '愛の誓約', result: '心からの愛を誓う時。素直な気持ちを表現して。', emoji: '💗' },

  // 自然系 (21-40)
  { id: 21, name: '桜吹雪', result: '新しい恋の予感。美しい出会いが待っています。', emoji: '🌸' },
  { id: 22, name: '月の導き', result: '夜の時間が恋を深めます。ロマンチックなデートを。', emoji: '🌙' },
  { id: 23, name: '星の祝福', result: '宇宙があなたの恋を応援しています。願いを込めて。', emoji: '🌟' },
  { id: 24, name: '春の訪れ', result: '心が暖かくなる出来事が。季節の変わり目に注目。', emoji: '🌷' },
  { id: 25, name: '夏の情熱', result: '熱い想いが燃え上がる時。積極的にアプローチして。', emoji: '☀️' },
  { id: 26, name: '秋の実り', result: '愛の実りを得る季節。感謝の気持ちを忘れずに。', emoji: '🍂' },
  { id: 27, name: '冬の寄り添い', result: '温もりを求める時期。大切な人と過ごす時間を。', emoji: '❄️' },
  { id: 28, name: '虹色の希望', result: '困難を乗り越えた先に希望が。諦めないで。', emoji: '🌈' },
  { id: 29, name: '海の包容', result: '広い心で相手を受け入れて。すべてを包み込む愛。', emoji: '🌊' },
  { id: 30, name: '山の安定', result: '揺るがない愛情を築く時。基盤を大切に。', emoji: '⛰️' },
  { id: 31, name: '森の癒し', result: '心を休める時間が必要。自然の中でリフレッシュ。', emoji: '🌲' },
  { id: 32, name: '風の便り', result: '良い知らせが届きます。心を開いて待って。', emoji: '💨' },
  { id: 33, name: '雨上がり', result: '試練の後の晴れ間。きっと良い方向に向かいます。', emoji: '🌦️' },
  { id: 34, name: '朝焼け', result: '新しい1日、新しい恋の始まり。早起きがラッキー。', emoji: '🌅' },
  { id: 35, name: '夕暮れ', result: '一日の終わりに大切なことに気づく。振り返りの時間を。', emoji: '🌆' },
  { id: 36, name: '満月の夜', result: '感情が高まる時期。素直な気持ちを伝えて。', emoji: '🌕' },
  { id: 37, name: '流れ星', result: '願いが叶う兆候。思い切って願いを込めて。', emoji: '🌠' },
  { id: 38, name: '花園', result: '美しい恋が花開く。自分磨きを忘れずに。', emoji: '🌺' },
  { id: 39, name: 'オーロラ', result: '神秘的な出会いの暗示。直感を信じて。', emoji: '🌌' },
  { id: 40, name: '大地の恵み', result: '足元を固める時期。着実に関係を深めて。', emoji: '🌍' },

  // 感情系 (41-60)
  { id: 41, name: '情熱の炎', result: '燃えるような恋心。その気持ちを大切に育てて。', emoji: '🔥' },
  { id: 42, name: '優しさの雨', result: '相手への思いやりが実を結ぶ。小さな気遣いを。', emoji: '💧' },
  { id: 43, name: '愛の花開き', result: '愛情が美しく花開く時期。表現することを恐れないで。', emoji: '🌹' },
  { id: 44, name: '希望の光', result: '明るい未来が見えてきます。前を向いて進んで。', emoji: '💡' },
  { id: 45, name: '喜びの泉', result: '幸せがあふれ出す予感。周りの人にも分けてあげて。', emoji: '⛲' },
  { id: 46, name: '安らぎの風', result: '心が落ち着く相手との出会い。安心感を大切に。', emoji: '🍃' },
  { id: 47, name: '信頼の橋', result: '信頼関係を築く好機。誠実さが鍵です。', emoji: '🌉' },
  { id: 48, name: '勇気の剣', result: '勇気を持って告白を。結果を恐れずに進んで。', emoji: '⚔️' },
  { id: 49, name: '包容の雲', result: '相手のすべてを受け入れる心。寛容さが愛を深めます。', emoji: '☁️' },
  { id: 50, name: '純粋な心', result: '純粋な気持ちが相手に届く。素直でいて。', emoji: '💠' },
  { id: 51, name: '感謝の言葉', result: 'ありがとうの気持ちを伝えて。感謝が愛を育てます。', emoji: '🙏' },
  { id: 52, name: '理解の架け橋', result: '相手を理解しようとする姿勢が大切。聴く耳を持って。', emoji: '🌁' },
  { id: 53, name: '許しの光', result: '過去を許し、前に進む時。心を軽くして。', emoji: '🕊️' },
  { id: 54, name: '共感の波', result: '心が通じ合う瞬間が訪れます。感情を共有して。', emoji: '🌊' },
  { id: 55, name: '癒しの時間', result: '傷ついた心が癒される時期。自分を大切に。', emoji: '💆' },
  { id: 56, name: '成長の種', result: '恋を通じて成長できる時。学びを大切に。', emoji: '🌱' },
  { id: 57, name: '決意の炎', result: '強い決意が実を結ぶ。覚悟を持って進んで。', emoji: '🔥' },
  { id: 58, name: '穏やかな海', result: '波風のない穏やかな関係。平和を大切に。', emoji: '🏖️' },
  { id: 59, name: '笑顔の花', result: '笑顔が幸運を呼びます。明るく振る舞って。', emoji: '😊' },
  { id: 60, name: '涙の浄化', result: '涙が心を洗い流す。感情を出すことも大切。', emoji: '💦' },

  // 魔法系 (61-80)
  { id: 61, name: '恋の魔法', result: '魔法のような出来事が起こる予感。期待して。', emoji: '🪄' },
  { id: 62, name: 'キューピッドの矢', result: '恋の矢がハートを射抜きます。運命の出会い。', emoji: '💘' },
  { id: 63, name: '愛の天使', result: '天使があなたの恋を応援しています。', emoji: '😇' },
  { id: 64, name: '幸せの呪文', result: '幸せを呼ぶ言葉を唱えて。ポジティブな言霊を。', emoji: '✨' },
  { id: 65, name: '願いの星', result: '願いを星に託して。叶う日は近いです。', emoji: '⭐' },
  { id: 66, name: '魔法の鏡', result: '自分の本当の姿を見つめて。内面の美しさを磨いて。', emoji: '🪞' },
  { id: 67, name: '幸運のコイン', result: '思いがけない幸運が舞い込みます。', emoji: '🪙' },
  { id: 68, name: '魔法の杖', result: '願いを叶える力があなたの中に。信じて。', emoji: '🪄' },
  { id: 69, name: '妖精の羽', result: '軽やかな恋のスタート。楽しむことを忘れずに。', emoji: '🧚' },
  { id: 70, name: '魔法のランプ', result: '3つの願いが叶う暗示。何を願いますか？', emoji: '🪔' },
  { id: 71, name: '不思議の国', result: '想像を超える出来事が。ワクワクする恋。', emoji: '🎠' },
  { id: 72, name: '秘密の花園', result: '二人だけの特別な場所を見つけて。', emoji: '🌻' },
  { id: 73, name: '魔法の時計', result: '時が味方してくれます。焦らずに待って。', emoji: '⏰' },
  { id: 74, name: '夢の国', result: '夢のような恋が始まる予感。', emoji: '🏰' },
  { id: 75, name: '魔法のドレス', result: '外見を磨いて自信をつけて。第一印象が大切。', emoji: '👗' },
  { id: 76, name: '秘密の呪文', result: '心の中で願いを唱えて。きっと届きます。', emoji: '📿' },
  { id: 77, name: '魔法の本', result: '恋のヒントが見つかります。情報収集を。', emoji: '📖' },
  { id: 78, name: '幸せの鐘', result: '幸せの鐘が鳴り響きます。良い知らせ。', emoji: '🔔' },
  { id: 79, name: '魔法の薬', result: '心の傷が癒される時期。新しい恋に備えて。', emoji: '🧪' },
  { id: 80, name: '願いの泉', result: '泉に願いを投げ入れて。叶う可能性大。', emoji: '⛲' },

  // ラッキー系 (81-100)
  { id: 81, name: '四つ葉のクローバー', result: '幸運のしるし。今日は特別にラッキー！', emoji: '🍀' },
  { id: 82, name: '幸せの青い鳥', result: '幸せはすぐそばに。気づいていますか？', emoji: '🐦' },
  { id: 83, name: 'ラッキースター', result: '星の加護を受けています。自信を持って。', emoji: '🌟' },
  { id: 84, name: '幸運の馬蹄', result: '運気上昇中！積極的に動いて。', emoji: '🐎' },
  { id: 85, name: 'てんとう虫', result: '小さな幸運が舞い込みます。見逃さないで。', emoji: '🐞' },
  { id: 86, name: '虹の向こう', result: '虹の向こうに幸せが待っています。', emoji: '🌈' },
  { id: 87, name: 'ハッピーダンス', result: '踊るように楽しい日々が訪れます。', emoji: '💃' },
  { id: 88, name: 'ラッキーセブン', result: '7のつく日が特にラッキー。デートの約束を。', emoji: '7️⃣' },
  { id: 89, name: '幸せの種まき', result: '今日まいた種が将来実を結びます。', emoji: '🌻' },
  { id: 90, name: 'ゴールデンアワー', result: '黄金の時間帯に素敵なことが。夕方に注目。', emoji: '🌅' },
  { id: 91, name: 'ラッキーチャーム', result: 'お守りがあなたを守っています。', emoji: '🧿' },
  { id: 92, name: '幸運の招き猫', result: '良縁を招き入れる時期。心を開いて。', emoji: '🐱' },
  { id: 93, name: 'ダイヤモンド', result: '価値ある出会いが待っています。見極めて。', emoji: '💎' },
  { id: 94, name: 'シューティングスター', result: '願いを込めて！叶う可能性大です。', emoji: '💫' },
  { id: 95, name: 'ラッキーハート', result: 'ハートマークを見たらラッキー！恋のチャンス。', emoji: '❤️' },
  { id: 96, name: '幸せのスイーツ', result: '甘いものを食べると良いことが。デートにカフェを。', emoji: '🍰' },
  { id: 97, name: 'ミラクルデー', result: '奇跡のような一日になる予感！', emoji: '🎉' },
  { id: 98, name: 'ハッピーエンド', result: '物語はハッピーエンドへ。安心して。', emoji: '📕' },
  { id: 99, name: '愛の勝利', result: '愛があれば何でも乗り越えられます。', emoji: '🏆' },
  { id: 100, name: '永遠の幸せ', result: '永遠に続く幸せが約束されています。', emoji: '💝' },
];

// 診断質問
const quizQuestions = [
  { q: '恋愛において重視するのは？', options: ['情熱', '安定', '自由', '共感'] },
  { q: 'デートで行きたい場所は？', options: ['テーマパーク', 'おしゃれなカフェ', '自然豊かな場所', '映画館'] },
  { q: '告白するタイミングは？', options: ['すぐに', 'じっくり考えて', '相手を見て', '雰囲気で'] },
  { q: '連絡の頻度は？', options: ['常に', '毎日', '2-3日に一回', '気が向いた時'] },
  { q: '理想のデートは？', options: ['アクティブ', 'まったり', '冒険的', 'ロマンチック'] },
  { q: '喧嘩した時は？', options: ['すぐ謝る', '冷静に話す', '時間を置く', '感情的になる'] },
  { q: '相手に求めるものは？', options: ['優しさ', '面白さ', '誠実さ', '情熱'] }
];

// 診断結果タイプ
const personalityTypes = [
  { name: '情熱の炎タイプ', desc: 'あなたは恋愛に情熱的で、一途な愛を貫くタイプです！\n\n積極的にアプローチし、相手を幸せにしたいという気持ちが強いです。', emoji: '🔥' },
  { name: '癒しの月タイプ', desc: 'あなたは優しく包み込むような愛情を持つタイプです！\n\n相手の気持ちを第一に考え、安定した関係を築きます。', emoji: '🌙' },
  { name: '自由の風タイプ', desc: 'あなたは自由で柔軟な恋愛を好むタイプです！\n\nお互いの個性を尊重し、のびのびとした関係を大切にします。', emoji: '🌬️' },
  { name: '知性の星タイプ', desc: 'あなたは冷静で理性的な恋愛をするタイプです！\n\nコミュニケーションを重視し、深い絆を築きます。', emoji: '⭐' }
];

// 相性パターン
const compatibilityPatterns = [
  { range: [90, 100], result: '運命の相性！', desc: '二人は運命で結ばれています。\n\n最高の相性で、お互いを高め合える関係です。', emoji: '💖' },
  { range: [75, 89], result: '素晴らしい相性', desc: 'とても良い相性です。\n\n互いを理解し合い、幸せな関係が築けます。', emoji: '💕' },
  { range: [60, 74], result: '良好な相性', desc: '良い相性です。\n\n努力次第でさらに深い絆が生まれます。', emoji: '💗' },
  { range: [40, 59], result: '普通の相性', desc: '普通の相性です。\n\nコミュニケーションを大切にしましょう。', emoji: '💓' },
  { range: [0, 39], result: '課題あり', desc: '少し課題がある相性です。\n\nお互いの違いを受け入れることが大切です。', emoji: '💝' }
];

// 浮遊ハートコンポーネント
const FloatingHearts = () => {
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 6 + Math.random() * 4,
    size: 12 + Math.random() * 24,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-pink-300/30 animate-float"
          style={{
            left: `${heart.left}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`,
          }}
        >
          💕
        </div>
      ))}
    </div>
  );
};

// キラキラエフェクトコンポーネント
const SparkleEffects = () => {
  const sparkles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-twinkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400/40" />
        </div>
      ))}
    </div>
  );
};

function App() {
  const [currentTab, setCurrentTab] = useState('chat');
  const [avatar, setAvatar] = useState(null);
  const [mode, setMode] = useState('empathy');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // 占い
  const [fortuneResult, setFortuneResult] = useState(null);
  
  // 診断
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  
  // 相性
  const [userBirthday, setUserBirthday] = useState('');
  const [partnerBirthday, setPartnerBirthday] = useState('');
  const [compatibilityResult, setCompatibilityResult] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('avatar');
    if (savedAvatar) {
      setAvatar(savedAvatar);
      setShowWelcome(false);
    }
  }, []);

  const selectAvatar = (type) => {
    setAvatar(type);
    setShowWelcome(false);
    localStorage.setItem('avatar', type);
  };

  // Anthropic APIでメッセージ送信
  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'APIキーが設定されていません。\n\n.envファイルにVITE_ANTHROPIC_API_KEYを設定してください。'
        }]);
        setIsLoading(false);
        return;
      }

      const systemPrompt = mode === 'empathy'
        ? 'あなたは優しい恋愛相談の友達です。カジュアルで親しみやすい口調で、相手の気持ちに寄り添い共感してください。「そうなんだ！」「わかる〜」「それは辛いよね」などの相づちを使い、文章の終わりは必ず改行してください。会話調で自然に話してください。'
        : 'あなたは恋愛アドバイザーです。具体的な解決策を箇条書きで提示してください。各項目は「・」で始め、改行して読みやすくしてください。';

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [{ role: 'user', content: inputText }]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      if (data.content && data.content[0]?.text) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.content[0].text
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'エラーが発生しました。\n\nもう一度お試しください。'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // 占い実行
  const revealFortune = () => {
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cardIndex = seed % fortuneCards.length;
    setFortuneResult(fortuneCards[cardIndex]);
  };

  // 診断回答
  const answerQuiz = (answerIndex) => {
    const newAnswers = [...quizAnswers, answerIndex];
    setQuizAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 結果計算
      const score = newAnswers.reduce((sum, a) => sum + a, 0);
      const typeIndex = score % personalityTypes.length;
      setQuizResult(personalityTypes[typeIndex]);
    }
  };

  // 診断リセット
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setQuizAnswers([]);
    setQuizResult(null);
  };

  // 相性計算
  const calculateCompatibility = () => {
    if (!userBirthday || !partnerBirthday) return;

    const userDate = new Date(userBirthday);
    const partnerDate = new Date(partnerBirthday);
    const dayDiff = Math.abs(userDate.getDate() - partnerDate.getDate());
    const monthDiff = Math.abs(userDate.getMonth() - partnerDate.getMonth());
    const baseScore = 50 + (dayDiff % 30) + (monthDiff % 12) * 3;
    const score = Math.min(100, baseScore);

    const pattern = compatibilityPatterns.find(p => score >= p.range[0] && score <= p.range[1]);
    setCompatibilityResult({ score, ...pattern });
  };

  // ウェルカム画面
  if (showWelcome) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingHearts />
        <SparkleEffects />
        
        <div className="glass-card p-10 max-w-lg w-full text-center relative z-10 animate-slideUp">
          <div className="mb-8">
            <Heart className="w-20 h-20 mx-auto text-pink-500 animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            恋愛相談アプリ
          </h1>
          
          <p className="text-gray-600 mb-10">
            あなたのアバターを選んでください ✨
          </p>
          
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => selectAvatar('female')}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl glass card-hover border border-pink-200"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl gradient-pink-purple shadow-xl">
                👩
              </div>
              <span className="text-xl font-bold text-pink-600">女性</span>
            </button>

            <button
              onClick={() => selectAvatar('male')}
              className="flex flex-col items-center gap-4 p-6 rounded-2xl glass card-hover border border-purple-200"
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl bg-gradient-to-br from-purple-400 to-indigo-500 shadow-xl">
                👨
              </div>
              <span className="text-xl font-bold text-purple-600">男性</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'chat', label: 'チャット', icon: MessageCircle },
    { id: 'fortune', label: '占い', icon: Sparkles },
    { id: 'quiz', label: '診断', icon: User },
    { id: 'compatibility', label: '相性', icon: Users },
  ];

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      <FloatingHearts />
      <SparkleEffects />

      <div className="container mx-auto px-4 py-6 max-w-4xl relative z-10">
        {/* ナビゲーション */}
        <nav className="glass-card p-2 mb-6 animate-slideDown">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold transition-all duration-300 ${
                  currentTab === tab.id
                    ? 'gradient-pink-purple text-white shadow-lg'
                    : 'text-gray-600 hover:bg-pink-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* チャット */}
        {currentTab === 'chat' && (
          <div className="glass-card overflow-hidden animate-fadeIn">
            {/* モード切替 */}
            <div className="p-4 bg-gradient-to-r from-pink-100 to-purple-100">
              <div className="flex gap-2 p-1 bg-white rounded-full">
                <button
                  onClick={() => setMode('empathy')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all ${
                    mode === 'empathy'
                      ? 'gradient-pink-purple text-white'
                      : 'text-gray-600'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  共感重視
                </button>
                <button
                  onClick={() => setMode('solution')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all ${
                    mode === 'solution'
                      ? 'gradient-pink-purple text-white'
                      : 'text-gray-600'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  解決策提示
                </button>
              </div>
            </div>

            {/* メッセージエリア */}
            <div className="h-96 overflow-y-auto p-4 bg-gradient-to-b from-pink-50 to-purple-50">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>恋愛の悩みを相談してみてください</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-10 h-10 rounded-full gradient-pink-purple flex items-center justify-center mr-2 flex-shrink-0">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] p-4 ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="w-10 h-10 rounded-full gradient-pink-purple flex items-center justify-center mr-2">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div className="message-ai p-4">
                    <div className="flex gap-2">
                      <div className="loading-dot" />
                      <div className="loading-dot" />
                      <div className="loading-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 入力エリア */}
            <div className="p-4 border-t border-pink-100">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="恋愛の悩みを入力してね..."
                  className="flex-1 p-4 rounded-full border-2 border-pink-200 input-focus text-gray-700 placeholder-pink-300"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputText.trim()}
                  className="btn-gradient p-4 rounded-full disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 占い */}
        {currentTab === 'fortune' && (
          <div className="glass-card p-8 text-center animate-fadeIn">
            <h2 className="text-3xl font-bold mb-8 gradient-text">
              ✨ 今日の恋愛運 ✨
            </h2>

            {!fortuneResult ? (
              <div className="py-8">
                <div className="text-8xl mb-8 animate-bounce">🔮</div>
                <button
                  onClick={revealFortune}
                  className="btn-gradient text-xl font-bold px-10 py-4 rounded-full animate-pulse"
                >
                  カードをめくる
                </button>
              </div>
            ) : (
              <div className="animate-zoomIn">
                <div className="gradient-card p-8 rounded-3xl mb-6 card-hover">
                  <div className="text-6xl mb-4">{fortuneResult.emoji}</div>
                  <h3 className="text-2xl font-bold text-purple-600 mb-4">
                    {fortuneResult.name}
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {fortuneResult.result}
                  </p>
                </div>
                <button
                  onClick={() => setFortuneResult(null)}
                  className="text-pink-500 font-bold hover:text-pink-600 transition-colors"
                >
                  もう一度占う
                </button>
              </div>
            )}
          </div>
        )}

        {/* 診断 */}
        {currentTab === 'quiz' && (
          <div className="glass-card p-8 animate-fadeIn">
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">
              💕 恋愛性格診断 💕
            </h2>

            {!quizResult ? (
              <div>
                {/* プログレスバー */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>質問 {currentQuestion + 1} / {quizQuestions.length}</span>
                    <span>{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-700 mb-6 text-center">
                  {quizQuestions[currentQuestion].q}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {quizQuestions[currentQuestion].options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => answerQuiz(idx)}
                      className="p-5 rounded-2xl glass border border-pink-200 text-gray-700 font-medium card-hover text-left"
                      style={{ animationDelay: `${idx * 0.1}s` }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center animate-zoomIn">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full gradient-pink-purple flex items-center justify-center text-5xl shadow-xl">
                  {quizResult.emoji}
                </div>
                <h3 className="text-3xl font-bold mb-4 gradient-text">
                  {quizResult.name}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-wrap">
                  {quizResult.desc}
                </p>
                <button
                  onClick={resetQuiz}
                  className="btn-gradient px-10 py-4 rounded-full font-bold text-lg"
                >
                  もう一度診断する
                </button>
              </div>
            )}
          </div>
        )}

        {/* 相性 */}
        {currentTab === 'compatibility' && (
          <div className="glass-card p-8 animate-fadeIn">
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">
              💑 相性占い 💑
            </h2>

            {!compatibilityResult ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    あなたの生年月日
                  </label>
                  <input
                    type="date"
                    value={userBirthday}
                    onChange={(e) => setUserBirthday(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-pink-200 input-focus text-gray-700"
                  />
                </div>

                <div className="text-center">
                  <Heart className="w-8 h-8 mx-auto text-pink-400 animate-heartBeat" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    お相手の生年月日
                  </label>
                  <input
                    type="date"
                    value={partnerBirthday}
                    onChange={(e) => setPartnerBirthday(e.target.value)}
                    className="w-full p-4 rounded-2xl border-2 border-pink-200 input-focus text-gray-700"
                  />
                </div>

                <button
                  onClick={calculateCompatibility}
                  disabled={!userBirthday || !partnerBirthday}
                  className="w-full btn-gradient py-5 rounded-full font-bold text-xl disabled:opacity-50"
                >
                  相性を診断する
                </button>
              </div>
            ) : (
              <div className="text-center animate-zoomIn">
                <div className="text-6xl font-bold gradient-text mb-2 animate-pulse">
                  {compatibilityResult.score}%
                </div>
                <div className="text-4xl mb-4">{compatibilityResult.emoji}</div>
                <h3 className="text-2xl font-bold text-purple-600 mb-4">
                  {compatibilityResult.result}
                </h3>
                <div className="gradient-card p-6 rounded-2xl mb-6">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {compatibilityResult.desc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCompatibilityResult(null);
                    setUserBirthday('');
                    setPartnerBirthday('');
                  }}
                  className="btn-gradient px-10 py-4 rounded-full font-bold text-lg"
                >
                  もう一度診断する
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

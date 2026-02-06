import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Sparkles, Users, User, Send, Moon, Sun, Star } from 'lucide-react';

// 星を生成するコンポーネント
const StarField = () => {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    size: Math.random() * 2 + 1,
  }));

  return (
    <div className="stars">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// 浮遊するハートコンポーネント
const FloatingHearts = () => {
  const hearts = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 10,
    size: 10 + Math.random() * 20,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-pink-500/20 animate-float-heart"
          style={{
            left: `${heart.left}%`,
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

const LoveCounselingApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [avatar, setAvatar] = useState(localStorage.getItem('avatar') || null);
  const [chatMode, setChatMode] = useState('empathy');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fortuneRevealed, setFortuneRevealed] = useState(false);
  const [dailyFortune, setDailyFortune] = useState(null);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [compatibilityInput, setCompatibilityInput] = useState({
    userYear: '', userMonth: '', userDay: '',
    partnerYear: '', partnerMonth: '', partnerDay: ''
  });
  const [compatibilityResult, setCompatibilityResult] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (avatar) {
      localStorage.setItem('avatar', avatar);
    }
  }, [avatar]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quizQuestions = [
    {
      question: "デートの計画を立てるとき、あなたは？",
      options: ["細かく計画を立てる", "大まかに決めて柔軟に対応", "相手に任せる", "その場の雰囲気で決める"]
    },
    {
      question: "恋人と意見が合わないとき、どうする？",
      options: ["とことん話し合う", "時間を置いて冷静になる", "相手の意見を尊重する", "自分の意見を通したい"]
    },
    {
      question: "好きな人ができたら？",
      options: ["積極的にアプローチ", "友達から始める", "相手からのアプローチを待つ", "遠くから見守る"]
    },
    {
      question: "恋人に求める一番大切なことは？",
      options: ["一緒にいて楽しい", "価値観が合う", "信頼できる", "外見が好み"]
    },
    {
      question: "連絡の頻度は？",
      options: ["毎日何度も連絡したい", "1日1回は連絡したい", "数日に1回で十分", "会うまで連絡不要"]
    },
    {
      question: "記念日について",
      options: ["きっちり覚えて祝いたい", "大事な日だけ祝う", "特に気にしない", "サプライズが好き"]
    },
    {
      question: "嫉妬しやすい？",
      options: ["とても嫉妬深い", "少し嫉妬する", "あまり嫉妬しない", "全く嫉妬しない"]
    }
  ];

  const personalityTypes = {
    romantic: { name: "ロマンチスト", description: "愛情表現が豊かで、相手を大切にする情熱的なタイプ。記念日やサプライズを大切にします。", emoji: "💖" },
    realistic: { name: "現実主義者", description: "冷静で現実的な判断ができるタイプ。安定した関係を築くことが得意です。", emoji: "💎" },
    free: { name: "自由奔放", description: "束縛を嫌い、お互いの自由を尊重するタイプ。マイペースな恋愛を好みます。", emoji: "🦋" },
    devoted: { name: "献身的", description: "相手のことを第一に考える優しいタイプ。相手の幸せが自分の幸せです。", emoji: "🌸" }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'APIキーが設定されていません。.envファイルにVITE_GEMINI_API_KEYを設定してください。'
        }]);
        setIsLoading(false);
        return;
      }

      const systemPrompt = chatMode === 'empathy'
        ? "あなたは優しく共感的な恋愛カウンセラーです。友達と話すような親しみやすい口調で、「そうなんだ!」「それは辛かったね」のようにカジュアルに相談者の気持ちに寄り添ってください。各文の終わりには必ず改行を入れてください。"
        : "あなたは実践的な恋愛アドバイザーです。友達と話すような親しみやすい口調で、具体的で実行可能な解決策を箇条書きで提示してください。各文の終わりには必ず改行を入れ、解決策は「・」を使って箇条書きにしてください。";

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nユーザーからの相談: ${inputText}`
              }]
            }]
          })
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const assistantMessage = {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'エラーが発生しました。もう一度お試しください。';
      if (error.message.includes('API key')) {
        errorMessage = 'APIキーの設定を確認してください。';
      } else if (error.message.includes('Fetch error')) {
        errorMessage = '通信エラーが発生しました。インターネット接続を確認してください。';
      }
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDailyFortune = () => {
    const fortunes = [
      { luck: 98, message: "運命の出会いが待っている予感！積極的に外に出てみて", item: "赤いリボン", card: "運命の赤い糸" },
      { luck: 96, message: "告白するなら今日！勇気を出して気持ちを伝えてみよう", item: "四つ葉のクローバー", card: "愛の天使" },
      { luck: 95, message: "最高の1日！笑顔でいれば素敵な人が寄ってくるよ", item: "ピンクのアクセサリー", card: "幸運の星" },
      { luck: 93, message: "好きな人から連絡が来るかも！スマホをチェックして", item: "キラキラしたもの", card: "メッセージの鳥" },
      { luck: 92, message: "デートのお誘いがありそう♪予定は空けておいて", item: "パールのイヤリング", card: "幸せの扉" },
      { luck: 90, message: "恋愛運絶好調！新しい出会いに期待大", item: "白いハンカチ", card: "新月の願い" },
      { luck: 88, message: "気になる人との距離が縮まる日。自然体でいこう", item: "香りのいいハンドクリーム", card: "調和の天秤" },
      { luck: 87, message: "運命を感じる出来事がありそう！", item: "シルバーのリング", card: "運命の輪" },
      { luck: 85, message: "チャンス到来！気になる人に連絡してみて", item: "ハート型のもの", card: "希望の光" },
      { luck: 83, message: "好印象を与えられる日。おしゃれして出かけよう", item: "リップグロス", card: "魅力の女神" },
      { luck: 82, message: "偶然の再会があるかも。過去の恋が復活？", item: "思い出の写真", card: "再会の橋" },
      { luck: 80, message: "恋のライバル出現！でも焦らないで", item: "勝負服", card: "戦いの女神" },
      { luck: 78, message: "告白されるかも！心の準備をしておこう", item: "鏡", card: "告白の月" },
      { luck: 77, message: "恋愛トークが盛り上がる日。友達に相談してみて", item: "お茶セット", card: "友情の絆" },
      { luck: 75, message: "良い日です。笑顔を心がけて", item: "お花", card: "笑顔の太陽" },
      { luck: 73, message: "デート日和！思い切って誘ってみよう", item: "お出かけバッグ", card: "冒険の地図" },
      { luck: 72, message: "素敵な褒め言葉をもらえそう♪", item: "新しい服", card: "賞賛の花" },
      { luck: 70, message: "恋バナで盛り上がる予感。SNSもチェック", item: "スマホケース", card: "繋がりの糸" },
      { luck: 68, message: "片思いの人の好みが分かるかも！", item: "メモ帳", card: "秘密の鍵" },
      { luck: 65, message: "好きな人の新しい一面が見られそう", item: "観察力", card: "発見の虫眼鏡" },
      { luck: 60, message: "まずまずの運気。焦らず自然体で", item: "香水", card: "平穏の湖" },
      { luck: 55, message: "恋愛より自分磨きの日。ゆっくり休んで", item: "バスソルト", card: "休息の枕" },
      { luck: 50, message: "普通の日。焦らずいつも通りで", item: "お気に入りの服", card: "日常の風景" },
    ];
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fortune = fortunes[seed % fortunes.length];
    setDailyFortune(fortune);
    setFortuneRevealed(true);
  };

  const submitQuizAnswer = (answer) => {
    const newAnswers = [...quizAnswers, answer];
    setQuizAnswers(newAnswers);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      calculatePersonality(newAnswers);
    }
  };

  const calculatePersonality = (answers) => {
    const scores = { romantic: 0, realistic: 0, free: 0, devoted: 0 };

    answers.forEach((answer, index) => {
      if (index === 0) {
        if (answer === 0) scores.romantic += 2;
        if (answer === 1) scores.realistic += 2;
        if (answer === 2) scores.devoted += 2;
        if (answer === 3) scores.free += 2;
      }
      if (index === 1) {
        if (answer === 0) scores.realistic += 2;
        if (answer === 2) scores.devoted += 2;
      }
      if (index === 2) {
        if (answer === 0) scores.romantic += 2;
        if (answer === 2) scores.devoted += 1;
        if (answer === 3) scores.free += 1;
      }
      if (index === 5) {
        if (answer === 0) scores.romantic += 2;
        if (answer === 3) scores.romantic += 1;
      }
      if (index === 6) {
        if (answer === 0) scores.romantic += 1;
        if (answer === 3) scores.free += 2;
      }
    });

    const maxScore = Math.max(...Object.values(scores));
    const resultType = Object.keys(scores).find(key => scores[key] === maxScore);
    setQuizResult(personalityTypes[resultType]);
  };

  const calculateCompatibility = () => {
    const { userYear, userMonth, userDay, partnerYear, partnerMonth, partnerDay } = compatibilityInput;

    if (!userYear || !userMonth || !userDay || !partnerYear || !partnerMonth || !partnerDay) return;

    const userDate = new Date(userYear, userMonth - 1, userDay);
    const partnerDate = new Date(partnerYear, partnerMonth - 1, partnerDay);

    const userSum = parseInt(userYear) + parseInt(userMonth) + parseInt(userDay);
    const partnerSum = parseInt(partnerYear) + parseInt(partnerMonth) + parseInt(partnerDay);
    const diff = Math.abs(userDate - partnerDate);
    const baseScore = 50 + ((userSum + partnerSum + diff) % 48);

    const monthCompatibility = Math.abs(parseInt(userMonth) - parseInt(partnerMonth));
    let monthBonus = 0;
    if (monthCompatibility === 0) monthBonus = 10;
    else if (monthCompatibility === 6) monthBonus = 8;
    else if (monthCompatibility <= 2 || monthCompatibility >= 10) monthBonus = 5;

    const score = Math.min(98, baseScore + monthBonus);

    let message = "";
    let detail = "";

    if (score >= 90) {
      const messages = [
        "運命の相手！お互いが最高のパートナーです。",
        "最高の相性！二人は魂のレベルで繋がっています。",
        "完璧な組み合わせ！一緒にいると自然体でいられる関係。"
      ];
      const details = [
        "価値観がぴったり合い、お互いを深く理解し合える関係です。一緒にいて自然体でいられる、まさに運命の相手。困難も二人で乗り越えられます。",
        "お互いの長所を引き出し合える最高のパートナーシップ。笑いのツボも似ていて、一緒にいて楽しい時間が過ごせます。",
        "心の繋がりが強く、言葉にしなくてもお互いの気持ちが分かる関係。将来を一緒に描ける素敵なカップルです。"
      ];
      message = messages[score % messages.length];
      detail = details[score % details.length];
    } else if (score >= 80) {
      const messages = [
        "とても良い相性！お互いを高め合える関係です。",
        "素晴らしい組み合わせ！信頼し合える絆があります。",
        "相性抜群！一緒にいると前向きになれる関係。"
      ];
      const details = [
        "お互いを尊重し合える良好な関係。時には意見が違うこともありますが、それがお互いの成長に繋がります。",
        "価値観が近く、将来のビジョンを共有できる相手。一緒に過ごす時間がとても充実しています。",
        "お互いの個性を認め合える素敵な関係。困ったときに支え合える心強いパートナーです。"
      ];
      message = messages[score % messages.length];
      detail = details[score % details.length];
    } else if (score >= 70) {
      const messages = [
        "良い相性です。努力次第でさらに良い関係に！",
        "バランスの取れた関係。お互いを補い合えます。",
        "前向きな相性！コミュニケーションを大切にして。"
      ];
      const details = [
        "違いを楽しめる関係性。お互いの得意分野を活かして協力し合えば、素晴らしい関係を築けます。",
        "時々意見が合わないこともありますが、話し合いで解決できる相手。お互いの気持ちを伝え合うことが大切です。",
        "相手の良いところを見つけるのが上手な二人。感謝の気持ちを忘れずに、関係を深めていきましょう。"
      ];
      message = messages[score % messages.length];
      detail = details[score % details.length];
    } else if (score >= 55) {
      const messages = [
        "まずまずの相性。お互いの理解を深めて！",
        "成長できる関係。違いを楽しんで。",
        "可能性のある組み合わせ。コミュニケーションが鍵。"
      ];
      const details = [
        "違う個性を持つ二人だからこそ、学び合える関係。相手の考え方を理解しようとする姿勢が大切です。",
        "価値観の違いを乗り越えることで、より深い絆が生まれます。お互いの話をよく聞くことを心がけて。",
        "すぐに分かり合えなくても焦らないで。時間をかけて信頼関係を築いていける相手です。"
      ];
      message = messages[score % messages.length];
      detail = details[score % details.length];
    } else {
      const messages = [
        "個性的な組み合わせ。違いを認め合うことが大切。",
        "刺激的な関係！お互いの違いが新鮮な発見に。",
        "ユニークな相性。柔軟性を持って接して。"
      ];
      const details = [
        "正反対な性格だからこそ、お互いにない魅力を持っています。違いを楽しむ余裕を持つことが関係を深める鍵です。",
        "価値観が異なる分、新しい視点や考え方を学べる相手。お互いの個性を尊重することで、成長できる関係になります。",
        "すぐには理解し合えないかもしれませんが、時間をかけてお互いを知ることで、深い絆が生まれる可能性があります。"
      ];
      message = messages[score % messages.length];
      detail = details[score % details.length];
    }

    setCompatibilityResult({ score, message, detail });
  };

  // アバター選択画面
  if (!avatar) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <StarField />
        <FloatingHearts />

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="glass rounded-3xl p-10 max-w-lg w-full text-center shadow-glow animate-fade-in">
            {/* ロゴエリア */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 blur-3xl opacity-30 rounded-full" />
              <Heart className="w-20 h-20 mx-auto text-pink-400 animate-heart-beat relative z-10" />
            </div>

            <h1 className="text-4xl font-extrabold mb-3 gradient-text">
              恋愛カウンセリング
            </h1>
            <p className="text-lg text-pink-200/80 mb-10 font-medium">
              あなたのアバターを選んでね ✨
            </p>

            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setAvatar('female')}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl glass card-hover border border-pink-500/30"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-5xl shadow-glow-pink group-hover:shadow-glow-lg transition-all duration-300">
                  👩
                </div>
                <span className="text-xl font-bold text-pink-200">女性</span>
              </button>

              <button
                onClick={() => setAvatar('male')}
                className="group flex flex-col items-center gap-4 p-6 rounded-2xl glass card-hover border border-purple-500/30"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-5xl shadow-glow-purple group-hover:shadow-glow-lg transition-all duration-300">
                  👨
                </div>
                <span className="text-xl font-bold text-purple-200">男性</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <StarField />
      <FloatingHearts />

      <div className="relative z-10 max-w-4xl mx-auto pb-28">
        {/* Header */}
        <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
          <div className="flex items-center justify-between p-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-glow ${avatar === 'female'
                  ? 'bg-gradient-to-br from-pink-400 to-rose-500'
                  : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                }`}>
                {avatar === 'female' ? '👩' : '👨'}
              </div>
              <h1 className="text-2xl font-extrabold gradient-text">
                恋愛カウンセリング
              </h1>
            </div>
            <div className="p-3 rounded-full bg-pink-500/20 animate-pulse-glow">
              <Heart className="w-6 h-6 text-pink-400 fill-current" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">
          {/* チャット画面 */}
          {activeTab === 'chat' && (
            <div className="glass rounded-3xl overflow-hidden shadow-glass animate-fade-in">
              {/* チャットヘッダー */}
              <div className="bg-gradient-to-r from-pink-500/80 to-purple-500/80 p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-white">
                  <span className="text-2xl">🤖</span> AI恋愛カウンセラー
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setChatMode('empathy')}
                    className={`flex-1 py-3 px-6 rounded-full transition-all duration-300 font-bold ${chatMode === 'empathy'
                        ? 'bg-white text-pink-500 shadow-glow-pink'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      }`}
                  >
                    <Heart className="w-4 h-4 inline mr-2" />
                    共感重視
                  </button>
                  <button
                    onClick={() => setChatMode('solution')}
                    className={`flex-1 py-3 px-6 rounded-full transition-all duration-300 font-bold ${chatMode === 'solution'
                        ? 'bg-white text-purple-500 shadow-glow-purple'
                        : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      }`}
                  >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    解決策の提案
                  </button>
                </div>
              </div>

              {/* メッセージエリア */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-cosmic-900/50">
                {messages.length === 0 && (
                  <div className="text-center text-pink-200/50 mt-20">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">恋愛の悩みを相談してみてください</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 whitespace-pre-wrap text-base ${msg.role === 'user'
                        ? 'message-user text-white'
                        : 'message-ai text-pink-100'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="message-ai p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 入力エリア */}
              <div className="p-4 border-t border-white/10 bg-cosmic-800/50">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="恋愛の悩みを入力してね..."
                    className="flex-1 p-4 text-base rounded-full bg-white/10 border border-pink-500/30 text-pink-100 placeholder-pink-300/50 focus:outline-none input-glow transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-full btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 占い画面 */}
          {activeTab === 'fortune' && (
            <div className="glass rounded-3xl p-8 shadow-glass animate-fade-in">
              <h2 className="text-3xl font-extrabold text-center mb-8 gradient-text">
                ✨ 今日の恋愛運 ✨
              </h2>

              {!fortuneRevealed ? (
                <div className="text-center py-8">
                  <div
                    className="tarot-card w-48 h-72 mx-auto mb-10 cursor-pointer"
                    onClick={generateDailyFortune}
                  >
                    <div className="tarot-card-inner w-full h-full bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 rounded-2xl shadow-glow flex items-center justify-center relative overflow-hidden border-2 border-white/20">
                      <div className="absolute inset-0 animate-shimmer" />
                      <div className="relative z-10 text-center">
                        <Moon className="w-20 h-20 text-white/90 mx-auto animate-float" />
                        <Star className="w-8 h-8 text-yellow-300 absolute top-4 right-4 animate-twinkle" />
                        <Star className="w-6 h-6 text-yellow-300 absolute bottom-8 left-6 animate-twinkle" style={{ animationDelay: '1s' }} />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={generateDailyFortune}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl font-bold px-10 py-4 rounded-full btn-glow"
                  >
                    カードをめくる
                  </button>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="mb-6 p-6 glass rounded-2xl">
                    <div className="text-xl font-bold text-purple-300 mb-3">{dailyFortune.card}</div>
                    <Sun className="w-12 h-12 mx-auto text-yellow-400 animate-spin-slow" />
                  </div>
                  <div className="text-7xl font-black gradient-text mb-4 glow-text">{dailyFortune.luck}%</div>
                  <div className="text-xl mb-8 font-medium text-pink-100">{dailyFortune.message}</div>
                  <div className="glass p-6 rounded-2xl mb-6 border border-pink-500/30">
                    <p className="text-sm text-pink-300/70 mb-2">ラッキーアイテム</p>
                    <p className="text-xl font-bold text-pink-200">{dailyFortune.item}</p>
                  </div>
                  <button
                    onClick={() => setFortuneRevealed(false)}
                    className="text-pink-300 hover:text-pink-200 transition-colors font-bold text-lg border-b border-pink-500/50"
                  >
                    もう一度めくる
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 診断画面 */}
          {activeTab === 'quiz' && (
            <div className="glass rounded-3xl p-8 shadow-glass animate-fade-in">
              <h2 className="text-3xl font-extrabold text-center mb-8 gradient-text">
                💕 恋愛性格診断 💕
              </h2>

              {!quizResult ? (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-pink-300 mb-2">
                      <span>質問 {quizStep + 1} / {quizQuestions.length}</span>
                      <span>{Math.round(((quizStep + 1) / quizQuestions.length) * 100)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500 shadow-glow-pink"
                        style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-6 text-pink-100">
                      {quizQuestions[quizStep].question}
                    </h3>
                    <div className="space-y-3">
                      {quizQuestions[quizStep].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => submitQuizAnswer(idx)}
                          className="w-full p-5 text-left rounded-xl glass border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all duration-300 text-pink-100 font-medium hover:shadow-glow-pink active:scale-[0.98]"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-glow text-5xl">
                    {quizResult.emoji}
                  </div>
                  <h3 className="text-3xl font-black mb-4 gradient-text">{quizResult.name}</h3>
                  <p className="text-pink-200/80 mb-8 leading-relaxed text-lg">{quizResult.description}</p>
                  <button
                    onClick={() => {
                      setQuizStep(0);
                      setQuizAnswers([]);
                      setQuizResult(null);
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-full font-bold btn-glow text-lg"
                  >
                    もう一度診断する
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 相性診断画面 */}
          {activeTab === 'compatibility' && (
            <div className="glass rounded-3xl p-8 shadow-glass animate-fade-in">
              <h2 className="text-3xl font-extrabold text-center mb-8 gradient-text">
                💑 相性診断 💑
              </h2>

              {!compatibilityResult ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-pink-300 mb-3">
                      あなたの誕生日
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="年"
                        value={compatibilityInput.userYear}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, userYear: e.target.value })}
                        className="flex-1 p-4 text-base rounded-xl bg-white/10 border border-pink-500/30 text-pink-100 placeholder-pink-300/50 focus:outline-none input-glow"
                        min="1900"
                        max="2100"
                      />
                      <input
                        type="number"
                        placeholder="月"
                        value={compatibilityInput.userMonth}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, userMonth: e.target.value })}
                        className="w-24 p-4 text-base rounded-xl bg-white/10 border border-pink-500/30 text-pink-100 placeholder-pink-300/50 focus:outline-none input-glow text-center"
                        min="1"
                        max="12"
                      />
                      <input
                        type="number"
                        placeholder="日"
                        value={compatibilityInput.userDay}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, userDay: e.target.value })}
                        className="w-24 p-4 text-base rounded-xl bg-white/10 border border-pink-500/30 text-pink-100 placeholder-pink-300/50 focus:outline-none input-glow text-center"
                        min="1"
                        max="31"
                      />
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <Heart className="w-10 h-10 mx-auto text-pink-400 animate-heart-beat" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-pink-300 mb-3">
                      お相手の誕生日
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="年"
                        value={compatibilityInput.partnerYear}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, partnerYear: e.target.value })}
                        className="flex-1 p-4 text-base rounded-xl bg-white/10 border border-pink-500/30 text-pink-100 placeholder-pink-300/50 focus:outline-none input-glow"
                        min="1900"
                        max="2100"
                      />
                      <input
                        type="number"
                        placeholder="月"
                        value={compatibilityInput.partnerMonth}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, partnerMonth: e.target.value })}
                        className="w-24 p-4 text-base rounded-xl bg-white/10 border border-pink-500/30 text-pink-100 placeholder-pink-300/50 focus:outline-none input-glow text-center"
                        min="1"
                        max="12"
                      />
                      <input
                        type="number"
                        placeholder="日"
                        value={compatibilityInput.partnerDay}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, partnerDay: e.target.value })}
                        className="w-24 p-4 text-base rounded-xl bg-white/10 border border-pink-500/30 text-pink-100 placeholder-pink-300/50 focus:outline-none input-glow text-center"
                        min="1"
                        max="31"
                      />
                    </div>
                  </div>

                  <button
                    onClick={calculateCompatibility}
                    disabled={!compatibilityInput.userYear || !compatibilityInput.userMonth || !compatibilityInput.userDay ||
                      !compatibilityInput.partnerYear || !compatibilityInput.partnerMonth || !compatibilityInput.partnerDay}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xl py-5 rounded-full font-bold btn-glow disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    相性を診断する
                  </button>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="relative w-44 h-44 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90 progress-ring">
                      <circle
                        cx="88"
                        cy="88"
                        r="75"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="75"
                        stroke="url(#gradientCompat)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 75}`}
                        strokeDashoffset={`${2 * Math.PI * 75 * (1 - compatibilityResult.score / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradientCompat" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-black gradient-text">{compatibilityResult.score}%</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-pink-300 mb-4">{compatibilityResult.message}</h3>
                  <div className="glass p-6 rounded-2xl mb-8 border border-pink-500/30">
                    <p className="text-pink-100/80 leading-relaxed text-left">{compatibilityResult.detail}</p>
                  </div>

                  <button
                    onClick={() => {
                      setCompatibilityResult(null);
                      setCompatibilityInput({ userYear: '', userMonth: '', userDay: '', partnerYear: '', partnerMonth: '', partnerDay: '' });
                    }}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-4 rounded-full font-bold btn-glow text-lg"
                  >
                    もう一度診断する
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 rounded-t-3xl z-50">
          <div className="max-w-4xl mx-auto flex justify-around p-3 pb-6">
            {[
              { id: 'chat', icon: MessageCircle, label: '相談する' },
              { id: 'fortune', icon: Sparkles, label: '占い' },
              { id: 'quiz', icon: User, label: '診断' },
              { id: 'compatibility', icon: Users, label: '相性' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${activeTab === id
                    ? 'text-pink-400 bg-pink-500/20 shadow-glow-pink scale-110'
                    : 'text-pink-300/50 hover:text-pink-300'
                  }`}
              >
                <Icon className={`w-6 h-6 ${activeTab === id ? 'fill-current' : ''}`} />
                <span className="text-xs font-bold">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default LoveCounselingApp;

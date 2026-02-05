import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Sparkles, Users, User, Send, Moon, Sun } from 'lucide-react';

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
    romantic: { name: "ロマンチスト", description: "愛情表現が豊かで、相手を大切にする情熱的なタイプ。記念日やサプライズを大切にします。" },
    realistic: { name: "現実主義者", description: "冷静で現実的な判断ができるタイプ。安定した関係を築くことが得意です。" },
    free: { name: "自由奔放", description: "束縛を嫌い、お互いの自由を尊重するタイプ。マイペースな恋愛を好みます。" },
    devoted: { name: "献身的", description: "相手のことを第一に考える優しいタイプ。相手の幸せが自分の幸せです。" }
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
      { luck: 67, message: "恋愛小説や映画から恋のヒントが！", item: "本や映画", card: "物語の扉" },
      { luck: 65, message: "好きな人の新しい一面が見られそう", item: "観察力", card: "発見の虫眼鏡" },
      { luck: 63, message: "恋の相談に乗ってあげると自分にも良いことが", item: "優しい言葉", card: "思いやりの心" },
      { luck: 62, message: "LINEやメールの返信が早く来る日", item: "スタンプ", card: "迅速の羽" },
      { luck: 60, message: "まずまずの運気。焦らず自然体で", item: "香水", card: "平穏の湖" },
      { luck: 58, message: "恋愛運は普通。でも努力次第で上昇！", item: "手鏡", card: "努力の階段" },
      { luck: 57, message: "友達の恋バナが参考になりそう", item: "カフェでお茶", card: "学びの本" },
      { luck: 55, message: "恋愛より自分磨きの日。ゆっくり休んで", item: "バスソルト", card: "休息の枕" },
      { luck: 53, message: "好きな人に会えないかも。連絡を取ってみて", item: "スマホ", card: "待ちの時計" },
      { luck: 52, message: "恋愛運は微妙。でも明日に期待！", item: "日記", card: "明日への希望" },
      { luck: 50, message: "普通の日。焦らずいつも通りで", item: "お気に入りの服", card: "日常の風景" },
      { luck: 48, message: "ちょっとモヤモヤしそう。深呼吸して", item: "リラックスグッズ", card: "瞑想の石" },
      { luck: 47, message: "恋愛より友情を大切にする日", item: "友達との時間", card: "友情の証" },
      { luck: 45, message: "少し控えめに。今日は自分磨きの日", item: "本", card: "成長の種" },
      { luck: 43, message: "好きな人と距離を感じるかも。でも大丈夫", item: "温かい飲み物", card: "忍耐の盾" },
      { luck: 42, message: "恋愛運低め。無理せず過ごそう", item: "好きな音楽", card: "癒しの音色" },
      { luck: 40, message: "ちょっと疲れてるかも。休息を優先して", item: "睡眠", card: "休養の雲" },
      { luck: 38, message: "恋愛より自分と向き合う日", item: "日記", card: "内省の鏡" },
      { luck: 37, message: "焦りは禁物。じっくり作戦を練ろう", item: "計画帳", card: "戦略の盤" },
      { luck: 35, message: "今日は一人の時間を楽しんで", item: "趣味のもの", card: "孤独の美" },
      { luck: 88, message: "サプライズがありそう！心の準備を", item: "カメラ", card: "驚きの箱" },
      { luck: 86, message: "恋のチャンスは突然やってくる", item: "身だしなみセット", card: "機会の扉" },
      { luck: 84, message: "好きな人の笑顔が見られる予感", item: "ユーモア", card: "笑いの妖精" },
      { luck: 81, message: "恋愛トークで盛り上がる！", item: "おしゃべり", card: "会話の泉" },
      { luck: 79, message: "デートの約束ができそう♪", item: "カレンダー", card: "約束の指輪" },
      { luck: 76, message: "気になる人から褒められるかも", item: "自信", card: "自信の王冠" },
      { luck: 74, message: "恋の予感！胸がドキドキする出来事が", item: "ときめき", card: "ドキドキの心臓" },
      { luck: 71, message: "好きな人との共通点発見！", item: "趣味のもの", card: "共鳴の音叉" },
      { luck: 69, message: "恋愛相談されそう。的確なアドバイスを", item: "聞く耳", card: "知恵の梟" },
      { luck: 66, message: "過去の恋から学ぶことがありそう", item: "思い出", card: "記憶の宝箱" },
      { luck: 64, message: "恋のライバルと仲良くなれるかも", item: "寛容な心", card: "和解の握手" },
      { luck: 61, message: "好きな人の友達と仲良くなるチャンス", item: "社交性", card: "人脈の網" },
      { luck: 59, message: "恋愛運は可もなく不可もなく", item: "平常心", card: "中立の天秤" },
      { luck: 56, message: "焦らずゆっくり関係を深めよう", item: "忍耐", card: "ゆっくりの亀" },
      { luck: 54, message: "今日は恋愛より仕事や勉強に集中", item: "集中力", card: "集中の炎" },
      { luck: 51, message: "普通の一日。特別なことは起きないかも", item: "日常", card: "平凡の道" },
      { luck: 49, message: "ちょっと空回りしそう。落ち着いて", item: "深呼吸", card: "冷静の水" },
      { luck: 46, message: "恋愛より友達との時間を楽しもう", item: "友達", card: "仲間の輪" },
      { luck: 44, message: "好きな人に会えないかも。でも焦らないで", item: "待つ心", card: "待機の砂時計" },
      { luck: 41, message: "今日は無理しないでゆっくり過ごそう", item: "リラックス", card: "安らぎの羽" },
      { luck: 39, message: "恋愛運低め。自分を大切にして", item: "セルフケア", card: "自愛の花" },
      { luck: 94, message: "運命的な出会いの予感！外出してみて", item: "おしゃれ靴", card: "出会いの星" },
      { luck: 91, message: "告白成功率アップ！勇気を出して", item: "勇気", card: "勇者の剣" },
      { luck: 89, message: "デートが盛り上がる予感♪", item: "会話ネタ", card: "楽しみの風船" },
      { luck: 86, message: "好きな人と目が合う回数が増えそう", item: "アイコンタクト", card: "視線の矢" },
      { luck: 84, message: "恋のチャンスをつかめる日", item: "積極性", card: "掴む手" },
      { luck: 81, message: "LINEの返信が早い！会話が弾むよ", item: "絵文字", card: "コミュニケーションの橋" },
      { luck: 78, message: "好きな人の優しさに触れられそう", item: "感謝の心", card: "優しさの光" },
      { luck: 75, message: "恋愛運良好！前向きに行動して", item: "ポジティブ", card: "明るさの太陽" },
      { luck: 91, message: "二人きりになれるチャンス到来", item: "タイミング", card: "好機の時計" },
      { luck: 89, message: "デートのお誘いを受けそう！", item: "予定表", card: "招待の手紙" },
      { luck: 86, message: "恋のライバルに差をつけられる日", item: "魅力", card: "輝きのダイヤ" },
      { luck: 83, message: "好きな人から特別扱いされるかも♪", item: "特別感", card: "VIPの証" },
      { luck: 80, message: "恋愛相談に乗ると自分にも幸運が", item: "親身さ", card: "善行の循環" },
      { luck: 77, message: "片思いが両思いになる予感！", item: "希望", card: "両想いのハート" },
      { luck: 74, message: "好きな人の好みが分かって距離が縮まる", item: "観察眼", card: "理解の鍵" },
      { luck: 71, message: "恋バナで情報ゲット！作戦を練ろう", item: "情報", card: "情報の地図" },
      { luck: 68, message: "偶然を装って好きな人に会えそう", item: "計画性", card: "偶然という名の必然" },
      { luck: 65, message: "好きな人から褒められて嬉しい日", item: "素直な心", card: "喜びの花火" },
      { luck: 62, message: "恋愛運まずまず。チャンスを逃さないで", item: "注意力", card: "チャンスの鳥" },
      { luck: 59, message: "友達の紹介で良い出会いがあるかも", item: "社交性", card: "紹介の糸" },
      { luck: 56, message: "じっくり関係を深める日。焦りは禁物", item: "ゆとり", card: "成長の木" },
      { luck: 53, message: "恋愛より自分の時間を楽しんで", item: "趣味", card: "自分時間の宝石" },
      { luck: 50, message: "普通の日。無理せずいつも通りで", item: "平常心", card: "日常の幸せ" },
      { luck: 92, message: "恋のドキドキが止まらない予感", item: "ときめき", card: "恋心の蝶" },
      { luck: 88, message: "好きな人との会話が弾む日", item: "話題", card: "会話の花" },
      { luck: 85, message: "デートの計画を立てるのに最適な日", item: "プランニング", card: "計画の設計図" },
      { luck: 82, message: "恋愛運上昇中！積極的に動いて", item: "行動力", card: "上昇の風" },
      { luck: 79, message: "好きな人から頼りにされそう", item: "信頼", card: "頼られる柱" },
      { luck: 76, message: "恋のチャンスは今日かも！見逃さないで", item: "アンテナ", card: "察知の第六感" },
      { luck: 73, message: "好きな人との距離が自然と縮まる", item: "自然体", card: "自然の流れ" },
      { luck: 70, message: "恋愛運良好。笑顔で過ごそう", item: "笑顔", card: "笑顔の魔法" },
      { luck: 67, message: "好きな人の本音が聞けるかも", item: "聞く力", card: "真実の耳" },
      { luck: 64, message: "恋愛相談されて距離が縮まる予感", item: "相談相手", card: "相談の椅子" }
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

    // 生年月日から相性スコアを計算
    const userSum = parseInt(userYear) + parseInt(userMonth) + parseInt(userDay);
    const partnerSum = parseInt(partnerYear) + parseInt(partnerMonth) + parseInt(partnerDay);
    const diff = Math.abs(userDate - partnerDate);
    const baseScore = 50 + ((userSum + partnerSum + diff) % 48);

    // 月の相性チェック
    const monthCompatibility = Math.abs(parseInt(userMonth) - parseInt(partnerMonth));
    let monthBonus = 0;
    if (monthCompatibility === 0) monthBonus = 10; // 同じ月
    else if (monthCompatibility === 6) monthBonus = 8; // 6ヶ月違い
    else if (monthCompatibility <= 2 || monthCompatibility >= 10) monthBonus = 5; // 近い月

    const score = Math.min(98, baseScore + monthBonus);

    // スコアに応じたメッセージパターン
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

  if (!avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2rem] shadow-2xl p-10 max-w-lg w-full text-center border-4 border-pink-200">
          <Heart className="w-24 h-24 mx-auto mb-6 text-pink-500 animate-bounce" />
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent transform -rotate-2">
            恋愛相談アプリ
          </h1>
          <p className="text-xl text-gray-600 mb-10 font-bold">あなたのアバターを選んでね♪</p>
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => setAvatar('female')}
              className="group flex flex-col items-center gap-3 p-6 rounded-[2rem] border-4 border-pink-200 bg-white hover:border-pink-500 hover:bg-pink-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center text-white text-5xl shadow-lg group-hover:scale-110 transition-transform">
                👩
              </div>
              <span className="text-xl font-bold text-gray-700">女性</span>
            </button>
            <button
              onClick={() => setAvatar('male')}
              className="group flex flex-col items-center gap-3 p-6 rounded-[2rem] border-4 border-blue-200 bg-white hover:border-blue-500 hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-5xl shadow-lg group-hover:scale-110 transition-transform">
                👨
              </div>
              <span className="text-xl font-bold text-gray-700">男性</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50 font-rounded">
      <div className="max-w-4xl mx-auto pb-24">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md shadow-lg p-4 sticky top-0 z-50 border-b-4 border-pink-100">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-md ${avatar === 'female' ? 'bg-gradient-to-br from-pink-400 to-pink-600' : 'bg-gradient-to-br from-blue-400 to-blue-600'
                }`}>
                {avatar === 'female' ? '👩' : '👨'}
              </div>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                恋愛相談アプリ
              </h1>
            </div>
            <div className="bg-pink-100 p-3 rounded-full shadow-inner">
              <Heart className="w-8 h-8 text-pink-500 fill-current animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'chat' && (
            <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-white">
              <div className="bg-gradient-to-r from-pink-500 to-orange-400 p-6 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> AI恋愛カウンセラー
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setChatMode('empathy')}
                    className={`flex-1 py-3 px-6 rounded-full transition-all border-4 ${chatMode === 'empathy'
                      ? 'bg-white text-pink-500 font-bold shadow-lg border-pink-200 transform -translate-y-1'
                      : 'bg-white/20 text-white hover:bg-white/30 border-transparent'
                      }`}
                  >
                    <Heart className="w-5 h-5 inline mr-2" />
                    共感重視
                  </button>
                  <button
                    onClick={() => setChatMode('solution')}
                    className={`flex-1 py-3 px-6 rounded-full transition-all border-4 ${chatMode === 'solution'
                      ? 'bg-white text-orange-500 font-bold shadow-lg border-orange-200 transform -translate-y-1'
                      : 'bg-white/20 text-white hover:bg-white/30 border-transparent'
                      }`}
                  >
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    解決策提示
                  </button>
                </div>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-gray-400 mt-20">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>恋愛の悩みを相談してみてください</p>
                  </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-5 rounded-[2rem] whitespace-pre-wrap text-lg font-medium shadow-sm ${msg.role === 'user'
                      ? 'bg-gradient-to-tr from-pink-400 to-pink-500 text-white rounded-tr-none shadow-md'
                      : 'bg-white text-gray-700 border-4 border-pink-100 rounded-tl-none'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="恋愛の悩みを入力してね..."
                    className="flex-1 p-4 text-lg rounded-full border-4 border-pink-200 focus:border-pink-500 focus:outline-none placeholder-pink-300 bg-pink-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white p-4 rounded-full hover:shadow-lg transition-all disabled:opacity-50 transform hover:-translate-y-1 shadow-md"
                  >
                    <Send className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fortune' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-pink-100">
              <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent transform -rotate-1">
                今日の恋愛運
              </h2>

              {!fortuneRevealed ? (
                <div className="text-center py-12">
                  <div className="w-56 h-72 mx-auto mb-10 bg-gradient-to-br from-orange-300 to-pink-400 rounded-[2rem] shadow-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform relative overflow-hidden border-4 border-white ring-4 ring-pink-100"
                    onClick={generateDailyFortune}>
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-pink-400/20 animate-pulse"></div>
                    <Moon className="w-32 h-32 text-white relative z-10 animate-bounce" />
                  </div>
                  <button
                    onClick={generateDailyFortune}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white text-2xl font-bold px-12 py-5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105"
                  >
                    カードをめくる
                  </button>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="mb-6 p-8 bg-gradient-to-br from-orange-50 to-pink-50 rounded-[2rem] border-4 border-pink-100">
                    <div className="text-2xl font-bold text-orange-500 mb-2">{dailyFortune.card}</div>
                    <Sun className="w-16 h-16 mx-auto text-yellow-400 mb-2" />
                  </div>
                  <div className="text-7xl font-black text-pink-500 mb-6 drop-shadow-sm">{dailyFortune.luck}%</div>
                  <div className="text-2xl mb-8 font-bold text-gray-700">{dailyFortune.message}</div>
                  <div className="bg-pink-50 p-6 rounded-[1.5rem] border-2 border-pink-100">
                    <p className="text-sm text-gray-500 mb-2 font-bold">ラッキーアイテム</p>
                    <p className="text-xl font-bold text-pink-500">{dailyFortune.item}</p>
                  </div>
                  <button
                    onClick={() => setFortuneRevealed(false)}
                    className="mt-8 text-orange-500 hover:text-orange-600 transition-colors font-bold text-lg border-b-2 border-orange-200"
                  >
                    もう一度めくる
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-pink-100">
              <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                恋愛性格診断
              </h2>

              {!quizResult ? (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                      <span>質問 {quizStep + 1} / {quizQuestions.length}</span>
                      <span>{Math.round((quizStep / quizQuestions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(quizStep / quizQuestions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-6 text-gray-800">
                      {quizQuestions[quizStep].question}
                    </h3>
                    <div className="space-y-3">
                      {quizQuestions[quizStep].options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => submitQuizAnswer(idx)}
                          className="w-full p-6 text-lg font-bold text-left rounded-[1.5rem] border-4 border-gray-100 hover:border-pink-400 hover:bg-pink-50 transition-all hover:shadow-lg hover:text-pink-600 active:scale-95"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white ring-4 ring-pink-100">
                    <Heart className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 text-pink-500">{quizResult.name}</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{quizResult.description}</p>
                  <button
                    onClick={() => {
                      setQuizStep(0);
                      setQuizAnswers([]);
                      setQuizResult(null);
                    }}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold hover:shadow-xl transition-all text-xl transform hover:-translate-y-1"
                  >
                    もう一度診断する
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compatibility' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border-4 border-pink-100">
              <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                相性診断
              </h2>

              {!compatibilityResult ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      あなたの誕生日
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="年"
                        value={compatibilityInput.userYear}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, userYear: e.target.value })}
                        className="flex-1 p-4 text-lg rounded-[1.5rem] border-4 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 font-bold"
                        min="1900"
                        max="2100"
                      />
                      <input
                        type="number"
                        placeholder="月"
                        value={compatibilityInput.userMonth}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, userMonth: e.target.value })}
                        className="w-24 p-4 text-lg rounded-[1.5rem] border-4 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 font-bold text-center"
                        min="1"
                        max="12"
                      />
                      <input
                        type="number"
                        placeholder="日"
                        value={compatibilityInput.userDay}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, userDay: e.target.value })}
                        className="w-24 p-4 text-lg rounded-[1.5rem] border-4 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 font-bold text-center"
                        min="1"
                        max="31"
                      />
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <Heart className="w-10 h-10 mx-auto text-pink-300 animate-pulse" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      お相手の誕生日
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="年"
                        value={compatibilityInput.partnerYear}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, partnerYear: e.target.value })}
                        className="flex-1 p-4 text-lg rounded-[1.5rem] border-4 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 font-bold"
                        min="1900"
                        max="2100"
                      />
                      <input
                        type="number"
                        placeholder="月"
                        value={compatibilityInput.partnerMonth}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, partnerMonth: e.target.value })}
                        className="w-24 p-4 text-lg rounded-[1.5rem] border-4 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 font-bold text-center"
                        min="1"
                        max="12"
                      />
                      <input
                        type="number"
                        placeholder="日"
                        value={compatibilityInput.partnerDay}
                        onChange={(e) => setCompatibilityInput({ ...compatibilityInput, partnerDay: e.target.value })}
                        className="w-24 p-4 text-lg rounded-[1.5rem] border-4 border-pink-100 focus:border-pink-500 focus:outline-none bg-pink-50 font-bold text-center"
                        min="1"
                        max="31"
                      />
                    </div>
                  </div>

                  <button
                    onClick={calculateCompatibility}
                    disabled={!compatibilityInput.userYear || !compatibilityInput.userMonth || !compatibilityInput.userDay ||
                      !compatibilityInput.partnerYear || !compatibilityInput.partnerMonth || !compatibilityInput.partnerDay}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-2xl py-6 rounded-full font-bold shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 transform hover:-translate-y-1 mt-4"
                  >
                    相性を診断する
                  </button>
                </div>
              ) : (
                <div className="text-center animate-fade-in">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#fce7f3"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="url(#gradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - compatibilityResult.score / 100)}`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ec4899" />
                          <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl font-black text-pink-500 drop-shadow-sm">{compatibilityResult.score}%</span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-pink-600 mb-4">{compatibilityResult.message}</h3>
                  <div className="bg-pink-50 p-6 rounded-[1.5rem] mb-8 border-4 border-pink-100">
                    <p className="text-gray-800 leading-relaxed text-left font-medium text-lg">{compatibilityResult.detail}</p>
                  </div>

                  <button
                    onClick={() => {
                      setCompatibilityResult(null);
                      setCompatibilityInput({ userYear: '', userMonth: '', userDay: '', partnerYear: '', partnerMonth: '', partnerDay: '' });
                    }}
                    className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-10 py-4 rounded-full font-bold hover:shadow-xl transition-all text-xl transform hover:-translate-y-1"
                  >
                    もう一度診断する
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-[0_-5px_20px_rgba(255,182,193,0.4)] border-t-4 border-pink-100 rounded-t-[2.5rem]">
          <div className="max-w-4xl mx-auto flex justify-around p-4 pb-8">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'chat' ? 'text-pink-500 bg-pink-50 scale-110 shadow-md ring-2 ring-pink-100' : 'text-gray-400 hover:text-pink-300'
                }`}
            >
              <MessageCircle className={`w-8 h-8 ${activeTab === 'chat' ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">相談</span>
            </button>
            <button
              onClick={() => setActiveTab('fortune')}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'fortune' ? 'text-pink-500 bg-pink-50 scale-110 shadow-md ring-2 ring-pink-100' : 'text-gray-400 hover:text-pink-300'
                }`}
            >
              <Sparkles className={`w-8 h-8 ${activeTab === 'fortune' ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">占い</span>
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'quiz' ? 'text-pink-500 bg-pink-50 scale-110 shadow-md ring-2 ring-pink-100' : 'text-gray-400 hover:text-pink-300'
                }`}
            >
              <User className={`w-8 h-8 ${activeTab === 'quiz' ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">診断</span>
            </button>
            <button
              onClick={() => setActiveTab('compatibility')}
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'compatibility' ? 'text-pink-500 bg-pink-50 scale-110 shadow-md ring-2 ring-pink-100' : 'text-gray-400 hover:text-pink-300'
                }`}
            >
              <Users className={`w-8 h-8 ${activeTab === 'compatibility' ? 'fill-current' : ''}`} />
              <span className="text-xs font-bold">相性</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoveCounselingApp;

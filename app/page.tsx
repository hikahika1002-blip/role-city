"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./supabase";
import { toBlob } from "html-to-image";
import QRCode from "react-qr-code";

type Role =
  | "育成者"
  | "支援者"
  | "改善者"
  | "設計者"
  | "連結者"
  | "発信者"
  | "創造者"
  | "探究者";

type Question = {
  id: number;
  type: "single" | "multi";
  question: string;
  maxSelect?: number;
  options: string[];
};

type CharacterConfig = {
  outfit: string;
  item: string;
  background: string;
};

const SITE_URL = "https://role-city.vercel.app";

const questions: Question[] = [
  {
    id: 1,
    type: "single",
    question: "将来、社会でどんなことをしたいか言葉で説明できますか？",
    options: [
      "全くできない",
      "あまりできない",
      "どちらともいえない",
      "ある程度できる",
      "明確にできる",
    ],
  },
  {
    id: 2,
    type: "multi",
    question:
      "次のテーマの中で「もっと知りたい」「関わってみたい」と思うものは？（最大2つ）",
    maxSelect: 2,
    options: [
      "教育",
      "福祉",
      "社会の仕組み",
      "人と人のつながり",
      "メディアや情報",
      "文化や表現",
      "テクノロジー",
      "研究",
    ],
  },
  {
    id: 3,
    type: "multi",
    question: "社会を見ていて「これはおかしい」と感じることは？（最大2つ）",
    maxSelect: 2,
    options: [
      "困っている人が助けられていない",
      "成長の機会が少ない",
      "社会の仕組みが非効率",
      "人と人が分断されている",
      "情報が広がらない",
      "文化が生まれにくい",
      "挑戦する人が少ない",
      "問題の原因が分からない",
    ],
  },
  {
    id: 4,
    type: "single",
    question: "もし社会問題に関わるなら、一番やりたいことは？",
    options: [
      "人を直接支える",
      "人を育てる",
      "問題を調べる",
      "仕組みを作る",
      "人をつなぐ",
      "情報を広げる",
      "表現を作る",
      "新しいことに挑戦する",
    ],
  },
  {
    id: 5,
    type: "multi",
    question: "周りからよく言われる、あなたの特徴は？（最大2つ）",
    maxSelect: 2,
    options: [
      "面倒見がいい",
      "人を育てるのが得意",
      "問題発見が得意",
      "仕組み思考",
      "人をつなぐ",
      "発信力",
      "クリエイティブ",
      "好奇心",
    ],
  },
  {
    id: 6,
    type: "multi",
    question:
      "もし社会を少しだけ良くできるとしたら、どんなことを変えたい？（最大2つ）",
    maxSelect: 2,
    options: [
      "教育",
      "福祉",
      "社会制度",
      "地域",
      "情報",
      "文化",
      "技術",
      "未知領域",
      "特にない",
    ],
  },
];

const roleDescriptions: Record<Role, string> = {
  育成者: "人の成長を支える役割",
  支援者: "困っている人を助ける役割",
  改善者: "問題を見つけて直す役割",
  設計者: "社会の仕組みを作る役割",
  連結者: "人と人をつなぐ役割",
  発信者: "価値を社会に広げる役割",
  創造者: "新しい文化や表現を作る役割",
  探究者: "未知を深く探る役割",
};

const roleAreaNames: Record<Role, string> = {
  育成者: "Growth Garden",
  支援者: "Care Harbor",
  改善者: "Repair Garage",
  設計者: "Design District",
  連結者: "Connection Square",
  発信者: "Media Tower",
  創造者: "Creative Studio",
  探究者: "Frontier Lab",
};

const roleEmojiMap: Record<Role, string> = {
  育成者: "🌱",
  支援者: "🤝",
  改善者: "🛠️",
  設計者: "🏛️",
  連結者: "🔗",
  発信者: "📡",
  創造者: "🎨",
  探究者: "🧪",
};

const roleGradientMap: Record<Role, string> = {
  育成者: "from-emerald-400 via-green-400 to-lime-300",
  支援者: "from-sky-400 via-cyan-400 to-blue-300",
  改善者: "from-orange-400 via-amber-400 to-yellow-300",
  設計者: "from-blue-500 via-indigo-500 to-sky-400",
  連結者: "from-yellow-300 via-amber-300 to-orange-300",
  発信者: "from-violet-500 via-purple-500 to-fuchsia-400",
  創造者: "from-pink-400 via-rose-400 to-fuchsia-300",
  探究者: "from-indigo-500 via-violet-500 to-blue-400",
};

const roleColorHexMap: Record<Role, string> = {
  育成者: "#22c55e",
  支援者: "#38bdf8",
  改善者: "#f97316",
  設計者: "#2563eb",
  連結者: "#f59e0b",
  発信者: "#8b5cf6",
  創造者: "#ec4899",
  探究者: "#4f46e5",
};

const roleLightHexMap: Record<Role, string> = {
  育成者: "#dcfce7",
  支援者: "#e0f2fe",
  改善者: "#ffedd5",
  設計者: "#dbeafe",
  連結者: "#fef3c7",
  発信者: "#ede9fe",
  創造者: "#fce7f3",
  探究者: "#e0e7ff",
};

const roleSoftClassMap: Record<Role, string> = {
  育成者: "bg-emerald-50 border-emerald-200 text-emerald-700",
  支援者: "bg-sky-50 border-sky-200 text-sky-700",
  改善者: "bg-orange-50 border-orange-200 text-orange-700",
  設計者: "bg-blue-50 border-blue-200 text-blue-700",
  連結者: "bg-amber-50 border-amber-200 text-amber-700",
  発信者: "bg-violet-50 border-violet-200 text-violet-700",
  創造者: "bg-pink-50 border-pink-200 text-pink-700",
  探究者: "bg-indigo-50 border-indigo-200 text-indigo-700",
};

const scoreMap: Record<number, Record<string, Role | null>> = {
  2: {
    教育: "育成者",
    福祉: "支援者",
    社会の仕組み: "設計者",
    "人と人のつながり": "連結者",
    "メディアや情報": "発信者",
    "文化や表現": "創造者",
    テクノロジー: "設計者",
    研究: "探究者",
  },
  3: {
    困っている人が助けられていない: "支援者",
    成長の機会が少ない: "育成者",
    社会の仕組みが非効率: "改善者",
    人と人が分断されている: "連結者",
    情報が広がらない: "発信者",
    文化が生まれにくい: "創造者",
    挑戦する人が少ない: "探究者",
    問題の原因が分からない: "探究者",
  },
  4: {
    人を直接支える: "支援者",
    人を育てる: "育成者",
    問題を調べる: "探究者",
    仕組みを作る: "設計者",
    人をつなぐ: "連結者",
    情報を広げる: "発信者",
    表現を作る: "創造者",
    新しいことに挑戦する: "探究者",
  },
  5: {
    面倒見がいい: "支援者",
    人を育てるのが得意: "育成者",
    問題発見が得意: "改善者",
    仕組み思考: "設計者",
    人をつなぐ: "連結者",
    発信力: "発信者",
    クリエイティブ: "創造者",
    好奇心: "探究者",
  },
  6: {
    教育: "育成者",
    福祉: "支援者",
    社会制度: "設計者",
    地域: "連結者",
    情報: "発信者",
    文化: "創造者",
    技術: "設計者",
    未知領域: "探究者",
    特にない: null,
  },
};

const industriesByRole: Record<Role, string[]> = {
  育成者: ["教育", "人材育成", "研修", "コーチング", "保育"],
  支援者: ["福祉", "医療支援", "NPO", "地域支援", "相談支援"],
  改善者: ["業務改善", "品質管理", "コンサル", "運用設計", "行政改善"],
  設計者: ["IT / プロダクト開発", "事業企画", "制度設計", "サービスデザイン", "都市 / 政策"],
  連結者: ["コミュニティ運営", "営業", "地域連携", "イベント企画", "広報"],
  発信者: ["メディア", "広告", "出版", "SNS運用", "PR"],
  創造者: ["デザイン", "映像", "アート", "ブランド企画", "コンテンツ制作"],
  探究者: ["研究", "開発", "教育", "分析", "R&D"],
};

const valueKeywordsByRole: Record<Role, string[]> = {
  育成者: ["成長支援", "学び", "可能性を伸ばすこと"],
  支援者: ["安心", "支援", "誰かの役に立つこと"],
  改善者: ["問題解決", "効率化", "より良くすること"],
  設計者: ["仕組み化", "構造設計", "社会実装"],
  連結者: ["つながり", "協働", "関係づくり"],
  発信者: ["伝達", "影響力", "価値を広げること"],
  創造者: ["表現", "独自性", "新しい価値づくり"],
  探究者: ["知的好奇心", "発見", "未知を深く知ること"],
};

const reasonTemplatesByRolePair: Partial<Record<`${Role}-${Role}`, string[]>> = {
  "探究者-設計者": [
    "問題を深く理解した上で仕組みに落とし込む力が活きやすい",
    "分析だけで終わらず、社会実装までつなげやすい",
    "構造を考える仕事や研究開発と相性がいい",
  ],
  "設計者-探究者": [
    "仕組みを考える力に加え、原因を深掘る姿勢がある",
    "制度やサービスを根拠ベースで設計しやすい",
    "研究・開発・企画を横断しやすい",
  ],
  "育成者-探究者": [
    "人の成長を支えながら、学びや仕組みそのものを深く考えられる",
    "教育・研究・探究学習の文脈と相性がいい",
    "人を見る視点と問いを深める視点を両立しやすい",
  ],
  "探究者-育成者": [
    "知を深めるだけでなく、それを人の成長支援に使いやすい",
    "教育や学習支援で独自の価値を出しやすい",
    "探究と育成をつなげる役割に向いている",
  ],
  "探究者-発信者": [
    "知識や情報を深く掘り下げ、それを人に伝える力が活きやすい",
    "調べる力と広げる力の両方を使える環境と相性がいい",
    "社会に意味あるテーマを発見し、発信につなげやすい",
  ],
  "発信者-探究者": [
    "発信するだけでなく、内容を深く理解して言葉にできる",
    "表面的でない情報発信ができる",
    "伝える力と分析力の両方が活きる",
  ],
};

const mainRoleCatchCopy: Record<Role, string> = {
  育成者: "人の成長を支え、可能性を伸ばすタイプ",
  支援者: "困っている人に寄り添い、支えるタイプ",
  改善者: "問題を見つけ、より良く直していくタイプ",
  設計者: "社会の仕組みを考え、形にするタイプ",
  連結者: "人と人をつなぎ、関係を動かすタイプ",
  発信者: "価値を見つけ、社会に広げるタイプ",
  創造者: "新しい表現や価値を生み出すタイプ",
  探究者: "未知を深く掘り下げ、問いを育てるタイプ",
};

const roleMetaMap: Record<Role, { no: string; className: string }> = {
  育成者: { no: "01", className: "GROWER" },
  支援者: { no: "02", className: "SUPPORTER" },
  改善者: { no: "03", className: "IMPROVER" },
  設計者: { no: "04", className: "DESIGNER" },
  連結者: { no: "05", className: "CONNECTOR" },
  発信者: { no: "06", className: "BROADCASTER" },
  創造者: { no: "07", className: "CREATOR" },
  探究者: { no: "08", className: "EXPLORER" },
};

const roleCharacterMap: Record<Role, CharacterConfig> = {
  育成者: { outfit: "教師", item: "ノート", background: "学校" },
  支援者: { outfit: "活動家", item: "ノート", background: "都市" },
  改善者: { outfit: "エンジニア", item: "工具", background: "研究所" },
  設計者: { outfit: "エンジニア", item: "PC", background: "都市" },
  連結者: { outfit: "起業家", item: "マイク", background: "都市" },
  発信者: { outfit: "活動家", item: "カメラ", background: "スタジオ" },
  創造者: { outfit: "デザイナー", item: "カメラ", background: "スタジオ" },
  探究者: { outfit: "研究者", item: "本", background: "研究所" },
};

const outfitColorMap: Record<string, string> = {
  起業家: "#2563eb",
  研究者: "#7c3aed",
  教師: "#16a34a",
  エンジニア: "#ea580c",
  デザイナー: "#db2777",
  活動家: "#dc2626",
};

const backgroundColorMap: Record<string, string> = {
  都市: "#dbeafe",
  学校: "#dcfce7",
  研究所: "#ede9fe",
  宇宙: "#111827",
  森: "#d9f99d",
  スタジオ: "#fce7f3",
};

const itemEmojiMap: Record<string, string> = {
  PC: "💻",
  本: "📘",
  カメラ: "📷",
  ノート: "📓",
  マイク: "🎤",
  工具: "🛠️",
};

const persistenceQuestions = [
  "興味を持ったテーマは、時間がかかっても深く調べたくなる",
  "社会とのつながりが見えると、学ぶ意欲が上がる",
  "自分の役割を言葉にできると、行動しやすくなる",
] as const;

const postOptions = [
  "全くできない",
  "あまりできない",
  "どちらともいえない",
  "ある程度できる",
  "明確にできる",
] as const;

const nextActionsByRole: Record<Role, string[]> = {
  育成者: [
    "最近まわりで伸び悩んでいる人や場面を1つ思い出し、何を支えると前進しそうかを1文で書く",
    "自分が人の成長を助けられそうなテーマを1つ決めて、明日できる小さな支援行動を1つ決める",
    "ROLE CITYカードを見せながら『自分は何を育てたい人か』を誰かに説明して反応を聞く",
  ],
  支援者: [
    "身近で困っている人や不便な状況を1つ選び、何が足りないのかを具体的に3つ書く",
    "自分にできる支援の形を『話を聞く / 情報を渡す / 行動を手伝う』の3つから1つ選ぶ",
    "ROLE CITYカードを見せて『自分が支えたい対象は誰か』をスタッフや友人に話してみる",
  ],
  改善者: [
    "学校・部活・日常で『非効率だ』と思う流れを1つ選び、どこがムダかを言葉にする",
    "その問題を『今すぐ変えられる部分』と『仕組みから変える部分』に分けてメモする",
    "ROLE CITYカードを使って『自分は何を改善したい人か』を説明し、別視点の意見をもらう",
  ],
  設計者: [
    "自分が変えたい社会の仕組みを1つ選び、誰が困っていて何を整えるべきかを1文で書く",
    "そのテーマについて『対象 / 課題 / 解決策』の3項目を埋めて、小さな企画案の形にする",
    "ROLE CITYカードを見せて『自分は何を設計したいのか』を話し、ズレや抜けを確認する",
  ],
  連結者: [
    "つながっていない人・情報・地域・機会の中で、結び直したいものを1組選ぶ",
    "その2者がつながると何が起きるかを想像し、価値を短く書き出す",
    "ROLE CITYカードを使って『自分がつなぎたいもの』を説明し、紹介できそうな人を探す",
  ],
  発信者: [
    "広めたいテーマを1つ決めて、『誰に / 何を / なぜ』伝えたいのかを整理する",
    "そのテーマをSNS投稿・短文・一言説明の3パターンで表現してみる",
    "ROLE CITYカードを見せて『自分が発信で動かしたいもの』を誰かに話して反応を見る",
  ],
  創造者: [
    "自分が表現したいテーマを1つ選び、言葉・画像・デザインのどれで出すか決める",
    "そのテーマを30分以内で形にできる小作品に落としてみる",
    "ROLE CITYカードを使って『何を新しく生みたいのか』を説明し、印象に残った点を聞く",
  ],
  探究者: [
    "今いちばん気になる問いを1つ選び、なぜそれが気になるのかを3行で書く",
    "その問いを深めるために、調べるべき情報源を3つ決める",
    "ROLE CITYカードを見せて『自分は何を探究したいのか』を話し、別の問いをもらう",
  ],
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function scoreLabelToNumber(label: string | null | undefined) {
  const map: Record<string, number> = {
    全くできない: 1,
    あまりできない: 2,
    どちらともいえない: 3,
    ある程度できる: 4,
    明確にできる: 5,
  };
  return label ? map[label] ?? 0 : 0;
}

function CharacterArt({
  role,
  outfit,
  item,
  background,
  size = 220,
  showLabel = true,
}: {
  role?: Role;
  outfit: string;
  item: string;
  background: string;
  size?: number;
  showLabel?: boolean;
}) {
  const outfitColor = outfitColorMap[outfit] || "#94a3b8";
  const bgColor = backgroundColorMap[background] || "#e5e7eb";
  const itemEmoji = itemEmojiMap[item] || "✨";
  const accent = role ? roleColorHexMap[role] : outfitColor;
  const lightAccent = role ? roleLightHexMap[role] : "#eff6ff";
  const isSpace = background === "宇宙";
  const ratio = size / 220;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-white/70 shadow-lg backdrop-blur-sm",
        isSpace ? "bg-slate-950" : "bg-white"
      )}
      style={{
        width: Math.round(180 * ratio),
        minWidth: Math.round(180 * ratio),
        background: isSpace
          ? "radial-gradient(circle at 50% 30%, #1e3a8a 0%, #0f172a 45%, #020617 100%)"
          : `linear-gradient(180deg, ${bgColor} 0%, #ffffff 100%)`,
      }}
    >
      {isSpace ? (
        <>
          <span className="absolute left-4 top-4 text-[10px] text-white/70">✦</span>
          <span className="absolute right-8 top-8 text-xs text-white/60">✦</span>
          <span className="absolute right-5 bottom-10 text-[10px] text-white/70">✦</span>
          <span className="absolute left-8 bottom-16 text-[11px] text-white/60">✦</span>
        </>
      ) : (
        <>
          <div className="absolute inset-x-0 bottom-0 h-10 bg-white/50" />
          <div
            className="absolute left-1/2 top-5 h-16 w-16 -translate-x-1/2 rounded-full blur-2xl"
            style={{ backgroundColor: `${accent}44` }}
          />
        </>
      )}

      <div className="relative flex flex-col items-center px-4 py-4">
        {showLabel && (
          <div className="mb-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-slate-700 backdrop-blur">
            AVATAR
          </div>
        )}

        <svg width={size * 0.82} height={size} viewBox="0 0 180 220" aria-hidden="true">
          <ellipse cx="90" cy="204" rx="42" ry="10" fill="#0f172a18" />

          <circle cx="90" cy="50" r="28" fill="#fffaf5" stroke="#cbd5e1" strokeWidth="3" />
          <path d="M62 48 Q90 12 118 48" fill={accent} opacity="0.95" />
          <path d="M68 34 Q90 18 112 34" fill={lightAccent} opacity="0.65" />
          <circle cx="80" cy="50" r="2.8" fill="#111827" />
          <circle cx="100" cy="50" r="2.8" fill="#111827" />
          <path
            d="M80 63 Q90 69 100 63"
            stroke="#111827"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          <circle cx="90" cy="98" r="38" fill={outfitColor} opacity="0.16" />
          <rect
            x="55"
            y="78"
            width="70"
            height="86"
            rx="34"
            fill={outfitColor}
            stroke="#94a3b8"
            strokeWidth="3"
          />
          <ellipse cx="90" cy="86" rx="22" ry="12" fill="#ffffff20" />
          <circle cx="76" cy="110" r="4" fill="#ffffff55" />
          <circle cx="104" cy="124" r="3" fill="#ffffff40" />

          <line x1="55" y1="108" x2="34" y2="138" stroke="#94a3b8" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="125" y1="108" x2="146" y2="138" stroke="#94a3b8" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="78" y1="163" x2="70" y2="198" stroke="#94a3b8" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="102" y1="163" x2="110" y2="198" stroke="#94a3b8" strokeWidth="5.5" strokeLinecap="round" />

          <circle cx="142" cy="136" r="18" fill="#ffffff" stroke={accent} strokeWidth="2.5" />
          <text x="142" y="143" textAnchor="middle" fontSize="17">
            {itemEmoji}
          </text>

          {role && (
            <>
              <circle cx="36" cy="40" r="16" fill={lightAccent} stroke={accent} strokeWidth="2.5" />
              <text x="36" y="46" textAnchor="middle" fontSize="15">
                {roleEmojiMap[role]}
              </text>
            </>
          )}
        </svg>

        <div className={cn("mt-2 text-center", isSpace ? "text-white" : "text-slate-700")}>
          <p className="text-xs font-bold tracking-[0.18em] opacity-80">{outfit}</p>
          <p className="mt-1 text-[11px] opacity-80">
            {item} / {background}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChoiceGrid({
  options,
  selected,
  onSelect,
  multi = false,
  maxSelect = 1,
  size = "md",
}: {
  options: readonly string[] | string[];
  selected: string[];
  onSelect: (value: string) => void;
  multi?: boolean;
  maxSelect?: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="grid gap-3">
      {options.map((option) => {
        const active = selected.includes(option);
        const disabled = !active && multi && selected.length >= maxSelect;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            disabled={disabled}
            className={cn(
              "group flex w-full items-center justify-between rounded-[20px] border px-4 text-left transition",
              size === "sm"
                ? "min-h-[52px] py-3 text-sm sm:text-base"
                : "min-h-[60px] py-3.5 text-[15px] sm:min-h-[64px] sm:text-base",
              active
                ? "border-sky-500 bg-sky-50 text-sky-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/40",
              disabled && "cursor-not-allowed opacity-45"
            )}
          >
            <span className="pr-4 font-medium leading-7">{option}</span>
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg font-bold transition",
                active
                  ? "border-sky-500 bg-sky-500 text-white"
                  : "border-slate-200 bg-slate-50 text-slate-400 group-hover:border-sky-200 group-hover:text-sky-500"
              )}
            >
              {active ? "✓" : "＋"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RoleCard({
  mainRole,
  subRole: _subRole,
  myRole,
  age,
  affiliation,
  character,
  characterName,
}: {
  mainRole: Role;
  subRole: Role;
  myRole: string;
  age: string;
  affiliation: string;
  character: CharacterConfig;
  characterName: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-xl sm:max-w-[420px] md:max-w-[860px]">
      <div
        className={cn(
          "relative overflow-hidden px-4 py-3 text-white sm:px-5 sm:py-4",
          `bg-gradient-to-r ${roleGradientMap[mainRole]}`
        )}
      >
        <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-white/10 blur-2xl sm:h-20 sm:w-20" />
        <div className="absolute -left-4 bottom-0 h-14 w-14 rounded-full bg-white/10 blur-2xl sm:h-16 sm:w-16" />

        <div className="relative flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] backdrop-blur">
            No.{roleMetaMap[mainRole].no}
          </span>
          <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-black tracking-[0.12em] backdrop-blur">
            {roleMetaMap[mainRole].className}
          </span>
        </div>

        <div className="relative mt-3 rounded-2xl bg-white/16 px-3 py-2.5 backdrop-blur">
          <p className="text-[10px] font-black tracking-[0.16em] text-white/70">MAIN ROLE</p>
          <p className="mt-1 text-sm font-black text-white sm:text-base">
            {roleEmojiMap[mainRole]} {mainRole}
          </p>
          <p className="mt-0.5 text-[11px] text-white/80">{roleAreaNames[mainRole]}</p>
        </div>
      </div>

      <div className="grid gap-3 p-3 md:grid-cols-[1.2fr_0.8fr] md:gap-5 md:p-5">
        <div className="flex flex-col items-center gap-3 md:order-2">
          <div className="flex w-full justify-center">
            <CharacterArt
              role={mainRole}
              outfit={character.outfit}
              item={character.item}
              background={character.background}
              size={128}
            />
          </div>

          <div className="w-full max-w-[150px] rounded-xl border border-slate-200 bg-slate-50 p-2">
            <p className="text-[10px] font-bold tracking-[0.16em] text-slate-400">SHARE</p>
            <p className="mb-2 text-xs font-bold text-slate-700">ROLE CITY</p>

            <div className="flex justify-center rounded-lg bg-white p-2">
              <QRCode value={SITE_URL} size={52} />
            </div>
          </div>
        </div>

        <div className="md:order-1">
          <div
            className="mb-3 rounded-2xl border px-3 py-3"
            style={{
              backgroundColor: roleLightHexMap[mainRole],
              borderColor: `${roleColorHexMap[mainRole]}33`,
            }}
          >
            <p className="text-[10px] font-black tracking-[0.14em] text-slate-500">MAIN ROLE</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{roleDescriptions[mainRole]}</p>
          </div>

          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">NAME ON CARD</p>
            <p className="mt-1 text-base font-black text-slate-900 sm:text-lg">
              {characterName || "NO NAME"}
            </p>
          </div>

          <div className="mb-3">
            <p
              className="text-sm font-bold leading-6 text-slate-900"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {myRole}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-slate-700">
            <p className="text-[10px] font-black tracking-[0.16em] text-slate-400">PROFILE</p>
            <p className="mt-1 text-sm font-semibold">
              {age} / {affiliation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrePostDiffCard({
  preScore,
  postScore,
}: {
  preScore: string;
  postScore: string;
}) {
  const pre = scoreLabelToNumber(preScore);
  const post = scoreLabelToNumber(postScore);
  const diff = post - pre;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-black tracking-[0.16em] text-sky-600">PRE / POST</p>
      <h2 className="mt-3 text-2xl font-black text-slate-900">言語化変化</h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black tracking-[0.16em] text-slate-400">PRE</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{preScore || "-"}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-slate-500" style={{ width: `${(pre / 5) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{pre}/5</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black tracking-[0.16em] text-slate-400">POST</p>
          <p className="mt-2 text-sm font-semibold text-slate-700">{postScore || "-"}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky-500/15">
            <div className="h-full rounded-full bg-sky-500" style={{ width: `${(post / 5) * 100}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{post}/5</p>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <p className="text-xs font-black tracking-[0.16em] text-sky-600">DIFF</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{diff > 0 ? `+${diff}` : diff}</p>
          <p className="mt-2 text-sm text-slate-600">
            {diff > 0
              ? "診断後に役割言語化の自己評価が上昇"
              : diff === 0
              ? "自己評価は変化なし"
              : "診断後に自己評価が低下"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [age, setAge] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [characterName, setCharacterName] = useState("");

  const cardRef = useRef<HTMLDivElement | null>(null);

  const [answers, setAnswers] = useState<Record<number, string[]>>({});
  const [myRole, setMyRole] = useState("");
  const [postScore, setPostScore] = useState("");

  const [persistence1, setPersistence1] = useState(0);
  const [persistence2, setPersistence2] = useState(0);
  const [persistence3, setPersistence3] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [started, finished, submitted, currentQuestion]);

  const question = questions[currentQuestion];

  const result = useMemo(() => {
    const scores: Record<Role, number> = {
      育成者: 0,
      支援者: 0,
      改善者: 0,
      設計者: 0,
      連結者: 0,
      発信者: 0,
      創造者: 0,
      探究者: 0,
    };

    questions.forEach((q) => {
      if (q.id === 1) return;
      const selected = answers[q.id] || [];
      const point = q.type === "single" ? 3 : 2;

      selected.forEach((option) => {
        const role = scoreMap[q.id]?.[option];
        if (role) scores[role] += point;
      });
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [Role, number][];

    return {
      scores,
      top1: sorted[0]?.[0] ?? "探究者",
      top2: sorted[1]?.[0] ?? "設計者",
    };
  }, [answers]);

  const fixedCharacter = useMemo(() => roleCharacterMap[result.top1], [result.top1]);

  const interestAnswers = answers[2] || [];
  const concernAnswers = answers[3] || [];
  const actionAnswer = answers[4] || [];
  const strengthAnswers = answers[5] || [];
  const preScore = (answers[1] || [])[0] || "";

  const suggestedIndustries = useMemo(() => {
    return Array.from(new Set([...industriesByRole[result.top1], ...industriesByRole[result.top2]])).slice(0, 6);
  }, [result.top1, result.top2]);

  const valueKeywords = useMemo(() => {
    return Array.from(new Set([...valueKeywordsByRole[result.top1], ...valueKeywordsByRole[result.top2]])).slice(0, 5);
  }, [result.top1, result.top2]);

  const rolePairKey = `${result.top1}-${result.top2}` as `${Role}-${Role}`;

  const suggestedReasons = useMemo(() => {
    return (
      reasonTemplatesByRolePair[rolePairKey] ?? [
        `${result.top1}の「${roleDescriptions[result.top1].replace("役割", "")}」と、${result.top2}の「${roleDescriptions[result.top2].replace("役割", "")}」の両方が活きやすい`,
        "興味と価値観を社会の役割に変換しやすい",
        "個人の関心を具体的な仕事や活動に結びつけやすい",
      ]
    );
  }, [rolePairKey, result.top1, result.top2]);

  const roleText = useMemo(() => {
    const action = actionAnswer[0];
    const interest = interestAnswers[0];
    const concern = concernAnswers[0];
    const strength = strengthAnswers[0];

    return [
      `メイン役割は「${result.top1}」、サブ役割は「${result.top2}」です。`,
      action ? `関わり方の起点は「${action}」。` : "",
      interest ? `興味の入口は「${interest}」。` : "",
      concern ? `問題意識は「${concern}」に向きやすいです。` : "",
      strength ? `強みとしては「${strength}」が活きやすいです。` : "",
      suggestedIndustries[0] ? `向いている業種としては「${suggestedIndustries[0]}」周辺が有力です。` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [actionAnswer, concernAnswers, interestAnswers, result.top1, result.top2, strengthAnswers, suggestedIndustries]);

  const currentNextActions = useMemo(() => {
    return nextActionsByRole[result.top1];
  }, [result.top1]);

  const canStart = age.trim() !== "" && affiliation.trim() !== "";
  const canGoNext = (answers[question.id] || []).length > 0;
  const canShowCard =
    characterName.trim().length > 0 &&
    myRole.trim().length > 0 &&
    postScore !== "" &&
    persistence1 > 0 &&
    persistence2 > 0 &&
    persistence3 > 0;

  const handleSingleSelect = (option: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: [option] }));
  };

  const handleMultiSelect = (option: string) => {
    const currentAnswers = answers[question.id] || [];
    const exists = currentAnswers.includes(option);
    const max = question.maxSelect || 2;

    let newAnswers: string[];

    if (exists) {
      newAnswers = currentAnswers.filter((item) => item !== option);
    } else {
      if (currentAnswers.length >= max) return;
      newAnswers = [...currentAnswers, option];
    }

    setAnswers((prev) => ({ ...prev, [question.id]: newAnswers }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleSave = async () => {
    if (!cardRef.current) return;

    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      if (!blob) {
        alert("画像の生成に失敗しました");
        return;
      }

      const fileName = `role-city-card-${Date.now()}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };

      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({
          files: [file],
          title: "ROLE CITY CARD",
          text: "ROLE CITYの診断結果カードです",
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("save error", error);
      alert("保存に失敗しました。もう一度お試しください。");
    }
  };

  const handleShare = async () => {
    if (isSharing) return;

    const shareText = `ROLE CITYで ${result.top1} でした。`;

    try {
      setIsSharing(true);

      if (navigator.share) {
        await navigator.share({
          title: "ROLE CITY",
          text: shareText,
          url: SITE_URL,
        });
        return;
      }

      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(SITE_URL)}`,
        "_blank"
      );
    } catch (err) {
      console.error("share error", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canShowCard || submitted || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    const payload = {
      age: Number(age),
      affiliation,
      answers: {
        ...answers,
        auto_role_text: roleText,
      },
      pre_score: preScore,
      post_score: postScore,
      diff: scoreLabelToNumber(postScore) - scoreLabelToNumber(preScore),
      persistence_1: persistence1,
      persistence_2: persistence2,
      persistence_3: persistence3,
      top_role1: result.top1,
      top_role2: result.top2,
      role_type: `メイン:${result.top1} / サブ:${result.top2}`,
      role_text: myRole,
      character_outfit: fixedCharacter.outfit,
      character_item: fixedCharacter.item,
      character_background: fixedCharacter.background,
      character_name: characterName,
    };

    const { error } = await supabase.from("results").insert([payload]);

    if (error) {
      console.error("Supabase insert error:", error);
      setSubmitMessage(
        `保存に失敗しました: ${error.message}${error.details ? ` / ${error.details}` : ""}${error.hint ? ` / hint: ${error.hint}` : ""}`
      );
      setIsSubmitting(false);
      return;
    }

    setSubmitMessage("保存できました。");
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (!started) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fbff_35%,#f8fafc_100%)] px-4 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
          <div className="w-full space-y-5">
            <section className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-2xl backdrop-blur sm:p-8">
              <p className="text-sm font-black tracking-[0.26em] text-sky-600">ROLE CITY</p>

              <h1 className="mt-4 text-[34px] font-black leading-[1.15] tracking-[-0.03em] text-slate-900 sm:text-[56px] sm:leading-[1.05]">
                <span className="block">あなたのオリジナル</span>
                <span className="block">社会役割カードを作成</span>
              </h1>

              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                これは
                <span className="font-bold text-slate-800"> 3分のキャリア探究体験です</span>。
                <br />
                興味から、社会との接点と、あなたの役割の種を見つけましょう。
              </p>

              <div className="mt-7 grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-sky-700">年齢</label>
                  <input
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    type="number"
                    placeholder="例：17"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-sky-700">所属</label>
                  <select
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-400"
                  >
                    <option value="">選んでください</option>
                    <option value="中学生">中学生</option>
                    <option value="高校生">高校生</option>
                    <option value="大学生">大学生</option>
                    <option value="専門学生">専門学生</option>
                    <option value="社会人">社会人</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
              </div>

              <div className="mt-7 flex flex-col items-start gap-3">
                <button
                  onClick={() => setStarted(true)}
                  disabled={!canStart}
                  className={cn(
                    "w-full rounded-full px-8 py-4 text-lg font-black text-white transition sm:w-auto",
                    canStart ? "bg-sky-500 shadow-lg shadow-sky-200 hover:bg-sky-600" : "cursor-not-allowed bg-slate-300"
                  )}
                >
                  診断スタート
                </button>

                <p className="text-sm leading-7 text-slate-500">3分で終了</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  if (finished && !submitted) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fbff_35%,#f8fafc_100%)] px-4 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <section className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-xl backdrop-blur sm:p-6">
            <p className="text-sm font-black tracking-[0.26em] text-sky-600">ROLE CITY RESULT</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-black tracking-[0.14em]",
                  roleSoftClassMap[result.top1]
                )}
              >
                No.{roleMetaMap[result.top1].no}
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black tracking-[0.14em] text-slate-600">
                CLASS : {roleMetaMap[result.top1].className}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              あなたのメイン役割は「{result.top1}」
            </h1>

            <p className="mt-3 text-lg font-bold leading-8 text-slate-700">{mainRoleCatchCopy[result.top1]}</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">サブ役割：{result.top2}</p>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black tracking-[0.16em] text-sky-700">あなたの役割の仮説</p>
            <p className="mt-3 leading-8 text-slate-700">{roleText}</p>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs font-black tracking-[0.14em] text-slate-400">向いている業種</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestedIndustries.map((industry) => (
                    <span
                      key={industry}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-black tracking-[0.14em] text-slate-400">向いている理由</p>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
                  {suggestedReasons.map((reason) => (
                    <li key={reason}>・{reason}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-black tracking-[0.14em] text-slate-400">大事にしやすい価値観</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {valueKeywords.map((value) => (
                    <span
                      key={value}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium",
                        roleSoftClassMap[result.top1]
                      )}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black tracking-[0.16em] text-sky-600">POST</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              診断結果を元に、自分が社会でどんな役割を担いたいか言葉で説明できますか？
            </h2>
            <div className="mt-5">
              <ChoiceGrid
                options={postOptions}
                selected={postScore ? [postScore] : []}
                onSelect={setPostScore}
                size="sm"
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black tracking-[0.16em] text-sky-600">PERSISTENCE</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">探究持続性</h2>

            <div className="mt-5 space-y-6">
              {persistenceQuestions.map((label, idx) => {
                const value = [persistence1, persistence2, persistence3][idx];
                const setter = [setPersistence1, setPersistence2, setPersistence3][idx];

                return (
                  <div key={label}>
                    <p className="mb-3 text-sm font-bold leading-7 text-slate-800 sm:text-base">{label}</p>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setter(num)}
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-sm font-bold transition sm:text-base",
                            value === num
                              ? "border-sky-500 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-700 hover:border-sky-300"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <PrePostDiffCard preScore={preScore} postScore={postScore} />

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black tracking-[0.16em] text-sky-600">CARD NAME</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">カードに表示する名前</h2>
            <input
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              placeholder="例：HIKARU / ひかる"
              className="mt-4 w-full rounded-[24px] border border-slate-200 px-4 py-4 text-slate-800 outline-none transition focus:border-sky-400"
            />
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black tracking-[0.16em] text-sky-600">MY ROLE</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">あなたの役割を言葉にしてみよう</h2>
            <textarea
              value={myRole}
              onChange={(e) => setMyRole(e.target.value)}
              placeholder="例：人と地域をつなぎ、挑戦しやすい場をつくりたい"
              className="mt-4 min-h-[150px] w-full rounded-[24px] border border-slate-200 p-4 text-slate-800 outline-none transition focus:border-sky-400"
            />
          </section>

          <div ref={cardRef}>
            <RoleCard
              mainRole={result.top1}
              subRole={result.top2}
              myRole={
                canShowCard
                  ? myRole
                  : "名前・Post質問・探究持続性・役割記述を入力すると、このカードが完成する。"
              }
              age={age}
              affiliation={affiliation}
              character={fixedCharacter}
              characterName={characterName}
            />
          </div>

          <div className="mt-2 flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleSave}
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-slate-800"
              >
                カードを保存
              </button>

              <button
                onClick={handleShare}
                disabled={isSharing}
                className={cn(
                  "rounded-full px-6 py-3 text-sm font-black shadow-lg ring-1 ring-slate-200 transition",
                  isSharing
                    ? "cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-white text-slate-900 hover:bg-slate-50"
                )}
              >
                {isSharing ? "共有中..." : "シェア"}
              </button>
            </div>

            <p className="text-center text-xs text-slate-500">
              スマホでは共有画面から「画像を保存」または「ファイルに保存」を選んでください
            </p>
          </div>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black tracking-[0.16em] text-sky-600">NEXT ACTION</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">次のアクション</h2>

            <div className="mt-5 grid gap-3">
              {currentNextActions.map((action, idx) => (
                <div
                  key={action}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-7 text-slate-700"
                >
                  {idx + 1}️⃣ {action}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black tracking-[0.16em] text-sky-600">SAVE CARD</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">このカードを保存</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canShowCard || isSubmitting || submitted}
                className={cn(
                  "rounded-full px-7 py-3 text-base font-black text-white transition",
                  !canShowCard || isSubmitting || submitted
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-sky-500 shadow-lg shadow-sky-200 hover:bg-sky-600"
                )}
              >
                {isSubmitting ? "保存中..." : submitted ? "保存済み" : "カードを保存する"}
              </button>
            </div>

            {submitMessage && <p className="mt-4 text-sm text-slate-600">{submitMessage}</p>}
          </section>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fbff_35%,#f8fafc_100%)] px-4 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <section className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-xl backdrop-blur sm:p-6">
            <p className="text-sm font-black tracking-[0.26em] text-sky-600">ROLE CITY</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-black tracking-[0.14em]",
                  roleSoftClassMap[result.top1]
                )}
              >
                No.{roleMetaMap[result.top1].no}
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black tracking-[0.14em] text-slate-600">
                CLASS : {roleMetaMap[result.top1].className}
              </span>

              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black tracking-[0.14em] text-emerald-700">
                SAVED
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black text-slate-900 sm:text-4xl">
              あなたのメイン役割は「{result.top1}」
            </h1>

            <p className="mt-3 text-lg font-bold leading-8 text-slate-700">{mainRoleCatchCopy[result.top1]}</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">サブ役割：{result.top2}</p>
          </section>

          <PrePostDiffCard preScore={preScore} postScore={postScore} />

          <RoleCard
            mainRole={result.top1}
            subRole={result.top2}
            myRole={myRole}
            age={age}
            affiliation={affiliation}
            character={fixedCharacter}
            characterName={characterName}
          />

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-black tracking-[0.16em] text-sky-600">NEXT ACTION</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">次のアクション</h2>

            <div className="mt-5 grid gap-3">
              {currentNextActions.map((action, idx) => (
                <div
                  key={action}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium leading-7 text-slate-700"
                >
                  {idx + 1}️⃣ {action}
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    );
  }

    return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fbff_35%,#f8fafc_100%)] px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-xl backdrop-blur">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-black tracking-[0.22em] text-sky-600">
                  QUESTION {currentQuestion + 1} / {questions.length}
                </p>
                <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                  {question.question}
                </h2>
              </div>

              <div className="w-full">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>PROGRESS</span>
                  <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 sm:px-6 sm:py-6">
            <section>
              <ChoiceGrid
                options={question.options}
                selected={answers[question.id] || []}
                onSelect={(option) =>
                  question.type === "single" ? handleSingleSelect(option) : handleMultiSelect(option)
                }
                multi={question.type === "multi"}
                maxSelect={question.maxSelect || 1}
              />

              <div className="mt-5 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  className={cn(
                    "rounded-full px-8 py-4 text-base font-black text-white transition sm:text-lg",
                    canGoNext
                      ? "bg-sky-500 shadow-lg shadow-sky-200 hover:bg-sky-600"
                      : "cursor-not-allowed bg-slate-300"
                  )}
                >
                  {currentQuestion === questions.length - 1 ? "結果を見る" : "次へ"}
                </button>
              </div>
            </section>

            <aside>
              <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-4">
                <p className="text-xs font-black tracking-[0.2em] text-sky-600">LIVE PREVIEW</p>

                <div className="mt-4 space-y-4">
                  <div
                    className={cn(
                      "rounded-[22px] border bg-gradient-to-r p-4 text-white shadow-lg",
                      roleGradientMap[result.top1]
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{roleEmojiMap[result.top1]}</span>
                      <span className="text-sm font-black tracking-[0.14em]">
                        CURRENT MAIN ROLE
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-black">{result.top1}</p>
                    <p className="mt-2 text-sm text-white/90">SUB ROLE : {result.top2}</p>
                    <p className="mt-1 text-sm text-white/90">{roleAreaNames[result.top1]}</p>
                  </div>

                  <div className="flex justify-center rounded-[24px] border border-slate-200 bg-white p-4">
                    <CharacterArt
                      role={result.top1}
                      outfit={fixedCharacter.outfit}
                      item={fixedCharacter.item}
                      background={fixedCharacter.background}
                      size={170}
                    />
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
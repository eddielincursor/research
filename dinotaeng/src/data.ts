import type { ArtId } from "./art"

export type Character = {
  id: ArtId
  name: string
  zh: string
  role: string
  color: string
  tagline: string
  story: string
  facts: string[]
  everyday: string
}

export const CHARACTERS: Character[] = [
  {
    id: "quokka",
    name: "QUOKKA",
    zh: "短尾矮袋鼠 Quokka",
    role: "主角・行動派",
    color: "#e98b5a",
    tagline: "犯錯也沒關係，今天又是一場新冒險。",
    story:
      "棉花糖村所有故事的起點。個性樂觀外向，什麼新鮮事都想試，村裡大大小小的活動都少不了他。偶爾調皮搗蛋、常常出包，但對 Quokka 來說，每一次經歷都是有意義的人生片段。",
    facts: ["原型是澳洲的短尾矮袋鼠", "最愛棉花糖，天天在找最好吃的那一顆", "和 Hatty、Fatty 是三人組"],
    everyday: "像那個說走就走、報名了陶藝課又跑去學衝浪的朋友，學得不好也笑得很開心。",
  },
  {
    id: "hatty",
    name: "HATTY",
    zh: "戴帽子的 Hatty",
    role: "三人組・智慧擔當",
    color: "#5b8bd9",
    tagline: "先別急，我想到一個好點子。",
    story:
      "Quokka 和 Fatty 的好朋友，頭腦聰明，遇到問題總能冷靜分析。他有個小秘密：帽子從來不脫，大家都很好奇帽子底下到底藏了什麼。",
    facts: ["三人組裡負責動腦", "帽子是他的招牌，也是謎團", "常常是收拾殘局的那一位"],
    everyday: "像旅行時默默查好交通、還帶了行動電源的朋友，問他帽子底下藏什麼，他只會神秘一笑。",
  },
  {
    id: "fatty",
    name: "FATTY",
    zh: "愛吃的 Fatty",
    role: "三人組・吃貨代表",
    color: "#d6a23d",
    tagline: "看起來很嚴肅？其實我在想點心。",
    story:
      "Quokka 的另一位好朋友。短短的眉毛讓他總像一臉嚴肅、有點委屈，其實小腦袋裡滿滿都是被零食包圍、怎麼吃都吃不完的甜甜幻想。只要有吃的，眼睛立刻發亮。",
    facts: ["眉毛是表情的靈魂", "夢想是零食吃不完", "三人組的開心果"],
    everyday: "像開會時面無表情、其實正在想中午吃排骨飯還是牛肉麵的同事。",
  },
  {
    id: "papa",
    name: "PAPA QUOKKA",
    zh: "Quokka 爸爸",
    role: "家人・甜甜圈愛好者",
    color: "#a9744c",
    tagline: "十二根頭髮，一根都不能亂。",
    story:
      "瀏海那 12 根頭髮是爸爸的驕傲，每天早上第一件事就是用梳子好好整理。勤奮又愛家，最愛甜甜圈；做事常常粗枝大葉，讓家人忍不住扶額，但對家人的愛從來不變。",
    facts: ["12 根頭髮遺傳自爺爺", "最喜歡的食物是甜甜圈", "粗心，但超級顧家"],
    everyday: "像每天出門前一定要把頭髮抓好，卻常常忘記帶鑰匙的爸爸。",
  },
  {
    id: "mama",
    name: "MAMA QUOKKA",
    zh: "Quokka 媽媽",
    role: "家人・廚藝與編織達人",
    color: "#e86f6f",
    tagline: "一不小心，又煮了全村的份。",
    story:
      "溫柔親切，用好吃的料理把幸福帶給大家。一開始下廚就停不下來，常常煮出整個村子都吃得飽的份量。編織手藝也很厲害，全家人的衣服都是她一針一線做出來的。",
    facts: ["全家的衣服都是她做的", "料理份量永遠超出預期", "村裡大家的胃都靠她照顧"],
    everyday: "像過年說「隨便煮幾道」，結果端出十二道菜、還幫你打包帶走的媽媽。",
  },
  {
    id: "grandpa",
    name: "GRANDPA QUOKKA",
    zh: "Quokka 爺爺",
    role: "家人・冒險老前輩",
    color: "#8e7b6b",
    tagline: "名字可能會忘，冒險不會。",
    story:
      "年輕時四處旅行冒險，累積滿滿的智慧和經驗。村裡遇到難題，他常能靈光一閃想出辦法。年紀大了偶爾會忘記自己叫什麼，但那些精彩的冒險回憶都還記得清清楚楚。",
    facts: ["爸爸的 12 根頭髮就是遺傳自他", "旅行與冒險經驗豐富", "村裡的問題解決專家"],
    everyday: "像記不得你上週說過什麼，卻能把四十年前環島的每一站講得活靈活現的長輩。",
  },
  {
    id: "burnt",
    name: "MR. BURNT",
    zh: "發明家 Mr. Burnt",
    role: "村民・傳奇發明家",
    color: "#7a5236",
    tagline: "棉花糖不夠？那就發明一台機器。",
    story:
      "棉花糖村手藝最好的發明家，專門做各種製作、研究棉花糖的工具。據說他發明過蒸汽引擎，讓村子可以大量生產蓬鬆香甜的棉花糖，是村裡的傳奇人物。",
    facts: ["發明過棉花糖蒸汽引擎", "總是埋頭在工作室裡", "每項發明都為了讓大家更幸福"],
    everyday: "像公司裡那個嫌流程太慢，週末就寫了一支小程式幫全組省下半天的同事。",
  },
  {
    id: "bobo",
    name: "BOBO",
    zh: "BOBO 族",
    role: "好夥伴・吃什麼變什麼",
    color: "#c9a7d9",
    tagline: "被捉弄也沒關係，我會一直在你旁邊。",
    story:
      "棉花糖村住著各式各樣的 BOBO，常和 Quokka 一家玩在一起。他們安靜可愛，常因為 Quokka 家族的粗心或調皮而倒楣，卻從不抱怨，一直忠心守護在朋友身邊。要小心別讓 BOBO 亂吃東西，他們吃下什麼，外表就可能跟著變。",
    facts: ["吃了什麼，就可能變成什麼樣子", "官方商品有可頌 BOBO、Oreo BOBO 等造型", "最講義氣的小夥伴"],
    everyday: "像被你拖去排隊三小時、還幫你顧包包拍照的好朋友，只是他最近吃了可頌，所以變成可頌形狀。",
  },
  {
    id: "marsh",
    name: "MARSH",
    zh: "棉花糖 Marsh",
    role: "全村的夢想",
    color: "#f29bb0",
    tagline: "世界上最好吃的棉花糖，一定在某個地方。",
    story:
      "棉花糖村居民最愛的東西就是棉花糖。全村的共同目標，是找到世界上最大、最好吃的夢幻棉花糖。為了這個夢想，大家世世代代研究：到底要怎麼種，才能種出完美的棉花糖？",
    facts: ["村子的名字 Marshville 就來自它", "全村的人生目標", "也是本站小遊戲的主角"],
    everyday: "像每個人心裡那份「總有一天要做到」的小夢想，不急，但一直都在。",
  },
]

export type TimelineItem = { when: string; title: string; text: string; place: string }

export const TIMELINE: TimelineItem[] = [
  {
    when: "2018",
    title: "Dinotaeng 誕生",
    text: "韓國插畫家 Kim Tae Eun（김태은）創立品牌，透過動物的視角記錄平凡又幸福的日常。",
    place: "首爾",
  },
  {
    when: "2021.08",
    title: "首個海外展《Quokka in Town!》",
    text: "Quokka、BOBO 和 Marsh 在香港街頭漫遊的展覽。",
    place: "香港",
  },
  {
    when: "2024.08",
    title: "QUOKKA IN SCHOOL 快閃店",
    text: "校園主題，有教室場景和拍貼機，和 LINE FRIENDS 合作在松山文創園區登場。",
    place: "台北",
  },
  {
    when: "2024.10",
    title: "QUOKKA & BOBO in the Woods",
    text: "森林探險主題，7 公尺高的 Quokka 與 BOBO 氣球裝置。",
    place: "高雄棧貳庫",
  },
  {
    when: "2025.01",
    title: "COCOCUP 快閃店",
    text: "還原棉花糖村的熱可可競賽，推出冬季限定周邊。",
    place: "台北",
  },
]

export type QuizOption = { text: string; score: Partial<Record<ArtId, number>> }
export type QuizQuestion = { q: string; options: QuizOption[] }

export const QUIZ: QuizQuestion[] = [
  {
    q: "週末早上醒來，你第一件事是？",
    options: [
      { text: "打開地圖找一個沒去過的地方", score: { quokka: 2, grandpa: 1 } },
      { text: "先把頭髮整理好，今天才算開始", score: { papa: 2 } },
      { text: "想早餐要吃什麼，順便想午餐", score: { fatty: 2, mama: 1 } },
      { text: "繼續睡，夢裡也很忙", score: { bobo: 1, grandpa: 1 } },
    ],
  },
  {
    q: "朋友出包了，你會？",
    options: [
      { text: "冷靜分析問題，列出三個解法", score: { hatty: 2, burnt: 1 } },
      { text: "先煮一鍋熱湯給他", score: { mama: 2 } },
      { text: "默默陪在旁邊，什麼都不說也沒關係", score: { bobo: 2 } },
      { text: "說「我以前也搞砸過，超好笑的」", score: { quokka: 1, grandpa: 2 } },
    ],
  },
  {
    q: "你手上突然多了一筆小獎金，你會？",
    options: [
      { text: "買零件做一個自己想很久的東西", score: { burnt: 2 } },
      { text: "去吃那家一直想吃的甜點店", score: { fatty: 2, papa: 1 } },
      { text: "報名一堂從來沒上過的課", score: { quokka: 2, hatty: 1 } },
      { text: "給家人買禮物", score: { mama: 1, papa: 2 } },
    ],
  },
  {
    q: "大家覺得你最像哪種朋友？",
    options: [
      { text: "點子王，什麼都想試", score: { quokka: 2 } },
      { text: "可靠的軍師，有事找我就對了", score: { hatty: 2 } },
      { text: "表情很酷，其實內心很軟", score: { fatty: 2, bobo: 1 } },
      { text: "動手能力很強的那一位", score: { burnt: 2, mama: 1 } },
    ],
  },
  {
    q: "如果要你找「世界上最好吃的棉花糖」，你會？",
    options: [
      { text: "直接出發，邊走邊找", score: { quokka: 2, grandpa: 1 } },
      { text: "先做研究，畫一張棉花糖地圖", score: { hatty: 2 } },
      { text: "自己發明一台棉花糖機", score: { burnt: 2 } },
      { text: "跟著大家走，一路幫忙拿東西", score: { bobo: 2, mama: 1 } },
    ],
  },
]

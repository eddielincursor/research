# 工作教學筆記

這裡收錄工作上遇到的操作需求，整理成可以照著做的 Markdown 教學。

## 目錄

- [用 Rufus 製作 Ubuntu 26.04.1 LTS 安裝隨身碟](tutorials/ubuntu-rufus-install.md)：從下載映像檔、用 Rufus 寫入開機碟，到安裝並完成第一次進系統設定。文內有步驟圖示和設定對照卡。
- [簡介 Intrinsic 與 intrinsic-core](tutorials/intrinsic-core.md)：先看官網在做什麼，再說明 `intrinsic-core` 倉庫的模組、硬體規格和文件裡不一致的系統需求。
- [全端是什麼？全端工程師在做什麼？](tutorials/fullstack-engineer.md)：用餐廳比喻與按下按鈕後的 0.2 秒講解前端、後端、資料庫與部署維運，附一段從 SQL、後端 API 到前端表單的完整範例與四階段入門路線。
- [用同一筆薪水看懂 631、333、5311 和其他理財分法](tutorials/budgeting-ratios.md)：用稅後月入 50,000 與 80,000 的例子比較比例，並附 50/30/20、六罐子和發薪日轉帳。
- [平均月薪 47,884 元，為什麼將近七成的人領不到？](tutorials/salary-median.md)：用主計總處 114 年全年的平均、中位數和十分位，說明新聞上的月薪和薪資單差在哪，並列出各年齡的及格線。另有 115 年 7 月單月創新高的獨立比較。
- [《財富階梯》重點心得](tutorials/wealth-ladder.md)：用淨值六個級距、0.01% 法則與每一階該換的引擎，整理 Nick Maggiulli 的財富階梯，並用台灣生活例子試算爬梯需要多久。
- [《高功能倖存者：如果不「有用」，我還值得被愛嗎？》重點心得](tutorials/high-functioning-survivor.md)：整理周慕姿以家庭系統理論拆解的「白雪公主」與「灰姑娘」兩條創傷劇本，搭配職場、家庭與伴侶的生活例子，以及拆解「勞役合約」的五步驟練習。

## 心理學專欄

- [榮格心理學入門](tutorials/jung-psychology-intro.md)：用生活例子介紹心靈三層結構、人格面具／陰影／阿尼瑪與阿尼姆斯／自性、心理類型與個體化，給想接觸心理學的人當第一張地圖。

## 角色與文創

- [歡迎來到棉花糖村：Dinotaeng 角色介紹](tutorials/dinotaeng.md)：韓國插畫品牌 Dinotaeng 的品牌故事、九位角色與生活例子、角色關係與在台灣的快閃足跡。

## 小工具

- [歡迎來到棉花糖村](https://eddielincursor.github.io/research/dinotaeng/)：搭配 Dinotaeng 文章的可愛風角色導覽，含「棉花糖接接樂」小遊戲與角色測驗。原始碼在 [`dinotaeng/`](dinotaeng/README.md)。

- [你的月薪在同齡的哪裡](https://eddielincursor.github.io/research/salary/)：搭配平均薪資與中位數的文章。輸入年紀和月薪，看落在哪個年齡階段、有沒有過同齡中位數。頁面另有 115 年 7 月的單月比較，查詢仍以 114 年全年為準。原始碼在 [`salary-check/`](salary-check/README.md)。
- [財富階梯定位器](https://eddielincursor.github.io/research/wealth-ladder/)：搭配《財富階梯》心得。輸入資產與負債，算出你在哪一階、對應哪一種自由、往下一階還差多少與大約要多久。原始碼在 [`wealth-ladder/`](wealth-ladder/README.md)。
- [薪水分配與投資試算（簡易版）](https://eddielincursor.github.io/research/budget/)：理財篇裡連結的線上版，部署在 GitHub Pages，原始碼在 [`budget-lite/`](budget-lite/README.md)。
- [薪水分配與投資試算（完整版）](finance-tools/README.md)：理財篇的網頁工具。先用財務規劃表依你選的分法算出每格金額，再把投資金額帶進投資計算機，用圖表看長期累積。

## 怎麼讀

用任何 Markdown 閱讀器或編輯器打開 `tutorials/` 裡的檔案即可。這些筆記不需要安裝套件，也不需要啟動服務。小工具的執行方式寫在各自的 README。

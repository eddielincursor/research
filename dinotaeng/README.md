# 歡迎來到棉花糖村：Dinotaeng 角色導覽

[Dinotaeng 角色介紹文章](../tutorials/dinotaeng.md)搭配的非官方粉絲網站，部署在 GitHub Pages：

<https://eddielincursor.github.io/research/dinotaeng/>

只有一頁，沒有任何執行期套件，內容有：

1. **角色卡**：九位角色，點擊後在對話框看故事、小檔案和生活例子，可依三人組、Quokka 一家、村民與夥伴篩選。
2. **角色關係圖**。
3. **棉花糖接接樂**：用 Canvas 畫的 60 秒小遊戲。接棉花糖 +1、甜甜圈 +3、金色棉花糖 +5，接到 BOBO 6 秒內分數 ×2，接到烤焦棉花糖扣一顆愛心。連續接住倍率最高 ×3，最高分存在 `localStorage`。支援方向鍵／A、D、滑鼠、觸控拖曳與畫面下方按鈕，切換分頁會自動暫停。
4. **你是棉花糖村的哪一位？**：五題角色測驗。
5. **時間軸**：品牌創立與在香港、台灣的展覽與快閃店。

角色插圖都是在 `src/art.ts` 用 SVG 依角色特徵自行繪製的簡化示意，不是官方造型；角色名稱與設定版權屬於 DINOTAENG。

## 檔案

- `src/data.ts`：角色、時間軸與測驗內容。
- `src/art.ts`：角色與遊戲道具的 SVG。
- `src/game-core.ts`：遊戲規則（掉落、計分、碰撞、結束條件），和畫面無關，有單元測試。
- `src/game.ts`：Canvas 繪圖與操作。
- `src/main.ts`：角色卡、對話框、關係圖、測驗與時間軸。

## 本機執行

```bash
cd dinotaeng
pnpm install
pnpm dev      # http://127.0.0.1:47326
pnpm test     # 遊戲規則的單元測試
pnpm build    # 型別檢查並輸出到 dist/
```

推到 `main` 後，`.github/workflows/pages.yml` 會把它和其他工具一起建置，部署到 `/dinotaeng/`。

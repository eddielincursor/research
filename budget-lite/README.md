# 薪水分配與投資試算（簡易版）

[理財篇教學](../tutorials/budgeting-ratios.md)裡連結的線上小工具，部署在 GitHub Pages：

<https://eddielincursor.github.io/research/budget/>

只有一頁，沒有任何執行期套件，分成兩段：

1. **分配薪水**：填入稅後月收入和必要支出（選填），選 631、333、5311 或 50/30/20，算出每一格每月和每年的金額。工具會依必要支出的比例標出建議的分法，並檢查生活費夠不夠付必要支出。
2. **投資試算**：每月投入預設帶入「投資」那一格，也可以自己改。再設定單筆投入、年化報酬率和年數，就會顯示最後總額、本金與報酬的面積圖，以及每 5 或 10 年的明細。

網址的 `#` 後面會記住目前的設定，例如 `#i=50000&e=30000&m=631&r=6&y=20`，可以存成書籤或分享。

功能更完整的版本（六罐子、自訂比例、緊急預備金、情境比較、CSV 匯出等）在 [`finance-tools/`](../finance-tools/README.md)。兩個版本的計算方式相同：年化報酬率視為有效年利率，月利率為 `(1 + r)^(1/12) − 1`，每月月底投入，金額用最大餘數法分到整數元。

## 本機執行

```bash
cd budget-lite
pnpm install
pnpm dev      # http://127.0.0.1:47322
pnpm test
pnpm build    # 輸出到 dist/
```

## 部署

推送到 `main` 且有改到 `budget-lite/` 時，`.github/workflows/pages.yml` 會跑測試、建置，並把結果發佈到 GitHub Pages 的 `/research/budget/`。

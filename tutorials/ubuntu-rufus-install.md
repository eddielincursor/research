# 用 Rufus 製作 Ubuntu 安裝隨身碟並完成第一次系統設定

這篇說明如何在 Windows 上下載 Ubuntu，用 Rufus 做成可開機的安裝隨身碟，再在目標電腦安裝 Ubuntu Desktop，並完成第一次登入後的基本設定。

寫作時核對的版本：

| 項目 | 版本 |
| --- | --- |
| Ubuntu | 26.04.1 LTS（Resolute Raccoon），桌面版，64 位元 |
| Rufus | 4.15 |
| 製作端 | 已可正常使用的 Windows 電腦 |
| 核對日期 | 2026-10-16 |

工作用電腦選 **26.04.1 LTS**。LTS 有五年免費安全更新，支援到 2031 年 4 月。同時間的 Ubuntu 26.10 只有九個月更新，不適合拿來當長期使用的工作機。

## 開始之前

這份流程會做兩次無法復原的寫入：

- Rufus 會清掉整支 USB 隨身碟。
- 安裝時若選擇「清除磁碟並安裝」，目標電腦上該顆硬碟的系統與檔案會全部消失。

先把隨身碟和目標電腦裡要留下的檔案複製到別的地方。目標電腦如果目前還有 Windows，也先確認那些檔案已經備份。

準備這些東西：

- 一台可以上網的 Windows 電腦，用來下載檔案與執行 Rufus。
- 一支 **16 GB 或更大** 的 USB 隨身碟。Ubuntu 映像檔約 6 GB，官方安裝說明建議至少 12 GB，16 GB 比較不會在寫入時空間不夠。
- 要安裝 Ubuntu 的電腦。建議規格是雙核心 2 GHz 以上、記憶體 6 GB、可用磁碟空間 25 GB，以及一個 USB 埠。
- 安裝過程最好能上網，這樣才能在安裝時抓取更新與顯示卡驅動程式。

Rufus 只跑在 Windows。這篇假設你在另一台已經能用的 Windows 上製作隨身碟，再拿到目標電腦開機。

## 1. 下載 Ubuntu 映像檔

1. 打開 Ubuntu 桌面版下載頁：<https://ubuntu.com/download/desktop>
2. 找到 **Ubuntu 26.04.1 LTS**。
3. 選擇 **Intel or AMD 64-bit**。一般的 Intel 或 AMD 電腦都是這個。ARM 64-bit 只用於 Snapdragon 等 ARM 筆電，不要選錯。
4. 下載完成後，檔名應為 `ubuntu-26.04.1-desktop-amd64.iso`，大小約 6.0 GB。

也可以直接下載：

<https://releases.ubuntu.com/26.04.1/ubuntu-26.04.1-desktop-amd64.iso>

把檔案放在找得到的位置，例如 `下載` 資料夾。不要解壓縮，Rufus 要的就是這個 `.iso`。

### 核對檔案沒有下壞

下載頁旁的校驗碼清單在：

<https://releases.ubuntu.com/26.04.1/SHA256SUMS>

`ubuntu-26.04.1-desktop-amd64.iso` 的 SHA256 是：

```text
601e30fbf5d97759367c632e2c33630665039b7e2158fd068403da3ccf1bda1f
```

在 Windows 上打開 PowerShell，切到 ISO 所在的資料夾後執行：

```powershell
Get-FileHash .\ubuntu-26.04.1-desktop-amd64.iso -Algorithm SHA256
```

PowerShell 顯示的是大寫。和上面那串比對時不分大小寫，字元必須完全相同。不一樣就不要拿去寫入，刪掉後重新下載。

也可以用命令提示字元：

```bat
certutil -hashfile ubuntu-26.04.1-desktop-amd64.iso SHA256
```

## 2. 下載 Rufus

只從 Rufus 官網下載，避免拿到被改過的程式：

<https://rufus.ie/en/>

下載 **Rufus 4.15** 的標準版 `rufus-4.15.exe`（Windows x64，約 1.9 MB）。這個檔案不用安裝，下載後直接執行。

若公司電腦限制安裝程式，改下載同頁的可攜版 `rufus-4.15p.exe`，執行方式相同。

執行時 Windows 會要求系統管理員權限，按「是」。Rufus 要直接寫入磁碟，所以需要這個權限。

## 3. 用 Rufus 做成開機碟

1. 插入要拿來安裝的 USB 隨身碟。
2. 打開 Rufus。
3. 在 **裝置 (Device)** 確認選到的是這支隨身碟。看名稱和容量，不要選錯。
4. 在 **開機類型選擇 (Boot selection)** 按 **選擇 (SELECT)**，挑剛剛下載的 `ubuntu-26.04.1-desktop-amd64.iso`。
5. 其餘項目照下表設定。選好 ISO 之後，Rufus 通常會自己帶入這些值，仍然要逐項看過。

| 項目 | 設定 |
| --- | --- |
| 映像檔選項 (Image option) | Standard Ubuntu installation |
| 分割區配置 (Partition scheme) | GPT |
| 目標系統 (Target system) | UEFI (non CSM) |
| 檔案系統 (File system) | 維持 Rufus 自己選的，不要改 |
| 叢集大小 (Cluster size) | 預設值 |
| 持久分割區大小 | 0（這是安裝碟，不需要把試用環境的變更存回隨身碟） |

Ubuntu 26.04.1 的映像檔裡有超過 4 GB 的檔案。FAT32 單檔不能超過 4 GB，所以 Rufus 可能把檔案系統改成 NTFS，並加上 UEFI:NTFS，UEFI 電腦才開得起來。看到檔案系統變成 NTFS 是正常的，不要手動改回 FAT32。

**清單 USB 硬碟 (List USB Hard Drives)** 保持不要勾。勾了之後內接硬碟也可能出現在裝置清單，選錯就會把工作資料清掉。

6. 按 **開始 (START)**。
7. 若出現 **ISOHybrid image detected**，選 **Write in ISO Image mode (Recommended)**，再按確定。這是 Rufus 建議的寫法，開機選單比較完整。DD Image mode 是原樣複製，兩種都能安裝；這篇用 ISO 模式。某台電腦用 ISO 模式開不了機時，再重做一次並改選 DD 模式。
8. 若 Rufus 表示需要下載額外的開機檔案，按 **是**。製作這台 Windows 必須能上網。
9. 接著會警告隨身碟上的資料將被銷毀。再確認裝置名稱是這支 USB，然後按確定。
10. 等到狀態列變成 **READY**，綠色進度跑完即可。6 GB 的映像檔依 USB 速度，大約要數分鐘到十幾分鐘。
11. 按關閉，再用工作列的「安全地移除硬體」退出隨身碟。不要在寫入中途拔除。

## 4. 用隨身碟開機

1. 把隨身碟插到要安裝 Ubuntu 的電腦。桌機優先插主機背面的 USB 埠。
2. 開機或重新啟動。目標電腦若目前是 Windows，請用「重新啟動」，不要用「關機」。Windows 的快速啟動會讓關機變成休眠，開機選單可能不會出現。
3. 一開機就連按開機選單鍵，選這支 USB。畫面通常只停留一兩秒。

常見按鍵：

| 品牌 | 開機選單鍵 |
| --- | --- |
| Dell | F12 |
| HP | Esc，然後 F9；有的機型直接 F9 |
| Lenovo | F12。部分機型要按機身側面的 Novo 小孔 |
| ASUS | Esc 或 F8 |
| Acer | F12。若沒反應，先到 BIOS 把 F12 Boot Menu 打開 |
| MSI | F11 |
| Microsoft Surface | 按住音量向下鍵再按電源鍵 |

不確定時，開機第一個畫面通常會寫 Boot Menu 是哪一顆鍵。也可以進 BIOS/UEFI（常見是 Del、F2 或 F10），把 USB 調到開機順序的第一個。

選單裡的名稱可能是隨身碟廠牌，或是 `UEFI: <廠牌>`。有 UEFI 與一般兩行時，選 **UEFI** 那一行。

Ubuntu 的開機載入程式有簽章，**Secure Boot 保持啟用**即可，不必為了安裝去關掉它。

開機後若看到 GRUB 選單，選 **Try or Install Ubuntu**。

### 選單裡沒有這支 USB

依序檢查：

- 換一個 USB 埠，優先試主機板直接引出的埠，不要先用沒有外接電源的 USB hub。
- 進 BIOS，確認 USB boot 是啟用的，Boot mode 是 UEFI。這篇的 Rufus 設定是 GPT + UEFI，電腦若被設成純 Legacy/CSM，會看不到這支碟。
- 回到製作端，用第 1 節的 SHA256 再驗一次 ISO。不符就重新下載、重新寫入。
- 仍開不了機時，用同一支 USB 再跑一次 Rufus，在 ISOHybrid 那個對話框改選 **DD Image mode**。

## 5. 安裝 Ubuntu

安裝程式的畫面可以用英文或中文。第一步先把語言改成需要的語言，後面的按鈕就會跟著變。下面用功能說明，並附上英文介面上的名稱，方便對照。

1. **語言。** 選 **中文（繁體）**。工作環境若要維持英文介面，就留 English。
2. **無障礙功能。** 沒有特別需求就繼續。
3. **鍵盤配置。** 實體鍵盤是一般美式鍵盤時，選 English (US)。中文輸入法等進系統後再加，不要在這裡把鍵盤配置改成注音，否則密碼和終端機指令的符號位置會跑掉。
4. **網路。** 連上有線網路或 Wi-Fi。連上網之後，安裝程式才能下載更新，以及 NVIDIA 等第三方驅動程式。
5. **試用或安裝。** 選 **Install Ubuntu**（安裝 Ubuntu）。Try Ubuntu 只是試用，不會把系統寫進硬碟；試用桌面上仍有安裝捷徑，可以再回來。
6. 若出現 Intel RST（Rapid Storage Technology）的警告，Ubuntu 無法繼續。要先進 BIOS 把磁碟模式從 RAID/RST 改成 AHCI，再重新從 USB 開機。改之前先確認現有的 Windows 還需不需要保留，因為這個切換可能讓原本的 Windows 無法直接開機。說明見 <https://help.ubuntu.com/rst>。
7. **安裝類型。** 選 **Interactive installation**（互動式安裝）。Automated installation 是用設定檔批次安裝，這篇不使用。
8. **應用程式。** 一般選 **Default selection**（預設選項），進系統後再用 App Center 補軟體。現場不能上網、又需要文書工具時，改選 **Extended selection**（延伸選項）。
9. **第三方軟體。** 兩個選項都勾：改善裝置支援的第三方軟體（包含顯示卡驅動），以及額外的媒體格式。
10. **磁碟。**
    - 這台電腦只留給 Ubuntu：選 **Erase disk and install Ubuntu**（清除磁碟並安裝 Ubuntu）。電腦有不只一顆硬碟時，一定要看清楚選到的是哪一顆。
    - 要和現有系統並存：選 alongside（並存安裝），再用滑桿分配空間。
    - Windows 有開啟 BitLocker 時，並存安裝會被擋住。請先重開回 Windows，在「管理 BitLocker」把該磁碟解密，確認 Windows 仍正常，再回來安裝。如果決定整顆磁碟都給 Ubuntu、不保留 Windows，就不必先關 BitLocker，直接選清除磁碟。
    - **進階功能裡的磁碟加密先不要開。** 加密後每次開機都要金鑰，金鑰遺失就無法取回資料。TPM 全碟加密對需要額外驅動的硬體（例如部分 NVIDIA 顯示卡與網路攝影機）支援仍有限制。
    - 手動分割只在你已經知道 EFI、root 要怎麼切時才使用。
11. **帳號。** 填寫你的姓名、電腦名稱、使用者名稱和密碼。電腦名稱會出現在網路上，使用者名稱用英文小寫。工作機選 **Require my password to log in**（登入時需要密碼），不要選自動登入。
12. **時區。** 在地圖上選台北，或確認時區是 `Asia/Taipei`。有連上網路時通常會自己偵測。
13. 在摘要畫面再看一次：語言、鍵盤、磁碟、帳號是否正確。確認後按 **Install**（安裝）。
14. 等待安裝結束。右下角可以展開詳細紀錄。完成後按 **Restart Now**（立刻重新啟動）。
15. 畫面要求移除安裝媒體時，拔掉 USB，再按 Enter。

沒有拔掉就重新開機的話，電腦可能又進安裝程式。拔掉後再重開即可，硬碟上的安裝不會因此消失。

## 6. 第一次進入系統後的設定

拔掉 USB 並重新開機後，應看到 Ubuntu 登入畫面。輸入安裝時設定的密碼。

### 歡迎視窗

第一次登入可能出現歡迎視窗，依序處理：

- **Ubuntu Pro：** 個人使用最多五台可以免費掛上，用來取得更多套件的安全更新。工作機可以稍後再決定，先跳過不影響使用。
- **傳送系統資訊給 Canonical：** 預設不會收集。沒有公司規定要回報時，維持關閉。
- **Ubuntu Pro 的 Livepatch** 與額外軟體可以之後再裝。

### 區域、時間與輸入法

打開 **設定 (Settings)**：

1. **區域與語言：** 確認語言是繁體中文。要加注音或倉頡時，在輸入來源新增 **中文（繁體）**，並保留 English (US) 鍵盤，方便輸入指令。
2. **日期與時間：** 開啟自動設定時區，或手動選 `Asia/Taipei`。開啟自動日期與時間。
3. **顯示器：** 筆電或高解析度螢幕若畫面太小，調整縮放比例。26.04 的 GNOME 50 支援分數縮放。
4. **電源：** 筆電依工作習慣設定閒置多久關閉螢幕、合蓋要暫停還是不動作。

### 更新系統

安裝媒體裡的套件不一定包含下載日之後的修補。第一次進系統就更新。

圖形介面：按左下角九個點的應用程式清單，搜尋 **Software Updater**（軟體更新程式），讓它檢查並安裝，完成後若要求重新啟動就重新啟動。

或按 `Ctrl+Alt+T` 打開終端機，執行：

```bash
sudo apt update
sudo apt upgrade
```

第一行會詢問密碼。輸入時畫面不會顯示字元，這是正常的，打完按 Enter。第二行若詢問是否繼續，輸入 `y` 再按 Enter。

### 顯示卡與其他驅動程式

若是 NVIDIA 顯示卡，打開 **Software & Updates**（軟體與更新），切到 **Additional Drivers**（其他驅動程式）。選有測試過的專有驅動程式，套用後重新啟動。安裝時已勾選第三方軟體且當時有網路，這裡可能已經選好。

Intel 或 AMD 內顯通常用系統自帶的開放驅動即可，這個分頁沒有其他選項就不必更動。

### 確認這台電腦的身分

終端機執行：

```bash
hostnamectl
```

確認靜態主機名稱是安裝時填的電腦名稱，作業系統是 Ubuntu 26.04。若公司對命名有規定，可以改掉：

```bash
sudo hostnamectl set-hostname 新的電腦名稱
```

改完重新登入，讓終端機提示字元跟著更新。

### 建議一併做的基本設定

- 到 **App Center** 安裝工作需要的瀏覽器、編輯器或其他工具。Ubuntu 預設已有 Firefox。
- 桌面防火牆預設沒有擋住外出連線。若這台機器會長期開著，可以啟用 ufw，它不會擋掉本機登入：

```bash
sudo ufw enable
sudo ufw status
```

狀態應為 `active`。

到這裡，安裝碟的工作就結束了。隨身碟可以留著以後重裝，也可以格式化改作一般使用。

## 常見狀況

**Rufus 的裝置清單是空的。** 換一個埠再插一次。隨身碟若被其他程式佔用，先關閉檔案總管裡該磁碟的視窗。不要為了找裝置去勾「清單 USB 硬碟」，除非你確定自己認得哪一顆是 USB。

**校驗碼不符。** 不要繼續寫入。重新從 <https://releases.ubuntu.com/26.04.1/> 下載，並再跑一次 `Get-FileHash`。

**安裝程式說磁碟被 BitLocker 鎖住。** 只在你要和 Windows 並存時才需要處理。回到 Windows 解密 BitLocker，或改為清除整顆磁碟、不再保留 Windows。

**開機停在黑畫面或反覆回到安裝程式。** 黑畫面先確認 ISO 校驗與寫入完成。反覆進入安裝程式，多半是 USB 還插著，拔掉後再重開。

**忘記密碼。** 登入密碼和磁碟加密金鑰是兩回事。登入密碼仍可透過回復模式重設；若安裝時開了磁碟加密又弄丟金鑰，資料無法救回。這也是這篇建議一般工作機不要在安裝時開加密的原因。

## 參考

- Ubuntu 桌面版下載：<https://ubuntu.com/download/desktop>
- Ubuntu 26.04.1 LTS 映像檔與校驗碼：<https://releases.ubuntu.com/26.04.1/>
- 官方安裝說明：<https://ubuntu.com/tutorials/install-ubuntu-desktop>
- Rufus：<https://rufus.ie/en/>
- Intel RST 與 Ubuntu：<https://help.ubuntu.com/rst>

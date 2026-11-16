# TAIPEI 101 - 台北 101 次世代 3D 沉浸式建築互動體驗

An interactive, photorealistic 3D digital twin of **Taipei 101** built with **Three.js**, **GSAP**, and modern **W3C ESM Web Standards**.

![Taipei 101 3D Preview](https://img.shields.io/badge/Three.js-r160-049ef4?style=for-the-badge&logo=three.js&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3.12.5-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

---

## 🌟 特色功能 (Key Features)

### 1. 次世代 PBR 建築與帷幕細節 (Photorealistic Architecture)
* **Low-E 高透低輻射翡翠綠玻璃帷幕**：`MeshPhysicalMaterial` 搭配清透清漆層（Clearcoat）與 360° 天空環境貼圖（HDR-style Equirectangular Reflection Mapping）。
* **26F 四方 12 米「乾坤古銅錢」飾板**：精緻重現金屬銅錢浮雕造型。
* **購物中心波浪採光穹頂**：比照實景空拍，裙樓頂部設置透明採光中庭天幕與階梯露台。
* **8 節竹節斗型塔身與如意祥雲托架**：7 度外傾幾何倒角結構，每節配置細緻金銅如意構件。
* **508m 塔尖航空警示燈**：避雷針與高空平台同步閃爍國際標準 ICAO 紅光警示信號。

### 2. 信義商圈指標地標與台北盆地自然地貌
* **台北世界貿易中心（世貿一館）**：經典粉紅磚階梯式金字塔（Ziggurat）與暗色採光中庭天幕。
* **台北君悅酒店（Grand Hyatt Taipei）**：標誌性雙子弧形米色大樓與挑高中庭連通道。
* **微風南山（Breeze Nanshan，272m）**：多面幾何漸縮玻璃天際線大樓。
* **陶朱隱園（Tao Zhu Yin Yuan）**：90 度雙螺旋旋轉立體綠植空中花園。
* **台北特有頂樓「不鏽鋼圓柱水塔」**：380+ 棟周邊建築配置頂樓水塔與機房設施。
* **象山、南港山系環山屏障**：2400m–3000m 外圍波浪狀起伏山脊，消除懸浮邊界感。
* **動態車流光軌**：信義路與松智路即時動態車流黃白車頭燈與紅色尾燈光線軌跡。

### 3. 動態天候與日夜循環 (Dynamic Sky & Weather)
* **24 小時連續日照滑軌** 與 5 大即時情境切換：
  * 🌅 **06:30 清晨**（晨霧金色晨曦）
  * ☀️ **12:00 正午**（透亮天藍與翡翠綠外牆）
  * 🌇 **17:45 夕陽魔幻時刻**（紫羅蘭、粉紅與蜜桃金漸層霞光，室內辦公室窗燈漸亮）
  * 🌃 **19:15 藍調夜幕**（深邃靛藍冷暖對比）
  * 🌌 **22:00 璀璨深夜**（都市黑夜、週間燈眉與霓虹）
* **微雨濕潤路面**：6500 道降雨粒子，柏油地面粗糙度降至 0.05 呈現積水倒影。

### 4. 進階五大互動體驗 (Interactive Superpowers)
* 🚀 **極速電梯（1010 m/min）**：37 秒從 1F 直達 89F 觀景台，伴隨升空音效與加速度 G-force 視角震動。
* ⚙️ **88F–92F 風阻尼器透視與示波器**：660 噸鋼球、懸吊鋼纜、環形油壓活塞 X 光透視，搭配即時 2-DOF 雙自由度諧振示波器波形。
* 🎆 **跨年璀璨多階煙火秀**：3 秒倒數、8 節竹節向外螺旋噴發、中層花火與 508m 頂冠瀑布，動態照亮整棟大樓外牆。
* 🌈 **周間七彩燈眉**：依據現實台北 101「彩虹七色」點燈行程（週一紅～週日紫），並支援節慶彩虹漸變流光。
* 📍 **3D 雷達波紋熱點標記**：同心圓雷達光環與資訊懸浮標籤，流暢飛越導覽。

---

## 🚀 快速啟動 (Quick Start)

本專案採用純靜態 **W3C Standard ESM Import Maps** 架構，無需任何 Node.js 建置步驟即可直接運行！

### 本地運行
使用任何靜態 HTTP 伺服器開啟本目錄：

```bash
# 使用 Python 內建伺服器
python3 serve.py
# 或
python3 -m http.server 3000
```
瀏覽器訪問：`http://localhost:3000`

---

## 📦 部署至 GitHub Pages

1. 建立 GitHub 儲存庫並推送代碼：
```bash
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git branch -M main
git push -u origin main
```

2. 前往 GitHub 儲存庫頁面：
   * 進入 **Settings** > **Pages**
   * **Source** 選擇 `Deploy from a branch`
   * **Branch** 選擇 `main` / `/(root)`
   * 點擊 **Save**

3. 幾秒後即可在 `https://<YOUR_USERNAME>.github.io/<YOUR_REPO>/` 線上瀏覽！

---

## 🛠️ 技術棧 (Tech Stack)
* **Rendering Engine**: [Three.js r160](https://threejs.org/)
* **Post-Processing**: `EffectComposer`, `UnrealBloomPass`, `RenderPass`
* **Animation**: [GSAP 3.12](https://greensock.com/)
* **Audio Synthesis**: Web Audio API (Zero external assets)
* **Styling**: Modern CSS3 Glassmorphism (`backdrop-filter`)

---

## 📄 License
MIT License

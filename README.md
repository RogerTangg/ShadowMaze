# 影子迷宮 Shadow Maze

一款充滿挑戰性的2D暗黑風格迷宮遊戲，玩家需要在有限的光線下穿越迷宮，在時間耗盡前找到出口！

A challenging 2D dark-themed maze game where players navigate through corridors using limited light and find the exit before time runs out!

## 🎮 遊戲特色 Game Features

### ✨ 核心玩法 Core Gameplay
- **動態光影系統**: 玩家周圍只有一圈有限的光亮，營造緊張刺激的氛圍
  - Dynamic Lighting: Limited circular light radius around player creates tense atmosphere
- **隨機迷宮生成**: 使用DFS演算法，每次遊戲都產生全新的迷宮佈局
  - Procedural Maze Generation: DFS algorithm creates unique maze layouts every game
- **真實陰影投射**: 牆壁會阻擋光線，形成逼真的陰影效果
  - Realistic Shadow Casting: Walls block light creating authentic shadow effects
- **平滑移動系統**: 玩家移動流暢自然，每次移動一格距離
  - Smooth Movement: Fluid grid-based movement with interpolated animation

### 🎯 難度系統 Difficulty Levels
- **簡單模式**: 較小迷宮，90秒時限，較大光照範圍
  - Easy Mode: Smaller maze, 90 seconds, larger light radius
- **中等模式**: 標準迷宮，60秒時限，標準光照範圍  
  - Medium Mode: Standard maze, 60 seconds, normal light radius
- **困難模式**: 較大迷宮，40秒時限，較小光照範圍
  - Hard Mode: Larger maze, 40 seconds, smaller light radius

### 🎵 音效系統 Audio System
- **背景音樂**: 營造神秘氛圍的背景音效
  - Background Music: Atmospheric audio for immersive experience
- **互動音效**: 移動聲效、勝利音效、失敗音效
  - Interactive Sound Effects: Movement, victory, and defeat audio feedback
- **音效控制**: 可隨時靜音/取消靜音
  - Audio Control: Mute/unmute toggle available anytime

### 📱 跨平台支援 Cross-Platform Support
- **響應式設計**: 完美適配桌面和手機瀏覽器
  - Responsive Design: Perfect adaptation for desktop and mobile browsers
- **觸控控制**: 手機裝置專用的虛擬方向鍵
  - Touch Controls: Virtual D-pad specifically designed for mobile devices
- **優化介面**: 針對不同螢幕尺寸的UI最佳化
  - Optimized Interface: UI optimization for various screen sizes

## 🎮 遊戲操作 Game Controls

### 🖥️ 電腦操作 Desktop Controls
- **WASD鍵**: 移動玩家角色
  - WASD Keys: Move player character
- **方向鍵**: 替代移動控制
  - Arrow Keys: Alternative movement controls

### 📱 手機操作 Mobile Controls  
- **虛擬方向鍵**: 觸控式移動控制
  - Virtual D-Pad: Touch-based movement controls

## 🏗️ 技術架構 Technical Architecture

### 💻 前端技術 Frontend Technologies
- **HTML5 Canvas**: 高效能遊戲渲染
  - HTML5 Canvas: High-performance game rendering
- **原生JavaScript**: 純JavaScript實現，無外部依賴
  - Vanilla JavaScript: Pure implementation without external dependencies
- **CSS3**: 現代化UI設計和動畫效果
  - CSS3: Modern UI design and animation effects

### ⚡ 性能優化 Performance Optimization
- **60 FPS**: 流暢的遊戲體驗
  - 60 FPS: Smooth gaming experience
- **局部渲染**: 只渲染玩家視野範圍內的迷宮部分
  - Culled Rendering: Only renders maze sections within player's view
- **音頻管理**: 高效的音頻資源管理系統
  - Audio Management: Efficient audio resource management system

### 🌟 遊戲系統 Game Systems
- **狀態管理**: 完整的遊戲狀態控制（開始畫面、遊戲中、結束畫面）
  - State Management: Complete game state control (start, gameplay, end screens)
- **碰撞檢測**: 精確的AABB碰撞檢測系統
  - Collision Detection: Precise AABB collision detection system
- **光線追蹤**: 簡化版光線投射演算法
  - Ray Casting: Simplified ray casting algorithm for lighting

## 🚀 安裝與執行 Installation & Running

### 📋 系統需求 System Requirements
- Node.js 20+
- 現代瀏覽器（支援HTML5 Canvas）
  - Modern browser with HTML5 Canvas support

### ⚙️ 安裝步驟 Installation Steps
```bash
# 1. 開啟命令提示字元，並 CD 至專案資料夾

# 2. 安裝依賴 Install dependencies
npm install

# 3. 啟動開發伺服器 Start development server  
npm run dev

# 4. 開啟瀏覽器訪問 Open browser and visit
# http://localhost:5000
```

## 🎯 遊戲目標 Game Objective

在有限的時間內，利用角色周圍微弱的光源，穿越隨機生成的迷宮，找到出口並成功逃脫！

Navigate through randomly generated mazes using the limited light around your character, find the exit and escape successfully within the time limit!

## 🏆 遊戲策略 Game Strategy

- **記憶路線**: 嘗試記住已經探索過的路徑
  - Remember Paths: Try to memorize explored routes
- **牆壁導航**: 沿著牆壁移動可以避免迷路
  - Wall Following: Moving along walls helps avoid getting lost  
- **時間管理**: 合理分配探索時間，避免在死路浪費太多時間
  - Time Management: Allocate exploration time wisely, avoid spending too much time in dead ends

<!-- ## 📝 開發團隊 Development Team

由Replit Agent開發，專為提供沉浸式迷宮探索體驗而設計。

Developed by Replit Agent, designed specifically to provide an immersive maze exploration experience. -->

<!-- ## 📄 授權條款 License

本專案僅供學習和娛樂使用。
This project is for educational and entertainment purposes only.

--- -->

<!-- 🌟 **開始你的迷宮冒險吧！Start your maze adventure now!** 🌟 -->
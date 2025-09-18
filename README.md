# Shadow Maze (影子迷宮)

A 2D atmospheric maze game where players navigate through dark corridors using only the light around them. Find the exit before time runs out!

## Game Features

### 🎮 Core Gameplay
- **Dynamic Lighting**: Navigate using a circular light radius around your character
- **Procedural Mazes**: Each game generates a unique maze using DFS algorithm
- **Shadow Casting**: Realistic shadows and light occlusion from walls
- **Time Challenge**: 60-second countdown timer adds urgency
- **Multiple Controls**: WASD keys, arrow keys, and mobile touch controls

### 🌟 Game States
- **Start Screen**: Welcome screen with game title and start button
- **Gameplay**: Main maze navigation with HUD timer
- **Victory Screen**: Congratulations with time remaining display
- **Game Over Screen**: Time's up screen with retry option

### 🎵 Audio System
- **Background Music**: Atmospheric background audio
- **Sound Effects**: Movement sounds, victory, and defeat audio
- **Mute Toggle**: Audio can be muted/unmuted at any time
- **Fallback Support**: Works with Web Audio API and HTML5 Audio

### 📱 Mobile Support
- **Responsive Design**: Works on desktop and mobile browsers
- **Touch Controls**: On-screen D-pad for mobile devices
- **Optimized UI**: Mobile-friendly button sizes and layouts

## Technical Implementation

### 🏗️ Architecture

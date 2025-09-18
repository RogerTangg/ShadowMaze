/**
 * Shadow Maze Game - Main Game Controller
 * Handles game states, rendering, and game loop
 */

class ShadowMazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'start'; // start, difficulty, playing, victory, defeat
        this.gameTime = 60; // seconds
        this.gameTimer = null;
        this.selectedDifficulty = 'medium';
        
        // Movement state
        this.isMoving = false;
        this.moveStartTime = 0;
        this.moveDuration = 120; // milliseconds for smooth movement
        this.moveStartPos = { x: 0, y: 0 };
        this.moveTargetPos = { x: 0, y: 0 };
        this.lastInputTime = 0;
        this.inputDelay = 80; // milliseconds between accepting new movement inputs
        
        // Difficulty settings
        this.difficultySettings = {
            easy: {
                name: '簡單 / Easy',
                timeLimit: 90,
                mazeSizeMultiplier: 0.4,
                lightRadius: 120,
                moveDuration: 160 // slower movement for easy
            },
            medium: {
                name: '中等 / Medium',
                timeLimit: 60,
                mazeSizeMultiplier: 0.6,
                lightRadius: 100,
                moveDuration: 120 // medium movement speed
            },
            hard: {
                name: '困難 / Hard',
                timeLimit: 40,
                mazeSizeMultiplier: 0.8,
                lightRadius: 80,
                moveDuration: 90 // faster movement for hard
            }
        };
        
        // Game objects
        this.maze = null;
        this.player = null;
        this.lighting = null;
        this.audio = null;
        this.controls = null;
        
        // Canvas properties
        this.cellSize = 20;
        this.mazeWidth = 0;
        this.mazeHeight = 0;
        
        // Performance
        this.lastFrameTime = 0;
        this.fps = 60;
        this.frameInterval = 1000 / this.fps;
        
        this.init();
    }
    
    /**
     * Initialize the game
     */
    async init() {
        console.log('Initializing Shadow Maze Game...');
        
        // Setup canvas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize game components
        this.audio = new GameAudio();
        this.controls = new GameControls();
        this.lighting = new LightingSystem();
        
        // Setup UI event listeners
        this.setupUI();
        
        // Start background music
        await this.audio.init();
        
        console.log('Game initialized successfully');
    }
    
    /**
     * Setup canvas dimensions
     */
    resizeCanvas() {
        // Set canvas to a reasonable fixed size that works well centered
        const maxWidth = Math.min(window.innerWidth * 0.9, 1280);
        const maxHeight = Math.min(window.innerHeight * 0.9, 800);
        
        // Maintain 16:10 aspect ratio
        if (maxWidth / maxHeight > 1.6) {
            this.canvas.width = maxHeight * 1.6;
            this.canvas.height = maxHeight;
        } else {
            this.canvas.width = maxWidth;
            this.canvas.height = maxWidth / 1.6;
        }
        
        // Calculate base maze dimensions
        const baseWidth = Math.floor(this.canvas.width / this.cellSize);
        const baseHeight = Math.floor(this.canvas.height / this.cellSize);
        
        // Apply difficulty multiplier
        const difficulty = this.difficultySettings[this.selectedDifficulty];
        this.mazeWidth = Math.floor(baseWidth * difficulty.mazeSizeMultiplier);
        this.mazeHeight = Math.floor(baseHeight * difficulty.mazeSizeMultiplier);
        
        // Ensure odd dimensions for proper maze generation
        if (this.mazeWidth % 2 === 0) this.mazeWidth--;
        if (this.mazeHeight % 2 === 0) this.mazeHeight--;
        
        // Minimum and maximum maze size
        this.mazeWidth = Math.max(this.mazeWidth, 15);
        this.mazeHeight = Math.max(this.mazeHeight, 11);
        this.mazeWidth = Math.min(this.mazeWidth, 51);
        this.mazeHeight = Math.min(this.mazeHeight, 31);
    }
    
    /**
     * Setup UI event listeners
     */
    setupUI() {
        // Start button - shows difficulty selection
        document.getElementById('startButton').addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        // Difficulty buttons
        document.getElementById('easyButton').addEventListener('click', () => {
            this.selectDifficulty('easy');
        });
        
        document.getElementById('mediumButton').addEventListener('click', () => {
            this.selectDifficulty('medium');
        });
        
        document.getElementById('hardButton').addEventListener('click', () => {
            this.selectDifficulty('hard');
        });
        
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            this.showScreen('startScreen');
        });
        
        // Play again button
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        // Try again button
        document.getElementById('tryAgainButton').addEventListener('click', () => {
            this.showDifficultySelection();
        });
        
        // Mute button
        document.getElementById('muteButton').addEventListener('click', () => {
            this.audio.toggleMute();
            const muteBtn = document.getElementById('muteButton');
            muteBtn.textContent = this.audio.isMuted ? '🔇' : '🔊';
        });
    }
    
    /**
     * Show difficulty selection screen
     */
    showDifficultySelection() {
        this.showScreen('difficultyScreen');
    }
    
    /**
     * Select difficulty and start game
     */
    selectDifficulty(difficulty) {
        this.selectedDifficulty = difficulty;
        console.log(`Selected difficulty: ${difficulty}`);
        this.startGame();
    }
    
    /**
     * Start a new game with selected difficulty
     */
    startGame() {
        console.log(`Starting new game on ${this.selectedDifficulty} difficulty...`);
        
        // Get difficulty settings
        const difficulty = this.difficultySettings[this.selectedDifficulty];
        
        // Reset game state
        this.gameState = 'playing';
        this.gameTime = difficulty.timeLimit;
        this.isMoving = false; // Reset movement state
        this.lastInputTime = 0;
        
        // Recalculate maze size for current difficulty
        this.resizeCanvas();
        
        // Generate new maze
        this.maze = new MazeGenerator(this.mazeWidth, this.mazeHeight);
        this.maze.generate();
        
        // Create player at maze start with difficulty-based properties
        const startPos = this.maze.getStartPosition();
        this.player = {
            x: startPos.x * this.cellSize + this.cellSize / 2,
            y: startPos.y * this.cellSize + this.cellSize / 2,
            radius: 8,
            lightRadius: difficulty.lightRadius
        };
        
        // Set movement speed based on difficulty
        this.moveDuration = difficulty.moveDuration;
        this.isMoving = false;
        this.lastInputTime = 0;
        
        // Setup lighting
        this.lighting.setup(this.canvas.width, this.canvas.height);
        
        // Update difficulty display
        document.getElementById('difficultyDisplay').textContent = difficulty.name;
        
        // Start game timer
        this.startTimer();
        
        // Show game HUD
        this.showScreen('gameHUD');
        
        // Start game loop
        this.startGameLoop();
        
        // Play movement sound
        this.audio.playSound('hit');
        
        console.log('Game started');
    }
    
    /**
     * Start the countdown timer
     */
    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.updateTimerDisplay();
        
        this.gameTimer = setInterval(() => {
            this.gameTime--;
            this.updateTimerDisplay();
            
            if (this.gameTime <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }
    
    /**
     * Update timer display
     */
    updateTimerDisplay() {
        document.getElementById('timeDisplay').textContent = this.gameTime;
        
        // Change color based on remaining time
        const timeDisplay = document.getElementById('timeDisplay');
        if (this.gameTime <= 10) {
            timeDisplay.style.color = '#ef4444';
        } else if (this.gameTime <= 20) {
            timeDisplay.style.color = '#f59e0b';
        } else {
            timeDisplay.style.color = '#ff6b35';
        }
    }
    
    /**
     * Start the main game loop
     */
    startGameLoop() {
        const gameLoop = (currentTime) => {
            if (this.gameState !== 'playing') return;
            
            // Throttle to target FPS
            if (currentTime - this.lastFrameTime >= this.frameInterval) {
                const deltaTime = (currentTime - this.lastFrameTime) / 1000;
                this.update(deltaTime);
                this.render();
                this.lastFrameTime = currentTime;
            }
            
            requestAnimationFrame(gameLoop);
        };
        
        requestAnimationFrame(gameLoop);
    }
    
    /**
     * Update game logic
     */
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Handle player movement
        this.updatePlayer(deltaTime);
        
        // Check win condition
        this.checkWinCondition();
    }
    
    /**
     * Update player position with smooth interpolated movement
     */
    updatePlayer(deltaTime) {
        const currentTime = Date.now();
        
        // Handle smooth movement interpolation
        if (this.isMoving) {
            const elapsed = currentTime - this.moveStartTime;
            const progress = Math.min(elapsed / this.moveDuration, 1);
            
            // Use smooth easeInOut for very fluid movement
            const easeProgress = progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            // Interpolate position
            this.player.x = this.moveStartPos.x + (this.moveTargetPos.x - this.moveStartPos.x) * easeProgress;
            this.player.y = this.moveStartPos.y + (this.moveTargetPos.y - this.moveStartPos.y) * easeProgress;
            
            // Check if movement is complete
            if (progress >= 1) {
                this.player.x = this.moveTargetPos.x;
                this.player.y = this.moveTargetPos.y;
                this.isMoving = false;
            }
            
            return; // Don't accept new input while moving
        }
        
        // Check for new movement input - allow faster input when not moving
        if (currentTime - this.lastInputTime < this.inputDelay && this.isMoving) {
            return;
        }
        
        let targetX = this.player.x;
        let targetY = this.player.y;
        let hasNewMove = false;
        
        // Get input from controls - move one grid cell at a time
        if (this.controls.isPressed('up')) {
            targetY = this.player.y - this.cellSize;
            if (this.canMoveTo(this.player.x, targetY)) {
                hasNewMove = true;
            }
        }
        else if (this.controls.isPressed('down')) {
            targetY = this.player.y + this.cellSize;
            if (this.canMoveTo(this.player.x, targetY)) {
                hasNewMove = true;
            }
        }
        else if (this.controls.isPressed('left')) {
            targetX = this.player.x - this.cellSize;
            if (this.canMoveTo(targetX, this.player.y)) {
                hasNewMove = true;
            }
        }
        else if (this.controls.isPressed('right')) {
            targetX = this.player.x + this.cellSize;
            if (this.canMoveTo(targetX, this.player.y)) {
                hasNewMove = true;
            }
        }
        
        // Start new movement
        if (hasNewMove) {
            this.moveStartPos = { x: this.player.x, y: this.player.y };
            this.moveTargetPos = { x: targetX, y: targetY };
            this.moveStartTime = currentTime;
            this.lastInputTime = currentTime;
            this.isMoving = true;
            
            // Play movement sound
            this.audio.playSound('hit', 0.15);
        }
    }
    
    /**
     * Check if player can move to position
     */
    canMoveTo(x, y) {
        const margin = this.player.radius;
        
        // Check bounds
        if (x - margin < 0 || x + margin > this.canvas.width ||
            y - margin < 0 || y + margin > this.canvas.height) {
            return false;
        }
        
        // Check collision with maze walls
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        
        // Check the cell the player is in and surrounding cells
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const checkX = cellX + dx;
                const checkY = cellY + dy;
                
                if (this.maze && this.maze.isWall(checkX, checkY)) {
                    // Check circular collision with wall
                    const wallLeft = checkX * this.cellSize;
                    const wallRight = wallLeft + this.cellSize;
                    const wallTop = checkY * this.cellSize;
                    const wallBottom = wallTop + this.cellSize;
                    
                    // Find closest point on wall to player
                    const closestX = Math.max(wallLeft, Math.min(x, wallRight));
                    const closestY = Math.max(wallTop, Math.min(y, wallBottom));
                    
                    // Check distance
                    const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
                    if (distance < margin) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * Check if player reached the exit
     */
    checkWinCondition() {
        if (!this.maze) return;
        
        const exitPos = this.maze.getExitPosition();
        const exitCenterX = exitPos.x * this.cellSize + this.cellSize / 2;
        const exitCenterY = exitPos.y * this.cellSize + this.cellSize / 2;
        
        const distance = Math.sqrt(
            (this.player.x - exitCenterX) ** 2 + 
            (this.player.y - exitCenterY) ** 2
        );
        
        if (distance < this.cellSize / 2) {
            this.endGame(true);
        }
    }
    
    /**
     * End the game
     */
    endGame(victory) {
        console.log('Game ended:', victory ? 'Victory!' : 'Defeat!');
        
        this.gameState = victory ? 'victory' : 'defeat';
        
        // Stop timer
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        // Play appropriate sound
        if (victory) {
            this.audio.playSound('success');
            document.getElementById('victoryTime').textContent = `Time remaining: ${this.gameTime} seconds`;
            this.showScreen('victoryScreen');
        } else {
            this.audio.playSound('hit', 0.5);
            this.showScreen('gameOverScreen');
        }
    }
    
    /**
     * Show specific screen
     */
    showScreen(screenId) {
        // Hide all screens
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }
    
    /**
     * Render the game
     */
    render() {
        if (this.gameState !== 'playing') return;
        
        // Clear canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate visible area around player
        const lightRadius = this.player.lightRadius;
        const playerGridX = Math.floor(this.player.x / this.cellSize);
        const playerGridY = Math.floor(this.player.y / this.cellSize);
        const cellsToCheck = Math.ceil(lightRadius / this.cellSize) + 2;
        
        // Render maze with lighting
        this.lighting.renderWithLighting(
            this.ctx,
            this.maze,
            this.player,
            this.cellSize,
            playerGridX,
            playerGridY,
            cellsToCheck
        );
        
        // Render player
        this.renderPlayer();
        
        // Render exit glow if visible
        this.renderExitGlow();
    }
    
    /**
     * Render the player
     */
    renderPlayer() {
        this.ctx.save();
        
        // Player body
        this.ctx.fillStyle = '#ff6b35';
        this.ctx.shadowColor = '#ff6b35';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Player inner glow
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowBlur = 5;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    /**
     * Render exit glow effect
     */
    renderExitGlow() {
        if (!this.maze) return;
        
        const exitPos = this.maze.getExitPosition();
        const exitX = exitPos.x * this.cellSize + this.cellSize / 2;
        const exitY = exitPos.y * this.cellSize + this.cellSize / 2;
        
        // Check if exit is within light range
        const distance = Math.sqrt(
            (this.player.x - exitX) ** 2 + 
            (this.player.y - exitY) ** 2
        );
        
        if (distance < this.player.lightRadius) {
            this.ctx.save();
            
            // Create pulsing glow effect
            const pulseIntensity = 0.7 + 0.3 * Math.sin(Date.now() * 0.005);
            
            // Outer glow
            this.ctx.fillStyle = `rgba(74, 222, 128, ${0.3 * pulseIntensity})`;
            this.ctx.shadowColor = '#4ade80';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(exitX, exitY, this.cellSize * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Inner glow
            this.ctx.fillStyle = `rgba(163, 230, 53, ${0.8 * pulseIntensity})`;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(exitX, exitY, this.cellSize * 0.2, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ShadowMazeGame();
});

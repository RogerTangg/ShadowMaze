/**
 * Shadow Maze Game - Main Game Controller
 * Handles game states, rendering, and game loop
 */

class ShadowMazeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'start'; // start, playing, victory, defeat
        this.gameTime = 60; // seconds
        this.gameTimer = null;
        
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
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calculate maze dimensions based on screen size
        this.mazeWidth = Math.floor(this.canvas.width / this.cellSize);
        this.mazeHeight = Math.floor(this.canvas.height / this.cellSize);
        
        // Ensure odd dimensions for proper maze generation
        if (this.mazeWidth % 2 === 0) this.mazeWidth--;
        if (this.mazeHeight % 2 === 0) this.mazeHeight--;
        
        // Minimum maze size
        this.mazeWidth = Math.max(this.mazeWidth, 21);
        this.mazeHeight = Math.max(this.mazeHeight, 15);
    }
    
    /**
     * Setup UI event listeners
     */
    setupUI() {
        // Start button
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Play again button
        document.getElementById('playAgainButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Try again button
        document.getElementById('tryAgainButton').addEventListener('click', () => {
            this.startGame();
        });
        
        // Mute button
        document.getElementById('muteButton').addEventListener('click', () => {
            this.audio.toggleMute();
            const muteBtn = document.getElementById('muteButton');
            muteBtn.textContent = this.audio.isMuted ? '🔇' : '🔊';
        });
    }
    
    /**
     * Start a new game
     */
    startGame() {
        console.log('Starting new game...');
        
        // Reset game state
        this.gameState = 'playing';
        this.gameTime = 60;
        
        // Generate new maze
        this.maze = new MazeGenerator(this.mazeWidth, this.mazeHeight);
        this.maze.generate();
        
        // Create player at maze start
        const startPos = this.maze.getStartPosition();
        this.player = {
            x: startPos.x * this.cellSize + this.cellSize / 2,
            y: startPos.y * this.cellSize + this.cellSize / 2,
            radius: 8,
            speed: 120, // pixels per second
            lightRadius: 100
        };
        
        // Setup lighting
        this.lighting.setup(this.canvas.width, this.canvas.height);
        
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
     * Update player position and handle collisions
     */
    updatePlayer(deltaTime) {
        const moveSpeed = this.player.speed * deltaTime;
        let newX = this.player.x;
        let newY = this.player.y;
        
        // Get input from controls
        if (this.controls.isPressed('up') || this.controls.isPressed('KeyW')) {
            newY -= moveSpeed;
        }
        if (this.controls.isPressed('down') || this.controls.isPressed('KeyS')) {
            newY += moveSpeed;
        }
        if (this.controls.isPressed('left') || this.controls.isPressed('KeyA')) {
            newX -= moveSpeed;
        }
        if (this.controls.isPressed('right') || this.controls.isPressed('KeyD')) {
            newX += moveSpeed;
        }
        
        // Check collision with maze walls
        if (this.canMoveTo(newX, newY)) {
            // Play movement sound occasionally
            if (newX !== this.player.x || newY !== this.player.y) {
                if (Math.random() < 0.02) { // 2% chance per frame
                    this.audio.playSound('hit', 0.1);
                }
            }
            
            this.player.x = newX;
            this.player.y = newY;
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

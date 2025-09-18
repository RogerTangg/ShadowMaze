/**
 * Maze Generator using DFS (Depth-First Search) Algorithm
 * Creates a perfect maze with exactly one path between any two points
 */

class MazeGenerator {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.startPos = { x: 1, y: 1 };
        this.exitPos = { x: width - 2, y: height - 2 };
        
        // Initialize grid with all walls
        this.initializeGrid();
    }
    
    /**
     * Initialize the maze grid with walls
     */
    initializeGrid() {
        this.grid = [];
        for (let y = 0; y < this.height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.width; x++) {
                this.grid[y][x] = 1; // 1 = wall, 0 = path
            }
        }
    }
    
    /**
     * Generate the maze using DFS algorithm
     */
    generate() {
        console.log(`Generating maze: ${this.width}x${this.height}`);
        
        // Start from position (1,1)
        this.carvePath(1, 1);
        
        // Ensure start and exit positions are clear
        this.grid[this.startPos.y][this.startPos.x] = 0;
        this.grid[this.exitPos.y][this.exitPos.x] = 0;
        
        // Create some additional connections for interesting gameplay
        this.createAdditionalPaths();
        
        console.log('Maze generation complete');
    }
    
    /**
     * Carve a path using DFS algorithm
     */
    carvePath(x, y) {
        // Mark current cell as path
        this.grid[y][x] = 0;
        
        // Get all possible directions in random order
        const directions = this.getRandomDirections();
        
        for (const dir of directions) {
            const newX = x + dir.x * 2; // Move 2 cells to skip walls
            const newY = y + dir.y * 2;
            
            // Check if the new position is valid and unvisited
            if (this.isValidCell(newX, newY) && this.grid[newY][newX] === 1) {
                // Carve the wall between current and new cell
                this.grid[y + dir.y][x + dir.x] = 0;
                
                // Recursively carve from new position
                this.carvePath(newX, newY);
            }
        }
    }
    
    /**
     * Get directions in random order
     */
    getRandomDirections() {
        const directions = [
            { x: 0, y: -1 }, // Up
            { x: 1, y: 0 },  // Right
            { x: 0, y: 1 },  // Down
            { x: -1, y: 0 }  // Left
        ];
        
        // Fisher-Yates shuffle
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }
        
        return directions;
    }
    
    /**
     * Check if cell is valid for maze generation
     */
    isValidCell(x, y) {
        return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
    }
    
    /**
     * Create additional paths to make the maze more interesting
     * Removes some walls to create loops and alternative routes
     */
    createAdditionalPaths() {
        const pathsToCreate = Math.floor((this.width * this.height) * 0.02); // 2% of total cells
        
        for (let i = 0; i < pathsToCreate; i++) {
            const x = 1 + Math.floor(Math.random() * (this.width - 2));
            const y = 1 + Math.floor(Math.random() * (this.height - 2));
            
            // Only remove walls that connect two paths
            if (this.grid[y][x] === 1 && this.countAdjacentPaths(x, y) >= 2) {
                this.grid[y][x] = 0;
            }
        }
    }
    
    /**
     * Count adjacent path cells
     */
    countAdjacentPaths(x, y) {
        let count = 0;
        const directions = [
            { x: 0, y: -1 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: -1, y: 0 }
        ];
        
        for (const dir of directions) {
            const newX = x + dir.x;
            const newY = y + dir.y;
            
            if (newX >= 0 && newX < this.width && newY >= 0 && newY < this.height) {
                if (this.grid[newY][newX] === 0) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    /**
     * Check if a cell is a wall
     */
    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return true; // Out of bounds is considered a wall
        }
        return this.grid[y][x] === 1;
    }
    
    /**
     * Check if a cell is a path
     */
    isPath(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        return this.grid[y][x] === 0;
    }
    
    /**
     * Get the start position
     */
    getStartPosition() {
        return { ...this.startPos };
    }
    
    /**
     * Get the exit position
     */
    getExitPosition() {
        return { ...this.exitPos };
    }
    
    /**
     * Get the maze grid for debugging
     */
    getGrid() {
        return this.grid;
    }
    
    /**
     * Print maze to console for debugging
     */
    printMaze() {
        console.log('Maze layout:');
        for (let y = 0; y < this.height; y++) {
            let row = '';
            for (let x = 0; x < this.width; x++) {
                if (x === this.startPos.x && y === this.startPos.y) {
                    row += 'S'; // Start
                } else if (x === this.exitPos.x && y === this.exitPos.y) {
                    row += 'E'; // Exit
                } else if (this.grid[y][x] === 1) {
                    row += '█'; // Wall
                } else {
                    row += ' '; // Path
                }
            }
            console.log(row);
        }
    }
}

/**
 * Lighting System for Shadow Maze
 * Handles dynamic lighting, shadow casting, and fog of war
 */

class LightingSystem {
    constructor() {
        this.shadowCanvas = null;
        this.shadowCtx = null;
        this.lightCanvas = null;
        this.lightCtx = null;
    }
    
    /**
     * Setup lighting canvases
     */
    setup(width, height) {
        // Create shadow canvas
        this.shadowCanvas = document.createElement('canvas');
        this.shadowCanvas.width = width;
        this.shadowCanvas.height = height;
        this.shadowCtx = this.shadowCanvas.getContext('2d');
        
        // Create light canvas
        this.lightCanvas = document.createElement('canvas');
        this.lightCanvas.width = width;
        this.lightCanvas.height = height;
        this.lightCtx = this.lightCanvas.getContext('2d');
    }
    
    /**
     * Render the maze with dynamic lighting
     */
    renderWithLighting(ctx, maze, player, cellSize, playerGridX, playerGridY, cellsToCheck) {
        // Clear canvases
        this.clearCanvases();
        
        // Render maze walls to shadow canvas
        this.renderMazeToShadowCanvas(maze, cellSize, playerGridX, playerGridY, cellsToCheck);
        
        // Create light mask
        this.createLightMask(player);
        
        // Render visible maze parts
        this.renderVisibleMaze(ctx, maze, player, cellSize, playerGridX, playerGridY, cellsToCheck);
    }
    
    /**
     * Clear all lighting canvases
     */
    clearCanvases() {
        this.shadowCtx.clearRect(0, 0, this.shadowCanvas.width, this.shadowCanvas.height);
        this.lightCtx.clearRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
    }
    
    /**
     * Render maze walls to shadow canvas for occlusion
     */
    renderMazeToShadowCanvas(maze, cellSize, playerGridX, playerGridY, cellsToCheck) {
        this.shadowCtx.fillStyle = '#000000';
        
        const startX = Math.max(0, playerGridX - cellsToCheck);
        const endX = Math.min(maze.width, playerGridX + cellsToCheck);
        const startY = Math.max(0, playerGridY - cellsToCheck);
        const endY = Math.min(maze.height, playerGridY + cellsToCheck);
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (maze.isWall(x, y)) {
                    this.shadowCtx.fillRect(
                        x * cellSize,
                        y * cellSize,
                        cellSize,
                        cellSize
                    );
                }
            }
        }
    }
    
    /**
     * Create a radial light mask with shadow casting
     */
    createLightMask(player) {
        // Fill with black (no light)
        this.lightCtx.fillStyle = '#000000';
        this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);
        
        // Cast light rays in all directions
        this.castLightRays(player);
    }
    
    /**
     * Cast light rays using raycasting algorithm
     */
    castLightRays(player) {
        const rayCount = 360; // Number of rays to cast
        const lightRadius = player.lightRadius;
        
        // Create gradient for smooth light falloff
        const gradient = this.lightCtx.createRadialGradient(
            player.x, player.y, 0,
            player.x, player.y, lightRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // Use composite operation to create light
        this.lightCtx.globalCompositeOperation = 'screen';
        
        // Cast rays in all directions
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const rayEnd = this.castRay(player.x, player.y, angle, lightRadius);
            
            // Draw light ray
            this.drawLightRay(player.x, player.y, rayEnd.x, rayEnd.y, gradient);
        }
        
        // Reset composite operation
        this.lightCtx.globalCompositeOperation = 'source-over';
    }
    
    /**
     * Cast a single ray and find where it hits a wall
     */
    castRay(startX, startY, angle, maxDistance) {
        const deltaX = Math.cos(angle);
        const deltaY = Math.sin(angle);
        const step = 1; // Ray step size
        
        let currentX = startX;
        let currentY = startY;
        let distance = 0;
        
        while (distance < maxDistance) {
            currentX += deltaX * step;
            currentY += deltaY * step;
            distance += step;
            
            // Check if ray hit a shadow (wall)
            if (this.isInShadow(currentX, currentY)) {
                break;
            }
            
            // Check bounds
            if (currentX < 0 || currentX >= this.shadowCanvas.width ||
                currentY < 0 || currentY >= this.shadowCanvas.height) {
                break;
            }
        }
        
        return { x: currentX, y: currentY };
    }
    
    /**
     * Check if a point is in shadow (hits a wall)
     */
    isInShadow(x, y) {
        if (x < 0 || x >= this.shadowCanvas.width ||
            y < 0 || y >= this.shadowCanvas.height) {
            return true;
        }
        
        const pixelData = this.shadowCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
        return pixelData[3] > 0; // Check alpha channel
    }
    
    /**
     * Draw a light ray between two points
     */
    drawLightRay(startX, startY, endX, endY, gradient) {
        this.lightCtx.save();
        
        // Create a triangle to represent the light ray
        this.lightCtx.fillStyle = gradient;
        this.lightCtx.globalAlpha = 0.1;
        
        this.lightCtx.beginPath();
        this.lightCtx.moveTo(startX, startY);
        this.lightCtx.lineTo(endX, endY);
        this.lightCtx.arc(startX, startY, 2, 0, Math.PI * 2);
        this.lightCtx.fill();
        
        this.lightCtx.restore();
    }
    
    /**
     * Render the visible parts of the maze
     */
    renderVisibleMaze(ctx, maze, player, cellSize, playerGridX, playerGridY, cellsToCheck) {
        // Create a circular light area
        this.renderCircularLight(ctx, player);
        
        // Render maze elements within light
        this.renderMazeElements(ctx, maze, player, cellSize, playerGridX, playerGridY, cellsToCheck);
    }
    
    /**
     * Render circular light around player
     */
    renderCircularLight(ctx, player) {
        ctx.save();
        
        // Create circular clipping mask
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.lightRadius, 0, Math.PI * 2);
        ctx.clip();
        
        // Create radial gradient for lighting
        const gradient = ctx.createRadialGradient(
            player.x, player.y, 0,
            player.x, player.y, player.lightRadius
        );
        gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
        gradient.addColorStop(0.4, 'rgba(255, 107, 53, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
        
        // Fill the light area
        ctx.fillStyle = gradient;
        ctx.fillRect(
            player.x - player.lightRadius,
            player.y - player.lightRadius,
            player.lightRadius * 2,
            player.lightRadius * 2
        );
        
        ctx.restore();
    }
    
    /**
     * Render maze elements (walls and paths)
     */
    renderMazeElements(ctx, maze, player, cellSize, playerGridX, playerGridY, cellsToCheck) {
        const startX = Math.max(0, playerGridX - cellsToCheck);
        const endX = Math.min(maze.width, playerGridX + cellsToCheck);
        const startY = Math.max(0, playerGridY - cellsToCheck);
        const endY = Math.min(maze.height, playerGridY + cellsToCheck);
        
        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const cellX = x * cellSize;
                const cellY = y * cellSize;
                const cellCenterX = cellX + cellSize / 2;
                const cellCenterY = cellY + cellSize / 2;
                
                // Check if cell is within light radius
                const distance = Math.sqrt(
                    (player.x - cellCenterX) ** 2 + 
                    (player.y - cellCenterY) ** 2
                );
                
                if (distance < player.lightRadius) {
                    // Calculate light intensity
                    const intensity = Math.max(0, 1 - distance / player.lightRadius);
                    
                    if (maze.isWall(x, y)) {
                        this.renderWall(ctx, cellX, cellY, cellSize, intensity);
                    } else {
                        this.renderPath(ctx, cellX, cellY, cellSize, intensity);
                    }
                }
            }
        }
    }
    
    /**
     * Render a wall cell
     */
    renderWall(ctx, x, y, size, intensity) {
        ctx.save();
        
        // Base wall color
        const wallColor = `rgba(64, 64, 64, ${intensity})`;
        ctx.fillStyle = wallColor;
        ctx.fillRect(x, y, size, size);
        
        // Wall border for definition
        const borderColor = `rgba(96, 96, 96, ${intensity * 0.8})`;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
        
        // Subtle highlight on top edge
        const highlightColor = `rgba(128, 128, 128, ${intensity * 0.6})`;
        ctx.strokeStyle = highlightColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y);
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Render a path cell
     */
    renderPath(ctx, x, y, size, intensity) {
        ctx.save();
        
        // Path color with slight warm tint
        const pathColor = `rgba(32, 24, 16, ${intensity * 0.3})`;
        ctx.fillStyle = pathColor;
        ctx.fillRect(x, y, size, size);
        
        ctx.restore();
    }
}

/**
 * Game Controls System
 * Handles keyboard and touch input for player movement
 */

export class GameControls {
    constructor() {
        this.keys = {};
        this.touchControls = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        
        // Initialize input handlers
        this.setupKeyboardControls();
        this.setupTouchControls();
    }
    
    /**
     * Setup keyboard event listeners
     */
    setupKeyboardControls() {
        // Key mappings
        this.keyMappings = {
            'KeyW': 'up',
            'ArrowUp': 'up',
            'KeyS': 'down',
            'ArrowDown': 'down',
            'KeyA': 'left',
            'ArrowLeft': 'left',
            'KeyD': 'right',
            'ArrowRight': 'right'
        };
        
        // Keydown event
        document.addEventListener('keydown', (event) => {
            const action = this.keyMappings[event.code];
            if (action) {
                event.preventDefault();
                this.keys[event.code] = true;
                console.log(`Key pressed: ${event.code} -> ${action}`);
            }
        });
        
        // Keyup event
        document.addEventListener('keyup', (event) => {
            const action = this.keyMappings[event.code];
            if (action) {
                event.preventDefault();
                this.keys[event.code] = false;
                console.log(`Key released: ${event.code} -> ${action}`);
            }
        });
        
        // Handle window focus loss
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }
    
    /**
     * Setup touch controls for mobile devices
     */
    setupTouchControls() {
        // Get touch control elements
        const upBtn = document.getElementById('upBtn');
        const downBtn = document.getElementById('downBtn');
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        
        // Touch start events
        upBtn?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.up = true;
            console.log('Touch: up pressed');
        });
        
        downBtn?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.down = true;
            console.log('Touch: down pressed');
        });
        
        leftBtn?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.left = true;
            console.log('Touch: left pressed');
        });
        
        rightBtn?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchControls.right = true;
            console.log('Touch: right pressed');
        });
        
        // Touch end events
        upBtn?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.up = false;
            console.log('Touch: up released');
        });
        
        downBtn?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.down = false;
            console.log('Touch: down released');
        });
        
        leftBtn?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.left = false;
            console.log('Touch: left released');
        });
        
        rightBtn?.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touchControls.right = false;
            console.log('Touch: right released');
        });
        
        // Mouse events for desktop testing
        const addMouseEvents = (btn, direction) => {
            if (!btn) return;
            
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.touchControls[direction] = true;
            });
            
            btn.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.touchControls[direction] = false;
            });
            
            btn.addEventListener('mouseleave', (e) => {
                e.preventDefault();
                this.touchControls[direction] = false;
            });
        };
        
        addMouseEvents(upBtn, 'up');
        addMouseEvents(downBtn, 'down');
        addMouseEvents(leftBtn, 'left');
        addMouseEvents(rightBtn, 'right');
        
        // Prevent context menu on touch controls
        [upBtn, downBtn, leftBtn, rightBtn].forEach(btn => {
            btn?.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });
    }
    
    /**
     * Check if a key or direction is currently pressed
     */
    isPressed(keyOrDirection) {
        // Check keyboard input
        if (this.keys[keyOrDirection]) {
            return true;
        }
        
        // Check mapped keyboard input
        const mappedKeys = Object.entries(this.keyMappings)
            .filter(([_, action]) => action === keyOrDirection)
            .map(([key, _]) => key);
        
        for (const key of mappedKeys) {
            if (this.keys[key]) {
                return true;
            }
        }
        
        // Check touch controls
        return this.touchControls[keyOrDirection] || false;
    }
    
    /**
     * Get current movement vector
     */
    getMovementVector() {
        const vector = { x: 0, y: 0 };
        
        if (this.isPressed('up')) vector.y -= 1;
        if (this.isPressed('down')) vector.y += 1;
        if (this.isPressed('left')) vector.x -= 1;
        if (this.isPressed('right')) vector.x += 1;
        
        // Normalize diagonal movement
        if (vector.x !== 0 && vector.y !== 0) {
            const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            vector.x /= length;
            vector.y /= length;
        }
        
        return vector;
    }
    
    /**
     * Reset all input states
     */
    reset() {
        this.keys = {};
        this.touchControls = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }
    
    /**
     * Check if any movement key is pressed
     */
    isMoving() {
        return this.isPressed('up') || this.isPressed('down') || 
               this.isPressed('left') || this.isPressed('right');
    }
    
    /**
     * Cleanup event listeners
     */
    cleanup() {
        // Note: In a real application, you'd want to store references
        // to the event listeners so you can properly remove them
        console.log('Controls cleanup - event listeners remain active');
    }
}

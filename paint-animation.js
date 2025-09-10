/**
 * Blue Paint Suction Animation
 * Creates an interactive effect where mouse movement "sucks" away blue paint to reveal content
 */

class PaintSuctionAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = true;
        this.mouseX = 0;
        this.mouseY = 0;
        this.holes = [];
        this.animationId = null;
        
        // Configuration
        this.holeRadius = 60;
        this.fadeSpeed = 0.98;
        this.maxHoles = 100;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        this.canvas = document.getElementById('paintCanvas');
        if (!this.canvas) {
            console.error('Paint canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size to viewport
        this.resizeCanvas();
        
        // Initial blue paint
        this.fillCanvas();
        
        // Add event listeners
        this.addEventListeners();
        
        // Add active class to body
        document.body.classList.add('paint-active');
        
        // Start animation loop
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    fillCanvas() {
        // Fill canvas with blue paint
        this.ctx.fillStyle = '#007bff'; // Bootstrap primary blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    addEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            if (this.isActive) {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.createHole(e.clientX, e.clientY);
            }
        });
        
        // Touch support for mobile
        window.addEventListener('touchmove', (e) => {
            if (this.isActive && e.touches.length > 0) {
                const touch = e.touches[0];
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
                this.createHole(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.fillCanvas();
        });
        
        // Deactivate after significant interaction
        let interactionCount = 0;
        const checkDeactivation = () => {
            interactionCount++;
            if (interactionCount > 200) { // After ~200 mouse movements
                setTimeout(() => this.deactivate(), 3000); // Deactivate after 3 seconds
            }
        };
        
        window.addEventListener('mousemove', checkDeactivation);
    }
    
    createHole(x, y) {
        // Add new hole
        this.holes.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: this.holeRadius + Math.random() * 20,
            growing: true
        });
        
        // Limit number of holes for performance
        if (this.holes.length > this.maxHoles) {
            this.holes.splice(0, this.holes.length - this.maxHoles);
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Clear and refill canvas
        this.fillCanvas();
        
        // Set composite operation to cut holes
        this.ctx.globalCompositeOperation = 'destination-out';
        
        // Draw and update holes
        for (let i = this.holes.length - 1; i >= 0; i--) {
            const hole = this.holes[i];
            
            if (hole.growing && hole.radius < hole.maxRadius) {
                hole.radius += 2;
            } else {
                hole.growing = false;
            }
            
            // Create gradient for smooth edges
            const gradient = this.ctx.createRadialGradient(
                hole.x, hole.y, 0,
                hole.x, hole.y, hole.radius
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(hole.x, hole.y, hole.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    deactivate() {
        this.isActive = false;
        
        // Fade out the canvas
        let opacity = 1;
        const fadeOut = () => {
            opacity -= 0.02;
            this.canvas.style.opacity = opacity;
            
            if (opacity <= 0) {
                this.canvas.style.display = 'none';
                document.body.classList.remove('paint-active');
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
            } else {
                requestAnimationFrame(fadeOut);
            }
        };
        
        fadeOut();
    }
}

// Initialize animation when page loads
new PaintSuctionAnimation();
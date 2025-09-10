/**
 * Simple Blue Paint Suction Animation
 * Creates a smooth, fluid effect where mouse movement sucks away blue paint to reveal content
 */

class SimplePaintSuction {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isActive = true;
        this.suctionAreas = []; // Permanent suction holes
        this.animationId = null;
        
        // Configuration
        this.suctionRadius = 60;
        this.growthSpeed = 2;
        this.maxSuctionAreas = 150;
        
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
        
        // Fill with blue paint initially
        this.fillCanvas();
        
        // Add event listeners
        this.addEventListeners();
        
        // Prevent body scrolling during animation
        document.body.classList.add('paint-active');
        
        // Start animation loop
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    fillCanvas() {
        // Fill canvas with solid blue paint
        this.ctx.fillStyle = '#007bff'; // Bootstrap primary blue
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    addEventListeners() {
        // Mouse movement
        window.addEventListener('mousemove', (e) => {
            if (this.isActive) {
                this.createSuctionArea(e.clientX, e.clientY);
            }
        });
        
        // Touch support for mobile
        window.addEventListener('touchmove', (e) => {
            if (this.isActive && e.touches.length > 0) {
                const touch = e.touches[0];
                this.createSuctionArea(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.redrawCurrentState();
        });
        
        // Auto-deactivate after sufficient interaction
        let interactionCount = 0;
        const originalMouseMove = (e) => {
            interactionCount++;
            if (interactionCount > 100) { // After 100 movements
                setTimeout(() => this.deactivate(), 3000); // Wait 3 seconds then deactivate
            }
        };
        
        window.addEventListener('mousemove', originalMouseMove);
    }
    
    createSuctionArea(x, y) {
        // Check if too close to existing suction area to prevent overlap
        const minDistance = this.suctionRadius * 0.4;
        const tooClose = this.suctionAreas.some(area => {
            const distance = Math.sqrt((area.x - x) ** 2 + (area.y - y) ** 2);
            return distance < minDistance;
        });
        
        if (!tooClose) {
            // Add new suction area that will grow smoothly
            this.suctionAreas.push({
                x: x,
                y: y,
                radius: 0,
                maxRadius: this.suctionRadius + Math.random() * 20 - 10, // Slight variation
                growing: true
            });
            
            // Limit number of suction areas for performance
            if (this.suctionAreas.length > this.maxSuctionAreas) {
                this.suctionAreas.splice(0, 10); // Remove oldest 10 areas
            }
        }
    }
    
    suckPaint(x, y, radius) {
        // Use destination-out to create holes in the blue paint
        this.ctx.globalCompositeOperation = 'destination-out';
        
        // Create gradient for smooth suction effect
        const gradient = this.ctx.createRadialGradient(
            x, y, 0,
            x, y, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
    }
    
    redrawCurrentState() {
        // Refill with blue paint
        this.fillCanvas();
        
        // Redraw all existing suction holes
        this.suctionAreas.forEach(area => {
            this.suckPaint(area.x, area.y, area.radius);
        });
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Redraw the blue background
        this.fillCanvas();
        
        // Update and draw all suction areas
        this.suctionAreas.forEach(area => {
            // Grow the suction area smoothly
            if (area.growing && area.radius < area.maxRadius) {
                area.radius += this.growthSpeed;
            } else {
                area.growing = false;
                area.radius = area.maxRadius; // Ensure it reaches exact max
            }
            
            // Draw the suction hole
            this.suckPaint(area.x, area.y, area.radius);
        });
        
        // Continue animation loop
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    deactivate() {
        this.isActive = false;
        
        // Fade out the canvas smoothly
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

// Initialize the animation when page loads
new SimplePaintSuction();
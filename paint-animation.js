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
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.suctionAreas = []; // Areas where paint has been permanently sucked
        this.activeSuctions = []; // Currently growing suction holes
        this.animationId = null;
        this.paintSucked = false; // Track if initial paint fill is done
        
        // Configuration
        this.suctionRadius = 70;
        this.maxSuctionAreas = 200; // Increased for better coverage
        this.triangleSize = 50; // Size of the vacuum nozzle triangle
        
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
        
        // Initial blue paint - only fill once
        this.fillCanvas();
        this.paintSucked = true;
        
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
                // Initialize lastMouse position if this is the first movement
                if (this.lastMouseX === 0 && this.lastMouseY === 0) {
                    this.lastMouseX = e.clientX;
                    this.lastMouseY = e.clientY;
                } else {
                    this.lastMouseX = this.mouseX;
                    this.lastMouseY = this.mouseY;
                }
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
                this.createSuctionArea(e.clientX, e.clientY);
            }
        });
        
        // Touch support for mobile
        window.addEventListener('touchmove', (e) => {
            if (this.isActive && e.touches.length > 0) {
                const touch = e.touches[0];
                // Initialize lastMouse position if this is the first movement
                if (this.lastMouseX === 0 && this.lastMouseY === 0) {
                    this.lastMouseX = touch.clientX;
                    this.lastMouseY = touch.clientY;
                } else {
                    this.lastMouseX = this.mouseX;
                    this.lastMouseY = this.mouseY;
                }
                this.mouseX = touch.clientX;
                this.mouseY = touch.clientY;
                this.createSuctionArea(touch.clientX, touch.clientY);
                e.preventDefault();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // Only refill if we haven't started sucking paint yet
            if (!this.paintSucked || this.suctionAreas.length === 0) {
                this.fillCanvas();
            } else {
                // Recreate the current state with sucked areas
                this.redrawCurrentState();
            }
        });
        
        // Deactivate after significant interaction
        let interactionCount = 0;
        const checkDeactivation = () => {
            interactionCount++;
            if (interactionCount > 150) { // After ~150 mouse movements
                setTimeout(() => this.deactivate(), 2000); // Deactivate after 2 seconds
            }
        };
        
        window.addEventListener('mousemove', checkDeactivation);
    }
    
    createSuctionArea(x, y) {
        // Check if we're too close to an existing suction area to avoid overlap
        const minDistance = this.suctionRadius * 0.3;
        const tooClose = this.suctionAreas.some(area => {
            const distance = Math.sqrt((area.x - x) ** 2 + (area.y - y) ** 2);
            return distance < minDistance;
        });
        
        if (!tooClose) {
            // Calculate angle based on mouse movement direction
            let dx = x - this.lastMouseX;
            let dy = y - this.lastMouseY;
            
            // Default angle if no movement detected
            if (dx === 0 && dy === 0) {
                dx = 1; // Default to rightward direction
            }
            
            const angle = Math.atan2(dy, dx);
            
            // Add to permanent suction areas (for resize redraw)
            const radius = this.suctionRadius + Math.random() * 20 - 10;
            this.suctionAreas.push({
                x: x,
                y: y,
                radius: radius,
                angle: angle,
                timestamp: Date.now()
            });
            
            // Add to active growing suctions for smooth animation
            this.activeSuctions.push({
                x: x,
                y: y,
                radius: 0,
                maxRadius: radius,
                angle: angle,
                growing: true
            });
            
            // Limit number of suction areas for performance
            if (this.suctionAreas.length > this.maxSuctionAreas) {
                this.suctionAreas.splice(0, this.suctionAreas.length - this.maxSuctionAreas);
            }
        }
    }

    suckPaintWithTriangle(x, y, radius, angle) {
        // Set composite operation to cut holes (suck paint)
        this.ctx.globalCompositeOperation = 'destination-out';
        
        // Create gradient for smooth vacuum suction effect
        const gradient = this.ctx.createRadialGradient(
            x, y, 0,
            x, y, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        
        // Draw triangular vacuum nozzle pointing in direction of movement
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        this.ctx.beginPath();
        // Create triangle pointing forward (to the right when angle = 0)
        const triangleWidth = radius * 1.2;
        const triangleHeight = radius * 0.8;
        
        // Triangle vertices: point facing forward, base behind
        this.ctx.moveTo(triangleWidth * 0.6, 0); // Point
        this.ctx.lineTo(-triangleWidth * 0.4, -triangleHeight * 0.5); // Top base
        this.ctx.lineTo(-triangleWidth * 0.4, triangleHeight * 0.5); // Bottom base
        this.ctx.closePath();
        this.ctx.fill();
        
        // Add a circular base for better coverage
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // Reset composite operation
        this.ctx.globalCompositeOperation = 'source-over';
    }

    redrawCurrentState() {
        // Refill canvas with blue paint
        this.fillCanvas();
        
        // Redraw all existing suction areas to maintain the sucked state
        this.suctionAreas.forEach(area => {
            this.suckPaintWithTriangle(area.x, area.y, area.radius, area.angle);
        });
    }
    
    animate() {
        if (!this.isActive) return;
        
        // Clear and refill canvas
        this.fillCanvas();
        
        // Redraw all permanent suction areas first
        this.suctionAreas.forEach(area => {
            this.suckPaintWithTriangle(area.x, area.y, area.radius, area.angle);
        });
        
        // Draw and update active growing suctions for smooth animation
        for (let i = this.activeSuctions.length - 1; i >= 0; i--) {
            const suction = this.activeSuctions[i];
            
            if (suction.growing && suction.radius < suction.maxRadius) {
                suction.radius += 3; // Smooth growth speed
            } else {
                suction.growing = false;
                // Remove completed suctions from active list
                this.activeSuctions.splice(i, 1);
                continue;
            }
            
            // Draw the growing triangular suction
            this.suckPaintWithTriangle(suction.x, suction.y, suction.radius, suction.angle);
        }
        
        // Continue animation loop
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
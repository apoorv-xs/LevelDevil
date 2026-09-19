// Initialize Kaboom
const k = kaboom({
    width: window.innerWidth,
    height: window.innerHeight,
    canvas: document.getElementById("game-canvas"),
    background: [0, 0, 0, 0], // Transparent
    global: true,
});

// Constants
const SPEED = 300;
const JUMP_FORCE = 600;
const GRAVITY = 1600;

setGravity(GRAVITY);

// Assets (Using placeholders or simple rects since we don't have the original sprites handy)
// Ideally you load your actual sprites here.
loadSprite("devil", "favicon.png"); // using favicon temporarily as a sprite

// State
let controlMode = "ambient"; // 'ambient' or 'manual'

// The Player
const player = add([
    rect(32, 32),
    color(208, 90, 58), // Devil Red
    pos(window.innerWidth / 2, 0),
    area(),
    body(),
    "player"
]);

// Track DOM elements and their Kaboom bodies
const domBodies = new Map();

function syncDOM() {
    const elements = document.querySelectorAll('[data-kaboom-body="true"]');
    
    elements.forEach(el => {
        const rectPos = el.getBoundingClientRect();
        const scrollY = window.scrollY;
        
        // Calculate absolute position in the document
        const absY = rectPos.top + scrollY;
        const absX = rectPos.left;
        
        if (!domBodies.has(el)) {
            // Create new body
            const trapType = el.getAttribute("data-trap");
            
            const kBody = add([
                rect(rectPos.width, rectPos.height),
                pos(absX, absY),
                area(),
                body({ isStatic: true }),
                opacity(0), // Invisible, purely for collision
                "platform",
                { trap: trapType, domElement: el }
            ]);
            domBodies.set(el, kBody);
        } else {
            // Update existing body
            const kBody = domBodies.get(el);
            kBody.pos.x = absX;
            kBody.pos.y = absY;
            kBody.use(rect(rectPos.width, rectPos.height)); // Update size
        }
    });
}

// Initial Sync
syncDOM();

// Keep sync on resize
const resizeObserver = new ResizeObserver(() => {
    syncDOM();
});
document.querySelectorAll('[data-kaboom-body="true"]').forEach(el => {
    resizeObserver.observe(el);
});
// Also observe body for overall layout shifts
resizeObserver.observe(document.body);


// --- CAMERA & SCROLL SYNC ---
onUpdate(() => {
    // Lock camera to viewport scroll
    camPos(window.innerWidth / 2, window.scrollY + window.innerHeight / 2);
    
    // Respawn if player falls out of viewport bounds (too far down or stuck above)
    const viewTop = window.scrollY;
    const viewBottom = window.scrollY + window.innerHeight;
    
    if (player.pos.y > viewBottom + 200 || player.pos.y < viewTop - 500) {
        player.pos = vec2(window.innerWidth / 2, viewTop + 50);
        player.vel.y = 0;
        player.vel.x = 0;
    }
});


// --- HYBRID CONTROLS ---

// Switch to manual mode on key press
onKeyDown(() => {
    if (controlMode !== "manual") {
        controlMode = "manual";
        console.log("Switched to Manual Control");
    }
});

// Manual Controls
onKeyDown("left", () => {
    if(controlMode === "manual") player.move(-SPEED, 0);
});
onKeyDown("a", () => {
    if(controlMode === "manual") player.move(-SPEED, 0);
});
onKeyDown("right", () => {
    if(controlMode === "manual") player.move(SPEED, 0);
});
onKeyDown("d", () => {
    if(controlMode === "manual") player.move(SPEED, 0);
});
onKeyPress("space", () => {
    if(controlMode === "manual" && player.isGrounded()) player.jump(JUMP_FORCE);
});
onKeyPress("w", () => {
    if(controlMode === "manual" && player.isGrounded()) player.jump(JUMP_FORCE);
});
onKeyPress("up", () => {
    if(controlMode === "manual" && player.isGrounded()) player.jump(JUMP_FORCE);
});

// Ambient Controls (Follow Cursor)
onUpdate(() => {
    if (controlMode === "ambient") {
        // Find cursor in world space
        const mPos = toWorld(mousePos());
        
        // Move towards cursor X
        if (Math.abs(player.pos.x - mPos.x) > 20) {
            const dir = Math.sign(mPos.x - player.pos.x);
            player.move(dir * SPEED * 0.8, 0);
        }
        
        // Auto jump logic: If stuck against a wall or approaching a gap, jump!
        if (player.isGrounded() && mPos.y < player.pos.y - 100) {
            // Cursor is significantly above us, try jumping
            if (chance(0.02)) player.jump(JUMP_FORCE);
        }
    }
});

// --- MOBILE CONTROLS ---
document.getElementById("btn-left").addEventListener("touchstart", (e) => {
    e.preventDefault();
    controlMode = "manual";
    player.move(-SPEED, 0);
});
document.getElementById("btn-right").addEventListener("touchstart", (e) => {
    e.preventDefault();
    controlMode = "manual";
    player.move(SPEED, 0);
});
document.getElementById("btn-jump").addEventListener("touchstart", (e) => {
    e.preventDefault();
    controlMode = "manual";
    if (player.isGrounded()) player.jump(JUMP_FORCE);
});


// --- TRAPS ---
player.onCollide("platform", (plat) => {
    if (plat.trap === "drop") {
        // Shake the DOM element to warn
        plat.domElement.style.transition = "transform 0.1s";
        plat.domElement.style.transform = "translateX(5px)";
        setTimeout(() => plat.domElement.style.transform = "translateX(-5px)", 50);
        setTimeout(() => plat.domElement.style.transform = "translateX(0)", 100);
        
        // Drop after 0.5s
        setTimeout(() => {
            plat.isStatic = false; // falls via gravity
            plat.domElement.style.transition = "transform 1s ease-in";
            plat.domElement.style.transform = "translateY(1000px)"; // Visual drop
        }, 500);
    }
    
    if (plat.trap === "spikes") {
        // Spawn spikes
        const spikes = add([
            rect(plat.width, 10),
            color(255, 0, 0),
            pos(plat.pos.x, plat.pos.y - 10),
            area(),
            "spike"
        ]);
        plat.domElement.style.borderTop = "5px solid red"; // Visual indicator
    }
});

player.onCollide("spike", () => {
    // Death
    shake(10);
    player.pos = vec2(window.innerWidth / 2, window.scrollY + 50);
    player.vel.y = 0;
});

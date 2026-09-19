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

// State
let controlMode = "idle"; // 'idle', 'ambient' or 'manual'

// --- THE PLAYER (Procedural Graphics) ---
const player = add([
    pos(window.innerWidth / 2, 0),
    rect(20, 40),
    opacity(0), // Hitbox is invisible
    area(),
    body(),
    anchor("bot"),
    rotate(0), 
    scale(1),  
    z(20),
    "player"
]);

const shadow = player.add([ rect(16, 6), anchor("center"), pos(0, 0), color(0, 0, 0), opacity(0.3), z(-1) ]);
const skin = color(44, 44, 44);
const torso = player.add([ rect(16, 20), pos(0, -14), anchor("bot"), skin ]);
const head = player.add([ rect(12, 12), pos(0, -34), anchor("bot"), skin ]);
const leftEye = head.add([ rect(2, 2), pos(-3, -7), color(255, 255, 255), anchor("center"), z(1) ]);
const rightEye = head.add([ rect(2, 2), pos(3, -7), color(255, 255, 255), anchor("center"), z(1) ]);
loop(2.5, () => {
    leftEye.hidden = true; rightEye.hidden = true;
    wait(0.12, () => { leftEye.hidden = false; rightEye.hidden = false; });
});
const lArm = player.add([ rect(6, 16), pos(-6, -30), anchor("top"), skin ]);
const rArm = player.add([ rect(6, 16), pos(6, -30), anchor("top"), skin ]);
const lLeg = player.add([ rect(6, 18), pos(-4, -18), anchor("top"), skin ]);
const rLeg = player.add([ rect(6, 18), pos(4, -18), anchor("top"), skin ]);

player.facingLeft = false;

// Squash and Stretch on land
player.onGround(() => {
    player.scale = vec2(1.2, 0.8);
    tween(player.scale, vec2(1, 1), 0.2, (val) => player.scale = val, easings.easeOutElastic);
});


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
        
        // Offset for top-left anchor vs DOM bounding client rect
        // Kaboom rect anchor is top-left by default.
        
        if (!domBodies.has(el)) {
            const trapType = el.getAttribute("data-trap");
            
            const kBody = add([
                rect(rectPos.width, rectPos.height),
                pos(absX, absY),
                area(),
                body({ isStatic: true }),
                opacity(0), // Invisible
                "platform",
                { trap: trapType, domElement: el }
            ]);
            domBodies.set(el, kBody);
        } else {
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
resizeObserver.observe(document.body);


// --- CAMERA & SCROLL SYNC ---
onUpdate(() => {
    // Lock camera to viewport scroll
    camPos(window.innerWidth / 2, window.scrollY + window.innerHeight / 2);
    
    // Respawn if player falls out of viewport bounds
    const viewTop = window.scrollY;
    const viewBottom = window.scrollY + window.innerHeight;
    
    if (player.pos.y > viewBottom + 200 || player.pos.y < viewTop - 500) {
        player.pos = vec2(window.innerWidth / 2, viewTop + 50);
        player.vel.y = 0;
        player.vel.x = 0;
    }
});


// --- HYBRID CONTROLS ---

// Double click to switch to ambient
window.addEventListener("dblclick", () => {
    if (controlMode !== "ambient") {
        controlMode = "ambient";
        console.log("Switched to Ambient Control");
    }
});

onKeyDown(() => {
    if (controlMode !== "manual") {
        controlMode = "manual";
        console.log("Switched to Manual Control");
    }
});

function jump() {
    if(player.isGrounded()) {
        player.jump(JUMP_FORCE);
        player.scale = vec2(0.8, 1.2);
        tween(player.scale, vec2(1, 1), 0.2, (val) => player.scale = val, easings.easeOutQuad);
    }
}

let isMovingThisFrame = false;

// Manual Controls
onKeyDown("left", () => {
    if(controlMode === "manual") { player.move(-SPEED, 0); player.facingLeft = true; isMovingThisFrame = true; }
});
onKeyDown("a", () => {
    if(controlMode === "manual") { player.move(-SPEED, 0); player.facingLeft = true; isMovingThisFrame = true; }
});
onKeyDown("right", () => {
    if(controlMode === "manual") { player.move(SPEED, 0); player.facingLeft = false; isMovingThisFrame = true; }
});
onKeyDown("d", () => {
    if(controlMode === "manual") { player.move(SPEED, 0); player.facingLeft = false; isMovingThisFrame = true; }
});
onKeyPress("space", () => { if(controlMode === "manual") jump(); });
onKeyPress("w", () => { if(controlMode === "manual") jump(); });
onKeyPress("up", () => { if(controlMode === "manual") jump(); });

// Ambient Controls (Follow Cursor)
onUpdate(() => {
    if (controlMode === "ambient") {
        const mPos = toWorld(mousePos());
        
        if (Math.abs(player.pos.x - mPos.x) > 20) {
            const dir = Math.sign(mPos.x - player.pos.x);
            player.move(dir * SPEED * 0.8, 0);
            player.facingLeft = dir < 0;
            isMovingThisFrame = true;
        }
        
        if (player.isGrounded() && mPos.y < player.pos.y - 100) {
            if (chance(0.02)) jump();
        }
    }

    // -- ANIMATION UPDATES --
    if (!player.isGrounded()) {
        // Jump Pose
        lLeg.angle = 45;
        rLeg.angle = -45;
        lArm.angle = 135;
        rArm.angle = -135;
    } else if (isMovingThisFrame) {
        // Run Cycle
        const t = time() * 15;
        lLeg.angle = Math.sin(t) * 45;
        rLeg.angle = Math.sin(t + Math.PI) * 45;
        lArm.angle = Math.sin(t + Math.PI) * 45;
        rArm.angle = Math.sin(t) * 45;
    } else {
        // Idle
        lLeg.angle = 0;
        rLeg.angle = 0;
        lArm.angle = Math.sin(time() * 2) * 5;
        rArm.angle = -Math.sin(time() * 2) * 5;
        head.pos.y = -34 + Math.sin(time() * 5) * 1;
    }

    // Shadow
    if (!player.isGrounded()) {
        shadow.scale = vec2(0.6, 0.6);
        shadow.opacity = 0.15;
    } else {
        shadow.scale = vec2(1, 1);
        shadow.opacity = 0.3;
    }

    // Direction flip
    const currentScaleX = Math.abs(player.scale.x);
    player.scale.x = player.facingLeft ? -currentScaleX : currentScaleX;
    
    isMovingThisFrame = false; // reset for next frame
});

// --- MOBILE CONTROLS ---
document.getElementById("btn-left").addEventListener("touchstart", (e) => {
    e.preventDefault(); controlMode = "manual";
    player.move(-SPEED, 0); player.facingLeft = true;
});
document.getElementById("btn-right").addEventListener("touchstart", (e) => {
    e.preventDefault(); controlMode = "manual";
    player.move(SPEED, 0); player.facingLeft = false;
});
document.getElementById("btn-jump").addEventListener("touchstart", (e) => {
    e.preventDefault(); controlMode = "manual";
    jump();
});

// --- TRAPS ---
player.onCollide("platform", (plat) => {
    if (plat.trap === "drop") {
        plat.domElement.style.transition = "transform 0.1s";
        plat.domElement.style.transform = "translateX(5px)";
        setTimeout(() => plat.domElement.style.transform = "translateX(-5px)", 50);
        setTimeout(() => plat.domElement.style.transform = "translateX(0)", 100);
        
        setTimeout(() => {
            plat.isStatic = false; 
            plat.domElement.style.transition = "transform 1s ease-in";
            plat.domElement.style.transform = "translateY(1000px)"; 
        }, 500);
    }
    
    if (plat.trap === "spikes") {
        const spikes = add([
            rect(plat.width, 10),
            color(255, 0, 0),
            pos(plat.pos.x, plat.pos.y - 10),
            area(),
            "spike"
        ]);
        plat.domElement.style.borderTop = "5px solid var(--danger)"; 
    }
});

player.onCollide("spike", () => {
    shake(10);
    player.pos = vec2(window.innerWidth / 2, window.scrollY + 50);
    player.vel.y = 0;
});

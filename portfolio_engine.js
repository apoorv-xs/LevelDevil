// Initialize Kaboom
const k = kaboom({
    width: window.innerWidth,
    height: window.innerHeight,
    canvas: document.getElementById("game-canvas"),
    background: [0, 0, 0, 0], // Transparent
    global: true,
});

const SPEED = 200;
const JUMP_FORCE = 550;
const GRAVITY = 1600;
setGravity(GRAVITY);

window.controlMode = "idle"; // 'idle', 'ambient' or 'manual'

// Wait for next frame so player.js is definitely loaded
onLoad(() => {
    // --- THE PLAYER ---
    // Uses createPlayer from player.js
    const player = window.createPlayer ? window.createPlayer(window.innerWidth / 2, 0) : createPlayer(window.innerWidth / 2, 0);
    window.player = player;

    // Track DOM elements and their Kaboom bodies
    const domBodies = new Map();

    function syncDOM() {
        const elements = document.querySelectorAll('[data-kaboom-body="true"]');
        
        elements.forEach(el => {
            const rectPos = el.getBoundingClientRect();
            const scrollY = window.scrollY;
            const absY = rectPos.top + scrollY;
            const absX = rectPos.left;
            
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
                kBody.use(rect(rectPos.width, rectPos.height));
            }
        });
    }

    syncDOM();

    const resizeObserver = new ResizeObserver(() => { syncDOM(); });
    document.querySelectorAll('[data-kaboom-body="true"]').forEach(el => { resizeObserver.observe(el); });
    resizeObserver.observe(document.body);

    // --- CAMERA & SCROLL SYNC ---
    onUpdate(() => {
        camPos(window.innerWidth / 2, window.scrollY + window.innerHeight / 2);
        
        const viewTop = window.scrollY;
        const viewBottom = window.scrollY + window.innerHeight;
        
        if (player.pos.y > viewBottom + 200 || player.pos.y < viewTop - 500) {
            player.pos = vec2(window.innerWidth / 2, viewTop + 50);
            player.vel.y = 0;
            player.vel.x = 0;
        }
    });

    // --- HYBRID CONTROLS ---
    window.addEventListener("dblclick", () => {
        if (window.controlMode !== "ambient") {
            window.controlMode = "ambient";
            console.log("Switched to Ambient Control");
        }
    });

    onKeyDown(() => {
        if (window.controlMode !== "manual") {
            window.controlMode = "manual";
            console.log("Switched to Manual Control");
        }
    });

    // Ambient Controls (Follow Cursor)
    onUpdate(() => {
        if (window.controlMode === "ambient") {
            const mPos = toWorld(mousePos());
            
            if (Math.abs(player.pos.x - mPos.x) > 20) {
                const dir = Math.sign(mPos.x - player.pos.x);
                player.move(dir * SPEED * 0.8, 0);
                player.facingLeft = dir < 0;
                player.isMovingThisFrame = true; // Tell player.js to play run cycle
            }
            
            if (player.isGrounded() && mPos.y < player.pos.y - 100) {
                if (chance(0.02)) {
                    player.jump(JUMP_FORCE);
                    player.scale = vec2(0.8, 1.2);
                    tween(player.scale, vec2(1, 1), 0.2, (val) => player.scale = val, easings.easeOutQuad);
                }
            }
        }
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
            add([
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
});

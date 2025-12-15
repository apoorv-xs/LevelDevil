// traps.js - Reusable Trap Logic

window.createLightningCloud = function (startX, startY, player, floorHeight, onDeathCallback, difficulty = 1.0) {
    if (!player) {
        console.error("createLightningCloud: 'player' object is required.");
        return;
    }

    // Difficulty Scaling
    // Default 1.0 = Hard. 0.5 = Easy.
    const huntSpeedMult = 5.0 * difficulty;
    const chargeSpeedMult = 4.0 * difficulty;
    const chargeTime = 0.4 / difficulty; // Lower difficulty = Slower charge (more time)
    const patrolSpeedVal = 100 * difficulty;
    const patrolFastVal = 800 * difficulty;

    // Special "Trap" Cloud logic
    const trapCloud = add([
        pos(startX, startY),
        rect(80, 26),
        color(255, 255, 255),
        opacity(0.9),
        z(8), // Lower Z to be behind text (z=10)
        "trap_cloud",
        {
            state: "patrol", // patrol, hunt, charge, cooldown
            timer: 0,
            bgTimer: 0,
            initialX: startX
        }
    ]);

    // Cloud Details
    trapCloud.add([rect(40, 26), pos(20, -20), color(255, 255, 255)]);
    trapCloud.add([rect(30, 14), pos(50, 6), color(255, 255, 255)]);

    trapCloud.onUpdate(() => {
        if (!player.exists()) return;

        // RECRUITER MODE: Force passive behavior
        if (window.RECRUITER_MODE) {
            if (trapCloud.state !== "patrol") {
                trapCloud.state = "patrol";
                trapCloud.color = rgb(255, 255, 255);
                trapCloud.timer = 0;
            }
        }

        switch (trapCloud.state) {
            case "patrol":
                const camX = camPos().x;
                const screenHalfW = width() / 2;
                const cloudW = 80;

                const onScreen = (trapCloud.pos.x + cloudW / 2 > camX - screenHalfW) &&
                    (trapCloud.pos.x - cloudW / 2 < camX + screenHalfW);

                const patrolSpeed = onScreen ? patrolSpeedVal : patrolFastVal;

                trapCloud.move(-patrolSpeed, 0);

                if (trapCloud.pos.x < camX - screenHalfW - 200) {
                    trapCloud.pos.x = camX + screenHalfW + 200;
                }

                // Only hunt if NOT in Recruiter Mode AND Player is BELOW the cloud (y is higher)
                if (!window.RECRUITER_MODE &&
                    Math.abs(player.pos.x - trapCloud.pos.x) < 150 &&
                    player.pos.y > trapCloud.pos.y // Ignore if player is above
                ) {
                    trapCloud.state = "hunt";
                }
                break;

            case "hunt":
                const targetX = player.pos.x - 40;
                const curentX = trapCloud.pos.x;
                const dx = targetX - curentX;

                trapCloud.pos.x += dx * dt() * huntSpeedMult;

                if (Math.abs(dx) < 20) {
                    trapCloud.state = "charge";
                    trapCloud.timer = chargeTime;
                    trapCloud.color = rgb(100, 100, 100);
                }

                if (Math.abs(dx) > 350) trapCloud.state = "patrol";
                break;

            case "charge":
                const targetXC = player.pos.x - 40;
                const curentXC = trapCloud.pos.x;
                const dxC = targetXC - curentXC;
                trapCloud.pos.x += dxC * dt() * chargeSpeedMult;

                trapCloud.timer -= dt();

                trapCloud.bgTimer += dt();
                if (trapCloud.bgTimer > 0.05) {
                    trapCloud.bgTimer = 0;
                    trapCloud.color = trapCloud.color.r === 100 ? rgb(150, 50, 50) : rgb(100, 100, 100);
                }

                if (trapCloud.timer <= 0) {
                    fireLightning(trapCloud, player, floorHeight, onDeathCallback);
                    trapCloud.state = "cooldown";
                    trapCloud.timer = 2.0;
                }
                break;

            case "cooldown":
                trapCloud.timer -= dt();
                trapCloud.color = rgb(255, 255, 255);
                if (trapCloud.timer <= 0) {
                    trapCloud.state = "patrol";
                }
                break;
        }
    });

    return trapCloud;
};

function fireLightning(cloud, player, floorHeight, onDeathCallback) {
    const boltX = cloud.pos.x + 40;
    const boltY = cloud.pos.y + 20;

    // Interpret the 3rd arg as "groundYLevel".
    const groundY = floorHeight;
    const boltH = groundY - boltY;

    // Lightning Object (WIDER: 40px)
    const lightning = add([
        rect(40, boltH),
        pos(boltX, boltY),
        color(255, 230, 0), // Power Yellow
        anchor("top"),
        area(),
        z(100), // Very high
        opacity(1),
        "lightning"
    ]);

    lightning.add([
        rect(15, boltH),
        pos(12.5, 0),
        color(255, 255, 255),
        opacity(0.8)
    ]);

    shake(25); // Harder shake

    // Check Hit
    let framesToCheck = 5;
    let hitRegistered = false;

    lightning.onUpdate(() => {
        if (framesToCheck > 0 && !hitRegistered) {
            framesToCheck--;
            if (player.exists() && player.isColliding(lightning)) {
                // RECRUITER MODE: Immunity Check
                if (window.RECRUITER_MODE) return;

                hitRegistered = true;
                addKaboom(player.pos);
                destroy(player);
                shake(40);

                // Trigger Death Callback
                if (onDeathCallback) {
                    wait(1, onDeathCallback);
                }
            }
        } else {
            // Fade out
            lightning.opacity -= dt() * 5;
            if (lightning.opacity <= 0) destroy(lightning);
        }
    });
}

// --- HELPER TRAPS ---

window.createSpikes = function (x, y, count = 3, colorVal) {
    const spikes = [];
    const spikeSize = 20;
    for (let i = 0; i < count; i++) {
        const s = add([
            pos(x + (i * spikeSize), y),
            anchor("botleft"),
            color(colorVal || rgb(200, 200, 200)),
            area({ shape: new Polygon([vec2(0, 0), vec2(10, -30), vec2(20, 0)]) }),
            z(1),
            "danger",
            "spike"
        ]);

        s.onDraw(() => {
            drawPolygon({
                pts: [vec2(0, 0), vec2(10, -30), vec2(20, 0)],
                color: colorVal || rgb(200, 200, 200),
            })
        });

        spikes.push(s);
    }
    return spikes;
};

// FALLING PIT TRAP
window.createPit = function (x, y, widthVal, heightVal, colorVal, player) {
    const platform = add([
        rect(widthVal, heightVal),
        pos(x, y),
        color(colorVal),
        area(),
        body({ isStatic: true }),
        "falling_platform"
    ]);

    let triggered = false;
    const triggerX = x - 20;

    platform.onUpdate(() => {
        if (triggered || !player.exists()) return;

        // RECRUITER MODE: Ignore trigger
        if (window.RECRUITER_MODE) return;

        if (player.pos.x > triggerX && player.pos.x < x + widthVal) {
            triggered = true;
            shake(2);
            wait(0.1, () => {
                tween(platform.pos.y, platform.pos.y + 400, 0.3, (val) => platform.pos.y = val, easings.easeInExpo);
            });
        }
    });

    add([
        rect(widthVal, 10),
        pos(x, y + 250),
        opacity(0),
        area(),
        "void"
    ]);
};

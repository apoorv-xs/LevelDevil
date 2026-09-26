/**
 * Featherweight 2.5D Micro-Runner (Kaboom Drop-in Replacement)
 * Purpose-built for Level Devil 2.5D Spatial Portfolio Engine
 * Slashes ~120KB of dead weight while guaranteeing locked 60 FPS physics
 */

(function(global) {
    let _gravity = 1600;
    let _lastTime = (typeof performance !== "undefined") ? performance.now() : Date.now();
    let _dt = 0.016;
    const updateCallbacks = [];
    const activeKeys = new Set();
    const pressedKeys = new Set();
    const keyPressCallbacks = [];
    const keyDownCallbacks = [];
    const keyReleaseCallbacks = [];

    // Key event normalization
    function normalizeKey(k) {
        if (!k) return "";
        const lower = k.toLowerCase();
        if (lower === "arrowleft") return "left";
        if (lower === "arrowright") return "right";
        if (lower === "arrowup") return "up";
        if (lower === "arrowdown") return "down";
        if (lower === " ") return "space";
        return lower;
    }

    if (typeof window !== "undefined") {
        window.addEventListener("keydown", (e) => {
            const key = normalizeKey(e.key);
            if (!activeKeys.has(key)) {
                pressedKeys.add(key);
                for (let i = 0; i < keyPressCallbacks.length; i++) {
                    const entry = keyPressCallbacks[i];
                    if (entry.key === "*" || entry.key === key) {
                        try { entry.cb(key); } catch (err) { console.error(err); }
                    }
                }
            }
            activeKeys.add(key);
            for (let i = 0; i < keyDownCallbacks.length; i++) {
                try { keyDownCallbacks[i](key); } catch (err) { console.error(err); }
            }
        });

        window.addEventListener("keyup", (e) => {
            const key = normalizeKey(e.key);
            activeKeys.delete(key);
            for (let i = 0; i < keyReleaseCallbacks.length; i++) {
                try { keyReleaseCallbacks[i](key); } catch (err) { console.error(err); }
            }
        });

        window.addEventListener("blur", () => {
            activeKeys.clear();
            pressedKeys.clear();
        });
    }

    // 2D Vector
    function vec2(x, y) {
        if (typeof x === "object" && x !== null) {
            return {
                x: Number(x.x) || 0,
                y: Number(x.y) || 0,
                clone() { return vec2(this.x, this.y); }
            };
        }
        const vx = Number(x) || 0;
        const vy = (y !== undefined) ? (Number(y) || 0) : vx;
        return {
            x: vx,
            y: vy,
            clone() { return vec2(this.x, this.y); },
            add(other) { return vec2(this.x + other.x, this.y + other.y); },
            sub(other) { return vec2(this.x - other.x, this.y - other.y); }
        };
    }

    // Components
    function pos(x, y) {
        return {
            pos: vec2(x, y),
            moveTo(nx, ny) {
                this.pos.x = nx;
                this.pos.y = ny;
            },
            move(vx, vy) {
                this.pos.x += vx * _dt;
                this.pos.y += vy * _dt;
            }
        };
    }

    function rect(width, height) {
        return { width: Number(width) || 0, height: Number(height) || 0 };
    }

    function area() { return {}; }
    function anchor(a) { return { anchor: a }; }
    function rotate(r) { return { angle: Number(r) || 0 }; }
    function scale(s) {
        return {
            scale: (typeof s === "object" && s !== null && "x" in s) ? s : vec2(s, s)
        };
    }
    function opacity(o) { return { opacity: Number(o) || 1 }; }
    function z(val) { return { z: Number(val) || 0 }; }

    // Entity Factory
    function add(components) {
        const entity = {
            _events: {},
            _updateHooks: [],
            onUpdate(cb) {
                this._updateHooks.push(cb);
            },
            on(event, cb) {
                if (!this._events[event]) this._events[event] = [];
                this._events[event].push(cb);
            },
            trigger(event, ...args) {
                const list = this._events[event];
                if (list) {
                    list.forEach(cb => {
                        try { cb(...args); } catch (err) { console.error(err); }
                    });
                }
            },
            destroy() {
                this._events = {};
                this._updateHooks = [];
            }
        };

        if (Array.isArray(components)) {
            components.forEach(comp => {
                if (typeof comp === "string") {
                    entity.tag = comp;
                } else if (comp && typeof comp === "object") {
                    Object.assign(entity, comp);
                }
            });
        }

        // Register entity update hook into master loop
        onUpdate(() => {
            if (entity._updateHooks.length > 0) {
                entity._updateHooks.forEach(hook => hook());
            }
        });

        return entity;
    }

    function onUpdate(cb) {
        updateCallbacks.push(cb);
    }

    function onLoad(cb) {
        if (typeof document !== "undefined" && (document.readyState === "complete" || document.readyState === "interactive")) {
            setTimeout(cb, 0);
        } else if (typeof window !== "undefined") {
            window.addEventListener("DOMContentLoaded", cb, { once: true });
        } else {
            setTimeout(cb, 0);
        }
    }

    function dt() {
        return _dt;
    }

    function setGravity(g) {
        _gravity = Number(g) || 1600;
    }

    function isKeyDown(k) {
        return activeKeys.has(normalizeKey(k));
    }

    function isKeyPressed(k) {
        return pressedKeys.has(normalizeKey(k));
    }

    function onKeyDown(cb) {
        keyDownCallbacks.push(cb);
    }

    function onKeyRelease(cb) {
        keyReleaseCallbacks.push(cb);
    }

    function onKeyPress(key, cb) {
        if (typeof key === "function") {
            keyPressCallbacks.push({ key: "*", cb: key });
        } else {
            keyPressCallbacks.push({ key: normalizeKey(key), cb });
        }
    }

    const debug = { inspect: false };
    function shake(amount) {}
    function camPos(x, y) {}

    // Easings
    const easings = {
        easeOutQuad: (t) => t * (2 - t),
        easeOutElastic: (t) => {
            const p = 0.3;
            return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
        },
        linear: (t) => t
    };

    function tween(from, to, duration, onUpdateFn, easeFn = easings.linear) {
        const startTime = (typeof performance !== "undefined") ? performance.now() : Date.now();
        const startX = from.x !== undefined ? from.x : from;
        const startY = from.y !== undefined ? from.y : from;
        const targetX = to.x !== undefined ? to.x : to;
        const targetY = to.y !== undefined ? to.y : to;
        const durMs = Math.max(duration * 1000, 16);

        function step() {
            const now = (typeof performance !== "undefined") ? performance.now() : Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / durMs, 1);
            const easeVal = easeFn(progress);

            if (from.x !== undefined) {
                const cur = vec2(startX + (targetX - startX) * easeVal, startY + (targetY - startY) * easeVal);
                onUpdateFn(cur);
            } else {
                onUpdateFn(startX + (targetX - startX) * easeVal);
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    function destroy(obj) {
        if (obj && typeof obj.destroy === "function") {
            obj.destroy();
        }
    }

    // Main animation loop
    let loopStarted = false;
    function startLoop() {
        if (loopStarted) return;
        loopStarted = true;

        function tick(now) {
            _dt = Math.min((now - _lastTime) / 1000, 0.05);
            _lastTime = now;

            for (let i = 0; i < updateCallbacks.length; i++) {
                try {
                    updateCallbacks[i]();
                } catch (err) {
                    console.error("[MicroRunner] onUpdate callback error:", err);
                }
            }

            pressedKeys.clear();
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    // Kaboom Entrypoint
    function kaboom(options = {}) {
        startLoop();

        const api = {
            vec2,
            pos,
            rect,
            area,
            anchor,
            rotate,
            scale,
            opacity,
            z,
            add,
            onUpdate,
            onLoad,
            dt,
            setGravity,
            isKeyDown,
            isKeyPressed,
            onKeyDown,
            onKeyRelease,
            onKeyPress,
            debug,
            shake,
            camPos,
            tween,
            easings,
            destroy
        };

        if (options.global !== false) {
            Object.assign(global, api);
        }

        return api;
    }

    global.kaboom = kaboom;
    global.vec2 = vec2;
    global.pos = pos;
    global.rect = rect;
    global.area = area;
    global.anchor = anchor;
    global.rotate = rotate;
    global.scale = scale;
    global.opacity = opacity;
    global.z = z;
    global.add = add;
    global.onUpdate = onUpdate;
    global.onLoad = onLoad;
    global.dt = dt;
    global.setGravity = setGravity;
    global.isKeyDown = isKeyDown;
    global.isKeyPressed = isKeyPressed;
    global.onKeyDown = onKeyDown;
    global.onKeyRelease = onKeyRelease;
    global.onKeyPress = onKeyPress;
    global.debug = debug;
    global.shake = shake;
    global.camPos = camPos;
    global.tween = tween;
    global.easings = easings;
    global.destroy = destroy;

})(typeof window !== "undefined" ? window : (typeof global !== "undefined" ? global : this));

// --- WEBGL NAVIER-STOKES FLUID SIMULATION — GROUND-TRACKING ENGINE ---

(function () {
    const VERTEX_SHADER_SRC = `#version 300 es
    in vec2 position;
    out vec2 vUv;
    void main() {
      vUv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
    `;

    const SPLAT_SHADER_SRC = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uSource;
    uniform vec2 uPoint;
    uniform vec3 uColor;
    uniform float uRadius;
    uniform float uAspectRatio;
    void main() {
      vec2 p = vUv - uPoint;
      p.x *= uAspectRatio;
      float splat = exp(-dot(p, p) / uRadius);
      vec3 base = texture(uSource, vUv).xyz;
      fragColor = vec4(base + uColor * splat, 1.0);
    }
    `;

    const ADVECT_SHADER_SRC = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 uTexelSize;
    uniform float uDt;
    uniform float uDissipation;
    void main() {
      vec2 vel = texture(uVelocity, vUv).xy;
      vec2 coord = vUv - uDt * uTexelSize * vel;
      coord = clamp(coord, 0.001, 0.999);
      fragColor = uDissipation * texture(uSource, coord);
    }
    `;

    const DIVERGENCE_SHADER_SRC = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform vec2 uTexelSize;
    void main() {
      vec2 vL = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).xy;
      vec2 vR = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).xy;
      vec2 vB = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).xy;
      vec2 vT = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).xy;
      float div = 0.5 * ((vR.x - vL.x) + (vT.y - vB.y));
      fragColor = vec4(div, 0.0, 0.0, 1.0);
    }
    `;

    const JACOBI_SHADER_SRC = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    uniform vec2 uTexelSize;
    void main() {
      float pL = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).r;
      float pR = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).r;
      float pB = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).r;
      float pT = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).r;
      float div = texture(uDivergence, vUv).r;
      fragColor = vec4(0.25 * (pL + pR + pB + pT - div), 0.0, 0.0, 1.0);
    }
    `;

    const SUBTRACT_SHADER_SRC = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uPressure;
    uniform vec2 uTexelSize;
    void main() {
      float pL = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).r;
      float pR = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).r;
      float pB = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).r;
      float pT = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).r;
      vec2 vel = texture(uVelocity, vUv).xy;
      vec2 grad = vec2(pR - pL, pT - pB) * 0.5;
      fragColor = vec4(vel - grad, 0.0, 1.0);
    }
    `;

    const RENDER_SHADER_SRC = `#version 300 es
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uDye;
    uniform sampler2D uVelocity;
    void main() {
      vec3 raw = texture(uDye, vUv).rgb;
      // Boost saturation for vivid Flux colors
      float lum = dot(raw, vec3(0.2126, 0.7152, 0.0722));
      vec3 saturated = mix(vec3(lum), raw, 1.5);
      vec3 glow = saturated * 1.2;
      // Deep void background
      vec3 bg = vec3(0.02, 0.02, 0.06);
      vec3 final = max(glow, bg);
      // Subtle vignette
      float vig = 1.0 - 0.25 * length(vUv - 0.5);
      fragColor = vec4(final * vig, 1.0);
    }
    `;

    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    function createProgram(gl, vsSource, fsSource) {
        const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
        if (!vs || !fs) return null;
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program linking error:", gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    class FluidSolver {
        constructor(gl, simW = 192, simH = 192) {
            this.gl = gl;
            this.simWidth = simW;
            this.simHeight = simH;

            gl.getExtension("EXT_color_buffer_float");

            this.splatProgram = createProgram(gl, VERTEX_SHADER_SRC, SPLAT_SHADER_SRC);
            this.advectProgram = createProgram(gl, VERTEX_SHADER_SRC, ADVECT_SHADER_SRC);
            this.divergenceProgram = createProgram(gl, VERTEX_SHADER_SRC, DIVERGENCE_SHADER_SRC);
            this.jacobiProgram = createProgram(gl, VERTEX_SHADER_SRC, JACOBI_SHADER_SRC);
            this.subtractProgram = createProgram(gl, VERTEX_SHADER_SRC, SUBTRACT_SHADER_SRC);
            this.renderProgram = createProgram(gl, VERTEX_SHADER_SRC, RENDER_SHADER_SRC);

            this.quadBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

            this.vao = gl.createVertexArray();
            gl.bindVertexArray(this.vao);
            const posLoc = gl.getAttribLocation(this.splatProgram, "position");
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
            gl.bindVertexArray(null);

            this.velocity = this.createDoubleBuffer(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
            this.dye = this.createDoubleBuffer(gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
            this.pressure = this.createDoubleBuffer(gl.R16F, gl.RED, gl.HALF_FLOAT);
            this.divergence = this.createBufferObject(gl.R16F, gl.RED, gl.HALF_FLOAT);
        }

        createBufferObject(internalFormat, format, type) {
            const gl = this.gl;
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, this.simWidth, this.simHeight, 0, format, type, null);

            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            return { texture, fbo };
        }

        createDoubleBuffer(internalFormat, format, type) {
            const fbo1 = this.createBufferObject(internalFormat, format, type);
            const fbo2 = this.createBufferObject(internalFormat, format, type);
            return {
                get read() { return fbo1; },
                get write() { return fbo2; },
                swap() {
                    const tmpT = fbo1.texture; fbo1.texture = fbo2.texture; fbo2.texture = tmpT;
                    const tmpF = fbo1.fbo; fbo1.fbo = fbo2.fbo; fbo2.fbo = tmpF;
                }
            };
        }

        splat(fbo, x, y, color, radius) {
            const gl = this.gl;
            gl.viewport(0, 0, this.simWidth, this.simHeight);
            gl.useProgram(this.splatProgram);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, fbo.read.texture);
            gl.uniform1i(gl.getUniformLocation(this.splatProgram, "uSource"), 0);

            gl.uniform2f(gl.getUniformLocation(this.splatProgram, "uPoint"), x, y);
            gl.uniform3f(gl.getUniformLocation(this.splatProgram, "uColor"), color[0], color[1], color[2]);
            gl.uniform1f(gl.getUniformLocation(this.splatProgram, "uRadius"), radius);
            gl.uniform1f(gl.getUniformLocation(this.splatProgram, "uAspectRatio"), 1.0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.write.fbo);
            gl.bindVertexArray(this.vao);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindVertexArray(null);
            fbo.swap();
        }

        step(dt, dissipation) {
            const gl = this.gl;
            const tx = 1.0 / this.simWidth;
            const ty = 1.0 / this.simHeight;

            gl.viewport(0, 0, this.simWidth, this.simHeight);
            gl.bindVertexArray(this.vao);

            // 1. Advect Velocity
            gl.useProgram(this.advectProgram);
            gl.uniform2f(gl.getUniformLocation(this.advectProgram, "uTexelSize"), tx, ty);
            gl.uniform1f(gl.getUniformLocation(this.advectProgram, "uDt"), dt);
            gl.uniform1f(gl.getUniformLocation(this.advectProgram, "uDissipation"), 0.97);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
            gl.uniform1i(gl.getUniformLocation(this.advectProgram, "uVelocity"), 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
            gl.uniform1i(gl.getUniformLocation(this.advectProgram, "uSource"), 1);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.write.fbo);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            this.velocity.swap();

            // 2. Advect Dye
            gl.uniform1f(gl.getUniformLocation(this.advectProgram, "uDissipation"), dissipation);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.dye.write.fbo);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            this.dye.swap();

            // 3. Compute Divergence
            gl.useProgram(this.divergenceProgram);
            gl.uniform2f(gl.getUniformLocation(this.divergenceProgram, "uTexelSize"), tx, ty);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
            gl.uniform1i(gl.getUniformLocation(this.divergenceProgram, "uVelocity"), 0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.divergence.fbo);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            // 4. Pressure (Jacobi)
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.pressure.read.fbo);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(this.jacobiProgram);
            gl.uniform2f(gl.getUniformLocation(this.jacobiProgram, "uTexelSize"), tx, ty);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.divergence.texture);
            gl.uniform1i(gl.getUniformLocation(this.jacobiProgram, "uDivergence"), 1);

            for (let i = 0; i < 16; i++) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
                gl.uniform1i(gl.getUniformLocation(this.jacobiProgram, "uPressure"), 0);

                gl.bindFramebuffer(gl.FRAMEBUFFER, this.pressure.write.fbo);
                gl.drawArrays(gl.TRIANGLES, 0, 6);
                this.pressure.swap();
            }

            // 5. Subtract gradient
            gl.useProgram(this.subtractProgram);
            gl.uniform2f(gl.getUniformLocation(this.subtractProgram, "uTexelSize"), tx, ty);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.velocity.read.texture);
            gl.uniform1i(gl.getUniformLocation(this.subtractProgram, "uVelocity"), 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.pressure.read.texture);
            gl.uniform1i(gl.getUniformLocation(this.subtractProgram, "uPressure"), 1);

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.write.fbo);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            this.velocity.swap();

            gl.bindVertexArray(null);
        }

        render(w, h) {
            const gl = this.gl;
            gl.viewport(0, 0, w, h);
            gl.useProgram(this.renderProgram);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.dye.read.texture);
            gl.uniform1i(gl.getUniformLocation(this.renderProgram, "uDye"), 0);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindVertexArray(this.vao);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindVertexArray(null);
        }
    }

    // ===================================================================
    // INTERACTION API
    // ===================================================================
    window.fluidEmitters = [];
    window.fluidVortexes = [];
    window.fluidGroundSegments = []; // [{x, w, y, h, color: [r,g,b]}]

    let solver = null;
    let canvas = null;
    let gl = null;

    window.triggerFluidSplat = function (x, y, dx, dy, colorRGB = [0.0, 0.9, 1.0], radius = 0.001) {
        if (!solver) return;
        solver.splat(solver.velocity, x, y, [dx * 10, dy * 10, 0], radius);
        solver.splat(solver.dye, x, y, colorRGB, radius);
    };

    window.addFluidEmitter = function (id, x, y, dx, dy, colorRGB = [0.0, 0.9, 1.0], force = 200, radius = 0.04) {
        window.fluidEmitters = window.fluidEmitters.filter(e => e.id !== id);
        window.fluidEmitters.push({ id, x, y, dx, dy, color: colorRGB, force, radius });
    };

    window.updateFluidEmitter = function (id, x, y, dx, dy) {
        const emitter = window.fluidEmitters.find(e => e.id === id);
        if (emitter) {
            if (x !== undefined) emitter.x = x;
            if (y !== undefined) emitter.y = y;
            if (dx !== undefined) emitter.dx = dx;
            if (dy !== undefined) emitter.dy = dy;
        }
    };

    window.clearFluidEmitters = function () { window.fluidEmitters = []; };

    window.addFluidVortex = function (id, x, y, force = 120, radius = 250) {
        window.fluidVortexes = window.fluidVortexes.filter(v => v.id !== id);
        window.fluidVortexes.push({ id, x, y, force, radius });
    };

    window.clearFluidVortexes = function () { window.fluidVortexes = []; };

    // --- GROUND REGISTRATION ---
    // Levels register their floor platforms here. Each segment:
    //   { x, w, y, h, color: [r, g, b] }  (world coordinates, color 0..1)
    window.setFluidGround = function (segments) {
        window.fluidGroundSegments = segments || [];
    };
    window.clearFluidGround = function () {
        window.fluidGroundSegments = [];
    };

    // Camera helper
    function getCam() {
        try {
            if (window.k && window.k.camPos) {
                const c = window.k.camPos();
                return { x: c.x, y: c.y };
            }
        } catch (e) {}
        return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }

    // World → UV (WebGL flipped Y)
    function w2uv(wx, wy, cam, vw, vh) {
        return {
            u: (wx - cam.x + vw / 2) / vw,
            v: 1.0 - ((wy - cam.y + vh / 2) / vh)
        };
    }

    // ===================================================================
    // MAIN LOOP
    // ===================================================================
    window.initFluid = function () {
        canvas = document.getElementById("bg-canvas");
        if (!canvas) return;

        gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false });
        if (!gl) {
            console.error("WebGL2 not supported. Fluid disabled.");
            return;
        }

        solver = new FluidSolver(gl, 192, 192);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", resize);
        resize();

        let lastTime = performance.now();

        const tick = (now) => {
            requestAnimationFrame(tick);
            if (!solver) return;

            const dt = Math.min((now - lastTime) / 1000, 0.03);
            lastTime = now;
            const t = now / 1000;
            const cam = getCam();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // ==========================================
            // 0. GROUND PATH — Fluid IS the floor
            // ==========================================
            const SPACING = 70; // px between splat sample points

            window.fluidGroundSegments.forEach((seg, si) => {
                const camL = cam.x - vw / 2;
                const camR = cam.x + vw / 2;

                // Skip fully off-screen segments
                if (seg.x + seg.w < camL - 80 || seg.x > camR + 80) return;

                // Visible range (clamped to screen + margin)
                const vL = Math.max(seg.x, camL - 60);
                const vR = Math.min(seg.x + seg.w, camR + 60);
                const n = Math.max(2, Math.ceil((vR - vL) / SPACING));

                for (let i = 0; i <= n; i++) {
                    const wx = vL + (i / n) * (vR - vL);
                    const uv = w2uv(wx, seg.y, cam, vw, vh);

                    if (uv.u < -0.08 || uv.u > 1.08) continue;

                    // Organic surface wobble
                    const wobble = Math.sin(t * 1.4 + wx * 0.008 + si) * 0.005;

                    // Flow velocity: gentle forward drift
                    const fdx = 0.3 + Math.sin(t * 0.5 + i * 0.4) * 0.12;
                    const fdy = -0.05 + Math.cos(t * 0.7 + i * 0.3) * 0.04;

                    solver.splat(solver.velocity, uv.u, uv.v + wobble, [fdx, fdy, 0], 0.008);

                    // Color — much dimmer to prevent blowout
                    const pulse = 0.25 + 0.15 * Math.sin(t * 1.6 + wx * 0.004);
                    const col = seg.color.map(c => c * pulse);
                    solver.splat(solver.dye, uv.u, uv.v + wobble, col, 0.01);
                }
            });

            // ==========================================
            // 1. SUBTLE AMBIENT VOID HAZE
            // ==========================================
            // Very dim background so void areas aren't pure black
            for (let i = 0; i < 3; i++) {
                const ax = 0.25 + i * 0.25 + Math.sin(t * 0.08 + i * 2.1) * 0.15;
                const ay = 0.3 + Math.cos(t * 0.06 + i * 1.7) * 0.2;
                solver.splat(solver.dye, ax, ay, [0.015, 0.015, 0.04], 0.035);
                solver.splat(solver.velocity, ax, ay, [Math.sin(t * 0.15 + i) * 0.08, 0.03, 0], 0.02);
            }

            // ==========================================
            // 2. GAME EMITTERS (player, traps)
            // ==========================================
            window.fluidEmitters.forEach(e => {
                const uv = w2uv(e.x, e.y, cam, vw, vh);
                solver.splat(solver.velocity, uv.u, uv.v, [e.dx * 1.5, -e.dy * 1.5, 0], 0.003);
                solver.splat(solver.dye, uv.u, uv.v, e.color, 0.003);
            });

            // ==========================================
            // 3. VORTEX TRAPS
            // ==========================================
            window.fluidVortexes.forEach(v => {
                const uv = w2uv(v.x, v.y, cam, vw, vh);
                if (uv.u < -0.15 || uv.u > 1.15) return;
                const a = t * 2;
                solver.splat(solver.velocity, uv.u, uv.v, [Math.cos(a) * 2.5, Math.sin(a) * 2.5, 0], 0.005);
                solver.splat(solver.dye, uv.u, uv.v, [0.6, 0.1, 1.0], 0.004);
            });

            // ==========================================
            // 4. STEP & RENDER
            // ==========================================
            solver.step(dt, 0.975);
            solver.render(canvas.width, canvas.height);
        };

        requestAnimationFrame(tick);
    };

    window.addEventListener("DOMContentLoaded", () => {
        window.initFluid();
    });
})();

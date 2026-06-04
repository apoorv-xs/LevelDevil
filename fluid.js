// --- WEBGL NAVIER-STOKES FLUID SIMULATION BACKGROUND ENGINE ---

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
      vec3 color = texture(uDye, vUv).rgb;
      // Add very deep cyber blue background color mapping
      vec3 bg = vec3(0.04, 0.04, 0.1);
      fragColor = vec4(max(color, bg), 1.0);
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
        constructor(gl, simW = 128, simH = 128) {
            this.gl = gl;
            this.simWidth = simW;
            this.simHeight = simH;

            // Enable extension
            gl.getExtension("EXT_color_buffer_float");

            // Compile shaders
            this.splatProgram = createProgram(gl, VERTEX_SHADER_SRC, SPLAT_SHADER_SRC);
            this.advectProgram = createProgram(gl, VERTEX_SHADER_SRC, ADVECT_SHADER_SRC);
            this.divergenceProgram = createProgram(gl, VERTEX_SHADER_SRC, DIVERGENCE_SHADER_SRC);
            this.jacobiProgram = createProgram(gl, VERTEX_SHADER_SRC, JACOBI_SHADER_SRC);
            this.subtractProgram = createProgram(gl, VERTEX_SHADER_SRC, SUBTRACT_SHADER_SRC);
            this.renderProgram = createProgram(gl, VERTEX_SHADER_SRC, RENDER_SHADER_SRC);

            // Quad buffer
            this.quadBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

            this.vao = gl.createVertexArray();
            gl.bindVertexArray(this.vao);
            const posLoc = gl.getAttribLocation(this.splatProgram, "position");
            gl.enableVertexAttribArray(posLoc);
            gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
            gl.bindVertexArray(null);

            // Create FBOs (use HALF_FLOAT for performance & compat)
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

        splat(fbo, x, y, dx, dy, color, radius) {
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
            gl.uniform1f(gl.getUniformLocation(this.advectProgram, "uDissipation"), 0.98); // vel dissipation

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
            gl.uniform1f(gl.getUniformLocation(this.advectProgram, "uDissipation"), dissipation); // dye dissipation
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

    // --- GLOBAL REFERENCES AND INTERACTION API ---
    window.fluidEmitters = []; // [{ id, x, y, dx, dy, colorRGB, force, radius }] - CPU math and GPU Splat inputs
    window.fluidVortexes = []; // [{ id, x, y, force, radius }]

    let solver = null;
    let canvas = null;
    let gl = null;

    window.triggerFluidSplat = function (x, y, dx, dy, colorRGB = [0.0, 0.9, 1.0], radius = 0.001) {
        if (!solver) return;
        // Inject velocity (dx, dy)
        solver.splat(solver.velocity, x, y, [dx * 10, dy * 10, 0], radius, 1.0);
        // Inject dye
        solver.splat(solver.dye, x, y, colorRGB, radius, 1.0);
    };

    window.addFluidEmitter = function (id, x, y, dx, dy, colorRGB = [0.0, 0.9, 1.0], force = 200, radius = 0.04) {
        // Clear duplicates
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

    window.clearFluidEmitters = function () {
        window.fluidEmitters = [];
    };

    window.addFluidVortex = function (id, x, y, force = 120, radius = 250) {
        window.fluidVortexes = window.fluidVortexes.filter(v => v.id !== id);
        window.fluidVortexes.push({ id, x, y, force, radius });
    };

    window.clearFluidVortexes = function () {
        window.fluidVortexes = [];
    };

    window.initFluid = function () {
        canvas = document.getElementById("bg-canvas");
        if (!canvas) return;

        gl = canvas.getContext("webgl2", { alpha: false, antialias: false, depth: false });
        if (!gl) {
            console.error("WebGL2 not supported on this device. Fluid visualizer disabled.");
            return;
        }

        solver = new FluidSolver(gl, 128, 128);

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

            // 1. Splat continuous emitters
            window.fluidEmitters.forEach(e => {
                // Convert coordinates from screen coordinates to WebGL UV (0..1)
                const ux = e.x / window.innerWidth;
                // WebGL y starts at bottom left
                const uy = 1.0 - (e.y / window.innerHeight);
                solver.splat(solver.velocity, ux, uy, [e.dx * 1.5, -e.dy * 1.5, 0], 0.0015, 1.0);
                solver.splat(solver.dye, ux, uy, e.color, 0.001, 1.0);
            });

            // 2. Vortex Splats
            window.fluidVortexes.forEach(v => {
                const ux = v.x / window.innerWidth;
                const uy = 1.0 - (v.y / window.innerHeight);
                // Rotate force perpendicular to vector from center to create swirl
                const angle = (now / 1000) * 2;
                const vx = Math.cos(angle);
                const vy = Math.sin(angle);
                solver.splat(solver.velocity, ux, uy, [vx * 2, vy * 2, 0], 0.003, 1.0);
                solver.splat(solver.dye, ux, uy, [0.6, 0.1, 1.0], 0.0015, 1.0);
            });

            // 3. Sim step
            solver.step(dt, 0.95); // High dissipation to clear trails cleanly

            // 4. Render
            solver.render(canvas.width, canvas.height);
        };
        requestAnimationFrame(tick);
    };

    // Auto-launch
    window.addEventListener("DOMContentLoaded", () => {
        window.initFluid();
    });
})();

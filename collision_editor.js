/**
 * Level Devil In-Browser Visual Ground & Collision Editor HUD
 * Allows visual, Photoshop-like interactive dragging, drawing, and tuning of 1D landing rails.
 */
(function() {
    let isEditorOpen = false;
    let selectedRailIndex = -1;
    let isDrawingNew = false;
    let drawStartX = 0;
    let drawStartY = 0;
    let dragMode = null; // 'move', 'resize-left', 'resize-right'
    let dragStartX = 0;
    let dragStartY = 0;
    let initialRailState = null;

    let overlayContainer = null;
    let svgCanvas = null;
    let hudDock = null;

    function getRails() {
        return window.landingRails || [];
    }

    function setRails(newRails) {
        window.landingRails = newRails;
        saveToLocal();
        renderOverlay();
    }

    function saveToLocal() {
        try {
            const clean = (window.landingRails || []).map(r => ({
                xLeft: Math.round(r.xLeft),
                xRight: Math.round(r.xRight),
                width: Math.round(r.xRight - r.xLeft),
                y: Math.round(r.y),
                trap: r.trap || "normal",
                name: r.name || (r.domElement ? (r.domElement.tagName + (r.domElement.className ? '.' + r.domElement.className.split(' ')[0] : '')) : "custom_rail")
            }));
            localStorage.setItem("apoorv_custom_rails", JSON.stringify(clean));
            console.log("💾 Saved custom rails to localStorage:", clean.length);
        } catch(e) {
            console.warn("Could not save to localStorage", e);
        }
    }

    function initEditor() {
        // Toggle Button in bottom-right corner
        const toggleBtn = document.createElement("button");
        toggleBtn.id = "collision-editor-toggle-btn";
        toggleBtn.innerHTML = "🛠 MAP (E)";
        toggleBtn.title = "Toggle Visual Ground/Collision Mapper [Hotkey: E]";
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99998;
            background: #17120f;
            color: #fce566;
            border: 2px solid #fce566;
            box-shadow: 3px 3px 0 #fce566;
            padding: 8px 14px;
            font-family: 'Press Start 2P', monospace;
            font-size: 10px;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        `;
        toggleBtn.addEventListener("click", toggleEditor);
        document.body.appendChild(toggleBtn);

        // Global hotkey: 'E'
        window.addEventListener("keydown", (e) => {
            // Ignore when typing inside input or textarea
            if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
            if (e.key === "e" || e.key === "E") {
                toggleEditor();
            } else if (isEditorOpen) {
                handleEditorKeydown(e);
            }
        });
    }

    function toggleEditor() {
        isEditorOpen = !isEditorOpen;
        if (isEditorOpen) {
            openEditor();
        } else {
            closeEditor();
        }
    }

    function openEditor() {
        if (window.setPhysicsActive) window.setPhysicsActive(false);
        const toggleBtn = document.getElementById("collision-editor-toggle-btn");
        if (toggleBtn) {
            toggleBtn.style.background = "#fce566";
            toggleBtn.style.color = "#17120f";
            toggleBtn.innerHTML = "✕ CLOSE (E)";
        }

        createOverlay();
        createHud();
        renderOverlay();
        console.log("🛠 Visual Collision Mapper OPENED. Rails:", getRails().length);
    }

    function closeEditor() {
        if (overlayContainer) overlayContainer.remove();
        if (hudDock) hudDock.remove();
        overlayContainer = null;
        hudDock = null;
        selectedRailIndex = -1;

        const toggleBtn = document.getElementById("collision-editor-toggle-btn");
        if (toggleBtn) {
            toggleBtn.style.background = "#17120f";
            toggleBtn.style.color = "#fce566";
            toggleBtn.innerHTML = "🛠 MAP (E)";
        }

        if (window.setPhysicsActive) window.setPhysicsActive(true);
        console.log("🛠 Visual Collision Mapper CLOSED.");
    }

    function createOverlay() {
        if (overlayContainer) overlayContainer.remove();

        const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const docWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);

        overlayContainer = document.createElement("div");
        overlayContainer.id = "collision-editor-overlay";
        overlayContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: ${docWidth}px;
            height: ${docHeight}px;
            z-index: 99999;
            pointer-events: auto;
            cursor: crosshair;
            background: rgba(23, 18, 15, 0.25);
            backdrop-filter: blur(1px);
        `;

        svgCanvas = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;
        overlayContainer.appendChild(svgCanvas);
        document.body.appendChild(overlayContainer);

        // Drawing / mouse event handlers
        overlayContainer.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    function createHud() {
        if (hudDock) hudDock.remove();

        hudDock = document.createElement("div");
        hudDock.id = "collision-editor-hud";
        hudDock.style.cssText = `
            position: fixed;
            top: 65px;
            right: 20px;
            z-index: 100000;
            width: 320px;
            background: #ffffff;
            border: 3px solid #17120f;
            box-shadow: 6px 6px 0 #17120f;
            padding: 14px;
            font-family: 'Courier Prime', monospace;
            font-size: 12px;
            color: #17120f;
            user-select: none;
        `;

        updateHudContent();
        document.body.appendChild(hudDock);
    }

    function updateHudContent() {
        if (!hudDock) return;
        const rails = getRails();
        const selRail = selectedRailIndex >= 0 ? rails[selectedRailIndex] : null;
        const rawT = selRail ? selRail.trap : "";
        const cleanT = (rawT && rawT !== "false" && rawT !== "none") ? rawT : "normal";

        const trapColors = {
            normal: "#00e676",
            bounce: "#fce566",
            drop: "#ff9100",
            spikes: "#ff1744",
            door: "#a855f7"
        };

        hudDock.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #17120f; padding-bottom:8px; margin-bottom:10px;">
                <span style="font-family:'Press Start 2P', monospace; font-size:9px; color:#17120f;">
                    GROUND MAPPER
                </span>
                <span style="font-family:'Press Start 2P', monospace; font-size:8px; background:#17120f; color:#fce566; padding:3px 6px;">
                    ${rails.length} RAILS
                </span>
            </div>

            <div style="margin-bottom:10px; font-size:11px; line-height:1.4; color:#555;">
                • <strong>Click & Drag</strong> on empty space to draw a ground rail.<br/>
                • <strong>Drag line</strong> to reposition; <strong>drag handles</strong> to resize.<br/>
                • <strong>Del</strong> to remove rail. <strong>Arrows</strong> to nudge (Shift=10px).
            </div>

            <div style="background:#f7f5f0; border:2px solid #17120f; padding:8px 10px; margin-bottom:12px;">
                <div style="font-family:'Press Start 2P', monospace; font-size:8px; margin-bottom:6px;">SELECTED RAIL:</div>
                ${selRail ? `
                    <div style="font-size:11px;">
                        <strong>Y:</strong> ${Math.round(selRail.y)}px | <strong>W:</strong> ${Math.round(selRail.xRight - selRail.xLeft)}px<br/>
                        <strong>X:</strong> [${Math.round(selRail.xLeft)} → ${Math.round(selRail.xRight)}]<br/>
                        <strong>Type:</strong> <span style="font-weight:bold; color:${trapColors[cleanT]}; background:#17120f; padding:1px 4px;">${cleanT.toUpperCase()}</span>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:4px; margin-top:8px;">
                        ${['normal', 'bounce', 'drop', 'spikes', 'door'].map(t => `
                            <button class="trap-btn" data-trap="${t}" style="
                                padding:4px 0; font-size:9px; font-weight:bold; cursor:pointer;
                                background:${cleanT === t ? '#17120f' : '#ffffff'};
                                color:${cleanT === t ? trapColors[t] : '#17120f'};
                                border:1px solid #17120f;
                            ">${t.slice(0, 3).toUpperCase()}</button>
                        `).join('')}
                    </div>
                ` : `
                    <div style="color:#777; font-style:italic;">No rail selected. Click any line or drag to draw.</div>
                `}
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:8px;">
                <button id="btn-add-center" style="padding:6px; background:#17120f; color:#ffffff; border:2px solid #17120f; font-weight:bold; font-size:10px; cursor:pointer;">+ ADD AT VIEW</button>
                <button id="btn-delete-rail" style="padding:6px; background:#ffffff; color:#ff1744; border:2px solid #ff1744; font-weight:bold; font-size:10px; cursor:pointer;" ${!selRail ? 'disabled' : ''}>✕ DELETE</button>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:8px;">
                <button id="btn-snap-dom" style="padding:6px; background:#ffffff; color:#17120f; border:2px solid #17120f; font-weight:bold; font-size:10px; cursor:pointer;">SNAP DOM</button>
                <button id="btn-copy-json" style="padding:6px; background:#fce566; color:#17120f; border:2px solid #17120f; font-weight:bold; font-size:10px; cursor:pointer;">COPY JSON</button>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:2px dashed #17120f; padding-top:8px;">
                <button id="btn-reset-rails" style="padding:4px 8px; background:none; border:none; color:#777; font-size:10px; cursor:pointer; text-decoration:underline;">Reset Defaults</button>
                <button id="btn-exit-editor" style="padding:6px 12px; background:#17120f; color:#ffffff; border:2px solid #17120f; font-weight:bold; font-size:10px; cursor:pointer;">EXIT (E)</button>
            </div>
        `;

        // Attach HUD event listeners
        hudDock.querySelectorAll(".trap-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                if (selectedRailIndex >= 0 && rails[selectedRailIndex]) {
                    rails[selectedRailIndex].trap = btn.getAttribute("data-trap");
                    setRails(rails);
                    updateHudContent();
                }
            });
        });

        const btnAddCenter = hudDock.querySelector("#btn-add-center");
        if (btnAddCenter) {
            btnAddCenter.addEventListener("click", () => {
                const scrollY = window.scrollY || window.pageYOffset || 0;
                const viewCenterX = window.innerWidth / 2;
                const viewCenterY = scrollY + window.innerHeight / 2;
                const newRail = {
                    xLeft: Math.round(viewCenterX - 150),
                    xRight: Math.round(viewCenterX + 150),
                    width: 300,
                    y: Math.round(viewCenterY),
                    trap: "normal",
                    name: "manual_rail"
                };
                rails.push(newRail);
                selectedRailIndex = rails.length - 1;
                setRails(rails);
                updateHudContent();
            });
        }

        const btnDelete = hudDock.querySelector("#btn-delete-rail");
        if (btnDelete) {
            btnDelete.addEventListener("click", () => {
                if (selectedRailIndex >= 0 && rails[selectedRailIndex]) {
                    rails.splice(selectedRailIndex, 1);
                    selectedRailIndex = -1;
                    setRails(rails);
                    updateHudContent();
                }
            });
        }

        const btnSnapDOM = hudDock.querySelector("#btn-snap-dom");
        if (btnSnapDOM) {
            btnSnapDOM.addEventListener("click", () => {
                if (window.syncDOM) window.syncDOM();
                selectedRailIndex = -1;
                renderOverlay();
                updateHudContent();
                saveToLocal();
            });
        }

        const btnCopyJSON = hudDock.querySelector("#btn-copy-json");
        if (btnCopyJSON) {
            btnCopyJSON.addEventListener("click", () => {
                const clean = rails.map(r => ({
                    xLeft: Math.round(r.xLeft),
                    xRight: Math.round(r.xRight),
                    width: Math.round(r.xRight - r.xLeft),
                    y: Math.round(r.y),
                    trap: r.trap || "normal",
                    name: r.name || "rail"
                }));
                const str = JSON.stringify(clean, null, 2);
                navigator.clipboard.writeText(str).then(() => {
                    btnCopyJSON.innerHTML = "✓ COPIED!";
                    setTimeout(() => { if (btnCopyJSON) btnCopyJSON.innerHTML = "COPY JSON"; }, 1500);
                });
            });
        }

        const btnReset = hudDock.querySelector("#btn-reset-rails");
        if (btnReset) {
            btnReset.addEventListener("click", () => {
                if (confirm("Clear custom edits and re-sync from HTML DOM?")) {
                    localStorage.removeItem("apoorv_custom_rails");
                    if (window.syncDOM) window.syncDOM();
                    selectedRailIndex = -1;
                    renderOverlay();
                    updateHudContent();
                }
            });
        }

        const btnExit = hudDock.querySelector("#btn-exit-editor");
        if (btnExit) {
            btnExit.addEventListener("click", toggleEditor);
        }
    }

    function renderOverlay() {
        if (!svgCanvas) return;
        svgCanvas.innerHTML = "";

        const rails = getRails();
        const trapColors = {
            normal: "#00e676",
            bounce: "#fce566",
            drop: "#ff9100",
            spikes: "#ff1744",
            door: "#a855f7"
        };

        rails.forEach((rail, index) => {
            const isSelected = (index === selectedRailIndex);
            const color = trapColors[rail.trap || "normal"] || "#00e676";
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.setAttribute("data-rail-index", index);
            g.style.cursor = "move";

            // Collision Surface Line
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", rail.xLeft);
            line.setAttribute("y1", rail.y);
            line.setAttribute("x2", rail.xRight);
            line.setAttribute("y2", rail.y);
            line.setAttribute("stroke", isSelected ? "#ffffff" : color);
            line.setAttribute("stroke-width", isSelected ? "5" : "3");
            if (isSelected) line.setAttribute("stroke-dasharray", "6 3");
            g.appendChild(line);

            // Wide transparent hit area for easy clicking
            const hitLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            hitLine.setAttribute("x1", rail.xLeft);
            hitLine.setAttribute("y1", rail.y);
            hitLine.setAttribute("x2", rail.xRight);
            hitLine.setAttribute("y2", rail.y);
            hitLine.setAttribute("stroke", "transparent");
            hitLine.setAttribute("stroke-width", "20");
            hitLine.setAttribute("data-action", "move");
            hitLine.setAttribute("data-index", index);
            g.appendChild(hitLine);

            // Left Resize Handle
            const handleLeft = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            handleLeft.setAttribute("x", rail.xLeft - 6);
            handleLeft.setAttribute("y", rail.y - 6);
            handleLeft.setAttribute("width", "12");
            handleLeft.setAttribute("height", "12");
            handleLeft.setAttribute("fill", isSelected ? "#ffffff" : color);
            handleLeft.setAttribute("stroke", "#17120f");
            handleLeft.setAttribute("stroke-width", "2");
            handleLeft.setAttribute("data-action", "resize-left");
            handleLeft.setAttribute("data-index", index);
            handleLeft.style.cursor = "ew-resize";
            g.appendChild(handleLeft);

            // Right Resize Handle
            const handleRight = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            handleRight.setAttribute("x", rail.xRight - 6);
            handleRight.setAttribute("y", rail.y - 6);
            handleRight.setAttribute("width", "12");
            handleRight.setAttribute("height", "12");
            handleRight.setAttribute("fill", isSelected ? "#ffffff" : color);
            handleRight.setAttribute("stroke", "#17120f");
            handleRight.setAttribute("stroke-width", "2");
            handleRight.setAttribute("data-action", "resize-right");
            handleRight.setAttribute("data-index", index);
            handleRight.style.cursor = "ew-resize";
            g.appendChild(handleRight);

            // Label text above platform
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", rail.xLeft + 4);
            text.setAttribute("y", rail.y - 8);
            text.setAttribute("fill", isSelected ? "#ffffff" : color);
            text.setAttribute("font-family", "'Press Start 2P', monospace");
            text.setAttribute("font-size", "8px");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("stroke", "#17120f");
            text.setAttribute("stroke-width", "0.5");
            const nameLabel = rail.name ? `[${rail.name}] ` : "";
            const rawT = rail.trap;
            const tName = (rawT && rawT !== "false" && rawT !== "none") ? rawT.toUpperCase() : "NORMAL";
            text.textContent = `${nameLabel}${tName} W:${Math.round(rail.xRight - rail.xLeft)}`;
            g.appendChild(text);

            svgCanvas.appendChild(g);
        });
    }

    function onMouseDown(e) {
        if (e.target.closest("#collision-editor-hud") || e.target.closest("#collision-editor-toggle-btn")) return;

        const target = e.target;
        const action = target.getAttribute("data-action");
        const indexStr = target.getAttribute("data-index");

        const pageX = e.pageX;
        const pageY = e.pageY;

        if (action && indexStr !== null) {
            // Selected an existing rail or handle
            selectedRailIndex = parseInt(indexStr, 10);
            dragMode = action; // 'move', 'resize-left', 'resize-right'
            dragStartX = pageX;
            dragStartY = pageY;
            const rail = getRails()[selectedRailIndex];
            initialRailState = { ...rail };
            renderOverlay();
            updateHudContent();
        } else {
            // Clicked empty canvas -> Start drawing new rail!
            isDrawingNew = true;
            drawStartX = pageX;
            drawStartY = pageY;
            selectedRailIndex = -1;
            renderOverlay();
            updateHudContent();
        }
    }

    function onMouseMove(e) {
        if (!isEditorOpen) return;
        const pageX = e.pageX;
        const pageY = e.pageY;
        const rails = getRails();

        if (isDrawingNew) {
            // Render temporary preview line
            let previewLine = svgCanvas.querySelector("#preview-draw-line");
            if (!previewLine) {
                previewLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                previewLine.id = "preview-draw-line";
                previewLine.setAttribute("stroke", "#fce566");
                previewLine.setAttribute("stroke-width", "4");
                previewLine.setAttribute("stroke-dasharray", "4 4");
                svgCanvas.appendChild(previewLine);
            }
            const x1 = Math.min(drawStartX, pageX);
            const x2 = Math.max(drawStartX, pageX);
            // Snap to horizontal if angle is small
            const y = (Math.abs(pageY - drawStartY) < 15) ? drawStartY : pageY;
            previewLine.setAttribute("x1", x1);
            previewLine.setAttribute("y1", y);
            previewLine.setAttribute("x2", x2);
            previewLine.setAttribute("y2", y);
            return;
        }

        if (dragMode && selectedRailIndex >= 0 && rails[selectedRailIndex] && initialRailState) {
            const dx = pageX - dragStartX;
            const dy = pageY - dragStartY;
            const rail = rails[selectedRailIndex];

            if (dragMode === "move") {
                rail.xLeft = Math.round(initialRailState.xLeft + dx);
                rail.xRight = Math.round(initialRailState.xRight + dx);
                rail.y = Math.round(initialRailState.y + dy);
                rail.width = rail.xRight - rail.xLeft;
            } else if (dragMode === "resize-left") {
                rail.xLeft = Math.min(Math.round(initialRailState.xLeft + dx), rail.xRight - 20);
                rail.width = rail.xRight - rail.xLeft;
            } else if (dragMode === "resize-right") {
                rail.xRight = Math.max(Math.round(initialRailState.xRight + dx), rail.xLeft + 20);
                rail.width = rail.xRight - rail.xLeft;
            }

            renderOverlay();
            updateHudContent();
        }
    }

    function onMouseUp(e) {
        if (!isEditorOpen) return;
        const pageX = e.pageX;
        const pageY = e.pageY;
        const rails = getRails();

        if (isDrawingNew) {
            isDrawingNew = false;
            const previewLine = svgCanvas.querySelector("#preview-draw-line");
            if (previewLine) previewLine.remove();

            const xLeft = Math.min(drawStartX, pageX);
            const xRight = Math.max(drawStartX, pageX);
            const width = xRight - xLeft;

            // Only create if dragged at least 30px width
            if (width >= 30) {
                const y = (Math.abs(pageY - drawStartY) < 15) ? drawStartY : pageY;
                const newRail = {
                    xLeft: Math.round(xLeft),
                    xRight: Math.round(xRight),
                    width: Math.round(width),
                    y: Math.round(y),
                    trap: "normal",
                    name: "drawn_rail"
                };
                rails.push(newRail);
                selectedRailIndex = rails.length - 1;
                setRails(rails);
                updateHudContent();
            }
        }

        if (dragMode) {
            dragMode = null;
            initialRailState = null;
            saveToLocal();
        }
    }

    function handleEditorKeydown(e) {
        const rails = getRails();
        if (selectedRailIndex < 0 || !rails[selectedRailIndex]) return;
        const rail = rails[selectedRailIndex];
        const step = e.shiftKey ? 10 : 1;

        if (e.key === "Delete" || e.key === "Backspace") {
            rails.splice(selectedRailIndex, 1);
            selectedRailIndex = -1;
            setRails(rails);
            updateHudContent();
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            rail.y -= step;
            setRails(rails);
            updateHudContent();
            e.preventDefault();
        } else if (e.key === "ArrowDown") {
            rail.y += step;
            setRails(rails);
            updateHudContent();
            e.preventDefault();
        } else if (e.key === "ArrowLeft") {
            rail.xLeft -= step;
            rail.xRight -= step;
            setRails(rails);
            updateHudContent();
            e.preventDefault();
        } else if (e.key === "ArrowRight") {
            rail.xLeft += step;
            rail.xRight += step;
            setRails(rails);
            updateHudContent();
            e.preventDefault();
        }
    }

    // Auto-init on page load
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initEditor);
    } else {
        initEditor();
    }

    window.CollisionEditor = {
        toggle: toggleEditor,
        open: openEditor,
        close: closeEditor,
        getRails,
        setRails
    };
})();

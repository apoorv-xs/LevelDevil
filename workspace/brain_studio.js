// SprintDial — System 1 Brain Studio Dynamic Knowledge Controller
// Strictly On Apoorv's Behalf

(function(root) {
  let brainTelemetryInterval = null;

  function handleBrainCategoryChange() {
    const cat = document.getElementById('trainCategory')?.value;
    const altGroup = document.getElementById('trainAltitudeGroup');
    const idInput = document.getElementById('trainNodeId');
    const thoughtInput = document.getElementById('trainThoughtText');

    if (cat === 'custom_trigger') {
      if (altGroup) altGroup.classList.remove('hidden');
      if (idInput) idInput.placeholder = 'e.g. trigger_deep_runway_alert';
      if (thoughtInput) thoughtInput.placeholder = 'e.g. ⚡ TOUCHDOWN DETECTED // TERRA FIRMA LOCKED';
    } else if (cat === 'project') {
      if (altGroup) altGroup.classList.add('hidden');
      if (idInput) idInput.placeholder = 'e.g. cyber_punk_showcase';
      if (thoughtInput) thoughtInput.placeholder = 'e.g. ⚡ ANALYZING PROCEDURAL SHADER GRAPH...';
    } else if (cat === 'scope') {
      if (altGroup) altGroup.classList.add('hidden');
      if (idInput) idInput.placeholder = 'e.g. 3D E-Commerce Headless / WebGPU Pipeline';
      if (thoughtInput) thoughtInput.placeholder = 'e.g. Calibrating real-time 60 FPS WebGL asset pipeline.';
    } else if (cat === 'tier') {
      if (altGroup) altGroup.classList.add('hidden');
      if (idInput) idInput.placeholder = 'e.g. Tier 2: ₹1,50,000 Custom WebGL';
      if (thoughtInput) thoughtInput.placeholder = 'e.g. Recommended tier for interactive high-converting 3D experiences.';
    } else if (cat === 'defect') {
      if (altGroup) altGroup.classList.add('hidden');
      if (idInput) idInput.placeholder = 'e.g. LCP > 4.5s Bottleneck';
      if (thoughtInput) thoughtInput.placeholder = 'e.g. Critical DOM weight detected. Full headless refactor suggested.';
    }
  }

  function startBrainTelemetryPolling() {
    stopBrainTelemetryPolling();
    updateBrainTelemetryView();
    brainTelemetryInterval = setInterval(updateBrainTelemetryView, 500);
  }

  function stopBrainTelemetryPolling() {
    if (brainTelemetryInterval) {
      clearInterval(brainTelemetryInterval);
      brainTelemetryInterval = null;
    }
  }

  function updateBrainTelemetryView() {
    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (!brain) return;

    const intentEl = document.getElementById('telemetryIntentVal');
    const thoughtEl = document.getElementById('telemetryThoughtVal');
    const nodesEl = document.getElementById('telemetryTotalNodesVal');
    const cloudEl = document.getElementById('telemetryCloudStatusVal');

    if (intentEl) {
      intentEl.innerText = brain.lastThought ? "ACTIVE_TELEMETRY" : "IDLE_PERCH";
    }
    if (thoughtEl) {
      const txt = brain.lastThought || "Autonomous sensory sweep active.";
      thoughtEl.innerText = txt;
      thoughtEl.title = txt;
    }
    if (nodesEl && brain.getAllKnowledge) {
      const list = brain.getAllKnowledge();
      nodesEl.innerText = `${list.length} Active`;
    }
    if (cloudEl) {
      const hasFirestore = Boolean(window.SALES_PLATFORM_AUTH?.getFirestore);
      cloudEl.innerText = hasFirestore ? "Firestore Active" : "Local Sync Ready";
    }
  }

  function renderBrainStudio() {
    updateBrainTelemetryView();
    startBrainTelemetryPolling();
    renderBrainKnowledgeExplorer();
  }

  function renderBrainKnowledgeExplorer() {
    const listContainer = document.getElementById('brainKnowledgeList');
    const countBadge = document.getElementById('brainExplorerCountBadge');
    if (!listContainer) return;

    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (!brain || !brain.getAllKnowledge) {
      listContainer.innerHTML = '<div class="text-xs font-mono text-neutral-500 italic p-3">System 1 Brain module loading...</div>';
      return;
    }

    const allNodes = brain.getAllKnowledge();
    const filterCat = document.getElementById('brainCategoryFilter')?.value || 'all';
    const query = (document.getElementById('brainSearchInput')?.value || '').toLowerCase().trim();

    const filtered = allNodes.filter(node => {
      if (filterCat === 'trained' && node.source !== 'trained') return false;
      if (filterCat !== 'all' && filterCat !== 'trained' && node.category !== filterCat) return false;

      if (!query) return true;
      const matchStr = [
        node.id,
        node.name,
        node.category,
        node.thought,
        node.source,
        ...(node.keywords || []),
        ...(node.tags || [])
      ].filter(Boolean).join(' ').toLowerCase();

      return matchStr.includes(query);
    });

    if (countBadge) {
      countBadge.innerText = `${filtered.length} / ${allNodes.length} Nodes`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="bg-[#15161B] border border-white/5 rounded-xl p-6 text-center text-xs font-mono text-neutral-500">
          No neural knowledge nodes matching "${query || filterCat}".
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(node => {
      const isCustom = node.source === 'trained';
      const sourceBadge = isCustom
        ? `<span class="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-700/50 font-bold uppercase tracking-wider">🟣 Custom Trained</span>`
        : `<span class="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 font-bold uppercase tracking-wider">🟢 Factory Standard</span>`;

      const catBadge = `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-300 border border-white/10 uppercase">${node.category}</span>`;
      const actionBadge = node.action && node.action !== 'none'
        ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">Action: ${node.action}</span>`
        : '';
      const audioBadge = node.audioCue && node.audioCue !== 'none'
        ? `<span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">Audio: ${node.audioCue}</span>`
        : '';

      const keywordsList = Array.isArray(node.keywords) && node.keywords.length > 0
        ? `<div class="text-[10px] font-mono text-neutral-400 mt-1"><span class="text-neutral-500">Keywords:</span> ${node.keywords.join(', ')}</div>`
        : '';

      const spatialRange = node.match && (node.match.yMin != null || node.match.yMax != null)
        ? `<div class="text-[10px] font-mono text-cyan-400 mt-1"><span class="text-neutral-500">Altitude Trigger:</span> Y: ${node.match.yMin ?? 0}px - ${node.match.yMax ?? '∞'}px</div>`
        : '';

      const deleteBtn = isCustom
        ? `<button onclick="handleDeleteTrainedNode('${node.id}', '${node.category}')" class="text-[10px] font-mono px-2 py-1 rounded bg-red-950/40 text-red-300 border border-red-800/40 hover:bg-red-900/60 transition cursor-pointer">Delete</button>`
        : '';

      return `
        <div class="bg-[#15161B] border border-white/5 hover:border-white/15 rounded-xl p-3 space-y-2 transition">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-mono font-bold text-white">${node.name || node.id}</span>
              ${sourceBadge}
              ${catBadge}
              ${actionBadge}
              ${audioBadge}
            </div>
            ${deleteBtn}
          </div>
          ${keywordsList}
          ${spatialRange}
          <div class="bg-[#101114] border border-white/5 rounded-lg p-2 text-xs font-mono text-amber-300/90 italic">
            "${node.thought || 'Autonomous state trigger.'}"
          </div>
        </div>
      `;
    }).join('');
  }

  function handleTrainBrainSubmit(event) {
    if (event && event.preventDefault) event.preventDefault();
    if (typeof playSound === 'function') playSound('click');
    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (!brain || !brain.trainNode) {
      alert("System 1 Brain is not initialized.");
      return;
    }

    const id = document.getElementById('trainNodeId')?.value.trim();
    const category = document.getElementById('trainCategory')?.value;
    const page = document.getElementById('trainPage')?.value || '*';
    const rawKeywords = document.getElementById('trainMatchKeywords')?.value || '';
    const keywords = rawKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const thought = document.getElementById('trainThoughtText')?.value.trim();
    const action = document.getElementById('trainAction')?.value || 'none';
    const audioCue = document.getElementById('trainAudioCue')?.value || 'none';
    const rawJump = document.getElementById('trainJumpForce')?.value;
    const jumpForce = rawJump ? parseFloat(rawJump) : 480;

    if (!id || !thought) {
      alert("Please provide both a Node Identifier and Thought Speech Balloon text.");
      return;
    }

    let nodePayload = {
      id,
      name: id.toUpperCase(),
      category,
      page,
      thought,
      action,
      audioCue,
      jumpForce,
      keywords
    };

    if (category === 'custom_trigger') {
      const rawYMin = document.getElementById('trainYMin')?.value;
      const rawYMax = document.getElementById('trainYMax')?.value;
      nodePayload.match = {
        keywords,
        yMin: rawYMin ? parseFloat(rawYMin) : null,
        yMax: rawYMax ? parseFloat(rawYMax) : null
      };
    }

    brain.trainNode(nodePayload, true);
    if (typeof showNotification === 'function') {
      showNotification(`⚡ Neural Node [${id}] trained and hot-reloaded!`);
    }
    if (typeof playSound === 'function') playSound('celebrate');

    renderBrainStudio();

    const idEl = document.getElementById('trainNodeId');
    const thoughtEl = document.getElementById('trainThoughtText');
    const kwEl = document.getElementById('trainMatchKeywords');
    if (idEl) idEl.value = '';
    if (thoughtEl) thoughtEl.value = '';
    if (kwEl) kwEl.value = '';
  }

  function handleDeleteTrainedNode(id, category) {
    if (typeof playSound === 'function') playSound('click');
    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (!brain || !brain.deleteTrainedNode) return;

    const deleted = brain.deleteTrainedNode(id, category);
    if (deleted) {
      if (typeof showNotification === 'function') {
        showNotification(`🗑️ Custom trained node [${id}] removed.`);
      }
      renderBrainStudio();
    }
  }

  function exportBrainDatasetUI() {
    if (typeof playSound === 'function') playSound('click');
    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (!brain || !brain.exportJSON) return;

    const jsonStr = brain.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system1_brain_knowledge_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (typeof showNotification === 'function') {
      showNotification('💾 System 1 Brain checkpoint exported as JSON!');
    }
  }

  function importBrainDatasetUI(event) {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const brain = typeof window !== 'undefined' ? window.System1Brain : null;
        if (!brain || !brain.importJSON) return;

        brain.importJSON(content);
        if (typeof showNotification === 'function') {
          showNotification('📂 Brain checkpoint restored successfully!');
        }
        if (typeof playSound === 'function') playSound('celebrate');
        renderBrainStudio();
      } catch (err) {
        alert(`Checkpoint Import Error: ${err.message}`);
      }
    };
    reader.readAsText(file);
  }

  function resetBrainToFactoryUI() {
    if (typeof playSound === 'function') playSound('click');
    const confirmed = confirm("Are you sure you want to reset all custom trained neural weights to factory defaults? This will erase all custom trained nodes.");
    if (!confirmed) return;

    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (brain && brain.resetToFactory) {
      brain.resetToFactory();
      if (typeof showNotification === 'function') {
        showNotification('⚠️ System 1 Brain reset to factory neural weights.');
      }
      renderBrainStudio();
    }
  }

  async function pushBrainToFirestoreUI() {
    if (typeof playSound === 'function') playSound('click');
    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (!brain || !brain.pushToFirestore) return;

    try {
      if (window.SALES_PLATFORM_AUTH?.getFirestore) {
        if (typeof showNotification === 'function') showNotification('☁️ Syncing knowledge nodes to Cloud Firestore...');
        const db = await window.SALES_PLATFORM_AUTH.getFirestore();
        await brain.pushToFirestore(db);
        if (typeof showNotification === 'function') showNotification('✅ All knowledge nodes saved to Cloud Firestore!');
        if (typeof playSound === 'function') playSound('celebrate');
        updateBrainTelemetryView();
      } else {
        if (typeof showNotification === 'function') showNotification('Cloud Firestore auth adapter not initialized.', 'error');
      }
    } catch (err) {
      console.error("Firestore push error:", err);
      if (typeof showNotification === 'function') showNotification(`Firestore push failed: ${err.message}`, 'error');
    }
  }

  async function syncBrainFromFirestoreUI() {
    if (typeof playSound === 'function') playSound('click');
    const brain = typeof window !== 'undefined' ? window.System1Brain : null;
    if (!brain || !brain.syncWithFirestore) return;

    try {
      if (window.SALES_PLATFORM_AUTH?.getFirestore) {
        if (typeof showNotification === 'function') showNotification('🔄 Pulling knowledge nodes from Cloud Firestore...');
        const db = await window.SALES_PLATFORM_AUTH.getFirestore();
        await brain.syncWithFirestore(db);
        if (typeof showNotification === 'function') showNotification('✅ Knowledge graph synchronized from Cloud Firestore!');
        if (typeof playSound === 'function') playSound('celebrate');
        renderBrainStudio();
      } else {
        if (typeof showNotification === 'function') showNotification('Cloud Firestore auth adapter not initialized.', 'error');
      }
    } catch (err) {
      console.error("Firestore sync error:", err);
      if (typeof showNotification === 'function') showNotification(`Firestore sync failed: ${err.message}`, 'error');
    }
  }

  const BrainStudio = {
    handleBrainCategoryChange,
    startBrainTelemetryPolling,
    stopBrainTelemetryPolling,
    updateBrainTelemetryView,
    renderBrainStudio,
    renderBrainKnowledgeExplorer,
    handleTrainBrainSubmit,
    handleDeleteTrainedNode,
    exportBrainDatasetUI,
    importBrainDatasetUI,
    resetBrainToFactoryUI,
    pushBrainToFirestoreUI,
    syncBrainFromFirestoreUI
  };

  root.BrainStudio = BrainStudio;
  root.handleBrainCategoryChange = handleBrainCategoryChange;
  root.startBrainTelemetryPolling = startBrainTelemetryPolling;
  root.stopBrainTelemetryPolling = stopBrainTelemetryPolling;
  root.updateBrainTelemetryView = updateBrainTelemetryView;
  root.renderBrainStudio = renderBrainStudio;
  root.renderBrainKnowledgeExplorer = renderBrainKnowledgeExplorer;
  root.handleTrainBrainSubmit = handleTrainBrainSubmit;
  root.handleDeleteTrainedNode = handleDeleteTrainedNode;
  root.exportBrainDatasetUI = exportBrainDatasetUI;
  root.importBrainDatasetUI = importBrainDatasetUI;
  root.resetBrainToFactoryUI = resetBrainToFactoryUI;
  root.pushBrainToFirestoreUI = pushBrainToFirestoreUI;
  root.syncBrainFromFirestoreUI = syncBrainFromFirestoreUI;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BrainStudio;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

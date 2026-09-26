// SprintDial — Objection Handling & Layman Metaphor Engine
// Strictly On Apoorv's Behalf

(function(root) {
  const OBJECTIONS = [
    {
      title: "Send an email / brochure",
      en: "\"I can certainly send an email, but because Apoorv customizes each audit to your specific speed bottlenecks, a 3-minute screen walkthrough with Apoorv is 10x more valuable. Can I show you just 3 key slides this Thursday?\"",
      ml: "\"തീർച്ചയായും ഇമെയിൽ അയക്കാം, എന്നാൽ നിങ്ങളുടെ വെബ്‌സൈറ്റിന്റെ പ്രത്യേക ബോട്ടിൽനെക്കുകൾ കാണിക്കാൻ അപൂർവ് തയ്യാറാക്കിയ 3 സ്ലൈഡുകൾ കാണാൻ 5 മിനിറ്റ് സമയം മാറ്റിവെക്കുന്നതായിരിക്കും കൂടുതൽ പ്രയോജനകരം. ഈ വ്യാഴാഴ്ച ഒരു 5 മിനിറ്റ് സമയം തരാമോ?\""
    },
    {
      title: "We already have an agency / web guy",
      en: "\"Most premier establishments we partner with already have an existing web vendor. Apoorv doesn’t replace your maintenance team—he acts as a specialist creative engineer to solve mobile speed, 3D interaction, and conversion drop-offs that standard agencies miss.\"",
      ml: "\"മിക്ക പ്രമുഖ ക്ലിനിക്കുകൾക്കും നിലവിൽ വെബ്‌സൈറ്റ് നോക്കാൻ ആളുണ്ടാകും. അവരെ മാറ്റാനല്ല ഞങ്ങൾ വരുന്നത്—മൊബൈൽ സ്പീഡും പുതിയ പേഷ്യന്റ് ബുക്കിംഗും വർദ്ധിപ്പിക്കാൻ സഹായിക്കുന്ന സ്പെഷ്യലിസ്റ്റ് സൊല്യൂഷനുകളാണ് അപൂർവ് നൽകുന്നത്.\""
    },
    {
      title: "Not looking to invest right now",
      en: "\"Understood. We are not asking for an immediate financial commitment today. We simply want to share the custom competitive audit Apoorv prepared for your local area so you have the data handy when you are ready to expand.\"",
      ml: "\"മനസ്സിലായി. ഇപ്പോൾ തന്നെ ഒരു ഇൻവെസ്റ്റ്‌മെന്റ് നടത്തണമെന്ന് ഞങ്ങൾ പറയുന്നില്ല. നിങ്ങളുടെ ഏരിയയിലെ കോമ്പറ്റീഷൻ അനാലിസിസ് കാണിക്കാൻ മാത്രമാണ് ഈ കോൾ. അത് ഭാവിയിലേക്ക് തീർച്ചയായും ഉപകരിക്കും.\""
    },
    {
      title: "We already get patients from Practo/Zomato",
      en: "\"Practo and Zomato are great for baseline discovery, but you are paying 15% to 25% commission on clients who were already searching for your specific name. Worse, they display your direct competitors directly below your listing. Apoorv builds direct WhatsApp intake portals so repeat patients book without paying middleman fees.\"",
      ml: "\"തീർച്ചയായും, പ്രാക്ടോയും സൊമാറ്റോയും വഴി രോഗികൾ വരുന്നുണ്ടാകും. എന്നാൽ നിങ്ങളുടെ പേര് തിരഞ്ഞു വരുന്നവരിൽ നിന്നുപോലും 15-25% കമ്മീഷൻ അവർ എടുക്കുന്നുണ്ട്. കൂടാതെ നിങ്ങളുടെ പ്രൊഫൈലിന് താഴെ മറ്റ് എതിരാളികളുടെ ലിങ്കുകളും കാണിക്കുന്നു. ഒരു ഇടനിലക്കാരനുമില്ലാതെ വെബ്‌സൈറ്റിലൂടെയും വാട്സാപ്പിലൂടെയും നേരിട്ട് പേഷ്യന്റ്സ് ബുക്ക് ചെയ്യാനുള്ള സിസ്റ്റമാണ് അപൂർവ് ഉണ്ടാക്കുന്നത്.\""
    },
    {
      title: "My nephew/friend built our site",
      en: "\"That is very common and great for getting started. But modern standards in 2026—specifically Google's mobile Core Web Vitals and India's new DPDP Act privacy rules—require specialized performance engineering. Apoorv refactors the backend to load in 0.8 seconds and shields your business from customer data liability without disturbing your brand identity.\"",
      ml: "\"തുടക്കത്തിൽ അങ്ങനെ ചെയ്യുന്നത് സ്വാഭാവികമാണ്. എന്നാൽ 2026-ലെ ഗൂഗിൾ മൊബൈൽ സ്പീഡ് മാനദണ്ഡങ്ങളും പുതിയ DPDP ഡാറ്റാ പ്രൊട്ടക്ഷൻ നിയമങ്ങളും പാലിക്കാൻ പ്രത്യേക ടെക്നിക്കൽ എൻജിനീയറിങ് ആവശ്യമാണ്. നിങ്ങളുടെ സൈറ്റിന്റെ ബ്രാൻഡിംഗ് മാറ്റാനല്ല, മറിച്ച് 0.8 സെക്കൻഡിൽ സൈറ്റ് ലോഡ് ചെയ്യിക്കാനും നിയമപരമായ പ്രശ്നങ്ങൾ ഒഴിവാക്കാനുമാണ് അപൂർവ് പ്രവർത്തിക്കുന്നത്.\""
    },
    {
      title: "We don't need a website, our Instagram is enough",
      en: "\"Instagram is fantastic for visuals and social proof. But when high-intent clients search on Google for emergency consultations or specialized services in your area, Instagram posts do not rank. Plus, you don't own the platform. A high-speed site converts that Instagram audience directly into confirmed WhatsApp appointments in 1 tap, instead of losing them in delayed DM replies.\"",
      ml: "\"ഇൻസ്റ്റാഗ്രാം ഫോട്ടോകൾക്കും ബ്രാൻഡിംഗിനും വളരെ നല്ലതാണ്. എന്നാൽ അത്യാവശ്യ ഘട്ടങ്ങളിൽ ഗൂഗിളിൽ സേവനങ്ങൾ തിരയുന്ന ഹൈ-ഇന്റന്റ് ആളുകൾക്ക് ഇൻസ്റ്റാഗ്രാം കാണാൻ കഴിയില്ല. കൂടാതെ ഇൻസ്റ്റാഗ്രാമിലെ ഡിഎം റിപ്ലൈ വൈകുമ്പോൾ ആളുകൾ അടുത്തതിലേക്ക് പോകും. ഇൻസ്റ്റാ ട്രാഫിക്കിനെ 1-ടാപ്പിൽ നേരിട്ട് വാട്സാപ്പ് കൺസൾട്ടേഷനാക്കി മാറ്റാൻ സ്വന്തമായി ഒരു സൂപ്പർഫാസ്റ്റ് സൈറ്റ് കൂടിയേ തീരൂ.\""
    }
  ];

  const LAYMAN_ANALOGIES = {
    lcp: {
      title: "LCP (Largest Contentful Paint / Mobile Loading Speed)",
      icon: "⚡",
      category: "Mobile Speed & Drop-off Bottleneck",
      metaphor: "Like a clinic entrance with a jammed, rusty door latch that takes 4+ seconds to open. Patients get impatient waiting outside and simply walk to the clinic next door.",
      metaphorMl: "ക്ലിനിക്കിന്റെ മുൻവാതിൽ തുറക്കാൻ 4 സെക്കൻഡ് കുടുങ്ങി കിടക്കുന്നത് പോലെയാണ്. ആളുകൾ ക്ഷമകെട്ട് അടുത്ത ക്ലിനിക്കിലേക്ക് പോകും.",
      talkingPoint: "Doctor, your mobile page takes over 4 seconds to load. In the digital world, that's like keeping your clinic front door jammed shut—prospective patients tap back to Google and book your competitors.",
      talkingPointMl: "ഡോക്ടർ, നിങ്ങളുടെ മൊബൈൽ വെബ്‌സൈറ്റ് ലോഡ് ചെയ്യാൻ 4 സെക്കൻഡിൽ കൂടുതൽ എടുക്കുന്നുണ്ട്. ഇത് ക്ലിനിക്കിന്റെ വാതിൽ കുടുങ്ങിക്കിടക്കുന്നത് പോലെയാണ്—രോഗികൾ ക്ഷമയില്ലാതെ പ്രാക്ടോയിലേക്കോ മറ്റ് ക്ലിനിക്കുകളിലേക്കോ പോകാൻ ഇത് കാരണമാകുന്നു."
    },
    dom: {
      title: "DOM Nodes (Bloated WordPress / Elementor Plugin Drag)",
      icon: "📦",
      category: "Code Clutter & Memory Weight",
      metaphor: "Like cramming 3,000 extra plastic chairs, filing cabinets, and boxes into a small consultation room. The doctor has to push through clutter just to greet one patient, slowing everything down.",
      metaphorMl: "ഒരു ചെറിയ റിസപ്ഷൻ റൂമിൽ 3000 പ്ലാസ്റ്റിക് കസേരകൾ കുത്തിനിറച്ചതുപോലെ. ഒരാൾക്ക് നടക്കാൻ പോലും സ്ഥലമില്ലാതെ എല്ലാം സ്ലോ ആകുന്നു.",
      talkingPoint: "WordPress and page builders inject thousands of unseen lines of code. It creates digital friction that makes smartphones overheat and freeze up before your booking form even appears.",
      talkingPointMl: "പഴയ വേർഡ്പ്രസ്സ് പ്ലഗിനുകൾ ആയിരക്കണക്കിന് ആവശ്യമില്ലാത്ത കോഡുകളാണ് ഉണ്ടാക്കുന്നത്. ഇത് രോഗികളുടെ ഫോൺ ഹാങ് ആക്കാനും ബുക്കിംഗ് മുടങ്ങാനും ഇടയാക്കുന്നു."
    },
    dpdp: {
      title: "DPDP Act 2023 (Digital Personal Data Protection Law)",
      icon: "⚖️",
      category: "Indian Legal & Regulatory Risk",
      metaphor: "Like leaving patient medical files and phone numbers in an open binder on the front reception counter where anyone can copy them. India's new law requires explicit consent checkboxes and encrypted storage.",
      metaphorMl: "രോഗികളുടെ ഫോൺ നമ്പറുകളും വിവരങ്ങളും റിസപ്ഷൻ കൗണ്ടറിൽ തുറന്നുവെച്ചിരിക്കുന്നത് പോലെയാണ്. പുതിയ ഡാറ്റാ പ്രൊട്ടക്ഷൻ നിയമപ്രകാരം വലിയ ഫൈൻ വരാം.",
      talkingPoint: "India's DPDP Act mandates that collecting personal patient data requires explicit consent checkboxes and encrypted storage. Non-compliance exposes clinics to heavy statutory penalties.",
      talkingPointMl: "ഇന്ത്യയിലെ പുതിയ DPDP ഡാറ്റാ നിയമപ്രകാരം രോഗികളുടെ ഫോൺ നമ്പറുകൾ വെബ്‌സൈറ്റിലൂടെ വാങ്ങുമ്പോൾ കൃത്യമായ കൺസെന്റ് ബോക്സ് ആവശ്യമാണ്. ഇല്ലെങ്കിൽ വലിയ നിയമനടപടികൾ നേരിടേണ്ടി വരും."
    },
    tls: {
      title: "TLS / SSL (Data Encryption & Browser Security Badges)",
      icon: "🔒",
      category: "Security & Patient Trust Protection",
      metaphor: "Like sending private medical prescriptions on an open postcard that any delivery courier or competitor can read, instead of a stamped, tamper-proof sealed envelope.",
      metaphorMl: "രോഗിയുടെ പ്രൈവറ്റ് വിവരങ്ങൾ ഒരു തുറന്ന പോസ്റ്റ്കാർഡിൽ എഴുതി അയക്കുന്നത് പോലെയാണ്, സീൽ ചെയ്ത കവറിൽ അയക്കുന്നതിന് പകരം.",
      talkingPoint: "Without modern TLS certificates, Google Chrome flags your site with 'Not Secure' warnings, immediately eroding patient trust before they even read your credentials.",
      talkingPointMl: "ശരിയായ സെക്യൂരിറ്റി സർട്ടിഫിക്കറ്റ് ഇല്ലെങ്കിൽ ഗൂഗിൾ ക്രോം വെബ്സൈറ്റിൽ 'Not Secure' എന്ന റെഡ് വാണിംഗ് കാണിക്കും. ഇത് രോഗികളിൽ വലിയ ഭയം ഉണ്ടാക്കും."
    },
    ssl: {
      title: "TLS / SSL (Data Encryption & Browser Security Badges)",
      icon: "🔒",
      category: "Security & Patient Trust Protection",
      metaphor: "Like sending private medical prescriptions on an open postcard that any delivery courier or competitor can read, instead of a stamped, tamper-proof sealed envelope.",
      metaphorMl: "രോഗിയുടെ പ്രൈവറ്റ് വിവരങ്ങൾ ഒരു തുറന്ന പോസ്റ്റ്കാർഡിൽ എഴുതി അയക്കുന്നത് പോലെയാണ്, സീൽ ചെയ്ത കവറിൽ അയക്കുന്നതിന് പകരം.",
      talkingPoint: "Without modern TLS certificates, Google Chrome flags your site with 'Not Secure' warnings, immediately eroding patient trust before they even read your credentials.",
      talkingPointMl: "ശരിയായ സെക്യൂരിറ്റി സർട്ടിഫിക്കറ്റ് ഇല്ലെങ്കിൽ ഗൂഗിൾ ക്രോം വെബ്സൈറ്റിൽ 'Not Secure' എന്ന റെഡ് വാണിംഗ് കാണിക്കും. ഇത് രോഗികളിൽ വലിയ ഭയം ഉണ്ടാക്കും."
    },
    webgl: {
      title: "WebGL / 3D (Interactive Visual Showcase Architecture)",
      icon: "✨",
      category: "Visual Prestige & High-Ticket Authority",
      metaphor: "Instead of handing a patient a flat paper brochure, it's like putting an interactive, touchable glass miniature in their hands to spin and inspect.",
      metaphorMl: "ഒരു സാധാരണ കടലാസ് നോട്ടീസ് കൊടുക്കുന്നതിന് പകരം, പേഷ്യന്റിന്റെ കയ്യിൽ തിരിച്ചുനോക്കാവുന്ന ഒരു 3D മോഡൽ കൊടുക്കുന്നത് പോലെ.",
      talkingPoint: "Apoorv designs interactive 3D web experiences so prospective clients can dynamically interact with your procedures and treatments, justifying premium ticket pricing.",
      talkingPointMl: "ഫ്ലാറ്റ് വെബ്‌സൈറ്റുകൾക്ക് പകരം രോഗികൾക്ക് ഫോണിൽ നേരിട്ട് കണ്ട് ബോധ്യപ്പെടാൻ കഴിയുന്ന 3D ഇന്ററാക്ടീവ് വിഷ്വൽ എക്സ്പീരിയൻസുകളാണ് അപൂർവ് തയ്യാറാക്കുന്നത്."
    }
  };

  let activeAnalogyKey = null;

  function showLaymanAnalogy(key) {
    if (typeof playSound === 'function') playSound('click');
    activeAnalogyKey = key;
    const modal = document.getElementById('laymanAnalogyModal');
    const icon = document.getElementById('laymanAnalogyIcon');
    const title = document.getElementById('laymanAnalogyTitle');
    const cat = document.getElementById('laymanAnalogyCategory');
    const metaphor = document.getElementById('laymanAnalogyMetaphor');
    const talkingPoint = document.getElementById('laymanAnalogyTalkingPoint');

    const item = LAYMAN_ANALOGIES[key];
    if (!item || !modal) return;

    if (icon) icon.innerText = item.icon;
    if (title) title.innerText = item.title;
    if (cat) cat.innerText = item.category;

    const currentLang = (typeof activeLang !== 'undefined') ? activeLang : 'ml';

    if (metaphor) {
      metaphor.innerText = (currentLang === 'ml' && item.metaphorMl) ? item.metaphorMl : item.metaphor;
    }
    if (talkingPoint) {
      talkingPoint.innerText = (currentLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
    }

    modal.classList.remove('hidden');
  }

  function closeLaymanAnalogy() {
    if (typeof playSound === 'function') playSound('click');
    activeAnalogyKey = null;
    const modal = document.getElementById('laymanAnalogyModal');
    if (modal) modal.classList.add('hidden');
  }

  function appendObjectionToNotes(objectionTitle, rebuttalText) {
    const notesInput = document.getElementById('callNotesInput');
    if (!notesInput) return;
    const entry = `\n[Objection: "${objectionTitle}"] -> Rebuttal: "${rebuttalText}"`;
    notesInput.value = (notesInput.value ? notesInput.value.trim() : '') + entry;
    if (typeof saveNotesLocally === 'function') saveNotesLocally();
    if (typeof showNotification === 'function') {
      showNotification(`📝 Appended objection to call notes!`);
    }
    if (typeof playSound === 'function') playSound('click');
  }

  const ObjectionEngine = {
    OBJECTIONS,
    LAYMAN_ANALOGIES,
    showLaymanAnalogy,
    closeLaymanAnalogy,
    appendObjectionToNotes
  };

  root.OBJECTIONS = OBJECTIONS;
  root.LAYMAN_ANALOGIES = LAYMAN_ANALOGIES;
  root.showLaymanAnalogy = showLaymanAnalogy;
  root.closeLaymanAnalogy = closeLaymanAnalogy;
  root.appendObjectionToNotes = appendObjectionToNotes;
  root.ObjectionEngine = ObjectionEngine;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectionEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

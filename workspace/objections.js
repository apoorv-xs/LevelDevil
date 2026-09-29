// Client Radar — Objection Handling & Layman Metaphor Engine
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
      talkingPointMl: "ഫ്ലാറ്റ് വെബ്‌സൈറ്റുകൾക്ക് പകരം രോഗികൾക്ക് ഫോണിൽ നേരിട്ട് കണ്ട് ബോധ്യപ്പെടാൻ കഴിയുന്ന 3D ഇന്ററാക്ടീവ് വിഷ്വൽ എക്സ്പീരിയൻസുകളാണ് അപൂർവ് തയ്യാറാക്കുന്നത്.",
      contrastBad: "We develop WebGL shaders and GPU-accelerated canvas pipelines.",
      contrastBadMl: "ഞങ്ങൾ വെബ്ജിഎൽ ഷേഡറുകളും ജിപിയു കാൻവാസുകളും ചെയ്യുന്നു.",
      killshotQuestion: "Would you rather show patients flat before-and-after photos, or let them rotate an interactive 3D model of their smile transformation right on their phone?",
      killshotQuestionMl: "സാധാരണ ഫോട്ടോകൾ കാണിക്കുന്നതിലും എത്രയോ ഇരട്ടി വിശ്വാസ്യതയോടെ പേഷ്യൻസിന് ഫോണിൽ നേരിട്ട് കണ്ട് ബോധ്യപ്പെടാൻ കഴിയുന്ന 3D മോഡലുകൾ വെബ്സൈറ്റിൽ കാണിക്കുന്നത് ബിസിനസിന് ഗുണം ചെയ്യില്ലേ?"
    },
    thumb: {
      title: "Thumb-Zone UX (Mobile Ergonomics & Sticky CTA)",
      icon: "📱",
      category: "Mobile Conversion & One-Handed Ease",
      metaphor: "A physical department store where the billing counter is only at the front door. When shoppers walk down aisle 4, they have to hike all the way back just to ask a question.",
      metaphorMl: "ഒരു കടയിൽ കസ്റ്റമർ അകത്തേക്ക് നടക്കുമ്പോൾ കാഷ് കൗണ്ടർ മുൻവശത്ത് മാത്രം ഉള്ളതുപോലെ. ഒരു ചോദ്യം ചോദിക്കാൻ പോലും അവർ വീണ്ടും നടന്നു വരണം.",
      talkingPoint: "Over 85% of your mobile visitors scroll with one thumb. When they scroll down to read your doctor bios, your phone button completely disappears. They have to scroll all the way back up to contact you, so most just leave.",
      talkingPointMl: "85% ആളുകളും ഒരു കൈ കൊണ്ടാണ് മൊബൈൽ ഉപയോഗിക്കുന്നത്. താഴേക്ക് സ്ക്രോൾ ചെയ്യുമ്പോൾ ഫോൺ വിളിക്കാനുള്ള ബട്ടൺ മുകളിലേക്ക് മറഞ്ഞുപോകുന്നു. താഴെ ഒരു ഫിക്സഡ് ബട്ടൺ ഇല്ലാത്തതിനാൽ പകുതിയിലധികം ആളുകൾ കോൾ ചെയ്യാതെ ബാക്ക് അടിച്ചു പോകുന്നു.",
      contrastBad: "Your viewport lacks sticky viewport bottom navigation in the ergonomic thumb reach zone.",
      contrastBadMl: "നിങ്ങളുടെ വ്യൂപോർട്ടിൽ തമ്പ്-സോൺ നാവിഗേഷൻ ഇല്ല.",
      killshotQuestion: "When you scroll down on your own website, is there a button under your thumb right now to call your clinic with one tap?",
      killshotQuestionMl: "നിങ്ങളുടെ സ്വന്തം വെബ്‌സൈറ്റിൽ താഴേക്ക് സ്ക്രോൾ ചെയ്യുമ്പോൾ വിരൽത്തുമ്പിൽ ഒറ്റ ടാപ്പിൽ കോൾ ചെയ്യാനുള്ള ബട്ടൺ ഇപ്പോൾ കാണുന്നുണ്ടോ?"
    },
    aggregator: {
      title: "Aggregator Bleed (Practo / Zomato Commission Bleed)",
      icon: "💸",
      category: "Direct Revenue Protection & Middleman Fees",
      metaphor: "Paying an auto or cab driver a 25% commission to bring your regular existing family members to your house.",
      metaphorMl: "നിങ്ങളെ വർഷങ്ങളായി അറിയാവുന്ന സ്ഥിരം രോഗികൾ ക്ലിനിക്കിൽ വരുമ്പോൾ പോലും ഒരു ഇടനിലക്കാരന് 20% കമ്മീഷൻ കൊടുക്കുന്നത് പോലെ.",
      talkingPoint: "You are paying Practo ₹2,000 to ₹5,000 every month just to book appointments for patients who already searched specifically for your clinic name. A direct WhatsApp portal keeps 100% of those bookings in your clinic.",
      talkingPointMl: "നിങ്ങളുടെ ക്ലിനിക്കിന്റെ പേര് നേരിട്ട് സെർച്ച് ചെയ്തു വരുന്ന പേഷ്യൻസിൽ നിന്ന് പോലും പ്രാക്ടോയും മറ്റ് ഇടനിലക്കാരും വലിയ കമ്മീഷൻ എടുക്കുന്നുണ്ട്. നേരിട്ടുള്ള ഒരു വാട്സാപ്പ് ബുക്കിംഗ് സിസ്റ്റം വഴി ഈ നഷ്ടം പൂർണ്ണമായി ഒഴിവാക്കാം.",
      contrastBad: "You suffer from severe platform disintermediation and 20% take-rate margin compression.",
      contrastBadMl: "പ്ലാറ്റ്‌ഫോം ഡിസ്ഇന്റർമീഡിയേഷൻ വഴി മാർജിൻ കംപ്രഷൻ ഉണ്ടാകുന്നു.",
      killshotQuestion: "How much did your clinic pay aggregators last month just for appointments from patients who already knew your name?",
      killshotQuestionMl: "കഴിഞ്ഞ മാസം മാത്രം നിങ്ങളുടെ ക്ലിനിക്കിന്റെ സ്വന്തം പേരിൽ വന്ന പേഷ്യൻസിനായി എത്ര രൂപ ഇടനിലക്കാർക്ക് കമ്മീഷൻ നൽകേണ്ടി വന്നു?"
    },
    friction: {
      title: "Booking Friction (Multi-Step Form Drop-off Risk)",
      icon: "⏳",
      category: "Form Abandonment & Instant Booking",
      metaphor: "An airport reception that demands your blood group, shoe size, and college degree just to print your boarding pass.",
      metaphorMl: "ഒരു ഡോക്ടറോട് ഒരു സംശയം ചോദിക്കാൻ വേണ്ടി 5 കോളങ്ങൾ ഉള്ള വലിയൊരു ഫോറം പൂരിപ്പിക്കാൻ പറയുന്നതുപോലെ. ആളുകൾ പാതിവഴിയിൽ ഉപേക്ഷിച്ചു പോകും.",
      talkingPoint: "Every extra text field in a contact form cuts mobile inquiries by 11%. Your current form asks for 5+ details before patients can even talk to reception. High-converting clinics replace this with a 1-tap WhatsApp consultation link.",
      talkingPointMl: "ഓരോ അധിക ഫീൽഡും 11% ആളുകളെ പിന്തിരിപ്പിക്കുന്നു. വലിയ ഫോറങ്ങൾ പൂരിപ്പിക്കുന്നതിന് പകരം ഒറ്റ ടാപ്പിൽ വാട്സാപ്പിൽ കണക്റ്റ് ചെയ്യുന്ന സംവിധാനമാണ് ആളുകൾക്കിഷ്ടം.",
      contrastBad: "Your user journey exhibits severe multi-step input funnel degradation.",
      contrastBadMl: "മൾട്ടി-സ്റ്റെപ്പ് ഫണൽ ഇൻപുട്ട് ഫ്രിക്ഷൻ ഡ്രോപ്പ്-ഓഫ് ഉണ്ടാക്കുന്നു.",
      killshotQuestion: "How many inquiries did your website form receive this week compared to direct WhatsApp messages?",
      killshotQuestionMl: "ഈ കഴിഞ്ഞ ആഴ്ച നിങ്ങളുടെ വെബ്സൈറ്റ് ഫോറം വഴി എത്ര എൻക്വയറി കിട്ടി? ആളുകൾ ഫോറം ഉപേക്ഷിച്ചു പോകുന്നത് ശ്രദ്ധിച്ചിട്ടുണ്ടോ?"
    },
    headless: {
      title: "Apoorv 60 FPS Headless Architecture (Zero-Plugin Pure Code)",
      icon: "⚡",
      category: "Engine Superiority & Enterprise Speed",
      metaphor: "A Formula 1 car engineered from pure carbon fiber versus a standard family sedan loaded with 40 heavy roof racks and spare tires.",
      metaphorMl: "40 ചാക്ക് ഭാരവും ചുമന്നുകൊണ്ട് ഓടുന്ന പഴയ കാറും, ഭാരമില്ലാത്ത പുതിയ സ്പോർട്സ് കാറും തമ്മിലുള്ള വ്യത്യാസം പോലെ.",
      talkingPoint: "Apoorv doesn't use generic WordPress templates or heavy page builders. He writes direct, custom code that loads in under 0.8 seconds and animates at 60 FPS without plugins, feeling as fluid as an iPhone app.",
      talkingPointMl: "അപൂർവ് പഴയ വേർഡ്പ്രസ്സ് പ്ലഗിനുകൾ ഉപയോഗിക്കുന്നില്ല. 0.8 സെക്കൻഡിൽ ലോഡ് ആകുന്ന കസ്റ്റം കോഡിങ് ആയതുകൊണ്ട് ഫോൺ ഹാങ് ആകില്ല, ഐഫോൺ ആപ്പ് പോലെ സ്മൂത്ത് ആയി പ്രവർത്തിക്കും.",
      contrastBad: "We architect zero-dependency WebGL headless bundles with DPR clamping.",
      contrastBadMl: "ഞങ്ങൾ ഡിപിആർ ക്ലാമ്പിംഗ് ഉള്ള വെബ്ജിഎൽ ഹെഡ്‌ലെസ്സ് ബണ്ടിൽ ചെയ്യുന്നു.",
      killshotQuestion: "Does your current website feel as fast and smooth as opening an app on an iPhone?",
      killshotQuestionMl: "നിങ്ങളുടെ ഇപ്പോഴത്തെ വെബ്സൈറ്റ് തുറക്കുമ്പോൾ ഒരു ഐഫോൺ ആപ്പ് പോലെ ഞൊടിയിടയിൽ സ്മൂത്തായി പ്രവർത്തിക്കുന്നുണ്ടോ?"
    }
  };

  // Add contrast and killshot questions to existing items if not present
  if (LAYMAN_ANALOGIES.lcp) {
    LAYMAN_ANALOGIES.lcp.contrastBad = "Your Largest Contentful Paint is 4.4 seconds which breaches Core Web Vitals threshold.";
    LAYMAN_ANALOGIES.lcp.contrastBadMl = "നിങ്ങളുടെ എൽസിപി സ്കോർ 4.4 സെക്കൻഡ് ആണ്, ഇത് കോർ വെബ് വൈറ്റൽസ് പരാജയപ്പെടുത്തുന്നു.";
    LAYMAN_ANALOGIES.lcp.killshotQuestion = "Do you have your phone with you right now? Try opening your website on 4G—count the seconds of blank screen before your phone button shows up.";
    LAYMAN_ANALOGIES.lcp.killshotQuestionMl = "ഡോക്ടറുടെ കയ്യിൽ ഇപ്പോൾ മൊബൈൽ ഫോൺ ഉണ്ടോ? ഒന്ന് വെബ്സൈറ്റ് തുറന്ന് നോക്കാമോ, ഫോൺ നമ്പർ കാണാൻ എത്ര സെക്കൻഡ് ബ്ലാങ്ക് സ്ക്രീൻ വരുന്നുണ്ടെന്ന്?";
  }
  if (LAYMAN_ANALOGIES.dom) {
    LAYMAN_ANALOGIES.dom.contrastBad = "Excessive DOM depth and CSSOM recalculation thrashing.";
    LAYMAN_ANALOGIES.dom.contrastBadMl = "ഡോം ഡെപ്ത് അധികമായതിനാൽ സിഎസ്എസ്ഒഎം റീകാൽക്കുലേഷൻ സ്ലോ ആകുന്നു.";
    LAYMAN_ANALOGIES.dom.killshotQuestion = "When was the last time someone updated all the background plugins on your site without something breaking?";
    LAYMAN_ANALOGIES.dom.killshotQuestionMl = "വെബ്സൈറ്റിലെ പഴയ വേർഡ്പ്രസ്സ് പ്ലഗിനുകൾ അവസാനമായി എപ്പോഴാണ് അപ്ഡേറ്റ് ചെയ്തത്?";
  }
  if (LAYMAN_ANALOGIES.dpdp) {
    LAYMAN_ANALOGIES.dpdp.contrastBad = "You are violating Section 6 of the DPDP Act 2023 regarding affirmative consent.";
    LAYMAN_ANALOGIES.dpdp.contrastBadMl = "നിങ്ങൾ ഡിപിഡിപി നിയമത്തിലെ സെക്ഷൻ 6 ലംഘിക്കുന്നു.";
    LAYMAN_ANALOGIES.dpdp.killshotQuestion = "Did your web developer update your patient intake forms when the DPDP Act passed last year, or are you still using the old template?";
    LAYMAN_ANALOGIES.dpdp.killshotQuestionMl = "കഴിഞ്ഞ വർഷം പാസ്സായ പുതിയ ഡിപിഡിപി ഡാറ്റാ നിയമപ്രകാരം വെബ്സൈറ്റിലെ ഫോറം മാറ്റാൻ ആരെങ്കിലും ശ്രദ്ധിച്ചിരുന്നോ?";
  }
  if (LAYMAN_ANALOGIES.tls) {
    LAYMAN_ANALOGIES.tls.contrastBad = "Inadequate cipher suites and missing HSTS preloading headers.";
    LAYMAN_ANALOGIES.tls.contrastBadMl = "എച്ച്ടിഎസ്ടി പ്രീലോഡിങ് ഹെഡർ ഇല്ലാത്തതിനാൽ സെക്യൂരിറ്റി വീക്കാണ്.";
    LAYMAN_ANALOGIES.tls.killshotQuestion = "Have you noticed Chrome showing a 'Not Secure' warning beside your web address on some phones?";
    LAYMAN_ANALOGIES.tls.killshotQuestionMl = "ചില ഫോണുകളിൽ നിങ്ങളുടെ വെബ്സൈറ്റിന് മുകളിൽ 'Not Secure' എന്ന വാണിംഗ് വരുന്നത് കണ്ടിട്ടുണ്ടോ?";
  }

  let activeAnalogyKey = "lcp";

  function showLaymanAnalogy(key) {
    if (typeof playSound === 'function') playSound('click');
    activeAnalogyKey = key || activeAnalogyKey || 'lcp';
    const modal = document.getElementById('laymanAnalogyModal');
    const icon = document.getElementById('laymanAnalogyIcon');
    const title = document.getElementById('laymanAnalogyTitle');
    const cat = document.getElementById('laymanAnalogyCategory');
    const metaphor = document.getElementById('laymanAnalogyMetaphor');
    const talkingPoint = document.getElementById('laymanAnalogyTalkingPoint');
    const contrastBad = document.getElementById('laymanAnalogyContrastBad');
    const killshot = document.getElementById('laymanAnalogyKillshot');

    const item = LAYMAN_ANALOGIES[activeAnalogyKey];
    if (!item || !modal) return;

    if (icon) icon.innerText = item.icon || '⚡';
    if (title) title.innerText = item.title || 'Technical Concept';
    if (cat) cat.innerText = item.category || 'ARCHITECTURE';

    const currentLang = (typeof activeLang !== 'undefined') ? activeLang : 'ml';

    if (metaphor) {
      metaphor.innerText = (currentLang === 'ml' && item.metaphorMl) ? item.metaphorMl : item.metaphor;
    }
    if (talkingPoint) {
      talkingPoint.innerText = (currentLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
    }
    if (contrastBad) {
      contrastBad.innerText = (currentLang === 'ml' && item.contrastBadMl) ? item.contrastBadMl : (item.contrastBad || "Generic technical specification.");
    }
    if (killshot) {
      killshot.innerText = (currentLang === 'ml' && item.killshotQuestionMl) ? item.killshotQuestionMl : (item.killshotQuestion || "Ask the prospect to test this live on their phone.");
    }

    // Update active tab buttons inside the modal if present
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.analogy-pill-btn').forEach(btn => {
        const btnKey = btn.getAttribute('data-analogy-key');
        if (btnKey === activeAnalogyKey) {
          btn.classList.add('bg-[#fce566]', 'text-[#17120f]', 'font-bold');
          btn.classList.remove('bg-white/[0.04]', 'text-neutral-300');
        } else {
          btn.classList.remove('bg-[#fce566]', 'text-[#17120f]', 'font-bold');
          btn.classList.add('bg-white/[0.04]', 'text-neutral-300');
        }
      });
    }

    // Update modal language buttons
    const btnEn = document.getElementById('analogyModalLangEn');
    const btnMl = document.getElementById('analogyModalLangMl');
    if (btnEn && btnMl) {
      if (currentLang === 'en') {
        btnEn.className = "px-2 py-0.5 rounded font-bold text-xs bg-[#fce566] text-[#17120f] border border-[#17120f]";
        btnMl.className = "px-2 py-0.5 rounded text-xs bg-white/[0.06] text-neutral-400 hover:text-white border border-white/[0.1]";
      } else {
        btnMl.className = "px-2 py-0.5 rounded font-bold text-xs bg-[#fce566] text-[#17120f] border border-[#17120f]";
        btnEn.className = "px-2 py-0.5 rounded text-xs bg-white/[0.06] text-neutral-400 hover:text-white border border-white/[0.1]";
      }
    }

    modal.classList.remove('hidden');
  }

  function switchAnalogyLang(lang) {
    if (typeof activeLang !== 'undefined') {
      activeLang = lang;
    }
    if (typeof window !== 'undefined') {
      window.activeLang = lang;
    }
    showLaymanAnalogy(activeAnalogyKey || 'lcp');
  }

  function speakCurrentAnalogy() {
    const item = LAYMAN_ANALOGIES[activeAnalogyKey];
    if (!item) return;
    const currentLang = (typeof activeLang !== 'undefined') ? activeLang : 'ml';
    const textToSpeak = (currentLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = currentLang === 'ml' ? 'ml-IN' : 'en-US';
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
        if (typeof showNotification === 'function') {
          showNotification('🔊 Playing spoken conversational audio...');
        }
      } catch (e) {
        if (typeof playSound === 'function') playSound('chime');
      }
    } else {
      if (typeof playSound === 'function') playSound('chime');
    }
  }

  function copyCurrentAnalogy() {
    const item = LAYMAN_ANALOGIES[activeAnalogyKey];
    if (!item) return;
    const currentLang = (typeof activeLang !== 'undefined') ? activeLang : 'ml';
    const textToCopy = (currentLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
    
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        if (typeof showNotification === 'function') {
          showNotification('📋 Conversational script copied to clipboard!');
        }
        if (typeof playSound === 'function') playSound('click');
      }).catch(() => {});
    }
  }

  function appendCurrentAnalogyToNotes() {
    const item = LAYMAN_ANALOGIES[activeAnalogyKey];
    if (!item) return;
    const currentLang = (typeof activeLang !== 'undefined') ? activeLang : 'ml';
    const text = (currentLang === 'ml' && item.talkingPointMl) ? item.talkingPointMl : item.talkingPoint;
    appendObjectionToNotes(item.title, text);
  }

  function closeLaymanAnalogy() {
    if (typeof playSound === 'function') playSound('click');
    activeAnalogyKey = null;
    const modal = document.getElementById('laymanAnalogyModal');
    if (modal) modal.classList.add('hidden');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
    switchAnalogyLang,
    speakCurrentAnalogy,
    copyCurrentAnalogy,
    appendCurrentAnalogyToNotes,
    appendObjectionToNotes
  };

  root.OBJECTIONS = OBJECTIONS;
  root.LAYMAN_ANALOGIES = LAYMAN_ANALOGIES;
  root.showLaymanAnalogy = showLaymanAnalogy;
  root.closeLaymanAnalogy = closeLaymanAnalogy;
  root.switchAnalogyLang = switchAnalogyLang;
  root.speakCurrentAnalogy = speakCurrentAnalogy;
  root.copyCurrentAnalogy = copyCurrentAnalogy;
  root.appendCurrentAnalogyToNotes = appendCurrentAnalogyToNotes;
  root.appendObjectionToNotes = appendObjectionToNotes;
  root.ObjectionEngine = ObjectionEngine;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObjectionEngine;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));

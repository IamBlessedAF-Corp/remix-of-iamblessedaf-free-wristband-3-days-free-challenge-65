export interface Framework {
  id: string;
  name: string;
  secret: string;
  section: string;
  description: string;
  icon: string; // lucide icon name
  questions: string[]; // guided questions shown before generating
}

export const FRAMEWORK_SECTIONS = [
  { id: "movement", title: "Section 1: Creating Your Mass Movement", subtitle: "Secrets #1–4 — Build your tribe of true fans" },
  { id: "belief", title: "Section 2: Creating Belief", subtitle: "Secrets #5–10 — Destroy false beliefs & install new ones" },
  { id: "obligation", title: "Section 3: Your Moral Obligation", subtitle: "Secrets #11–16 — Build irresistible offers & close" },
  { id: "funnels", title: "Section 4: The Funnels", subtitle: "Secrets #17–21 — Deploy your message at scale" },
  { id: "growth", title: "Section 5: What's Next?", subtitle: "Secret #22 + Key Concepts — Fill your funnel & grow" },
];

export const FRAMEWORKS: Framework[] = [
  // ═══════════════════════════════════════════════════
  // SECTION 1: CREATING YOUR MASS MOVEMENT
  // ═══════════════════════════════════════════════════
  {
    id: "attractive-character",
    name: "The Charismatic Leader / Attractive Character",
    secret: "Secret #1",
    section: "movement",
    description: "Establish yourself as a charismatic leader with a compelling origin story, identity type (Leader, Adventurer, Reporter, or Reluctant Hero), parables, character flaws, and polarizing stance. Russell says: 'People become leaders when they first try to master something for themselves, then share their knowledge with others.'",
    icon: "User",
    questions: [
      "What personal struggle led you to discover your expertise? (Your backstory — be specific about where you were, what you felt)",
      "What was your 'aha moment' — the turning point that changed everything?",
      "Which identity type fits you best: The Leader (I'll show you the way), The Adventurer (I'll go discover and report back), The Reporter (I'll interview the best and compile it), or The Reluctant Hero (I didn't want this role, but I had to step up)?",
      "What bold, polarizing belief do you hold that most people in your industry disagree with? (Your polarity — this attracts true fans)",
      "What character flaw or vulnerability makes you human and relatable?",
    ],
  },
  {
    id: "the-cause",
    name: "The Cause",
    secret: "Secret #2",
    section: "movement",
    description: "Create a future-based cause bigger than yourself — with a manifesto, rallying cry, title of liberty, and cultural values. Russell teaches that 'rebellions are built on hope' and every movement needs a 4-minute mile moment to show people what's possible.",
    icon: "Flag",
    questions: [
      "What broken system or injustice does your movement fight against? (The 'Us vs. Them')",
      "If your movement fully succeeds, what does the world look like in 5 years? (The future-based cause)",
      "What is your 'You're just one funnel away...' statement — a rallying cry your tribe would put on a t-shirt? (Title of Liberty)",
      "Who is your '4-minute mile' case study — someone who broke through and proved it's possible for everyone?",
      "What are 3-5 core beliefs that define your cult-ure? (The values your tribe lives by)",
    ],
  },
  {
    id: "new-opportunity",
    name: "The New Opportunity",
    secret: "Secret #3",
    section: "movement",
    description: "Position your offer as a completely NEW opportunity — NOT an improvement on what they're already doing. Russell says: 'People don't want improvement. They want something new.' New opportunities increase status; improvement offers decrease status by reminding people of past failures.",
    icon: "Lightbulb",
    questions: [
      "What is the OLD way your audience has been trying to solve their problem? (The current vehicle they're using)",
      "What makes your approach fundamentally DIFFERENT (not just better) from everything else out there?",
      "How does adopting your new opportunity INCREASE your audience's perceived status among their peers?",
      "What is your specific 'vehicle of change' — the mechanism that delivers the transformation?",
      "Why would someone rather START FRESH with your opportunity than try to 'fix' what they've been doing?",
    ],
  },
  {
    id: "opportunity-switch",
    name: "The Opportunity Switch",
    secret: "Secret #4",
    section: "movement",
    description: "Master the two types of opportunity shifts: the Opportunity Switch (replacing their current vehicle entirely) and the Opportunity Stack (adding a new opportunity on top of what they already believe). Russell teaches you must identify which one you're offering and position accordingly.",
    icon: "ArrowLeftRight",
    questions: [
      "Are you asking people to SWITCH vehicles entirely (leave the old way behind) or STACK a new opportunity on top of what they already do?",
      "What is the specific 'old vehicle' you are replacing, and why has it stopped working for your audience?",
      "What is the #1 reason someone would resist switching? How do you overcome that resistance?",
      "How do you position the switch so it feels like an UPGRADE in status, not a risky gamble?",
    ],
  },

  // ═══════════════════════════════════════════════════
  // SECTION 2: CREATING BELIEF
  // ═══════════════════════════════════════════════════
  {
    id: "big-domino",
    name: "The Big Domino",
    secret: "Secret #5",
    section: "belief",
    description: "Identify the ONE belief that, if your audience accepts it, makes all other objections and concerns irrelevant. Russell says: 'If I can make them believe that [my new opportunity] is the key to [what they desire most] and is only attainable through [my specific vehicle], then all other objections become irrelevant.'",
    icon: "Zap",
    questions: [
      "If your audience could believe just ONE thing about your offer, what single belief would make them buy immediately?",
      "What is the single most powerful piece of proof you have that this ONE thing is true?",
      "What is the #1 objection you hear — and how does the Big Domino statement eliminate it?",
      "Complete this: 'If I can make them believe that _____ is the key to _____ and is only attainable through _____, then all other objections become irrelevant.'",
    ],
  },
  {
    id: "epiphany-bridge",
    name: "The Epiphany Bridge",
    secret: "Secret #6",
    section: "belief",
    description: "Tell emotional origin stories that transport your audience to the exact moment you had your breakthrough. Russell teaches that logic doesn't create belief — emotion does. The Epiphany Bridge takes someone from the logical world into the emotional world where they can experience YOUR epiphany as their own.",
    icon: "BookOpen",
    questions: [
      "Describe the lowest point BEFORE your breakthrough — where were you physically, what did you feel emotionally? (Be vivid and specific)",
      "What was the exact moment everything changed? What triggered the epiphany? (The emotional 'aha')",
      "What was the FIRST tangible result you got after the breakthrough? (Make it specific — numbers, dates, details)",
    ],
  },
  {
    id: "heros-two-journeys",
    name: "The Hero's Two Journeys",
    secret: "Secret #7",
    section: "belief",
    description: "Every compelling story has TWO journeys: the external journey (the achievement) and the internal journey (the transformation of who they become). Russell teaches from Michael Hauge that audiences connect with the IDENTITY journey more than the achievement. Your story must show both journeys.",
    icon: "Route",
    questions: [
      "What is the external, visible ACHIEVEMENT journey of your story? (The goal, the result, the tangible outcome)",
      "What is the internal IDENTITY journey? Who did you BECOME through the process? (The real transformation)",
      "What was your 'identity shift' — the moment you stopped being the old version of yourself and became the new version?",
      "How does your audience's identity need to shift for them to succeed with your opportunity?",
    ],
  },
  {
    id: "epiphany-bridge-script",
    name: "The Epiphany Bridge Script",
    secret: "Secret #8",
    section: "belief",
    description: "Russell's step-by-step script for telling Epiphany Bridge stories: (1) The Backstory, (2) Your desires/wall/failures, (3) The Epiphany moment, (4) The Plan that emerged, (5) The Conflict you faced, (6) The Achievement, (7) The Transformation. This exact structure creates maximum belief.",
    icon: "FileText",
    questions: [
      "What was your backstory — the situation before the epiphany? (Set the scene)",
      "What external event or internal breakthrough created the epiphany? (The exact turning point)",
      "After the epiphany, what PLAN or FRAMEWORK emerged? (The system you now teach)",
      "What conflict or resistance did you face while executing the plan? (The struggle after the epiphany)",
      "What was the ultimate achievement AND who did you become? (Both journeys resolved)",
    ],
  },
  {
    id: "false-beliefs",
    name: "False Belief Patterns",
    secret: "Secret #9",
    section: "belief",
    description: "Identify and destroy the 3 core false beliefs that prevent your audience from taking action: (1) Vehicle — 'This type of solution won't work', (2) Internal — 'I can't do it / I'm not enough', (3) External — 'External forces will stop me'. Each false belief needs its own Epiphany Bridge story to destroy it and install a new belief.",
    icon: "ShieldOff",
    questions: [
      "What do people wrongly believe about your TYPE of solution? (Vehicle false belief — 'This kind of thing doesn't work')",
      "What do people tell themselves about why THEY specifically can't succeed? (Internal false belief — 'I'm not smart/talented/worthy enough')",
      "What external excuse do people use? (External false belief — 'I don't have enough time/money/support/connections')",
      "For each false belief, what story from your own experience disproves it?",
    ],
  },
  {
    id: "the-3-secrets",
    name: "The 3 Secrets",
    secret: "Secret #10",
    section: "belief",
    description: "Structure your presentation around 3 Secrets, where each secret is an Epiphany Bridge story that destroys one of the 3 false beliefs. Secret #1 destroys the Vehicle false belief, Secret #2 destroys the Internal false belief, Secret #3 destroys the External false belief. This is the content framework for the Perfect Webinar.",
    icon: "Key",
    questions: [
      "What is Secret #1 you'll teach that destroys the vehicle false belief? (Reframe: 'It's not [old vehicle] that failed you, it's that you need [new opportunity]')",
      "What is Secret #2 that destroys the internal false belief? (Reframe: 'You don't need [thing they think they need], you just need [your framework]')",
      "What is Secret #3 that destroys the external false belief? (Reframe: 'You don't need [external resource], because [your mechanism] handles that')",
      "For each secret, what is the Epiphany Bridge story that makes them FEEL the new belief?",
    ],
  },

  // ═══════════════════════════════════════════════════
  // SECTION 3: YOUR MORAL OBLIGATION
  // ═══════════════════════════════════════════════════
  {
    id: "stack-slide",
    name: "The Stack Slide",
    secret: "Secret #11",
    section: "obligation",
    description: "Build an irresistible value stack that makes your price feel like a steal. Russell teaches that the LAST slide of your presentation — the stack slide — is the most important. Each element should have a clear value attached. The total value should be 10x the price.",
    icon: "Layers",
    questions: [
      "What is the core deliverable of your offer? (The main thing they get — the 'vehicle')",
      "What 3-5 bonuses or tools could you add that solve related problems your audience faces?",
      "What is the real-world value of each element if they had to acquire it separately?",
      "What guarantee would make saying 'no' feel riskier than saying 'yes'?",
    ],
  },
  {
    id: "perfect-webinar",
    name: "The Perfect Webinar",
    secret: "Secret #12",
    section: "obligation",
    description: "Russell's complete Perfect Webinar framework: The Introduction (hook + 3 secrets preview), The Content (3 secrets with Epiphany Bridge stories for each), The Transition to selling, and The Close (the stack + urgency). This is the master framework for selling anything from $97 to $997+.",
    icon: "Presentation",
    questions: [
      "What are the 3 biggest 'secrets' or breakthroughs you can teach in 60 minutes?",
      "What is the most impressive result you or a student has achieved? (Your '4-minute mile' proof)",
      "What is the investment price for your offer?",
      "What is your 'One Thing' — the single biggest takeaway from your webinar?",
    ],
  },
  {
    id: "the-one-thing",
    name: "The One Thing",
    secret: "Secret #13",
    section: "obligation",
    description: "At the start of your webinar, you must establish the 'One Thing' — the single most important concept that if they get NOTHING else from the presentation, this ONE THING will change everything. It ties directly to the Big Domino and becomes the thread that connects all 3 secrets.",
    icon: "Target",
    questions: [
      "If your audience could only remember ONE concept from your entire presentation, what would change their life the most?",
      "How does this 'One Thing' connect to your Big Domino belief statement?",
      "How do you make this 'One Thing' feel both simple and profound at the same time?",
    ],
  },
  {
    id: "breaking-rebuilding-beliefs",
    name: "Breaking & Rebuilding Belief Patterns",
    secret: "Secret #14",
    section: "obligation",
    description: "Russell's framework for systematically breaking old beliefs and rebuilding new ones during each of the 3 secrets. For each secret: (1) State the false belief, (2) Tell the Epiphany Bridge story, (3) Show the new belief, (4) Show the 'experience' that makes it real. This is inspired by Jason Fladlien's methodology.",
    icon: "Hammer",
    questions: [
      "For each of your 3 secrets, what is the specific FALSE belief you must break?",
      "What is the Epiphany Bridge story for each that emotionally disproves the false belief?",
      "What NEW belief do you install after breaking the old one?",
      "What evidence, experience, or proof do you provide to anchor the new belief?",
    ],
  },
  {
    id: "the-stack",
    name: "The Stack",
    secret: "Secret #15",
    section: "obligation",
    description: "Armand Morin's Stack technique as taught by Russell: Instead of just showing the final slide, you BUILD the stack one element at a time. Each time you add an item, you re-show everything that came before plus the new item. By the time you reach the final slide, they've seen the full stack 6+ times. This is the most powerful closing technique in the Perfect Webinar.",
    icon: "LayoutList",
    questions: [
      "List every component of your offer in the order you want to reveal them (main offer first, then bonuses)",
      "What is the assigned dollar value for each component? (Should total 10x your asking price)",
      "What is the dramatic 'price drop' moment — from total value to your actual price?",
      "What is the guarantee that removes all risk?",
    ],
  },
  {
    id: "trial-closes",
    name: "Trial Closes",
    secret: "Secret #16",
    section: "obligation",
    description: "Throughout your presentation, you use 'trial closes' — micro-commitments that get the audience saying YES before you ever ask for the sale. Russell teaches using 'if/then' statements: 'If I could show you how to [result], would you be interested?' These prepare the audience psychologically so the final close feels like a natural next step.",
    icon: "CheckCheck",
    questions: [
      "What are 5 'if I could show you ___, would you be interested?' statements for your offer?",
      "At what points in your presentation will you insert these trial closes?",
      "What is the final 'closing question' that transitions from content to offer?",
      "What micro-commitment or action do you want them to take RIGHT NOW?",
    ],
  },

  // ═══════════════════════════════════════════════════
  // SECTION 4: THE FUNNELS
  // ═══════════════════════════════════════════════════
  {
    id: "perfect-webinar-model",
    name: "The Perfect Webinar Model",
    secret: "Secret #17",
    section: "funnels",
    description: "The complete funnel model for deploying the Perfect Webinar: Registration page → Thank you page → Indoctrination sequence → Live webinar → Replay sequence → Close cart. Russell details every email, every page, and the exact timing for maximum conversions.",
    icon: "MonitorPlay",
    questions: [
      "What is the attention-grabbing webinar title that creates curiosity?",
      "What are 3 bullet points for your registration page that create urgency to sign up?",
      "What is your indoctrination email sequence between registration and the live event?",
      "What is your post-webinar replay strategy? (How many days, what emails?)",
    ],
  },
  {
    id: "four-question-close",
    name: "The 4-Question Close",
    secret: "Secret #18",
    section: "funnels",
    description: "Russell's framework for high-ticket sales (anything above $997): A conversational script using 4 strategic questions: (1) What would your life look like if...? (2) How long have you been trying? (3) What have you tried so far? (4) Would you be open to a new approach? This replaces hard selling with guided discovery.",
    icon: "PhoneCall",
    questions: [
      "What is the ultimate lifestyle result your high-ticket client wants? (Not the deliverable — the LIFE result)",
      "What is the typical price range of your high-ticket offer?",
      "What is the #1 reason someone would say 'not right now' — and what's the real cost of waiting?",
      "What past solutions have your prospects already tried and failed with?",
    ],
  },
  {
    id: "perfect-webinar-hack",
    name: "The Perfect Webinar Hack",
    secret: "Secret #19",
    section: "funnels",
    description: "Can't do live webinars? Russell's hack: Record your Perfect Webinar once, then use automated webinar software to run it on autopilot. He also teaches a 'shortcut' version: the 5-Minute Perfect Webinar for social media — condense the entire framework into a short video using the same structure.",
    icon: "Wand2",
    questions: [
      "Do you plan to run live webinars, automated replays, or both?",
      "What platform will you use for your automated webinar?",
      "How would you condense your Perfect Webinar into a 5-minute video for social media?",
      "What is the ONE most compelling story from your full webinar that works as a standalone video?",
    ],
  },
  {
    id: "email-epiphany",
    name: "Email Epiphany Funnels",
    secret: "Secret #20",
    section: "funnels",
    description: "Russell's 'Soap Opera Sequence' — a 5-email story-driven sequence: (1) Set the stage with a dramatic hook, (2) High drama and backstory, (3) The epiphany moment, (4) Hidden benefits they didn't expect, (5) Urgency and the call to action. Each email opens a loop that the next email closes.",
    icon: "Mail",
    questions: [
      "What is the most dramatic or unexpected part of your story? (The hook for Email 1)",
      "What hidden benefit surprised YOU about your own transformation? (For Email 4)",
      "What is the deadline or scarcity element for your current offer? (For Email 5)",
      "What emotional cliffhanger can you use between emails to keep them opening the next one?",
    ],
  },
  {
    id: "product-launch-funnel",
    name: "Epiphany Product Launch Funnels",
    secret: "Secret #21",
    section: "funnels",
    description: "Russell's adaptation of Jeff Walker's Product Launch Formula using the Epiphany Bridge framework. Instead of a single webinar, you break the content across 4 videos over 7-14 days: Video 1 = Wow + How, Video 2 = Transformational education, Video 3 = Ownership experience, Video 4 = The offer. Each video destroys one false belief.",
    icon: "Rocket",
    questions: [
      "What is the 'wow' moment or demonstration you can show in Video 1 to grab attention?",
      "What transformational education or case study will you feature in Video 2?",
      "How can you give them an 'ownership experience' in Video 3 — a taste of what life looks like with your solution?",
      "What is the timeline for your launch? (7-day, 10-day, or 14-day sequence)",
    ],
  },

  // ═══════════════════════════════════════════════════
  // SECTION 5: WHAT'S NEXT? + KEY CONCEPTS
  // ═══════════════════════════════════════════════════
  {
    id: "fill-your-funnel",
    name: "Fill Your Funnel",
    secret: "Secret #22",
    section: "growth",
    description: "Russell's framework for getting traffic and filling your funnels: (1) Find your dream customers in congregations, (2) Work your way in (build relationships with gatekeepers and do 'Dream 100'), (3) Buy your way in (paid ads). He teaches that you should infiltrate existing audiences rather than trying to build one from scratch.",
    icon: "TrendingUp",
    questions: [
      "Where does your dream audience already congregate online? (Facebook groups, YouTube channels, podcasts, forums, influencers)",
      "Who are your 'Dream 100' — the top 100 people/platforms that already have your ideal audience?",
      "What value can you provide to the Dream 100 to earn your way into their audience? (Guest appearances, collaborations, free content)",
      "What is your paid traffic strategy once organic relationships are established?",
    ],
  },
  {
    id: "one-sentence-persuasion",
    name: "One-Sentence Persuasion",
    secret: "Blair Warren",
    section: "growth",
    description: "Blair Warren's framework that Russell features in Expert Secrets — the 5 triggers that, combined in one sentence, make people do almost anything: Encourage their dreams, justify their failures, allay their fears, confirm their suspicions, help them throw rocks at their enemies.",
    icon: "MessageSquare",
    questions: [
      "What is the #1 dream your audience has that most people dismiss as unrealistic?",
      "What have they tried before that didn't work — and whose fault is it REALLY? (Justify their failures)",
      "What is their deepest fear about trying again — and what evidence removes that fear?",
      "What have they always suspected was true that you can CONFIRM? ('You always knew ____ and you were right')",
      "Who or what is the 'villain' or broken system your audience blames for their struggles?",
    ],
  },
  {
    id: "prolific-index",
    name: "The Prolific Index",
    secret: "Key Concept",
    section: "growth",
    description: "Russell's framework for positioning your message in the sweet spot between mainstream (boring, no money) and crazy zone (too extreme, no audience). The Prolific Zone is where your ideas are unique enough to get attention but not so extreme that people dismiss them. This is where maximum impact and money live.",
    icon: "Gauge",
    questions: [
      "What is the mainstream, 'common sense' advice in your market that everyone already knows?",
      "What is the 'crazy zone' extreme position that most people would dismiss?",
      "Where does YOUR message sit between those two? What makes it prolific (unique but not crazy)?",
      "What is one idea you teach that makes people say 'Whoa, I never thought of it that way'?",
    ],
  },
  {
    id: "three-core-markets",
    name: "3 Core Markets & Your Niche",
    secret: "Key Concept",
    section: "growth",
    description: "Russell's market hierarchy: 3 Core Markets (Health, Wealth, Relationships) → Submarkets → Your Niche. The money is NOT in the submarket — 'the riches are in the niches.' You must carve out a 'blue ocean' — a unique niche inside your submarket that makes competitors irrelevant. Before launching, validate with 3 questions: Are people excited? Are they irrationally passionate? Are they willing AND able to spend money?",
    icon: "Target",
    questions: [
      "Which of the 3 core markets does your expertise fall into: Health, Wealth, or Relationships?",
      "What is your submarket within that core market? (e.g., nutrition, real estate, dating)",
      "What is YOUR unique niche — your 'blue ocean' that makes you different from everyone in the submarket?",
      "Does your market have its own vocabulary, communities, events, and celebrities? (Signs of irrational passion)",
      "Are your target customers both WILLING and ABLE to spend money on solutions?",
    ],
  },
];

export interface HeroProfile {
  name: string;
  brand: string;
  niche: string;
  audience: string;
  originStory: string;
  transformation: string;
  mechanism: string;
  enemy: string;
  bigPromise: string;
  proof: string;
}

export interface HeroQuestion {
  key: keyof HeroProfile;
  label: string;
  subtitle?: string;
  placeholder: string;
  isTextarea?: boolean;
  isMultiSelect?: boolean;
  suggestions?: string[];
}

export const HERO_QUESTIONS: HeroQuestion[] = [
  {
    key: "name",
    label: "Your Name (the Expert / Charismatic Leader)",
    subtitle: "This is the name your audience will know you by — your personal brand identity.",
    placeholder: "e.g. Russell Brunson",
    suggestions: ["Use your real name", "Use a stage name / pen name"],
  },
  {
    key: "brand",
    label: "Brand / Company Name",
    subtitle: "The brand that houses your movement. It should feel aspirational.",
    placeholder: "e.g. ClickFunnels, I am Blessed AF",
    suggestions: ["I am Blessed AF", "FunnelHacker", "MindShift Academy", "The Freedom Project"],
  },
  {
    key: "niche",
    label: "Your Niche / Market",
    subtitle: "Russell's framework: Health, Wealth, or Relationships → Submarket → Your Niche. Pick your core market(s), then specify in the 'Other' box.",
    placeholder: "e.g. Relationships → Personal growth → Gratitude & neuroscience",
    isMultiSelect: true,
    suggestions: [
      "Health & Biohacking",
      "Wealth & Business",
      "Relationships & Dating",
      "Mindset & Personal Development",
      "Spirituality & Faith",
      "Fitness & Nutrition",
      "E-commerce & DTC",
      "Coaching & Consulting",
      "Real Estate",
      "SaaS & Tech",
    ],
  },
  {
    key: "audience",
    label: "Who is your dream customer?",
    subtitle: "Be specific: age, mindset, pain point, aspiration. Russell says: 'If you're talking to everybody, you're talking to nobody.'",
    placeholder: "Describe your ideal avatar in 1-2 sentences",
    suggestions: [
      "Burned-out professionals (30-45) seeking purpose beyond their 9-5",
      "First-time entrepreneurs who don't know where to start",
      "Health-conscious millennials tired of conflicting advice",
      "Coaches/consultants stuck under $10K/month",
      "Parents who want deeper connection with their kids",
    ],
  },
  {
    key: "originStory",
    label: "Your Origin Story (The Epiphany Bridge)",
    subtitle: "Russell teaches: 'Facts tell, stories sell.' Share the backstory → struggle → aha moment → transformation. Be vulnerable.",
    placeholder: "I was [situation], struggling with [pain], until I discovered [breakthrough] and everything changed...",
    isTextarea: true,
    suggestions: [
      "I hit rock bottom when…",
      "I was $___K in debt and about to give up when…",
      "Everyone told me it was impossible, but then I discovered…",
      "After years of trying every solution out there, I finally found…",
    ],
  },
  {
    key: "transformation",
    label: "The Core Transformation You Deliver",
    subtitle: "Russell says every transformation has TWO journeys: External (achievement) + Internal (identity). Describe both.",
    placeholder: "External: From ___ → ___. Internal: From ___ → ___",
    suggestions: [
      "External: Broke → $10K/mo. Internal: Imposter → Confident leader",
      "External: Overweight → Fit. Internal: Self-hate → Self-love",
      "External: Disconnected → Deep relationships. Internal: Self-doubt → Self-worth",
      "External: Unknown → Authority. Internal: Hiding → Visible & magnetic",
    ],
  },
  {
    key: "mechanism",
    label: "Your Unique Mechanism / Vehicle of Change",
    subtitle: "This is your NEW OPPORTUNITY — the specific method, system, or framework only YOU offer. NOT an improvement — something NEW.",
    placeholder: "e.g. The 3-Day Gratitude Challenge using NFC wristbands + daily SMS",
    suggestions: [
      "A 5-step framework / system",
      "A challenge (3-day, 5-day, 30-day)",
      "A proprietary method or process",
      "A software/tool + coaching hybrid",
      "A done-for-you service with a unique twist",
    ],
  },
  {
    key: "enemy",
    label: "The Enemy / Broken System You Fight",
    subtitle: "Every movement has a villain. Russell says: 'Us vs. Them' creates the bond. What broken system are you fighting AGAINST?",
    placeholder: "e.g. Surface-level self-help gurus who sell motivation but no real results",
    suggestions: [
      "The traditional education system that creates employees, not entrepreneurs",
      "Big pharma / sick-care industry that profits from keeping people unwell",
      "Fake gurus who sell dreams but have no real results",
      "The 'hustle culture' that burns people out",
      "Corporate America's golden handcuffs",
    ],
  },
  {
    key: "bigPromise",
    label: "Your Big Promise (The Future-Based Cause)",
    subtitle: "Russell says: 'A cause is future-based — it's what your movement is building toward.' Make it bold, specific, and time-bound if possible.",
    placeholder: "e.g. Rewire your brain for gratitude in 72 hours — backed by Harvard research",
    suggestions: [
      "From zero to $10K/month in 90 days without paid ads",
      "Lose 20 lbs in 8 weeks without restrictive diets",
      "Build a 6-figure coaching business in 12 months",
      "Transform your closest relationships in just 3 days",
      "Launch your first digital product in 30 days flat",
    ],
  },
  {
    key: "proof",
    label: "Your Best Proof / Results (The 4-Minute Mile)",
    subtitle: "Russell teaches: 'Once Roger Bannister ran the 4-minute mile, everyone believed it was possible.' What's YOUR proof that it works?",
    placeholder: "e.g. 2,400+ participants, 11 meals donated per signup, 94% completion rate",
    isTextarea: true,
    suggestions: [
      "X students have achieved [result]",
      "Generated $X in revenue for clients",
      "Featured in [media/publication]",
      "X% completion/success rate",
      "Personally went from [before] to [after] in [timeframe]",
    ],
  },
];

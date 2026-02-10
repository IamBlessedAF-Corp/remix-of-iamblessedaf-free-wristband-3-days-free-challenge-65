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
  { id: "movement", title: "Section 1: Creating Your Mass Movement", subtitle: "Build your tribe of true fans" },
  { id: "belief", title: "Section 2: Creating Belief", subtitle: "Destroy false beliefs & install new ones" },
  { id: "obligation", title: "Section 3: Your Moral Obligation", subtitle: "Build irresistible offers & close" },
  { id: "funnels", title: "Section 4: The Funnels", subtitle: "Deploy your message at scale" },
];

export const FRAMEWORKS: Framework[] = [
  {
    id: "attractive-character",
    name: "Attractive Character",
    secret: "Secret #1",
    section: "movement",
    description: "Establish yourself as a charismatic leader with a compelling origin story, identity, and polarizing stance.",
    icon: "User",
    questions: [
      "What personal struggle led you to discover your expertise?",
      "What was your 'aha moment' — the turning point that changed everything?",
      "What bold, polarizing belief do you hold that most people in your industry disagree with?",
    ],
  },
  {
    id: "the-cause",
    name: "The Cause",
    secret: "Secret #2",
    section: "movement",
    description: "Create a future-based cause bigger than yourself — with a manifesto, rallying cry, and cultural values.",
    icon: "Flag",
    questions: [
      "What broken system or injustice does your movement fight against?",
      "If your movement succeeds, what does the world look like in 5 years?",
      "What is one sentence your tribe would put on a t-shirt?",
    ],
  },
  {
    id: "new-opportunity",
    name: "New Opportunity",
    secret: "Secret #3-4",
    section: "movement",
    description: "Position your offer as a NEW opportunity (not an improvement) that elevates your audience's status.",
    icon: "Lightbulb",
    questions: [
      "What is the OLD way your audience has been trying to solve their problem?",
      "What makes your approach fundamentally DIFFERENT (not just better)?",
      "How does adopting your opportunity make someone look/feel to their peers?",
    ],
  },
  {
    id: "big-domino",
    name: "The Big Domino",
    secret: "Secret #5",
    section: "belief",
    description: "Identify the ONE belief that, once accepted, makes all other objections irrelevant.",
    icon: "Zap",
    questions: [
      "If your audience could believe just ONE thing, what would make them buy immediately?",
      "What is the single most powerful piece of proof you have?",
      "What is the #1 objection you hear — and how does the Big Domino eliminate it?",
    ],
  },
  {
    id: "epiphany-bridge",
    name: "Epiphany Bridge",
    secret: "Secret #6-8",
    section: "belief",
    description: "Tell emotional origin stories that transport your audience to the moment of your breakthrough.",
    icon: "BookOpen",
    questions: [
      "Describe the lowest point BEFORE your breakthrough (be specific — where were you, what did you feel?)",
      "What was the exact moment everything changed? What triggered it?",
      "What was the FIRST result you got after the breakthrough?",
    ],
  },
  {
    id: "false-beliefs",
    name: "False Belief Patterns",
    secret: "Secret #9-10",
    section: "belief",
    description: "Identify and destroy the 3 false beliefs about the vehicle, their own abilities, and external forces.",
    icon: "ShieldOff",
    questions: [
      "What do people wrongly believe about your TYPE of solution? (vehicle false belief)",
      "What do people tell themselves about why THEY specifically can't succeed? (internal false belief)",
      "What external excuse do people use — 'I don't have time/money/support'? (external false belief)",
    ],
  },
  {
    id: "stack-slide",
    name: "The Stack Slide",
    secret: "Secret #11, #15",
    section: "obligation",
    description: "Build an irresistible value stack that makes your price feel like a steal.",
    icon: "Layers",
    questions: [
      "What is the core deliverable of your offer? (the main thing they get)",
      "What 3-5 bonuses could you add that solve related problems?",
      "What guarantee would make saying 'no' feel riskier than saying 'yes'?",
    ],
  },
  {
    id: "perfect-webinar",
    name: "Perfect Webinar",
    secret: "Secret #12-16",
    section: "obligation",
    description: "Generate a complete webinar script with 3 secrets, belief shifts, trial closes, and the stack.",
    icon: "Presentation",
    questions: [
      "What are the 3 biggest 'secrets' or breakthroughs you can teach in 60 minutes?",
      "What is the most impressive result you or a student has achieved?",
      "What is the investment price for your offer?",
    ],
  },
  {
    id: "email-epiphany",
    name: "Email Epiphany Funnel",
    secret: "Secret #20",
    section: "funnels",
    description: "Create a 5-email 'Soap Opera Sequence' that nurtures leads through story-driven epiphanies.",
    icon: "Mail",
    questions: [
      "What is the most dramatic or unexpected part of your story?",
      "What hidden benefit surprised YOU about your own transformation?",
      "What is the deadline or scarcity element for your current offer?",
    ],
  },
  {
    id: "one-sentence-persuasion",
    name: "One-Sentence Persuasion",
    secret: "Blair Warren",
    section: "funnels",
    description: "Hit all 5 persuasion triggers: encourage dreams, justify failures, allay fears, confirm suspicions, throw rocks.",
    icon: "MessageSquare",
    questions: [
      "What is the #1 dream your audience has that most people dismiss as unrealistic?",
      "What have they tried before that didn't work — and whose fault is it REALLY?",
      "Who or what is the 'villain' your audience blames for their struggles?",
    ],
  },
  {
    id: "four-question-close",
    name: "4-Question High-Ticket Close",
    secret: "Secret #18",
    section: "funnels",
    description: "A conversational sales script for high-ticket offers using 4 strategic questions.",
    icon: "PhoneCall",
    questions: [
      "What is the ultimate lifestyle result your high-ticket client wants?",
      "What is the typical price range of your high-ticket offer?",
      "What is the #1 reason someone would say 'not right now' — and what's the real cost of waiting?",
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

export const HERO_QUESTIONS: { key: keyof HeroProfile; label: string; placeholder: string; isTextarea?: boolean }[] = [
  { key: "name", label: "Your Name (the Expert)", placeholder: "e.g. Russell Brunson" },
  { key: "brand", label: "Brand / Company Name", placeholder: "e.g. I am Blessed AF" },
  { key: "niche", label: "Your Niche / Market", placeholder: "e.g. Gratitude & personal transformation" },
  { key: "audience", label: "Who is your dream customer?", placeholder: "e.g. Millennials who feel stuck and want deeper relationships" },
  { key: "originStory", label: "Your Origin Story (2-3 sentences)", placeholder: "e.g. I was burned out, anxious, and disconnected until I started a 3-day gratitude challenge that rewired my brain...", isTextarea: true },
  { key: "transformation", label: "The Core Transformation You Deliver", placeholder: "e.g. From feeling disconnected → to deep, meaningful relationships backed by neuroscience" },
  { key: "mechanism", label: "Your Unique Mechanism / Method", placeholder: "e.g. The 3-Day Gratitude Challenge using NFC wristbands + daily SMS prompts" },
  { key: "enemy", label: "The Enemy / Broken System You Fight", placeholder: "e.g. Surface-level self-help that never creates lasting change" },
  { key: "bigPromise", label: "Your Big Promise", placeholder: "e.g. Rewire your brain for gratitude in 72 hours — backed by Harvard research" },
  { key: "proof", label: "Your Best Proof / Results", placeholder: "e.g. 2,400+ participants, 11 meals donated per signup, 94% completion rate" },
];

// Viraj Srivastav — Active Skills
export enum SkillNames {
  // Languages
  JS = "js",
  TS = "ts",
  PYTHON = "python",
  // Frontend
  REACT = "react",
  NEXTJS = "nextjs",
  TAILWIND = "tailwind",
  // Backend
  NODEJS = "nodejs",
  EXPRESS = "express",
  SUPABASE = "supabase",
  // Databases
  POSTGRES = "postgres",
  MONGODB = "mongodb",
  // DevOps & Tools
  DOCKER = "docker",
  AWS = "aws",
  GIT = "git",
  GITHUB = "github",
  LINUX = "linux",
  VERCEL = "vercel",
}

export type Skill = {
  id: number;
  name: string;
  label: string;
  shortDescription: string;
  color: string;
  icon: string;
};

export const SKILLS: Record<SkillNames, Skill> = {
  // --- Languages ---
  [SkillNames.JS]: {
    id: 1,
    name: "js",
    label: "JavaScript",
    shortDescription: "The language of the web — making everything interactive since '95 🚀",
    color: "#f0db4f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  },
  [SkillNames.TS]: {
    id: 2,
    name: "ts",
    label: "TypeScript",
    shortDescription: "JavaScript with a safety net — catch bugs before they catch you 🔒",
    color: "#007acc",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
  },
  [SkillNames.PYTHON]: {
    id: 3,
    name: "python",
    label: "Python",
    shortDescription: "AI pipelines, automation, and clean scripts — the Swiss Army knife 🐍",
    color: "#3776ab",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  },
  // --- Frontend ---
  [SkillNames.REACT]: {
    id: 4,
    name: "react",
    label: "React",
    shortDescription: "Component-driven UIs that scale — the heart of modern frontend ⚛️",
    color: "#61dafb",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  },
  [SkillNames.NEXTJS]: {
    id: 5,
    name: "nextjs",
    label: "Next.js",
    shortDescription: "SSR, routing, and performance out of the box — React but serious 👑",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
  },
  [SkillNames.TAILWIND]: {
    id: 6,
    name: "tailwind",
    label: "Tailwind CSS",
    shortDescription: "Utility-first CSS that makes design fast and consistent 🎨",
    color: "#38bdf8",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg",
  },
  // --- Backend ---
  [SkillNames.NODEJS]: {
    id: 7,
    name: "nodejs",
    label: "Node.js",
    shortDescription: "JavaScript on the server — fast, async, and battle-tested ⚙️",
    color: "#6cc24a",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  },
  [SkillNames.EXPRESS]: {
    id: 8,
    name: "express",
    label: "Express.js",
    shortDescription: "Minimal and flexible Node.js web framework — REST APIs made easy 🚂",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg",
  },
  [SkillNames.SUPABASE]: {
    id: 9,
    name: "supabase",
    label: "Supabase",
    shortDescription: "Open-source Firebase alternative — Postgres + auth + realtime + edge 🔥",
    color: "#3ecf8e",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg",
  },
  // --- Databases ---
  [SkillNames.POSTGRES]: {
    id: 10,
    name: "postgres",
    label: "PostgreSQL",
    shortDescription: "The most powerful open-source relational DB — RLS, pgvector, and more 🐘",
    color: "#336791",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  },
  [SkillNames.MONGODB]: {
    id: 11,
    name: "mongodb",
    label: "MongoDB",
    shortDescription: "Flexible NoSQL for fast iteration and dynamic data structures 🍃",
    color: "#47a248",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  },
  // --- DevOps & Tools ---
  [SkillNames.DOCKER]: {
    id: 12,
    name: "docker",
    label: "Docker",
    shortDescription: "Pack it, ship it, run it anywhere — containerization done right 🐳",
    color: "#2496ed",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
  },
  [SkillNames.AWS]: {
    id: 13,
    name: "aws",
    label: "AWS",
    shortDescription: "Cloud infrastructure that scales with your product ☁️",
    color: "#ff9900",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg",
  },
  [SkillNames.GIT]: {
    id: 14,
    name: "git",
    label: "Git",
    shortDescription: "Version control — because good code deserves a time machine 🔄",
    color: "#f1502f",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
  },
  [SkillNames.GITHUB]: {
    id: 15,
    name: "github",
    label: "GitHub",
    shortDescription: "Where code lives, collabs happen, and portfolios get noticed 🐙",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg",
  },
  [SkillNames.LINUX]: {
    id: 16,
    name: "linux",
    label: "Linux",
    shortDescription: "The OS that powers servers, clouds, and developer desktops 🐧",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  },
  [SkillNames.VERCEL]: {
    id: 17,
    name: "vercel",
    label: "Vercel",
    shortDescription: "Deploy in seconds — the fastest way to ship frontend to production 🚀",
    color: "#fff",
    icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
  },
};

export const themeDisclaimers = {
  light: [
    "Warning: Light mode emits a gazillion lumens of pure radiance!",
    "Caution: Light mode ahead! Please don't try this at home.",
    "Only trained professionals can handle this much brightness. Proceed with sunglasses!",
    "Brace yourself! Light mode is about to make everything shine brighter than your future.",
    "Flipping the switch to light mode... Are you sure your eyes are ready for this?",
  ],
  dark: [
    "Light mode? I thought you went insane... but welcome back to the dark side!",
    "Switching to dark mode... How was life on the bright side?",
    "Dark mode activated! Thanks you from the bottom of my heart, and my eyes too.",
    "Welcome back to the shadows. How was life out there in the light?",
    "Dark mode on! Finally, someone who understands true sophistication.",
  ],
};

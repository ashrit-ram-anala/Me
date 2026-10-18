export const profile = {
  name: "Ashrit Anala",
  tagline: "SWE at Tesla, CS at Vanderbilt.",
  email: "ashritanala@gmail.com",
  links: {
    github: "https://github.com/ashrit-ram-anala",
    linkedin: "https://linkedin.com/in/ashritramanala",
  },
};

export const education = {
  school: "Vanderbilt University",
  college: "School of Engineering",
  degree: "B.S. Computer Science",
  honors: "Crescere Aude Scholar",
  coursework: [
    "Data Structures",
    "Algorithms",
    "Software Design",
    "Database Management",
    "Computer Architecture",
    "Discrete Structures",
    "Data Science in Python & R",
    "CS Ethics",
    "Operating Systems",
    "Software Architecture",
    "Computer Networks",
    "Programming Languages",
  ],
  organizations: ["Change++", "VandyHacks", "VAPS", "Claude Builder Club"],
};

export type Theme = "f1" | "oppenheimer" | "space" | "cali" | "anime" | "pingpong";

export type Experience = {
  company: string;
  role: string;
  year: string;
  logo: string;
  /** brand color, used as the F1 "team" stripe */
  team: string;
  /** whether the colored logo is a full tile (cover) or a mark on transparency */
  fill: "cover" | "contain";
  /** the world this row bursts into on hover */
  theme: Theme;
};

export const experience: Experience[] = [
  { company: "Tesla", role: "Software Engineer Intern", year: "May 2027 – Aug 2027", logo: "tesla", team: "#e31937", fill: "cover", theme: "f1" },
  { company: "Tesla", role: "Software Engineer Intern", year: "Jan 2026 – Current", logo: "tesla", team: "#e31937", fill: "cover", theme: "anime" },
  { company: "IBM", role: "AI Engineer Fellowship", year: "Sep 2025 – Dec 2025", logo: "ibm", team: "#0f62fe", fill: "cover", theme: "oppenheimer" },
  { company: "Fidelity Investments", role: "Software Engineer Intern", year: "Jun 2025 – Aug 2025", logo: "fidelity", team: "#368727", fill: "contain", theme: "space" },
  { company: "Foster Source", role: "Full Stack Developer", year: "Sep 2024 – May 2025", logo: "fostersource", team: "#f08a24", fill: "cover", theme: "cali" },
  { company: "Change++", role: "President, Engineering Manager, Full Stack Developer", year: "Sep 2024 – Current", logo: "changepp", team: "#2c7fb8", fill: "contain", theme: "pingpong" },
];

export type Project = {
  name: string;
  context: string;
  year: string;
  stack: string[];
  href: string;
  shot: string;
};

export const projects: Project[] = [
  {
    name: "TCBA",
    context: "Tennessee Coalition for Better Aging",
    year: "2025",
    stack: ["React", "Node", "PostgreSQL", "Redis", "SES", "S3", "EC2", "Clerk"],
    href: "https://github.com/ChangePlusPlusVandy/tcba",
    shot: "tcba",
  },
  {
    name: "Data Cleaning Pipeline",
    context: "IBM watsonx capstone",
    year: "2025",
    stack: ["watsonx", "Angular", "PostgreSQL", "FastAPI", "Pandas"],
    href: "https://github.com/ashrit-ram-anala/IBMWatsonCapstone",
    shot: "pipeline",
  },
  {
    name: "Smart Stock",
    context: "VandyHacks XI",
    year: "2024",
    stack: ["React", "Flask", "Tailwind", "TextBlob"],
    href: "https://github.com/ashrit-ram-anala/VandyHacks-XI-Project",
    shot: "smartstock",
  },
  {
    name: "Foster Source LMS",
    context: "Change++",
    year: "2024",
    stack: ["React", "Node", "MongoDB", "Firebase", "Stripe API"],
    href: "https://github.com/ChangePlusPlusVandy/fostersource",
    shot: "fostersource",
  },
];

export const stack: { group: string; items: { name: string; logo: string }[] }[] = [
  {
    group: "Languages",
    items: [
      { name: "TypeScript", logo: "typescript" },
      { name: "JavaScript", logo: "javascript" },
      { name: "Java", logo: "java" },
      { name: "Python", logo: "python" },
      { name: "Go", logo: "go" },
      { name: "C", logo: "c" },
      { name: "C++", logo: "cpp" },
      { name: "R", logo: "r" },
    ],
  },
  {
    group: "Frameworks",
    items: [
      { name: "React", logo: "react" },
      { name: "Next.js", logo: "next" },
      { name: "Angular", logo: "angular" },
      { name: "Svelte", logo: "svelte" },
      { name: "Node.js", logo: "node" },
      { name: "Express", logo: "express" },
      { name: "Spring Boot", logo: "spring" },
      { name: "Flask", logo: "flask" },
    ],
  },
  {
    group: "Infrastructure",
    items: [
      { name: "AWS", logo: "aws" },
      { name: "Docker", logo: "docker" },
      { name: "Kubernetes", logo: "kubernetes" },
      { name: "Jenkins", logo: "jenkins" },
      { name: "PostgreSQL", logo: "postgres" },
      { name: "MongoDB", logo: "mongodb" },
      { name: "Redis", logo: "redis" },
      { name: "Firebase", logo: "firebase" },
    ],
  },
];

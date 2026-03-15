export interface Project {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  longDescription?: string;
  githubOwner?: string;
  githubRepo?: string;
  branch?: string;
  techStack: string[];
  banner?: string;
  featured: boolean;
  status: "active" | "completed" | "research";
  liveUrl?: string;
  order: number;
  views: number;
  architectureUrl?: string;
  architectureDiagram?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  _id: string;
  title: string;
  organization?: string;
  type: "hackathon" | "award" | "internship" | "competition" | "research" | "other";
  description?: string;
  impact?: string;
  proofUrl?: string;
  date?: string;
  tags: string[];
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface Certificate {
  _id: string;
  title: string;
  issuer?: string;
  issueDate?: string;
  category: "programming" | "ai" | "cloud" | "systems" | "design" | "other";
  skills: string[];
  imageUrl?: string;
  pdfUrl?: string;
  verificationUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

export interface Experience {
  _id: string;
  organization: string;
  role: string;
  type: "internship" | "full-time" | "part-time" | "freelance" | "research" | "volunteer";
  startDate?: string;
  endDate?: string;
  current: boolean;
  description?: string;
  technologies: string[];
  impactMetrics: string[];
  logoUrl?: string;
  order: number;
  createdAt: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  lang?: string;
}

export interface Skill {
  _id: string;
  name: string;
  category: "ai-ml" | "full-stack" | "systems" | "power" | "competitive" | "tools" | "other";
  proficiency: number; // 1-5
  iconUrl?: string;
  order: number;
  featured: boolean;
  createdAt: string;
}

export interface PhilosophyEntry {
  title: string;
  description: string;
}

export interface ContactLink {
  label: string;
  href: string;
  icon: string;
  color: string;
}

export interface Profile {
  _id: string;
  name: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  resumeUrl: string;
  philosophy: PhilosophyEntry[];
  links: ContactLink[];
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  coverUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Highlight {
  _id: string;
  projectSlug: string;
  filePath: string;
  title: string;
  description?: string;
  tag: "architecture" | "performance" | "ai-logic" | "security" | "core" | "other";
  startLine?: number;
  endLine?: number;
  order: number;
  createdAt: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  role?: string;
  organization?: string;
  quote: string;
  avatarUrl?: string;
  linkedinUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
}

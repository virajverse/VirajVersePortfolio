"use client";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalTrigger,
} from "../ui/animated-modal";
import { FloatingDock } from "../ui/floating-dock";
import { PinContainer } from "../ui/3d-pin";
import Link from "next/link";
import SmoothScroll from "../smooth-scroll";
import { Project } from "@/data/projects";
import staticProjects from "@/data/projects";
import { cn } from "@/lib/utils";

// ─── Skill chip map (same as projects.tsx) ────────────────────
import { RiNextjsFill, RiNodejsFill, RiReactjsFill } from "react-icons/ri";
import {
  SiDocker, SiExpress, SiFirebase, SiJavascript, SiMongodb,
  SiPostgresql, SiPython, SiSupabase, SiTailwindcss, SiThreedotjs,
  SiTypescript, SiVuedotjs, SiVite, SiNetlify, SiHtml5, SiCss3,
  SiBootstrap, SiShadcnui, SiSanity, SiPrisma, SiReactquery,
  SiSocketdotio,
} from "react-icons/si";
import { TbBrandFramerMotion } from "react-icons/tb";
import AceTernityLogo from "../logos/aceternity";
import { ReactNode } from "react";

type SkillChip = { title: string; bg: string; fg: string; icon: ReactNode };

const SKILL_MAP: Record<string, SkillChip> = {
  next:         { title: "Next.js",        bg: "black", fg: "white", icon: <RiNextjsFill /> },
  node:         { title: "Node.js",        bg: "black", fg: "white", icon: <RiNodejsFill /> },
  react:        { title: "React.js",       bg: "black", fg: "white", icon: <RiReactjsFill /> },
  ts:           { title: "TypeScript",     bg: "black", fg: "white", icon: <SiTypescript /> },
  js:           { title: "JavaScript",     bg: "black", fg: "white", icon: <SiJavascript /> },
  python:       { title: "Python",         bg: "black", fg: "white", icon: <SiPython /> },
  tailwind:     { title: "Tailwind",       bg: "black", fg: "white", icon: <SiTailwindcss /> },
  supabase:     { title: "Supabase",       bg: "black", fg: "white", icon: <SiSupabase /> },
  postgres:     { title: "PostgreSQL",     bg: "black", fg: "white", icon: <SiPostgresql /> },
  mongo:        { title: "MongoDB",        bg: "black", fg: "white", icon: <SiMongodb /> },
  express:      { title: "Express",        bg: "black", fg: "white", icon: <SiExpress /> },
  docker:       { title: "Docker",         bg: "black", fg: "white", icon: <SiDocker /> },
  firebase:     { title: "Firebase",       bg: "black", fg: "white", icon: <SiFirebase /> },
  vite:         { title: "Vite",           bg: "black", fg: "white", icon: <SiVite /> },
  vue:          { title: "Vue.js",         bg: "black", fg: "white", icon: <SiVuedotjs /> },
  framerMotion: { title: "Framer Motion",  bg: "black", fg: "white", icon: <TbBrandFramerMotion /> },
  shadcn:       { title: "ShadCN UI",      bg: "black", fg: "white", icon: <SiShadcnui /> },
  netlify:      { title: "Netlify",        bg: "black", fg: "white", icon: <SiNetlify /> },
  html:         { title: "HTML5",          bg: "black", fg: "white", icon: <SiHtml5 /> },
  css:          { title: "CSS3",           bg: "black", fg: "white", icon: <SiCss3 /> },
  bootstrap:    { title: "Bootstrap",      bg: "black", fg: "white", icon: <SiBootstrap /> },
  spline:       { title: "Spline",         bg: "black", fg: "white", icon: <SiThreedotjs /> },
  sanity:       { title: "Sanity",         bg: "black", fg: "white", icon: <SiSanity /> },
  prisma:       { title: "Prisma",         bg: "black", fg: "white", icon: <SiPrisma /> },
  openai:       { title: "OpenAI",         bg: "black", fg: "white",
    icon: <img src="/assets/icons/openai-svgrepo-com_white.svg" alt="OpenAI" className="w-4 h-4" /> },
  aceternity:   { title: "Aceternity",     bg: "black", fg: "white", icon: <AceTernityLogo /> },
};

function resolveSkills(skills: string[]): SkillChip[] {
  return skills.map((s) => SKILL_MAP[s] ?? { title: s, bg: "black", fg: "white", icon: null });
}

// ─── Image Slideshow / Carousel Component ────────────────────
const ImageCarousel = ({ images }: { images: string[] }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = images.length - 1;
      if (nextIndex >= images.length) nextIndex = 0;
      return nextIndex;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1); // Auto slide right to left
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80 group">
      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={index}
          src={images[index]}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="absolute inset-0 w-full h-full object-cover select-none"
        />
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        type="button"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm z-10"
        onClick={() => paginate(-1)}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 border border-zinc-800 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm z-10"
        onClick={() => paginate(1)}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === index ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"
            }`}
            onClick={() => {
              setDirection(idx > index ? 1 : -1);
              setIndex(idx);
            }}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Convert raw JSON project → Project shape ─────────────────
function buildProject(p: any): Project {
  // Determine suitable mockup images based on category
  let screenshotList: string[] = [];
  
  if (p.category === "AI Engineering") {
    screenshotList = [
      "/assets/projects-screenshots/mockups/code-editor.png",
      "/assets/projects-screenshots/mockups/dashboard.png",
      "/assets/projects-screenshots/mockups/mobile-app.png"
    ];
  } else if (p.category === "SaaS" || p.category === "Full-Stack Marketplace") {
    screenshotList = [
      "/assets/projects-screenshots/mockups/dashboard.png",
      "/assets/projects-screenshots/mockups/code-editor.png",
      "/assets/projects-screenshots/mockups/mobile-app.png"
    ];
  } else { // Web Development, Productivity, etc.
    screenshotList = [
      "/assets/projects-screenshots/mockups/mobile-app.png",
      "/assets/projects-screenshots/mockups/dashboard.png",
      "/assets/projects-screenshots/mockups/code-editor.png"
    ];
  }

  const isDefaultImage = !p.imageSrc || p.imageSrc.includes("default.png");
  const coverImage = isDefaultImage ? screenshotList[0] : p.imageSrc;
  const finalScreenshots = (p.screenshots && p.screenshots.length > 0)
    ? p.screenshots
    : (isDefaultImage ? screenshotList : [p.imageSrc, ...screenshotList]);

  return {
    id: p.id,
    category: p.category,
    title: p.title,
    src: coverImage,
    screenshots: finalScreenshots,
    live: p.live,
    github: p.github,
    skills: { frontend: resolveSkills(p.skills ?? []), backend: [] },
    get content() {
      return (
        <div>
          <p className="font-mono mb-4">{p.description}</p>
          <div className="flex gap-3 mb-6">
            <a href={p.live} target="_blank" rel="noopener"
              className="bg-white text-black text-sm px-4 py-1.5 rounded-md font-medium hover:opacity-80 transition">
              Visit Site ↗
            </a>
            {p.github && (
              <a href={p.github} target="_blank" rel="noopener"
                className="border border-zinc-600 text-sm px-4 py-1.5 rounded-md hover:bg-zinc-800 transition">
                GitHub ↗
              </a>
            )}
          </div>

          {/* Screenshot Showcase Slide Show */}
          {finalScreenshots.length > 0 && (
            <div className="my-6">
              <h3 className="font-semibold text-base mb-3 text-neutral-200">Screenshots & UI Design</h3>
              <ImageCarousel images={finalScreenshots} />
            </div>
          )}

          {(p.highlights ?? []).map((s: any) => (
            <div key={s.heading}>
              <h3 className="font-semibold text-lg mt-6 mb-2">{s.heading}</h3>
              <ul className="list-disc ml-5 space-y-1">
                {s.points.map((pt: string, i: number) => (
                  <li key={i} className="font-mono text-sm text-zinc-300">{pt}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    },
  };
}

// ─── Main Section ─────────────────────────────────────────────
const ProjectsSection = () => {
  const [projects, setProjects] = useState<Project[]>(staticProjects);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data: any[]) => {
        if (data?.length) setProjects(data.map(buildProject));
      })
      .catch(() => {/* keep static fallback */});
  }, []);

  useEffect(() => {
    if (!projects || projects.length === 0) return;

    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Desktop layout (1024px and wider)
      mm.add("(min-width: 1024px)", () => {
        const cards = cardsRef.current;
        const section = sectionRef.current;
        const title = titleRef.current;
        if (!cards || !section || !title) return;

        // Calculate dynamic horizontal translation distance
        const totalScrollDistance = cards.scrollWidth - window.innerWidth + 200;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: "top top",
            end: () => `+=${totalScrollDistance}`,
            invalidateOnRefresh: true,
          },
        });

        // Cards move to the left (bai taraf)
        tl.to(
          cards,
          {
            x: () => -(cards.scrollWidth - window.innerWidth + 100),
            ease: "none",
          },
          0
        );

        // Title/Heading moves to the right (dai taraf)
        tl.to(
          title,
          {
            x: () => window.innerWidth * 0.45,
            ease: "none",
          },
          0
        );
      });
    });

    // Force a ScrollTrigger refresh after a tiny tick to make sure DOM sizes are painted and stable
    const t = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      ctx.revert();
      clearTimeout(t);
    };
  }, [projects]);

  return (
    <>
      {/* Mobile Layout (Normal vertical grid) */}
      <section id="projects" className="lg:hidden max-w-7xl mx-auto min-h-screen pb-32 px-4 md:px-8">
        <Link href={"#projects"}>
          <h2 className={cn(
            "bg-clip-text text-4xl text-center text-transparent md:text-7xl pt-16",
            "bg-gradient-to-b from-black/80 to-black/50",
            "dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20 dark:bg-opacity-50 mb-16"
          )}>
            Projects
          </h2>
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <Modall key={project.id} project={project} />
          ))}
        </div>
      </section>

      {/* Desktop Layout (Horizontal scroll pinned section) */}
      <section
        ref={sectionRef}
        id="projects-desktop"
        className="hidden lg:block relative w-full h-[300vh] bg-transparent overflow-hidden"
      >
        <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
          {/* Moving Title - Slides to the Right */}
          <div ref={titleRef} className="absolute top-24 left-24 z-10">
            <Link href={"#projects-desktop"}>
              <h2 className={cn(
                "bg-clip-text text-8xl font-extrabold text-transparent select-none",
                "bg-gradient-to-b from-black/80 to-black/50",
                "dark:bg-gradient-to-b dark:from-white/80 dark:to-white/20 dark:bg-opacity-50"
              )}>
                Projects
              </h2>
            </Link>
          </div>

          {/* Horizontal Track wrapper */}
          <div className="w-full flex items-center justify-start mt-20">
            <div
              ref={cardsRef}
              className="flex gap-16 px-[15vw] flex-row items-center flex-nowrap"
            >
              {projects.map((project) => (
                <div key={project.id} className="flex-shrink-0 w-[420px]">
                  <Modall project={project} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

// ─── Modal Card ───────────────────────────────────────────────
const Modall = ({ project }: { project: Project }) => {
  const [imageError, setImageError] = useState(false);
  const isDefaultImage = !project.src || project.src.includes("default.png");

  const cleanLiveUrl = project.live
    ? project.live.replace("https://", "").replace("www.", "").split("/")[0]
    : "view live";

  return (
    <div className="flex items-center justify-center w-[420px] h-[340px]">
      <Modal>
        <ModalTrigger className="bg-transparent flex justify-center w-full h-full relative z-10">
          <PinContainer
            title={cleanLiveUrl}
            href={project.live}
            containerClassName="w-full h-full flex items-center justify-center"
          >
            <div className="relative w-[340px] h-[220px] rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-900 flex-shrink-0">
              {(!isDefaultImage && !imageError) ? (
                <img
                  className="absolute w-full h-full top-0 left-0 hover:scale-[1.05] transition-all object-cover"
                  src={project.src}
                  alt={project.title}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-black flex items-center justify-center border-b border-zinc-800/50">
                  <div className="text-center flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg select-none">
                      {project.title.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
              <div className="absolute w-full h-1/2 bottom-0 left-0 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none">
                <div className="flex flex-col h-full items-start justify-end p-4">
                  <div className="text-sm text-left text-white font-semibold truncate w-full">{project.title}</div>
                  <div className="text-[10px] bg-white text-black rounded px-1.5 py-0.5 mt-1">{project.category}</div>
                </div>
              </div>
            </div>
          </PinContainer>
        </ModalTrigger>
        <ModalBody className="md:max-w-4xl md:max-h-[90vh]">
          <ModalContent>
            <ProjectContents project={project} />
          </ModalContent>
          <ModalFooter className="gap-4">
            <button className="px-2 py-1 bg-gray-200 text-black dark:bg-black dark:border-black dark:text-white border border-gray-300 rounded-md text-sm w-28">
              Cancel
            </button>
            <Link href={project.live} target="_blank">
              <button className="bg-black text-white dark:bg-white dark:text-black text-sm px-2 py-1 rounded-md border border-black w-28">
                Visit
              </button>
            </Link>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
};

const ProjectContents = ({ project }: { project: Project }) => {
  return (
    <>
      <h4 className="text-lg md:text-2xl text-neutral-600 dark:text-neutral-100 font-bold text-center mb-8">
        {project.title}
      </h4>
      <div className="flex flex-col md:flex-row md:justify-evenly max-w-screen overflow-hidden md:overflow-visible">
        <div className="flex flex-row md:flex-col-reverse justify-center items-center gap-2 text-3xl mb-8">
          <p className="text-sm mt-1 text-neutral-600 dark:text-neutral-500">Tech Stack</p>
          {project.skills.frontend?.length > 0 && <FloatingDock items={project.skills.frontend} />}
        </div>
      </div>
      {project.content}
    </>
  );
};

export default ProjectsSection;

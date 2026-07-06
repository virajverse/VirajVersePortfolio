const config = {
  title: "VirajVerse Portfolio",
  description: {
    long: "Explore the portfolio of Viraj Srivastav — AI Systems Engineer, Full-Stack Developer, and Co-founder of Taliyo Technologies. Specialized in building production-grade AI systems, SaaS platforms, multi-provider LLM orchestration, RAG pipelines, and real-time web applications using React, Next.js, Node.js, Python, and Supabase.",
    short:
      "Portfolio of Viraj Srivastav — AI Systems Engineer & Full-Stack Developer building intelligent software and scalable digital products.",
  },
  keywords: [
    "Viraj Srivastav",
    "virajsrivastav",
    "virajverse",
    "Viraj Srivastav portfolio",
    "AI Systems Engineer",
    "Full Stack Developer",
    "Product Builder",
    "Taliyo Technologies",
    "RAG",
    "LLM",
    "AI Engineer",
    "SaaS",
    "Next.js",
    "React",
    "Supabase",
    "Node.js",
    "web development",
    "AI applications",
    "digital products",
    "Delhi developer",
  ],
  author: "Viraj Srivastav",
  email: "virajsrivastav016@gmail.com",
  phone: "+91-7042793133",
  resume: "https://drive.google.com/file/d/12j4AHrb8mpzjUR-Qo075W-Vnt-MoQ2Ed/view?usp=sharing",
  site: "https://virajverseportfolio.vercel.app",

  get ogImg() {
    return this.site + "/assets/seo/og-image.png";
  },
  social: {
    twitter: "https://x.com/fearless_devx", // update if different
    linkedin: "https://linkedin.com/in/viraj-srivastav",
    instagram: "https://instagram.com/fearless.devx",
    github: "https://github.com/virajverse",
  },
};
export { config };

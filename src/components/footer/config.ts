import { config } from "@/data/config";

const footer: { title: string; href: string }[] = [
  {
    title: "Company",
    href: config.site,
  },
  {
    title: "GitHub",
    href: config.social.github,
  },
];

export { footer };

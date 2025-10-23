import { type IconType } from "react-icons";
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiVueDotJs,
  SiSvelte,
  SiNextdotjs,
  SiNx,
  SiFlask,
  SiTailwindcss,
  SiExpress,
} from "react-icons/si";

export type TechKey =
  | "Python"
  | "JavaScript"
  | "TypeScript"
  | "React"
  | "Vue"
  | "Svelte"
  | "Next.js"
  | "Nx"
  | "Flask"
  | "TailwindCSS"
  | "Express";

const iconMap: Record<TechKey, IconType> = {
  Python: SiPython,
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  React: SiReact,
  Vue: SiVueDotJs,
  Svelte: SiSvelte,
  "Next.js": SiNextdotjs,
  Nx: SiNx,
  Flask: SiFlask,
  TailwindCSS: SiTailwindcss,
  Express: SiExpress,
};

export function getTechIcon(key: TechKey): IconType | undefined {
  return iconMap[key];
}

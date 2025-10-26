import { type IconType } from 'react-icons';
import {
  SiPython,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiVuedotjs,
  SiSvelte,
  SiNextdotjs,
  SiNx,
  SiFlask,
  SiTailwindcss,
  SiExpress,
  SiGo,
} from 'react-icons/si';

export type TechKey =
  | 'Python'
  | 'JavaScript'
  | 'TypeScript'
  | 'Go'
  | 'React'
  | 'Vue'
  | 'Svelte'
  | 'Next.js'
  | 'Nx'
  | 'Flask'
  | 'TailwindCSS'
  | 'Express';

const iconMap: Record<TechKey, IconType> = {
  Python: SiPython,
  JavaScript: SiJavascript,
  TypeScript: SiTypescript,
  Go: SiGo,
  React: SiReact,
  Vue: SiVuedotjs,
  Svelte: SiSvelte,
  'Next.js': SiNextdotjs,
  Nx: SiNx,
  Flask: SiFlask,
  TailwindCSS: SiTailwindcss,
  Express: SiExpress,
};

export function getTechIcon(key: TechKey): IconType | undefined {
  return iconMap[key];
}

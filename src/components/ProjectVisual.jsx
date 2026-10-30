import LogoNewGears from './LogoNewGears';

export default function ProjectVisual({ src, title }) {
  return src ? <img src={src} alt={title} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
    : <div className="ng-project-visual"><div aria-hidden="true"><LogoNewGears /></div><p>Ideias que movem o futuro.</p><span>Pesquisa · Robótica · Colaboração</span></div>;
}

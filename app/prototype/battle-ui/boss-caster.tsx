import { useId } from 'react';
import type { BossSkillId } from './demo-model';

const SOURCE = '/battle-ui/gatekeeper.png';
// Mask geometry only. All visible armor / skin pixels come from the approved illustration.
const ARM = '155,606 196,617 233,650 241,704 234,748 208,787 194,832 197,893 184,948 160,978 110,990 57,984 15,958 0,918 0,805 36,752 78,700 121,648';

export function BossCaster({ active, skill }: { active: boolean; skill: BossSkillId }) {
  const id = useId().replaceAll(':', '');
  return <div className="bu-boss-art" data-casting={active} data-motion={skill} role="img" aria-label="敌方：雾港守门人">
    <img className="bu-boss-rest" src={SOURCE} alt="" draggable={false} aria-hidden="true"/>
    <svg className="bu-boss-rig" viewBox="0 0 1024 1536" aria-hidden="true">
      <defs>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1536"><rect width="1024" height="1536" fill="white"/><polygon points={ARM} fill="black"/></mask>
        <clipPath id={`${id}-arm`}><polygon points={ARM}/></clipPath>
        <clipPath id={`${id}-seam`}><polygon points="162,613 194,622 230,657 237,709 215,743 188,714 166,675"/></clipPath>
      </defs>
      <g className="bu-boss-body">
        <image href="/battle-ui/gatekeeper-seam-source.png" width="1024" height="1536" clipPath={`url(#${id}-seam)`}/>
        <image href={SOURCE} width="1024" height="1536" mask={`url(#${id}-body)`}/>
        <g className="bu-boss-arm"><image href={SOURCE} width="1024" height="1536" clipPath={`url(#${id}-arm)`}/></g>
      </g>
    </svg>
  </div>;
}

export function BossIcon({ id }: { id: BossSkillId }) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {id === 'fist' ? <><path d="m8 5 6 1 4 7-6 5-6-5Z M13 17l7 10 6-5-8-9"/><path d="m23 6 3-3M25 12h4M5 21l-3 4"/></>
      : <><path d="m17 2-9 14h7l-2 10 11-15h-8Z"/><path d="m3 26 5-3 3 5 5-1 4 3 5-6 4 2"/></>}
  </svg>;
}

export function BossEffect({ skill }: { skill: BossSkillId }) {
  return <div className={`bu-boss-show bu-boss-show-${skill}`} aria-hidden="true">
    <span className="bu-boss-charge"/><span className="bu-boss-path"/>
    <img className="bu-boss-burst" src="/battle-ui/guardian-impact.png" alt="" draggable={false}/>
    {skill === 'quake' && <><span className="bu-quake-front"/><span className="bu-quake-aftershock"/></>}
    <span className="bu-boss-hit"/><span className="bu-boss-ground"/>
    <span className="bu-boss-sparks"><i/><i/><i/><i/><i/><i/></span>
  </div>;
}

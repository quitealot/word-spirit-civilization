import type { BossSkillId, SkillId } from './demo-model';

/** Art-only layers. Neither frame playback nor a hit accent can settle combat. */
export function CastCinematic({ enemy, name }: { enemy: boolean; name: string }) {
  return <>
    <div className={`bu-cinematic-light ${enemy ? 'bu-cinematic-gold' : ''}`} aria-hidden="true"/>
    <div className={`bu-cut-in ${enemy ? 'bu-cut-in-enemy' : ''}`} aria-hidden="true">
      <img src={enemy ? '/battle-ui/gatekeeper.png' : '/battle-ui/lange-cutout.png'} alt="" draggable={false}/>
      <div><small>{enemy ? '守门人' : '澜歌'}</small><strong>{name}</strong></div>
    </div>
    <div className={`bu-velocity ${enemy ? 'bu-velocity-enemy' : ''}`} aria-hidden="true"/>
  </>;
}

export function ImpactFrames({ enemy, skill }: { enemy: boolean; skill: SkillId | BossSkillId }) {
  const healing = skill === 'wave';
  return <div className={`bu-impact-sequence ${enemy ? 'bu-impact-sequence-stone' : 'bu-impact-sequence-water'} bu-impact-${skill}`} aria-hidden="true">
    <div className="bu-frame-anchor"><span className="bu-frame-sprite"/></div>
    {!healing && <span className="bu-contact-lens"/>}
    <span className="bu-impact-halo"/>
  </div>;
}

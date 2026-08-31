import { useId } from 'react';

const SOURCE = '/battle-ui/lange-cutout.png';
// Geometry only: these masks reveal existing artwork, never draw a replacement character.
const ARM = '477,551 498,561 480,602 451,634 421,665 409,691 394,712 381,726 369,724 360,740 337,738 326,725 331,701 343,680 378,656 416,614 448,572';

export function WaterCaster({ active }: { active: boolean }) {
  const id = useId().replaceAll(':', '');
  return <div className="bu-caster-art" data-casting={active} role="img" aria-label="出战语灵：澜歌">
    <img className="bu-caster-rest" src={SOURCE} alt="" draggable={false} aria-hidden="true"/>
    <svg className="bu-caster-rig" viewBox="0 0 1254 1254" aria-hidden="true">
      <defs>
        <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="1254" height="1254">
          <rect width="1254" height="1254" fill="white"/><polygon points={ARM} fill="black"/>
        </mask>
        <clipPath id={`${id}-arm`}><polygon points={ARM}/></clipPath>
        <clipPath id={`${id}-shoulder`}><polygon points="476,550 493,549 510,567 501,602 487,597 479,575"/></clipPath>
      </defs>
      <g className="bu-caster-body">
        <image href="/battle-ui/lange-shoulder-source.png" width="1254" height="1254" clipPath={`url(#${id}-shoulder)`}/>
        <image href={SOURCE} width="1254" height="1254" mask={`url(#${id}-body)`}/>
        <g className="bu-caster-arm"><image href={SOURCE} width="1254" height="1254" clipPath={`url(#${id}-arm)`}/></g>
      </g>
    </svg>
  </div>;
}

export function WaterSurge() {
  return <div className="bu-water-show" aria-hidden="true">
    <span className="bu-water-gather"/><span className="bu-water-orbit"/>
    <img className="bu-water-surge" src="/battle-ui/water-surge.png" alt="" draggable={false}/>
    <span className="bu-water-contact"/>
    <span className="bu-water-motes"><i/><i/><i/><i/><i/><i/></span>
  </div>;
}

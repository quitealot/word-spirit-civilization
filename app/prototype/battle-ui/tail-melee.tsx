import { useId } from 'react';
import { BATTLE_IDLE_ASSET, RUN_POSE_ASSET, TAIL_POSE_ASSET } from './tail-melee-motion';

export function TailMeleeActor({ posesReady }: { posesReady: boolean }) {
  const clipBase = useId().replaceAll(':', '');
  return <div className="jf-tail-actor" role="img" aria-label="烬尾跑近、甩尾攻击后跳回原位" data-poses={posesReady}>
    <img className="jf-tail-rest" src={BATTLE_IDLE_ASSET} alt="" draggable={false}/>
    {posesReady && ['run-a', 'run-b', 'swipe', 'jump'].map((pose, index) => {
      const clipId = `${clipBase}-${pose}`;
      return <svg key={pose} className={`jf-tail-pose jf-pose-${pose}`} viewBox="0 0 1024 1024" overflow="hidden" aria-hidden="true">
        <defs><clipPath id={clipId}><rect width="1024" height="1024"/></clipPath></defs>
        <g clipPath={`url(#${clipId})`}>{index < 2
          ? <image href={RUN_POSE_ASSET} x={-index * 1024} y="0" width="2048" height="1024"/>
          : <image href={TAIL_POSE_ASSET} x={-(index % 2) * 1024} y={-Math.floor(index / 2) * 1024} width="2048" height="2048"/>}</g>
      </svg>;
    })}
  </div>;
}

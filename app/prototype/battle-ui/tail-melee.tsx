import { useId } from 'react';
import { TAIL_POSE_ASSET } from './tail-melee-motion';

export function TailMeleeActor({ posesReady }: { posesReady: boolean }) {
  const clipBase = useId().replaceAll(':', '');
  return <div className="jf-tail-actor" role="img" aria-label="烬尾跑近、甩尾攻击后跳回原位" data-poses={posesReady}>
    <img className="jf-tail-rest" src="/battle-ui/jinwei-cutout-v1.png" alt="" draggable={false}/>
    {posesReady && ['run-a', 'run-b', 'swipe', 'jump'].map((pose, index) => {
      const clipId = `${clipBase}-${pose}`;
      return <svg key={pose} className={`jf-tail-pose jf-pose-${pose}`} viewBox="0 0 1024 1024" overflow="hidden" aria-hidden="true">
        <defs><clipPath id={clipId}><rect width="1024" height="1024"/></clipPath></defs>
        <g clipPath={`url(#${clipId})`}><image href={TAIL_POSE_ASSET} x={-(index % 2) * 1024} y={-Math.floor(index / 2) * 1024} width="2048" height="2048"/></g>
      </svg>;
    })}
  </div>;
}

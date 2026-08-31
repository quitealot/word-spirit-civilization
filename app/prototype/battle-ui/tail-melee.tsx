import { TAIL_POSE_ASSET } from './tail-melee-motion';

export function TailMeleeActor({ posesReady }: { posesReady: boolean }) {
  return <div className="jf-tail-actor" role="img" aria-label="烬尾跑近、甩尾攻击后跳回原位" data-poses={posesReady}>
    <img className="jf-tail-rest" src="/battle-ui/jinwei-cutout-v1.png" alt="" draggable={false}/>
    {posesReady && ['run-a', 'run-b', 'swipe', 'jump'].map((pose, index) => <svg key={pose} className={`jf-tail-pose jf-pose-${pose}`} viewBox="0 0 1024 1024" aria-hidden="true"><image href={TAIL_POSE_ASSET} x={-(index % 2) * 1024} y={-Math.floor(index / 2) * 1024} width="2048" height="2048"/></svg>)}
  </div>;
}

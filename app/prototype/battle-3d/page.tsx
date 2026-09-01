'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import './battle-3d.css';

type BattlePhase = 'ready' | 'gather' | 'release' | 'impact' | 'recover';

const PHASE_COPY: Record<BattlePhase, string> = {
  ready: '雾潮静止，等待你的指令。',
  gather: '澜歌合掌吟唱，四周水汽正在回应。',
  release: '水音越过遗迹，汇成一道潮汐锋线。',
  impact: '命中 · 守门人的石甲被水压震开。',
  recover: '余波退去，澜歌重新站稳。',
};

function RuinPillar({ x, z, height, broken = false }: { x: number; z: number; height: number; broken?: boolean }) {
  return (
    <group position={[x, height / 2 - 0.28, z]} rotation={[0, broken ? 0.18 : 0, broken ? -0.08 : 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.42, height, 7]} />
        <meshStandardMaterial color="#344d42" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh position={[0, height / 2 + 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.43, 0.37, 0.18, 7]} />
        <meshStandardMaterial color="#947e4d" roughness={0.78} metalness={0.18} />
      </mesh>
    </group>
  );
}

function Lange({ phase }: { phase: BattlePhase }) {
  const root = useRef<THREE.Group>(null);
  const waterCore = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!root.current || !waterCore.current) return;
    const gathering = phase === 'gather' || phase === 'release';
    root.current.position.y = Math.sin(t * 1.8) * 0.035 + (gathering ? 0.08 : 0);
    root.current.rotation.z = gathering ? Math.sin(t * 4) * 0.012 - 0.04 : Math.sin(t) * 0.008;
    const pulse = gathering ? 1.2 + Math.sin(t * 7) * 0.18 : 0.65 + Math.sin(t * 2) * 0.05;
    waterCore.current.scale.setScalar(pulse);
  });

  return (
    <group ref={root} position={[-2.45, 0, 0]} rotation={[0, 0.36, 0]}>
      <mesh position={[0, 0.23, 0]} castShadow>
        <coneGeometry args={[0.62, 1.45, 10, 2, false]} />
        <meshStandardMaterial color="#164b58" roughness={0.55} metalness={0.16} />
      </mesh>
      <mesh position={[0, 1.07, 0]} castShadow>
        <sphereGeometry args={[0.32, 20, 16]} />
        <meshStandardMaterial color="#78c6cb" roughness={0.4} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.18, 0.06]} rotation={[0.15, 0, 0]} castShadow>
        <coneGeometry args={[0.4, 0.9, 8, 1, true]} />
        <meshStandardMaterial color="#1d5968" roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.27, 0.78, 0]} rotation={[0, 0, phase === 'gather' ? -1.05 : -0.5]} castShadow>
        <capsuleGeometry args={[0.085, 0.58, 6, 10]} />
        <meshStandardMaterial color="#55aeb9" roughness={0.42} />
      </mesh>
      <mesh position={[-0.27, 0.78, 0]} rotation={[0, 0, phase === 'gather' ? 1.05 : 0.5]} castShadow>
        <capsuleGeometry args={[0.085, 0.58, 6, 10]} />
        <meshStandardMaterial color="#55aeb9" roughness={0.42} />
      </mesh>
      <mesh ref={waterCore} position={[0, 0.78, 0.18]}>
        <icosahedronGeometry args={[0.17, 2]} />
        <meshStandardMaterial color="#b7fbff" emissive="#2bc7df" emissiveIntensity={3.2} transparent opacity={phase === 'ready' ? 0.38 : 0.95} />
      </mesh>
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[0, 0.2 + index * 0.23, 0]} rotation={[Math.PI / 2, 0, index * 0.7]}>
          <torusGeometry args={[0.45 - index * 0.07, 0.018, 8, 36]} />
          <meshStandardMaterial color="#58d7df" emissive="#178fa9" emissiveIntensity={1.6} transparent opacity={0.48} />
        </mesh>
      ))}
    </group>
  );
}

function Gatekeeper({ phase }: { phase: BattlePhase }) {
  const root = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!root.current) return;
    const t = clock.elapsedTime;
    const hit = phase === 'impact';
    root.current.rotation.z = hit ? -0.075 + Math.sin(t * 22) * 0.018 : Math.sin(t * 0.8) * 0.004;
    root.current.position.x = hit ? 2.67 : 2.78;
  });

  const stone = '#4b5148';
  const bronze = '#92773e';
  return (
    <group ref={root} position={[2.78, 0, -0.05]} rotation={[0, -0.3, 0]}>
      <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 1.45, 0.72, 2, 2, 2]} />
        <meshStandardMaterial color={stone} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.76, 0]} castShadow>
        <dodecahedronGeometry args={[0.48, 0]} />
        <meshStandardMaterial color="#55594f" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[0, 1.78, 0.42]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.055, 7, 24]} />
        <meshStandardMaterial color={bronze} metalness={0.75} roughness={0.36} emissive="#7b601f" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.78, 0.48]}>
        <boxGeometry args={[0.16, 0.035, 0.04]} />
        <meshStandardMaterial color="#b9f4de" emissive="#5be6c3" emissiveIntensity={4} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <group key={x} position={[x, 0.94, 0]}>
          <mesh castShadow>
            <dodecahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color={stone} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.62, 0]} castShadow>
            <capsuleGeometry args={[0.22, 0.78, 4, 7]} />
            <meshStandardMaterial color="#3e463f" roughness={0.92} />
          </mesh>
        </group>
      ))}
      {[-0.32, 0.32].map((x) => (
        <mesh key={x} position={[x, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.25, 0.75, 4, 7]} />
          <meshStandardMaterial color="#3c443d" roughness={0.94} />
        </mesh>
      ))}
      <mesh position={[0, 0.86, 0.39]}>
        <boxGeometry args={[0.58, 0.045, 0.035]} />
        <meshStandardMaterial color="#76ddbd" emissive="#2dc69f" emissiveIntensity={phase === 'impact' ? 6 : 2.2} />
      </mesh>
    </group>
  );
}

function WaterAttack({ phase }: { phase: BattlePhase }) {
  const wave = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!wave.current) return;
    const t = clock.elapsedTime;
    wave.current.rotation.x = Math.sin(t * 3) * 0.04;
    wave.current.rotation.y = t * 0.25;
  });
  if (phase !== 'release' && phase !== 'impact') return null;
  const impact = phase === 'impact';
  return (
    <group ref={wave} position={[impact ? 2.1 : 0.1, 0.72, 0.15]} scale={impact ? 1.45 : 1}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.72, 0.12, 12, 64, Math.PI * 1.45]} />
        <meshStandardMaterial color="#77ecf1" emissive="#23b6d0" emissiveIntensity={3.5} transparent opacity={0.78} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.05, 0.035, 8, 64]} />
        <meshStandardMaterial color="#d0ffff" emissive="#6eefff" emissiveIntensity={4} transparent opacity={0.72} />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.88, Math.sin(angle) * 0.88, Math.sin(angle * 2) * 0.28]}>
            <icosahedronGeometry args={[0.065 + (index % 3) * 0.025, 1]} />
            <meshStandardMaterial color="#a9fbff" emissive="#36cde1" emissiveIntensity={3} />
          </mesh>
        );
      })}
      {impact && (
        <pointLight color="#7feeff" intensity={16} distance={5} decay={2} />
      )}
    </group>
  );
}

function CameraRig({ phase, reduceMotion }: { phase: BattlePhase; reduceMotion: boolean }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 1.15, 0));
  const desired = useRef(new THREE.Vector3());
  useFrame(() => {
    const next = phase === 'gather'
      ? [-3.15, 1.9, 5.8]
      : phase === 'impact'
        ? [1.15, 1.8, 5.35]
        : [0, 2.1, 7.25];
    desired.current.set(next[0], next[1], next[2]);
    if (reduceMotion) camera.position.copy(desired.current);
    else camera.position.lerp(desired.current, 0.055);
    camera.lookAt(target.current);
  });
  return null;
}

function BattleScene({ phase, reduceMotion }: { phase: BattlePhase; reduceMotion: boolean }) {
  return (
    <>
      <color attach="background" args={['#071612']} />
      <fog attach="fog" args={['#0a231c', 7, 18]} />
      <ambientLight intensity={0.48} color="#a7cbb8" />
      <hemisphereLight args={['#a3d6ca', '#192017', 1.05]} />
      <directionalLight position={[-4, 8, 5]} intensity={3.2} color="#e7dca2" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[3.5, 3.4, -2]} intensity={8} distance={10} color="#6ee2c0" />
      <CameraRig phase={phase} reduceMotion={reduceMotion} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.53, 0]} receiveShadow>
        <circleGeometry args={[8.5, 64]} />
        <meshStandardMaterial color="#172a23" roughness={0.94} metalness={0.03} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0.05]} receiveShadow>
        <ringGeometry args={[1.55, 3.95, 48]} />
        <meshStandardMaterial color="#3b4837" roughness={0.82} metalness={0.08} />
      </mesh>
      {[
        [-4.8, -2.2, 2.8, false], [-3.7, -3.6, 1.8, true], [4.8, -2.1, 3.4, false],
        [3.9, -3.8, 2.1, true], [-5.5, 1.4, 2.2, true], [5.5, 1.2, 2.6, false],
      ].map(([x, z, height, broken], index) => (
        <RuinPillar key={index} x={x as number} z={z as number} height={height as number} broken={broken as boolean} />
      ))}
      <Lange phase={phase} />
      <Gatekeeper phase={phase} />
      <WaterAttack phase={phase} />
    </>
  );
}

export default function Battle3DPage() {
  const [phase, setPhase] = useState<BattlePhase>('ready');
  const [bossHp, setBossHp] = useState(60);
  const [reduceMotion, setReduceMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => pendingTimers.forEach(window.clearTimeout);
  }, []);

  const replay = () => {
    if (phase !== 'ready') return;
    timers.current.forEach(window.clearTimeout);
    setBossHp(60);
    setPhase('gather');
    const schedule = (delay: number, action: () => void) => {
      timers.current.push(window.setTimeout(action, reduceMotion ? delay * 0.18 : delay));
    };
    schedule(2500, () => setPhase('release'));
    schedule(4050, () => { setPhase('impact'); setBossHp(42); });
    schedule(5050, () => setPhase('recover'));
    schedule(6900, () => setPhase('ready'));
  };

  return (
    <main className="battle3d-page">
      <header className="battle3d-header">
        <div>
          <span>3D UPPER-LIMIT PROTOTYPE · V1</span>
          <h1>雾港遗迹 · 水音</h1>
        </div>
        <div className="battle3d-badges"><b>真实 3D</b><em>独立样片</em></div>
      </header>

      <section className="battle3d-shell" aria-label="澜歌对雾港守门人三维战斗样片">
        <div className="battle3d-hud battle3d-hud-player">
          <div><span>澜歌</span><small>潮音语灵</small></div><b>48 / 48</b>
          <i><span style={{ width: '100%' }} /></i>
        </div>
        <div className="battle3d-hud battle3d-hud-boss">
          <div><span>雾港守门人</span><small>遗迹核心</small></div><b>{bossHp} / 60</b>
          <i><span style={{ width: `${(bossHp / 60) * 100}%` }} /></i>
        </div>

        <div className={`battle3d-canvas phase-${phase}`}>
          <Canvas
            shadows
            dpr={[1, 1.65]}
            camera={{ position: [0, 2.1, 7.25], fov: 38, near: 0.1, far: 40 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            fallback={<div className="battle3d-webgl-fallback">当前设备无法启动 3D 场景，请开启浏览器硬件加速后重试。</div>}
          >
            <BattleScene phase={phase} reduceMotion={reduceMotion} />
          </Canvas>
          <div className="battle3d-vignette" />
          {phase === 'impact' && <div className="battle3d-hitstop" />}
          <div className="battle3d-phase-copy" aria-live="polite"><span>{phase === 'ready' ? '等待指令' : '演出进行中'}</span>{PHASE_COPY[phase]}</div>
        </div>

        <footer className="battle3d-controls">
          <div className="battle3d-skill">
            <i>水</i>
            <div><b>水音</b><span>吟唱聚潮，对敌方造成 18 点伤害</span></div>
          </div>
          <button type="button" onClick={replay} disabled={phase !== 'ready'}>
            {phase === 'ready' ? (bossHp === 42 ? '再次演示' : '释放水音') : '正在演出'}
          </button>
          <label><input type="checkbox" checked={reduceMotion} onChange={(event) => setReduceMotion(event.target.checked)} />降低动态</label>
        </footer>
      </section>

      <p className="battle3d-note">首版为可替换模型的风格化 3D 块模，用来验证镜头、空间、光影与技能演出；不是最终精模或骨骼成片。</p>
    </main>
  );
}

'use client';

import { useMemo, useState } from 'react';

type View = 'city' | 'explore' | 'learn' | 'arena' | 'spirits';
type Spirit = { name:string; title:string; role:string; level:number; stars:number; tone:string; glyph:string; power:number; progress:number; locked?:boolean };

const initialSpirits: Spirit[] = [
  { name:'芽语', title:'森语守望者', role:'守护', level:12, stars:3, tone:'emerald', glyph:'芽', power:1180, progress:72 },
  { name:'烬尾', title:'余烬追猎者', role:'强攻', level:10, stars:2, tone:'amber', glyph:'焰', power:1060, progress:48 },
  { name:'澜歌', title:'潮汐吟游者', role:'治愈', level:9, stars:2, tone:'blue', glyph:'澜', power:970, progress:63 },
  { name:'砾山', title:'古城铸壁者', role:'守护', level:7, stars:1, tone:'stone', glyph:'岩', power:720, progress:31 },
  { name:'星织', title:'夜空抄写员', role:'辅助', level:6, stars:1, tone:'violet', glyph:'星', power:690, progress:26 },
  { name:'未名之卵', title:'掌握探索词组后苏醒', role:'未知', level:0, stars:0, tone:'locked', glyph:'?', power:0, progress:0, locked:true },
];

const words = [
  { word:'revive', phonetic:'/rɪˈvaɪv/', meaning:'使复苏；使重新活跃', choices:['使复苏','使消散','使停留'] },
  { word:'inherit', phonetic:'/ɪnˈherɪt/', meaning:'继承；经遗传获得', choices:['观察','继承','抵抗'] },
  { word:'fragment', phonetic:'/ˈfræɡmənt/', meaning:'碎片；片段', choices:['遗迹','边界','碎片'] },
];

const opponents = [
  { name:'北境旅人', rank:17, power:3240, form:'芽语 · 星织 · 烬尾', bonus:'记忆加成 12%' },
  { name:'拾光者', rank:16, power:3380, form:'砾山 · 澜歌 · 烬尾', bonus:'记忆加成 9%' },
  { name:'雾海航员', rank:14, power:3560, form:'芽语 · 澜歌 · 星织', bonus:'记忆加成 15%' },
];

export default function Home() {
  const [view, setView] = useState<View>('city');
  const [energy, setEnergy] = useState(268);
  const [learned, setLearned] = useState(18);
  const [wordIndex, setWordIndex] = useState(0);
  const [selected, setSelected] = useState('芽语');
  const [spirits, setSpirits] = useState(initialSpirits);
  const [modal, setModal] = useState<'learn'|'battle'|'result'|null>(null);
  const [battleMode, setBattleMode] = useState<'stage'|'arena'>('stage');
  const [battleTitle, setBattleTitle] = useState('雾港守门人');
  const [toast, setToast] = useState('');
  const activeSpirit = useMemo(() => spirits.find(s => s.name === selected) ?? spirits[0], [spirits, selected]);

  function showToast(message:string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  }

  function answer(choice:string) {
    const correct = choice === words[wordIndex].meaning.split('；')[0] || choice === words[wordIndex].meaning;
    if (!correct) { showToast('再想一想：答案藏在词根的回声里'); return; }
    setEnergy(v => v + 12);
    setLearned(v => v + 1);
    setSpirits(list => list.map(s => s.name === '芽语' ? { ...s, progress: Math.min(100, s.progress + 6) } : s));
    if (wordIndex < words.length - 1) { setWordIndex(v => v + 1); showToast('记忆成功 · 芽语获得 12 点能量'); }
    else { setModal(null); setWordIndex(0); showToast('本轮完成 · 获得 1 枚升星碎片'); }
  }

  function openBattle(mode:'stage'|'arena', title:string) {
    setBattleMode(mode); setBattleTitle(title); setModal('battle');
  }

  function upgradeSpirit() {
    if (activeSpirit.locked) return;
    if (activeSpirit.progress < 70) { showToast(`还需完成 ${Math.ceil((70-activeSpirit.progress)/6)} 次有效复习`); return; }
    setSpirits(list => list.map(s => s.name === activeSpirit.name ? { ...s, stars:Math.min(5,s.stars+1), power:s.power+180, progress:8 } : s));
    showToast(`${activeSpirit.name}完成升星，解锁新的战斗天赋`);
  }

  return (
    <main className="game-shell">
      <Header energy={energy} />
      {view === 'city' && <CityView learned={learned} spirits={spirits.slice(0,3)} onLearn={() => setModal('learn')} onView={setView} />}
      {view === 'explore' && <ExploreView onBattle={(title) => openBattle('stage',title)} />}
      {view === 'learn' && <LearnView learned={learned} onStart={() => setModal('learn')} />}
      {view === 'arena' && <ArenaView onBattle={(title) => openBattle('arena',title)} />}
      {view === 'spirits' && <SpiritsView spirits={spirits} selected={selected} onSelect={setSelected} active={activeSpirit} onUpgrade={upgradeSpirit} />}
      <BottomNav view={view} onChange={setView} />

      {modal === 'learn' && <LearnModal item={words[wordIndex]} index={wordIndex} onAnswer={answer} onClose={() => setModal(null)} />}
      {modal === 'battle' && <BattleModal title={battleTitle} mode={battleMode} onWin={() => setModal('result')} />}
      {modal === 'result' && <ResultModal mode={battleMode} title={battleTitle} onClose={() => { setModal(null); showToast(battleMode === 'arena' ? '竞技积分 +18' : '遗迹净化度 +12%'); }} />}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function Header({ energy }:{energy:number}) {
  return <header className="topbar">
    <div className="brand"><div className="brand-mark">言</div><div><strong>语灵文明</strong><span>失落纪元 · 第 7 日</span></div></div>
    <div className="resources"><span><i className="memory-dot" />记忆能量 <b>{energy}</b></span><span><i className="streak-dot" />连续学习 <b>7天</b></span><button className="profile" aria-label="玩家资料">旅</button></div>
  </header>;
}

function CityView({ learned, spirits, onLearn, onView }:{learned:number; spirits:Spirit[]; onLearn:()=>void; onView:(view:View)=>void}) {
  return <>
    <section className="world-panel with-art">
      <div className="world-copy"><span className="eyebrow">文明复苏进度 · 23%</span><h1>让沉睡的词语，<br />再次拥有名字。</h1><p>今日掌握 {learned} 个新词，三座遗迹正在等待唤醒。</p><button className="primary-action" onClick={onLearn}>开始今日学习 <span>→</span></button></div>
      <div className="chapter-badge"><span>当前章节</span><b>01 · 雾中的回声</b></div>
    </section>
    <section className="content-grid">
      <div className="card squad-card"><div className="section-title"><div><span>出战小队</span><h2>我的语灵</h2></div><button onClick={() => onView('spirits')}>调整阵容</button></div><div className="spirit-list">{spirits.map((s,i)=><SpiritMini spirit={s} index={i} key={s.name}/>)}</div></div>
      <div className="side-stack">
        <article className="card mission-card"><div className="mission-icon">{30-learned}</div><div><span>今日记忆任务</span><h3>再掌握 {30-learned} 词即可获得升星碎片</h3></div><div className="progress"><i style={{width:`${learned/30*100}%`}} /></div><b>{learned} / 30</b></article>
        <article className="card arena-card"><div className="arena-copy"><span>回响竞技场</span><h3>白银 III</h3><p>本周排名 18 · 防守成功 3 次</p></div><button onClick={() => onView('arena')}>前往挑战</button></article>
      </div>
    </section>
  </>;
}

function SpiritMini({ spirit, index }:{spirit:Spirit;index:number}) {
  return <article className={`spirit ${spirit.tone}`}><span className="position">{index+1}</span><div className="spirit-portrait"><i>{spirit.glyph}</i></div><div className="spirit-info"><span>{spirit.role}</span><h3>{spirit.name}</h3><Stars count={spirit.stars}/></div><b>Lv.{spirit.level}</b></article>;
}

function ExploreView({onBattle}:{onBattle:(title:string)=>void}) {
  const stages = ['苏醒之门','残页回廊','寂静广场','雾港守门人','未开放','未开放'];
  return <PageFrame eyebrow="剧情闯关" title="雾中的回声" copy="每场战斗都在找回文明遗失的词语。阵容决定战术，真实记忆决定力量。">
    <div className="map-panel"><div className="map-road" />{stages.map((stage,i)=><button key={stage+i} className={`stage stage-${i+1} ${i<3?'done':''} ${i>3?'locked':''}`} onClick={()=>i===3&&onBattle(stage)} disabled={i!==3}><span>{i<3?'✓':i+1}</span><b>{stage}</b>{i===3&&<em>首领</em>}</button>)}<div className="map-note"><span>本章加成</span><b>近7日复习正确率 91%</b><p>全队生命与攻击 +14%</p></div></div>
  </PageFrame>;
}

function LearnView({learned,onStart}:{learned:number;onStart:()=>void}) {
  return <PageFrame eyebrow="今日学习" title="给知识留下能够返回的路" copy="这里展示学习到养成的转化。正式版本将接入真实词库与间隔复习算法。">
    <div className="learn-dashboard"><div className="learn-ring" style={{'--p':`${learned/30*360}deg`} as React.CSSProperties}><div><b>{learned}</b><span>/ 30 词</span></div></div><div className="learn-details"><span>今日记忆计划</span><h2>探索词组 · 文明与传承</h2><p>完成新词学习后，芽语将获得经验；在明日、7日后仍能正确回忆，才能获得升星碎片。</p><div className="reward-row"><i>+144</i><span>记忆能量</span><i>+1</i><span>升星碎片</span></div><button className="primary-dark" onClick={onStart}>继续学习</button></div></div>
  </PageFrame>;
}

function ArenaView({onBattle}:{onBattle:(title:string)=>void}) {
  return <PageFrame eyebrow="异步玩家对战" title="回响竞技场" copy="不要求同时在线。学习质量形成知识加成，阵容搭配决定能否以弱胜强。">
    <div className="rank-banner"><div><span>本周段位</span><h2>白银 III</h2><p>排名 18 · 距离晋级还需 42 分</p></div><div className="rank-score"><b>1,358</b><span>竞技积分</span></div></div>
    <div className="opponent-list">{opponents.map(o=><article className="opponent" key={o.name}><div className="opponent-rank">#{o.rank}</div><div><h3>{o.name}</h3><p>{o.form}</p></div><div className="opponent-power"><span>{o.bonus}</span><b>战力 {o.power}</b></div><button onClick={()=>onBattle(o.name)}>挑战</button></article>)}</div>
  </PageFrame>;
}

function SpiritsView({spirits,selected,onSelect,active,onUpgrade}:{spirits:Spirit[];selected:string;onSelect:(s:string)=>void;active:Spirit;onUpgrade:()=>void}) {
  return <PageFrame eyebrow="收集与养成" title="语灵图鉴" copy="不靠抽卡。完成词组即可相遇，真正记住才能升星与觉醒。">
    <div className="collection-layout"><div className="collection-grid">{spirits.map(s=><button key={s.name} className={`collection-card ${s.tone} ${selected===s.name?'selected':''}`} onClick={()=>onSelect(s.name)}><div className="collection-glyph">{s.glyph}</div><span>{s.role}</span><h3>{s.name}</h3><Stars count={s.stars}/>{s.locked&&<em>尚未苏醒</em>}</button>)}</div><aside className={`detail-card ${active.tone}`}><span>{active.title}</span><div className="detail-glyph">{active.glyph}</div><h2>{active.name}</h2>{active.locked?<p>完成“探索与远行”主题词组后，这枚语灵之卵将回应你的声音。</p>:<><Stars count={active.stars}/><div className="stat-row"><span>等级 <b>{active.level}</b></span><span>战力 <b>{active.power}</b></span></div><p>下次升星将强化核心技能，并解锁一段来自旧文明的记忆。</p><div className="detail-progress"><i style={{width:`${active.progress}%`}} /></div><small>有效复习进度 {active.progress}% / 70%</small><button className="primary-dark" onClick={onUpgrade}>尝试升星</button></>}</aside></div>
  </PageFrame>;
}

function PageFrame({eyebrow,title,copy,children}:{eyebrow:string;title:string;copy:string;children:React.ReactNode}) {
  return <section className="page-frame"><div className="page-heading"><span>{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>{children}</section>;
}

function Stars({count}:{count:number}) { return <div className="stars">{'★'.repeat(count)}<i>{'★'.repeat(5-count)}</i></div>; }

function BottomNav({view,onChange}:{view:View;onChange:(v:View)=>void}) {
  const nav:{id:View;icon:string;label:string}[]=[{id:'city',icon:'⌂',label:'文明'},{id:'explore',icon:'◇',label:'探索'},{id:'learn',icon:'✦',label:'学习'},{id:'arena',icon:'♜',label:'竞技'},{id:'spirits',icon:'▦',label:'语灵'}];
  return <nav className="bottom-nav" aria-label="主导航">{nav.map(n=><button key={n.id} className={`${view===n.id?'active':''} ${n.id==='learn'?'learn-button':''}`} onClick={()=>onChange(n.id)}><span>{n.icon}</span>{n.label}</button>)}</nav>;
}

function LearnModal({item,index,onAnswer,onClose}:{item:typeof words[0];index:number;onAnswer:(c:string)=>void;onClose:()=>void}) {
  return <div className="modal-backdrop"><section className="modal learn-modal"><button className="close" onClick={onClose}>×</button><span className="modal-kicker">记忆唤醒 · {index+1} / 3</span><div className="word-orb">✦</div><h2>{item.word}</h2><p className="phonetic">{item.phonetic}</p><p>选择它在这段文明残页中的含义</p><div className="choice-list">{item.choices.map(c=><button key={c} onClick={()=>onAnswer(c)}>{c}</button>)}</div></section></div>;
}

function BattleModal({title,mode,onWin}:{title:string;mode:'stage'|'arena';onWin:()=>void}) {
  const [enemyHp,setEnemyHp]=useState(100);
  const [allyHp,setAllyHp]=useState(100);
  const [round,setRound]=useState(1);
  const [busy,setBusy]=useState(false);
  const [action,setAction]=useState('选择一只语灵释放技能');
  const [attacker,setAttacker]=useState('');
  const [damage,setDamage]=useState(0);
  const skills=[
    {id:'芽',name:'森罗重击',detail:'破甲 · 稳定',damage:32},
    {id:'焰',name:'余烬连击',detail:'高伤 · 强攻',damage:42},
    {id:'澜',name:'潮汐回响',detail:'治疗 · 辅助',damage:26},
  ];

  function cast(skill:typeof skills[0]) {
    if(busy) return;
    setBusy(true); setAttacker(skill.id); setDamage(skill.damage); setAction(`${skill.name}命中，造成 ${skill.damage} 点伤害`);
    const nextEnemy=Math.max(0,enemyHp-skill.damage);
    window.setTimeout(()=>setEnemyHp(nextEnemy),260);
    if(skill.id==='澜') window.setTimeout(()=>setAllyHp(h=>Math.min(100,h+12)),320);
    if(nextEnemy===0){ window.setTimeout(()=>{setAction('敌方回响消散，遗迹重新发出声音');setBusy(false)},720); return; }
    window.setTimeout(()=>{ setAttacker('enemy'); setDamage(12+round*2); setAction(`敌方反击，队伍承受 ${12+round*2} 点伤害`); setAllyHp(h=>Math.max(0,h-(12+round*2))); },820);
    window.setTimeout(()=>{ setRound(r=>r+1); setAttacker(''); setDamage(0); setAction('轮到你了，选择下一次行动'); setBusy(false); },1450);
  }

  return <div className="modal-backdrop"><section className="modal battle-modal interactive-battle">
    <div className="battle-head"><div><span className="modal-kicker">{mode==='arena'?'回响竞技':'遗迹战斗'} · 第 {round} 回合</span><h2>{title}</h2></div><span className="knowledge-bonus">知识加成 +14%</span></div>
    <div className="hp-row enemy-hp"><span>敌方回响</span><div><i style={{width:`${enemyHp}%`}} /></div><b>{enemyHp} / 100</b></div>
    <div className={`battle-stage ${attacker?'is-acting':''}`}>
      <div className={`combat-line ally-line ${attacker&&attacker!=='enemy'?'attacking':''}`}><div className="combatant spirit-a"><i>芽</i><small>芽语</small></div><div className="combatant spirit-b"><i>焰</i><small>烬尾</small></div><div className="combatant spirit-c"><i>澜</i><small>澜歌</small></div></div>
      <div className="turn-core"><span>{busy?'交战':'你的回合'}</span>{damage>0&&<b className="damage-pop">-{damage}</b>}</div>
      <div className={`combat-line enemy-line ${attacker==='enemy'?'attacking':''}`}><div className="combatant foe-a"><i>雾</i><small>蚀影</small></div><div className="combatant foe-b"><i>魇</i><small>守门人</small></div></div>
      {busy&&<div className="battle-flash" />}
    </div>
    <div className="hp-row ally-hp"><span>我方小队</span><div><i style={{width:`${allyHp}%`}} /></div><b>{allyHp} / 100</b></div>
    <div className="battle-log"><span>{action}</span></div>
    {enemyHp>0?<div className="skill-bar">{skills.map(skill=><button key={skill.id} onClick={()=>cast(skill)} disabled={busy}><i>{skill.id}</i><span><b>{skill.name}</b><small>{skill.detail}</small></span></button>)}</div>:<button className="claim-victory" onClick={onWin}>完成战斗 · 查看结算</button>}
  </section></div>;
}

function ResultModal({mode,title,onClose}:{mode:'stage'|'arena';title:string;onClose:()=>void}) {
  return <div className="modal-backdrop"><section className="modal result-modal"><div className="victory-mark">胜</div><span className="modal-kicker">战斗胜利</span><h2>{mode==='arena'?'击败 '+title:'遗迹已被净化'}</h2><p>{mode==='arena'?'阵容克制生效，知识加成为本场战斗提供了关键优势。':'失落的文字正在返回城市，新的区域即将苏醒。'}</p><div className="result-rewards"><span><b>{mode==='arena'?'+18':'+120'}</b>{mode==='arena'?'竞技积分':'记忆能量'}</span><span><b>+6</b>芽语经验</span></div><button className="primary-dark" onClick={onClose}>收下奖励</button></section></div>;
}

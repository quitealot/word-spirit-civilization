// Deterministic layout study: no generated/repainted character art; originals untouched.
const sharp = require('sharp');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const W = 780, H = 1688;
const svg = content => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><style>text{font-family:'Microsoft YaHei','SimHei',sans-serif}</style>${content}</svg>`);
const text = (x,y,s,size=26,color='#e9ece1',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${s}</text>`;
const rect = (x,y,w,h,fill,stroke='none',r=12) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
async function cutout(name,width,height,flip=false) {
  const { data, info } = await sharp(path.join(root,'public',name)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // The source contains baked neutral checkerboard. Remove neutral bright pixels only.
  // Preserve source RGB; apply alpha only. Edge cleanup is a preview matte, not production rigging.
  for(let i=0;i<data.length;i+=4){
    const lo=Math.min(data[i],data[i+1],data[i+2]), hi=Math.max(data[i],data[i+1],data[i+2]);
    if(lo>216 && hi-lo<19) data[i+3]=0;
  }
  let p=sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).trim({threshold:5});
  if(flip) p=p.flop();
  return p.resize(width,height,{fit:'contain',background:'#00000000'}).png().toBuffer();
}
async function main(){
  const bg=await sharp(path.join(root,'public/world-awakening.png')).extract({left:225,top:0,width:710,height:850}).resize(W,H).modulate({brightness:.76,saturation:.8}).png().toBuffer();
  const under=svg(`<defs><linearGradient id="v" x2="0" y2="1"><stop stop-color="#071d20" stop-opacity=".25"/><stop offset=".55" stop-color="#071d20" stop-opacity=".02"/><stop offset="1" stop-color="#071d20" stop-opacity=".97"/></linearGradient></defs><rect width="780" height="1688" fill="url(#v)"/><ellipse cx="536" cy="733" rx="162" ry="27" fill="#071d20" opacity=".42"/><ellipse cx="235" cy="1110" rx="150" ry="25" fill="#071d20" opacity=".38"/>`);
  let ui=rect(0,0,780,138,'#0b2328e8','none',0)+text(42,64,'语 灵',37,'#e7dfc6')+text(42,106,'原画保留 · 界面排版提案',19,'#9fafaa')+text(735,65,'Ⅱ',30,'#d9dfd6','text-anchor="end"')+text(735,106,'伙伴演练',22,'#c3ccc2','text-anchor="end"');
  ui+=rect(300,165,180,48,'#132c30cc','#69756a',24)+text(390,198,'第 3 回合',23,'#e0dfc9','text-anchor="middle"');
  ui+=rect(52,248,374,134,'#112a2eee','#63736b',14)+text(76,289,'烬尾',31)+text(398,288,'36 / 48',24,'#e0d7c0','text-anchor="end"')+rect(76,310,322,10,'#324b49','none',5)+rect(76,310,242,10,'#cda074','none',5)+text(76,357,'◇  蓄力',24,'#e2bd7c');
  ui+=text(704,811,'对方',19,'#a8bab0','text-anchor="end"');
  ui+=rect(370,1008,356,138,'#112a2eee','#63736b',14)+text(396,1050,'澜歌',31)+text(699,1050,'40 / 48',24,'#d0e2d1','text-anchor="end"')+rect(396,1073,303,10,'#324b49','none',5)+rect(396,1073,253,10,'#8dbb9e','none',5)+text(396,1120,'当前出战',21,'#a4b7ad');
  ui+=rect(0,1244,780,444,'#0d2429','none',0)+`<path d="M32 1244H748" stroke="#64756a"/>`+text(42,1302,'选择技能',32,'#e8e8db')+text(738,1301,'你的回合',22,'#a8bfb6','text-anchor="end"')+text(42,1344,'观察意图，再决定行动。',22,'#9aafa7');
  const skills=[['水音','压制', '#89c5d3'],['回潮','回复','#99cab1'],['静波','防护','#b5bdd8']];
  skills.forEach(([name,role,color],i)=>{const x=42+i*238,cx=x+110;
    ui+=rect(x,1390,220,196,i===0?'#203f46':'#162e35',i===0?'#a5c9c5':'#53676a',12);
    if(i===0)ui+=`<path d="M${cx} 1415 C${cx-6} 1432 ${cx-23} 1446 ${cx-23} 1459 A23 23 0 0 0 ${cx+23} 1459 C${cx+23} 1446 ${cx+6} 1432 ${cx} 1415Z" fill="none" stroke="${color}" stroke-width="3"/>`;
    if(i===1)ui+=`<path d="M${cx-33} 1454 Q${cx-15} 1425 ${cx} 1451 T${cx+33} 1451 M${cx-33} 1470 Q${cx-15} 1441 ${cx} 1467 T${cx+33} 1467" fill="none" stroke="${color}" stroke-width="3"/>`;
    if(i===2)ui+=`<path d="M${cx} 1427 L${cx+25} 1437 V1459 Q${cx+25} 1480 ${cx} 1490 Q${cx-25} 1480 ${cx-25} 1459 V1437Z" fill="none" stroke="${color}" stroke-width="3"/>`;
    ui+=text(cx,1531,name,30,'#e4e7dd','text-anchor="middle"')+text(cx,1565,role,19,'#9cb1aa','text-anchor="middle"');
  });
  ui+=text(390,1647,'原始立绘合成 · 非实机 · 数值示意',19,'#8ea59d','text-anchor="middle"');
  const fox=await cutout('spirit-jinwei.png',360,422,true);
  const water=await cutout('spirit-lange.png',388,456,true);
  const output=path.join(__dirname,'original-art-battle-layout-v1.png');
  await sharp(bg).composite([{input:under},{input:fox,left:359,top:344},{input:water,left:35,top:669},{input:svg(ui)}]).png().toFile(output);
  console.log(output);
}
main().catch(e=>{console.error(e);process.exitCode=1;});

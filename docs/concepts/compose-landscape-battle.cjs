// Static art-direction study. Original character RGB is preserved; no runtime changes.
const sharp = require('sharp');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const W = 1600, H = 900;
const svg = body => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><style>text{font-family:'Microsoft YaHei',sans-serif}</style>${body}</svg>`);
const t = (x,y,label,size=24,color='#f5f0d9',extra='') => `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${label}</text>`;
const r = (x,y,w,h,fill,stroke='none',radius=12) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
async function character(name,w,h,flip=false) {
  const {data,info} = await sharp(path.join(root,'public',name)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  // Preview matte only: source art has a baked neutral checkerboard.
  for(let i=0;i<data.length;i+=4) {
    const lo=Math.min(data[i],data[i+1],data[i+2]), hi=Math.max(data[i],data[i+1],data[i+2]);
    if(lo>216 && hi-lo<19) data[i+3]=0;
  }
  let pipeline=sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).trim({threshold:5});
  if(flip) pipeline=pipeline.flop();
  return pipeline.resize(w,h,{fit:'contain',background:'#00000000'}).png().toBuffer();
}
function icon(type,x,y,color) {
  const paths = {
    water:'M0 -25 C-7 -12 -22 1 -22 13 A22 22 0 0 0 22 13 C22 1 7 -12 0 -25Z',
    heal:'M-27 -1 Q-13 -23 0 -1 T27 -1 M-27 16 Q-13 -6 0 16 T27 16',
    shield:'M0 -24 L24 -14 V8 Q24 25 0 34 Q-24 25 -24 8 V-14Z',
  };
  return `<g transform="translate(${x} ${y})"><path d="${paths[type]}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
async function main() {
  const bg=await sharp(path.join(__dirname,'forest-battle-background-v2.png')).resize(W,720,{fit:'cover'}).extend({bottom:180,background:'#172e32'}).png().toBuffer();
  const under=svg(`<defs><radialGradient id="shadow"><stop stop-color="#163b33" stop-opacity=".55"/><stop offset="1" stop-color="#163b33" stop-opacity="0"/></radialGradient><linearGradient id="top" x2="0" y2="1"><stop stop-color="#0e2c31" stop-opacity=".7"/><stop offset="1" stop-color="#0e2c31" stop-opacity="0"/></linearGradient></defs><rect width="1600" height="170" fill="url(#top)"/><ellipse cx="465" cy="622" rx="205" ry="40" fill="url(#shadow)"/><ellipse cx="1200" cy="609" rx="215" ry="42" fill="url(#shadow)"/>`);
  let ui=`<defs><linearGradient id="panel" x2="0" y2="1"><stop stop-color="#28494c"/><stop offset="1" stop-color="#132d34"/></linearGradient><linearGradient id="skill" x2="0" y2="1"><stop stop-color="#367485"/><stop offset="1" stop-color="#174858"/></linearGradient><linearGradient id="green" x2="0" y2="1"><stop stop-color="#539680"/><stop offset="1" stop-color="#234f48"/></linearGradient><linearGradient id="blue" x2="0" y2="1"><stop stop-color="#667e9b"/><stop offset="1" stop-color="#34465f"/></linearGradient><linearGradient id="gold" x2="0" y2="1"><stop stop-color="#f0d592"/><stop offset="1" stop-color="#bd904d"/></linearGradient></defs>`;
  // Top HUDs: mirrored information hierarchy, both HP bars fully visible.
  ui+=r(32,25,484,116,'url(#panel)','#9baaa0',14)+r(1084,25,484,116,'url(#panel)','#9baaa0',14);
  ui+=t(60,64,'澜歌',29)+t(158,63,'Lv. 8',20,'#c7d1c3')+t(488,63,'出战',19,'#95e2e1','text-anchor="end"');
  ui+=r(60,79,428,18,'#0c2527','none',9)+r(60,79,357,18,'#66c993','none',9)+t(488,126,'40 / 48',20,'#e1ebdb','text-anchor="end"');
  ui+=t(1112,64,'烬尾',29)+t(1210,63,'Lv. 7',20,'#c7d1c3')+t(1540,63,'未收集',19,'#f1ca82','text-anchor="end"');
  ui+=r(1112,79,428,18,'#0c2527','none',9)+r(1112,79,321,18,'#eab564','none',9)+t(1540,126,'36 / 48',20,'#e1ebdb','text-anchor="end"');
  ui+=r(686,25,228,67,'#173639ee','#b9b38b',26)+t(800,67,'第 3 回合',26,'#f2e7c4','text-anchor="middle"');
  ui+=r(726,104,148,37,'#173639dc','none',18)+t(800,130,'你的回合',19,'#e7e3c8','text-anchor="middle"');
  ui+=r(1147,159,172,44,'#63492edc','#d3a361',22)+t(1233,189,'蓄力中',22,'#ffe2a0','text-anchor="middle"');
  // Low-profile command dock, distinct from a web dashboard.
  ui+=`<path d="M0 704 L30 688 H1570 L1600 704 V900 H0Z" fill="url(#panel)" stroke="#b6aa79" stroke-width="2"/>`;
  ui+=t(34,727,'语灵',23,'#e3d4a8')+t(1566,727,'视觉提案 · 非实机',17,'#bbc7b7','text-anchor="end"');
  ui+=r(28,745,237,119,'#0e282e','#728d81',12)+t(47,776,'同行伙伴',19,'#d8dec8');
  ui+=r(47,792,88,54,'#286575','#9cd1ca',8)+t(91,827,'澜歌',22,'#eaf6e8','text-anchor="middle"');
  ui+=r(148,792,98,54,'#385a42','#879a70',8)+t(197,827,'芽语',22,'#eaf6e8','text-anchor="middle"');
  const skills=[['水音','攻击 · 压制','water','url(#skill)','#bdeaff'],['回潮','攻击 · 回复','heal','url(#green)','#d6ffe4'],['静波','防护','shield','url(#blue)','#e0e7ff']];
  skills.forEach(([name,detail,type,fill,color],i)=>{
    const x=286+i*288;
    ui+=r(x,745,272,119,fill,i===0?'#f2d991':'#91a9a0',12)+r(x+7,752,258,105,'none',i===0?'#d3c08a':'#ffffff22',8);
    ui+=icon(type,x+48,797,color)+t(x+91,790,name,29)+t(x+91,826,detail,18,'#d7e4dc');
  });
  ui+=r(1172,745,186,119,'url(#gold)','#f9e1a2',12)+t(1265,797,'捕捉',31,'#3c3423','text-anchor="middle"')+t(1265,831,'收集伙伴',18,'#584b30','text-anchor="middle"');
  ui+=r(1376,745,196,55,'#365657','#81988b',10)+t(1474,781,'背包',24,'#e8ecda','text-anchor="middle"');
  ui+=r(1376,809,196,55,'#365657','#81988b',10)+t(1474,845,'换灵',24,'#e8ecda','text-anchor="middle"');
  ui+=t(800,887,'原立绘保留 / 技能、等级、收集状态仅作排版示意',16,'#a7bcb2','text-anchor="middle"');
  await sharp(bg).composite([{input:under},{input:await character('spirit-lange.png',490,470,true),left:210,top:153},{input:await character('spirit-jinwei.png',470,430,true),left:975,top:184},{input:svg(ui)}]).png().toFile(path.join(__dirname,'original-art-landscape-battle-v2.png'));
  console.log('Wrote original-art-landscape-battle-v2.png (1600x900).');
}
main().catch(error=>{console.error(error);process.exitCode=1;});

const TH=(id,name,bg,panel,card,ink,muted,accent,ai,border,track,cur,pal,font,rad)=>({id,name,bg,panel,card,ink,muted,accent,ai,border,track,cur,pal,font:font||'"Segoe UI Variable Text","Segoe UI",system-ui,sans-serif',rad:rad===undefined?6:rad});
const MONO='Consolas,"Cascadia Mono","Courier New",monospace',SERIF='Georgia,"Times New Roman",serif';
const THEMES=[
TH('spot','Светлая','#e6e6e6','#ffffff','#efefef','#121212','#585858','#1f1f1f','#ffffff','#e2e2e2','#c9c9c9','#121212',['#3b2bd6','#e0349a','#ff9a3c','#fff3c4']),
TH('spotdark','Тёмная','#000000','#121212','#1f1f1f','#ffffff','#b3b3b3','#ffffff','#000000','#2a2a2a','#4d4d4d','#ffffff',['#3b2bd6','#e0349a','#ff9a3c','#fff3c4']),
TH('arbuz','Арбуз','#141c16','#1a241c','#223024','#e6eedd','#a3b5a0','#b5d86a','#17200f','#2f3f31','#46584a','#b5d86a',['#1a542c','#7ac848','#d6f080','#ff6080']),
TH('asiimov','Азимов','#f1efea','#fbfaf7','#ffffff','#151515','#5d5a55','#ff6a00','#151515','#d6d1c7','#aaa398','#b84700',['#464646','#ff6a00','#ffb040','#ffffff']),
TH('night','Ночь','#0d1320','#121a2b','#1a2540','#e4ebf7','#9aa9c4','#4cc2ff','#06121f','#263453','#3d4f78','#4cc2ff',['#2446d6','#2cbeff','#9670ff','#ff7cdc']),
TH('yot','Yot Club','#263348','#2e3d55','#3a4b66','#fbefe2','#c0cade','#ffb3a7','#3a1f24','#46587a','#6076a0','#ffc2b8',['#3b5b92','#7fb6d9','#ffd3b0','#ff9eb5'],'"Trebuchet MS","Segoe UI",sans-serif',14),
TH('miami','Майами','#1a0b2e','#23103d','#2f1650','#ffe9fb','#c9abdc','#ff4fd8','#2a0324','#45206e','#6a3fa0','#ff7be3',['#3a0ca3','#f72585','#4cc9f0','#fff1a8'],undefined,10),
TH('wmp','Media Player 11','#0a0d14','#111826','#1b2740','#eaf2ff','#9fb2d0','#3ea6ff','#04121f','#26344f','#3b4e75','#6cc0ff',['#0b3d91','#1e90ff','#7fe0ff','#b8ff5a'],undefined,8),
TH('xp','Windows XP','#ece9d8','#f6f4ea','#ffffff','#10203a','#4f5b6e','#245edb','#ffffff','#b9c4dc','#8fa3c8','#1a47b0',['#245edb','#3fa142','#f0c020','#e8591a'],'Tahoma,"Segoe UI",sans-serif',3),
TH('winamp','Winamp','#1b1b24','#23232e','#30303e','#d8ffd0','#a3b5a8','#35e03a','#041204','#3f3f52','#5a5a74','#5cf060',['#0b5a0b','#35e03a','#e8e83a','#ff4a2a'],MONO,2),
TH('vinyl','Винил','#1e1612','#271c16','#33251d','#f3e6d3','#c2ab92','#e0a458','#2a1707','#463327','#6b5040','#e9b672',['#5a2e12','#c7772e','#f0c27a','#fff1d6'],SERIF,4),
TH('cyber','Киберпанк','#0a0a0f','#111118','#1b1b26','#f7f7e8','#a9a9b8','#fcee0a','#151500','#2c2c3d','#4a4a66','#fcee0a',['#00b8d4','#ff2a6d','#fcee0a','#ffffff'],undefined,0),
TH('matrix','Матрица','#020803','#051107','#0a1c0d','#c8ffd0','#7fbf8a','#00ff66','#002b10','#113a1b','#1f5a2e','#3dff85',['#003b12','#00a83f','#39ff7a','#d9ffe4'],MONO,0),
TH('sakura','Сакура','#fbeef2','#fff7f9','#ffffff','#3a1f2b','#7a5565','#c2255c','#ffffff','#efc9d6','#d9a3b6','#a61e4d',['#7a2e52','#e0527f','#ff9fbd','#ffe3ec'],undefined,12),
TH('ocean','Океан','#061a22','#0a242e','#10323f','#e3f6f8','#93bcc4','#2ed3c6','#02211e','#1b4654','#2d6272','#4fe3d7',['#0b4f6c','#01baef','#20e3b2','#f1ffe7']),
TH('sunset','Закат','#211020','#2b152a','#3a1d36','#ffeedd','#d0a9b0','#ff8552','#2b0e02','#55294c','#7a3f6c','#ffa37a',['#5f0f40','#e0453a','#ff9f1c','#ffe9a8'],undefined,8),
TH('taiga','Тайга','#101a12','#152218','#1d2f21','#e8f1e2','#9eb59f','#e9c46a','#2a1e00','#2a4330','#3f6247','#e9c46a',['#1b4332','#40916c','#95d5b2','#f4e285']),
TH('lavender','Лаванда','#f1eefb','#f9f7ff','#ffffff','#221a3d','#5d5580','#6d4bd8','#ffffff','#d4cdee','#aea3da','#5535bd',['#3c2a8c','#7b5cf0','#c3a6ff','#ffd6f5'],undefined,10),
TH('graphite','Графит','#121212','#1a1a1a','#262626','#f2f2f2','#a8a8a8','#ffffff','#111111','#333333','#5a5a5a','#ffffff',['#3a3a3a','#8a8a8a','#d0d0d0','#ffffff'],undefined,4),
TH('paper','Бумага','#f4ecd8','#faf4e4','#fffaf0','#2b2118','#6b5a48','#8b3a1e','#fff6e6','#d9c9a8','#b8a380','#8b3a1e',['#4a2c1a','#a0522d','#d9a05b','#f6e3b4'],SERIF,2),
TH('amber','Янтарь','#0d0800','#140c00','#201400','#ffcf7a','#c0914a','#ffb000','#1f1200','#3a2600','#5c3e00','#ffb000',['#5a2a00','#c46a00','#ffb000','#ffe6a8'],MONO,0),
TH('ice','Лёд','#e9f3f9','#f5fafd','#ffffff','#0f2a3a','#4c6777','#0a74a6','#ffffff','#c2dbe8','#93b9cc','#075f8a',['#12406a','#1f9bd1','#8fdcf5','#ffffff'],undefined,8)
];
const hex3=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
THEMES.forEach(t=>THEME_PAL[t.id]=t.pal.map(hex3));
function setTheme(id){const t=THEMES.find(x=>x.id===id)||THEMES[0];theme=t.id;const st=document.documentElement.style;
  for(const [k,v] of [['bg',t.bg],['panel',t.panel],['card',t.card],['ink',t.ink],['muted',t.muted],['accent',t.accent],['accent-ink',t.ai],['border',t.border],['track',t.track],['cur',t.cur],['rad',t.rad+'px'],['font',t.font]])st.setProperty('--'+k,v);
  document.querySelectorAll('.thi').forEach(d=>d.classList.toggle('on',d.dataset.id===theme));$('#thBtn').textContent='Тема: '+t.name;LS.set('theme3',theme);buildPal()}
function setPal(i){palIdx=((i%PALS.length)+PALS.length)%PALS.length;$('#palBtn').textContent='Цвет: '+PALS[palIdx].name;LS.set('pal',palIdx);buildPal()}
function closePops(){document.querySelectorAll('.pop.open').forEach(p=>p.classList.remove('open'))}
function togglePop(id){const p=$(id),o=p.classList.contains('open');closePops();if(!o)p.classList.add('open')}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.pop,#vBtn,#thBtn'))closePops()});
{const p=$('#vPop');for(const gn of GRP){const hd=document.createElement('div');hd.className='ph';hd.textContent=gn;p.appendChild(hd);const gr=document.createElement('div');gr.className='pg';
  VIZ.forEach((v,i)=>{if(v.grp!==gn)return;const b=document.createElement('button');b.className='vz';b.dataset.i=i;b.textContent=v.name;b.onclick=()=>{setViz(i);if(auto)setAuto(false);closePops()};gr.appendChild(b)});p.appendChild(gr)}}
{const p=$('#thPop'),gr=document.createElement('div');gr.className='pg';THEMES.forEach(t=>{const b=document.createElement('button');b.className='thi';b.dataset.id=t.id;
  const sw=document.createElement('span');sw.className='sw';sw.style.background='linear-gradient(90deg,'+t.bg+' 0 40%,'+t.card+' 40% 62%,'+t.accent+' 62%)';const nm=document.createElement('span');nm.textContent=t.name;b.append(sw,nm);b.onclick=()=>setTheme(t.id);gr.appendChild(b)});p.appendChild(gr)}
$('#vBtn').onclick=()=>togglePop('#vPop');$('#thBtn').onclick=()=>togglePop('#thPop');
$('#vPrev').onclick=()=>{setViz(vizIdx-1);if(auto)setAuto(false)};$('#vNext').onclick=()=>{setViz(vizIdx+1);if(auto)setAuto(false)};
$('#autoTab').onclick=()=>setAuto(!auto);

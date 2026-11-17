/* ---------- сборка списка и главный цикл ---------- */
VIZ.splice(VIZ.findIndex(v=>v.name==='Плазма'),1);
VIZ.forEach(v=>v.grp='Классика');
VIZ.push(...VIZ2D,...VIZGL,...VIZX);
const GRP=['Классика','Сцены','Шейдеры','Рандом и игры'];
let vizIdx=0,auto=false,autoT=0,vnT,glOn=false,fpsDt=1/60,fpsN=0,lastT=0,frames=0;
let cvMode=0;function showCanvas(m){m=+m;if(cvMode===m)return;cvMode=m;glOn=m===1;glc.style.display=m===1?'block':'none';g3.style.display=m===2?'block':'none';cv.style.display=m===1?'none':'block'}
function vizLabel(){const v=VIZ[vizIdx],c=cvMode===2?g3:glOn?glc:cv;return v.name+' · '+c.width+'×'+c.height}
function setViz(i,quiet){vizIdx=((i%VIZ.length)+VIZ.length)%VIZ.length;const v=VIZ[vizIdx];S={};for(const k in keys)keys[k]=false;
  g.setTransform(dpr,0,0,dpr,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle=BG;g.fillRect(0,0,W,H);
  if(v.enter)v.enter();showCanvas(v.three&&v.world?2:!!v.frag&&!!glInit());
  $('#vBtn').textContent=v.name+' ▾';document.querySelectorAll('.vz').forEach(e=>e.classList.toggle('on',+e.dataset.i===vizIdx));LS.set('vizn',v.name);
  if(!quiet){const e=$('#vizname');e.textContent=v.name;e.classList.add('show');clearTimeout(vnT);setTimeout(()=>{e.textContent=vizLabel()},120);vnT=setTimeout(()=>e.classList.remove('show'),2200)}}
function stepViz(d){let i=vizIdx;for(let k=0;k<VIZ.length;k++){i=(i+d+VIZ.length)%VIZ.length;if(!VIZ[i].game)break}setViz(i);if(auto)setAuto(false)}
function setAuto(v){auto=v;autoT=performance.now()/1000;$('#autoTab').classList.toggle('on',auto);LS.set('auto',auto)}
function resize(){const r=$('#stage').getBoundingClientRect(),d=window.devicePixelRatio||1;W=Math.max(10,r.width);H=Math.max(10,r.height);
  dpr=Math.max(d,Math.min(2,1080/H));dpr=Math.min(dpr,2.5,Math.sqrt(4.2e6/(W*H)));dpr=Math.max(dpr,Math.min(d,1));
  cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);S={};g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle=BG;g.fillRect(0,0,W,H)}
new ResizeObserver(resize).observe($('#stage'));
function frame(now){requestAnimationFrame(frame);const t=now/1000,rdt=t-lastT,dt=Math.min(0.1,Math.max(0.001,rdt));lastT=t;frames++;
  analyse(t,dt);aPhase+=dt*(0.25+A.level*1.9+A.beat*.5);
  const v=VIZ[vizIdx];
  try{
    if(v.frag&&glDraw(v,t))showCanvas(true);
    else{showCanvas(v.three&&v.world?2:0);g.setTransform(dpr,0,0,dpr,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.textAlign='start';g.textBaseline='alphabetic';
      if(v.frag){g.fillStyle=BG;g.fillRect(0,0,W,H);g.fillStyle='#fff';g.font='16px "Segoe UI",sans-serif';g.fillText('Для этой визуализации нужен WebGL, а он тут не завёлся. Выбери другую.',24,44)}
      else if(v.three){if(v.world){g.clearRect(0,0,W,H);v.draw(W,H,t,dt)}else{g.fillStyle=BG;g.fillRect(0,0,W,H);g.fillStyle='#fff';g.font='16px "Segoe UI",sans-serif';g.fillText('Для игры нужен WebGL, а он тут не завёлся. Включи аппаратное ускорение в настройках Chrome.',24,44)}}
      else v.draw(W,H,t,dt)}
  }catch(e){if(!v._err){v._err=1;console.error('viz '+v.name+': '+(e&&e.stack||e))}}
  if((v.frag||v.three)&&rdt<.5){fpsDt+=(rdt-fpsDt)*.08;if(++fpsN>=20){fpsN=0;if(fpsDt>1/40)glScale=Math.max(.3,glScale*.85);else if(fpsDt<1/55&&glScale<1)glScale=Math.min(1,glScale*1.07)}}
  if(auto&&A.live&&t-autoT>25){autoT=t;const c=VIZ.map((x,i)=>i).filter(i=>i!==vizIdx&&!VIZ[i].game);setViz(c[(Math.random()*c.length)|0])}}


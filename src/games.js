/* ---------- игры: едешь и обгоняешь ---------- */
const keys={};let lastInput=-1e9;
function curGame(){const v=VIZ[vizIdx];return v&&v.game?v:null}
function gameKey(c,down){if(!curGame())return false;const m={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d'}[c];if(!m)return false;keys[m]=down;if(down)lastInput=performance.now()/1000;return true}
addEventListener('keyup',e=>{gameKey(e.code,false)});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
const mix3=(a,b,t)=>'rgb('+((a[0]+(b[0]-a[0])*t)|0)+','+((a[1]+(b[1]-a[1])*t)|0)+','+((a[2]+(b[2]-a[2])*t)|0)+')';
const shade=(c,m)=>'rgb('+((c[0]*m)|0)+','+((c[1]*m)|0)+','+((c[2]*m)|0)+')';
const h1=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const vnoise=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return h1(i)*(1-u)+h1(i+1)*u};
function quad(x1,x2,y1,x3,x4,y2,c){g.fillStyle=c;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y1);g.lineTo(x4,y2+.7);g.lineTo(x3,y2+.7);g.fill()}
const mkGlow=(a,b,c)=>{const cn=document.createElement('canvas');cn.width=cn.height=64;const x=cn.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba('+a+',1)');gr.addColorStop(.25,'rgba('+b+',.55)');gr.addColorStop(1,'rgba('+c+',0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return cn};
const GLOW=mkGlow('255,244,210','255,214,140','255,180,80'),GLOWR=mkGlow('255,120,110','255,40,40','255,0,0');
const WT=[0,1,2].map(j=>{const c=document.createElement('canvas');c.width=48;c.height=128;const x=c.getContext('2d');x.fillStyle=['#10121c','#141624','#0d1018'][j];x.fillRect(0,0,48,128);
  for(let r=0;r<30;r++)for(let q=0;q<10;q++){const hh=h1(j*91+r*13.7+q*3.1);if(hh>.55){x.fillStyle=hh>.9?'#fff2c0':hh>.7?'#d9b560':'#6b5a34';x.fillRect(3+q*4.4,3+r*4.1,2.6,2.4)}}return c});

function drawCar(x,y,s,c,t,night){
  const W=c.w*s,H=c.h*s,k=c.kind,F=c.front,body=shade(c.col,night),dark=shade(c.col,night*.7),glass=F?(night<1?'#3b4d66':'#86a3bd'):(night<1?'#141c28':'#2b3b4d'),lamp=F?'#fff3c4':'#ff2a2a';
  if(W<6){g.fillStyle=body;g.fillRect(x-W/2,y-H,W,H);g.fillStyle=lamp;g.fillRect(x-W/2,y-H*.5,W,Math.max(1,H*.2));return}
  g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(x,y,W*.56,Math.max(1,s*.15),0,0,7);g.fill();
  const big=k==='truck'||k==='bus',wh=(k==='tractor'?1.05:big?.52:.34)*s,ww=(k==='tractor'?.52:big?.3:.24)*s,L=x-W/2,lift=(big?.42:.2)*s,by=y-lift,bh=H-lift;
  g.fillStyle='#0b0b0d';g.fillRect(L,y-wh,ww,wh);g.fillRect(L+W-ww,y-wh,ww,wh);
  const lights=(ly,lw,lh,ins)=>{g.fillStyle=lamp;g.fillRect(L+ins,ly,lw,lh);g.fillRect(L+W-ins-lw,ly,lw,lh);
    if(night<1){const ga=g.globalAlpha,r=Math.max(lw,lh)*(F?3:2.1);g.globalCompositeOperation='lighter';g.globalAlpha=ga*(F?.9:.6);const im=F?GLOW:GLOWR;
      g.drawImage(im,L+ins+lw/2-r,ly+lh/2-r,r*2,r*2);g.drawImage(im,L+W-ins-lw/2-r,ly+lh/2-r,r*2,r*2);g.globalAlpha=ga;g.globalCompositeOperation='source-over'}};
  if(k==='truck'){
    if(F){g.fillStyle=body;rr(L,by-bh,W,bh,s*.15);g.fill();g.fillStyle=glass;g.fillRect(L+W*.08,by-bh*.92,W*.84,bh*.36);g.fillStyle='#222';g.fillRect(L+W*.15,by-bh*.42,W*.7,bh*.2);lights(by-bh*.16,W*.16,bh*.09,W*.05)}
    else{g.fillStyle=shade(c.box||[225,226,230],night);g.fillRect(L,by-bh,W,bh);g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=Math.max(1,s*.04);g.strokeRect(L+W*.04,by-bh*.96,W*.92,bh*.9);g.beginPath();g.moveTo(x,by-bh*.96);g.lineTo(x,by-bh*.06);g.stroke();
      g.fillStyle=body;g.fillRect(L,by-bh*.05,W,bh*.05+s*.1);lights(by-s*.02,W*.1,s*.14,W*.04)}
  }else if(k==='bus'){g.fillStyle=body;rr(L,by-bh,W,bh,s*.2);g.fill();g.fillStyle=glass;g.fillRect(L+W*.08,by-bh*.9,W*.84,bh*(F?.5:.34));g.fillStyle=dark;g.fillRect(L,by-bh*.3,W,bh*.06);lights(by-bh*.2,W*.14,bh*.07,W*.05)
  }else if(k==='van'){g.fillStyle=body;rr(L,by-bh,W,bh,s*.22);g.fill();
    if(F){g.fillStyle=glass;g.fillRect(L+W*.08,by-bh*.9,W*.84,bh*.38)}
    else{g.fillStyle=glass;g.fillRect(L+W*.1,by-bh*.88,W*.36,bh*.3);g.fillRect(L+W*.54,by-bh*.88,W*.36,bh*.3);g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=Math.max(1,s*.03);g.beginPath();g.moveTo(x,by-bh*.94);g.lineTo(x,by-bh*.1);g.stroke();g.fillStyle='#e9e9e4';g.fillRect(x-W*.13,by-bh*.3,W*.26,bh*.09)}
    g.fillStyle=dark;g.fillRect(L,by-bh*.1,W,bh*.1);lights(by-bh*(F?.3:.5),W*.09,bh*.16,W*.03)
  }else if(k==='tractor'){const cw=W*.5;g.fillStyle=body;g.fillRect(x-cw/2,by-bh*.5,cw,bh*.5);g.fillStyle=glass;g.fillRect(x-cw*.55,by-bh,cw*1.1,bh*.5);g.strokeStyle=body;g.lineWidth=Math.max(1,s*.08);g.strokeRect(x-cw*.55,by-bh,cw*1.1,bh*.5);
    g.fillStyle=Math.sin(t*9)>0?'#ffb000':'#7a5200';g.fillRect(x-s*.1,by-bh-s*.16,s*.2,s*.16);lights(by-bh*.42,cw*.16,bh*.08,W*.26)
  }else{const sport=k==='sport',lowH=bh*(sport?.6:.52),ins=W*(k==='lada'?.08:k==='suv'?.06:.13);
    g.fillStyle=dark;g.beginPath();g.moveTo(L+ins*.4,by-lowH);g.lineTo(L+ins,by-bh);g.lineTo(L+W-ins,by-bh);g.lineTo(L+W-ins*.4,by-lowH);g.fill();
    g.fillStyle=glass;g.beginPath();g.moveTo(L+ins*.4+W*.05,by-lowH);g.lineTo(L+ins+W*.04,by-bh*.94);g.lineTo(L+W-ins-W*.04,by-bh*.94);g.lineTo(L+W-ins*.4-W*.05,by-lowH);g.fill();
    g.fillStyle=body;rr(L,by-lowH,W,lowH,s*.12);g.fill();g.fillStyle='rgba(0,0,0,.45)';g.fillRect(L,by-lowH*.2,W,lowH*.2);
    if(sport&&!F){g.fillStyle=dark;g.fillRect(L-W*.02,by-lowH-s*.1,W*1.04,s*.07);g.fillStyle=col(.8);g.fillRect(L+W*.05,by-lowH*.84,W*.9,lowH*.14);
      const ga=g.globalAlpha;g.globalCompositeOperation='lighter';g.globalAlpha=ga*(.25+A.beat*.4);g.fillStyle=col(.8);g.fillRect(L-W*.02,by-lowH*.95,W*1.04,lowH*.36);g.globalAlpha=ga;g.globalCompositeOperation='source-over'}
    else lights(by-lowH*(F?.72:.86),W*(k==='lada'?.14:.2),lowH*(k==='lada'?.3:.2),W*.04);
    if(!F){g.fillStyle='#e9e9e4';g.fillRect(x-W*.12,by-lowH*.52,W*.24,lowH*.2)}
    if(k==='taxi'){g.fillStyle='#fff6d0';g.fillRect(x-W*.12,by-bh-s*.14,W*.24,s*.14)}}
}

function makeRace(cfg){
  const SEG=3,N=130,PD=7.5,P=[];for(let i=0;i<=N+1;i++)P.push({});
  let st=null;
  function reset(){st={pos:0,px:cfg.home,v:cfg.vmax*.6,cars:[],next:45,score:0,combo:0,crashes:0,best:LS.get('best_'+cfg.id,0),ghost:0,shake:0,heading:0,lean:0,msg:'',msgT:0,auto:true,pt:null,baseN:0}}
  function spawn(){const s=st,z=s.next;s.next+=cfg.gap[0]+Math.random()*cfg.gap[1];
    const onc=cfg.lanes.filter(l=>l.dir<0),fwd=cfg.lanes.filter(l=>l.dir>0);
    if(onc.length&&Math.random()<cfg.oncoming){const l=onc[(Math.random()*onc.length)|0];s.cars.push(Object.assign(cfg.pick(),{z:z+60+Math.random()*40,x:l.x,v:-(17+Math.random()*8),front:true,passed:true}));return}
    const l=fwd[(Math.random()*fwd.length)|0],k=cfg.pick();s.cars.push(Object.assign(k,{z,x:l.x+(Math.random()-.5)*.4,v:cfg.vmax*k.sp*(.88+Math.random()*.24),passed:false}))}
  function update(dt,t){const s=st,pz=s.pos+PD,auto=t-lastInput>6;s.auto=auto;
    const cv0=cfg.curve(pz);let target=cfg.vmax*(A.live?.82+Math.min(1,A.level*1.4)*.28:.72),steer=0;
    if(auto){let bs=-1e9,tx=s.px;
      for(const l of cfg.lanes){let free=240;for(const c of s.cars){if(Math.abs(c.x-l.x)>2)continue;const d=c.z-pz;if(d<-8)continue;const e=c.v<0?(d<340?Math.max(0,(d-14)*.1):240):(d<9?0:d);if(e<free)free=e}
        const sc=free+(l.x===cfg.home?cfg.homeBias:0)+(Math.abs(l.x-s.px)<1.6?14:0)-(l.dir<0?40:0)-Math.abs(l.x-s.px)*2;if(sc>bs){bs=sc;tx=l.x}}
      let ahead=240,av=0;for(const c of s.cars){if(c.v<0||Math.abs(c.x-s.px)>1.95)continue;const d=c.z-pz;if(d>0&&d<ahead){ahead=d;av=c.v}}
      if(s.px<-.3&&cfg.oncoming){target*=1.3;for(const c of s.cars)if(c.v<0&&Math.abs(c.x-s.px)<2&&c.z>pz&&c.z-pz<260)target=6}if(ahead<14+Math.max(0,s.v-av)*2.6)target=Math.min(target,Math.max(2,av-1+(ahead-9)*.3));
      steer=clamp((tx-s.px)*1.6,-1,1)
    }else{steer=(keys.r?1:0)-(keys.l?1:0);if(keys.u)target*=1.25;if(keys.d)target=cfg.vmax*.22}
    s.v+=(target-s.v)*dt*(target<s.v?(auto?3.2:1.7):.55);
    if(Math.abs(s.px)>cfg.half-.6)s.v-=s.v*dt*.8;
    s.px+=steer*dt*(4+s.v*.14)-(auto?0:cv0*s.v*s.v*dt*.28);s.px=clamp(s.px,-cfg.lim,cfg.lim);
    s.lean+=(steer-s.lean)*Math.min(1,dt*8);s.pos+=s.v*dt;s.heading+=cv0*s.v*dt;
    s.ghost=Math.max(0,s.ghost-dt);s.shake=Math.max(0,s.shake-dt);s.msgT=Math.max(0,s.msgT-dt);
    while(s.next<s.pos+N*SEG-12)spawn();
    for(let i=s.cars.length-1;i>=0;i--){const c=s.cars[i];
      if(c.v>0){for(const o of s.cars)if(o!==c&&o.v>0&&o.v<c.v&&Math.abs(o.x-c.x)<1.7&&o.z>c.z&&o.z-c.z<12)c.v=o.v;
        if(Math.abs(c.x-s.px)<1.8&&pz>c.z&&pz-c.z<11&&c.v>s.v)c.v=Math.max(3,s.v)}
      c.z+=c.v*dt;
      if(c.z<s.pos-25){s.cars.splice(i,1);continue}
      if(!c.passed&&c.z<pz-4){c.passed=true;s.score++;s.combo++;if(s.combo>s.best){s.best=s.combo;LS.set('best_'+cfg.id,s.best)}if(s.combo%10===0){s.msg='Серия '+s.combo+'!';s.msgT=1.6}}
      if(s.ghost<=0&&Math.abs(c.z-pz)<(c.len||4.4)*.5+2.2&&Math.abs(c.x-s.px)<(c.w+cfg.player.w)*.5-.1){
        s.v=c.v>0?Math.max(6,c.v*.6):4;s.ghost=1.8;s.shake=.5;s.combo=0;s.crashes++;c.passed=true;s.msg='Бах!';s.msgT=1.2}}
  }
  function hud(w,h){const s=st,fs=Math.max(13,h*.026),f='"Segoe UI",sans-serif';g.fillStyle='rgba(0,0,0,.5)';rr(w-fs*21,6,fs*21-8,fs*5.6,10);g.fill();rr(8,8,fs*30,fs*1.9,10);g.fill();g.textBaseline='top';g.textAlign='right';g.shadowColor='rgba(0,0,0,.85)';g.shadowBlur=6;
    g.fillStyle='#fff';g.font='700 '+fs*2+'px '+f;g.fillText(Math.round(s.v*3.6)+' км/ч',w-20,14);
    g.font='600 '+fs+'px '+f;g.fillText('Обогнал: '+s.score,w-20,14+fs*2.5);g.fillText('Без аварий подряд: '+s.combo+' · рекорд '+s.best,w-20,14+fs*3.8);
    g.textAlign='center';g.fillText(s.auto?'Автопилот. Жми ← → и рули сам, ↑ газ, ↓ тормоз':'← → рулить · ↑ газ · ↓ тормоз',8+fs*15,14);
    if(s.msgT>0){g.font='800 '+fs*2.6+'px '+f;g.globalAlpha=Math.min(1,s.msgT*2);g.fillStyle=col(.9);g.fillText(s.msg,w/2,h*.2);g.globalAlpha=1}
    g.shadowBlur=0;g.textAlign='start';g.textBaseline='alphabetic'}
  return {name:cfg.name,grp:'Рандом и игры',game:true,get st(){return st},enter(){reset()},
  draw(w,h,t,dt){if(!st)reset();update(Math.min(dt,.05),t);const s=st;
    const hy=h*.44+(s.shake>0?(Math.random()-.5)*h*.04*s.shake:0),Fp=h*1.05,base=Math.floor(s.pos/SEG),fr=s.pos-base*SEG,camY=cfg.hill(s.pos+PD*.5)+cfg.camH,pz=s.pos+PD;
    s.baseN=base;s.pt=null;cfg.sky(w,h,hy,s,t);
    let cx=0,dcx=-cfg.curve(base*SEG)*fr;
    for(let k=0;k<=N;k++){const z=(base+k)*SEG,dz=Math.max(.7,z-s.pos),p=P[k];p.z=z;p.sc=Fp/dz;p.cx=cx;p.x=w/2+(cx-s.px)*p.sc;p.y=hy+(camY-cfg.hill(z))*p.sc;p.f=Math.pow(Math.min(1,dz/(N*SEG)),1.7);cx+=dcx*SEG;dcx+=cfg.curve(z)*SEG}
    const bk={};for(const c of s.cars){const k=Math.floor(c.z/SEG)-base;if(k>=1&&k<N)(bk[k]||(bk[k]=[])).push(c)}
    const kp=Math.floor(pz/SEG)-base;(bk[kp]||(bk[kp]=[])).push({player:true,z:pz,x:s.px});
    const hf=cfg.half,sh=cfg.sh;
    for(let k=N-1;k>=1;k--){const a=P[k+1],b=P[k],n=base+k,par=(n>>1)&1,f=b.f;
      if(b.y>a.y){
        quad(-w,a.x,a.y,-w,b.x,b.y,mix3(cfg.groundL[par],cfg.fog,f));quad(a.x,2*w,a.y,b.x,2*w,b.y,mix3(cfg.groundR[par],cfg.fog,f));
        quad(a.x-(hf+sh)*a.sc,a.x+(hf+sh)*a.sc,a.y,b.x-(hf+sh)*b.sc,b.x+(hf+sh)*b.sc,b.y,mix3(cfg.shoulder,cfg.fog,f));
        quad(a.x-hf*a.sc,a.x+hf*a.sc,a.y,b.x-hf*b.sc,b.x+hf*b.sc,b.y,mix3(cfg.road[par],cfg.fog,f));
        if(b.sc>1.2){const lc=mix3(cfg.edgeLine,cfg.fog,f);
          for(const e of [-hf+.35,hf-.35])quad(a.x+(e-.09)*a.sc,a.x+(e+.09)*a.sc,a.y,b.x+(e-.09)*b.sc,b.x+(e+.09)*b.sc,b.y,lc);
          if(n%4<2){const dc=mix3(cfg.line,cfg.fog,f);for(const e of cfg.div)quad(a.x+(e-.08)*a.sc,a.x+(e+.08)*a.sc,a.y,b.x+(e-.08)*b.sc,b.x+(e+.08)*b.sc,b.y,dc)}
          if(cfg.patch&&h1(n*9.7)>.8){const e=h1(n*4.3)*5-2.5;quad(a.x+(e-.7)*a.sc,a.x+(e+.7)*a.sc,a.y,b.x+(e-.7)*b.sc,b.x+(e+.7)*b.sc,b.y,mix3([78,80,84],cfg.fog,f))}}
        if(cfg.edge)cfg.edge(a,b,n,par)}
      cfg.scenery(b,n,s,t,w,h);
      const cs=bk[k];if(cs){cs.sort((p,q)=>q.z-p.z);for(const c of cs){const u=(c.z-b.z)/SEG,dz=Math.max(.7,c.z-s.pos),sc=Fp/dz,x=w/2+(b.cx+(a.cx-b.cx)*u+c.x-s.px)*sc,y=hy+(camY-cfg.hill(c.z))*sc;
        if(c.player){g.save();g.translate(x,y);g.rotate(s.lean*.035);if(s.ghost>0&&Math.sin(t*30)>0)g.globalAlpha=.4;drawCar(0,0,sc,cfg.player,t,cfg.night);g.restore()}
        else{g.globalAlpha=1-f*.8;drawCar(x,y,sc,c,t,cfg.night);g.globalAlpha=1}}}}
    hud(w,h)}}}

/* --- Нью-Йорк --- */
const SKYB=[];{let x=0,i=0;while(x<6){const big=h1(i*3.1)>.8,bw=.05+h1(i*1.7)*.07,bh=(big?.24:.07)+h1(i*2.3)*(big?.16:.13);SKYB.push({x,w:bw,h:bh,top:big?(h1(i*5.9)*3|0):-1,i});x+=bw+.004;i++}}
const CARCOL=[[200,200,205],[40,44,52],[150,24,30],[30,70,150],[90,96,104],[236,236,232],[24,90,60]];
const NY={id:'ny',name:'Шоссе: Нью-Йорк',vmax:52,half:7.3,lim:6.25,camH:2.6,home:1.75,homeBias:0,sh:.5,night:.6,
  lanes:[{x:-5.25,dir:1},{x:-1.75,dir:1},{x:1.75,dir:1},{x:5.25,dir:1}],div:[-3.5,0,3.5],gap:[15,32],oncoming:0,
  curve:z=>.0016*Math.sin(z/420)+.0011*Math.sin(z/170+2),hill:z=>5*Math.sin(z/330)+2.5*Math.sin(z/140+1),
  fog:[30,18,48],road:[[40,41,48],[35,36,43]],groundL:[[14,15,20],[12,13,18]],groundR:[[14,15,20],[12,13,18]],shoulder:[56,56,62],line:[228,228,216],edgeLine:[232,190,60],
  player:{kind:'sport',w:1.9,h:1.15,col:[220,30,50]},
  pick(){const r=Math.random(),c=CARCOL[(Math.random()*CARCOL.length)|0];
    if(r<.36)return {kind:'taxi',w:1.8,h:1.3,col:[245,197,24],sp:.56};if(r<.6)return {kind:'sedan',w:1.8,h:1.25,col:c,sp:.6};if(r<.78)return {kind:'suv',w:1.95,h:1.6,col:c,sp:.58};
    if(r<.9)return {kind:'truck',w:2.5,h:3.4,len:10,col:c,box:[222,224,228],sp:.46};return {kind:'bus',w:2.5,h:3,len:11,col:[230,232,236],sp:.44}},
  sky(w,h,hy,s,t){const gr=g.createLinearGradient(0,0,0,hy);gr.addColorStop(0,'#03040c');gr.addColorStop(.6,'#120f30');gr.addColorStop(1,'#3b1d4f');g.fillStyle=gr;g.fillRect(0,0,w,hy+2);
    const g2=g.createLinearGradient(0,hy-h*.24,0,hy);g2.addColorStop(0,cola(.6,0));g2.addColorStop(1,cola(.6,.2+A.bass*.3));g.fillStyle=g2;g.fillRect(0,hy-h*.24,w,h*.24+2);
    g.fillStyle='#f3efe0';g.beginPath();g.arc(w*.84,h*.1,h*.032,0,7);g.fill();
    for(let i=0;i<60;i++){g.fillStyle='rgba(255,255,255,'+(.3+.5*h1(i*3.3)).toFixed(2)+')';g.fillRect(h1(i*1.1)*w,h1(i*2.7)*hy*.7,1.5,1.5)}
    const lit=new Path2D(),eq=new Path2D();
    for(const b of SKYB){const X=((b.x-s.heading*.6)%6+6)%6*h-h*.3,bw=b.w*h,bh=b.h*h,Y=hy-bh;if(X>w||X+bw<0)continue;
      g.fillStyle=b.top>=0?'#0c0d1c':'#090a15';g.fillRect(X,Y,bw,bh+2);
      if(b.top===0){g.fillRect(X+bw*.25,Y-bh*.14,bw*.5,bh*.14);g.fillRect(X+bw*.4,Y-bh*.24,bw*.2,bh*.1);g.fillRect(X+bw*.485,Y-bh*.46,bw*.03,bh*.22)}
      else if(b.top===1){g.beginPath();g.moveTo(X,Y);g.lineTo(X+bw*.5,Y-bh*.2);g.lineTo(X+bw,Y);g.fill();g.fillRect(X+bw*.485,Y-bh*.4,bw*.03,bh*.2)}
      else if(b.top===2){g.beginPath();g.moveTo(X+bw*.15,Y);g.quadraticCurveTo(X+bw*.5,Y-bh*.5,X+bw*.5,Y-bh*.5);g.quadraticCurveTo(X+bw*.5,Y-bh*.5,X+bw*.85,Y);g.fill();g.fillRect(X+bw*.49,Y-bh*.62,bw*.02,bh*.14)}
      if(b.top>=0&&Math.sin(t*3+b.i)>0){g.fillStyle='#ff3030';g.fillRect(X+bw*.5-1.5,Y-bh*(b.top===2?.62:b.top===1?.4:.46)-3,3,3)}
      const ws=Math.max(3,h*.011),cols=Math.floor(bw/ws),rows=Math.floor(bh/(ws*1.25)),lvl=A.bands[(b.i*7)%48]*rows;
      for(let r=0;r<rows;r++)for(let q=0;q<cols;q++){const hh=h1(b.i*17.3+r*5.1+q*2.3);if(hh<.45)continue;(r<lvl?eq:lit).rect(X+q*ws+ws*.25,hy-(r+1)*ws*1.25,ws*.5,ws*.6)}}
    g.fillStyle='#6b5a2e';g.fill(lit);g.fillStyle=col(.75);g.fill(eq);
    g.fillStyle='#0a0b10';g.fillRect(0,hy,w,h-hy)},
  edge(a,b,n,par){const hb=.95,c=mix3(par?[122,122,128]:[104,104,112],this.fog,b.f),c2=mix3([150,150,156],this.fog,b.f);
    for(const sg of[-1,1]){const xa=a.x+sg*this.half*a.sc,xb=b.x+sg*this.half*b.sc,xa2=xa+sg*.45*a.sc,xb2=xb+sg*.45*b.sc;
      g.fillStyle=c;g.beginPath();g.moveTo(xa,a.y-hb*a.sc);g.lineTo(xb,b.y-hb*b.sc);g.lineTo(xb,b.y+.7);g.lineTo(xa,a.y);g.fill();
      g.fillStyle=c2;g.beginPath();g.moveTo(xa,a.y-hb*a.sc);g.lineTo(xb,b.y-hb*b.sc);g.lineTo(xb2,b.y-hb*b.sc);g.lineTo(xa2,a.y-hb*a.sc);g.fill()}},
  scenery(b,n,s,t,w,h){const sc=b.sc;if(sc<.5)return;const al=1-b.f*.9,fog=this.fog;
    if(n%5===0)for(const sg of[-1,1]){const hh=h1(n*1.37+sg*7);if(hh<.25)continue;const wd=12+hh*10,ht=22+h1(n*2.9+sg)*70,x=b.x+sg*(17+hh*16+wd/2)*sc;if(x+wd*sc<0||x-wd*sc>w)continue;
      g.globalAlpha=al;g.drawImage(WT[(hh*30|0)%3],x-wd/2*sc,b.y-ht*sc,wd*sc,ht*sc+2);g.globalAlpha=1}
    if(n%8===0)for(const sg of[-1,1]){const x=b.x+sg*8.3*sc,top=b.y-9*sc;g.strokeStyle=mix3([70,72,80],fog,b.f);g.lineWidth=Math.max(1,.16*sc);g.beginPath();g.moveTo(x,b.y);g.lineTo(x,top);g.lineTo(x-sg*2.2*sc,top);g.stroke();
      const r=sc*(2.6+A.beat*1.3);g.globalCompositeOperation='lighter';g.globalAlpha=al;g.drawImage(GLOW,x-sg*2.2*sc-r,top-r,r*2,r*2);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
    if(n%110===55){const xl=b.x-8.5*sc,xr=b.x+8.5*sc,top=b.y-7.6*sc;g.strokeStyle=mix3([90,94,100],fog,b.f);g.lineWidth=Math.max(1,.3*sc);g.beginPath();g.moveTo(xl,b.y);g.lineTo(xl,top);g.lineTo(xr,top);g.lineTo(xr,b.y);g.stroke();
      const names=['Manhattan','Brooklyn Br','Times Sq','FDR Drive','Queens','JFK'];
      for(let j=0;j<2;j++){const sx=b.x+(j?1.2:-6.6)*sc,sw=5.4*sc,sh=2.2*sc,sy=top-sh*.25;g.fillStyle=mix3([16,110,60],fog,b.f);g.fillRect(sx,sy,sw,sh);g.strokeStyle=mix3([232,239,232],fog,b.f);g.lineWidth=Math.max(1,.06*sc);g.strokeRect(sx+.1*sc,sy+.1*sc,sw-.2*sc,sh-.2*sc);
        if(sc>5){g.fillStyle='#fff';g.font='600 '+(sh*.36)+'px "Segoe UI",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(names[((n/110|0)+j*3)%6],sx+sw/2,sy+sh/2);g.textAlign='start';g.textBaseline='alphabetic'}}}
    if(n%330===200){const o=v=>b.x+v*sc,yy=v=>b.y-v*sc;g.fillStyle=mix3([92,80,72],fog,b.f);g.beginPath();g.rect(o(-12.5),yy(34),25*sc,34*sc);
      g.moveTo(o(-7.9),yy(0));g.lineTo(o(-7.9),yy(12));g.quadraticCurveTo(o(-7.4),yy(21),o(0),yy(25));g.quadraticCurveTo(o(7.4),yy(21),o(7.9),yy(12));g.lineTo(o(7.9),yy(0));g.closePath();g.fill('evenodd');
      g.fillStyle=mix3([70,60,54],fog,b.f);g.fillRect(o(-13),yy(35),26*sc,1.2*sc)}
    if(n%47===20){const sg=h1(n*.91)>.5?1:-1,x=b.x+sg*13.5*sc,pw=9*sc,ph=4.2*sc,py=b.y-10.5*sc;g.globalAlpha=al;g.fillStyle='#2a2c34';g.fillRect(x-.2*sc,py+ph,.4*sc,6.3*sc);
      g.fillStyle=colm(.45,.55);g.fillRect(x-pw/2,py,pw,ph);g.strokeStyle=col(.9);g.lineWidth=Math.max(1,.12*sc);g.strokeRect(x-pw/2,py,pw,ph);
      if(sc>3.5){const tr=tracks[cur];g.fillStyle='#fff';g.font='700 '+(ph*.3)+'px "Segoe UI",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(fit(tr?tr.title:'ВЕРТУШКА',pw*.9),x,py+ph/2);g.textAlign='start';g.textBaseline='alphabetic'}
      g.globalAlpha=1}}
};

/* --- Россия, поле --- */
function birch(x,y,sc,sd,t,f,fog){const ht=(7+sd%4)*sc,tw=Math.max(1,.32*sc),sw=Math.sin(t*1.4+sd)*.25*sc*(1+A.level);
  g.fillStyle=mix3([236,236,228],fog,f);g.fillRect(x-tw/2,y-ht*.8,tw,ht*.8);
  if(sc>5){g.fillStyle='#2a2a2a';for(let i=0;i<5;i++)g.fillRect(x-tw/2+(i%2?tw*.45:0),y-ht*(.12+i*.13),tw*.55,Math.max(1,.07*sc))}
  const cols=[[58,128,52],[76,150,60],[98,170,70]];
  for(let i=0;i<4;i++){g.fillStyle=mix3(cols[i%3],fog,f);g.beginPath();g.ellipse(x+sw*(.5+i*.3)+((i%2)-.5)*1.3*sc,y-ht*(.62+i*.12),(1.9-i*.25)*sc,(1.5-i*.15)*sc,0,0,7);g.fill()}}
const LADA=[[222,205,160],[236,236,232],[170,30,30],[40,70,150],[78,34,78],[40,110,70],[150,150,150]];
const SELO=['Берёзовка','Малые Васюки','Простоквашино','Ромашково','Васильки','Гадюкино'];
const RU={id:'ru',name:'Трасса: поле в России',vmax:36,half:3.7,lim:5.2,camH:3.3,home:1.85,homeBias:30,sh:1.7,night:1,patch:true,
  lanes:[{x:-1.85,dir:-1},{x:1.85,dir:1}],div:[0],gap:[40,60],oncoming:.3,
  curve:z=>.0022*Math.sin(z/310)+.0016*Math.sin(z/125+1),hill:z=>8*Math.sin(z/230)+4*Math.sin(z/95+1),
  fog:[205,228,242],road:[[104,106,110],[97,99,103]],groundL:[[216,180,66],[205,169,58]],groundR:[[98,162,62],[88,150,56]],shoulder:[160,145,118],line:[236,236,230],edgeLine:[214,214,208],
  player:{kind:'van',w:1.95,h:2.15,col:[238,240,242]},
  pick(){const r=Math.random();
    if(r<.46)return {kind:'lada',w:1.62,h:1.32,col:LADA[(Math.random()*LADA.length)|0],sp:.62};if(r<.6)return {kind:'van',w:1.9,h:2.05,col:[122,138,112],sp:.55};
    if(r<.8)return {kind:'truck',w:2.5,h:3.3,len:9,col:[226,110,30],box:[150,160,170],sp:.5};if(r<.9)return {kind:'tractor',w:2.1,h:2.5,col:[40,90,190],sp:.28};
    return {kind:'suv',w:1.9,h:1.65,col:LADA[(Math.random()*LADA.length)|0],sp:.66}},
  sky(w,h,hy,s,t){const gr=g.createLinearGradient(0,0,0,hy);gr.addColorStop(0,'#2f7fd6');gr.addColorStop(.7,'#9fd0f4');gr.addColorStop(1,'#dff0fb');g.fillStyle=gr;g.fillRect(0,0,w,hy+2);
    const off=s.heading*h*.7,PW=Math.max(3*h,w*1.4),wrap=v=>((v%PW)+PW)%PW-PW*.15;
    const sx=wrap(w*.75-off*.3),sy=h*.13,sr=h*(.045+A.bass*.012),sg=g.createRadialGradient(sx,sy,sr*.5,sx,sy,sr*(5+A.beat*1.5));sg.addColorStop(0,'rgba(255,250,210,.9)');sg.addColorStop(1,'rgba(255,250,210,0)');
    g.fillStyle=sg;g.fillRect(sx-sr*7,sy-sr*7,sr*14,sr*14);g.fillStyle='#fffbe0';g.beginPath();g.arc(sx,sy,sr,0,7);g.fill();
    g.fillStyle='rgba(255,255,255,.88)';for(let i=0;i<8;i++){const cx=wrap(h1(i*7.7)*PW-off*.5+t*h*.004*(1+i%3)),cy=h*(.07+h1(i*3.1)*.22),r=h*(.03+h1(i*5.3)*.03);
      for(let j=0;j<4;j++){g.beginPath();g.ellipse(cx+(j-1.5)*r*1.1,cy+(j%2)*r*.3,r*1.4,r*(.75+.2*(j%2)),0,0,7);g.fill()}}
    g.fillStyle='#55855c';g.beginPath();g.moveTo(0,hy+2);for(let x=0;x<=w+14;x+=14)g.lineTo(x,hy-h*(.014+.03*vnoise((x+off)/(h*.06))));g.lineTo(w,hy+2);g.fill();
    const cx=wrap(PW*.55-off),u=h*.012,y0=hy-h*.012;
    g.fillStyle='#f4f1e8';g.fillRect(cx-u*2,y0-u*5,u*4,u*5);g.fillRect(cx+u*2.6,y0-u*3,u*2.4,u*3);g.fillStyle='#3f7a52';g.beginPath();g.moveTo(cx-u*2.4,y0-u*5);g.lineTo(cx,y0-u*7);g.lineTo(cx+u*2.4,y0-u*5);g.fill();
    g.fillStyle='#f4f1e8';g.fillRect(cx-u*.7,y0-u*8.4,u*1.4,u*1.8);
    g.fillStyle='#e3b23c';g.beginPath();g.moveTo(cx-u*.7,y0-u*8.4);g.bezierCurveTo(cx-u*2.2,y0-u*10,cx-u*.4,y0-u*11,cx,y0-u*12.2);g.bezierCurveTo(cx+u*.4,y0-u*11,cx+u*2.2,y0-u*10,cx+u*.7,y0-u*8.4);g.fill();
    g.fillRect(cx-u*.1,y0-u*13.6,u*.2,u*1.5);g.fillRect(cx-u*.45,y0-u*13.1,u*.9,u*.2);
    for(let i=0;i<6;i++){const hx=cx+(i<3?-1:1)*u*(6+(i%3)*5),hw=u*3,hh=u*1.8;g.fillStyle=['#8a6a4a','#b08a60','#6f7f8f'][i%3];g.fillRect(hx,y0-hh,hw,hh);g.fillStyle='#5a3d30';g.beginPath();g.moveTo(hx-u*.3,y0-hh);g.lineTo(hx+hw/2,y0-hh-u*1.5);g.lineTo(hx+hw+u*.3,y0-hh);g.fill()}
    g.fillStyle='#b8c98c';g.fillRect(0,hy,w,h-hy)},
  scenery(b,n,s,t,w,h){const sc=b.sc;if(sc<.6)return;const fog=this.fog,k=n-s.baseN;
    if(n%12===0){const x=b.x-6.7*sc,top=b.y-8*sc;g.strokeStyle=mix3([92,70,50],fog,b.f);g.lineWidth=Math.max(1,.22*sc);g.beginPath();g.moveTo(x,b.y);g.lineTo(x,top);g.moveTo(x-.9*sc,top+.6*sc);g.lineTo(x+.9*sc,top+.6*sc);g.stroke();
      if(s.pt){g.strokeStyle='rgba(30,30,30,'+(.75*(1-b.f)).toFixed(2)+')';g.lineWidth=1;g.beginPath();g.moveTo(s.pt[0],s.pt[1]);g.quadraticCurveTo((s.pt[0]+x)/2,(s.pt[1]+top+.6*sc)/2+.7*sc,x,top+.6*sc);g.stroke()}
      s.pt=[x,top+.6*sc]}
    for(const sg of[-1,1]){const hh=h1(n*1.31+sg*3.3);if(hh>(sg<0?.7:.78)){const x=b.x+sg*((sg<0?9.5:14)+h1(n*2.17+sg)*16)*sc;if(x>-80&&x<w+80)birch(x,b.y,sc,hh*100,t,b.f,fog)}}
    if(h1(n*3.71)>.94){const x=b.x-(9+h1(n*1.9)*22)*sc,r=.9*sc;g.fillStyle=mix3([196,160,70],fog,b.f);g.beginPath();g.ellipse(x,b.y-r,r*1.15,r,0,0,7);g.fill();g.strokeStyle=mix3([150,118,48],fog,b.f);g.lineWidth=Math.max(1,.08*sc);g.beginPath();g.ellipse(x,b.y-r,r*.6,r*.55,0,0,7);g.stroke()}
    if(h1(n*.773)>.972){const sg=h1(n*.31)>.5?1:-1,x=b.x+sg*(21+h1(n)*12)*sc,bw=7*sc,bh=3.2*sc;g.fillStyle=mix3([124,88,54],fog,b.f);g.fillRect(x-bw/2,b.y-bh,bw,bh);
      g.fillStyle=mix3([88,60,46],fog,b.f);g.beginPath();g.moveTo(x-bw*.56,b.y-bh);g.lineTo(x,b.y-bh-2.4*sc);g.lineTo(x+bw*.56,b.y-bh);g.fill();
      g.fillStyle=mix3([240,244,248],fog,b.f);g.fillRect(x-.8*sc,b.y-bh*.75,1.6*sc,1.3*sc);g.fillStyle=mix3([70,130,190],fog,b.f);g.fillRect(x-.6*sc,b.y-bh*.69,1.2*sc,.95*sc)}
    if(k<38&&sc>2.2)for(let r=0;r<3;r++){const x=b.x+(6+r*1.25+h1(n*3.3+r)*.8)*sc,hh=(1.5+h1(n*5.1+r)*.5)*sc,hr=(.26+A.beat*.05+A.bass*.05)*sc;
      g.strokeStyle='#3d7a2c';g.lineWidth=Math.max(1,.07*sc);g.beginPath();g.moveTo(x,b.y);g.lineTo(x,b.y-hh);g.stroke();g.fillStyle='#f6c518';g.beginPath();g.arc(x,b.y-hh,hr,0,7);g.fill();g.fillStyle='#5a3310';g.beginPath();g.arc(x,b.y-hh,hr*.45,0,7);g.fill()}
    if(n%150===75||n%150===0){const x=b.x+5.5*sc;g.strokeStyle=mix3([120,124,128],fog,b.f);g.lineWidth=Math.max(1,.1*sc);g.beginPath();g.moveTo(x,b.y);g.lineTo(x,b.y-2.4*sc);g.stroke();
      if(n%150===75){const sw=2.8*sc,sh=.85*sc,sy=b.y-3.1*sc;g.fillStyle=mix3([248,248,246],fog,b.f);g.fillRect(x-sw/2,sy,sw,sh);g.strokeStyle='#222';g.lineWidth=Math.max(1,.05*sc);g.strokeRect(x-sw/2,sy,sw,sh);
        if(sc>6){g.fillStyle='#111';g.font='700 '+(sh*.5)+'px "Segoe UI",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(SELO[(n/150|0)%SELO.length],x,sy+sh/2);g.textAlign='start';g.textBaseline='alphabetic'}}
      else{const r=.5*sc,sy=b.y-2.9*sc;g.fillStyle='#fff';g.beginPath();g.arc(x,sy,r,0,7);g.fill();g.strokeStyle='#d21f1f';g.lineWidth=Math.max(1,.12*sc);g.stroke();
        if(sc>6){g.fillStyle='#111';g.font='700 '+(r*.9)+'px "Segoe UI",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('90',x,sy);g.textAlign='start';g.textBaseline='alphabetic'}}}}
};
const VIZX=[VIZRND,makeRace(NY),makeRace(RU)];

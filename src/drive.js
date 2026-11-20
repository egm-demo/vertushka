/* ---------- игры: 3D-гонка в потоке (three.js), рулит игрок ---------- */
const keys={};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const h1=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const vnoise=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return h1(i)*(1-u)+h1(i+1)*u};
function curGame(){const v=VIZ[vizIdx];return v&&v.game?v:null}
function gameKey(c,down,rep){const gm=curGame();if(!gm)return false;if(gm.garKey&&gm.garKey(c,down,rep))return true;
  const m={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d',ShiftLeft:'n',ShiftRight:'n',Space:'h'}[c];
  if(m){keys[m]=down;if(down&&m==='u'&&!rep)gm.gas();return true}
  if(c==='Enter'){if(down&&!rep)gm.restart();return true}
  if(c==='KeyC'){if(down&&!rep)gm.nextCam();return true}
  return false}
addEventListener('keyup',e=>{gameKey(e.code,false)});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});

/* ---------- телефоны: сенсорное управление, вырезы экрана, качество ---------- */
let TOUCH=(window.matchMedia&&matchMedia('(pointer:coarse)').matches)||navigator.maxTouchPoints>0&&/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const SAFE={t:0,r:0,b:0,l:0},TCI={gb:0,db:0,cw:0,top:0,mode:'off'};
const fovFit=(f,a)=>a>=1.25?f:Math.min(Math.max(f,2*Math.atan(Math.tan(f*Math.PI/360)*1.25/a)*180/Math.PI),f+30,92);
(()=>{const st_=$('#stage');if(!st_)return;
  const pr=document.createElement('div');pr.style.cssText='position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';document.body.appendChild(pr);
  const rdSafe=()=>{const o=window.__safe;if(o){Object.assign(SAFE,o);return}const c=getComputedStyle(pr);SAFE.t=parseFloat(c.paddingTop)||0;SAFE.r=parseFloat(c.paddingRight)||0;SAFE.b=parseFloat(c.paddingBottom)||0;SAFE.l=parseFloat(c.paddingLeft)||0};
  const tc=document.createElement('div');tc.id='tc';tc.dataset.m='off';
  tc.innerHTML='<div class="tct-row"><button class="tct" data-a="cam">Вид</button><button class="tct d" data-a="gar">Гараж</button><button class="tct fs" data-a="fs">⛶</button><button class="tct" data-a="exit">✕</button></div>'+
    '<button class="tcb d st l" data-k="ArrowLeft">◀</button><button class="tcb d st r" data-k="ArrowRight">▶</button><button class="tcb d dr" data-k="Space">ДРИФТ</button>'+
    '<button class="tcb d brk" data-k="ArrowDown">ТОРМОЗ</button><button class="tcb d gas" data-k="ArrowUp">ГАЗ</button><button class="tcb d nit" data-k="ShiftLeft">НИТРО</button>'+
    '<button class="tcb g gl" data-k="ArrowLeft">◀</button><button class="tcb g gr" data-k="ArrowRight">▶</button><button class="tcb g gcol" data-k="ArrowDown">Цвет</button><button class="tcb g go" data-k="Enter">ПОЕХАТЬ</button>'+
    '<div class="tc-rot">Поверни телефон боком — так удобнее</div>';
  st_.appendChild(tc);
  if(!(document.fullscreenEnabled||document.webkitFullscreenEnabled))tc.querySelector('.fs').remove();
  const cnt={},pk=new Map();
  const press=(k,dn)=>{cnt[k]=Math.max(0,(cnt[k]||0)+(dn?1:-1));const on=cnt[k]>0;tc.querySelectorAll('[data-k="'+k+'"]').forEach(e=>e.classList.toggle('on',on));
    if(dn&&cnt[k]===1)gameKey(k,true,false);else if(!dn&&cnt[k]===0)gameKey(k,false)};
  const keyAt=(x,y)=>{const e=document.elementFromPoint(x,y),b=e&&e.closest&&e.closest('#tc .tcb');return b&&b.offsetParent?b.dataset.k:null};
  const vib=()=>{try{navigator.vibrate&&navigator.vibrate(8)}catch(e){}};
  tc.addEventListener('pointerdown',e=>{const b=e.target.closest('.tcb,.tct');if(!b)return;e.preventDefault();TOUCH=true;
    if(b.classList.contains('tct')){const a=b.dataset.a;vib();if(a==='cam')gameKey('KeyC',true,false);else if(a==='gar')gameKey('KeyG',true,false);
      else if(a==='fs'){const de=document.documentElement;if(document.fullscreenElement||document.webkitFullscreenElement)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{const p=(de.requestFullscreen||de.webkitRequestFullscreen).call(de);if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(e){}}).catch(()=>{})}}
      else if(a==='exit')stepViz(1);return}
    const k=b.dataset.k;pk.set(e.pointerId,k);press(k,true);vib()},{passive:false});
  tc.addEventListener('pointermove',e=>{if(!pk.has(e.pointerId))return;const k=keyAt(e.clientX,e.clientY),o=pk.get(e.pointerId);
    if(k&&k!==o&&TCI.mode==='drive'){press(o,false);pk.set(e.pointerId,k);press(k,true);vib()}});
  const up=e=>{if(!pk.has(e.pointerId))return;press(pk.get(e.pointerId),false);pk.delete(e.pointerId)};
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>tc.addEventListener(n,up));
  const relAll=()=>{for(const [id,k] of pk)press(k,false);pk.clear()};
  addEventListener('blur',relAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)relAll()});
  // свайп по экрану в гараже = листать машины
  let sw=null;st_.addEventListener('pointerdown',e=>{if(e.target.closest('#tc .tcb,#tc .tct'))return;if(e.pointerType==='touch')TOUCH=true;sw=[e.clientX,e.clientY,e.pointerId]});
  st_.addEventListener('pointerup',e=>{if(!sw||sw[2]!==e.pointerId)return;const dx=e.clientX-sw[0],dy=e.clientY-sw[1];sw=null;
    if(TCI.mode==='gar'&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3){const k=dx<0?'ArrowRight':'ArrowLeft';gameKey(k,true,false);gameKey(k,false)}
    else if(TCI.mode==='gar'&&Math.abs(dy)>45&&Math.abs(dy)>Math.abs(dx)*1.3){const k=dy<0?'ArrowUp':'ArrowDown';gameKey(k,true,false);gameKey(k,false)}});
  document.addEventListener('touchmove',e=>{if(TCI.mode!=='off')e.preventDefault()},{passive:false});
  document.addEventListener('gesturestart',e=>e.preventDefault());
  document.addEventListener('contextmenu',e=>{if(TCI.mode!=='off'&&e.target.closest('#stage'))e.preventDefault()});
  const R_=e=>e.getBoundingClientRect();
  const loop=()=>{requestAnimationFrame(loop);const gm=curGame();
    const m=!TOUCH||!gm?'off':gm.loading?'load':gm.garage?'gar':'drive';
    if(m!==TCI.mode){if(m!=='drive')relAll();TCI.mode=m;tc.dataset.m=m;document.body.classList.toggle('mgame',m!=='off');rdSafe()}
    if(m==='off')return;
    if(!loop.k||++loop.k>30){loop.k=1;rdSafe()}
    const sr=R_(st_);
    tc.classList.toggle('port',sr.height>sr.width*1.05);
    TCI.top=R_(tc.querySelector('.tct-row')).bottom-sr.top+6;
    if(m==='gar')TCI.gb=sr.bottom-R_(tc.querySelector('.go')).top+10;
    if(m==='drive'){const a=R_(tc.querySelector('.dr')),b=R_(tc.querySelector('.nit')),c=R_(tc.querySelector('.st.r'));TCI.db=sr.bottom-Math.min(a.top,b.top)+8;TCI.cw=c.right-sr.left+10}};
  requestAnimationFrame(loop);
  addEventListener('resize',rdSafe);addEventListener('orientationchange',()=>setTimeout(rdSafe,300));
})();
const g3=$('#g3');let R3=null,r3fail=false;
function r3init(){if(R3)return R3;if(r3fail||!window.THREE)return null;
  try{R3=new THREE.WebGLRenderer({canvas:g3,antialias:true,powerPreference:'high-performance'})}catch(e){r3fail=true;console.error('three: '+e);return null}
  if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;
  R3.outputEncoding=THREE.sRGBEncoding;R3.toneMapping=THREE.ACESFilmicToneMapping;R3.toneMappingExposure=1.12;R3.shadowMap.enabled=true;R3.shadowMap.type=TOUCH?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;R3.setPixelRatio(1);return R3}

const DRIVE=(()=>{
const SEG=5,KN=150,BACK=6,G=9.81,PN=260,LPN=140,SMN=150,SKN=700,NEON=[0xff2a6d,0x05d9e8,0xfcee0a,0xb967ff,0x01ff89,0xff7b00];
let T=null,glowTex,noiseTex,shTex,M4,Q,V1,V2,EU;const geos={};
function ctex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,R3.capabilities.getMaxAnisotropy());return t}
function boot(){if(T)return;T=THREE;M4=new T.Matrix4();Q=new T.Quaternion();V1=new T.Vector3();V2=new T.Vector3();EU=new T.Euler();
  glowTex=ctex(64,64,x=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});
  shTex=ctex(64,64,x=>{const gr=x.createRadialGradient(32,32,4,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.9)');gr.addColorStop(.6,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});
  noiseTex=ctex(256,256,x=>{x.fillStyle='#fff';x.fillRect(0,0,256,256);for(let i=0;i<7000;i++){x.fillStyle='rgba(0,0,0,'+(.03+Math.random()*.1).toFixed(3)+')';x.fillRect(Math.random()*256,Math.random()*256,1+Math.random()*3,1+Math.random()*3)}},true)}
function setI(im,i,x,y,z,ry,sx,sy,sz,rx){EU.set(rx||0,ry||0,0,'YXZ');Q.setFromEuler(EU);V1.set(x,y,z);V2.set(sx,sy,sz);M4.compose(V1,Q,V2);im.setMatrixAt(i,M4)}
function merge(parts){parts.sort((a,b)=>a[1]-b[1]);let n=0;const gs=parts.map(p=>{const ge=p[0].index?p[0].toNonIndexed():p[0];n+=ge.attributes.position.count;return ge});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2),out=new T.BufferGeometry();let o=0;
  gs.forEach((ge,i)=>{const c=ge.attributes.position.count;pos.set(ge.attributes.position.array,o*3);nor.set(ge.attributes.normal.array,o*3);if(ge.attributes.uv)uv.set(ge.attributes.uv.array,o*2);
    const last=out.groups[out.groups.length-1];if(last&&last.materialIndex===parts[i][1])last.count+=c;else out.addGroup(o,c,parts[i][1]);o+=c});
  out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('uv',new T.BufferAttribute(uv,2));return out}

/* --- машины: материалы 0 краска, 1 стекло, 2 чёрный пластик/шины, 3 фары, 4 стопы, 5 металл --- */
const CARS={
  sport:{W:1.92,m:1350,wr:.34,ax:[1.38,-1.32],hy:.44,ty:.74,body:[[-2.2,.3],[-2.25,.7],[-1.95,.86],[-1,.84],[.7,.76],[1.8,.64],[2.25,.52],[2.22,.3]],cab:[[-1.55,.84],[-.95,1.17],[0,1.19],[.95,.77]]},
  sedan:{W:1.8,m:1400,wr:.32,ax:[1.4,-1.35],hy:.54,ty:.8,body:[[-2.25,.32],[-2.28,.84],[-1.6,.94],[.95,.92],[2.1,.8],[2.28,.62],[2.25,.32]],cab:[[-1.8,.93],[-1.2,1.42],[.25,1.42],[1.05,.92]]},
  suv:{W:1.95,m:2000,wr:.38,ax:[1.45,-1.4],hy:.7,ty:.98,body:[[-2.35,.4],[-2.38,1.1],[1.05,1.1],[2.2,1],[2.38,.78],[2.35,.4]],cab:[[-2.32,1.1],[-2.1,1.76],[.3,1.76],[1.05,1.1]]}};CARS.taxi=CARS.sedan;
/* --- гладкие кузова: лофт по сечениям (суперэллипс), остекление, арки, детали --- */
function lbody(d,add,hi){
  const lf=d.lf||{},W=d.W,n=lf.n||5,e=lf.e||.18,gb=lf.gb||.9,gt=lf.gt||.78,cab=d.cab,se=(c,p)=>Math.sign(c)*Math.abs(c)**(2/p);
  const ip=(P,x)=>{if(x<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(x<=P[i][0]){const a=P[i-1],b=P[i];return a[1]+(b[1]-a[1])*(x-a[0])/((b[0]-a[0])||1)}return P[P.length-1][1]};
  const tp=d.body.slice(1,-1).sort((a,b)=>a[0]-b[0]),x0=tp[0][0],x1=tp[tp.length-1][0],zb0=Math.min(...d.body.map(p=>p[1]));
  const NS=Math.max(10,Math.round((x1-x0)/(hi?.045:.11))),xs=[];for(let i=0;i<=NS;i++)xs.push(x0+(x1-x0)*i/NS);
  let zs=xs.map(x=>ip(tp,x));for(let k=0;k<(hi?6:3);k++)zs=zs.map((v,i)=>i&&i<NS?(zs[i-1]+2*v+zs[i+1])/4:v);
  const ZP=xs.map((x,i)=>[x,zs[i]]),zt=x=>ip(ZP,x),R=d.wr+(lf.ag||.06);
  const zb=x=>{let z=zb0+(lf.uf||.07)*Math.max(0,1-(x1-x)/.45)**2+(lf.ur||.05)*Math.max(0,1-(x-x0)/.45)**2;
    for(const a of d.ax){const q=x-a;if(Math.abs(q)<R)z=Math.max(z,d.wr+Math.sqrt(R*R-q*q))}return Math.min(z,zt(x)-.12)};
  const hw=x=>{const uf=Math.max(0,(x-(x1-1.1))/1.1),ur=Math.max(0,((x0+1.1)-x)/1.1);let h=W/2-(lf.fb||0)-(lf.tf||0)*uf*uf-(lf.tr||0)*ur*ur;
    if(lf.fb)for(const a of d.ax)h+=lf.fb*Math.exp(-(((x-a)/.6)**2));return h};
  const sf=x=>{const q=Math.min(x-x0,x1-x);if(q>=e)return 1;const u=1-Math.max(0,q)/e;return Math.sqrt(Math.max(0,1-u*u))};
  const sec=x=>{const b=zb(x),t=Math.max(zt(x),b+.1);return{cy:(b+t)/2,ry:(t-b)/2,h:hw(x),s:sf(x)}};
  const loft=(xa,ring,mf,cl)=>{const pos=[],rows=xa.map(x=>ring(x)),m=rows[0].length,by={},all=[],seg=cl?m:m-1;
    rows.forEach((r,i)=>r.forEach(p=>pos.push(p[0],p[1],-xa[i])));
    for(let i=0;i<xa.length-1;i++)for(let j=0;j<seg;j++){const a=i*m+j,b=i*m+(j+1)%m,c=a+m,dd=b+m,q=[a,c,b,b,c,dd],p=rows[i][j],p2=rows[i][(j+1)%m];
      const mm=mf((xa[i]+xa[i+1])/2,j,(p[0]+p2[0])/2,(p[1]+p2[1])/2);(by[mm]||(by[mm]=[])).push(...q);all.push(...q)}
    const ge=new T.BufferGeometry();ge.setAttribute('position',new T.Float32BufferAttribute(pos,3));ge.setIndex(all);ge.computeVertexNormals();
    const im=xa.length>>1;let jm=0;rows[im].forEach((p,j)=>{if(p[1]>rows[im][jm][1])jm=j});
    if(ge.attributes.normal.getY(im*m+jm)<0){const fl=A=>{for(let t=0;t<A.length;t+=3){const v=A[t+1];A[t+1]=A[t+2];A[t+2]=v}};fl(all);for(const k in by)fl(by[k]);ge.setIndex(all);ge.computeVertexNormals()}
    for(const k in by){const g=new T.BufferGeometry();g.setAttribute('position',ge.attributes.position);g.setAttribute('normal',ge.attributes.normal);g.setIndex(by[k]);add(g,+k)}};
  const RN=hi?44:24;
  loft(xs,x=>{const c=sec(x),r=[];for(let k=0;k<RN;k++){const a=k/RN*Math.PI*2-Math.PI/2;r.push([c.h*c.s*se(Math.cos(a),n),c.cy+c.ry*c.s*se(Math.sin(a),n)])}return r},
    lf.mat?(x,j,X,Y)=>lf.mat(x,Y,X):()=>0,true);
  // остекление
  const gx0=cab[0][0],gx1=cab[cab.length-1][0],wf=cab[cab.length-2][0],wrw=cab[1][0],cp=lf.cp===undefined?.22:lf.cp,bxs=lf.bx||[];
  const gh=x=>{const c=sec(x),h=c.h*c.s,cs=gb**(n/2),yb=c.cy+c.ry*c.s*Math.sqrt(Math.max(0,1-cs*cs))**(2/n);
    const yt=Math.max(yb+.003,ip(cab,x)),hb=gb*h,ht=hb*gt,rr=Math.min(lf.rr||.09,(yt-yb)*.45,ht*.5);return{yb,yt,hb,ht,rr}};
  const gring=x=>{const g=gh(x),L=[],cr=(lf.cr===undefined?.025:lf.cr)*Math.min(1,(g.yt-g.yb)/.3);
    for(let t=0;t<=3;t++)L.push([-(g.hb+(g.ht-g.hb)*t/3),g.yb+(g.yt-g.rr-g.yb)*t/3]);
    for(let t=1;t<=3;t++){const a=Math.PI-Math.PI/2*t/3;L.push([-g.ht+g.rr+g.rr*Math.cos(a),g.yt-g.rr+g.rr*Math.sin(a)])}
    for(let t=1;t<=3;t++)L.push([(-g.ht+g.rr)*(1-t/3),g.yt]);
    for(let t=L.length-2;t>=0;t--)L.push([-L[t][0],L[t][1]]);
    return L.map(([X,Y])=>[X,Y+cr*Math.max(0,1-(X/g.ht)**2)])};
  const gm=(x,j)=>{const jj=j<9?j:17-j;
    if(jj<3){if(x>wf)return 1;if(x<wrw+cp)return lf.cpg?1:0;for(const b of bxs)if(Math.abs(x-b)<.055)return 2;return 1}
    if(jj<6)return 0;if(x>wf||x<wrw)return 1;if(lf.sun&&x>lf.sun[0]&&x<lf.sun[1]&&jj>6)return 1;return 0};
  if(!d.open){const gs=new Set(),st=hi?.04:.1;for(let x=gx0;x<gx1;x+=st)gs.add(+x.toFixed(3));
    [gx1,wrw,wf,wrw+cp,...(lf.sun||[]),...bxs.flatMap(b=>[b-.055,b+.055])].forEach(v=>gs.add(+v.toFixed(3)));
    loft([...gs].filter(v=>v>=gx0&&v<=gx1).sort((a,b)=>a-b),gring,gm,false)}
  // хелперы деталей
  const V=T.Vector3,UP=new V(0,1,0);
  const pbx=(a,b,y0,y1,wd,xc)=>{const ge=new T.BoxGeometry(wd,y1-y0,b-a);ge.translate(xc||0,(y0+y1)/2,-(a+b)/2);return ge};
  const fx=(X,Y,rear)=>{const xe=rear?x0+e:x1-e,c=sec(xe),r=Math.min(1,((Math.abs(X)/c.h)**n+(Math.abs(Y-c.cy)/c.ry)**n)**(1/n)),q=e*(1-Math.sqrt(1-r*r));return rear?x0+q:x1-q};
  const sx=(x,Y)=>{const c=sec(x),dy=Math.abs(Y-c.cy)/(c.ry*c.s);return dy>=1?0:c.h*c.s*(1-dy**n)**(1/n)};
  const sy=(x,X)=>{const c=sec(x),u=Math.abs(X)/(c.h*c.s);return u>=1?c.cy:c.cy+c.ry*c.s*(1-u**n)**(1/n)};
  const tube=(pts,r,m,mir)=>{for(const sg of mir?[1,-1]:[1])for(let i=0;i<pts.length-1;i++){const a=new V(sg*pts[i][2],pts[i][1],-pts[i][0]),b=new V(sg*pts[i+1][2],pts[i+1][1],-pts[i+1][0]),dv=b.clone().sub(a),l=dv.length();if(l<1e-4)continue;
    const ge=new T.CylinderGeometry(r,r,l+r*.8,hi?7:5,1);ge.applyQuaternion(new T.Quaternion().setFromUnitVectors(UP,dv.normalize()));const mid=a.add(b).multiplyScalar(.5);ge.translate(mid.x,mid.y,mid.z);add(ge,m)}};
  const lamp=(X,Y,w_,h_,m,rear,dp,mir,off)=>{dp=dp||.06;off=off===undefined?.012:off;const ns=Math.max(1,Math.ceil(w_/(hi?.05:.12)));
    for(const sg of mir?[1,-1]:[1])for(let i=0;i<ns;i++){const xc=sg*X-w_/2+w_*(i+.5)/ns,f=fx(xc,Y,rear);
      add(rear?pbx(f-off,f-off+dp,Y-h_/2,Y+h_/2,w_/ns+.002,xc):pbx(f+off-dp,f+off,Y-h_/2,Y+h_/2,w_/ns+.002,xc),m)}};
  const disc=(X,Y,r,m,rear,mir,sx_,dp,off)=>{dp=dp||.05;off=off===undefined?.012:off;for(const sg of mir?[1,-1]:[1]){const f=fx(X,Y,rear),ge=new T.CylinderGeometry(r,r,dp,hi?24:10);ge.rotateX(Math.PI/2);if(sx_)ge.scale(sx_,1,1);
    ge.translate(sg*X,Y,-(rear?f-off+dp/2:f+off-dp/2));add(ge,m)}};
  const ring=(X,Y,r,t,m,rear,mir,sx_,off)=>{off=off===undefined?.014:off;for(const sg of mir?[1,-1]:[1]){const f=fx(X,Y,rear),ge=new T.TorusGeometry(r,t,6,hi?26:12);if(sx_)ge.scale(sx_,1,1);ge.translate(sg*X,Y,-(rear?f-off:f+off));add(ge,m)}};
  const pipe=(X,Y,r,mir,sx_)=>{for(const sg of mir?[1,-1]:[1]){const f=fx(X,Y,1);let ge=new T.CylinderGeometry(r,r*.92,.26,hi?18:8,1,true);ge.rotateX(Math.PI/2);if(sx_)ge.scale(sx_,1,1);ge.translate(sg*X,Y,-(f+.1));add(ge,5);
    ge=new T.CylinderGeometry(r*.8,r*.8,.02,hi?14:8);ge.rotateX(Math.PI/2);if(sx_)ge.scale(sx_,1,1);ge.translate(sg*X,Y,-(f+.03));add(ge,2)}};
  const sideLine=(Y,r,m,xa,xb,dX)=>{xa=xa===undefined?x0+.08:xa;xb=xb===undefined?x1-.08:xb;let s=[];const fl=()=>{if(s.length>1)tube(s,r,m,1);s=[]};
    for(let x=xa;x<=xb+1e-6;x+=hi?.06:.15){const X=sx(x,Y);if(X>.05&&zb(x)<Y-.03)s.push([x,Y,X+(dX||.004)]);else fl()}fl()};
  const wrap=(Y,r,m,rear,Xm)=>{const c=sec(rear?x0+e:x1-e),p=[];Xm=Xm||c.h*.94;for(let i=0;i<=16;i++){const X=-Xm+2*Xm*i/16;p.push([fx(X,Y,rear)+(rear?-.006:.006),Y,X])}tube(p,r,m)};
  const seam=(x,y1)=>{const p=[],ya=zb(x)+.04;for(let i=0;i<=8;i++){const Y=ya+(y1-ya)*i/8;p.push([x,Y,sx(x,Y)+.002])}tube(p,hi?.0035:.006,2,1)};
  const handle=(x,Y,m)=>{const X=sx(x,Y)+.012;m=m===undefined?5:m;add(pbx(x-.08,x+.08,Y-.016,Y+.016,.026,X),m);add(pbx(x-.08,x+.08,Y-.016,Y+.016,.026,-X),m)};
  const mirror=(x,m,Y,X)=>{const g=gh(x);Y=Y||g.yb+.03;X=X||g.hb;m=m===undefined?0:m;for(const sg of[1,-1]){let ge=new T.SphereGeometry(1,hi?16:8,hi?10:6);ge.scale(.12,.075,.085);ge.translate(sg*(X+.15),Y+.1,-x);add(ge,m);ge=new T.CylinderGeometry(.068,.068,.012,hi?16:8);ge.rotateX(Math.PI/2);ge.scale(1.6,1,1);ge.translate(sg*(X+.15),Y+.1,-(x-.072));add(ge,1);tube([[x,Y+.02,X-.01],[x-.01,Y+.08,X+.08]],.018,m,0);if(sg<0)tube([[x,Y+.02,-(X-.01)],[x-.01,Y+.08,-(X+.08)]],.018,m,0)}};
  const belt=(xa,xb,m,r)=>{const p=[];for(let x=xa;x<=xb+1e-6;x+=hi?.08:.2){const g=gh(x);p.push([x,g.yb+.004,g.hb+.004])}tube(p,r||.009,m,1)};
  const frame=(xa,xb,m)=>{const p=[];for(let x=xa;x<=xb+1e-6;x+=hi?.06:.2){const g=gh(x);p.push([x,g.yt-g.rr,g.ht+.004])}tube(p,.008,m,1)};
  const plate=(Y,rear,w_,h_)=>{w_=w_||.52;h_=h_||.11;const f=fx(0,Y,rear);add(rear?pbx(f-.014,f+.02,Y-h_/2,Y+h_/2,w_):pbx(f-.02,f+.014,Y-h_/2,Y+h_/2,w_),7)};
  // днище, подкрылки, пороги
  add(pbx(d.ax[1]+.3,d.ax[0]-.3,.16,zb0+.12,W-.86),2);
  for(const a of d.ax){const ge=new T.CylinderGeometry(R-.01,R-.01,W-.7,hi?20:10,1,true,-Math.PI/2,Math.PI);ge.rotateZ(Math.PI/2);ge.translate(0,d.wr,-a);add(ge,2)}

  if(lf.lip!==0)for(const a of d.ax){const p=[],N=hi?20:10;for(let i=0;i<=N;i++){const t=Math.PI*i/N,x=a+Math.cos(t)*(R+.01),Y=d.wr+Math.sin(t)*(R+.01);const X=sx(x,Y);if(X>.1)p.push([x,Y,X-.004])}if(p.length>1)tube(p,lf.lipR||.02,lf.lipM===undefined?0:lf.lipM,1)}
  sideLine(zb0+.05,hi?.026:.03,2,d.ax[1]+R*.8,d.ax[0]-R*.8);
  const top=d.open?Math.max(...zs,...cab.map(p=>p[1])):Math.max(...cab.map(p=>p[1]))+(lf.cr===undefined?.025:lf.cr);
  return{gx1,x0,x1,top,e,R,zt,zb,sx,sy,fx,gh,sec,wf,wrw,cp,pb:pbx,lamp,disc,ring,pipe,tube,sideLine,wrap,seam,handle,mirror,belt,frame,plate}}
const pstd=(o,c)=>{const{seam,handle,mirror,belt,frame,wf,wrw,cp,gh}=o;(c.seams||[]).forEach(x=>seam(x,gh(x).yb));(c.handles||[]).forEach(x=>handle(x,gh(x).yb-.075,c.hm));
  mirror(c.mx,c.mm);belt(wrw+cp,o.gx1-.05,c.belt===undefined?2:c.belt);if(c.frame!==undefined)frame(wrw+cp,wf-.03,c.frame)};
CARS.sport.lf={n:3.6,e:.28,tf:.2,tr:.1,gb:.85,gt:.68,cp:.25};CARS.sedan.lf={bx:[-.3]};CARS.suv.lf={n:7,gb:.94,gt:.86,bx:[-.35,-1.45],cp:.12,lipM:2};
/* --- машины игрока (гараж) --- */
const mbStar=(o,x)=>{const{add,zt}=o,Y=zt(x)+.05;let ge=new T.TorusGeometry(.032,.005,6,18);ge.translate(0,Y,-x);add(ge,5);
  for(let i=0;i<3;i++){ge=new T.BoxGeometry(.005,.032,.005);ge.translate(0,.016,0);ge.rotateZ(i*Math.PI*2/3);ge.translate(0,Y,-x);add(ge,5)}ge=new T.CylinderGeometry(.008,.016,.05,8);ge.translate(0,Y-.05,-x);add(ge,5)};
const w210f=o=>{const{disc,ring,lamp,wrap,sideLine,plate,pipe,fx,tube}=o;
  for(const[X,r]of[[.37,.083],[.62,.1]]){ring(X,.655,r,.012,5,0,1,.8);disc(X,.655,r*.96,3,0,1,.8,.05,.006)}
  lamp(0,.6,.42,.2,2,0,.05,0,.006);for(let i=0;i<4;i++)lamp(0,.53+i*.046,.4,.012,5,0,.03,0,.016);
  {const P=[[-.22,.5],[-.22,.7],[0,.72],[.22,.7],[.22,.5],[-.22,.5]];tube(P.map(([X,Y])=>[fx(X,Y)+.016,Y,X]),.014,5)}
  mbStar(o,o.x1-.3);lamp(.68,.55,.14,.04,3,0,.04,1,.008);disc(.6,.38,.045,3,0,1,1.5,.04,.006);
  wrap(.47,.024,2);wrap(.5,.024,2,1);sideLine(.5,.022,2);plate(.4,0);plate(.62,1);
  lamp(.6,.76,.4,.16,4,1,.06,1);lamp(.36,.76,.1,.16,5,1,.06,1,.008);lamp(0,.73,.62,.022,5,1,.03,0,.016);pipe(.5,.33,.036)};
CARS.w210={W:1.8,m:1500,wr:.33,ax:[1.42,-1.42],hy:.62,ty:.82,wh:[8,.3],cal:0x8a8d92,body:[[-2.4,.3],[-2.42,.82],[-2.25,.95],[-1.25,.98],[1.0,.92],[2.15,.78],[2.4,.6],[2.38,.3]],cab:[[-1.95,.97],[-1.25,1.43],[.3,1.44],[1.05,.93]],
  lf:{n:3.6,e:.26,tf:.16,tr:.1,gb:.88,gt:.7,rr:.16,cr:.04,bx:[-.36],cp:.26,sun:[-.55,.05],uf:.06},x:o=>{w210f(o);pstd(o,{seams:[1.08,-.36,-1.0],handles:[-.2,-.86],mx:.84,belt:2,frame:5})}};
CARS.w210c={W:1.8,m:1560,wr:.33,ax:[1.42,-1.42],hy:.62,ty:.82,open:1,wh:[8,.3],cal:0x8a8d92,body:CARS.w210.body,cab:[[-.2,.97],[.36,1.3],[.44,1.3],[1.05,.95]],lf:{n:5,e:.2,tf:.13,tr:.08,uf:.06},
  x:o=>{w210f(o);const{add,pb,pair,quad,tube,W,zt,sx,seam,handle,mirror}=o;add(pb(-1.95,.95,.955,.99,W*.78),2);add(pb(.55,1.0,.98,1.06,W*.74),2);
    for(const xc of[-.42,-1.45]){pair(xc-.3,xc+.28,.98,1.05,.48,.38,6);pair(xc-.4,xc-.28,1.0,1.3,.46,.38,6);pair(xc-.39,xc-.31,1.31,1.41,.25,.38,6)}
    let ge=new T.TorusGeometry(.17,.018,8,22);ge.rotateX(-.45);ge.translate(-.38,1.1,-.42);add(ge,2);
    add(quad([[-W*.42,.97,-1.03],[W*.42,.97,-1.03],[W*.42,1.3,-.42],[-W*.42,1.3,-.42]]),1);
    tube([[1.04,.97,W*.42],[.41,1.31,W*.42]],.02,5,1);tube([[.41,1.31,-W*.42],[.41,1.31,W*.42]],.02,5);
    for(const x of[1.08,-.5])seam(x,zt(x)-.03);handle(-.35,zt(-.35)-.08);mirror(.86,0,zt(.86)-.02,sx(.86,zt(.86)-.04)-.02)}};
CARS.g500={W:1.86,m:2500,wr:.4,ax:[1.43,-1.42],hy:.92,ty:1.0,wh:[5,.28],cal:0x555a60,body:[[-2.33,.45],[-2.35,1.15],[1.25,1.15],[1.45,1.12],[2.3,1.08],[2.35,.95],[2.33,.45]],cab:[[-2.3,1.14],[-2.28,1.93],[1.0,1.93],[1.18,1.14]],
  lf:{n:14,e:.07,gb:.985,gt:.96,bx:[-.18,-1.3],cp:.1,cr:.01,rr:.04,uf:.14,ur:.12,ag:.09,lipR:.05,mat:(x,Y)=>Y<.74&&(x>2.0||x<-2.05)?2:0},
  x:o=>{const{add,pb,pair,lamp,disc,ring,pipe,plate,tube,sideLine,x0,x1,W,gh}=o;
    for(const sg of[1,-1]){ring(sg*.66,.93,.1,.016,5);disc(sg*.66,.93,.092,3,0,0,1,.05,.006);add(pb(x1-.2,x1-.1,1.1,1.135,.08,sg*.76),3)}
    lamp(0,.92,.62,.26,2,0,.04,0,.006);for(let i=0;i<3;i++)lamp(0,.84+i*.08,.6,.035,0,0,.03,0,.016);ring(0,.92,.055,.009,5,0,0,1,.028);
    plate(.6,0);plate(.6,1);lamp(.8,.84,.14,.2,4,1,.05,1);pipe(.62,.5,.042,1);
    let ge=new T.TorusGeometry(.3,.09,10,26);ge.translate(0,1.12,-(x0-.14));add(ge,2);ge=new T.CylinderGeometry(.27,.27,.2,24);ge.rotateX(Math.PI/2);ge.translate(0,1.12,-(x0-.14));add(ge,5);
    ge=new T.TorusGeometry(.1,.012,6,20);ge.translate(0,1.12,-(x0-.25));add(ge,2);
    pair(-.92,.95,.4,.46,.26,W/2+.03,2);sideLine(.72,.024,2,-2.2,2.2);
    for(const Y of[1.0,1.32])pair(.98,1.06,Y,Y+.07,.03,W/2+.005,5);
    {const p=[];for(let x=-2.24;x<=.96;x+=.16){const g=gh(x);p.push([x,g.yt+.012,g.ht-.02])}tube(p,.016,2,1)}
    pstd(o,{seams:[1.05,-.18,-1.3],handles:[-.05,-1.15],mx:1.08,belt:2})}};
CARS.c6={W:1.85,m:1450,wr:.34,ax:[1.33,-1.34],hy:.5,ty:.74,wh:[5,.2],cal:0xd01818,body:[[-2.2,.28],[-2.22,.78],[-1.9,.88],[-1.0,.86],[.6,.74],[1.7,.6],[2.22,.45],[2.2,.28]],cab:[[-1.72,.86],[-.95,1.2],[-.2,1.22],[.6,.78]],
  lf:{n:3.4,e:.3,tf:.22,tr:.12,fb:.06,gb:.84,gt:.66,cp:.3,cr:.03,uf:.05,lip:0},
  x:o=>{const{add,pb,pair,lamp,disc,ring,pipe,plate,sx,sy,zt,x0,x1,ax,W,R}=o;
    for(const sg of[1,-1]){const x=x1-.4,ge=new T.SphereGeometry(1,22,12);ge.scale(.15,.05,.34);ge.rotateX(-.28);ge.rotateY(sg*.14);ge.translate(sg*.6,sy(x,.6)-.012,-x);add(ge,3)}
    lamp(0,.4,.95,.13,2,0,.05);lamp(0,.31,1.3,.025,2,0,.1,0,.03);disc(.55,.41,.035,3,0,1,1,.03,.016);
    {const x=x1-.78,Y=zt(x);add(pb(x-.13,x+.13,Y-.03,Y+.016,.46),2)}
    {const x=ax[0]-R-.5;pair(x-.13,x+.11,.5,.62,.03,sx(x,.56)+.004,2)}
    lamp(0,.72,1.5,.16,2,1,.03,0,.004);for(const X of[.48,.72]){disc(X,.72,.068,4,1,1,0,.05,.014);ring(X,.72,.072,.008,5,1,1,0,.016)}
    lamp(0,.36,.9,.08,2,1,.05);pipe(.1,.36,.042,1);pipe(.22,.36,.042,1);plate(.55,1);
    {const x=x0+.13;add(pb(x0+.03,x0+.24,zt(x)-.01,zt(x)+.04,W*.6),0)}
    pstd(o,{seams:[.5,-.9],mx:.46,belt:2})}};
CARS.cay={W:1.98,m:2200,wr:.4,ax:[1.5,-1.48],hy:.8,ty:.98,wh:[10,.1],cal:0xf2c200,body:[[-2.46,.42],[-2.48,1.0],[-2.2,1.08],[1.1,1.04],[2.25,.92],[2.46,.7],[2.44,.42]],cab:[[-2.35,1.06],[-1.9,1.66],[.15,1.67],[1.1,1.04]],
  lf:{n:4.6,e:.24,tf:.15,tr:.1,fb:.03,gb:.88,gt:.76,bx:[-.42,-1.32],cp:.12,cr:.03,uf:.07,ur:.06},
  x:o=>{const{add,pb,lamp,disc,pipe,plate,W}=o;
    for(const sg of[1,-1]){lamp(sg*.7,.86,.34,.12,2,0,.06);for(const[dx,dy]of[[-.06,.022],[.06,.022],[-.06,-.028],[.06,-.028]])disc(sg*.7+dx,.86+dy,.021,3,0,0,1,.04,.016)}
    lamp(.7,.79,.32,.02,3,0,.05,1,.016);lamp(0,.56,.62,.16,2,0,.05);lamp(.7,.52,.32,.2,2,0,.05,1);for(let i=0;i<3;i++)lamp(0,.51+i*.045,.6,.01,5,0,.03,0,.02);
    lamp(0,.9,1.1,.09,2,1,.04,0,.006);lamp(0,.93,1.6,.03,4,1,.05,0,.016);lamp(.72,.9,.3,.11,4,1,.06,1);
    lamp(0,.5,1.3,.1,2,1,.05);pipe(.52,.5,.042,1);pipe(.66,.5,.042,1);plate(.68,1);plate(.4,0);
    add(pb(-2.14,-1.86,1.62,1.67,W*.82),0);
    pstd(o,{seams:[1.0,-.42,-1.25],handles:[-.2,-1.0],hm:0,mx:.98,belt:2,frame:2})}};
CARS.a8l={W:1.89,m:1950,wr:.35,ax:[1.6,-1.55],hy:.63,ty:.86,wh:[10,.12],cal:0x2a2a2c,body:[[-2.62,.32],[-2.64,.85],[-2.45,.97],[-1.4,.99],[1.15,.94],[2.35,.8],[2.62,.6],[2.6,.32]],cab:[[-2.15,.98],[-1.2,1.42],[.15,1.46],[1.3,.95]],
  lf:{n:4,e:.24,tf:.14,tr:.1,gb:.88,gt:.72,rr:.16,bx:[-.32],cp:.3,cr:.04},
  x:o=>{const{lamp,disc,ring,pipe,plate,fx,tube,sideLine,wrap}=o;
    lamp(0,.55,.66,.32,2,0,.05,0,.006);for(let y=.43;y<.69;y+=.05)lamp(0,y,.62,.01,5,0,.03,0,.016);
    {const P=[[-.3,.72],[.3,.72],[.36,.55],[.3,.38],[-.3,.38],[-.36,.55],[-.3,.72]];tube(P.map(([X,Y])=>[fx(X,Y)+.016,Y,X]),.013,5)}
    for(let i=0;i<4;i++)ring(-.105+i*.07,.64,.04,.006,5,0,0,1,.034);
    lamp(.64,.72,.36,.1,5,0,.06,1);disc(.56,.73,.03,3,0,1,1,.04,.016);disc(.71,.73,.03,3,0,1,1,.04,.016);lamp(.64,.665,.34,.018,3,0,.05,1,.016);
    lamp(.62,.86,.4,.12,4,1,.06,1);lamp(0,.84,.8,.022,5,1,.03,0,.012);plate(.66,1);plate(.33,0);pipe(.6,.36,.04,1,1.7);
    sideLine(.45,.011,5);wrap(.36,.012,5,1);
    pstd(o,{seams:[1.25,-.32,-1.05],handles:[-.15,-.9],mx:1.0,belt:5,frame:5})}};
const PLATES={w210:'S·LZ 3627',w210c:'S·LZ 1997',g:'G·500 08',c6:'Z·06 2006',cay:'S·GO 911',a8:'IN·A8 600'};

const MB3=[['Чёрный',0x0a0a0c],['Белый',0xeeeeea],['Розовый',0xff5ea8]];
const PCARS=[
  {id:'w210',tab:'W210',name:'Mercedes-Benz E 280 W210',sub:'седан · 1995–2002',kind:'w210',cols:MB3,hood:[1.1,1.02],st:[5,5,6],ph:{Tmax:470,Iz:2300,red:6200},
    cab:{dy:0,dash:0x2b2c30,soft:0x3c3e44,trim:0x5a2c14,wood:1,seat:0x2f3035,wheel:0x2a2a2e,sp4:1,cl:'merc'}},
  {id:'w210c',tab:'W210 CABRIO',name:'Mercedes-Benz W210 кабриолет',sub:'открытый верх · светлая кожа',kind:'w210c',cols:MB3,hood:[1.1,1.02],st:[5,5,6],ph:{Tmax:470,Iz:2350,red:6200},
    cab:{dy:0,open:1,dash:0x2b2c30,soft:0xc9b089,trim:0x5a2c14,wood:1,seat:0xd8c3a0,wheel:0x2a2a2e,sp4:1,cl:'merc'}},
  {id:'g',tab:'G 500',name:'Mercedes-Benz G 500',sub:'W463 · 2008 · V8',kind:'g500',cols:MB3,hood:[.95,1.45],st:[5,6,4],ph:{Tmax:780,Iz:3700,mu:1.18,hcg:.75,rollK:.009,red:6000},
    cab:{dy:.36,dash:0x1c1c1f,soft:0x2a2a2e,trim:0x4a2412,wood:1,seat:0x1e1e22,wheel:0x1e1e20,sp4:1,cl:'merc'}},
  {id:'c6',tab:'CORVETTE C6',name:'Chevrolet Corvette C6',sub:'2006 · V8',kind:'c6',cols:[['Чёрный',0x0a0a0c],['Оранжевый',0xff5a00],['Жёлтый',0xffc400]],hood:[1.0,.94],st:[9,8,8],ph:{Tmax:720,Iz:1850,mu:1.4,red:6800},
    cab:{dy:-.12,dash:0x18181b,soft:0x26262a,trim:0x9aa0a8,wood:0,seat:0x1c1c1f,wheel:0x1a1a1c,sp4:0,cl:'vette'}},
  {id:'cay',tab:'CAYENNE',name:'Porsche Cayenne Turbo S',sub:'2018 · тёмное серебро',kind:'cay',cols:[['Тёмное серебро',0x5d6168]],met:1,hood:[1.05,1.25],st:[8,9,7],ph:{Tmax:880,Iz:3000,mu:1.36,red:6800},
    cab:{dy:.22,dash:0x161618,soft:0x232326,trim:0x8d939b,wood:0,seat:0x1d1d20,wheel:0x1b1b1d,sp4:0,cl:'porsche'}},
  {id:'a8',tab:'A8 L',name:'Audi A8 L',sub:'длинная база · только чёрная',kind:'a8l',cols:[['Чёрный',0x0a0a0c]],hood:[1.15,1.03],st:[7,7,6],ph:{Tmax:650,Iz:3100,red:6500},
    cab:{dy:0,dash:0x1e1e21,soft:0x2c2c30,trim:0x4b2a16,wood:1,seat:0xd9c7a5,wheel:0x222224,sp4:1,cl:'audi'}}];
function carGeo(k,noWheels){const key=k+(noWheels?'_nw':'');if(geos[key])return geos[key];const P=[],add=(ge,m)=>P.push([ge,m]);
  const ext=(pts,wd,bev)=>{const sh=new T.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));
    const ge=new T.ExtrudeGeometry(sh,{depth:wd-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,steps:1});ge.translate(0,0,-(wd-2*bev)/2);ge.rotateY(Math.PI/2);return ge};
  const pb=(x0,x1,y0,y1,wd,xc)=>{const ge=new T.BoxGeometry(wd,y1-y0,x1-x0);ge.translate(xc||0,(y0+y1)/2,-(x0+x1)/2);return ge};
  const pair=(x0,x1,y0,y1,wd,xc,m)=>{add(pb(x0,x1,y0,y1,wd,xc),m);add(pb(x0,x1,y0,y1,wd,-xc),m)};
  const quad=v=>{const ge=new T.BufferGeometry(),p=[];for(const i of[0,1,2,0,2,3])p.push(...v[i]);ge.setAttribute('position',new T.Float32BufferAttribute(p,3));ge.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(12),2));ge.computeVertexNormals();return ge};
  const wheel=(r,wd,x,px)=>{if(noWheels)return;for(const sg of[-1,1]){let ge=new T.CylinderGeometry(r,r,wd,14);ge.rotateZ(Math.PI/2);ge.translate(sg*x,r,-px);add(ge,2);ge=new T.CylinderGeometry(r*.56,r*.56,wd+.03,10);ge.rotateZ(Math.PI/2);ge.translate(sg*x,r,-px);add(ge,5)}};
  let L,W,H,wr=.33,ax,mass=1300,hy=.7,ty=.8;const d=CARS[k];
  if(d&&d.lf){W=d.W;wr=d.wr;ax=d.ax;mass=d.m;hy=d.hy;ty=d.ty;const o=Object.assign(lbody(d,add,!!noWheels),{add,pair,quad,W,hy,ty,wr,ax});L=o.x1-o.x0+.12;H=o.top+.05;
    if(!d.x){const xm=o.wrw+(o.wf-o.wrw)*.42;o.lamp(W/2-.32,hy,.36,.11,3,0,.06,1);o.lamp(W/2-.3,ty,.4,.12,4,1,.06,1);o.plate(hy-.13,0);o.plate(ty-.2,1);o.mirror(o.wf+.4,0);o.seam(xm,o.gh(xm).yb);o.belt(o.wrw+o.cp,o.gx1-.05,2)}
    wheel(wr,.24,W/2-.14,ax[0]);wheel(wr,.24,W/2-.14,ax[1]);
    if(k==='taxi')add(pb(-.35,.1,H,H+.16,.55),3);if(k==='sport'){add(pb(-2.3,-1.95,1.0,1.04,W*.86),0);pair(-2.2,-2.06,.84,1.0,.05,W*.3,2)}if(d.x)d.x(o)}
  else if(d){W=d.W;wr=d.wr;ax=d.ax;mass=d.m;hy=d.hy;ty=d.ty;const xs=d.body.map(p=>p[0]),x0=Math.min(...xs),x1=Math.max(...xs),top=Math.max(...d.cab.map(p=>p[1]));L=x1-x0+.12;H=top+.05;
    add(ext(d.body,W,.06),0);if(!d.open){add(ext(d.cab,W*.84,.03),1);add(pb(d.cab[1][0]+.05,d.cab[2][0]-.05,top-.02,top+.05,W*.86),0)}
    add(pb(x0-.03,x1+.03,.27,.38,W*.88),2);pair(x1-.02,x1+.08,hy-.07,hy+.07,.36,W/2-.28,3);pair(x0-.08,x0+.02,ty-.06,ty+.06,.42,W/2-.3,4);
    wheel(wr,.24,W/2-.04,ax[0]);wheel(wr,.24,W/2-.04,ax[1]);
    if(k==='taxi')add(pb(-.35,.1,H,H+.16,.55),3);
    if(k==='sport'){add(pb(-2.25,-1.9,1.02,1.07,W*.9),0);pair(-2.15,-2,.86,1.02,.06,W*.3,2)}if(d.x)d.x({add,pb,pair,quad,W,x0,x1,top,hy,ty,wr,ax})}
  else if(k==='truck'){W=2.5;L=8.6;H=3.6;wr=.5;ax=[3.3,-2.9];mass=9000;hy=.95;ty=1;
    add(pb(2.3,4.2,.6,2.75,2.4),0);add(pb(4.2,4.24,1.65,2.55,2.1),1);pair(2.9,3.9,1.7,2.5,.03,1.21,1);
    add(pb(-4.3,2.15,1.1,3.6,2.5),5);add(pb(-4.3,4.2,.55,1.1,2.1),2);pair(4.2,4.27,.85,1.05,.4,.85,3);pair(-4.34,-4.28,.9,1.1,.3,.95,4);
    wheel(wr,.3,W/2-.16,3.3);wheel(wr,.5,W/2-.26,-2.4);wheel(wr,.5,W/2-.26,-3.5)}
  else if(k==='bus'){W=2.5;L=11;H=3.1;wr=.5;ax=[3.6,-3.4];mass=11000;hy=.85;ty=.95;
    add(pb(-5.5,5.5,.5,3.1,W),0);pair(-5.2,4.7,1.55,2.55,.03,W/2+.005,1);add(pb(5.5,5.53,1.35,2.75,2.2),1);add(pb(-5.53,-5.5,1.7,2.6,2),1);
    add(pb(-5.5,5.5,.3,.5,2.3),2);pair(5.48,5.56,.75,.95,.4,.85,3);pair(-5.56,-5.48,.8,1.1,.3,.95,4);wheel(wr,.32,W/2-.17,3.6);wheel(wr,.32,W/2-.17,-3.4)}
  return geos[key]={geo:merge(P),L,W,H,wr,ax,mass,hy,ty}}
function plateTex(txt,tex){const c=tex?tex.image:document.createElement('canvas');c.width=256;c.height=56;const x=c.getContext('2d');
  x.fillStyle='#f4f4ef';x.fillRect(0,0,256,56);x.fillStyle='#1f3fa8';x.fillRect(0,0,26,56);x.fillStyle='#f6d33a';x.font='bold 11px sans-serif';x.textAlign='center';x.fillText('D',13,46);
  x.strokeStyle='#111';x.lineWidth=3;x.strokeRect(1.5,1.5,253,53);x.fillStyle='#111';x.font='bold 38px "Arial Narrow",Arial,sans-serif';x.textBaseline='middle';x.fillText(txt,141,30);
  if(tex){tex.needsUpdate=true;return tex}const t=new T.CanvasTexture(c);t.anisotropy=4;return t}
function cshTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d'),g=x.createRadialGradient(64,64,6,64,64,64);
  g.addColorStop(0,'rgba(0,0,0,.92)');g.addColorStop(.55,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c)}
function wheelGeo(r,wd,sp){sp=sp||[5,.22];const P=[],N=sp[0];
  const pr=[[r*.7,-wd/2+.01],[r*.86,-wd/2],[r*.96,-wd*.44],[r,-wd*.28],[r,wd*.28],[r*.96,wd*.44],[r*.86,wd/2],[r*.7,wd/2-.01]].map(p=>new T.Vector2(p[0],p[1]));
  let ge=new T.LatheGeometry(pr,36);ge.rotateZ(Math.PI/2);P.push([ge,0]);
  ge=new T.CylinderGeometry(r*.7,r*.7,wd-.02,28,1,true);ge.rotateZ(Math.PI/2);P.push([ge,3]);
  ge=new T.CylinderGeometry(r*.62,r*.62,.03,28);ge.rotateZ(Math.PI/2);P.push([ge,3]);
  ge=new T.CylinderGeometry(r*.53,r*.53,.05,28);ge.rotateZ(Math.PI/2);P.push([ge,2]);
  for(const sg of[1,-1]){const xo=sg*wd*.36;
    ge=new T.TorusGeometry(r*.67,.014,6,36);ge.rotateY(Math.PI/2);ge.translate(xo,0,0);P.push([ge,1]);
    ge=new T.CylinderGeometry(r*.14,r*.16,.05,18);ge.rotateZ(Math.PI/2);ge.translate(xo,0,0);P.push([ge,1]);
    ge=new T.CylinderGeometry(r*.075,r*.075,.058,14);ge.rotateZ(Math.PI/2);ge.translate(xo,0,0);P.push([ge,2]);
    for(let i=0;i<N;i++){ge=new T.BoxGeometry(.032,r*.54,r*sp[1]);ge.translate(0,r*.39,0);ge.rotateX(i*Math.PI*2/N);ge.translate(xo-sg*.006,0,0);P.push([ge,1])}}
  return merge(P)}

/* --- текстуры --- */
function roadTex(o){return (x,W,H)=>{x.fillStyle=o.base;x.fillRect(0,0,W,H);
  for(let i=0;i<9000;i++){const v=Math.random();x.fillStyle=v>.5?'rgba(255,255,255,'+(.02+Math.random()*.05).toFixed(3)+')':'rgba(0,0,0,'+(.04+Math.random()*.1).toFixed(3)+')';x.fillRect(Math.random()*W,Math.random()*H,1+Math.random()*2,1+Math.random()*3)}
  const X=d=>(d+o.half)/(2*o.half)*W,pm=W/(2*o.half),ym=H/o.vl;
  for(const l of o.lanes){x.fillStyle='rgba(0,0,0,.1)';x.fillRect(X(l-.95),0,pm*.5,H);x.fillRect(X(l+.45),0,pm*.5,H)}
  if(o.patch)for(let i=0;i<9;i++){x.fillStyle='rgba(20,20,22,'+(.25+Math.random()*.3).toFixed(2)+')';x.fillRect(Math.random()*W*.8,Math.random()*H,pm*(.6+Math.random()*1.6),ym*(.5+Math.random()*2.2));
    x.strokeStyle='rgba(10,10,10,.5)';x.lineWidth=1.5;x.beginPath();let cx_=Math.random()*W,cy=Math.random()*H;x.moveTo(cx_,cy);for(let j=0;j<6;j++){cx_+=(Math.random()-.5)*50;cy+=Math.random()*40;x.lineTo(cx_,cy)}x.stroke()}
  for(const [d,c] of o.solid){x.fillStyle=c;x.fillRect(X(d)-pm*.075,0,pm*.15,H)}
  x.fillStyle=o.dashC;for(const d of o.dash)for(let k=0;k<o.vl/12;k++)x.fillRect(X(d)-pm*.07,k*12*ym,pm*.14,o.dashL*ym)}}
function winTex(k){return (x,W,H)=>{x.fillStyle=['#12141f','#171a28','#0e1119'][k];x.fillRect(0,0,W,H);const cols=[14,18,12][k],rows=[40,48,34][k],cw=W/cols,rh=H/rows;
  for(let r=0;r<rows;r++){const floor=h1(k*31+r*7.7)>.82;for(let q=0;q<cols;q++){const hh=h1(k*91+r*13.7+q*3.1);if(!floor&&hh<.5)continue;
    x.fillStyle=hh>.9?'#fff4d0':hh>.72?'#ffd98a':hh>.6?'#bfe0ff':floor?'#e9c878':'#55472a';x.fillRect(q*cw+cw*.22,r*rh+rh*.25,cw*.56,rh*.5)}}}}
function skyNY(x,W,H){const hz=H/2;let gr=x.createLinearGradient(0,0,0,hz);gr.addColorStop(0,'#02030a');gr.addColorStop(.55,'#0d0c2a');gr.addColorStop(.86,'#2c1848');gr.addColorStop(1,'#63305a');x.fillStyle=gr;x.fillRect(0,0,W,hz);
  x.fillStyle='#07080d';x.fillRect(0,hz,W,hz);
  for(let i=0;i<700;i++){x.fillStyle='rgba(255,255,255,'+(.2+.7*h1(i*3.3)).toFixed(2)+')';x.fillRect(h1(i*1.1)*W,h1(i*2.7)*hz*.82,1.6,1.6)}
  gr=x.createRadialGradient(1762,327,0,1762,327,90);gr.addColorStop(0,'rgba(240,236,220,.5)');gr.addColorStop(1,'rgba(240,236,220,0)');x.fillStyle=gr;x.fillRect(1672,237,180,180);x.fillStyle='#f3efe0';x.beginPath();x.arc(1762,327,15,0,7);x.fill();
  for(let layer=0;layer<2;layer++){let px=0,i=0;while(px<W){const hh=h1(i*1.7+layer*50),tall=h1(i*2.3+layer*9)>(layer?.84:.9),bw=(layer?12:9)+hh*(layer?24:16),bh=tall?55+h1(i*5.1+layer)*75:(layer?12:20)+h1(i*1.9+layer)*34;
    x.fillStyle=layer?'#090a16':'#1a1838';x.fillRect(px,hz-bh,bw,bh+2);
    if(tall){x.fillRect(px+bw*.3,hz-bh-8,bw*.4,8);x.fillRect(px+bw*.47,hz-bh-26,Math.max(1.5,bw*.06),18);x.fillStyle='#ff4040';x.fillRect(px+bw*.47,hz-bh-27,2,2)}
    for(let wy=hz-bh+3;wy<hz-2;wy+=4)for(let wx=px+2;wx<px+bw-2;wx+=3.5)if(h1(wx*.71+wy*1.37+layer)>(layer?.6:.75)){x.fillStyle=layer?(h1(wx+wy)>.8?'#fff0c4':'#d9aa55'):'#7a6a4a';x.fillRect(wx,wy,1.6,2)}
    px+=bw+(layer?1:3);i++}}}
function bbDraw(x,W,H,a,b){const gr=x.createLinearGradient(0,0,W,H);gr.addColorStop(0,'#1a0828');gr.addColorStop(1,'#04141f');x.fillStyle=gr;x.fillRect(0,0,W,H);x.textBaseline='alphabetic';x.textAlign='left';
  const F=n=>'700 '+n+'px "Segoe UI",Arial,sans-serif';x.fillStyle=col(.85);x.font=F(40);x.fillText('СЕЙЧАС ИГРАЕТ',48,78);
  let lines=[a],fs=128;const fits=()=>{x.font=F(fs);return lines.every(l=>x.measureText(l).width<=W-96)};
  while(!fits()&&fs>70)fs-=4;
  if(!fits()){const ws=a.split(' ');if(ws.length>1){let best=1,bd=1e9;for(let i=1;i<ws.length;i++){const d=Math.abs(ws.slice(0,i).join(' ').length-ws.slice(i).join(' ').length);if(d<bd){bd=d;best=i}}lines=[ws.slice(0,best).join(' '),ws.slice(best).join(' ')];fs=96}
    while(!fits()&&fs>34)fs-=3;if(!fits())lines=lines.map(l=>{while(l.length>2&&x.measureText(l+'…').width>W-96)l=l.slice(0,-1);return x.measureText(l).width>W-96?l:l+(l.length<3?'':'…')})}
  x.fillStyle='#fff';x.font=F(fs);const y0=lines.length>1?170+fs*.4:230+fs*.3;lines.forEach((l,i)=>x.fillText(l,48,y0+i*fs*1.08));
  if(b){x.fillStyle='#c9cfda';let f2=50;x.font=F(f2);while(x.measureText(b).width>W-96&&f2>26){f2-=2;x.font=F(f2)}x.fillText(b,48,H-44)}}
function signTex(txt,bg,fg,brd){return (x,W,H)=>{x.fillStyle=bg;x.fillRect(0,0,W,H);x.strokeStyle=brd||fg;x.lineWidth=H*.06;x.strokeRect(H*.06,H*.06,W-H*.12,H-H*.12);x.fillStyle=fg;let fs=H*.5;x.font='700 '+fs+'px "Segoe UI",Arial,sans-serif';while(x.measureText(txt).width>W*.86&&fs>10){fs-=2;x.font='700 '+fs+'px "Segoe UI",Arial,sans-serif'}x.textAlign='center';x.textBaseline='middle';x.fillText(txt,W/2,H/2+fs*.04)}}
const nowTitle=()=>{if(cap)return ['Звук из: '+cap.name,''];const tr=tracks[cur];return tr?[tr.title,tr.artist||'']:['ВЕРТУШКА','включи музыку']};

/* --- трассы --- */
const CARCOL=[0xc8c8cd,0x282c34,0x96181e,0x1e4696,0x5a6068,0xecece8,0x185a3c],NYS=['Manhattan','Brooklyn Bridge','Times Square','FDR Drive','Queens','JFK Airport'];
const NY={id:'ny',name:'Шоссе: Нью-Йорк',night:true,half:10.9,lim:9.7,lanes:[[-8.75,1],[-5.25,1],[-1.75,1],[1.75,1],[5.25,1],[8.75,1]],home:3,gap:[10,20],oncoming:0,cruise:[21,30],fastV:28,crashV:15,vtop:78,wallE:.25,wallLoss:.035,wallDrag:.2,
  cx:s=>70*Math.sin(s/520)+22*Math.sin(s/190+1.3),dcx:s=>70/520*Math.cos(s/520)+22/190*Math.cos(s/190+1.3),hy:s=>4*Math.sin(s/380)+1.5*Math.sin(s/150+1),dhy:s=>4/380*Math.cos(s/380)+1.5/150*Math.cos(s/150+1),
  fog:0x24163a,fogN:120,fogF:900,hemi:[0x8ea0d8,0x15141c,.75],sun:[0x9fb2ff,.22],sunDir:[-.5,.5,-.6],sky:skyNY,rough:.28,roadEnv:1,vl:24,
  roadTex:roadTex({base:'#2b2c32',half:10.9,vl:24,lanes:[-8.75,-5.25,-1.75,1.75,5.25,8.75],solid:[[-10.55,'#e2b93a'],[10.55,'#e4e4dc']],dash:[-7,-3.5,0,3.5,7],dashC:'#e6e6de',dashL:5}),
  left:[[-500,-.4,0x181a22],[-11.52,-.4,0x181a22],[-11.5,-.4,0x6a6d74],[-11.5,.95,0x8b8e94],[-11.1,.95,0x8b8e94],[-10.9,0,0x5d5f66]],right:[[10.9,0,0x5d5f66],[11.1,.95,0x8b8e94],[11.5,.95,0x8b8e94],[11.5,-.4,0x6a6d74],[11.52,-.4,0x181a22],[500,-.4,0x181a22]],
  
  car:{m:1350,Iz:1750,a:1.25,b:1.35,hcg:.45,Cf:112000,Cr:136000,mu:1.3,Tmax:520,red:7400,gears:[3.3,2.1,1.5,1.15,.92,.76],fd:3.7,rw:.34,cd:.52,steerMax:.62,brakeG:10.5,esp:4,driftLock:.42,driftCs:.8,driftSlip:.6,driftAng:.44,driftKp:9,driftKd:2.6,rollK:.006,pitchK:.0045},
  pick(){const r=Math.random(),c=CARCOL[(Math.random()*CARCOL.length)|0];return r<.34?{kind:'taxi',col:0xf5c518,cr:.95}:r<.6?{kind:'sedan',col:c,cr:1}:r<.78?{kind:'suv',col:c,cr:.98}:r<.91?{kind:'truck',col:c,cr:.8}:{kind:'bus',col:0xe6e8ec,cr:.76}},
  scenery(w){const sc=w.root;
    const lg=merge([[new T.CylinderGeometry(.1,.14,9,8).translate(0,4.5,0),0],[new T.BoxGeometry(2.5,.1,.12).translate(1.2,8.95,0),0],[new T.BoxGeometry(.8,.1,.34).translate(2.2,8.88,0),1]]);
    w.lamps=new T.InstancedMesh(lg,[new T.MeshLambertMaterial({color:0x3a3d46}),new T.MeshBasicMaterial({color:0xfff0cc})],48);
    w.pools=new T.InstancedMesh(new T.PlaneGeometry(20,28).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:glowTex,color:0xffd29a,transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),48);
    w.bld=[0,1,2].map(k=>new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({map:ctex(512,1024,winTex(k))}),110));
    for(const m of [w.lamps,w.pools,...w.bld]){m.frustumCulled=false;m.count=0;sc.add(m)}
    w.lampGlow=w.mkPts(64,4.4,0xffe0ae,false,sc);
    w.neon=new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({color:0xffffff,toneMapped:false}),90);w.neon.frustumCulled=false;w.neon.count=0;sc.add(w.neon);w.neonGlow=w.mkPts(140,14,0xffffff,true,sc);w.nc=new T.Color();
    w.bbCv=document.createElement('canvas');w.bbCv.width=1024;w.bbCv.height=448;w.bbTex=new T.CanvasTexture(w.bbCv);w.bbTex.encoding=T.sRGBEncoding;w.bbTex.anisotropy=8;
    w.bb=new T.Group();w.bbFrame=new T.MeshBasicMaterial({color:0xff40c0});const pm=new T.MeshLambertMaterial({color:0x2a2c34});
    w.bb.add(new T.Mesh(new T.PlaneGeometry(13,5.7).translate(0,11,.22),new T.MeshBasicMaterial({map:w.bbTex})),new T.Mesh(new T.BoxGeometry(13.5,6.2,.3).translate(0,11,0),w.bbFrame),new T.Mesh(new T.CylinderGeometry(.22,.22,8,8).translate(-4,4,0),pm),new T.Mesh(new T.CylinderGeometry(.22,.22,8,8).translate(4,4,0),pm));w.sc.add(w.bb);
    w.gan=new T.Group();const gm=new T.MeshLambertMaterial({color:0x4a4e56});
    w.gan.add(new T.Mesh(new T.BoxGeometry(24.6,.5,.5).translate(0,7.6,0),gm),new T.Mesh(new T.BoxGeometry(.4,7.8,.4).translate(-12.1,3.9,0),gm),new T.Mesh(new T.BoxGeometry(.4,7.8,.4).translate(12.1,3.9,0),gm));
    w.ganS=[0,1].map(j=>{const m=new T.Mesh(new T.PlaneGeometry(6.2,2.3).translate(j?5.4:-5.4,8.3,.3),new T.MeshBasicMaterial({color:0xb8b8b8}));w.gan.add(m);return m});w.ganT=NYS.map(n=>ctex(512,190,signTex(n,'#0f6a3c','#f2f6f2')));w.sc.add(w.gan)},
  populate(w,base,P){let li=0,gi=0,ni=0,g2=0;const bi=[0,0,0],gp=w.lampGlow.geometry.attributes.position,gp2=w.neonGlow.geometry.attributes.position,gc2=w.neonGlow.geometry.attributes.color,NC=w.nc;
    for(let n=base-BACK;n<base+KN;n++){const s=n*SEG;
      if(n%8===0)for(const sg of[-1,1]){const p=P(s,sg*12.1),q=P(s,sg*9.9);setI(w.lamps,li,p.x,p.y,p.z,p.yaw+(sg>0?Math.PI:0),1,1,1);gp.setXYZ(gi++,q.x,q.y+8.7,q.z);setI(w.pools,li,q.x,q.y+.05,q.z,q.yaw,1,1,1,q.pitch);li++}
      if(n%3===0)for(const sg of[-1,1]){const hh=h1(n*1.37+sg*7);if(hh<.16)continue;const bw=14+h1(n*2.1+sg)*15,bd=14+h1(n*3.3+sg)*12,bh=18+Math.pow(h1(n*2.9+sg),2.2)*130,k=(hh*30|0)%3,off=20.5+bd/2+h1(n*.7+sg)*26,p=P(s,sg*off);setI(w.bld[k],bi[k]++,p.x,p.y+bh/2-3,p.z,p.yaw,bd,bh,bw);
        if(h1(n*4.7+sg*3)>.42&&ni<90&&g2<138){const nh=6+h1(n*5.3+sg)*Math.min(22,bh*.35),ny=5+h1(n*6.1+sg)*Math.max(2,bh*.5-nh)+nh/2-3,q=P(s,sg*(off-bd/2-.5));NC.setHex(NEON[(h1(n*7.9+sg)*NEON.length)|0]);
          setI(w.neon,ni,q.x,q.y+ny,q.z,q.yaw,.5,nh,2.4);w.neon.setColorAt(ni,NC);ni++;gp2.setXYZ(g2,q.x,q.y+ny,q.z);gc2.setXYZ(g2,NC.r*.5,NC.g*.5,NC.b*.5);g2++}
        if(bh>95&&g2<140){gp2.setXYZ(g2,p.x,p.y+bh-2,p.z);gc2.setXYZ(g2,.9,.08,.06);g2++}}}
    w.neon.count=ni;w.neon.instanceMatrix.needsUpdate=true;if(w.neon.instanceColor)w.neon.instanceColor.needsUpdate=true;gp2.needsUpdate=gc2.needsUpdate=true;w.neonGlow.geometry.setDrawRange(0,g2);
    w.lamps.count=w.pools.count=li;w.lamps.instanceMatrix.needsUpdate=w.pools.instanceMatrix.needsUpdate=true;gp.needsUpdate=true;w.lampGlow.geometry.setDrawRange(0,gi);
    w.bld.forEach((m,k)=>{m.count=bi[k];m.instanceMatrix.needsUpdate=true})},
  tick(w,st,P){w.lampGlow.material.size=4.2+A.beat*2.4;w.neon.material.color.setScalar(.7+A.beat*.7+A.mid*.5);w.neonGlow.material.size=11+A.beat*9;w.pools.material.opacity=.36+A.bass*.26;w.bld.forEach((m,k)=>m.material.color.setScalar(.8+A.bands[8+k*14]*1.5));w.bbFrame.color.set(col(.55+A.beat*.4));
    const sb=Math.ceil((st.s+25)/420)*420;if(sb!==w.bbS){w.bbS=sb;const sg=(sb/420)%2?1:-1,p=P(sb,sg*19);w.bb.position.set(p.x,p.y-1,p.z);w.bb.rotation.y=p.yaw-sg*.32}
    const tt=nowTitle(),key=tt[0]+'|'+tt[1]+'|'+palIdx+theme;if(key!==w.bbKey){w.bbKey=key;bbDraw(w.bbCv.getContext('2d'),1024,448,tt[0],tt[1]);w.bbTex.needsUpdate=true}
    const sg2=Math.ceil((st.s-430)/900)*900+450;if(sg2!==w.ganPos){w.ganPos=sg2;const p=P(sg2,0);w.gan.position.set(p.x,p.y,p.z);w.gan.rotation.y=p.yaw;const i=(sg2-450)/900;w.ganS.forEach((m,j)=>{m.material.map=w.ganT[(((i*2+j)%6)+6)%6];m.material.needsUpdate=true})}}};

/* --- сама игра --- */
function make(cfg){
  let w=null,st=null,camMode=LS.get('cam_'+cfg.id,0)%4;
  const cx=cfg.cx,dcx=cfg.dcx,hy=cfg.hy,dhy=cfg.dhy,HALF=cfg.half,LX=cfg.lanes.map(l=>l[0]);let C=cfg.car,gar=false;
  const pt=(s,d,S0)=>{const m=dcx(s),n=Math.hypot(1,m);return {x:cx(s)+d/n,y:hy(s),z:-(s-S0)+d*m/n,yaw:-Math.atan(m),pitch:Math.atan(dhy(s))}};
  const py=(p,s)=>p[1]+(p[3]?p[3]*Math.sin(s*p[4]+p[5]):0);
  const polyY=(poly,s,d)=>{if(d<=poly[0][0])return py(poly[0],s);for(let i=1;i<poly.length;i++)if(d<=poly[i][0]){const a=poly[i-1],b=poly[i],f=(d-a[0])/Math.max(1e-6,b[0]-a[0]);return py(a,s)*(1-f)+py(b,s)*f}return py(poly[poly.length-1],s)};
  const groundY=(s,d)=>hy(s)+(d<-HALF?polyY(cfg.left,s,d):d>HALF?polyY(cfg.right,s,d):0);
  function strip(poly,mat,opt){const P=poly.length,n=(KN+1)*P,geo=new T.BufferGeometry(),pos=new Float32Array(n*3),uv=new Float32Array(n*2),idx=[];
    for(let k=0;k<KN;k++)for(let j=0;j<P-1;j++){const a=k*P+j,b=a+P;idx.push(a,a+1,b,a+1,b+1,b)}
    geo.setIndex(idx);geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('uv',new T.BufferAttribute(uv,2));
    if(opt.colors){const cl=new Float32Array(n*3),c=new T.Color();for(let k=0;k<=KN;k++)for(let j=0;j<P;j++){c.set(poly[j][2]);cl.set([c.r,c.g,c.b],(k*P+j)*3)}geo.setAttribute('color',new T.BufferAttribute(cl,3))}
    const mesh=new T.Mesh(geo,mat);mesh.frustumCulled=false;mesh.receiveShadow=true;
    mesh.userData.up=base=>{const S0=base*SEG,vl=opt.vl,v0=Math.floor(S0/vl);let o=0,q=0;
      for(let k=0;k<=KN;k++){const s=(base-BACK+k)*SEG,m=dcx(s),nn=Math.hypot(1,m),c=cx(s),hh=hy(s);
        for(let j=0;j<P;j++){const p=poly[j],d=p[0];pos[o++]=c+d/nn;pos[o++]=hh+py(p,s);pos[o++]=-(s-S0)+d*m/nn;uv[q++]=opt.colors?d/vl:p[2];uv[q++]=s/vl-v0}}
      geo.attributes.position.needsUpdate=true;geo.attributes.uv.needsUpdate=true;geo.computeVertexNormals()};
    return mesh}
  function build(){boot();const sc=new T.Scene(),night=cfg.night;w={sc,night,base:null};
    w.cam=new T.PerspectiveCamera(66,1,.3,1800);
    w.sky=new T.Mesh(new T.SphereGeometry(1500,32,16),new T.MeshBasicMaterial({map:ctex(2048,1024,cfg.sky),side:T.BackSide,fog:false,depthWrite:false,toneMapped:false}));w.sky.renderOrder=-1;
    const es=new T.Scene();es.add(w.sky);const pm=new T.PMREMGenerator(R3);sc.environment=pm.fromScene(es,.02,1,2000).texture;pm.dispose();sc.add(w.sky);
    sc.fog=new T.Fog(cfg.fog,cfg.fogN,cfg.fogF);sc.add(new T.HemisphereLight(cfg.hemi[0],cfg.hemi[1],cfg.hemi[2]));
    const dl=new T.DirectionalLight(cfg.sun[0],cfg.sun[1]);sc.add(dl);sc.add(dl.target);w.dl=dl;w.sunDir=new T.Vector3(...cfg.sunDir).normalize();
    if(night){w.spot=new T.SpotLight(0xfff1d6,2.8,130,.52,.7,1.1);sc.add(w.spot);sc.add(w.spot.target)}
    else{dl.castShadow=true;dl.shadow.mapSize.set(TOUCH?1024:2048,TOUCH?1024:2048);const c=dl.shadow.camera;c.left=-45;c.right=45;c.top=45;c.bottom=-45;c.near=20;c.far=340;dl.shadow.bias=-.0004;dl.shadow.normalBias=.04}
    const S=o=>new T.MeshStandardMaterial(o);
    w.m={glass:new T.MeshPhysicalMaterial({color:0x26313d,roughness:.04,metalness:.15,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.6,side:T.DoubleSide}),dark:S({color:0x1b1c20,roughness:.8,side:T.DoubleSide}),tire:S({color:0x121214,roughness:.88,side:T.DoubleSide}),plate:S({map:plateTex('VT·2026'),roughness:.45}),head:S({color:0xffffff,emissive:0xfff0c8,emissiveIntensity:night?2.2:.35,roughness:.3}),
      tail:S({color:0x550808,emissive:0xff1a10,emissiveIntensity:night?1.6:.2,roughness:.4}),aux:S({color:0xc4c8ce,roughness:.45,metalness:.7}),rim:S({color:0xb4b9c0,roughness:.22,metalness:.9}),paint:{}};
    w.paint=hex=>w.m.paint[hex]||(w.m.paint[hex]=S({color:hex,roughness:.34,metalness:.35}));
    w.ppaint=()=>{const pd=w.pd,k='p'+pd.hex;return w.m.paint[k]||(w.m.paint[k]=new T.MeshPhysicalMaterial({color:pd.hex,roughness:pd.met?.3:.2,metalness:pd.met?.8:.25,clearcoat:1,clearcoatRoughness:.05}))};w.plth=S({color:0xd8c3a0,roughness:.6});w.pcal=S({color:0xd01818,roughness:.35,metalness:.2});w.pplate=S({map:plateTex(''),roughness:.45});
    w.garL=new T.PointLight(0xfff4e8,0,22,1);sc.add(w.garL);w.garR=new T.PointLight(0xff8a3a,0,22,1);sc.add(w.garR);w.garH=new T.HemisphereLight(0xcfd8ff,0x2a2230,0);sc.add(w.garH);w.garF=new T.PointLight(0xdfe8ff,0,14,1);sc.add(w.garF);
    w.root=new T.Group();sc.add(w.root);w.dyn=new T.Group();sc.add(w.dyn);
    w.mkPts=(n,size,color,vc,parent)=>{const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));if(vc)ge.setAttribute('color',new T.BufferAttribute(new Float32Array(n*3),3));ge.setDrawRange(0,0);
      const p=new T.Points(ge,new T.PointsMaterial({map:glowTex,size,color,vertexColors:!!vc,transparent:true,blending:T.AdditiveBlending,depthWrite:false,sizeAttenuation:true,fog:false}));p.frustumCulled=false;parent.add(p);return p};
    const gm=()=>new T.MeshLambertMaterial({vertexColors:true,map:noiseTex,side:T.DoubleSide});
    w.strips=[strip([[-HALF,0,0],[HALF,0,1]],S({map:ctex(1024,1024,cfg.roadTex,true),roughness:cfg.rough,metalness:0,envMapIntensity:cfg.roadEnv}),{vl:cfg.vl}),strip(cfg.left,gm(),{colors:1,vl:8}),strip(cfg.right,gm(),{colors:1,vl:8})];
    w.strips.forEach(m=>w.root.add(m));cfg.scenery(w);
    w.lightP=w.mkPts(LPN,night?1.7:1.1,0xffffff,true,w.dyn);w.parts=w.mkPts(PN,.55,0xffffff,true,w.dyn);w.parts.geometry.setDrawRange(0,PN);
    w.pp=[];for(let i=0;i<PN;i++)w.pp.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,l:0,m:1,r:0,g:0,b:0,gr:0});w.pi=0;
    const pg=selCar(LS.get('car_'+cfg.id,{i:0,c:0}));w.pg=pg;w.ptail=w.m.tail.clone();w.car=new T.Group();w.car.rotation.order='YXZ';
    w.pgl=w.m.glass.clone();w.body=new T.Mesh(pg.geo,[w.ppaint(),w.pgl,w.m.dark,w.m.head,w.ptail,w.m.aux,w.plth,w.pplate]);w.plth.color.setHex(w.pd.cab.seat);w.body.castShadow=true;w.car.add(w.body);sc.add(w.car);
    w.mkWh=()=>{const pg=w.pg;if(w.wh)w.wh.forEach(([p])=>w.car.remove(p));const cd=CARS[w.pd.kind]||{},wg=wheelGeo(pg.wr,.26,cd.wh);w.pcal.color.setHex(cd.cal||0x777b80);w.wh=[];for(let i=0;i<4;i++){const piv=new T.Group(),m=new T.Mesh(wg,[w.m.tire,w.m.rim,w.m.aux,w.m.dark]);m.castShadow=true;const cl=new T.Mesh(new T.BoxGeometry(.085,pg.wr*.34,pg.wr*.4),w.pcal);cl.position.set(0,pg.wr*.3,pg.wr*.16);cl.rotation.x=.5;piv.add(cl);piv.position.set((i%2?1:-1)*(pg.W/2-.15),pg.wr,-(i<2?pg.ax[0]:pg.ax[1]));piv.add(m);w.car.add(piv);w.wh.push([piv,m])}};w.mkWh();
    // неон под днищем, дым, следы шин, тени под машинами
    w.glow=new T.Mesh(new T.PlaneGeometry(3.6,6.8).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:glowTex,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));w.glow.position.y=.05;w.car.add(w.glow);w.csh=new T.Mesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:cshTex(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));w.csh.position.y=.03;w.csh.renderOrder=1;w.car.add(w.csh);w.csh.scale.set(w.pg.W*1.3,1,w.pg.L*1.12);
    {const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(new Float32Array(SMN*3),3));ge.setAttribute('color',new T.BufferAttribute(new Float32Array(SMN*3),3));
      const pc=document.createElement('canvas');pc.width=pc.height=64;const px=pc.getContext('2d');for(let i=0;i<14;i++){const r=10+Math.random()*14,x=20+Math.random()*24,y=20+Math.random()*24,gr=px.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');px.fillStyle=gr;px.fillRect(0,0,64,64)}
      const mt=new T.ShaderMaterial({uniforms:{map:{value:new T.CanvasTexture(pc)},tint:{value:new T.Color(cfg.night?0xa9aebb:0xd8d8dc)}},transparent:true,depthWrite:false,
        vertexShader:'attribute vec3 color;varying float va;varying float vr;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);va=color.x;vr=color.z;gl_PointSize=color.y*640./max(.5,-mv.z);gl_Position=projectionMatrix*mv;}',
        fragmentShader:'uniform sampler2D map;uniform vec3 tint;varying float va;varying float vr;void main(){vec2 u=gl_PointCoord-.5;float c=cos(vr),s=sin(vr);u=mat2(c,-s,s,c)*u+.5;vec4 t=texture2D(map,u);gl_FragColor=vec4(tint*(.85+.15*t.r),t.a*va);if(gl_FragColor.a<.004)discard;}'});
      w.smoke=new T.Points(ge,mt);w.smoke.frustumCulled=false;w.smoke.renderOrder=4;w.dyn.add(w.smoke)}w.sp=[];for(let i=0;i<SMN;i++)w.sp.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,l:0,m:1});w.si=0;
    {const ge=new T.BufferGeometry(),idx=[];w.skA=new Float32Array(SKN*12);for(let i=0;i<SKN;i++){const a=i*4;idx.push(a,a+1,a+2,a+2,a+1,a+3)}ge.setIndex(idx);ge.setAttribute('position',new T.BufferAttribute(w.skA,3));
      w.sk=new T.Mesh(ge,new T.MeshBasicMaterial({color:0x040405,transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));w.sk.frustumCulled=false;sc.add(w.sk);w.skI=0;w.skZ=0;w.skP=[null,null]}
    w.shad=new T.InstancedMesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false,opacity:.8,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),48);w.shad.frustumCulled=false;w.shad.count=0;sc.add(w.shad);
    // салон: вид от руля. Рисуется вторым проходом поверх мира своей камерой с близкой плоскостью отсечения, поэтому у лица ничего не срезается
    w.mkCab=()=>{const pg=w.pg,CB=w.pd.cab,cs=new T.Scene(),cab=new T.Group();cab.position.y=CB.dy;w.cabSc=cs;w.cab=cab;cs.add(cab);cs.environment=sc.environment;w.cabCam=new T.PerspectiveCamera(60,1,.03,8);
      const dkM=S({color:CB.dash,roughness:.85}),sfM=S({color:CB.soft,roughness:.7}),trM=S({color:0x9a9fac,roughness:.3,metalness:.85}),lthM=S({color:CB.wheel,roughness:.5}),spkM=S({color:0x9aa0b0,roughness:.6}),glvM=S({color:0xc99a7c,roughness:.7}),slvM=S({color:0x3a4150,roughness:.9}),wdM=S({color:CB.trim,roughness:CB.wood?.32:.28,metalness:CB.wood?.05:.85}),seM=S({color:CB.seat,roughness:.62});
      w.ambM=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
      w.cabH=new T.HemisphereLight(0xb4bee0,0x14141c,1.25);cs.add(w.cabH);const kl=new T.DirectionalLight(0x9fb0ff,.6);kl.position.set(.4,1.2,-1.5);cs.add(kl);
      w.cabL=new T.PointLight(0xffffff,.8,2.4,1.6);w.cabL.position.set(-.1,1.0,-.7);cs.add(w.cabL);
      const add=(ge,m,x,y,z)=>{const me=new T.Mesh(ge,m);me.position.set(x||0,y||0,z||0);cab.add(me);return me};
      const bx=(a,b,c,x,y,z,m)=>add(new T.BoxGeometry(a,b,c),m||dkM,x,y,z);
      const beam=(p,q,a,b,m)=>{const me=bx(a,b,Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2]),(p[0]+q[0])/2,(p[1]+q[1])/2,(p[2]+q[2])/2,m);me.lookAt(q[0],q[1],q[2]);return me};
      const prof=(pts,wd,x,m)=>{const sh=new T.Shape();pts.forEach((p,k)=>k?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));const ge=new T.ExtrudeGeometry(sh,{depth:wd,bevelEnabled:false});ge.translate(0,0,-wd/2);ge.rotateY(Math.PI/2);return add(ge,m,x,0,0)};
      const scr=(cw,ch,pw,ph,x,y,z,rx,ry)=>{const c=document.createElement('canvas');c.width=cw;c.height=ch;const tx=new T.CanvasTexture(c);tx.encoding=T.sRGBEncoding;const me=add(new T.PlaneGeometry(pw,ph),new T.MeshBasicMaterial({map:tx,toneMapped:false}),x,y,z);me.rotation.order='YXZ';me.rotation.set(rx||0,ry||0,0);return [c,tx]};
      // капот (кузов из мира в этом виде спрятан), торпедо, козырёк приборки, пол, тоннель
      prof([[.97,.4],[.97,.755],[1.0,.775],[1.8,.655],[2.25,.535],[2.25,.4]],pg.W+.34,0,w.ppaint());
      prof([[.34,.36],[.33,.645],[.39,.775],[.47,.80],[.96,.735],[1.04,.685],[1.04,.36]],1.64,0,sfM);
      prof([[.40,.745],[.435,.89],[.47,.91],[.62,.885],[.7,.825],[.7,.745]],.44,-.37,dkM);
      bx(1.64,.02,2.2,0,.35,.3,dkM);bx(.22,.22,1.3,0,.5,.4,sfM);bx(.9,.008,.008,.33,.783,-.388,w.ambM);bx(.16,.008,.008,-.7,.783,-.388,w.ambM);
      for(let k=0;k<3;k++)bx(.16,.045,.012,.34+k*.19,.72,-.352,dkM);
      // двери, стойки, крыша, зеркала, дворники
      const mirM=new T.MeshBasicMaterial({map:ctex(64,32,(x,a,b)=>{const gr=x.createLinearGradient(0,0,0,b);gr.addColorStop(0,'#141a33');gr.addColorStop(.5,'#3a2a55');gr.addColorStop(.52,'#15171d');gr.addColorStop(1,'#0c0d11');x.fillStyle=gr;x.fillRect(0,0,a,b);x.fillStyle='#fff';x.fillRect(30,17,1,12);x.fillStyle='#ffe9b0';x.fillRect(12,9,2,2);x.fillRect(22,11,2,2);x.fillRect(47,8,2,2);x.fillStyle='#ff3b6b';x.fillRect(54,5,2,8)}),toneMapped:false});
      for(const sg of[-1,1]){bx(.07,.56,2,sg*.84,.61,.3,sfM);bx(.1,.03,2,sg*.83,.895,.3,dkM);bx(.008,.008,1.1,sg*.802,.8,.1,w.ambM);
        beam([sg*.8,.75,-.97],[sg*.735,1.29,-.03],.06,.055,dkM);if(!CB.open)beam([sg*.735,1.29,-.03],[sg*.745,1.285,1.3],.07,.06,dkM);
        bx(.2,.12,.07,sg*1.0,.955,-.66,w.ppaint());beam([sg*.82,.9,-.6],[sg*.93,.93,-.66],.05,.06,dkM);
        add(new T.PlaneGeometry(.17,.095),mirM,sg*1.0,.955,-.623)}
      if(!CB.open)bx(1.52,.03,1.4,0,1.32,.66,sfM);bx(1.5,.07,.07,0,1.31,-.03,dkM);
      bx(.2,.065,.03,-.02,1.2,-.2,dkM);beam([-.02,1.29,-.1],[-.02,1.21,-.2],.02,.02,dkM);
      add(new T.PlaneGeometry(.185,.05),new T.MeshBasicMaterial({map:ctex(64,16,(x,a,b)=>{const gr=x.createLinearGradient(0,0,0,b);gr.addColorStop(0,'#0a0c18');gr.addColorStop(1,'#2a3350');x.fillStyle=gr;x.fillRect(0,0,a,b);x.fillStyle='#ffe9b0';x.fillRect(20,9,3,2);x.fillRect(27,9,3,2);x.fillRect(46,8,2,2)}),toneMapped:false}),-.02,1.2,-.183);
      beam([-.62,.752,-.985],[-.04,.768,-.99],.022,.014,lthM);beam([.02,.752,-.985],[.6,.768,-.99],.022,.014,lthM);
      // отделка (дерево у мерседесов и ауди, алюминий у корвета и порше) и пассажирское кресло
      bx(1.5,.035,.012,0,.6,-.333,wdM);bx(.2,.012,.62,0,.616,.12,wdM);bx(.5,.13,.52,.37,.5,.42,seM);bx(.5,.62,.13,.37,.86,.74,seM).rotation.x=-.18;bx(.26,.17,.1,.37,1.28,.82,seM);
      // руль под марку (по фото): мерседес — 4 спицы, звезда, дерево по ободу; ауди — 3 спицы, кольца; корвет — плоский низ; порше — 3 спицы
      const swp=new T.Group();swp.position.set(-.37,.79,-.2);swp.rotation.x=-.38;const sw=new T.Group();swp.add(sw);cab.add(swp);w.sw=sw;
      swp.add(new T.Mesh(new T.CylinderGeometry(.036,.05,.36,16).rotateX(Math.PI/2).translate(0,0,-.2),dkM));
      const BR=CB.cl,R=.17,rr=.02,lea=S({color:0x141416,roughness:.48}),pad=S({color:0x1b1b1e,roughness:.4,metalness:.2});
      const rimWood=BR==='merc'&&!CB.dy;// дерево по ободу у W210 (фото 2)
      const wdR=S({color:0x4a1f0c,roughness:.22,metalness:.05});
      if(BR==='vette'){const pts=[];for(let k=0;k<=64;k++){const a=k/64*Math.PI*2;let x=Math.cos(a)*R,y=Math.sin(a)*R;if(y<-R*.78)y=-R*.78;pts.push(new T.Vector3(x,y,0))}
        sw.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,true),96,rr,10,true),lea))}
      else if(rimWood){sw.add(new T.Mesh(new T.TorusGeometry(R,rr,14,48,Math.PI*.42).rotateZ(Math.PI*.29),wdR),new T.Mesh(new T.TorusGeometry(R,rr,14,48,Math.PI*.42).rotateZ(Math.PI*1.29),wdR),
        new T.Mesh(new T.TorusGeometry(R,rr*1.04,14,30,Math.PI*.58).rotateZ(-Math.PI*.29),lea),new T.Mesh(new T.TorusGeometry(R,rr*1.04,14,30,Math.PI*.58).rotateZ(Math.PI*.71),lea))}
      else sw.add(new T.Mesh(new T.TorusGeometry(R,rr,14,64),lea));
      // ступица (подушка) с эмблемой
      const logo=ctex(128,128,(x,a,b)=>{x.fillStyle='#16161a';x.fillRect(0,0,a,b);x.translate(64,64);x.strokeStyle='#d8dce2';x.fillStyle='#d8dce2';x.lineWidth=5;
        if(BR==='merc'){x.beginPath();x.arc(0,0,34,0,7);x.stroke();for(let k=0;k<3;k++){x.save();x.rotate(k*Math.PI*2/3);x.beginPath();x.moveTo(0,-32);x.lineTo(5,-2);x.lineTo(-5,-2);x.closePath();x.fill();x.restore()}}
        else if(BR==='audi'){x.lineWidth=4;for(let k=0;k<4;k++){x.beginPath();x.arc(-33+k*22,0,13,0,7);x.stroke()}}
        else if(BR==='vette'){x.fillStyle='#c8102e';x.fillRect(-30,-16,26,18);x.fillStyle='#e8e8e8';x.fillRect(4,-16,26,18);x.strokeStyle='#bbb';x.beginPath();x.moveTo(-30,14);x.lineTo(30,-24);x.moveTo(30,14);x.lineTo(-30,-24);x.stroke()}
        else{x.fillStyle='#c9a23a';x.beginPath();x.moveTo(-18,-22);x.lineTo(18,-22);x.lineTo(16,10);x.quadraticCurveTo(0,26,-16,10);x.closePath();x.fill();x.fillStyle='#1a1a1a';x.fillRect(-12,-14,24,4)}});
      const hubR=BR==='merc'?.068:.058,hub=new T.Mesh(new T.CylinderGeometry(hubR,hubR*1.08,.05,32).rotateX(Math.PI/2),pad);sw.add(hub);
      const lg=new T.Mesh(new T.CircleGeometry(hubR*.92,32),new T.MeshStandardMaterial({map:logo,roughness:.35,metalness:.3}));lg.position.z=.0255;sw.add(lg);
      // спицы с кнопками мультируля
      const btn=ctex(128,48,(x,a,b)=>{x.fillStyle='#1c1c20';x.fillRect(0,0,a,b);x.fillStyle='#2c2c32';for(let k=0;k<3;k++){x.beginPath();x.arc(26+k*38,24,13,0,7);x.fill()}x.fillStyle='#e8eef8';x.font='bold 14px Arial';x.textAlign='center';x.textBaseline='middle';['+','◄','–'].forEach((t,k)=>x.fillText(t,26+k*38,24))}),btM=S({map:btn,roughness:.45}),chr=S({color:0xb8bcc4,roughness:.22,metalness:.95});
      const spoke=(ang,len,wd,bt)=>{const g=new T.Group(),b=new T.Mesh(new T.BoxGeometry(len,wd,.022),bt?[pad,pad,pad,pad,btM,pad]:pad);b.position.x=hubR*.6+len/2;g.add(b);
        const tr=new T.Mesh(new T.BoxGeometry(len*.8,.004,.024),chr);tr.position.set(hubR*.6+len*.45,-wd/2-.001,0);g.add(tr);g.rotation.z=ang;sw.add(g)};
      const sl=R-hubR*.6-.01;
      if(BR==='merc'){spoke(.32,sl,.04,1);spoke(Math.PI-.32,sl,.04,1);spoke(-Math.PI/2+.5,sl,.028,0);spoke(-Math.PI/2-.5,sl,.028,0)}
      else{spoke(0,sl,.046,1);spoke(Math.PI,sl,.046,1);spoke(-Math.PI/2,sl*(BR==='vette'?.75:1),.04,0)}
      sw.add(new T.Mesh(new T.BoxGeometry(.012,.026,.044).translate(0,R,0),BR==='vette'?S({color:0xc8102e,roughness:.5}):S({color:0x18181a,roughness:.5})));
      // руки: кисть обхватывает обод (пальцы обёрнуты вокруг), запястье, часы на левой, тёмный рукав
      const skin=new T.MeshStandardMaterial({color:0xc98d70,roughness:.6}),skinD=new T.MeshStandardMaterial({color:0xb27a5e,roughness:.65}),nail=new T.MeshStandardMaterial({color:0xe3b8a6,roughness:.3});
      const slv=S({color:0x23262d,roughness:.92}),wst=S({color:0xc9ccd2,roughness:.18,metalness:1}),wfc=S({map:ctex(64,64,(x,a,b)=>{x.fillStyle='#101418';x.beginPath();x.arc(32,32,30,0,7);x.fill();x.strokeStyle='#e8e8e8';x.lineWidth=2;for(let k=0;k<12;k++){const q=k/12*Math.PI*2;x.beginPath();x.moveTo(32+Math.cos(q)*22,32+Math.sin(q)*22);x.lineTo(32+Math.cos(q)*28,32+Math.sin(q)*28);x.stroke()}x.lineWidth=3;x.beginPath();x.moveTo(32,32);x.lineTo(32,14);x.moveTo(32,32);x.lineTo(46,36);x.stroke()}),roughness:.1,metalness:.3});
      w.hands=[];w.arms=[];w.elb=[];
      for(const sg of[-1,1]){const a=sg>0?.32:Math.PI-.32,u=new T.Vector3(Math.cos(a),Math.sin(a),0),v=new T.Vector3(-Math.sin(a),Math.cos(a),0),Z=new T.Vector3(0,0,1),hd=new T.Group();sw.add(hd);w.hands.push(hd);
        const c=u.clone().multiplyScalar(R),onRim=(t,r,off)=>c.clone().addScaledVector(u,Math.cos(t)*r).addScaledVector(Z,Math.sin(t)*r).addScaledVector(v,off);
        // ладонь — снаружи-сзади обода
        const palm=new T.Mesh(new T.SphereGeometry(.045,16,12).scale(1.05,.95,.55),skin);palm.position.copy(onRim(.75,.045,-sg*.0)).addScaledVector(v,-.005);palm.lookAt(palm.position.clone().add(u.clone().multiplyScalar(-1).add(Z.clone().multiplyScalar(-.6))));hd.add(palm);hd.userData.palm=palm;
        // 4 пальца: дуга вокруг сечения обода от ладони наружу, вперёд и внутрь
        for(let f=0;f<4;f++){const off=(f-1.5)*.0205,ln=[.95,1.05,1.0,.82][f],rf=.0098-f*.0005,pts=[];
          for(let k=0;k<=10;k++){const t=.55-k/10*(Math.PI*1.55*ln);pts.push(onRim(t,rr+rf+.002,off*(1-k/30)))}
          const fg=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),14,rf,8,false),f%2?skinD:skin);hd.add(fg);
          const tip=new T.Mesh(new T.SphereGeometry(rf,8,6),skin);tip.position.copy(pts[pts.length-1]);hd.add(tip);
          const kn=new T.Mesh(new T.SphereGeometry(rf*1.15,8,6),skin);kn.position.copy(pts[2]);hd.add(kn)}
        // большой палец — по ободу к спице, со стороны водителя
        {const p0=onRim(1.2,rr+.02,-sg*.02*0),pts=[p0,onRim(1.5,rr+.011,sg*-.0+(-.025)*(sg>0?-1:1)*-1),onRim(1.7,rr+.01,(sg>0?-1:1)*-.0)];
          const dir=sg>0?-1:1;const fz=rr+.013,pp=[onRim(1.05,rr+.024,-.012),c.clone().addScaledVector(Z,fz).addScaledVector(u,-.018).addScaledVector(v,-.016),c.clone().addScaledVector(Z,fz-.002).addScaledVector(u,-.045).addScaledVector(v,-.012)];
          hd.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pp),10,.0115,8,false),skin));const tp=new T.Mesh(new T.SphereGeometry(.0115,8,6),nail);tp.position.copy(pp[2]);hd.add(tp)}
        // предплечье: запястье (кожа) -> часы (левая) -> манжета -> рукав; собирается вдоль +z, ставится в кадре
        const ar=new T.Group(),L1=.07;
        ar.add(new T.Mesh(new T.CylinderGeometry(.026,.028,L1,14).rotateX(Math.PI/2).translate(0,0,L1/2).scale(1.25,.85,1),skin));
        if(sg<0){ar.add(new T.Mesh(new T.CylinderGeometry(.0305,.0305,.02,20).rotateX(Math.PI/2).translate(0,0,.05).scale(1.25,.88,1),wst));
          const cs_=new T.Mesh(new T.CylinderGeometry(.019,.019,.009,24),wst);cs_.position.set(0,.028,.05);ar.add(cs_);const fc=new T.Mesh(new T.CircleGeometry(.016,24).rotateX(-Math.PI/2),wfc);fc.position.set(0,.0331,.05);ar.add(fc)}
        ar.add(new T.Mesh(new T.CylinderGeometry(.038,.036,.03,16).rotateX(Math.PI/2).translate(0,0,L1+.012).scale(1.2,.9,1),S({color:0xe6e6ea,roughness:.7})));
        ar.add(new T.Mesh(new T.CylinderGeometry(.06,.042,.75,16).rotateX(Math.PI/2).translate(0,0,L1+.022+.375).scale(1.15,.9,1),slv));
        cab.add(ar);w.arms.push(ar);ar.userData.wr=palm;w.elb.push(new T.Vector3(-.37+sg*.24,.5,.52))}
      // приборка и экран в центре
      [w.clCv,w.clTex]=scr(512,160,.34,.106,-.37,.83,-.412,-.237,0);[w.scCv,w.scTex]=scr(256,128,.26,.13,.06,.805,-.46,-.08,-.3);bx(.28,.15,.02,.063,.804,-.472,dkM).rotation.set(-.08,-.3,0,'YXZ');
      if(w.eye)w.body.remove(w.eye);w.eye=new T.Object3D();w.eye.position.set(-.37,1.08+CB.dy,.38);w.body.add(w.eye)};w.mkCab()}
  function emitS(x,y,z,vx,vy,vz,life){const p=w.sp[w.si];w.si=(w.si+1)%SMN;p.x=x;p.y=y;p.z=z;p.vx=vx;p.vy=vy;p.vz=vz;p.l=p.m=life}
  function skidAdd(i,x,z,rx,rz){const p=w.skP[i],y=hy(-z)+.03;if(p&&Math.hypot(x-p[0],z-p[2])<.3)return;
    if(p){const a=w.skA,o=w.skI*12,z0=w.skZ,hw=.13;w.skI=(w.skI+1)%SKN;
      a[o]=p[0]-p[3]*hw;a[o+1]=p[1];a[o+2]=p[2]-p[4]*hw-z0;a[o+3]=p[0]+p[3]*hw;a[o+4]=p[1];a[o+5]=p[2]+p[4]*hw-z0;
      a[o+6]=x-rx*hw;a[o+7]=y;a[o+8]=z-rz*hw-z0;a[o+9]=x+rx*hw;a[o+10]=y;a[o+11]=z+rz*hw-z0;w.skD=true}
    w.skP[i]=[x,y,z,rx,rz]}
  function emit(x,y,z,vx,vy,vz,life,r,gg,b,gr){const p=w.pp[w.pi];w.pi=(w.pi+1)%PN;p.x=x;p.y=y;p.z=z;p.vx=vx;p.vy=vy;p.vz=vz;p.l=p.m=life;p.r=r;p.g=gg;p.b=b;p.gr=gr||0}
  function sparks(x,y,z,n,sp){for(let i=0;i<n;i++)emit(x,y,z,(Math.random()-.5)*sp,Math.random()*sp*.5,(Math.random()-.5)*sp-st.vt*.3,.25+Math.random()*.45,1,.7+Math.random()*.3,.25,12)}
  function say(m,tm){st.msg=m;st.msgT=tm||1.6}
  function reset(){const s0=st?st.s:0,best=LS.get('best3_'+cfg.id,0);if(st)for(const c of st.cars)w.sc.remove(c.mesh);w.skA.fill(0);w.skD=true;w.skP=[null,null];
    const d0=LX[cfg.home],p=pt(s0,d0,0);
    st={s:s0,d:d0,x:p.x,z:p.z,psi:Math.atan(dcx(s0)),u:0,v:0,w:0,steer:0,gear:0,rpm:900,shiftT:0,ax:0,ay:0,roll:0,pitch:0,heave:0,surf:1,vt:0,kmh:0,nitro:.5,nitroOn:false,
      score:0,dist:0,passed:0,combo:0,comboT:0,near:0,hits:0,best,crashed:false,crashT:0,msg:'',msgT:0,shake:0,started:false,hintT:0,cars:[],next:s0+70,onT:3,camYaw:Math.atan(dcx(s0)),spin:0,fov:66,slip:0,brk:0,wall:null,onc:false,drift:0,hold:0,lsx:0,dPts:0,dT:0,dGrace:0,drifts:0,beta:0,look:0,wheelA:0,dmax:.5}}
  function spawn(s,lane,v,dirOverride){const [lx,dir]=cfg.lanes[lane];for(const c of st.cars)if(Math.abs(c.d-lx)<1.9&&Math.abs(c.s-s)<16)return;
    const k=cfg.pick(),ge=carGeo(k.kind),mesh=new T.Mesh(ge.geo,[w.paint(k.col),w.m.glass,w.m.dark,w.m.head,w.m.tail,w.m.aux,w.m.aux,w.m.plate]);mesh.castShadow=true;mesh.rotation.order='YXZ';w.sc.add(mesh);
    const cr=(cfg.cruise[0]+Math.random()*(cfg.cruise[1]-cfg.cruise[0]))*k.cr;
    st.cars.push({mesh,s,d:lx,tl:lane,dir,v:v===undefined?cr:v,cr,L:ge.L,W:ge.W,ty:ge.ty,mass:ge.mass,passed:false,hit:false,wreck:false,vd:0,yawOff:0,spinV:0,blink:0,lcT:3+Math.random()*9,brk:false})}
  function crash(c){const s=st;if(s.crashed)return;s.crashed=true;s.crashT=0;s.shake=1;s.w+=(Math.random()-.5)*5;s.combo=0;c.wreck=true;c.spinV=(Math.random()-.5)*4;
    if(s.score>s.best){s.best=Math.round(s.score);LS.set('best3_'+cfg.id,s.best)}}
  function phys(h,th,br,sx,hb){const s=st,L=C.a+C.b,sgn=s.u<0?-1:1,au=Math.abs(s.u),m0=dcx(-s.z),n0=Math.hypot(1,m0),ad=Math.abs((s.x-cx(-s.z))/n0);
    const surf=ad<HALF+.2?1:ad<HALF+1.7?.82:.6,mu=C.mu*surf;s.surf=surf;
    const dg=Math.min(C.steerMax,Math.atan(L*mu*G*1.5/Math.max(30,s.u*s.u))+.01),dk=Math.min(1,s.drift*1.3),dmax=dg+(Math.min(C.steerMax,C.driftLock)-dg)*dk;s.dmax=dmax;
    const csA=s.u>4?Math.atan2(s.v+C.a*s.w,s.u)*C.driftCs*dk:0,tgt=clamp(sx*dmax+csA,-C.steerMax,C.steerMax),rate=dmax/(sx===0||tgt*s.steer<0?.07:.12)+(Math.abs(s.steer)>dmax?3:0)+dk*3;
    s.steer+=clamp(tgt-s.steer,-rate*h,rate*h);
    const Nf=Math.max(800,C.m*G*C.b/L-C.m*s.ax*C.hcg/L),Nr=Math.max(800,C.m*G*C.a/L+C.m*s.ax*C.hcg/L),wr=au/C.rw*9.5493;
    let Fd=0,brk=0,drive=0;
    if(s.u>.4||(th&&s.u>-.3)){drive=th;brk=br;if(s.gear<0)s.gear=0;
      if(s.shiftT>0)s.shiftT-=h;else if(wr*C.gears[s.gear]*C.fd>C.red-250&&s.gear<C.gears.length-1){s.gear++;s.shiftT=.16}else if(s.gear>0&&wr*C.gears[s.gear-1]*C.fd<C.red*.6){s.gear--;s.shiftT=.08}
      const raw=wr*C.gears[s.gear]*C.fd,rpm=clamp(Math.max(raw,th?2600:900),900,C.red),xr=rpm/C.red;s.rpm+=(rpm-s.rpm)*Math.min(1,h*14);
      if(th&&s.shiftT<=0&&raw<C.red)Fd=C.Tmax*clamp(.55+1.5*xr-1.25*xr*xr,.2,1)*C.gears[s.gear]*C.fd*.9/C.rw*(s.nitroOn?1.55:1)}
    else if(br){s.gear=-1;if(s.u>-6)Fd=-C.m*2.6;s.rpm+=(1200+au*450-s.rpm)*Math.min(1,h*14)}
    else{brk=th;s.rpm+=(900-s.rpm)*Math.min(1,h*8)}
    const Fmax=mu*Nr*.97;if(Math.abs(Fd)>Fmax)Fd=Math.sign(Fd)*Fmax;
    if((brk||hb)&&au<.3&&!Fd){s.u=0}
    const mv=Math.abs(s.u)>.05?sgn:0,slope=dhy(-s.z)*Math.cos(s.psi-Math.atan(m0));
    const Fx=Fd-mv*brk*Math.min(C.brakeG*C.m,mu*C.m*G)-mv*(hb?.6*mu*Nr:0)-C.cd*s.u*au-mv*C.m*G*(.014+(1-surf)*.14)-(drive?0:mv*C.m*.45)-C.m*G*slope;
    const uu=Math.max(2,au),af=Math.atan2(s.v+C.a*s.w,uu)-s.steer,ar=Math.atan2(s.v-C.b*s.w,uu),gr=hb?.4:Math.sqrt(Math.max(.2,1-Math.pow(Fd/(mu*Nr),2)));
    const ml=mu*(1-C.driftSlip*dk),fyf=-ml*Nf*Math.tanh(C.Cf*af/(ml*Nf)),fyr=-ml*Nr*gr*Math.tanh(C.Cr*ar/(ml*Nr*gr)),cs=Math.cos(s.steer),sn=Math.sin(s.steer);
    let dw=(C.a*fyf*cs-C.b*fyr)/C.Iz;if(!hb&&!s.crashed)dw+=(clamp(s.u*Math.tan(s.steer)/L,-mu*G/uu,mu*G/uu)-s.w)*C.esp*(1-dk);
    if(dk>0&&!s.crashed&&au>6){const bt=Math.atan2(s.v,uu),tg=-sx*C.driftAng*(th?1:.45);dw+=(-(tg-bt)*C.driftKp-s.w*C.driftKd)*dk}
    s.ax+=(Fx/C.m-s.ax)*Math.min(1,h*10);s.ay+=((fyf*cs+fyr)/C.m-s.ay)*Math.min(1,h*10);s.slip=Math.abs(ar);s.brk=brk;{const kick=hb&&sx!==0&&au>11&&!s.crashed,on=au>7&&(kick||s.slip>(s.drift>.3?.1:.34));s.drift+=((on?1:0)-s.drift)*Math.min(1,h*(kick?14:on?7:2.2))}
    const du=Fx/C.m+s.v*s.w-fyf*sn/C.m,dv=(fyf*cs+fyr)/C.m-s.u*s.w;s.u+=du*h;s.v+=dv*h;s.w+=dw*h;
    if(s.u<6){const k=s.u<0?0:clamp((s.u-2)/4,0,1),f=Math.min(1,h*25)*(1-k);s.w+=(s.u*Math.tan(s.steer)/L-s.w)*f;s.v-=s.v*f}
    if(!Fd&&!drive&&Math.abs(s.u)<.12&&Math.abs(slope)<.05)s.u=0;
    let fx=Math.sin(s.psi),fz=-Math.cos(s.psi),rx=-fz,rz=fx;s.x+=(s.u*fx+s.v*rx)*h;s.z+=(s.u*fz+s.v*rz)*h;s.psi+=s.w*h;
    const m=dcx(-s.z),nn=Math.hypot(1,m),d=(s.x-cx(-s.z))/nn;
    if(Math.abs(d)>cfg.lim){const sg=Math.sign(d),nx=1/nn,nz=m/nn,pen=Math.abs(d)-cfg.lim;s.x-=sg*pen*nx;s.z-=sg*pen*nz;fx=Math.sin(s.psi);fz=-Math.cos(s.psi);rx=-fz;rz=fx;
      let vx=s.u*fx+s.v*rx,vz=s.u*fz+s.v*rz;const vn=(vx*nx+vz*nz)*sg;
      if(vn>0){vx-=(1+cfg.wallE)*vn*sg*nx;vz-=(1+cfg.wallE)*vn*sg*nz;const loss=Math.min(.5,vn*cfg.wallLoss);vx*=1-loss;vz*=1-loss;s.w*=.5;s.psi+=(Math.atan(m)-s.psi)*.25;if(!s.wall||vn>s.wall.vn)s.wall={vn,sg}}
      else if(!s.wall)s.wall={vn:0,sg};
      const k=1-Math.min(1,h*cfg.wallDrag);vx*=k;vz*=k;fx=Math.sin(s.psi);fz=-Math.cos(s.psi);rx=-fz;rz=fx;s.u=vx*fx+vz*fz;s.v=vx*rx+vz*rz}}
  function selCar(sel){const pd=PCARS[sel&&sel.i]||PCARS[0],ci=clamp((sel&&sel.c)|0,0,pd.cols.length-1);w.sel={i:PCARS.indexOf(pd),c:ci};w.pd=Object.assign({},pd,{hex:pd.cols[ci][1]});
    const pg=carGeo(pd.kind,true),wb=pg.ax[0]-pg.ax[1],k=pg.mass/cfg.car.m;C=Object.assign({},cfg.car,pd.ph,{m:pg.mass,a:wb*.48,b:wb*.52,Cf:cfg.car.Cf*k,Cr:cfg.car.Cr*k,rw:pg.wr});return pg}
  function applyCar(sel){const pg=selCar(sel);w.pg=pg;w.body.geometry=pg.geo;w.body.material[0]=w.ppaint();w.plth.color.setHex(w.pd.cab.seat);plateTex(PLATES[w.pd.id]||'',w.pplate.map);w.csh.scale.set(pg.W*1.3,1,pg.L*1.12);w.mkWh();w.mkCab();if(w.useMdl)w.useMdl()}
  function garToggle(){if(!w||!st)return;gar=!gar;for(const k in keys)keys[k]=false;
    if(gar){for(const c of st.cars)w.sc.remove(c.mesh);st.cars.length=0}else{w.garL.intensity=0;w.garR.intensity=0;w.garH.intensity=0;w.garF.intensity=0;LS.set('car_'+cfg.id,w.sel);reset();say(w.pd.name,1.8)}}
  function garKey(c,down,rep){if(c==='KeyG'){if(down&&!rep)garToggle();return true}if(!gar)return false;
    const m={ArrowLeft:-1,KeyA:-1,ArrowRight:1,KeyD:1}[c],n={ArrowUp:-1,KeyW:-1,ArrowDown:1,KeyS:1}[c];
    if(!m&&!n&&c!=='Enter'&&c!=='Space')return false;if(!down)return true;
    if(m)applyCar({i:(w.sel.i+m+PCARS.length)%PCARS.length,c:0});else if(n){const L_=w.pd.cols.length;if(L_>1)applyCar({i:w.sel.i,c:(w.sel.c+n+L_)%L_})}else if(c==='Enter'&&!rep)garToggle();return true}
  function garCam(t,wd,hh){const s=st,cam=w.cam,pg=w.pg,a=t*.3,R=(pg.L*.95+2.4)*(wd/hh<1?1.5:1),gy=groundY(s.s,s.d);
    w.body.visible=true;w.glow.visible=true;w.wh.forEach(([p,m])=>{p.visible=m.visible=true});
    cam.position.set(s.x+Math.sin(a)*R,gy+1.15+pg.H*.3,s.z+Math.cos(a)*R);cam.fov=fovFit(38,wd/hh);cam.aspect=wd/hh;cam.updateProjectionMatrix();cam.up.set(0,1,0);cam.lookAt(s.x,gy+pg.H*.42,s.z);
    w.garL.position.set(s.x+Math.sin(a+1.2)*3.5,gy+4.2,s.z+Math.cos(a+1.2)*3.5);w.garL.intensity=14;w.garR.position.set(s.x-Math.sin(a+1.2)*4,gy+2.2,s.z-Math.cos(a+1.2)*4);w.garR.intensity=11;w.garH.intensity=.9;w.garF.position.set(s.x+Math.sin(a)*2.2,gy+.55,s.z+Math.cos(a)*2.2);w.garF.intensity=3;w.sky.position.copy(cam.position)}
  function vig(wd,hh){if(!w.vg||w.vgW!==wd||w.vgH!==hh){w.vgW=wd;w.vgH=hh;const gr=g.createRadialGradient(wd/2,hh*.55,Math.min(wd,hh)*.38,wd/2,hh*.55,Math.hypot(wd,hh)*.62);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,8,16,.5)');w.vg=gr}g.fillStyle=w.vg;g.fillRect(0,0,wd,hh)}
  function garUI(wd,hh,t){const pd=w.pd,f='"Segoe UI",sans-serif',fs=clamp(Math.min(hh*.032,wd*.024),12,26),O='#ff7a1a',P=24+Math.max(SAFE.l,SAFE.r)*.8,P0=24+SAFE.t,hB=hh-SAFE.b-(TOUCH?TCI.gb:0);
    g.save();g.shadowBlur=0;g.textBaseline='middle';
    const gr=g.createLinearGradient(0,0,0,hh);gr.addColorStop(0,'rgba(0,0,0,.72)');gr.addColorStop(.24,'rgba(0,0,0,0)');gr.addColorStop(.52,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.9)');g.fillStyle=gr;g.fillRect(0,0,wd,hh);
    g.textAlign='left';g.font='italic 900 '+fs*1.25+'px '+f;g.fillStyle=O;g.fillText('ГАРАЖ',P,P0+fs*.6);const tw0=g.measureText('ГАРАЖ').width;
    g.font='italic 600 '+fs*.8+'px '+f;g.fillStyle='rgba(255,255,255,.65)';g.fillText('выбери машину и цвет',P+tw0+fs*.8,P0+fs*.64,Math.max(10,wd-2*P-tw0-fs));
    const tabs=PCARS.map(c=>c.tab);let tf=fs*.78;const mt=()=>{g.font='italic 800 '+tf+'px '+f;return tabs.map(q=>g.measureText(q).width+tf*1.8)};let tws=mt(),tot=tws.reduce((a,b)=>a+b,0)+(tabs.length-1)*6;
    if(tot>wd-2*P){tf*=(wd-2*P)/tot;tws=mt()}
    let tx=P;const ty=P0+fs*1.8,bh=tf*2.1;tabs.forEach((q,i)=>{const on=i===w.sel.i,bw=tws[i];g.fillStyle=on?O:'rgba(10,12,16,.72)';g.beginPath();g.moveTo(tx+tf*.5,ty);g.lineTo(tx+bw,ty);g.lineTo(tx+bw-tf*.5,ty+bh);g.lineTo(tx,ty+bh);g.closePath();g.fill();
      g.fillStyle=on?'#121212':'rgba(255,255,255,.82)';g.textAlign='center';g.fillText(q,tx+bw/2,ty+bh/2,bw-tf*.8);tx+=bw+6});
    const sbw=Math.min(fs*13,wd*.34),nmW=Math.max(fs*8,wd-2*P-sbw-fs*2),yN=hB-fs*7.4;
    g.textAlign='left';g.fillStyle='#fff';g.font='italic 900 '+fs*(TOUCH?1.5:2.05)+'px '+f;g.fillText(pd.name.toUpperCase(),P,yN,TOUCH?Math.min(nmW,wd*.42):nmW);
    g.font='italic 600 '+fs*.95+'px '+f;g.fillStyle='rgba(255,255,255,.7)';g.fillText(pd.sub,P,yN+fs*1.7,nmW);
    const yC=hB-fs*4.3,sw=fs*2.6,sh=fs*1.3;pd.cols.forEach((c,i)=>{const x=P+i*(sw+10),on=i===w.sel.c;g.fillStyle='#'+c[1].toString(16).padStart(6,'0');g.beginPath();g.moveTo(x+sh*.35,yC);g.lineTo(x+sw,yC);g.lineTo(x+sw-sh*.35,yC+sh);g.lineTo(x,yC+sh);g.closePath();g.fill();g.lineWidth=on?3:1;g.strokeStyle=on?O:'rgba(255,255,255,.4)';g.stroke()});
    const cx0=P+pd.cols.length*(sw+10)+fs*.4;g.font='italic 700 '+fs*.9+'px '+f;g.fillStyle='#fff';g.fillText(pd.cols[w.sel.c][0]+(pd.cols.length<2?' · один цвет':''),cx0,yC+sh/2,Math.max(30,P+nmW-cx0));
    const bx0=wd-P-sbw;['СКОРОСТЬ','РАЗГОН','УПРАВЛЕНИЕ'].forEach((l,i)=>{const y=hB-fs*7.6+i*fs*1.9;g.textAlign='left';g.font='italic 700 '+fs*.78+'px '+f;g.fillStyle='rgba(255,255,255,.82)';g.fillText(l,bx0,y);
      g.fillStyle='rgba(255,255,255,.16)';g.fillRect(bx0,y+fs*.55,sbw,fs*.42);g.fillStyle=O;g.fillRect(bx0,y+fs*.55,sbw*pd.st[i]/10,fs*.42)});
    const hint=TOUCH?'свайп ← →  машина     ↑ ↓  цвет':'← →  машина     ↑ ↓  цвет     Enter или G — поехать';g.font='600 '+fs*.8+'px '+f;const hw=Math.min(wd-2*P,g.measureText(hint).width+fs*2),hy_=hB-fs*1.5;
    if(!TOUCH){g.fillStyle='rgba(0,0,0,.62)';g.fillRect(wd/2-hw/2,hy_-fs*.75,hw,fs*1.5);g.fillStyle='#fff';g.textAlign='center';g.fillText(hint,wd/2,hy_,hw-fs);}
    g.restore();g.textAlign='start';g.textBaseline='alphabetic'}
  function dials(x,s){const F='"Segoe UI",Arial,sans-serif',sty=w.pd.cab.cl,nd=sty==='merc'?'#ff8a2a':sty==='audi'?'#ff3b2e':'#ff5a1a';x.fillStyle='#020203';x.fillRect(0,0,512,160);
    const gear=s.gear<0?'R':s.kmh<1&&!keys.u?'N':String(s.gear+1),kmh=String(Math.round(s.kmh)),rpm=s.rpm/1000,rd=C.red/1000;
    const dial=(cx,r,v,mx,step,red,lab)=>{x.save();x.translate(cx,80);const gr=x.createRadialGradient(0,0,r*.2,0,0,r);gr.addColorStop(0,'#16181d');gr.addColorStop(1,'#07080a');x.fillStyle=gr;x.beginPath();x.arc(0,0,r,0,7);x.fill();
      x.strokeStyle=sty==='vette'?'#454b55':'#a3a9b3';x.lineWidth=3;x.stroke();const a0=Math.PI*.75,a1=Math.PI*2.25;x.textAlign='center';x.textBaseline='middle';
      for(let k=0;k<=Math.round(mx/step*2);k++){const i=k*step/2,a=a0+(a1-a0)*i/mx,mj=k%2===0,rr_=red&&i>=red;x.strokeStyle=rr_?'#ff3b30':'#ececec';x.lineWidth=mj?3:1.4;const r1=r*.9,r2=r*(mj?.76:.83);
        x.beginPath();x.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);x.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);x.stroke();if(mj&&r>44){x.fillStyle=rr_?'#ff3b30':'#ececec';x.font='600 '+Math.round(r*.16)+'px '+F;x.fillText(String(i),Math.cos(a)*r*.6,Math.sin(a)*r*.6)}}
      const a=a0+(a1-a0)*clamp(v/mx,0,1);x.strokeStyle=nd;x.lineWidth=Math.max(2.5,r*.05);x.lineCap='round';x.beginPath();x.moveTo(-Math.cos(a)*r*.14,-Math.sin(a)*r*.14);x.lineTo(Math.cos(a)*r*.84,Math.sin(a)*r*.84);x.stroke();
      x.fillStyle='#2a2c31';x.beginPath();x.arc(0,0,r*.11,0,7);x.fill();if(lab){x.fillStyle='#fff';x.font='700 '+Math.round(r*.22)+'px '+F;x.fillText(lab,0,r*.52)}x.restore()};
    const box=(bx_,bw_,big,small)=>{x.fillStyle='#0a0d14';x.fillRect(bx_,26,bw_,108);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.font='700 40px '+F;x.fillText(big,bx_+bw_/2,68);x.font='500 16px '+F;x.fillStyle='#9aa3ad';x.fillText(small,bx_+bw_/2,108)};
    if(sty==='merc'){dial(108,54,rpm,7,1,rd,gear);dial(256,76,s.kmh,260,40,0,kmh);dial(404,42,.72,1,.5,0,'')}
    else if(sty==='vette'){dial(150,74,s.kmh,320,40,0,kmh);dial(362,74,rpm,8,1,rd,gear)}
    else if(sty==='audi'){dial(130,72,rpm,8,1,rd,'');dial(382,72,s.kmh,260,40,0,'');box(214,84,kmh,'км/ч · '+gear)}
    else{dial(256,76,rpm,8,1,rd,gear);dial(112,58,s.kmh,320,80,0,'');box(352,140,kmh,'км/ч')}}
  function step(dt,t){const s=st,pg=w.pg;let th=keys.u?1:0,br=keys.d?1:0,sx=(keys.r?1:0)-(keys.l?1:0),hb=keys.h?1:0;
    if(s.crashed){th=0;br=1;sx=0;hb=1;s.crashT+=dt}
    if(th||br)s.started=true;s.hold=sx&&sx===s.lsx?s.hold+dt:0;s.lsx=sx;
    s.nitroOn=!!keys.n&&s.nitro>0&&!!th&&!s.crashed&&s.u>5;s.nitro=s.nitroOn?Math.max(0,s.nitro-dt/4.5):Math.min(1,s.nitro+dt/70);
    s.wall=null;const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;for(let i=0;i<n;i++)phys(h,th,br,sx,hb);
    const upd=()=>{s.s=-s.z;const m=dcx(s.s),nn=Math.hypot(1,m);s.d=(s.x-cx(s.s))/nn;const fx=Math.sin(s.psi),fz=-Math.cos(s.psi);s.vt=((s.u*fx-s.v*fz)*m-(s.u*fz+s.v*fx))/nn;s.kmh=Math.hypot(s.u,s.v)*3.6};upd();
    const gy=groundY(s.s,s.d);
    if(s.wall){const sg=s.wall.sg,m=dcx(s.s),nn=Math.hypot(1,m),ex=s.x+sg*pg.W/2/nn,ez=s.z+sg*pg.W/2*m/nn;
      if(cfg.night){if(s.kmh>15)sparks(ex,gy+.5,ez,s.wall.vn>1?14:2,5+s.wall.vn)}else if(s.kmh>10)for(let i=0;i<3;i++)emit(ex,gy+.3,ez,(Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3,.8,.5,.42,.3,-1);
      if(s.wall.vn>1.2){s.shake=Math.min(1,s.shake+s.wall.vn*.09);s.combo=0;s.dPts=0;s.dT=0;s.hits++;if(cfg.night)say('Отбойник!',1)}}
    // поток
    const cars=s.cars;
    while(s.next<s.s+KN*SEG-60){const fw=cfg.lanes.map((l,i)=>i).filter(i=>cfg.lanes[i][1]>0);spawn(s.next,fw[(Math.random()*fw.length)|0]);s.next+=cfg.gap[0]+Math.random()*cfg.gap[1]}
    if(s.next<s.s+150)s.next=s.s+150;
    if(cfg.oncoming){s.onT-=dt;if(s.onT<0){s.onT=1.6+Math.random()*4.5;const on=cfg.lanes.map((l,i)=>i).filter(i=>cfg.lanes[i][1]<0);spawn(s.s+KN*SEG-70,on[(Math.random()*on.length)|0])}}
    for(let i=cars.length-1;i>=0;i--){const c=cars[i];
      if(c.wreck){c.v*=Math.exp(-dt*1.3);c.yawOff+=c.spinV*dt;c.spinV*=Math.exp(-dt*1.4)}
      else{let gap=1e9,lv=0;for(const o of cars){if(o===c||o.dir!==c.dir||Math.abs(o.d-c.d)>1.9)continue;const gp=(o.s-c.s)*c.dir-(o.L+c.L)/2;if(gp>0&&gp<gap){gap=gp;lv=o.v}}
        if(Math.abs(s.d-c.d)<1.9){const gp=(s.s-c.s)*c.dir-(pg.L+c.L)/2;if(gp>0&&gp<gap){gap=gp;lv=c.dir>0?Math.max(0,s.vt):0}}
        let vt=c.cr;if(gap<70)vt=Math.min(vt,lv+(gap-5-c.v*.5)*.7);vt=Math.max(0,vt);const dv=clamp(vt-c.v,-8.5*dt,2.2*dt);c.brk=dv<-2.5*dt;c.v+=dv;
        if(cfg.lanes.length>2){c.lcT-=dt;if(c.lcT<0&&c.blink<=0&&Math.abs(c.d-LX[c.tl])<.05){c.lcT=4+Math.random()*10;const tl=c.tl+(Math.random()<.5?-1:1);
            if(tl>=0&&tl<LX.length&&cfg.lanes[tl][1]===c.dir){let free=Math.abs(s.d-LX[tl])>1.9||Math.abs(s.s-c.s)>45;for(const o of cars)if(o!==c&&Math.abs(o.d-LX[tl])<1.9&&o.s-c.s>-18&&o.s-c.s<34)free=false;if(free){c.tl=tl;c.blink=1.1}}}
          if(c.blink>0)c.blink-=dt;else c.d+=clamp(LX[c.tl]-c.d,-1.5*dt,1.5*dt)}}
      c.s+=c.v*c.dir*dt;c.d=clamp(c.d+c.vd*dt,-HALF+1,HALF-1);c.vd*=Math.exp(-dt*2.5);
      const ds=c.s-s.s;
      if(ds<-170||ds>KN*SEG+120){w.sc.remove(c.mesh);cars.splice(i,1);continue}
      // столкновение
      const dd=c.d-s.d,hx=(c.L+pg.L)/2,hw=(c.W+pg.W)/2-.06;
      if(Math.abs(ds)<hx&&Math.abs(dd)<hw){const px=hx-Math.abs(ds),pw=hw-Math.abs(dd),m=dcx(s.s),nn=Math.hypot(1,m),tx=m/nn,tz=-1/nn,nx=1/nn,nz=m/nn,fx=Math.sin(s.psi),fz=-Math.cos(s.psi),rx=-fz,rz=fx;
        let vx=s.u*fx+s.v*rx,vz=s.u*fz+s.v*rz;const gy2=gy+.6;
        if(pw<px*.5&&pw<.9){const sg=Math.sign(dd)||1,vn=(vx*nx+vz*nz)*sg;s.x-=sg*pw*nx;s.z-=sg*pw*nz;if(vn>0){vx-=1.4*vn*sg*nx;vz-=1.4*vn*sg*nz}vx*=.985;vz*=.985;c.vd+=sg*(1.2+Math.max(0,vn)*.5);
          sparks(s.x+sg*pg.W/2*nx,gy2,s.z+sg*pg.W/2*nz,10,6);s.shake=Math.min(1,s.shake+.3);if(c.dir<0&&!c.hit)crash(c);else if(!c.hit)say('Притёрся!',1)}
        else{const sg=Math.sign(ds)||1,vt=vx*tx+vz*tz,cv=c.v*c.dir,rel=(vt-cv)*sg;s.x-=sg*px*tx;s.z-=sg*px*tz;
          if(rel>0){const M=c.mass,mp=C.m,np=(mp*vt+M*cv-M*.2*(vt-cv))/(mp+M),nc=(mp*vt+M*cv+mp*.2*(vt-cv))/(mp+M);vx+=(np-vt)*tx;vz+=(np-vt)*tz;c.v=nc*c.dir;
            sparks(s.x+sg*pg.L/2*tx,gy2,s.z+sg*pg.L/2*tz,Math.min(40,6+rel*2),5+rel*.5);s.shake=Math.min(1,s.shake+.25+rel*.04);if(rel>cfg.crashV)crash(c);else if(!c.hit)say('Бум!',1)}}
        s.u=vx*fx+vz*fz;s.v=vx*rx+vz*rz;s.combo=0;s.dPts=0;s.dT=0;if(!c.hit){c.hit=true;s.hits++}upd()}
      // обгон и «впритирку»
      if(!c.passed&&!c.hit&&(c.dir>0?s.s>c.s+c.L/2:c.s<s.s-c.L/2)){c.passed=true;const gp=Math.abs(c.d-s.d)-(c.W+pg.W)/2,rel=s.vt-c.v*c.dir;if(c.dir>0)s.passed++;
        if(gp<(c.dir>0?1.1:1.4)&&rel>7&&!s.crashed){s.combo++;s.comboT=5;s.near++;const b=Math.round(40*s.combo*(1+rel/20)*(c.dir<0?2:1)/10)*10;s.score+=b;s.nitro=Math.min(1,s.nitro+.15);say((c.dir<0?'Встречка впритирку! +':'Впритирку! +')+b,1.4)}}}
    // дрифт: очки копятся, пока машину несёт боком, и зачисляются, когда выровнялся
    const beta=s.u>3?Math.atan2(s.v,s.u):0;s.beta=beta;
    if(Math.abs(beta)>.16&&s.kmh>45&&!s.crashed&&!s.wall){s.dT+=dt;s.dPts+=dt*s.kmh*Math.min(.9,Math.abs(beta))*1.6*(1+s.combo*.25);s.dGrace=.7}
    else if(s.dPts>0){s.dGrace-=dt;if(s.dGrace<=0){if(s.dT>.6&&!s.crashed){const b=Math.max(10,Math.round(s.dPts/10)*10);s.score+=b;s.drifts++;s.nitro=Math.min(1,s.nitro+Math.min(.4,b/2000));say('Дрифт! +'+b,1.6)}s.dPts=0;s.dT=0}}
    // очки
    s.dist+=Math.max(0,s.vt)*dt;s.onc=!!cfg.oncoming&&s.d<-.5&&Math.abs(s.d)<HALF;
    if(!s.crashed&&s.vt>cfg.fastV)s.score+=dt*s.vt*.5*(1+s.combo*.25)*(s.onc?2:1);
    if(s.combo>0){s.comboT-=dt;if(s.comboT<=0)s.combo=0}
    if(s.score>s.best)s.best=Math.round(s.score);
    s.msgT=Math.max(0,s.msgT-dt);s.shake=Math.max(0,s.shake-dt*1.8);if(s.started&&s.kmh>20)s.hintT+=dt;
    // частицы от машины
    const fx=Math.sin(s.psi),fz=-Math.cos(s.psi),rx=-fz,rz=fx,bx=s.x-fx*pg.L*.5,bz=s.z-fz*pg.L*.5;
    if(s.nitroOn)for(const sg of[-1,1])emit(bx+rx*sg*.45,gy+.38,bz+rz*sg*.45,-fx*6+(Math.random()-.5),Math.random()*.6,-fz*6+(Math.random()-.5),.22,.35,.65,1,0);
    if((s.slip>.13||(keys.h&&!s.crashed))&&s.kmh>25&&s.surf===1){const ra=-pg.ax[1],hw=pg.W/2-.12;for(const sg of[-1,1]){const wx=s.x-fx*ra+rx*sg*hw,wz=s.z-fz*ra+rz*sg*hw;
        for(let q=0;q<2;q++)if(Math.random()<.5+Math.min(.45,s.slip))emitS(wx+(Math.random()-.5)*.9,gy+.25+Math.random()*.3,wz+(Math.random()-.5)*.9,(Math.random()-.5)*3+fx*s.u*.25,.6+Math.random()*1.6,(Math.random()-.5)*3+fz*s.u*.25,1.4+Math.random()*1.4);skidAdd(sg<0?0:1,wx,wz,rx,rz)}}
    else w.skP[0]=w.skP[1]=null;
    if(s.surf<1&&s.kmh>12&&Math.random()<.8)emit(bx+(Math.random()-.5)*1.6,gy+.2,bz,(Math.random()-.5)*2,.8+Math.random()*1.5,(Math.random()-.5)*2,.9,.42,.36,.26,-1)}
  function sync(t,dt,wd,hh){const s=st,pg=w.pg,sS=s.s,gy=groundY(sS,s.d),m=dcx(sS),psiR=Math.atan(m);
    const base=Math.floor(sS/SEG);if(base!==w.base){w.base=base;w.root.position.z=-base*SEG;w.strips.forEach(q=>q.userData.up(base));cfg.populate(w,base,(a,b)=>pt(a,b,base*SEG),groundY)}
    cfg.tick(w,s,(a,b)=>pt(a,b,0),groundY);
    w.car.position.set(s.x,gy,s.z);w.car.rotation.set(Math.atan(dhy(sS))*Math.cos(s.psi-psiR),-s.psi,0);
    s.roll+=(clamp(s.ay*C.rollK,-.1,.1)-s.roll)*Math.min(1,dt*7);s.pitch+=(clamp(s.ax*C.pitchK,-.06,.06)-s.pitch)*Math.min(1,dt*7);
    s.heave=s.surf<1?Math.sin(t*37)*.025*Math.min(1,s.kmh/40):Math.sin(t*23)*.004*Math.min(1,s.kmh/120);
    w.body.rotation.set(s.pitch,0,s.roll);w.body.position.y=s.heave;s.spin+=s.u/C.rw*dt;
    w.wh.forEach(([piv,ms],i)=>{piv.rotation.y=i<2?-s.steer*1.6:0;ms.rotation.x=-s.spin});
    w.ptail.emissiveIntensity=s.brk?3.2:cfg.night?1.3:.2;if(w.fxUpd)w.fxUpd(s,dt,!!cfg.night);
    w.glow.material.color.set(col(.6+A.beat*.3));w.glow.material.opacity=Math.min(.7,.2+A.beat*.35+A.bass*.15);w.glow.visible=camMode!==1;
    s.wheelA+=(clamp(s.steer/Math.max(.02,s.dmax),-1.3,1.3)*.72-s.wheelA)*Math.min(1,dt*12);w.sw.rotation.z=-s.wheelA;
    let shi=0;setI(w.shad,shi++,s.x,gy+.03,s.z,-s.psi,pg.W*1.55,1,pg.L*1.25,0);for(const c of s.cars){const p=pt(c.s,c.d,0);c.mesh.position.set(p.x,p.y,p.z);c.mesh.rotation.set(p.pitch*c.dir,p.yaw+(c.dir<0?Math.PI:0)-c.yawOff,0);if(shi<48)setI(w.shad,shi++,p.x,p.y+.03,p.z,p.yaw-c.yawOff,c.W*1.5,1,c.L*1.25,p.pitch)}
    w.shad.count=shi;w.shad.instanceMatrix.needsUpdate=true;
    if(Math.abs(s.z-w.skZ)>3000){const dz=w.skZ-s.z,a=w.skA;for(let i=2;i<a.length;i+=3)a[i]+=dz;w.skZ=s.z;w.sk.position.z=s.z;w.skD=true}
    if(w.skD){w.skD=false;w.sk.geometry.attributes.position.needsUpdate=true}
    // огни
    const lp=w.lightP.geometry.attributes.position,lc=w.lightP.geometry.attributes.color;let n=0;const add=(x,y,z,r,gg,b)=>{if(n<LPN){lp.setXYZ(n,x,y,z-s.z);lc.setXYZ(n,r,gg,b);n++}};
    for(const c of s.cars){const ds=c.s-sS;if(ds<-25||ds>640)continue;const mm=dcx(c.s),nn=Math.hypot(1,mm),tx=mm/nn,tz=-1/nn,rx=1/nn,rz=mm/nn,p=c.mesh.position,hl=c.L/2+.08,hw=c.W/2-.3;
      if(c.dir>0){if(cfg.night||c.brk){const k=c.brk?1:.5;for(const sg of[-1,1])add(p.x-tx*hl+sg*rx*hw,p.y+c.ty,p.z-tz*hl+sg*rz*hw,k,.06*k,.03*k)}
        if(c.blink>0&&Math.sin(t*20)>0){const sg=Math.sign(LX[c.tl]-c.d)||1;add(p.x-tx*hl+sg*rx*(hw+.2),p.y+c.ty,p.z-tz*hl+sg*rz*(hw+.2),1,.5,0)}}
      else for(const sg of[-1,1])add(p.x-tx*hl+sg*rx*hw,p.y+c.ty*.9,p.z-tz*hl+sg*rz*hw,1,.92,.72)}
    {const fx=Math.sin(s.psi),fz=-Math.cos(s.psi),k=s.brk?1:cfg.night?.45:0;if(k)for(const sg of[-1,1])add(s.x-fx*(pg.L/2+.06)-fz*sg*(pg.W/2-.3),gy+pg.ty,s.z-fz*(pg.L/2+.06)+fx*sg*(pg.W/2-.3),k,.06*k,.03*k)}
    lp.needsUpdate=lc.needsUpdate=true;w.lightP.geometry.setDrawRange(0,n);w.dyn.position.set(0,0,s.z);
    const pp=w.parts.geometry.attributes.position,pc=w.parts.geometry.attributes.color;
    for(let i=0;i<PN;i++){const p=w.pp[i];if(p.l>0){p.l-=dt;p.vy-=p.gr*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const k=Math.max(0,p.l/p.m);pp.setXYZ(i,p.x,p.y,p.z-s.z);pc.setXYZ(i,p.r*k,p.g*k,p.b*k)}else pc.setXYZ(i,0,0,0)}
    pp.needsUpdate=pc.needsUpdate=true;
    {const sp_=w.smoke.geometry.attributes.position,sc_=w.smoke.geometry.attributes.color,dr=Math.exp(-dt*1.6);
      for(let i=0;i<SMN;i++){const p=w.sp[i];if(p.l>0){p.l-=dt;p.vx*=dr;p.vz*=dr;p.vy*=dr;p.x+=p.vx*dt;p.y+=p.vy*dt+dt*.5;p.z+=p.vz*dt;const k=Math.max(0,p.l/p.m),a=1.15*Math.min(1,k*1.6)*Math.min(1,(1-k)*8);sp_.setXYZ(i,p.x,p.y,p.z-s.z);sc_.setXYZ(i,a,.9+(1-k)*3.2,i*1.7)}else sc_.setXYZ(i,0,0,0)}
      sp_.needsUpdate=sc_.needsUpdate=true}
    // камера
    const cam=w.cam,sp=Math.hypot(s.u,s.v),k=Math.min(1,sp/cfg.vtop),beta=s.u>3?Math.atan2(s.v,s.u):0;s.camYaw+=(s.psi+beta*.5-s.camYaw)*(1-Math.exp(-dt*4.5));const inM=camMode===1&&!!w.mdl;w.body.visible=camMode!==1||inM;for(const p of w.wh)p[0].visible=camMode!==1;if(w.cabHide)w.cabHide(inM);cam.near=camMode===1?.04:.3;
    const cy=s.camYaw,cfx=Math.sin(cy),cfz=-Math.cos(cy),pfx=Math.sin(s.psi),pfz=-Math.cos(s.psi);
    if(camMode===1){const F='"Segoe UI",Arial,sans-serif',rp=clamp(s.rpm/C.red,0,1);let x=w.clCv.getContext('2d');if(w.pd.cab.cl!=='dig')dials(x,s);else{x.fillStyle='#05070b';x.fillRect(0,0,512,160);x.textBaseline='middle';
      for(let i=0;i<24;i++){x.fillStyle=i/24<rp?(i>=21?'#ff5548':col(.45+i/24*.5)):'rgba(255,255,255,.13)';x.fillRect(16+i*20,12,17,16)}
      x.textAlign='center';x.fillStyle='#fff';x.font='700 92px '+F;x.fillText(String(Math.round(s.kmh)),256,92);x.font='400 20px '+F;x.fillStyle='#9aa3ad';x.fillText('км/ч',256,146);
      x.strokeStyle=col(.85);x.lineWidth=4;x.beginPath();x.arc(440,96,36,0,7);x.stroke();x.font='700 46px '+F;x.fillStyle=col(.85);x.fillText(s.gear<0?'R':s.kmh<1&&!keys.u?'N':String(s.gear+1),440,99);
      x.textAlign='left';x.font='400 18px '+F;x.fillStyle='#9aa3ad';x.fillText('нитро',24,78);x.fillStyle='rgba(255,255,255,.16)';x.fillRect(24,96,120,12);x.fillStyle=s.nitroOn?'#9fe6ff':'#39c6ff';x.fillRect(24,96,120*s.nitro,12)}w.clTex.needsUpdate=true;
      x=w.scCv.getContext('2d');x.fillStyle='#070a10';x.fillRect(0,0,256,128);const tr=tracks[cur];x.textBaseline='middle';x.textAlign='left';x.fillStyle='#fff';x.font='700 18px '+F;x.fillText(cap?cap.name:tr?tr.title:'Вертушка',12,20,232);
      for(let i=0;i<24;i++){const v=A.bands[4+((i*2.4)|0)];x.fillStyle=col(.25+i/24*.75);x.fillRect(12+i*9.7,120-v*82,7.5,v*82+2)}w.scTex.needsUpdate=true;
      w.ambM.color.set(col(.5+A.note*.45)).multiplyScalar(.45+.55*Math.max(A.beat,A.mel*.7));w.cabL.color.set(col(.7));w.cabL.intensity=.55+A.beat*.7+A.mel*.3;
      {const E=inM&&w.eyeO?w.eyeO:[-.37,1.08+w.pd.cab.dy,.38];w.eye.position.set(E[0]+clamp(-s.ay*.002,-.03,.03),E[1],E[2]+clamp(s.ax*.002,-.03,.04))}
      w.car.updateMatrixWorld(true);cam.position.setFromMatrixPosition(w.eye.matrixWorld);w.eye.getWorldQuaternion(cam.quaternion);s.look+=(clamp(beta*.75,-.7,.7)-s.look)*Math.min(1,dt*5);cam.rotateY(-s.look-.12);cam.rotateX(-.05-(inM&&w.eyeP||0));
      if(!(w.hmUpd&&w.hmUpd()))for(let i=0;i<2;i++){const ar=w.arms[i];ar.userData.wr.getWorldPosition(V2);w.cab.worldToLocal(V2);V2.z+=.03;V2.y-=.02;ar.position.copy(V2);V1.copy(w.elb[i]);ar.lookAt(w.cab.localToWorld(V1))}}
    else if(camMode===2){const hd=(w.mdl&&w.hoodO)||w.pd.hood;cam.position.set(s.x+pfx*hd[0],gy+hd[1]+s.heave,s.z+pfz*hd[0]);V1.set(s.x+pfx*30,hy(sS+30)+1,s.z+pfz*30)}
    else{const dist=(camMode===3?11:6.4)+k*1.4+(pg.L-4.5),hgt=(camMode===3?4.8:2.25)+(pg.H-1.2)*.75,czx=s.x-cfx*dist,czz=s.z-cfz*dist;
      cam.position.set(czx,Math.max(gy,hy(-czz))+hgt,czz);V1.set(s.x+cfx*7,gy+pg.H*.6+.4,s.z+cfz*7)}
    const sh=s.shake*.35+(k*k*.02+(s.surf<1?.05*k:0))*(s.nitroOn?.5:1)+(s.nitroOn?.012:0);cam.position.x+=(Math.random()-.5)*sh;cam.position.y+=(Math.random()-.5)*sh;
    s.fov+=((camMode===1?55+k*6+(s.nitroOn?4:0):62+k*17+(s.nitroOn?8:0))-s.fov)*Math.min(1,dt*4);cam.fov=fovFit(s.fov,wd/hh);cam.aspect=wd/hh;cam.updateProjectionMatrix();if(camMode!==1)cam.lookAt(V1);const rz=clamp(-s.ay*.0035,-.05,.05)*(camMode===1?.4:1);cam.rotateZ(rz);
    if(camMode===1){const c=w.cabCam;c.position.copy(w.eye.position);c.quaternion.identity();c.rotateY(-s.look-.12);c.rotateX(-.05-(w.mdl&&w.eyeP||0));c.rotateZ(rz);c.fov=cam.fov;c.aspect=cam.aspect;c.updateProjectionMatrix()}
    w.sky.position.copy(cam.position);w.dl.position.copy(w.car.position).addScaledVector(w.sunDir,170);w.dl.target.position.copy(w.car.position);
    if(w.spot){w.spot.position.set(s.x+pfx*1.6,gy+.85,s.z+pfz*1.6);w.spot.target.position.set(s.x+pfx*42,hy(sS+42)+.2,s.z+pfz*42)}}
  function loadUI(wd,hh,t){const L=w.ld,f='"Segoe UI",sans-serif';if(!L.sp)L.sp=0;L.sp+=(L.p-L.sp)*.12;const p=L.sp;
    g.fillStyle='#07080c';g.fillRect(0,0,wd,hh);const gr=g.createRadialGradient(wd/2,hh*.62,0,wd/2,hh*.62,wd*.6);gr.addColorStop(0,'rgba(255,122,26,.13)');gr.addColorStop(1,'rgba(255,122,26,0)');g.fillStyle=gr;g.fillRect(0,0,wd,hh);
    // полосы дороги, бегущие вниз
    g.save();g.strokeStyle='rgba(255,255,255,.07)';g.lineWidth=2;for(let i=0;i<14;i++){const y=hh*.55+((i*40+t*260)%(hh*.5));const k=(y-hh*.55)/(hh*.45);g.beginPath();g.moveTo(wd/2-k*wd*.05,y);g.lineTo(wd/2-k*wd*.05,y+12*k);g.moveTo(wd/2+k*wd*.05,y);g.lineTo(wd/2+k*wd*.05,y+12*k);g.stroke()}g.restore();
    const fs=clamp(Math.min(hh*.05,wd*.04),18,40),bw=Math.min(wd*.6,560),bh=Math.max(8,fs*.32),bx=(wd-bw)/2,by=hh*.55;
    g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.font='italic 900 '+fs+'px '+f;g.fillText('НОЧНОЕ ШОССЕ',wd/2,by-fs*1.6);
    g.save();g.translate(bx,by);g.transform(1,0,-.25,1,0,0);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(0,0,bw,bh);
    const lg=g.createLinearGradient(0,0,bw,0);lg.addColorStop(0,'#ff5a00');lg.addColorStop(1,'#ffb347');g.fillStyle=lg;g.fillRect(0,0,bw*p,bh);
    g.fillStyle='rgba(255,255,255,.55)';g.fillRect(Math.max(0,bw*p-3),0,3,bh);g.restore();
    g.font='600 '+(fs*.42)+'px '+f;g.fillStyle='rgba(255,255,255,.75)';g.textAlign='left';g.fillText(L.msg,bx,by+bh+fs*.6);g.textAlign='right';g.fillStyle='#ff9a3c';g.fillText(Math.round(p*100)+'%',bx+bw,by+bh+fs*.6);
    g.textAlign='center';g.fillStyle='rgba(255,255,255,.62)';g.font=(fs*.36)+'px '+f;g.fillText((TOUCH?'Загружаем машину и город':'Загружаем все машины и город, чтобы в игре ничего не подгружалось'),wd/2,by+bh+fs*1.5);
    g.textAlign='start';g.textBaseline='alphabetic'}
  function hud(wd,hh,t){vig(wd,hh);const s=st,f='"Segoe UI",sans-serif',fs=clamp(Math.min(hh*.027,wd*.021),12,22),pl=(x,y,a,b)=>{g.fillStyle='rgba(6,8,12,.66)';rr(x,y,a,b,4);g.fill();g.fillStyle='#ff7a1a';g.fillRect(x,y+4,3,Math.max(0,b-8))};
    g.textBaseline='middle';g.shadowBlur=0;
    const rows=[['Очки',Math.round(s.score).toLocaleString('ru-RU')],['Рекорд',Math.round(s.best).toLocaleString('ru-RU')],['Обогнал',String(s.passed)],['Путь',(s.dist/1000).toFixed(1)+' км']];
    const pw=fs*12.5,lh=fs*1.55,ph=lh*rows.length+fs*.7,px=wd-pw-10-SAFE.r,py=(TOUCH&&hh>wd?Math.max(10+SAFE.t,TCI.top):10+SAFE.t);pl(px,py,pw,ph);
    rows.forEach((r,i)=>{const y=py+fs*.35+lh*(i+.5);g.textAlign='left';g.font='400 '+fs+'px '+f;g.fillStyle='#c5cbd3';g.fillText(r[0],px+fs*.8,y);g.textAlign='right';g.font='700 '+fs+'px '+f;g.fillStyle='#fff';g.fillText(r[1],px+pw-fs*.8,y)});
    let ey=py+ph+8;const tag=(txt,c)=>{g.font='700 '+fs+'px '+f;const tw=g.measureText(txt).width+fs*1.6;pl(wd-tw-10-SAFE.r,ey,tw,lh*1.1);g.textAlign='center';g.fillStyle=c;g.fillText(txt,wd-10-SAFE.r-tw/2,ey+lh*.55);ey+=lh*1.1+8};
    if(s.dPts>0&&s.dT>.25&&!s.crashed)tag('Дрифт '+Math.round(s.dPts)+' · '+Math.round(Math.abs(s.beta)*57.3)+'°','#ff9d3c');if(s.combo>1)tag('Серия ×'+s.combo,col(.85));if(s.onc&&s.vt>cfg.fastV&&!s.crashed)tag('Встречка ×2','#ffd34d');
    const ha=s.crashed?0:clamp(1-(s.hintT-9)/2,0,1);
    if(ha>0&&!TOUCH){const tk=['↑ W газ','↓ S тормоз и назад','← → руль','Пробел ручник: дрифт','Shift нитро','C вид (есть от руля)','G гараж','Enter заново'],mw=Math.max(fs*9,px-30-fs*1.6);g.font='400 '+fs*.92+'px '+f;
      const ls=[];let cur_='';for(const k of tk){const nx=cur_?cur_+'  ·  '+k:k;if(cur_&&g.measureText(nx).width>mw){ls.push(cur_);cur_=k}else cur_=nx}ls.push(cur_);
      const bw=Math.max(...ls.map(l=>g.measureText(l).width))+fs*1.6;g.globalAlpha=ha;pl(10,44,bw,ls.length*lh+fs*.6);g.textAlign='left';g.fillStyle='#fff';ls.forEach((l,i)=>g.fillText(l,10+fs*.8,44+fs*.3+lh*(i+.5)));g.globalAlpha=1}
    // спидометр (в виде от руля его заменяет приборка)
    if(camMode!==1){    let R=clamp(Math.min(hh*.15,wd*.12),66,122),gx=wd-R-20-SAFE.r,gyy=hh-R-18-SAFE.b;if(TOUCH&&TCI.cw){R=clamp(Math.min(hh*.12,wd*.1),40,74);gx=SAFE.l+R+16;gyy=(hh>wd?TCI.top:SAFE.t+10)+R+8}const a0=Math.PI*.75,a1=Math.PI*2.25,rp=clamp(s.rpm/C.red,0,1);
    g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(gx,gyy,R+9,0,7);g.fill();g.lineCap='butt';g.lineWidth=R*.11;
    g.strokeStyle='rgba(255,255,255,.2)';g.beginPath();g.arc(gx,gyy,R*.9,a0,a1);g.stroke();g.strokeStyle='rgba(255,70,60,.75)';g.beginPath();g.arc(gx,gyy,R*.9,a0+(a1-a0)*.9,a1);g.stroke();
    g.strokeStyle=rp>.9?'#ff5548':col(.8);g.beginPath();g.arc(gx,gyy,R*.9,a0,a0+(a1-a0)*rp);g.stroke();
    g.textAlign='center';g.fillStyle='#fff';g.font='700 '+R*.56+'px '+f;g.fillText(String(Math.round(s.kmh)),gx,gyy-R*.14);
    g.font='400 '+Math.max(11,R*.16)+'px '+f;g.fillStyle='#c5cbd3';g.fillText('км/ч',gx,gyy+R*.24);
    g.font='700 '+R*.24+'px '+f;g.fillStyle=col(.85);g.fillText(s.gear<0?'R':s.kmh<1&&!keys.u?'N':String(s.gear+1),gx,gyy+R*.5);
    const bw2=R*.9,by=gyy+R*.74;g.fillStyle='rgba(255,255,255,.2)';rr(gx-bw2/2,by,bw2,R*.09,R*.045);g.fill();if(s.nitro>.01){g.fillStyle=s.nitroOn?'#9fe6ff':'#39c6ff';rr(gx-bw2/2,by,bw2*s.nitro,R*.09,R*.045);g.fill()}}
    // сообщения по центру
    const box=(ls,y,big)=>{const sz=ls.map((l,i)=>fs*(i?1:big));let bw=0;ls.forEach((l,i)=>{g.font=(i?'400 ':'800 ')+sz[i]+'px '+f;bw=Math.max(bw,g.measureText(l).width)});const bh=sz.reduce((a,b)=>a+b*1.4,0)+fs*.8;bw=Math.min(wd-24,bw+fs*2.4);
      pl(wd/2-bw/2,y,bw,bh);let yy=y+fs*.4;g.textAlign='center';ls.forEach((l,i)=>{g.font=(i?'400 ':'800 ')+sz[i]+'px '+f;g.fillStyle=i?'#e6e9ee':'#fff';g.fillText(l,wd/2,yy+sz[i]*.7,wd-48);yy+=sz[i]*1.4})};
    if(s.crashed)box(['Авария','Очки: '+Math.round(s.score).toLocaleString('ru-RU')+' · рекорд: '+Math.round(s.best).toLocaleString('ru-RU'),(TOUCH?'Жми ГАЗ — поехали заново':'Enter или ↑ — поехали заново')],hh*.3,2.2);
    else if(!s.started)box(TOUCH?['Жми ГАЗ','Руль: ◀ ▶ слева, газ и тормоз справа','В повороте держи ДРИФТ и газ — пойдёт в занос','Вид — камера, Гараж — 6 машин и цвета']:['Жми ↑ или W','Машина твоя: газ, тормоз и руль на стрелках','В повороте дёрни Пробел и держи газ — пойдёт в занос. C — вид от руля','G — гараж: 6 машин и цвета'],hh*(TOUCH?.24:.3),2);
    else if(s.msgT>0){g.globalAlpha=Math.min(1,s.msgT*2.5);box([s.msg],hh*.16,1.5);g.globalAlpha=1}
    g.textAlign='start';g.textBaseline='alphabetic'}
  return {name:cfg.name,grp:'Рандом и игры',game:true,three:true,get st(){return st},get world(){return w},dcx,
    garKey,get garage(){return gar},get car(){return w&&w.sel},get whInfo(){return w&&w.wh&&w.wh.map(([p])=>[+p.position.x.toFixed(2),+p.position.y.toFixed(2),+p.position.z.toFixed(2),p.children[0].children.length]).concat([[w.pg.W,w.pg.wr,w.pg.ax]])},get mdlInfo(){if(!w||!w.mdl)return null;w.car.updateMatrixWorld(true);const inv=new T.Matrix4().copy(w.car.matrixWorld).invert(),r={pg:[w.pg.L,w.pg.W,w.pg.H,w.pg.wr,w.pg.ax],mats:{}},v=new T.Vector3();w.mdl.traverse(o=>{if(!o.isMesh)return;const n=o.material.name||'?',q=r.mats[n]||(r.mats[n]={t:0,b:[1e9,1e9,1e9,-1e9,-1e9,-1e9]}),p=o.geometry.attributes.position,m=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld);q.t+=o.geometry.index.count/3|0;for(let i=0;i<p.count;i+=3){v.fromBufferAttribute(p,i).applyMatrix4(m);q.b[0]=Math.min(q.b[0],v.x);q.b[1]=Math.min(q.b[1],v.y);q.b[2]=Math.min(q.b[2],v.z);q.b[3]=Math.max(q.b[3],v.x);q.b[4]=Math.max(q.b[4],v.y);q.b[5]=Math.max(q.b[5],v.z)}});for(const k in r.mats)r.mats[k].b=r.mats[k].b.map(x=>+x.toFixed(2));return r},pick(i,c){if(w)applyCar({i,c})},
    enter(){if(!r3init())return;const first=!w;if(!w)build();reset();if(first&&LS.get('car_'+cfg.id,null)===null)gar=true;
      if(first&&w.preload){w.ld={p:0,msg:'Загрузка…',t0:performance.now()};w.preload((p,msg)=>{w.ld.p=p;w.ld.msg=msg}).then(()=>{const id=w.pd.id;if(w.useMdl&&w.mdl!==w.fitC[id])w.useMdl();w.ld.done=performance.now()}).catch(e=>{console.warn('preload',e);w.ld.done=performance.now()})}},
    get loading(){return !!(w&&w.ld&&!w.ld.done)},
    restart(){if(w&&st&&(st.crashed?st.crashT>.7:true))reset()},gas(){if(w&&st&&st.crashed&&st.crashT>1.2)reset()},
    nextCam(){camMode=(camMode+1)%4;LS.set('cam_'+cfg.id,camMode);if(st)say(['Вид: сзади','Вид: от руля','Вид: с капота','Вид: издалека'][camMode],1.2)},get cam(){return camMode},
    draw(wd,hh,t,dt){if(!w||!st)return;if(w.ld&&!w.ld.done){loadUI(wd,hh,t);return}if(w.ld&&w.ld.done&&!w.ld.fadeT)w.ld.fadeT=t;if(!gar)step(Math.min(dt,.05),t);sync(t,dt,wd,hh);if(gar)garCam(t,wd,hh);
      const dp3=TOUCH?Math.min(dpr,1.6,Math.sqrt(1.15e6/(wd*hh))):dpr,tw=Math.max(2,Math.round(wd*dp3*glScale)),tH=Math.max(2,Math.round(hh*dp3*glScale));if(g3.width!==tw||g3.height!==tH)R3.setSize(tw,tH,false);
      R3.render(w.sc,w.cam);if(camMode===1&&!gar){R3.autoClear=false;R3.clearDepth();if(!(w.mdl&&w.noCab))R3.render(w.cabSc,w.cabCam);R3.autoClear=true}if(gar)garUI(wd,hh,t);else hud(wd,hh,t)}}}
return [make(NY)]})();
const VIZX=[VIZRND,...DRIVE];

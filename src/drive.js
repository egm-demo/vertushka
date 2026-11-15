/* ---------- игры: 3D-гонка в потоке (three.js), рулит игрок ---------- */
const keys={};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const h1=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const vnoise=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return h1(i)*(1-u)+h1(i+1)*u};
function curGame(){const v=VIZ[vizIdx];return v&&v.game?v:null}
function gameKey(c,down,rep){const gm=curGame();if(!gm)return false;
  const m={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d',ShiftLeft:'n',ShiftRight:'n',Space:'h'}[c];
  if(m){keys[m]=down;if(down&&m==='u'&&!rep)gm.gas();return true}
  if(c==='Enter'){if(down&&!rep)gm.restart();return true}
  if(c==='KeyC'){if(down&&!rep)gm.nextCam();return true}
  return false}
addEventListener('keyup',e=>{gameKey(e.code,false)});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
const g3=$('#g3');let R3=null,r3fail=false;
function r3init(){if(R3)return R3;if(r3fail||!window.THREE)return null;
  try{R3=new THREE.WebGLRenderer({canvas:g3,antialias:true,powerPreference:'high-performance'})}catch(e){r3fail=true;console.error('three: '+e);return null}
  if(THREE.ColorManagement)THREE.ColorManagement.legacyMode=false;
  R3.outputEncoding=THREE.sRGBEncoding;R3.toneMapping=THREE.ACESFilmicToneMapping;R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFSoftShadowMap;R3.setPixelRatio(1);return R3}

const DRIVE=(()=>{
const SEG=5,KN=150,BACK=6,G=9.81,PN=260,LPN=140;
let T=null,glowTex,noiseTex,M4,Q,V1,V2,EU;const geos={};
function ctex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;if(rep)t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=Math.min(8,R3.capabilities.getMaxAnisotropy());return t}
function boot(){if(T)return;T=THREE;M4=new T.Matrix4();Q=new T.Quaternion();V1=new T.Vector3();V2=new T.Vector3();EU=new T.Euler();
  glowTex=ctex(64,64,x=>{const gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.3,'rgba(255,255,255,.45)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,64,64)});
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
  suv:{W:1.95,m:2000,wr:.38,ax:[1.45,-1.4],hy:.7,ty:.98,body:[[-2.35,.4],[-2.38,1.1],[1.05,1.1],[2.2,1],[2.38,.78],[2.35,.4]],cab:[[-2.32,1.1],[-2.1,1.76],[.3,1.76],[1.05,1.1]]},
  lada:{W:1.62,m:1050,wr:.3,ax:[1.25,-1.2],hy:.54,ty:.74,body:[[-2.03,.34],[-2.05,.9],[2,.88],[2.06,.62],[2.03,.34]],cab:[[-1.42,.9],[-1.12,1.4],[.32,1.4],[.78,.89]]}};
CARS.taxi=CARS.sedan;
function carGeo(k,noWheels){const key=k+(noWheels?'_nw':'');if(geos[key])return geos[key];const P=[],add=(ge,m)=>P.push([ge,m]);
  const ext=(pts,wd,bev)=>{const sh=new T.Shape();pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));
    const ge=new T.ExtrudeGeometry(sh,{depth:wd-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,steps:1});ge.translate(0,0,-(wd-2*bev)/2);ge.rotateY(Math.PI/2);return ge};
  const pb=(x0,x1,y0,y1,wd,xc)=>{const ge=new T.BoxGeometry(wd,y1-y0,x1-x0);ge.translate(xc||0,(y0+y1)/2,-(x0+x1)/2);return ge};
  const pair=(x0,x1,y0,y1,wd,xc,m)=>{add(pb(x0,x1,y0,y1,wd,xc),m);add(pb(x0,x1,y0,y1,wd,-xc),m)};
  const quad=v=>{const ge=new T.BufferGeometry(),p=[];for(const i of[0,1,2,0,2,3])p.push(...v[i]);ge.setAttribute('position',new T.Float32BufferAttribute(p,3));ge.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(12),2));ge.computeVertexNormals();return ge};
  const wheel=(r,wd,x,px)=>{if(noWheels)return;for(const sg of[-1,1]){let ge=new T.CylinderGeometry(r,r,wd,14);ge.rotateZ(Math.PI/2);ge.translate(sg*x,r,-px);add(ge,2);ge=new T.CylinderGeometry(r*.56,r*.56,wd+.03,10);ge.rotateZ(Math.PI/2);ge.translate(sg*x,r,-px);add(ge,5)}};
  let L,W,H,wr=.33,ax,mass=1300,hy=.7,ty=.8;const d=CARS[k];
  if(d){W=d.W;wr=d.wr;ax=d.ax;mass=d.m;hy=d.hy;ty=d.ty;const xs=d.body.map(p=>p[0]),x0=Math.min(...xs),x1=Math.max(...xs),top=Math.max(...d.cab.map(p=>p[1]));L=x1-x0+.12;H=top+.05;
    add(ext(d.body,W,.06),0);add(ext(d.cab,W*.84,.03),1);add(pb(d.cab[1][0]+.05,d.cab[2][0]-.05,top-.02,top+.05,W*.86),0);
    add(pb(x0-.03,x1+.03,.27,.38,W*.88),2);pair(x1-.02,x1+.08,hy-.07,hy+.07,.36,W/2-.28,3);pair(x0-.08,x0+.02,ty-.06,ty+.06,.42,W/2-.3,4);
    wheel(wr,.24,W/2-.04,ax[0]);wheel(wr,.24,W/2-.04,ax[1]);
    if(k==='taxi')add(pb(-.35,.1,H,H+.16,.55),3);
    if(k==='sport'){add(pb(-2.25,-1.9,1.02,1.07,W*.9),0);pair(-2.15,-2,.86,1.02,.06,W*.3,2)}}
  else if(k==='van'){W=2;L=4.95;H=2.2;wr=.38;ax=[1.5,-1.78];mass=2300;hy=1;ty=1.15;
    add(ext([[-2.4,.42],[-2.42,2],[-2.3,2.12],[.85,2.12],[1.2,2.02],[1.7,1.3],[2.34,1.12],[2.42,.8],[2.4,.42]],W,.05),0);
    add(quad([[-.86,2.04,-1.317],[.86,2.04,-1.317],[.86,1.44,-1.747],[-.86,1.44,-1.747]]),1);
    pair(.5,1.15,1.38,1.92,.03,W/2+.005,1);pair(-2,.3,1.42,1.92,.03,W/2+.005,1);pair(-2.5,-2.46,1.35,1.9,.7,.42,1);
    add(pb(-2.44,2.46,.4,.5,W*.88),2);pair(2.38,2.5,.9,1.08,.34,.74,3);pair(-2.5,-2.42,.9,1.4,.14,.92,4);
    wheel(wr,.26,W/2-.04,ax[0]);wheel(wr,.26,W/2-.04,ax[1])}
  else if(k==='truck'){W=2.5;L=8.6;H=3.6;wr=.5;ax=[3.3,-2.9];mass=9000;hy=.95;ty=1;
    add(pb(2.3,4.2,.6,2.75,2.4),0);add(pb(4.2,4.24,1.65,2.55,2.1),1);pair(2.9,3.9,1.7,2.5,.03,1.21,1);
    add(pb(-4.3,2.15,1.1,3.6,2.5),5);add(pb(-4.3,4.2,.55,1.1,2.1),2);pair(4.2,4.27,.85,1.05,.4,.85,3);pair(-4.34,-4.28,.9,1.1,.3,.95,4);
    wheel(wr,.3,W/2-.16,3.3);wheel(wr,.5,W/2-.26,-2.4);wheel(wr,.5,W/2-.26,-3.5)}
  else if(k==='bus'){W=2.5;L=11;H=3.1;wr=.5;ax=[3.6,-3.4];mass=11000;hy=.85;ty=.95;
    add(pb(-5.5,5.5,.5,3.1,W),0);pair(-5.2,4.7,1.55,2.55,.03,W/2+.005,1);add(pb(5.5,5.53,1.35,2.75,2.2),1);add(pb(-5.53,-5.5,1.7,2.6,2),1);
    add(pb(-5.5,5.5,.3,.5,2.3),2);pair(5.48,5.56,.75,.95,.4,.85,3);pair(-5.56,-5.48,.8,1.1,.3,.95,4);wheel(wr,.32,W/2-.17,3.6);wheel(wr,.32,W/2-.17,-3.4)}
  else{W=2.2;L=3.8;H=2.8;mass=3500;hy=1.3;ty=1.4;ax=[1.4,-.85];wr=.85;
    add(pb(-.1,1.9,.95,1.6,.95),0);add(pb(-1.5,-.1,1,2.6,1.4),1);add(pb(-1.6,0,2.6,2.72,1.55),0);add(pb(-1.5,1.8,.6,1,.8),2);
    add(pb(-.9,-.7,2.72,2.9,.2),3);pair(1.88,1.94,1.2,1.4,.2,.3,3);pair(-1.55,-1.5,1.3,1.5,.2,.55,4);wheel(.85,.5,.85,-.85);wheel(.5,.3,.8,1.4)}
  return geos[key]={geo:merge(P),L,W,H,wr,ax,mass,hy,ty}}
function wheelGeo(r,wd){const P=[];let ge=new T.CylinderGeometry(r,r,wd,18);ge.rotateZ(Math.PI/2);P.push([ge,0]);ge=new T.CylinderGeometry(r*.62,r*.62,wd+.02,14);ge.rotateZ(Math.PI/2);P.push([ge,1]);
  for(let i=0;i<5;i++){ge=new T.BoxGeometry(wd+.05,r*.56,r*.15);ge.translate(0,r*.3,0);ge.rotateX(i*Math.PI*2/5);P.push([ge,2])}return merge(P)}

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
function skyRU(x,W,H){const hz=H/2;let gr=x.createLinearGradient(0,0,0,hz);gr.addColorStop(0,'#1c6bd0');gr.addColorStop(.6,'#6fb1ec');gr.addColorStop(1,'#d9ecf9');x.fillStyle=gr;x.fillRect(0,0,W,hz);
  gr=x.createLinearGradient(0,hz,0,H);gr.addColorStop(0,'#8fae62');gr.addColorStop(1,'#6f9248');x.fillStyle=gr;x.fillRect(0,hz,W,hz);
  gr=x.createRadialGradient(1350,324,0,1350,324,190);gr.addColorStop(0,'rgba(255,252,225,1)');gr.addColorStop(.12,'rgba(255,250,215,.75)');gr.addColorStop(1,'rgba(255,250,215,0)');x.fillStyle=gr;x.fillRect(1160,134,380,380);
  for(let i=0;i<34;i++){const cy=70+h1(i*3.1)*370,sc=.45+(1-cy/440)*1.1,cx_=h1(i*7.7)*W,n=5+(h1(i*2.2)*5|0);
    for(let j=0;j<n;j++){const ox=(j-n/2)*30*sc+(h1(i+j*1.7)-.5)*20*sc,oy=(h1(i*5+j)-.5)*14*sc,rx=(34+h1(j*3.3+i)*26)*sc,ry=rx*(.42+h1(j+i*9)*.2);
      x.fillStyle='rgba(205,214,226,.5)';x.beginPath();x.ellipse(cx_+ox,cy+oy+ry*.35,rx,ry*.8,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.ellipse(cx_+ox,cy+oy,rx,ry,0,0,7);x.fill()}}
  x.fillStyle='#8fb0a6';x.beginPath();x.moveTo(0,hz+2);for(let px=0;px<=W;px+=8)x.lineTo(px,hz-8-10*vnoise(px/90)-5*vnoise(px/23));x.lineTo(W,hz+2);x.fill();
  x.fillStyle='#3f6b47';x.beginPath();x.moveTo(0,hz+2);for(let px=0;px<=W;px+=3)x.lineTo(px,hz-3-6*vnoise(px/40)-3*h1(px*.37));x.lineTo(W,hz+2);x.fill();
  const cx_=1500,y0=hz-2;x.fillStyle='#f6f3ea';x.fillRect(cx_-7,y0-11,14,11);x.fillRect(cx_+9,y0-7,7,7);x.fillStyle='#3f7a52';x.beginPath();x.moveTo(cx_-9,y0-11);x.lineTo(cx_,y0-17);x.lineTo(cx_+9,y0-11);x.fill();
  x.fillStyle='#f6f3ea';x.fillRect(cx_-2.5,y0-21,5,5);x.fillStyle='#e3b23c';x.beginPath();x.moveTo(cx_-2.5,y0-21);x.bezierCurveTo(cx_-7,y0-26,cx_-1,y0-28,cx_,y0-32);x.bezierCurveTo(cx_+1,y0-28,cx_+7,y0-26,cx_+2.5,y0-21);x.fill();x.fillRect(cx_-.6,y0-37,1.2,6);x.fillRect(cx_-2,y0-35.5,4,1);
  for(let i=0;i<9;i++){const hx=cx_+(i<4?-1:1)*(16+(i%5)*11);x.fillStyle=['#8a6a4a','#b08a60','#6f7f8f'][i%3];x.fillRect(hx,y0-5,8,5);x.fillStyle='#5a3d30';x.beginPath();x.moveTo(hx-1,y0-5);x.lineTo(hx+4,y0-9);x.lineTo(hx+9,y0-5);x.fill()}}
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
const CARCOL=[0xc8c8cd,0x282c34,0x96181e,0x1e4696,0x5a6068,0xecece8,0x185a3c],LADA=[0xdecda0,0xecece8,0xaa1e1e,0x2846a0,0x4e224e,0x286e46,0x969696],SELO=['Берёзовка','Малые Васюки','Простоквашино','Ромашково','Васильки','Гадюкино'],NYS=['Manhattan','Brooklyn Bridge','Times Square','FDR Drive','Queens','JFK Airport'];
const NY={id:'ny',name:'Шоссе: Нью-Йорк',night:true,half:7.4,lim:6.2,lanes:[[-5.25,1],[-1.75,1],[1.75,1],[5.25,1]],home:2,gap:[15,30],oncoming:0,cruise:[21,30],fastV:28,crashV:15,vtop:78,wallE:.25,wallLoss:.035,wallDrag:.2,
  cx:s=>70*Math.sin(s/520)+22*Math.sin(s/190+1.3),dcx:s=>70/520*Math.cos(s/520)+22/190*Math.cos(s/190+1.3),hy:s=>4*Math.sin(s/380)+1.5*Math.sin(s/150+1),dhy:s=>4/380*Math.cos(s/380)+1.5/150*Math.cos(s/150+1),
  fog:0x24163a,fogN:120,fogF:900,hemi:[0x8ea0d8,0x15141c,.75],sun:[0x9fb2ff,.22],sunDir:[-.5,.5,-.6],sky:skyNY,rough:.58,roadEnv:.7,vl:24,
  roadTex:roadTex({base:'#2b2c32',half:7.4,vl:24,lanes:[-5.25,-1.75,1.75,5.25],solid:[[-7.05,'#e2b93a'],[7.05,'#e4e4dc']],dash:[-3.5,0,3.5],dashC:'#e6e6de',dashL:5}),
  left:[[-500,-.4,0x181a22],[-8.02,-.4,0x181a22],[-8,-.4,0x6a6d74],[-8,.95,0x8b8e94],[-7.6,.95,0x8b8e94],[-7.4,0,0x5d5f66]],right:[[7.4,0,0x5d5f66],[7.6,.95,0x8b8e94],[8,.95,0x8b8e94],[8,-.4,0x6a6d74],[8.02,-.4,0x181a22],[500,-.4,0x181a22]],
  player:{kind:'sport',col:0xd41428,hood:[1.05,1.0]},
  car:{m:1350,Iz:2100,a:1.25,b:1.35,hcg:.45,Cf:90000,Cr:115000,mu:1.15,Tmax:520,red:7400,gears:[3.3,2.1,1.5,1.15,.92,.76],fd:3.7,rw:.34,cd:.52,steerMax:.5,brakeG:10.5,esp:4,rollK:.006,pitchK:.0045},
  pick(){const r=Math.random(),c=CARCOL[(Math.random()*CARCOL.length)|0];return r<.34?{kind:'taxi',col:0xf5c518,cr:.95}:r<.6?{kind:'sedan',col:c,cr:1}:r<.78?{kind:'suv',col:c,cr:.98}:r<.91?{kind:'truck',col:c,cr:.8}:{kind:'bus',col:0xe6e8ec,cr:.76}},
  scenery(w){const sc=w.root;
    const lg=merge([[new T.CylinderGeometry(.1,.14,9,8).translate(0,4.5,0),0],[new T.BoxGeometry(2.5,.1,.12).translate(1.2,8.95,0),0],[new T.BoxGeometry(.8,.1,.34).translate(2.2,8.88,0),1]]);
    w.lamps=new T.InstancedMesh(lg,[new T.MeshLambertMaterial({color:0x3a3d46}),new T.MeshBasicMaterial({color:0xfff0cc})],48);
    w.pools=new T.InstancedMesh(new T.PlaneGeometry(20,28).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:glowTex,color:0xffd29a,transparent:true,opacity:.4,blending:T.AdditiveBlending,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),48);
    w.bld=[0,1,2].map(k=>new T.InstancedMesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({map:ctex(512,1024,winTex(k))}),110));
    for(const m of [w.lamps,w.pools,...w.bld]){m.frustumCulled=false;m.count=0;sc.add(m)}
    w.lampGlow=w.mkPts(64,4.4,0xffe0ae,false,sc);
    w.bbCv=document.createElement('canvas');w.bbCv.width=1024;w.bbCv.height=448;w.bbTex=new T.CanvasTexture(w.bbCv);w.bbTex.encoding=T.sRGBEncoding;w.bbTex.anisotropy=8;
    w.bb=new T.Group();w.bbFrame=new T.MeshBasicMaterial({color:0xff40c0});const pm=new T.MeshLambertMaterial({color:0x2a2c34});
    w.bb.add(new T.Mesh(new T.PlaneGeometry(13,5.7).translate(0,11,.22),new T.MeshBasicMaterial({map:w.bbTex})),new T.Mesh(new T.BoxGeometry(13.5,6.2,.3).translate(0,11,0),w.bbFrame),new T.Mesh(new T.CylinderGeometry(.22,.22,8,8).translate(-4,4,0),pm),new T.Mesh(new T.CylinderGeometry(.22,.22,8,8).translate(4,4,0),pm));w.sc.add(w.bb);
    w.gan=new T.Group();const gm=new T.MeshLambertMaterial({color:0x4a4e56});
    w.gan.add(new T.Mesh(new T.BoxGeometry(17.6,.5,.5).translate(0,7.6,0),gm),new T.Mesh(new T.BoxGeometry(.4,7.8,.4).translate(-8.6,3.9,0),gm),new T.Mesh(new T.BoxGeometry(.4,7.8,.4).translate(8.6,3.9,0),gm));
    w.ganS=[0,1].map(j=>{const m=new T.Mesh(new T.PlaneGeometry(6.2,2.3).translate(j?3.6:-3.6,8.3,.3),new T.MeshBasicMaterial({color:0xb8b8b8}));w.gan.add(m);return m});w.ganT=NYS.map(n=>ctex(512,190,signTex(n,'#0f6a3c','#f2f6f2')));w.sc.add(w.gan)},
  populate(w,base,P){let li=0,gi=0;const bi=[0,0,0],gp=w.lampGlow.geometry.attributes.position;
    for(let n=base-BACK;n<base+KN;n++){const s=n*SEG;
      if(n%8===0)for(const sg of[-1,1]){const p=P(s,sg*8.6),q=P(s,sg*6.4);setI(w.lamps,li,p.x,p.y,p.z,p.yaw+(sg>0?Math.PI:0),1,1,1);gp.setXYZ(gi++,q.x,q.y+8.7,q.z);setI(w.pools,li,q.x,q.y+.05,q.z,q.yaw,1,1,1,q.pitch);li++}
      if(n%3===0)for(const sg of[-1,1]){const hh=h1(n*1.37+sg*7);if(hh<.16)continue;const bw=14+h1(n*2.1+sg)*15,bd=14+h1(n*3.3+sg)*12,bh=18+Math.pow(h1(n*2.9+sg),2.2)*130,k=(hh*30|0)%3,p=P(s,sg*(17+bd/2+h1(n*.7+sg)*26));setI(w.bld[k],bi[k]++,p.x,p.y+bh/2-3,p.z,p.yaw,bd,bh,bw)}}
    w.lamps.count=w.pools.count=li;w.lamps.instanceMatrix.needsUpdate=w.pools.instanceMatrix.needsUpdate=true;gp.needsUpdate=true;w.lampGlow.geometry.setDrawRange(0,gi);
    w.bld.forEach((m,k)=>{m.count=bi[k];m.instanceMatrix.needsUpdate=true})},
  tick(w,st,P){w.lampGlow.material.size=4.2+A.beat*2.4;w.pools.material.opacity=.36+A.bass*.26;w.bld.forEach((m,k)=>m.material.color.setScalar(.8+A.bands[8+k*14]*1.5));w.bbFrame.color.set(col(.55+A.beat*.4));
    const sb=Math.ceil((st.s+25)/420)*420;if(sb!==w.bbS){w.bbS=sb;const sg=(sb/420)%2?1:-1,p=P(sb,sg*15.5);w.bb.position.set(p.x,p.y-1,p.z);w.bb.rotation.y=p.yaw-sg*.32}
    const tt=nowTitle(),key=tt[0]+'|'+tt[1]+'|'+palIdx+theme;if(key!==w.bbKey){w.bbKey=key;bbDraw(w.bbCv.getContext('2d'),1024,448,tt[0],tt[1]);w.bbTex.needsUpdate=true}
    const sg2=Math.ceil((st.s-430)/900)*900+450;if(sg2!==w.ganPos){w.ganPos=sg2;const p=P(sg2,0);w.gan.position.set(p.x,p.y,p.z);w.gan.rotation.y=p.yaw;const i=(sg2-450)/900;w.ganS.forEach((m,j)=>{m.material.map=w.ganT[(((i*2+j)%6)+6)%6];m.material.needsUpdate=true})}}};
const RU={id:'ru',name:'Трасса: поле в России',night:false,half:3.7,lim:7.3,lanes:[[-1.85,-1],[1.85,1]],home:1,gap:[45,70],oncoming:1,cruise:[15,23],fastV:19,crashV:11,vtop:45,wallE:0,wallLoss:.025,wallDrag:.3,
  cx:s=>60*Math.sin(s/400)+25*Math.sin(s/160+.7),dcx:s=>.15*Math.cos(s/400)+25/160*Math.cos(s/160+.7),hy:s=>9*Math.sin(s/260)+3.5*Math.sin(s/110+1),dhy:s=>9/260*Math.cos(s/260)+3.5/110*Math.cos(s/110+1),
  fog:0xd3e8f7,fogN:160,fogF:1150,hemi:[0xd6eaff,0x7b8a4c,.95],sun:[0xfff1d6,1.5],sunDir:[.45,.55,-.7],sky:skyRU,rough:.92,roadEnv:.35,vl:24,
  roadTex:roadTex({base:'#63656a',half:3.7,vl:24,lanes:[-1.85,1.85],patch:1,solid:[[-3.42,'#e9e9e2'],[3.42,'#e9e9e2']],dash:[0],dashC:'#efefe8',dashL:4}),
  left:[[-500,24,0xbfa040,9,.004,1],[-190,6,0xcfaa44,3,.011,2],[-60,1,0xd4b04a,.7,.02,.5],[-14,-.35,0xd4b04a],[-9.6,-1.15,0x6a9a44],[-6.4,-.3,0x8e9a58],[-5,-.07,0xa39a86],[-3.7,0,0x9a927f]],
  right:[[3.7,0,0x9a927f],[5,-.07,0xa39a86],[6.4,-.3,0x8e9a58],[9.6,-1.15,0x6a9a44],[14,-.35,0x6fa548],[60,1,0x6fa548,.7,.02,2.5],[190,6,0x639a45,3,.011,4],[500,24,0x578c42,9,.004,3]],
  player:{kind:'van',col:0xf2f3f5,hood:[2.05,1.55]},
  car:{m:2300,Iz:4300,a:1.45,b:1.5,hcg:.85,Cf:95000,Cr:120000,mu:.95,Tmax:330,red:5200,gears:[4,2.4,1.5,1,.8],fd:4.3,rw:.36,cd:1.05,steerMax:.5,brakeG:8.5,esp:3,rollK:.011,pitchK:.007},
  pick(){const r=Math.random(),c=LADA[(Math.random()*LADA.length)|0];return r<.46?{kind:'lada',col:c,cr:1}:r<.6?{kind:'van',col:0x7a8a70,cr:.92}:r<.8?{kind:'truck',col:0xe26e1e,cr:.8}:r<.9?{kind:'tractor',col:0x2858be,cr:.4}:{kind:'suv',col:c,cr:1.08}},
  scenery(w){const sc=w.root,L=o=>new T.MeshLambertMaterial(o);
    const bt=ctex(64,256,(x,W,H)=>{x.fillStyle='#eceae2';x.fillRect(0,0,W,H);x.fillStyle='#26241f';for(let i=0;i<34;i++)x.fillRect(Math.random()*W,Math.random()*H,6+Math.random()*22,2+Math.random()*4)});
    w.trunks=new T.InstancedMesh(new T.CylinderGeometry(.5,.62,1,7).translate(0,.5,0),L({map:bt}),260);
    w.crowns=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),L({color:0xffffff,flatShading:true}),520);
    w.poles=new T.InstancedMesh(merge([[new T.CylinderGeometry(.11,.15,8,6).translate(0,4,0),0],[new T.BoxGeometry(1.9,.1,.1).translate(0,7.5,0),0]]),L({color:0x5c4632}),20);
    w.bales=new T.InstancedMesh(new T.CylinderGeometry(.75,.75,1.3,14).rotateZ(Math.PI/2).translate(0,.75,0),L({color:0xd8b455}),60);
    w.walls=new T.InstancedMesh(new T.BoxGeometry(1,1,1).translate(0,.5,0),L({color:0xffffff}),40);
    w.roofs=new T.InstancedMesh(new T.ConeGeometry(.74,1,4).rotateY(Math.PI/4).translate(0,.5,0),L({color:0x6a3d30,flatShading:true}),40);
    for(const m of [w.trunks,w.crowns,w.poles,w.bales,w.walls,w.roofs]){m.frustumCulled=false;m.count=0;m.castShadow=true;sc.add(m)}
    const wg=new T.BufferGeometry();wg.setAttribute('position',new T.BufferAttribute(new Float32Array(20*24),3));w.wires=new T.LineSegments(wg,new T.LineBasicMaterial({color:0x22221f}));w.wires.frustumCulled=false;sc.add(w.wires);
    const post=new T.MeshLambertMaterial({color:0x7a7e84});
    w.selo=new T.Group();w.seloM=new T.MeshBasicMaterial({color:0xdddddd});w.selo.add(new T.Mesh(new T.PlaneGeometry(3.4,1).translate(0,2.6,.06),w.seloM),new T.Mesh(new T.BoxGeometry(.1,2.6,.1).translate(-1.3,1.3,0),post),new T.Mesh(new T.BoxGeometry(.1,2.6,.1).translate(1.3,1.3,0),post));w.sc.add(w.selo);
    w.seloT=SELO.map(n=>ctex(512,150,signTex(n,'#f6f6f2','#111','#111')));
    w.lim=new T.Group();w.lim.add(new T.Mesh(new T.CircleGeometry(.5,24).translate(0,2.6,.06),new T.MeshBasicMaterial({color:0xdddddd,map:ctex(128,128,(x,W,H)=>{x.fillStyle='#fff';x.fillRect(0,0,W,H);x.strokeStyle='#d21f1f';x.lineWidth=16;x.beginPath();x.arc(64,64,54,0,7);x.stroke();x.fillStyle='#111';x.font='700 58px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('90',64,68)})})),new T.Mesh(new T.BoxGeometry(.08,2.6,.08).translate(0,1.3,0),post));w.sc.add(w.lim);
    w.tc=new T.Color()},
  populate(w,base,P,GY){let ti=0,ci=0,pi=0,bi=0,hi=0,wi=0,prev=null;const wp=w.wires.geometry.attributes.position,GR=[0x3f8a3c,0x57a046,0x6fb04e,0x2f7a3a],HC=[0x9a7a56,0xc2a070,0x8090a0,0xd8d2c0,0x7a9a6a];
    for(let n=base-BACK;n<base+KN;n++){const s=n*SEG;
      if(n%12===0){const p=P(s,-8.3),y=GY(s,-8.3);setI(w.poles,pi++,p.x,y,p.z,p.yaw,1,1,1);const top=[p.x,y+7.5,p.z];
        if(prev&&wi<20)for(const ox of[-.8,.8]){const a=[prev[0]+ox,prev[1],prev[2]],b=[top[0]+ox,top[1],top[2]],m=[(a[0]+b[0])/2,(a[1]+b[1])/2-.7,(a[2]+b[2])/2];wp.setXYZ(wi*8+(ox<0?0:4),...a);wp.setXYZ(wi*8+(ox<0?1:5),...m);wp.setXYZ(wi*8+(ox<0?2:6),...m);wp.setXYZ(wi*8+(ox<0?3:7),...b)}
        if(prev)wi++;prev=top}
      for(const sg of[-1,1]){const dens=vnoise(n*.035+sg*17.3),r=h1(n*1.31+sg*3.7);
        if(r>(dens>.55?.42:.93)&&ti<260){const d=sg*(10.8+h1(n*2.17+sg)*(dens>.55?75:40)),p=P(s,d),y=GY(s,d),th=5+h1(n*4.3+sg)*4,k=.75+h1(n*6.1+sg)*.6;setI(w.trunks,ti++,p.x,y,p.z,r*6,.3,th,.3);
          for(let j=0;j<2;j++){setI(w.crowns,ci,p.x+(j?.4:-.3)*k,y+th*(.72+j*.3),p.z+(j?-.3:.2)*k,r*9+j,(1.9-j*.5)*k,(2.2-j*.5)*k,(1.9-j*.5)*k);w.crowns.setColorAt(ci++,w.tc.set(GR[(r*40+j|0)%4]))}}
        if(vnoise(n*.012+3.1)>.68&&n%3===0&&h1(n*.77+sg)>.4&&hi<40){const d=sg*(26+h1(n*5.9+sg)*30),p=P(s,d),y=GY(s,d),wd=6+h1(n+sg)*3,hh=3+h1(n*2+sg)*.8,dp=6+h1(n*3+sg)*2.5;setI(w.walls,hi,p.x,y-.2,p.z,p.yaw,wd,hh,dp);w.walls.setColorAt(hi,w.tc.set(HC[(h1(n*8.8+sg)*5)|0]));setI(w.roofs,hi,p.x,y-.2+hh,p.z,p.yaw,wd*1.08,2.3,dp*1.08);hi++}}
      if(h1(n*3.71)>.9&&bi<60){const d=-(13+h1(n*1.9)*45),p=P(s,d);setI(w.bales,bi++,p.x,GY(s,d),p.z,h1(n)*6,1,1,1)}}
    w.trunks.count=ti;w.crowns.count=ci;w.poles.count=pi;w.bales.count=bi;w.walls.count=w.roofs.count=hi;
    for(const m of [w.trunks,w.crowns,w.poles,w.bales,w.walls,w.roofs])m.instanceMatrix.needsUpdate=true;
    if(w.crowns.instanceColor)w.crowns.instanceColor.needsUpdate=true;if(w.walls.instanceColor)w.walls.instanceColor.needsUpdate=true;wp.needsUpdate=true;w.wires.geometry.setDrawRange(0,wi*8)},
  tick(w,st,P,GY){const a=Math.ceil((st.s+15)/800)*800;if(a!==w.seloS){w.seloS=a;const p=P(a,5.6);w.selo.position.set(p.x,GY(a,5.6),p.z);w.selo.rotation.y=p.yaw;w.seloM.map=w.seloT[((a/800)%6+6)%6];w.seloM.needsUpdate=true}
    const b=Math.ceil((st.s-385)/800)*800+400;if(b!==w.limS){w.limS=b;const p=P(b,5.4);w.lim.position.set(p.x,GY(b,5.4),p.z);w.lim.rotation.y=p.yaw}}};

/* --- сама игра --- */
function make(cfg){
  let w=null,st=null,camMode=LS.get('cam_'+cfg.id,0);
  const cx=cfg.cx,dcx=cfg.dcx,hy=cfg.hy,dhy=cfg.dhy,HALF=cfg.half,C=cfg.car,LX=cfg.lanes.map(l=>l[0]);
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
    else{dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);const c=dl.shadow.camera;c.left=-45;c.right=45;c.top=45;c.bottom=-45;c.near=20;c.far=340;dl.shadow.bias=-.0004;dl.shadow.normalBias=.04}
    const S=o=>new T.MeshStandardMaterial(o);
    w.m={glass:S({color:0x5a6c80,roughness:.05,metalness:1,side:T.DoubleSide}),dark:S({color:0x1b1c20,roughness:.8}),head:S({color:0xffffff,emissive:0xfff0c8,emissiveIntensity:night?2.2:.35,roughness:.3}),
      tail:S({color:0x550808,emissive:0xff1a10,emissiveIntensity:night?1.6:.2,roughness:.4}),aux:S({color:0xc4c8ce,roughness:.45,metalness:.7}),rim:S({color:0x6e737b,roughness:.4,metalness:.7}),paint:{}};
    w.paint=hex=>w.m.paint[hex]||(w.m.paint[hex]=S({color:hex,roughness:.34,metalness:.35}));
    w.root=new T.Group();sc.add(w.root);w.dyn=new T.Group();sc.add(w.dyn);
    w.mkPts=(n,size,color,vc,parent)=>{const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));if(vc)ge.setAttribute('color',new T.BufferAttribute(new Float32Array(n*3),3));ge.setDrawRange(0,0);
      const p=new T.Points(ge,new T.PointsMaterial({map:glowTex,size,color,vertexColors:!!vc,transparent:true,blending:T.AdditiveBlending,depthWrite:false,sizeAttenuation:true,fog:false}));p.frustumCulled=false;parent.add(p);return p};
    const gm=()=>new T.MeshLambertMaterial({vertexColors:true,map:noiseTex,side:T.DoubleSide});
    w.strips=[strip([[-HALF,0,0],[HALF,0,1]],S({map:ctex(512,1024,cfg.roadTex,true),roughness:cfg.rough,metalness:0,envMapIntensity:cfg.roadEnv}),{vl:cfg.vl}),strip(cfg.left,gm(),{colors:1,vl:8}),strip(cfg.right,gm(),{colors:1,vl:8})];
    w.strips.forEach(m=>w.root.add(m));cfg.scenery(w);
    w.lightP=w.mkPts(LPN,night?1.7:1.1,0xffffff,true,w.dyn);w.parts=w.mkPts(PN,.55,0xffffff,true,w.dyn);w.parts.geometry.setDrawRange(0,PN);
    w.pp=[];for(let i=0;i<PN;i++)w.pp.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,l:0,m:1,r:0,g:0,b:0,gr:0});w.pi=0;
    const pg=carGeo(cfg.player.kind,true);w.pg=pg;w.ptail=w.m.tail.clone();w.car=new T.Group();w.car.rotation.order='YXZ';
    w.body=new T.Mesh(pg.geo,[w.paint(cfg.player.col),w.m.glass,w.m.dark,w.m.head,w.ptail,w.m.aux]);w.body.castShadow=true;w.car.add(w.body);sc.add(w.car);
    const wg=wheelGeo(pg.wr,.26);w.wh=[];for(let i=0;i<4;i++){const piv=new T.Group(),m=new T.Mesh(wg,[w.m.dark,w.m.rim,w.m.aux]);m.castShadow=true;piv.position.set((i%2?1:-1)*(pg.W/2+.05),pg.wr,-(i<2?pg.ax[0]:pg.ax[1]));piv.add(m);w.car.add(piv);w.wh.push([piv,m])}}
  function emit(x,y,z,vx,vy,vz,life,r,gg,b,gr){const p=w.pp[w.pi];w.pi=(w.pi+1)%PN;p.x=x;p.y=y;p.z=z;p.vx=vx;p.vy=vy;p.vz=vz;p.l=p.m=life;p.r=r;p.g=gg;p.b=b;p.gr=gr||0}
  function sparks(x,y,z,n,sp){for(let i=0;i<n;i++)emit(x,y,z,(Math.random()-.5)*sp,Math.random()*sp*.5,(Math.random()-.5)*sp-st.vt*.3,.25+Math.random()*.45,1,.7+Math.random()*.3,.25,12)}
  function say(m,tm){st.msg=m;st.msgT=tm||1.6}
  function reset(){const s0=st?st.s:0,best=LS.get('best3_'+cfg.id,0);if(st)for(const c of st.cars)w.sc.remove(c.mesh);
    const d0=LX[cfg.home],p=pt(s0,d0,0);
    st={s:s0,d:d0,x:p.x,z:p.z,psi:Math.atan(dcx(s0)),u:0,v:0,w:0,steer:0,gear:0,rpm:900,shiftT:0,ax:0,ay:0,roll:0,pitch:0,heave:0,surf:1,vt:0,kmh:0,nitro:.5,nitroOn:false,
      score:0,dist:0,passed:0,combo:0,comboT:0,near:0,hits:0,best,crashed:false,crashT:0,msg:'',msgT:0,shake:0,started:false,hintT:0,cars:[],next:s0+70,onT:3,camYaw:Math.atan(dcx(s0)),spin:0,fov:66,slip:0,brk:0,wall:null,onc:false}}
  function spawn(s,lane,v,dirOverride){const [lx,dir]=cfg.lanes[lane];for(const c of st.cars)if(Math.abs(c.d-lx)<1.9&&Math.abs(c.s-s)<16)return;
    const k=cfg.pick(),ge=carGeo(k.kind),mesh=new T.Mesh(ge.geo,[w.paint(k.col),w.m.glass,w.m.dark,w.m.head,w.m.tail,w.m.aux]);mesh.castShadow=true;mesh.rotation.order='YXZ';w.sc.add(mesh);
    const cr=(cfg.cruise[0]+Math.random()*(cfg.cruise[1]-cfg.cruise[0]))*k.cr;
    st.cars.push({mesh,s,d:lx,tl:lane,dir,v:v===undefined?cr:v,cr,L:ge.L,W:ge.W,ty:ge.ty,mass:ge.mass,passed:false,hit:false,wreck:false,vd:0,yawOff:0,spinV:0,blink:0,lcT:3+Math.random()*9,brk:false})}
  function crash(c){const s=st;if(s.crashed)return;s.crashed=true;s.crashT=0;s.shake=1;s.w+=(Math.random()-.5)*5;s.combo=0;c.wreck=true;c.spinV=(Math.random()-.5)*4;
    if(s.score>s.best){s.best=Math.round(s.score);LS.set('best3_'+cfg.id,s.best)}}
  function phys(h,th,br,sx,hb){const s=st,L=C.a+C.b,sgn=s.u<0?-1:1,au=Math.abs(s.u),m0=dcx(-s.z),n0=Math.hypot(1,m0),ad=Math.abs((s.x-cx(-s.z))/n0);
    const surf=ad<HALF+.2?1:ad<HALF+1.7?.82:.6,mu=C.mu*surf;s.surf=surf;
    const dmax=Math.min(C.steerMax,Math.atan(L*mu*G*1.1/Math.max(30,s.u*s.u))+.01),tgt=sx*dmax,rate=dmax/(sx===0||tgt*s.steer<0?.1:.2)+(Math.abs(s.steer)>dmax?3:0);
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
    const fyf=-mu*Nf*Math.tanh(C.Cf*af/(mu*Nf)),fyr=-mu*Nr*gr*Math.tanh(C.Cr*ar/(mu*Nr*gr)),cs=Math.cos(s.steer),sn=Math.sin(s.steer);
    let dw=(C.a*fyf*cs-C.b*fyr)/C.Iz;if(!hb&&!s.crashed)dw+=(clamp(s.u*Math.tan(s.steer)/L,-mu*G/uu,mu*G/uu)-s.w)*C.esp;
    s.ax+=(Fx/C.m-s.ax)*Math.min(1,h*10);s.ay+=((fyf*cs+fyr)/C.m-s.ay)*Math.min(1,h*10);s.slip=Math.abs(ar);s.brk=brk;
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
  function step(dt,t){const s=st,pg=w.pg;let th=keys.u?1:0,br=keys.d?1:0,sx=(keys.r?1:0)-(keys.l?1:0),hb=keys.h?1:0;
    if(s.crashed){th=0;br=1;sx=0;hb=1;s.crashT+=dt}
    if(th||br)s.started=true;
    s.nitroOn=!!keys.n&&s.nitro>0&&!!th&&!s.crashed&&s.u>5;s.nitro=s.nitroOn?Math.max(0,s.nitro-dt/4.5):Math.min(1,s.nitro+dt/70);
    s.wall=null;const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;for(let i=0;i<n;i++)phys(h,th,br,sx,hb);
    const upd=()=>{s.s=-s.z;const m=dcx(s.s),nn=Math.hypot(1,m);s.d=(s.x-cx(s.s))/nn;const fx=Math.sin(s.psi),fz=-Math.cos(s.psi);s.vt=((s.u*fx-s.v*fz)*m-(s.u*fz+s.v*fx))/nn;s.kmh=Math.hypot(s.u,s.v)*3.6};upd();
    const gy=groundY(s.s,s.d);
    if(s.wall){const sg=s.wall.sg,m=dcx(s.s),nn=Math.hypot(1,m),ex=s.x+sg*pg.W/2/nn,ez=s.z+sg*pg.W/2*m/nn;
      if(cfg.night){if(s.kmh>15)sparks(ex,gy+.5,ez,s.wall.vn>1?14:2,5+s.wall.vn)}else if(s.kmh>10)for(let i=0;i<3;i++)emit(ex,gy+.3,ez,(Math.random()-.5)*3,1+Math.random()*2,(Math.random()-.5)*3,.8,.5,.42,.3,-1);
      if(s.wall.vn>1.2){s.shake=Math.min(1,s.shake+s.wall.vn*.09);s.combo=0;s.hits++;if(cfg.night)say('Отбойник!',1)}}
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
        s.u=vx*fx+vz*fz;s.v=vx*rx+vz*rz;s.combo=0;if(!c.hit){c.hit=true;s.hits++}upd()}
      // обгон и «впритирку»
      if(!c.passed&&!c.hit&&(c.dir>0?s.s>c.s+c.L/2:c.s<s.s-c.L/2)){c.passed=true;const gp=Math.abs(c.d-s.d)-(c.W+pg.W)/2,rel=s.vt-c.v*c.dir;if(c.dir>0)s.passed++;
        if(gp<(c.dir>0?1.1:1.4)&&rel>7&&!s.crashed){s.combo++;s.comboT=5;s.near++;const b=Math.round(40*s.combo*(1+rel/20)*(c.dir<0?2:1)/10)*10;s.score+=b;s.nitro=Math.min(1,s.nitro+.15);say((c.dir<0?'Встречка впритирку! +':'Впритирку! +')+b,1.4)}}}
    // очки
    s.dist+=Math.max(0,s.vt)*dt;s.onc=!!cfg.oncoming&&s.d<-.5&&Math.abs(s.d)<HALF;
    if(!s.crashed&&s.vt>cfg.fastV)s.score+=dt*s.vt*.5*(1+s.combo*.25)*(s.onc?2:1);
    if(s.combo>0){s.comboT-=dt;if(s.comboT<=0)s.combo=0}
    if(s.score>s.best)s.best=Math.round(s.score);
    s.msgT=Math.max(0,s.msgT-dt);s.shake=Math.max(0,s.shake-dt*1.8);if(s.started&&s.kmh>20)s.hintT+=dt;
    // частицы от машины
    const fx=Math.sin(s.psi),fz=-Math.cos(s.psi),rx=-fz,rz=fx,bx=s.x-fx*pg.L*.5,bz=s.z-fz*pg.L*.5;
    if(s.nitroOn)for(const sg of[-1,1])emit(bx+rx*sg*.45,gy+.38,bz+rz*sg*.45,-fx*6+(Math.random()-.5),Math.random()*.6,-fz*6+(Math.random()-.5),.22,.35,.65,1,0);
    if((s.slip>.12||keys.h)&&s.kmh>30&&Math.random()<.7)for(const sg of[-1,1])emit(bx+rx*sg*.8+fx*.9,gy+.15,bz+rz*sg*.8+fz*.9,(Math.random()-.5)*1.5,.6+Math.random(),(Math.random()-.5)*1.5,.7,.33,.33,.35,-1);
    if(s.surf<1&&s.kmh>12&&Math.random()<.8)emit(bx+(Math.random()-.5)*1.6,gy+.2,bz,(Math.random()-.5)*2,.8+Math.random()*1.5,(Math.random()-.5)*2,.9,.42,.36,.26,-1)}
  function sync(t,dt,wd,hh){const s=st,pg=w.pg,sS=s.s,gy=groundY(sS,s.d),m=dcx(sS),psiR=Math.atan(m);
    const base=Math.floor(sS/SEG);if(base!==w.base){w.base=base;w.root.position.z=-base*SEG;w.strips.forEach(q=>q.userData.up(base));cfg.populate(w,base,(a,b)=>pt(a,b,base*SEG),groundY)}
    cfg.tick(w,s,(a,b)=>pt(a,b,0),groundY);
    w.car.position.set(s.x,gy,s.z);w.car.rotation.set(Math.atan(dhy(sS))*Math.cos(s.psi-psiR),-s.psi,0);
    s.roll+=(clamp(s.ay*C.rollK,-.1,.1)-s.roll)*Math.min(1,dt*7);s.pitch+=(clamp(s.ax*C.pitchK,-.06,.06)-s.pitch)*Math.min(1,dt*7);
    s.heave=s.surf<1?Math.sin(t*37)*.025*Math.min(1,s.kmh/40):Math.sin(t*23)*.004*Math.min(1,s.kmh/120);
    w.body.rotation.set(s.pitch,0,s.roll);w.body.position.y=s.heave;s.spin+=s.u/C.rw*dt;
    w.wh.forEach(([piv,ms],i)=>{piv.rotation.y=i<2?-s.steer*1.6:0;ms.rotation.x=-s.spin});
    w.ptail.emissiveIntensity=s.brk?3.2:cfg.night?1.3:.2;
    for(const c of s.cars){const p=pt(c.s,c.d,0);c.mesh.position.set(p.x,p.y,p.z);c.mesh.rotation.set(p.pitch*c.dir,p.yaw+(c.dir<0?Math.PI:0)-c.yawOff,0)}
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
    // камера
    const cam=w.cam,sp=Math.hypot(s.u,s.v),k=Math.min(1,sp/cfg.vtop);s.camYaw+=(s.psi-s.camYaw)*(1-Math.exp(-dt*(camMode===1?40:4.5)));
    const cy=s.camYaw,cfx=Math.sin(cy),cfz=-Math.cos(cy),pfx=Math.sin(s.psi),pfz=-Math.cos(s.psi);
    if(camMode===1){const hd=cfg.player.hood;cam.position.set(s.x+pfx*hd[0],gy+hd[1]+s.heave,s.z+pfz*hd[0]);V1.set(s.x+pfx*30,hy(sS+30)+1,s.z+pfz*30)}
    else{const dist=(camMode===2?11:6.4)+k*1.4+(pg.L-4.5),hgt=(camMode===2?4.8:2.25)+(pg.H-1.2)*.75,czx=s.x-cfx*dist,czz=s.z-cfz*dist;
      cam.position.set(czx,Math.max(gy,hy(-czz))+hgt,czz);V1.set(s.x+cfx*7,gy+pg.H*.6+.4,s.z+cfz*7)}
    const sh=s.shake*.35+k*k*.02+(s.surf<1?.05*k:0)+(s.nitroOn?.03:0);cam.position.x+=(Math.random()-.5)*sh;cam.position.y+=(Math.random()-.5)*sh;
    s.fov+=(62+k*17+(s.nitroOn?8:0)-s.fov)*Math.min(1,dt*4);cam.fov=s.fov;cam.aspect=wd/hh;cam.updateProjectionMatrix();cam.lookAt(V1);cam.rotateZ(clamp(-s.ay*.0035,-.05,.05));
    w.sky.position.copy(cam.position);w.dl.position.copy(w.car.position).addScaledVector(w.sunDir,170);w.dl.target.position.copy(w.car.position);
    if(w.spot){w.spot.position.set(s.x+pfx*1.6,gy+.85,s.z+pfz*1.6);w.spot.target.position.set(s.x+pfx*42,hy(sS+42)+.2,s.z+pfz*42)}}
  function hud(wd,hh,t){const s=st,f='"Segoe UI",sans-serif',fs=clamp(Math.min(hh*.027,wd*.021),12,22),pl=(x,y,a,b)=>{g.fillStyle='rgba(0,0,0,.58)';rr(x,y,a,b,10);g.fill()};
    g.textBaseline='middle';g.shadowBlur=0;
    const rows=[['Очки',Math.round(s.score).toLocaleString('ru-RU')],['Рекорд',Math.round(s.best).toLocaleString('ru-RU')],['Обогнал',String(s.passed)],['Путь',(s.dist/1000).toFixed(1)+' км']];
    const pw=fs*12.5,lh=fs*1.55,ph=lh*rows.length+fs*.7,px=wd-pw-10;pl(px,10,pw,ph);
    rows.forEach((r,i)=>{const y=10+fs*.35+lh*(i+.5);g.textAlign='left';g.font='400 '+fs+'px '+f;g.fillStyle='#c5cbd3';g.fillText(r[0],px+fs*.8,y);g.textAlign='right';g.font='700 '+fs+'px '+f;g.fillStyle='#fff';g.fillText(r[1],px+pw-fs*.8,y)});
    let ey=10+ph+8;const tag=(txt,c)=>{g.font='700 '+fs+'px '+f;const tw=g.measureText(txt).width+fs*1.6;pl(wd-tw-10,ey,tw,lh*1.1);g.textAlign='center';g.fillStyle=c;g.fillText(txt,wd-10-tw/2,ey+lh*.55);ey+=lh*1.1+8};
    if(s.combo>1)tag('Серия ×'+s.combo,col(.85));if(s.onc&&s.vt>cfg.fastV&&!s.crashed)tag('Встречка ×2','#ffd34d');
    const ha=s.crashed?0:clamp(1-(s.hintT-9)/2,0,1);
    if(ha>0){const tk=['↑ W газ','↓ S тормоз и назад','← → руль','Пробел ручник','Shift нитро','C вид','Enter заново'],mw=Math.max(fs*9,px-30-fs*1.6);g.font='400 '+fs*.92+'px '+f;
      const ls=[];let cur_='';for(const k of tk){const nx=cur_?cur_+'  ·  '+k:k;if(cur_&&g.measureText(nx).width>mw){ls.push(cur_);cur_=k}else cur_=nx}ls.push(cur_);
      const bw=Math.max(...ls.map(l=>g.measureText(l).width))+fs*1.6;g.globalAlpha=ha;pl(10,44,bw,ls.length*lh+fs*.6);g.textAlign='left';g.fillStyle='#fff';ls.forEach((l,i)=>g.fillText(l,10+fs*.8,44+fs*.3+lh*(i+.5)));g.globalAlpha=1}
    // спидометр
    const R=clamp(Math.min(hh*.15,wd*.12),66,122),gx=wd-R-20,gyy=hh-R-18,a0=Math.PI*.75,a1=Math.PI*2.25,rp=clamp(s.rpm/C.red,0,1);
    g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(gx,gyy,R+9,0,7);g.fill();g.lineCap='butt';g.lineWidth=R*.11;
    g.strokeStyle='rgba(255,255,255,.2)';g.beginPath();g.arc(gx,gyy,R*.9,a0,a1);g.stroke();g.strokeStyle='rgba(255,70,60,.75)';g.beginPath();g.arc(gx,gyy,R*.9,a0+(a1-a0)*.9,a1);g.stroke();
    g.strokeStyle=rp>.9?'#ff5548':col(.8);g.beginPath();g.arc(gx,gyy,R*.9,a0,a0+(a1-a0)*rp);g.stroke();
    g.textAlign='center';g.fillStyle='#fff';g.font='700 '+R*.56+'px '+f;g.fillText(String(Math.round(s.kmh)),gx,gyy-R*.14);
    g.font='400 '+Math.max(11,R*.16)+'px '+f;g.fillStyle='#c5cbd3';g.fillText('км/ч',gx,gyy+R*.24);
    g.font='700 '+R*.24+'px '+f;g.fillStyle=col(.85);g.fillText(s.gear<0?'R':s.kmh<1&&!keys.u?'N':String(s.gear+1),gx,gyy+R*.5);
    const bw2=R*.9,by=gyy+R*.74;g.fillStyle='rgba(255,255,255,.2)';rr(gx-bw2/2,by,bw2,R*.09,R*.045);g.fill();if(s.nitro>.01){g.fillStyle=s.nitroOn?'#9fe6ff':'#39c6ff';rr(gx-bw2/2,by,bw2*s.nitro,R*.09,R*.045);g.fill()}
    // сообщения по центру
    const box=(ls,y,big)=>{const sz=ls.map((l,i)=>fs*(i?1:big));let bw=0;ls.forEach((l,i)=>{g.font=(i?'400 ':'800 ')+sz[i]+'px '+f;bw=Math.max(bw,g.measureText(l).width)});const bh=sz.reduce((a,b)=>a+b*1.4,0)+fs*.8;bw=Math.min(wd-24,bw+fs*2.4);
      pl(wd/2-bw/2,y,bw,bh);let yy=y+fs*.4;g.textAlign='center';ls.forEach((l,i)=>{g.font=(i?'400 ':'800 ')+sz[i]+'px '+f;g.fillStyle=i?'#e6e9ee':'#fff';g.fillText(l,wd/2,yy+sz[i]*.7,wd-48);yy+=sz[i]*1.4})};
    if(s.crashed)box(['Авария','Очки: '+Math.round(s.score).toLocaleString('ru-RU')+' · рекорд: '+Math.round(s.best).toLocaleString('ru-RU'),'Enter или ↑ — поехали заново'],hh*.3,2.2);
    else if(!s.started)box(['Жми ↑ или W','Машина твоя: газ, тормоз и руль на стрелках'],hh*.3,2);
    else if(s.msgT>0){g.globalAlpha=Math.min(1,s.msgT*2.5);box([s.msg],hh*.16,1.5);g.globalAlpha=1}
    g.textAlign='start';g.textBaseline='alphabetic'}
  return {name:cfg.name,grp:'Рандом и игры',game:true,three:true,get st(){return st},get world(){return w},dcx,
    enter(){if(!r3init())return;if(!w)build();reset()},
    restart(){if(w&&st&&(st.crashed?st.crashT>.7:true))reset()},gas(){if(w&&st&&st.crashed&&st.crashT>1.2)reset()},
    nextCam(){camMode=(camMode+1)%3;LS.set('cam_'+cfg.id,camMode);if(st)say(['Вид: сзади','Вид: с капота','Вид: издалека'][camMode],1.2)},
    draw(wd,hh,t,dt){if(!w||!st)return;step(Math.min(dt,.05),t);sync(t,dt,wd,hh);
      const tw=Math.max(2,Math.round(wd*dpr*glScale)),tH=Math.max(2,Math.round(hh*dpr*glScale));if(g3.width!==tw||g3.height!==tH)R3.setSize(tw,tH,false);
      R3.render(w.sc,w.cam);hud(wd,hh,t)}}}
return [make(NY),make(RU)]})();
const VIZX=[VIZRND,...DRIVE];

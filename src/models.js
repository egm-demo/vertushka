/* --- настоящие 3D-модели машин игрока (GLB, встроены в файл) --- */
const WR={w210n:/^Mesheswheel00[345]wheel00[456]1Mtl$/,a8n:/^(wheel_b|torm_disk_a8|mesh_spec)$/,w210:/^tire1$|Tire_Hub|Tire_Disk/,g:/Mesh(rim|tire|Disk)/,vette:/Tire_Hub|Tire_Disk|Wheel1A/,cay:/^material$|^tire$|^phong16$/,a8:/^material_1[012]$/},
  LR={w210n:/^(L1Mtl|Meshesheadlights00021Mtl|Meshestaillights00011Mtl|B1Mtl)$/,a8n:/^(light_glass|lights_back_on|lights_glass)$/,w210:/Lights/,g:/^Light|red_glass/,vette:/Lights/,cay:/^light$|^Light_R$/,a8:/^$/};
const MCFG={w210:{f:'w210n',paint:/^Paint1Mtl/,glassN:/windscreen/i,glass:/^(Meshesdoorlfok0101Mtl|Meshesbodyshellbodyshell0051Mtl)$/},w210c:{f:'w210n',paint:/^Paint1Mtl/,glassN:/windscreen/i,glass:/^(Meshesdoorlfok0101Mtl|Meshesbodyshellbodyshell0051Mtl)$/,open:.62},g:{f:'g',paint:/^carpaint$/},
  c6:{f:'vette',paint:/Base1/},cay:{f:'cay',paint:/^car.*int$/},a8:{f:'a8n',paint:/^body$/,glass:/^(vehicle_generic_glasswindows2|windows_int)$/}};
// разрезать меш на части по треугольникам: key(cx,cy,cz)-> ключ или null; геометрия в координатах корня (g)
function splitMesh(o,key){const ge=o.geometry,idx=ge.index?ge.index.array:null,n=idx?idx.length:ge.attributes.position.count,mw=o.matrixWorld,nm=new T.Matrix3().getNormalMatrix(mw);
  const P=ge.attributes.position,v=new T.Vector3(),wp=new Float32Array(P.count*3);for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(mw);wp[i*3]=v.x;wp[i*3+1]=v.y;wp[i*3+2]=v.z}
  const parts={};for(let t=0;t<n;t+=3){const a=idx?idx[t]:t,b=idx?idx[t+1]:t+1,c=idx?idx[t+2]:t+2;
    const k=key((wp[a*3]+wp[b*3]+wp[c*3])/3,(wp[a*3+1]+wp[b*3+1]+wp[c*3+1])/3,(wp[a*3+2]+wp[b*3+2]+wp[c*3+2])/3);if(k===null)continue;(parts[k]||(parts[k]=[])).push(a,b,c)}
  const out={};for(const k in parts){const L=parts[k],g2=new T.BufferGeometry();
    for(const nmK in ge.attributes){const A=ge.attributes[nmK],s=A.itemSize;if(nmK==='tangent')continue;const f=new Float32Array(L.length*s);
      for(let j=0;j<L.length;j++){const i=L[j];if(nmK==='position'){f[j*3]=wp[i*3];f[j*3+1]=wp[i*3+1];f[j*3+2]=wp[i*3+2];continue}
        if(nmK==='normal'){v.fromBufferAttribute(A,i).applyMatrix3(nm).normalize();f[j*3]=v.x;f[j*3+1]=v.y;f[j*3+2]=v.z;continue}
        f[j*s]=A.getX(i);if(s>1)f[j*s+1]=A.getY(i);if(s>2)f[j*s+2]=A.getZ(i);if(s>3)f[j*s+3]=A.getW(i)}
      g2.setAttribute(nmK,new T.BufferAttribute(f,s))}
    g2.computeBoundingBox();out[k]=g2}return out}
let fireTex=null;
function mkFire(){if(fireTex)return fireTex;const c=document.createElement('canvas');c.width=32;c.height=128;const x=c.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,'rgba(140,190,255,1)');gr.addColorStop(.18,'rgba(90,120,255,.95)');gr.addColorStop(.4,'rgba(255,150,60,.8)');gr.addColorStop(.75,'rgba(255,70,20,.35)');gr.addColorStop(1,'rgba(255,40,0,0)');
  x.fillStyle=gr;x.fillRect(0,0,32,128);const g2=x.createLinearGradient(0,0,32,0);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(.5,'rgba(0,0,0,0)');g2.addColorStop(1,'rgba(0,0,0,1)');
  x.globalCompositeOperation='destination-out';x.fillStyle=g2;x.fillRect(0,0,32,128);fireTex=new T.CanvasTexture(c);return fireTex}
const mdlP={};
function loadMdl(f){if(mdlP[f])return mdlP[f];const b=(window.VT_MODELS||{})[f];
  if(!b||!T.GLTFLoader||!T.MeshoptDecoder)return mdlP[f]=Promise.resolve(null);
  return mdlP[f]=T.MeshoptDecoder.ready.then(()=>fetch('data:application/octet-stream;base64,'+b)).then(r=>r.arrayBuffer()).then(buf=>new Promise(res=>{
    const l=new T.GLTFLoader();l.setMeshoptDecoder(T.MeshoptDecoder);l.parse(buf,'',g=>res(g.scene),e=>{console.warn('model '+f,e);res(null)})})).catch(e=>{console.warn('model '+f,e);return null})}
function cutTop(o,y0){// убрать крышу: треугольники выше линии окон (в координатах машины)
  o.updateMatrixWorld(true);const v=new T.Vector3();
  o.traverse(m=>{if(!m.isMesh)return;const ge=m.geometry.clone(),p=ge.attributes.position,mw=m.matrixWorld,idx=ge.index?ge.index.array:null,n=idx?idx.length:p.count,keep=[];
    const Y=i=>v.fromBufferAttribute(p,i).applyMatrix4(mw).y;
    for(let t=0;t<n;t+=3){const a=idx?idx[t]:t,b=idx?idx[t+1]:t+1,c=idx?idx[t+2]:t+2;if(Math.max(Y(a),Y(b),Y(c))<y0)keep.push(a,b,c)}
    ge.setIndex(keep);m.geometry=ge})}
function fitMdl(src,pg,cf){const g=new T.Group(),m=src.clone(true);g.add(m);m.updateMatrixWorld(true);
  const bb=new T.Box3().setFromObject(m),sz=bb.getSize(new T.Vector3());if(sz.x>sz.z)m.rotation.y=Math.PI/2;m.rotation.y+=cf.ry===undefined?Math.PI:cf.ry;
  m.updateMatrixWorld(true);bb.setFromObject(m);bb.getSize(sz);pg.geo.computeBoundingBox();const pb=pg.geo.boundingBox,L=pb.max.z-pb.min.z;
  m.scale.multiplyScalar(L/sz.z);m.updateMatrixWorld(true);bb.setFromObject(m);const c=bb.getCenter(new T.Vector3());
  m.position.x-=c.x;m.position.z+=(pb.max.z+pb.min.z)/2-c.z;m.position.y-=bb.min.y;g.updateMatrixWorld(true);
  if(cf.open){bb.setFromObject(m);cutTop(m,bb.min.y+(bb.max.y-bb.min.y)*cf.open)}
  const paint=[];m.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.frustumCulled=false;const mt=o.material;
    if(mt&&((cf.glass&&cf.glass.test(mt.name||''))||(cf.glassN&&cf.glassN.test(o.name+' '+(o.parent&&o.parent.name||''))))){const gm=mt.clone();gm.map=null;gm.color=new T.Color(0x0a0d12);gm.transparent=true;gm.opacity=.28;gm.depthWrite=false;gm.metalness=0;gm.roughness=.05;gm.envMapIntensity=1;o.material=gm;o.renderOrder=2;o.castShadow=false}
    else if(mt&&cf.paint.test(mt.name||''))paint.push(o);else if(mt&&mt.transparent&&/glass|Translucent/i.test(mt.name||'')){o.renderOrder=2;mt.depthWrite=false}});
  g.userData.paint=paint;g.updateMatrixWorld(true);
  const wr=WR[cf.f],lr=LR[cf.f],wl=[],ll=[];m.traverse(o=>{if(!o.isMesh||!o.material)return;const nm=o.material.name||'';if(wr.test(nm))wl.push(o);else if(lr.test(nm))ll.push(o)});
  // колёса: 4 группы по четвертям
  const zc=(pb.max.z+pb.min.z)/2,whs=[[],[],[],[]],bb4=[0,1,2,3].map(()=>new T.Box3());
  for(const o of wl){const pr=splitMesh(o,(x,y,z)=>(z<zc?0:2)+(x<0?0:1));for(const k in pr){whs[k].push([pr[k],o.material]);bb4[k].union(pr[k].boundingBox)}o.parent.remove(o)}
  g.userData.wheels=whs.map((L,k)=>{if(!L.length)return null;const c=bb4[k].getCenter(new T.Vector3()),sz=bb4[k].getSize(new T.Vector3()),piv=new T.Group(),sp=new T.Group();
    c.y=Math.max(c.y,sz.y/2);piv.position.copy(c);piv.add(sp);for(const [ge,mt] of L){ge.translate(-c.x,-c.y,-c.z);const ms=new T.Mesh(ge,mt);ms.castShadow=true;ms.frustumCulled=false;sp.add(ms)}return [piv,sp]});
  // фары и фонари: перед светится тёплым белым, зад — красным (ярче при торможении)
  const fl=[],rl=[],fb=new T.Box3(),rb=new T.Box3();
  const LZ=(pb.max.z-pb.min.z)*.2,LY=pg.H*.75;for(const o of ll){const pr=splitMesh(o,(x,y,z)=>y>LY?'m':z<pb.min.z+LZ?'f':z>pb.max.z-LZ?'r':'m'),mt=o.material;if(pr.m){const q=new T.Mesh(pr.m,mt);g.add(q)}
    if(pr.f){const fm=mt.clone();fm.emissive=new T.Color(0xfff0d8);fm.emissiveMap=null;fm.emissiveIntensity=1;const q=new T.Mesh(pr.f,fm);g.add(q);fl.push(fm);fb.union(pr.f.boundingBox)}
    if(pr.r){const rm=mt.clone();rm.emissive=new T.Color(0xff2412);rm.emissiveMap=mt.map||null;rm.emissiveIntensity=1;const q=new T.Mesh(pr.r,rm);g.add(q);rl.push(rm);rb.union(pr.r.boundingBox)}
    o.parent.remove(o)}
  if(fb.isEmpty()){fb.set(new T.Vector3(-pg.W*.36,pg.H*.42,pb.min.z+.05),new T.Vector3(pg.W*.36,pg.H*.5,pb.min.z+.15))}
  if(rb.isEmpty()){rb.set(new T.Vector3(-pg.W*.38,pg.H*.5,pb.max.z-.15),new T.Vector3(pg.W*.38,pg.H*.58,pb.max.z-.05))}
  const spr=(col,x,y,z,sc)=>{const s=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));s.position.set(x,y,z);s.scale.setScalar(sc);s.renderOrder=3;g.add(s);return s};
  const hx=Math.max(.35,fb.max.x-.17),hy_=(fb.min.y+fb.max.y)/2,hz=fb.min.z+.02,tx=Math.max(.35,rb.max.x-.15),ty=(rb.min.y+rb.max.y)/2,tz=rb.max.z-.02;
  const hg=[spr(0xfff2dd,-hx,hy_,hz-.05,1.1),spr(0xfff2dd,hx,hy_,hz-.05,1.1),spr(0xcfe2ff,-hx,hy_,hz-.08,.35),spr(0xcfe2ff,hx,hy_,hz-.08,.35)],tg=[spr(0xff1a0a,-tx,ty,tz+.04,.75),spr(0xff1a0a,tx,ty,tz+.04,.75)];
  // световое пятно фар на асфальте
  const pool=new T.Mesh(new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:glowTex,color:0xffe9c8,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,opacity:.5,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));
  pool.scale.set(pg.W*2.6,1,15);pool.position.set(0,.04,pb.min.z-8.5);g.add(pool);
  // пламя нитро из выхлопных труб
  const fm=new T.MeshBasicMaterial({map:mkFire(),transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,side:T.DoubleSide}),fire=[];
  for(const sx of[-1,1]){const f=new T.Group();for(let i=0;i<3;i++){const pl=new T.Mesh(new T.PlaneGeometry(.26,1).translate(0,-.5,0).rotateX(-Math.PI/2),fm);pl.rotation.z=i*Math.PI/3;f.add(pl)}
    f.position.set(sx*pg.W*.25,.32,pb.max.z+.02);f.visible=false;g.add(f);fire.push(f)}
  const fl2=new T.PointLight(0xff7a30,0,7,2);fl2.position.set(0,.5,pb.max.z+.6);g.add(fl2);
  g.userData.fx={fl,rl,hg,tg,pool,fire,fl2};return g}
w.mdlEmpty=new T.BufferGeometry();
w.useMdl=()=>{const id=w.pd.id,cf=MCFG[id];if(w.mdl){w.body.remove(w.mdl);w.mdl=null}
  if(!cf)return;const pg=w.pg,tok=w.mdlTok=(w.mdlTok||0)+1;
  const put=g=>{if(!g||tok!==w.mdlTok)return;w.mdl=g;w.body.add(g);
    w.body.geometry=w.mdlEmpty;w.mdlPaint();if(w.wh)w.wh.forEach(([p])=>w.car.remove(p));w.wh=[];
    for(const q of g.userData.wheels)if(q){w.car.add(q[0]);w.wh.push(q)}
    if(w.wh.length!==4){w.wh.forEach(([p])=>w.car.remove(p));w.wh=[];w.mkWh()}w.eyeO=null;if(g.userData.eye)w.eyeO=g.userData.eye;else setTimeout(()=>{try{w.fitEye();g.userData.eye=w.eyeO}catch(e){console.warn('eye',e)}},0)};
  if(w.fitC[id])return put(w.fitC[id]);
  loadMdl(cf.f).then(src=>{if(!src||tok!==w.mdlTok)return;const g=fitMdl(src,pg,cf);g.userData.id=id;w.fitC[id]=g;put(g)})};
w.fitC={};
// в салоне: тёмный интерьер (Audi — полностью чёрный), без светлых бликов, чтобы видно было дорогу
const CDARK={a8:.1,cay:.35,g:.3,w210:.45,w210c:.45,c6:.45};
w.cabDark=on=>{const g=w.mdl;if(!g)return;const id=g.userData.id,cf=MCFG[id]||{},k=CDARK[id]||.45;if(g.userData.dk===on)return;g.userData.dk=on;
  g.traverse(o=>{if(!o.isMesh)return;for(const mt of Array.isArray(o.material)?o.material:[o.material]){if(!mt||!mt.color)continue;
    if(mt.userData.c0===undefined){mt.userData.c0=mt.color.getHex();mt.userData.r0=mt.roughness;mt.userData.e0=mt.envMapIntensity}
    const paint=cf.paint&&cf.paint.test(mt.name||''),glass=mt.transparent||mt.opacity<1;
    if(on&&!paint&&!glass){const c=new T.Color(mt.userData.c0),L=c.r*.3+c.g*.59+c.b*.11,f=id==='a8'?k:Math.min(1,k/Math.max(.2,L));c.multiplyScalar(f);if(id==='a8')c.lerp(new T.Color(0x0b0b0d),.6);mt.color.copy(c);mt.roughness=Math.max(mt.userData.r0??.5,.55);if(mt.envMapIntensity!==undefined)mt.envMapIntensity=(mt.userData.e0??1)*.35}
    else{mt.color.setHex(mt.userData.c0);if(mt.userData.r0!==undefined)mt.roughness=mt.userData.r0;if(mt.userData.e0!==undefined)mt.envMapIntensity=mt.userData.e0}}})};
// загрузка всего заранее: модели -> подгонка всех машин -> заливка текстур и шейдеров в видеокарту
w.preload=async(prog)=>{const ids=PCARS.map(p=>p.id).filter(id=>MCFG[id]),files=[...new Set(ids.map(id=>MCFG[id].f))],N=files.length+ids.length+2;let k=0;
  const tick=async(msg)=>{k++;prog(k/N,msg);await new Promise(r=>setTimeout(r,16))};
  await tick('Город и дорога');
  for(const f of files){await loadMdl(f);await tick('Модель: '+f)}
  for(const id of ids){const pd=PCARS.find(p=>p.id===id);if(!w.fitC[id]){const src=await loadMdl(MCFG[id].f);if(src){const pg=carGeo(pd.kind,true),g=fitMdl(src,pg,MCFG[id]);g.userData.id=id;w.fitC[id]=g}}await tick(pd.name)}
  // в видеокарту: временно ставим все машины в сцену и компилируем
  const tmp=new T.Group();for(const id in w.fitC){const g=w.fitC[id];if(g.parent)continue;g.userData.tmpWh=[];for(const q of g.userData.wheels)if(q){g.add(q[0]);g.userData.tmpWh.push(q[0])}tmp.add(g)}
  w.sc.add(tmp);tmp.position.copy(w.car.position);
  try{w.sc.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];for(const mt of ms)for(const key of['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap','alphaMap'])if(mt[key])R3.initTexture(mt[key])});
    R3.compile(w.sc,w.cam);if(w.cabSc)R3.compile(w.cabSc,w.cabCam||w.cam);R3.render(w.sc,w.cam)}catch(e){console.warn('precompile',e)}
  w.sc.remove(tmp);for(const g of [...tmp.children]){tmp.remove(g);for(const p of g.userData.tmpWh||[])g.remove(p);delete g.userData.tmpWh}
  await tick('Видеокарта');prog(1,'Готово')};
// огни/нитро каждый кадр
w.fxUpd=(s,dt,night)=>{const fx=w.mdl&&w.mdl.userData.fx;if(!fx)return;const t=performance.now()/1000,br=!!s.brk;
  for(const m of fx.fl)m.emissiveIntensity=night?1.5:.25;for(const m of fx.rl)m.emissiveIntensity=br?3.4:night?1.2:.15;
  const cv=(w._cv||(w._cv=new T.Vector3())).copy(w.cam.position);w.car.worldToLocal(cv);const front=cv.z<-w.pg.L*.3,fa=front?Math.min(1,(-cv.z-w.pg.L*.3)/3):0;for(const sp of fx.hg){sp.visible=night&&front&&camMode!==1&&camMode!==2;sp.material.opacity=fa}fx.pool.visible=night&&camMode!==1;fx.pool.material.opacity=.42+Math.sin(t*1.7)*.02;
  for(const sp of fx.tg){sp.visible=night||br;sp.material.opacity=br?1:.45;sp.scale.setScalar(br?1.25:.75)}
  const on=!!s.nitroOn&&camMode!==1;fx.fl2.intensity=on?2.5+Math.random()*2:0;
  fx.fire.forEach((f,i)=>{f.visible=on;if(on){const k=.75+Math.random()*.5;f.scale.set(k,k,1.1+Math.random()*.9+Math.min(1,s.kmh/200)*.6);f.rotation.z=Math.random()*3}})};
w.mdlPaint=()=>{if(!w.mdl)return;const pm=w.ppaint();pm.envMapIntensity=.7;w.mdl.userData.paint.forEach(o=>o.material=pm);w.mdl.traverse(o=>{if(o.isMesh&&o.material&&o.material!==pm&&o.material.envMapIntensity!==undefined)o.material.envMapIntensity=.6})};

// вид из салона: показываем настоящий салон модели, из самодельного оставляем только руль и руки
w.cabHide=on=>{if(!w.cab||!w.sw)return;const keep=w.sw.parent,dy=w.pd.cab.dy,E=w.eyeO;
  // руль и руки едут вместе с глазом водителя модели
  if(on&&E)w.cab.position.set(E[0]+.37,E[1]-1.08,E[2]-.38);else w.cab.position.set(0,dy,0);
  if(!w.inL){w.inL=new T.PointLight(0xffe2c4,0,2.6,1.2);w.car.add(w.inL);w.inL2=new T.PointLight(0x9fb4ff,0,2.2,1.2);w.car.add(w.inL2)}
  if(on&&E){w.inL.position.set(E[0]+.25,E[1]-.12,E[2]-.55);w.inL2.position.set(0,E[1]+.05,E[2]+.2)}w.inL.intensity=on?1.1:0;w.inL2.intensity=on?.7:0;
  w.cabDark(on);if(w._cabOn===on)return;w._cabOn=on;for(const c of w.cab.children)if(c!==keep&&!(w.arms||[]).includes(c))c.visible=!on};

w.fitEye=()=>{const g=w.mdl;if(!g)return null;const pg=w.pg,X=-pg.W*.205;g.updateMatrixWorld(true);const inv=new T.Matrix4().copy(g.matrixWorld).invert();
  // точки модели в полосе водителя (x≈X±.18) -> карта высот: потолок и сиденье/торпедо по z
  const B=48,zmin=-pg.L/2,zs=pg.L/B,lo=new Float32Array(B).fill(9),hi=new Float32Array(B).fill(-9),v=new T.Vector3();
  g.traverse(o=>{if(!o.isMesh)return;const nm=o.material&&o.material.name||'';if(/glass/i.test(nm))return;const P=o.geometry.attributes.position,mw=new T.Matrix4().multiplyMatrices(inv,o.matrixWorld),st=Math.max(1,P.count/6000|0);
    for(let i=0;i<P.count;i+=st){v.fromBufferAttribute(P,i).applyMatrix4(mw);if(Math.abs(v.x-X)>.16)continue;const b=Math.floor((v.z-zmin)/zs);if(b<0||b>=B)continue;if(v.y>pg.H*.82)hi[b]=Math.max(hi[b],v.y);}});
  // крыша над головой: минимальная высота среди верхних точек в середине машины
  let roof=9;for(let b=Math.floor(B*.4);b<Math.floor(B*.62);b++)if(hi[b]>0)roof=Math.min(roof,hi[b]);if(roof>8)roof=pg.H;
  const y=Math.min(roof-.1,pg.H*.84),z=-pg.L*.02;w.eyeO=[X,+y.toFixed(3),+z.toFixed(3)];return {roof,y,z}};

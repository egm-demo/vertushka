/* --- настоящие 3D-модели машин игрока (GLB, встроены в файл) --- */
const MCFG={w210:{f:'w210',paint:/Metallic_Grey/},w210c:{f:'w210',paint:/Metallic_Grey/,open:.62},g:{f:'g',paint:/^carpaint$/},
  c6:{f:'vette',paint:/Base1/},cay:{f:'cay',paint:/^car.*int$/},a8:{f:'a8',paint:/^Meshpart17Mtl$/}};
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
    if(mt&&cf.paint.test(mt.name||''))paint.push(o);else if(mt&&mt.transparent&&/glass|Translucent/i.test(mt.name||'')){o.renderOrder=2;mt.depthWrite=false}});
  g.userData.paint=paint;return g}
w.mdlEmpty=new T.BufferGeometry();
w.useMdl=()=>{const id=w.pd.id,cf=MCFG[id];if(w.mdl){w.body.remove(w.mdl);w.mdl=null}
  if(!cf)return;const pg=w.pg,tok=w.mdlTok=(w.mdlTok||0)+1;
  loadMdl(cf.f).then(src=>{if(!src||tok!==w.mdlTok)return;const g=fitMdl(src,pg,cf);g.userData.id=id;w.mdl=g;w.body.add(g);
    w.body.geometry=w.mdlEmpty;w.mdlPaint();if(w.wh)w.wh.forEach(([p])=>w.car.remove(p));w.wh=[]})};
w.mdlPaint=()=>{if(!w.mdl)return;const pm=w.ppaint();pm.envMapIntensity=.7;w.mdl.userData.paint.forEach(o=>o.material=pm);w.mdl.traverse(o=>{if(o.isMesh&&o.material&&o.material!==pm&&o.material.envMapIntensity!==undefined)o.material.envMapIntensity=.6})};

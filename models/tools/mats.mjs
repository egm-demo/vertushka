
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import {MeshoptDecoder} from 'meshoptimizer';await MeshoptDecoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const doc=await io.read(process.argv[2]);
const sc=doc.getRoot().listScenes()[0];const B=getBounds(sc);console.log('BB',B.min.map(v=>v.toFixed(2)),B.max.map(v=>v.toFixed(2)));
const R={};
for(const nd of doc.getRoot().listNodes()){const me=nd.getMesh();if(!me)continue;const W=nd.getWorldMatrix();
 for(const p of me.listPrimitives()){const mt=p.getMaterial();const k=mt?mt.getName():'?';const a=p.getAttribute('POSITION');const ix=p.getIndices();
  const r=R[k]||(R[k]={t:0,mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9],c:mt&&mt.getBaseColorFactor().slice(0,3).map(v=>v.toFixed(2)).join(','),tex:!!(mt&&mt.getBaseColorTexture()),e:mt&&mt.getEmissiveFactor().join(',')});
  r.t+=(ix?ix.getCount():a.getCount())/3;const v=[0,0,0];
  for(let i=0;i<a.getCount();i+=Math.max(1,a.getCount()/400|0)){a.getElement(i,v);const x=W[0]*v[0]+W[4]*v[1]+W[8]*v[2]+W[12],y=W[1]*v[0]+W[5]*v[1]+W[9]*v[2]+W[13],z=W[2]*v[0]+W[6]*v[1]+W[10]*v[2]+W[14];
   [x,y,z].forEach((q,j)=>{r.mn[j]=Math.min(r.mn[j],q);r.mx[j]=Math.max(r.mx[j],q)})}}}
for(const [k,r] of Object.entries(R).sort((a,b)=>b[1].t-a[1].t))console.log(k.replace('Porsche_CayenneTurboGTRewardRecycled_2022','P'),r.t|0,'c',r.c,r.tex?'T':'',r.e!=='0,0,0'?'E'+r.e:'',r.mn.map(v=>v.toFixed(2)).join(','),'|',r.mx.map(v=>v.toFixed(2)).join(','));

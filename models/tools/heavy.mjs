
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,simplify,dedup,prune} from '@gltf-transform/functions';import {MeshoptSimplifier} from 'meshoptimizer';
const [,,src,dst,thr,ratio]=process.argv;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);const doc=await io.read(src);
let n=0;for(const me of doc.getRoot().listMeshes())for(const p of me.listPrimitives()){const ix=p.getIndices();const t=ix?ix.getCount()/3:0;
  if(t>+thr){for(const s of ['NORMAL','TANGENT','TEXCOORD_1']){const a=p.getAttribute(s);if(a)p.setAttribute(s,null)}n++}}
await MeshoptSimplifier.ready;
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:+ratio,error:0.004}),prune());
let tri=0;for(const me of doc.getRoot().listMeshes())for(const p of me.listPrimitives()){const ix=p.getIndices();tri+=ix?ix.getCount()/3:0}
await io.write(dst,doc);console.log('stripped',n,'tri',tri);

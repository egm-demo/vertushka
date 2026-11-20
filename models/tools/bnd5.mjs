
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const doc=await io.read(process.argv[2]);
const sc=doc.getRoot().listScenes()[0];console.log('ALL',JSON.stringify(getBounds(sc)));

const agg={};for(const n of doc.getRoot().listNodes()){const me=n.getMesh();if(!me)continue;const b=getBounds(n);for(const p of me.listPrimitives()){const mt=p.getMaterial();const k=mt?mt.getName():'?';const c=mt?mt.getBaseColorFactor().map(v=>+v.toFixed(2)):[];const inC=b.min[2]>-1.3&&b.max[2]<1.1&&b.max[1]<1.6&&b.min[1]>.3&&b.max[0]<.85&&b.min[0]>-.85;(agg[k]=agg[k]||{c,inC:0,out:0,nodes:new Set()});agg[k][inC?'inC':'out']++;if(inC)agg[k].nodes.add(n.getName().replace(/_caenka.*$/,''))}}
for(const k in agg)if(agg[k].inC)console.log(k,JSON.stringify(agg[k].c),agg[k].inC,agg[k].out,[...agg[k].nodes].slice(0,6).join(' '))
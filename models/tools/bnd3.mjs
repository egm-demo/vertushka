
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const doc=await io.read(process.argv[2]);
const sc=doc.getRoot().listScenes()[0];console.log('ALL',JSON.stringify(getBounds(sc)));
for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const b=getBounds(n);if(b.max[1]>1.3&&b.max[1]<2.1)console.log('TOP',n.getName(),b.min.map(v=>v.toFixed(2)).join(','),'|',b.max.map(v=>v.toFixed(2)).join(','),'P',JSON.stringify(n.getTranslation().map(v=>+v.toFixed(2))))}
for(const n of doc.getRoot().listNodes()){if(/glass_0$/.test(n.getName())){let p=n,ch=[];while(p){ch.push(p.getName()+':'+p.getTranslation().map(v=>+v.toFixed(2))+'/'+p.getRotation().map(v=>+v.toFixed(2))+'/'+p.getScale().map(v=>+v.toFixed(2)));p=p.listParents().find(q=>q.propertyType==='Node')}console.log('CH',ch.join(' <- '));break}}


import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const doc=await io.read(process.argv[2]);
const sc=doc.getRoot().listScenes()[0];console.log('ALL',JSON.stringify(getBounds(sc)));
for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const b=getBounds(n);if(b.max[1]>2.0||b.min[1]<-0.1||b.max[0]>1.2)console.log('STRAY',n.getName(),b.min.map(v=>v.toFixed(2)).join(','),'|',b.max.map(v=>v.toFixed(2)).join(','))}

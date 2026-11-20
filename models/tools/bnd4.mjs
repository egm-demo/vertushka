
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';import {MeshoptDecoder} from 'meshoptimizer';
await MeshoptDecoder.ready;const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});const doc=await io.read(process.argv[2]);
const sc=doc.getRoot().listScenes()[0];console.log('ALL',JSON.stringify(getBounds(sc)));
for(const n of doc.getRoot().listNodes()){if(!n.getMesh())continue;const nm=n.getName();if(/light|lamp|fari|optika|signal|Glow|Dalny|Blizh|stop|grill/i.test(nm)){const b=getBounds(n);console.log(nm,b.min.map(v=>v.toFixed(2)).join(','),'|',b.max.map(v=>v.toFixed(2)).join(','))}}
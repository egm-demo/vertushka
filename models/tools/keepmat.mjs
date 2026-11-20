
import {NodeIO,PropertyType} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,simplify,dedup,prune,meshopt,sparse} from '@gltf-transform/functions';import {MeshoptSimplifier,MeshoptEncoder} from 'meshoptimizer';
const [,,src,dst,ratio]=process.argv;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});const doc=await io.read(src);
await MeshoptSimplifier.ready;await MeshoptEncoder.ready;
await doc.transform(dedup({propertyTypes:[PropertyType.ACCESSOR,PropertyType.MESH,PropertyType.TEXTURE]}),weld(),simplify({simplifier:MeshoptSimplifier,ratio:+ratio,error:+(process.argv[5]||.0008)}),prune({keepLeaves:true}),sparse(),meshopt({encoder:MeshoptEncoder,level:'medium'}));
let tri=0;for(const me of doc.getRoot().listMeshes())for(const p of me.listPrimitives()){const ix=p.getIndices();tri+=ix?ix.getCount()/3:0}
await io.write(dst,doc);console.log('tri',tri,'mats',doc.getRoot().listMaterials().length);

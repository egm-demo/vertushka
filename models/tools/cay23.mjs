
import {NodeIO,PropertyType} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {getBounds,weld,simplify,dedup,prune,meshopt,sparse} from '@gltf-transform/functions';import {MeshoptSimplifier,MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
const [,,src,dst,ratio,err]=process.argv;
await MeshoptDecoder.ready;await MeshoptSimplifier.ready;await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});const doc=await io.read(src);
const R=doc.getRoot(),BAD=/(headlightframe_[LR]_\d|headlightglass|taillightglass|tailglass|intcarpet_caenka_(peredfari|optika)|signalstalk|_t_|_dmg|_off|aftermarket|arochka|balka|bumper_F_b|engine_i6|bastion|platestand_R_US|licenseplate|steer|_6pot|intcarpetBODY_caenka_glass_tinted)/;
let rm=0;for(const n of R.listNodes()){if(!n.getMesh())continue;const nm=n.getName();const b=getBounds(n);
  if(BAD.test(nm)||b.min[1]>1.85){n.dispose();rm++}}
// колёса: один комплект в центре -> 4 копии на ступицы
const W=R.listNodes().filter(n=>n.getMesh()&&/^caenka_(wheel|tire|brake_caliper_4pot)/.test(n.getName()));
const top=R.listNodes().find(n=>n.getName()==='caenka_body');
const hubs=[[.75,.33,1.43,1],[-.75,.33,1.43,-1],[.76,.33,-1.48,1],[-.76,.33,-1.48,-1]];
// узлы колёс живут под тем же родителем, что и кузов (body: rot -90 X, scale 100); переведём их в мировые через корень сцены
const sc=R.listScenes()[0];
for(const [x,y,z,s] of hubs){const g=doc.createNode('WHEEL_'+(z>0?'F':'R')+(s>0?'L':'R')).setTranslation([x,y,z]).setScale([s,1,1]);sc.addChild(g);
  for(const n of W){const c=doc.createNode(n.getName()+'_c').setMesh(n.getMesh());const M=n.getWorldMatrix();c.setMatrix(M);g.addChild(c)}}
for(const n of W)n.dispose();
await doc.transform(dedup({propertyTypes:[PropertyType.ACCESSOR,PropertyType.MESH]}),weld(),simplify({simplifier:MeshoptSimplifier,ratio:+ratio,error:+err}),prune({keepLeaves:false}),sparse(),meshopt({encoder:MeshoptEncoder,level:'medium'}));
let tri=0;for(const me of R.listMeshes())for(const p of me.listPrimitives()){const ix=p.getIndices();tri+=ix?ix.getCount()/3:0}
console.log('removed',rm,'tri',tri,'bounds',JSON.stringify(getBounds(sc)));await io.write(dst,doc);

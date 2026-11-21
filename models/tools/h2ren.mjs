
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';
await MeshoptDecoder.ready;await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});const doc=await io.read(process.argv[2]);
const MAP={'001':'Arm_1','002':'Arm_2','003':'Finger_1_1','004':'Finger_1_2','005':'Finger_1_3','006':'Tip_1','007':'Meta_2','008':'Meta_3','009':'Meta_4','010':'Meta_5','011':'Finger_2_1','012':'Finger_2_2','013':'Finger_2_3','014':'Finger_3_1','015':'Finger_3_2','016':'Finger_3_3','017':'Finger_4_1','018':'Finger_4_2','019':'Finger_4_3','020':'Finger_5_1','021':'Finger_5_2','022':'Finger_5_3'};
let k=0;const fa={};
for(const n of doc.getRoot().listNodes()){const m=n.getName().match(/^Bone\.(\d{3})_Armature\.00([01])$/);if(m&&MAP[m[1]]){const s=m[2]==='0'?'L':'R';const b=MAP[m[1]];n.setName(b+(b.startsWith('Finger')?'.'+s+'_'+m[1]:'.'+s));if(b==='Arm_2')fa[s]=n;k++}}
// кисть: новая кость на запястье, все пальцы под неё
for(const s in fa){const f=fa[s],ch=f.listChildren();const t=ch[0].getTranslation();const h=doc.createNode('Hand_1.'+s).setTranslation(t);f.addChild(h);for(const c of ch){f.removeChild(c);const ct=c.getTranslation();c.setTranslation([ct[0]-t[0],ct[1]-t[1],ct[2]-t[2]]);h.addChild(c)}}
// чёрная «обводка» (Material.002) не нужна
for(const me of doc.getRoot().listMeshes())for(const p of me.listPrimitives()){const mt=p.getMaterial();if(mt&&mt.getName()==='Material.002'){me.removePrimitive(p);p.dispose()}}
for(const a of doc.getRoot().listAnimations())a.dispose();
console.log('renamed',k);await io.write(process.argv[3],doc);
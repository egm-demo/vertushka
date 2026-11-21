
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';import {getBounds} from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);const doc=await io.read(process.argv[2]);
const wp=n=>{const m=n.getWorldMatrix();return [m[12],m[13],m[14]].map(v=>+v.toFixed(3))};
const pr=(n,d)=>{const c=n.listChildren();console.log(' '.repeat(d)+n.getName(),JSON.stringify(wp(n)),n.getMesh()?'MESH '+JSON.stringify(getBounds(n)):'',n.getSkin()?'SKIN':'');for(const x of c)pr(x,d+1)};
for(const n of doc.getRoot().listScenes()[0].listChildren())pr(n,0);
for(const m of doc.getRoot().listMaterials())console.log('MAT',m.getName(),!!m.getBaseColorTexture(),!!m.getNormalTexture(),m.getBaseColorFactor(),m.getAlphaMode());
for(const t of doc.getRoot().listTextures())console.log('TEX',t.getMimeType(),JSON.stringify(t.getSize()));

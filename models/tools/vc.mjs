
import {NodeIO} from '@gltf-transform/core';import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);const doc=await io.read(process.argv[2]);const R={};
for(const me of doc.getRoot().listMeshes())for(const p of me.listPrimitives()){const c=p.getAttribute('COLOR_0');const n=p.getMaterial()?.getName();if(!c||R[n])continue;
 const s=new Set();const v=[];for(let i=0;i<c.getCount();i+=Math.max(1,c.getCount()/50|0)){c.getElement(i,v);s.add(v.slice(0,3).map(x=>x.toFixed(2)).join(','))}R[n]=[...s].slice(0,3).join(' ')}
for(const k of ['mw210_main','mw210_interior','mw210_plastic2','mw210_intchrome','mw210_carpet','mw210_doorleather','mw210_intseats'])console.log(k,R[k]);

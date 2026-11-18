// dump glb structure: nodes, meshes, materials, bbox
import fs from 'fs';
const f=process.argv[2];const b=fs.readFileSync(f);
const jl=b.readUInt32LE(12);const j=JSON.parse(b.slice(20,20+jl).toString());
const acc=j.accessors;
let tri=0;
const mats=j.materials.map((m,i)=>{const p=m.pbrMetallicRoughness||{};return `${i}:${m.name} col=${(p.baseColorFactor||[]).map(v=>v.toFixed(2))} tex=${p.baseColorTexture?1:0} met=${p.metallicFactor} r=${p.roughnessFactor} a=${m.alphaMode||''} em=${m.emissiveFactor||''}`});
console.log('== ',f,'nodes',j.nodes.length,'meshes',j.meshes.length,'mats',j.materials.length,'tex',(j.textures||[]).length,'imgs',(j.images||[]).map(i=>j.bufferViews[i.bufferView].byteLength).join(','));
mats.forEach(m=>console.log('  M',m));
j.meshes.forEach((m,i)=>{m.primitives.forEach(p=>{const n=p.indices!=null?acc[p.indices].count/3:acc[p.attributes.POSITION].count/3;tri+=n;const a=acc[p.attributes.POSITION];
 console.log(`  mesh${i} ${m.name} mat=${p.material} tri=${n|0} min=${a.min.map(v=>v.toFixed(2))} max=${a.max.map(v=>v.toFixed(2))}`)})});
console.log('tri',tri|0);
const pr=(n,d)=>{const nd=j.nodes[n];console.log('  '.repeat(d)+'N'+n+' '+(nd.name||'')+(nd.mesh!=null?' mesh'+nd.mesh:'')+(nd.matrix?' M':'')+(nd.rotation?' r'+nd.rotation.map(v=>v.toFixed(2)):'')+(nd.translation?' t'+nd.translation.map(v=>v.toFixed(2)):'')+(nd.scale?' s'+nd.scale.map(v=>v.toFixed(3)):''));(nd.children||[]).forEach(c=>pr(c,d+1))};
j.scenes[0].nodes.forEach(n=>pr(n,0));

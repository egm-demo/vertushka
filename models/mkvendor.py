import re, pathlib
M = pathlib.Path(__file__).parent
V = M.parent / 'vendor'
src = (M / 'GLTFLoader.mjs').read_text(encoding='utf-8')
bgu = (M / 'BGU.mjs').read_text(encoding='utf-8')
mo = (M / 'meshopt_decoder.module.js').read_text(encoding='utf-8')
# imports from 'three' -> destructure global THREE
m = re.match(r"import \{([^}]*)\} from 'three';", src, re.S)
names = [n.strip() for n in m.group(1).split(',') if n.strip()]
src = src[m.end():]
src = src.replace("import { toTrianglesDrawMode } from '../utils/BufferGeometryUtils.js';", '')
src = src.replace('export { GLTFLoader };', 'THREE.GLTFLoader = GLTFLoader;')
# toTrianglesDrawMode from BGU
i = bgu.index('function toTrianglesDrawMode(')
j = bgu.index('\n}\n', i) + 3
ttd = bgu[i:j]
bm = re.match(r"import \{([^}]*)\} from 'three';", bgu, re.S)
bnames = [n.strip() for n in bm.group(1).split(',') if n.strip()]
allnames = sorted(set(names) | set(n for n in bnames if n in ttd))
mo = mo.replace('export { MeshoptDecoder };', 'THREE.MeshoptDecoder = MeshoptDecoder;')
out = '(function(){\nconst {' + ','.join(allnames) + '} = THREE;\n' + ttd + '\n' + src + '\n})();\n(function(){\n' + mo + '\n})();\n'
assert '</script' not in out
(V / 'gltf.js').write_text(out, encoding='utf-8', newline='\n')
print('vendor/gltf.js', len(out))

/* ---------- шейдеры (WebGL) ---------- */
const glc=$('#glc');let gl=null,glProg={},glBuf=null,glTexS=null,glTexP=null,glScale=1,glOK=true,palDirty=true,aPhase=0;
let seed=[Math.random(),Math.random(),Math.random(),Math.random()];
function seedRoll(){seed=[Math.random(),Math.random(),Math.random(),Math.random()]}
const specTex=new Uint8Array(512),palTex=new Uint8Array(1024);
glc.addEventListener('webglcontextlost',e=>{e.preventDefault()});
glc.addEventListener('webglcontextrestored',()=>{gl=null;glProg={}});
function glInit(){if(gl)return gl;if(!glOK)return null;
  try{gl=glc.getContext('webgl',{antialias:false,alpha:false,powerPreference:'high-performance'})}catch(e){gl=null}
  if(!gl){glOK=false;return null}
  glBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,glBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const mk=()=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t};
  glTexS=mk();glTexP=mk();palDirty=true;glProg={};return gl}
const GLH=`precision highp float;
uniform vec2 R;uniform float T,P,BASS,MID,TRE,LVL,BEAT;uniform vec4 SEED;uniform sampler2D SP,PL;
vec3 pal(float t){return texture2D(PL,vec2(clamp(t,0.,1.)*.992+.004,.5)).rgb;}
vec3 palc(float t){t=fract(t);return pal(1.-abs(2.*t-1.));}
float spec(float x){return texture2D(SP,vec2(clamp(x,0.,1.)*.992+.004,.25)).r;}
float wav(float x){return texture2D(SP,vec2(clamp(x,0.,1.)*.992+.004,.75)).r*2.-1.;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(17.,9.);a*=.5;}return s;}
mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
`;
const GLM=`
void main(){vec2 uv=gl_FragCoord.xy/R;vec2 p=(gl_FragCoord.xy*2.-R)/R.y;vec3 c=img(uv,p);c*=1.-.5*dot(uv-.5,uv-.5);c+=(hash(gl_FragCoord.xy+fract(T))-.5)/255.;gl_FragColor=vec4(clamp(c,0.,1.),1.);}`;
function glProgram(key,src){if(glProg[key]!==undefined)return glProg[key];
  const sh=(type,s)=>{const o=gl.createShader(type);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.error('shader '+key+': '+gl.getShaderInfoLog(o));return null}return o};
  const v=sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'),f=sh(gl.FRAGMENT_SHADER,GLH+src+GLM);
  if(!v||!f)return glProg[key]=null;
  const p=gl.createProgram();gl.attachShader(p,v);gl.attachShader(p,f);gl.bindAttribLocation(p,0,'a');gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){console.error('link '+key+': '+gl.getProgramInfoLog(p));return glProg[key]=null}
  const u={};for(const n of ['R','T','P','BASS','MID','TRE','LVL','BEAT','SEED','SP','PL'])u[n]=gl.getUniformLocation(p,n);
  return glProg[key]={p,u}}
function glDraw(v,t){if(!glInit()||gl.isContextLost())return false;const pr=glProgram(v.name,v.frag);if(!pr)return false;
  const tw=Math.max(2,Math.round(cv.width*glScale)),th=Math.max(2,Math.round(cv.height*glScale));if(glc.width!==tw||glc.height!==th){glc.width=tw;glc.height=th}
  gl.viewport(0,0,tw,th);gl.useProgram(pr.p);
  for(let i=0;i<256;i++){const x=i/255*(NB-1),k=x|0,f=x-k;specTex[i]=255*(A.bands[k]*(1-f)+A.bands[Math.min(NB-1,k+1)]*f);specTex[256+i]=wave[i*8]}
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,glTexS);gl.texImage2D(gl.TEXTURE_2D,0,gl.LUMINANCE,256,2,0,gl.LUMINANCE,gl.UNSIGNED_BYTE,specTex);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,glTexP);
  if(palDirty){for(let i=0;i<256;i++){palTex[i*4]=PR[i];palTex[i*4+1]=PG[i];palTex[i*4+2]=PB[i];palTex[i*4+3]=255}gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,256,1,0,gl.RGBA,gl.UNSIGNED_BYTE,palTex);palDirty=false}
  const u=pr.u;gl.uniform2f(u.R,tw,th);gl.uniform1f(u.T,t%3600);gl.uniform1f(u.P,aPhase);gl.uniform1f(u.BASS,A.bass);gl.uniform1f(u.MID,A.mid);gl.uniform1f(u.TRE,A.tre);gl.uniform1f(u.LVL,A.level);gl.uniform1f(u.BEAT,A.beat);
  gl.uniform4f(u.SEED,seed[0],seed[1],seed[2],seed[3]);gl.uniform1i(u.SP,0);gl.uniform1i(u.PL,1);
  gl.bindBuffer(gl.ARRAY_BUFFER,glBuf);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,3);return true}

const VIZGL=[
{name:'Плазма',frag:`vec3 img(vec2 uv,vec2 p){vec2 q=p*(1.6+BASS*.6);float t=P;
 float v=sin(q.x*3.+t)+sin(q.y*4.-t*1.2)+sin((q.x+q.y)*2.5+t*.6)+sin(length(q-vec2(sin(t*.3),cos(t*.23))*.8)*6.-t*1.6);
 v+=fbm(q*2.+t*.2)*1.5;return palc(v*.11+T*.03)*(.55+LVL*.6+BEAT*.15);}`},
{name:'Туннель',frag:`vec3 img(vec2 uv,vec2 p){p+=vec2(sin(T*.4),cos(T*.31))*.18;float r=length(p)+1e-4,a=atan(p.y,p.x);
 float z=.35/r+P*.9,u=a/3.14159265,s=spec(abs(u));
 float rings=smoothstep(0.,.9,sin(z*8.)*.5+.5);
 float ribs=smoothstep(.75,1.,sin(u*3.14159*12.+sin(z*2.)*1.5)*.5+.5);
 vec3 c=palc(z*.12+u*.5)*(.25+.75*rings)+pal(.9)*ribs*s*1.6;c*=.4+s*1.4;
 c*=smoothstep(0.,.5,r)*1.2;c+=pal(1.)*BEAT*.3*exp(-r*5.);return c;}`},
{name:'Фрактал',frag:`vec3 img(vec2 uv,vec2 p){vec2 z=rot(T*.05)*p*(1.25-BASS*.15);float a=P*.35;
 vec2 c=vec2(-.78+.12*cos(a)+BASS*.05,.16+.14*sin(a*1.3));float m=0.,n=0.;
 for(int i=0;i<90;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;m=dot(z,z);if(m>64.)break;n+=1.;}
 if(m<=64.)return pal(.05)*.3*(1.+BEAT);
 float sn=n+1.-log2(log2(m)*.5);
 return palc(sn*.035+T*.04)*(.5+.5*smoothstep(0.,12.,sn))*(.8+LVL*.6);}`},
{name:'Калейдоскоп',frag:`vec3 img(vec2 uv,vec2 p){float r=length(p),a=atan(p.y,p.x),seg=6.2831853/8.;a=mod(a+T*.1,seg);a=abs(a-seg*.5);
 vec2 q=vec2(cos(a),sin(a))*r;q=q*(2.5+BASS)+vec2(P*.4,sin(P*.3));
 float f=fbm(q+fbm(q*1.7+P*.2)*1.5),e=fbm(q*3.-P*.3);
 vec3 c=palc(f*1.6+r*.4+T*.03)*(.35+e*1.1);c+=pal(1.)*pow(e,4.)*2.*(.5+TRE*2.);c*=1.-.35*r;return c*(.7+LVL*.7);}`},
{name:'Сияние',frag:`vec3 img(vec2 uv,vec2 p){vec3 c=mix(vec3(0.,.01,.03),vec3(.02,.04,.09),uv.y);
 vec2 g=floor(p*90.);c+=step(.996,hash(g))*(.5+.5*sin(T*3.+hash(g+1.)*40.))*.8*uv.y;
 for(int i=0;i<4;i++){float fi=float(i),x=p.x*(1.2+fi*.35)+fi*3.7;
  float w=fbm(vec2(x*.9+P*.15*(1.+fi*.3),fi*5.+P*.07)),base=-.25+fi*.16+(w-.5)*.9,s=spec(fract(abs(p.x)*.45+fi*.13)),d=p.y-base;
  float cur=smoothstep(0.,.03,d)*exp(-max(d,0.)*max(.3,2.6-s*1.4-BASS));
  float rays=.55+.45*noise(vec2(x*14.+w*8.,P*.6+fi));
  c+=pal(.3+fi*.2+w*.3)*cur*rays*(.45+s*1.2+BEAT*.2);}
 float hill=-.72+.08*noise(vec2(p.x*2.2,3.))+.03*noise(vec2(p.x*9.,7.));c*=smoothstep(hill,hill+.01,p.y);return c;}`},
{name:'Лава',frag:`vec3 img(vec2 uv,vec2 p){float f=0.;
 for(int i=0;i<9;i++){float fi=float(i);vec2 c=vec2(sin(P*.35*(1.+fi*.13)+fi*2.4)*(.9+.5*sin(fi)),cos(P*.28*(1.+fi*.17)+fi*1.7)*.75);
  float rr=.17+.06*sin(fi*3.1)+spec(fi/9.)*.16;f+=rr*rr/(dot(p-c,p-c)+1e-3);}
 float e=smoothstep(.9,1.05,f),glow=smoothstep(.2,1.,f);
 vec3 c=pal(.08)*glow*.6;c=mix(c,palc(f*.18+T*.03),e);c+=pal(1.)*smoothstep(1.,1.08,f)*(1.-smoothstep(1.08,1.35,f))*.6;
 return c*(.75+LVL*.5);}`},
{name:'Галактика',frag:`vec3 img(vec2 uv,vec2 p){vec2 q=rot(.5)*p;q.y*=1.9;float r=length(q),a=atan(q.y,q.x);
 float arms=sin(a*2.-log(r+.02)*5.5+P*.5),d=fbm(vec2(a*3.+log(r+.02)*6.-P*.3,r*7.));
 float disk=exp(-r*2.4),arm=smoothstep(-.2,1.,arms)*disk*(.5+d);
 vec3 c=pal(.25+d*.4)*arm*(1.2+MID*2.);c+=pal(.95)*exp(-r*9.)*(1.3+BASS*2.+BEAT);
 vec2 g=q*60.,id=floor(g);float h=hash(id);
 float st=step(.93,h)*(1.-smoothstep(0.,.25,length(fract(g)-.5)))*(.4+.6*sin(T*2.+h*90.))*(.3+arm*3.+disk);
 c+=vec3(st)*(1.+TRE*3.);c+=step(.9975,hash(floor(uv*R/3.)))*.5;return c;}`},
{name:'Синтвейв',frag:`vec3 img(vec2 uv,vec2 p){float hz=.02;vec3 c;
 if(p.y>hz){c=mix(pal(.35)*.35,vec3(.01,0.,.04),smoothstep(0.,1.,p.y));
  vec2 s=p-vec2(0.,.42);float sr=.36+BASS*.03,d=length(s);
  float cut=s.y<.02?step(.35,fract((s.y+T*.02)*18.)):1.;
  float sun=(1.-smoothstep(sr-.006,sr,d))*cut;
  c=mix(c,mix(pal(.6),pal(.98),clamp(s.y/sr*.5+.5,0.,1.)),sun);c+=pal(.7)*exp(-d*3.5)*.35*(1.+BEAT);
  float h=hz+spec(abs(p.x)*.55)*.38*smoothstep(.12,.5,abs(p.x))+.03*noise(vec2(p.x*8.,1.));
  c=mix(c,vec3(.02,0.,.05),1.-smoothstep(h,h+.004,p.y));c+=pal(.85)*(1.-smoothstep(0.,.012,abs(p.y-h)))*.9;
  c+=step(.997,hash(floor(uv*R/2.5)))*smoothstep(.3,.9,p.y)*.8;}
 else{float z=1./(hz-p.y+.001);vec2 g=vec2(p.x*z*.6,z*.6+P*1.2),f=abs(fract(g)-.5);
  float w=clamp(.02+z*.012,0.,.45),ln=smoothstep(.5-w,.5,max(f.x,f.y)),fade=exp(-z*.09);
  c=vec3(.03,0.,.07)+pal(.75)*ln*fade*(.7+LVL)+pal(.5)*fade*.08;c+=pal(.6)*exp(-(hz-p.y)*14.)*.5;}
 return c;}`},
{name:'Чернила',frag:`vec3 img(vec2 uv,vec2 p){vec2 q=p*1.4;float t=P*.25;
 vec2 a=vec2(fbm(q+vec2(0.,t)),fbm(q+vec2(5.2,-t*1.3)));
 vec2 b=vec2(fbm(q+4.*a+vec2(1.7,9.2)+t*.5),fbm(q+4.*a+vec2(8.3,2.8)-t*.4));
 float f=fbm(q+(3.5+BASS*2.)*b);
 vec3 c=mix(pal(.1),pal(.55),clamp(f*f*3.,0.,1.));c=mix(c,pal(.85),clamp(length(a),0.,1.)*.6);c=mix(c,pal(1.),clamp(b.x*b.x*1.2,0.,1.)*.7);
 return c*(f*f*f*2.2+f*.9+.15)*(.8+LVL*.8+BEAT*.15);}`},
{name:'Чёрная дыра',frag:`vec3 img(vec2 uv,vec2 p){float r=length(p),rs=.16+BASS*.02;
 vec2 q=p*(1.-rs*rs/(r*r+1e-4)*.9);vec3 c=vec3(0.);
 vec2 g=q*40.,id=floor(g);float h=hash(id);
 c+=step(.94,h)*(1.-smoothstep(0.,.3,length(fract(g)-.5)))*(.5+.5*sin(T+h*50.));c+=pal(.3)*fbm(q*2.+3.)*.12;
 vec2 d=vec2(p.x,p.y*3.6);float dr=length(d),da=atan(d.y,d.x);
 float bnd=smoothstep(rs*1.25,rs*1.6,dr)*(1.-smoothstep(.45,1.25,dr));
 float sw=fbm(vec2(da*2.5+P*1.2-3./(dr+.1),dr*9.)),s=spec(clamp((dr-rs)*1.1,0.,1.));
 vec3 disk=palc(dr*.9-.15+sw*.25)*bnd*(.35+sw*1.2)*(.8+s*2.2);disk*=1.+.6*p.x/(dr+.2);
 float front=step(0.,-p.y),hole=1.-smoothstep(rs*.96,rs,r);
 float ring=(1.-smoothstep(0.,.035,abs(r-rs*1.32)))*(.6+.6*fbm(vec2(atan(p.y,p.x)*3.+P,1.)));
 c+=pal(.9)*ring*(1.+BEAT);c=mix(c+disk*(1.-front),vec3(0.),hole);c+=disk*front;return c;}`},
{name:'Шар',frag:`float mp(vec3 q){float s=spec(abs(q.y)*.6+.02),d=length(q)-.62-BASS*.08;
 d-=sin(q.x*7.+P*1.3)*sin(q.y*7.+P)*sin(q.z*7.-P*.8)*(.05+s*.22+BEAT*.03);return d*.6;}
vec3 img(vec2 uv,vec2 p){vec3 ro=vec3(0.,0.,-2.1),rd=normalize(vec3(p,1.6));mat2 m=rot(T*.25),m2=rot(.4);
 float t=0.,hit=0.,glow=0.;vec3 q=ro;
 for(int i=0;i<56;i++){q=ro+rd*t;q.xz=m*q.xz;q.xy=m2*q.xy;float d=mp(q);glow+=.012/(.02+abs(d));if(d<.002){hit=1.;break;}t+=d;if(t>4.)break;}
 vec3 c=pal(.15)*.12*(1.-length(p)*.5)+pal(.6)*glow*.035*(.6+LVL);
 if(hit>.5){vec2 e=vec2(.003,0.);vec3 n=normalize(vec3(mp(q+e.xyy)-mp(q-e.xyy),mp(q+e.yxy)-mp(q-e.yxy),mp(q+e.yyx)-mp(q-e.yyx)));
  vec3 l=normalize(vec3(.6,.7,-.5));l.xz=m*l.xz;l.xy=m2*l.xy;vec3 v=-rd;v.xz=m*v.xz;v.xy=m2*v.xy;
  float df=max(dot(n,l),0.),fr=pow(1.-max(dot(n,v),0.),3.),sp=pow(max(dot(reflect(-l,n),v),0.),32.);
  c=palc(length(q)*1.6-.6+T*.03)*(.15+df*.9)+pal(.95)*fr*.9+sp*.8;}
 return c;}`},
{name:'Огонь',frag:`vec3 img(vec2 uv,vec2 p){float s=spec(abs(uv.x-.5)*1.6),h=.25+s*.75+BASS*.15;
 vec2 q=vec2(p.x*2.2,p.y*1.6-P*1.6);float n=fbm(q+fbm(q*2.+vec2(0.,-P*2.))*.8);
 float f=clamp(n*1.25-(uv.y/h)*.95+.25,0.,1.);f=pow(f,1.6);
 vec3 c=pal(f)*f*1.9;c+=pal(1.)*pow(f,6.)*.8;
 vec2 g=vec2(p.x*24.,p.y*14.-T*6.);float hh=hash(floor(g));
 c+=pal(.9)*step(.985,hh)*(1.-smoothstep(0.,.35,length(fract(g)-.5)))*(1.-uv.y)*(.5+LVL*2.);return c;}`},
{name:'Океан',frag:`vec3 img(vec2 uv,vec2 p){float hz=.08;vec2 sunp=vec2(0.,hz+.2);float sd=length(p-sunp);
 vec3 sky=mix(pal(.75),pal(.25)*.5,smoothstep(hz,1.,p.y));
 sky+=pal(.95)*exp(-sd*4.)*(.8+BASS)+pal(1.)*(1.-smoothstep(.12,.13+BEAT*.01,sd));
 float cl=fbm(vec2(p.x*1.5+T*.02,p.y*5.));sky=mix(sky,pal(.5)*.6,smoothstep(.5,.8,cl)*smoothstep(hz,.6,p.y)*.6);
 if(p.y>hz)return sky;
 float z=1./(hz-p.y+.004),t=P*.6,hgt=0.,amp=.5;vec2 ww=vec2(p.x*z,z)*.35;
 for(int i=0;i<4;i++){hgt+=amp*sin(ww.x*1.3+ww.y+t+hgt*1.2)*cos(ww.y*.9-t*.7);ww=rot(.6)*ww*1.9+3.;amp*=.5;}
 float s=spec(clamp(1.-(hz-p.y)*1.1,0.,1.));hgt*=.6+s*1.5+LVL;
 float refl=exp(-abs(p.x+hgt*.006*z)*(5.+z*.3));
 vec3 sea=mix(pal(.12)*.25,pal(.4)*.5,clamp(hgt*.5+.5,0.,1.));
 sea+=pal(.95)*refl*(.35+.65*smoothstep(0.,.8,hgt))*1.3;
 return mix(sea,sky*.6,exp(-(hz-p.y)*12.));}`}
];
VIZGL.forEach(v=>v.grp='Шейдеры');
const VIZRND={name:'Рандом',grp:'Рандом и игры',enter(){seedRoll()},frag:`vec3 img(vec2 uv,vec2 p){float n=floor(2.+SEED.x*10.),md=SEED.y;vec2 q=p;float r=length(q),a=atan(q.y,q.x);
 if(SEED.z>.3){float seg=6.2831853/n;a=mod(a+T*(SEED.w-.5)*.3,seg);a=abs(a-seg*.5);q=vec2(cos(a),sin(a))*r;}
 if(md>.66)q=vec2(log(r+.03)*1.2-P*.3,a*1.5);else if(md>.33)q=q/(dot(q,q)+.15);
 q*=1.5+SEED.w*3.;float t=P*(.2+SEED.x*.4);
 float w1=fbm(q+vec2(t,-t*.6)+SEED.xy*20.);
 vec2 q2=q+vec2(cos(w1*6.28+SEED.z*6.),sin(w1*6.28))*(.3+SEED.y+BASS*.8);
 float f=fbm(q2*(1.+SEED.z)+SEED.zw*30.-t*.5),bn=3.+floor(SEED.w*9.);
 float v=mix(f,abs(sin(f*bn*3.1416+t)),step(.5,fract(SEED.x*7.3)));
 float cells=mix(1.,smoothstep(0.,.15,abs(fract(f*bn)-.5)),step(.6,fract(SEED.y*5.7)));
 vec3 c=palc(v*(.8+SEED.z)+SEED.w+r*.2+T*.02)*cells*(.3+v*1.1);
 c+=pal(1.)*pow(v,6.)*(.5+TRE*3.);return c*(.75+LVL*.7+BEAT*.2);}`};

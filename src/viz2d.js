/* ---------- новые 2D-сцены ---------- */
const colm=(t,m)=>{const i=ci(t);return 'rgb('+((PR[i]*m)|0)+','+((PG[i]*m)|0)+','+((PB[i]*m)|0)+')'};
const rr=(x,y,w,h,r)=>{g.beginPath();g.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2)))};
function fit(s,maxW){if(g.measureText(s).width<=maxW)return s;while(s.length>1&&g.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s+'…'}
const GLYPH='ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ0123456789ВЕРТУШКА';
const VIZ2D=[
{name:'Фейерверк',draw(w,h,t,dt){
  g.fillStyle='rgba('+BGR+',0.2)';g.fillRect(0,0,w,h);
  if(!S.p){S.p=[];S.r=[];S.last=0}
  const launch=()=>S.r.push({x:w*(.12+Math.random()*.76),y:h,vy:-h*(.8+Math.random()*.4),ty:h*(.14+Math.random()*.4),c:Math.random()});
  if(((A.beat>.9||A.snare>.9)&&t-S.last>.2)||t-S.last>(A.live?1.3:2.2)){S.last=t;launch();if(A.bass>.55)launch()}
  g.globalCompositeOperation='lighter';
  for(let i=S.r.length-1;i>=0;i--){const r=S.r[i];r.y+=r.vy*dt;g.fillStyle=cola(r.c,.9);g.fillRect(r.x-1.5,r.y,3,12);
    if(r.y<=r.ty){S.r.splice(i,1);const n=110+((A.level*180)|0),kind=Math.random(),sp=h*(.24+A.level*.3);
      for(let k=0;k<n;k++){const a=kind<.3?k/n*6.283:Math.random()*6.283,v=kind<.3?sp*(.92+.08*Math.random()):sp*Math.sqrt(Math.random());
        S.p.push({x:r.x,y:r.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1,d:.4+Math.random()*.5,c:kind>.7?Math.random():r.c+Math.random()*.18})}}}
  const gr=h*.35,dr=Math.exp(-dt*1.6);g.lineCap='round';
  for(let i=S.p.length-1;i>=0;i--){const p=S.p[i];p.vx*=dr;p.vy=p.vy*dr+gr*dt;const ox=p.x,oy=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt*p.d;
    if(p.l<=0){S.p[i]=S.p[S.p.length-1];S.p.pop();continue}
    g.strokeStyle=cola(p.c,Math.min(1,p.l*1.4));g.lineWidth=1+p.l*2.2;g.beginPath();g.moveTo(ox,oy);g.lineTo(p.x,p.y);g.stroke()}
  if(S.p.length>4500)S.p.length=4500;
  g.globalCompositeOperation='source-over';
}},
{name:'Лиссажу',draw(w,h,t,dt){
  g.fillStyle='rgba('+BGR+',0.14)';g.fillRect(0,0,w,h);
  const cx=w/2,cy=h/2,m=Math.min(w,h)*.42,n=1100,off=(160+140*Math.sin(t*.13))|0,kk=Math.min(7,.75/(A.level*.62+.05)),ca=Math.cos(t*.1),sa=Math.sin(t*.1);
  g.beginPath();for(let i=0;i<n;i++){const a=(wave[i]-128)/128*kk,b=(wave[i+off]-128)/128*kk,x=cx+(a*ca-b*sa)*m,y=cy+(a*sa+b*ca)*m;i?g.lineTo(x,y):g.moveTo(x,y)}
  g.globalCompositeOperation='lighter';g.lineJoin='round';const hu=tri(t*.05);
  g.strokeStyle=cola(.4+.4*hu,.2);g.lineWidth=8;g.stroke();g.strokeStyle=cola(.7+.3*hu,.95);g.lineWidth=1.6;g.stroke();
  g.globalCompositeOperation='source-over';
}},
{name:'Винил',draw(w,h,t,dt){
  g.fillStyle=BG;g.fillRect(0,0,w,h);
  const m=Math.min(w,h),cx=w/2-m*.07,cy=h/2,R=m*.38;S.a=(S.a||0)+(A.live?dt*3.49:dt*.25);
  const n=110;g.lineCap='round';g.lineWidth=Math.max(2,m*.006);
  for(let i=0;i<n;i++){const v=A.bands[(i*56/n)|0],a=i/n*6.2832-1.5708,c=Math.cos(a),s=Math.sin(a);g.strokeStyle=col(.25+v*.75);g.beginPath();g.moveTo(cx+c*(R+m*.022),cy+s*(R+m*.022));g.lineTo(cx+c*(R+m*.026+v*m*.09),cy+s*(R+m*.026+v*m*.09));g.stroke()}
  g.save();g.translate(cx,cy);
  g.fillStyle='#0b0b0d';g.beginPath();g.arc(0,0,R,0,7);g.fill();
  g.rotate(S.a);
  if(g.createConicGradient){const cg=g.createConicGradient(0,0,0);for(let i=0;i<=8;i++)cg.addColorStop(i/8,i%2?'rgba(255,255,255,0.14)':'rgba(255,255,255,0)');g.fillStyle=cg;g.beginPath();g.arc(0,0,R*.97,0,7);g.fill()}
  g.lineWidth=1;for(let i=0;i<40;i++){const r=R*(.37+i/40*.6);g.strokeStyle=i%7===6?'rgba(0,0,0,.75)':'rgba(255,255,255,'+(.03+.07*A.bands[(i*1.4)|0]).toFixed(3)+')';g.beginPath();g.arc(0,0,r,0,7);g.stroke()}
  const lr=R*.33;
  if(coverImg){g.save();g.beginPath();g.arc(0,0,lr,0,7);g.clip();g.drawImage(coverImg,-lr,-lr,lr*2,lr*2);g.restore()}
  else{g.fillStyle=col(.6);g.beginPath();g.arc(0,0,lr,0,7);g.fill();g.fillStyle=col(.15);g.beginPath();g.arc(0,0,lr*.6,0,7);g.fill();
    g.fillStyle='#fff';g.font='700 '+(lr*.17)+'px "Segoe UI",sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ВЕРТУШКА',0,-lr*.79);g.fillText('33 ⅓',0,lr*.79)}
  g.fillStyle=BG;g.beginPath();g.arc(0,0,R*.024,0,7);g.fill();g.restore();
  // тонарм
  const px=cx+R*1.2,py=cy-R*.92,prog=audio.duration>0?audio.currentTime/audio.duration:0,dx=px-cx,dy=py-cy,dl=Math.hypot(dx,dy),rn=R*(.93-.5*prog)+Math.sin(t*7)*A.bass*1.5,nx=cx+dx/dl*rn,ny=cy+dy/dl*rn;
  g.strokeStyle='#c9ccd2';g.lineWidth=Math.max(3,m*.012);g.lineCap='round';g.beginPath();g.moveTo(px,py);g.lineTo(nx,ny);g.stroke();
  g.fillStyle='#8d9199';g.beginPath();g.arc(px,py,m*.035,0,7);g.fill();g.fillStyle='#2b2d33';g.beginPath();g.arc(px,py,m*.016,0,7);g.fill();
  g.save();g.translate(nx,ny);g.rotate(Math.atan2(dy,dx));g.fillStyle=col(.8);g.fillRect(-m*.04,-m*.016,m*.055,m*.032);g.restore();
}},
{name:'Город',draw(w,h,t,dt){
  g.fillStyle=BG;g.fillRect(0,0,w,h);const C=18,Rr=14;
  if(!S.r){S.r=[];for(let j=0;j<Rr;j++)S.r.push(new Float32Array(C));S.acc=0}
  S.acc+=dt;if(S.acc>.09){S.acc=0;const r=S.r.pop();r.set(S.r[0]);S.r.unshift(r)}
  for(let i=0;i<C;i++){const tv=A.bands[(i*54/C)|0];S.r[0][i]+=(tv-S.r[0][i])*.45}
  const u=Math.min(w*.92/(C+Rr),h*.52/((C+Rr)/2)),uu=u*.84,ox=w/2-(C-Rr)*u/2,oy=h*.4,Hm=h*.34;
  for(let j=0;j<Rr;j++)for(let i=0;i<C;i++){const v=S.r[Rr-1-j][i],age=(Rr-1-j)/Rr,hh=4+v*Hm*(1-age*.35),x=ox+(i-j)*u,y=oy+(i+j)*u*.5,tt=.15+v*.85;
    g.fillStyle=colm(tt,.5*(1-age*.4));g.beginPath();g.moveTo(x-uu,y+uu/2-hh);g.lineTo(x,y+uu-hh);g.lineTo(x,y+uu);g.lineTo(x-uu,y+uu/2);g.fill();
    g.fillStyle=colm(tt,.75*(1-age*.4));g.beginPath();g.moveTo(x,y+uu-hh);g.lineTo(x+uu,y+uu/2-hh);g.lineTo(x+uu,y+uu/2);g.lineTo(x,y+uu);g.fill();
    g.fillStyle=colm(tt,1-age*.4);g.beginPath();g.moveTo(x,y-hh);g.lineTo(x+uu,y+uu/2-hh);g.lineTo(x,y+uu-hh);g.lineTo(x-uu,y+uu/2-hh);g.fill()}
}},
{name:'Матрица',draw(w,h,t,dt){
  const fs=Math.max(14,Math.round(h/40)),n=Math.ceil(w/fs);
  if(!S.y){S.y=new Float32Array(n);S.a=new Float32Array(n);S.c=[];for(let i=0;i<n;i++)S.y[i]=-(Math.random()*40|0);g.fillStyle=BG;g.fillRect(0,0,w,h)}
  g.fillStyle='rgba('+BGR+',0.085)';g.fillRect(0,0,w,h);
  g.font='600 '+fs+'px Consolas,monospace';g.textBaseline='top';
  for(let i=0;i<n;i++){const v=A.bands[(i*60/n)|0];S.a[i]+=dt*(6+v*40);let k=0;
    while(S.a[i]>=1&&k++<3){S.a[i]-=1;const x=i*fs,y=S.y[i]*fs;
      if(S.c[i]){g.fillStyle=BG;g.fillRect(x,y,fs,fs);g.fillStyle=col(.35+v*.6);g.fillText(S.c[i],x,y)}
      S.y[i]++;const ch=GLYPH[(Math.random()*GLYPH.length)|0];S.c[i]=ch;g.fillStyle='#fff';g.fillText(ch,x,S.y[i]*fs);
      if(S.y[i]*fs>h&&Math.random()>.9-v*.3){S.y[i]=-(Math.random()*10|0);S.c[i]=''}}}
}},
{name:'Сфера',draw(w,h,t,dt){
  g.fillStyle='rgba('+BGR+',0.3)';g.fillRect(0,0,w,h);
  const n=1100,cx=w/2,cy=h/2,m=Math.min(w,h),R=m*.3;
  if(!S.p){S.p=new Float32Array(n*3);for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),a=i*2.39996;S.p[i*3]=Math.cos(a)*r;S.p[i*3+1]=y;S.p[i*3+2]=Math.sin(a)*r}S.ry=0}
  S.ry+=dt*(.25+A.level*.9);const tx=.45+Math.sin(t*.2)*.35,c1=Math.cos(S.ry),s1=Math.sin(S.ry),c2=Math.cos(tx),s2=Math.sin(tx);
  g.globalCompositeOperation='lighter';
  for(let i=0;i<n;i++){const x=S.p[i*3],y=S.p[i*3+1],z=S.p[i*3+2],b=A.bands[((y*.5+.5)*56)|0],q=1+b*.6+A.beat*.07;
    const x1=x*c1+z*s1,z1=-x*s1+z*c1,y1=y*c2-z1*s2,z2=y*s2+z1*c2,f=2.7/(2.7+z2),sx=cx+x1*q*R*f,sy=cy+y1*q*R*f,sz=(1+b*3.2)*f*m*.0034;
    g.fillStyle=cola(.2+b*.8,.3+.7*(1-(z2+1)/2));g.beginPath();g.arc(sx,sy,sz,0,7);g.fill()}
  g.globalCompositeOperation='source-over';
}},
{name:'Потоки',draw(w,h,t,dt){
  g.fillStyle='rgba('+BGR+',0.07)';g.fillRect(0,0,w,h);const n=1200;
  if(!S.p){S.p=new Float32Array(n*3);for(let i=0;i<n;i++){S.p[i*3]=Math.random()*w;S.p[i*3+1]=Math.random()*h;S.p[i*3+2]=Math.random()*4}}
  const k=3.2/Math.min(w,h),sp=40+A.level*430+A.beat*220+A.syn*160+A.tre*140,tt=t*.12;g.lineWidth=1.4;
  for(let c=0;c<8;c++){g.strokeStyle=cola(c/7,.5);g.beginPath();
    for(let i=c;i<n;i+=8){const o=i*3,x=S.p[o],y=S.p[o+1],a=(Math.sin(x*k+tt)+Math.cos(y*k*1.3-tt*1.4)+Math.sin((x+y)*k*.6+tt*.7))*2.1+A.bass*2+(A.note-.5)*A.mel*4,nx=x+Math.cos(a)*sp*dt,ny=y+Math.sin(a)*sp*dt;
      g.moveTo(x,y);g.lineTo(nx,ny);S.p[o+2]-=dt;
      if(nx<0||nx>w||ny<0||ny>h||S.p[o+2]<0){S.p[o]=Math.random()*w;S.p[o+1]=Math.random()*h;S.p[o+2]=2+Math.random()*4}else{S.p[o]=nx;S.p[o+1]=ny}}
    g.stroke()}
  g.globalCompositeOperation='source-over';
}},
{name:'Кассета',draw(w,h,t,dt){
  g.fillStyle=BG;g.fillRect(0,0,w,h);
  const m=Math.min(w/1.75,h/1.3),cw=m*1.5,ch=m*.95,x0=(w-cw)/2,y0=(h-ch)/2-m*.07;S.a=(S.a||0)+(A.live?dt*(2+A.level*3):0);
  rr(x0,y0,cw,ch,m*.04);g.fillStyle='#1c1d22';g.fill();g.strokeStyle=col(.6);g.lineWidth=2;g.stroke();
  rr(x0+cw*.05,y0+ch*.07,cw*.9,ch*.62,m*.02);g.fillStyle='#efe6d2';g.fill();
  g.fillStyle=col(.55);g.fillRect(x0+cw*.05,y0+ch*.09,cw*.9,ch*.07);g.fillStyle=col(.85);g.fillRect(x0+cw*.05,y0+ch*.165,cw*.9,ch*.02);
  const tr=tracks[cur];g.fillStyle='#222';g.font='600 '+(ch*.068)+'px "Segoe Print","Comic Sans MS",cursive';g.textBaseline='middle';
  g.fillText(fit(tr?(tr.artist?tr.artist+' — ':'')+tr.title:'Вертушка mix',cw*.82),x0+cw*.09,y0+ch*.245);
  const wy=y0+ch*.31,wh=ch*.3,wx=x0+cw*.18,ww=cw*.64;rr(wx,wy,ww,wh,m*.02);g.fillStyle='#101114';g.fill();
  const prog=audio.duration>0?audio.currentTime/audio.duration:.3,cyy=wy+wh/2,rmax=wh*.7,rmin=wh*.22;
  g.save();rr(wx,wy,ww,wh,m*.02);g.clip();
  [[x0+cw*.33,rmin+(rmax-rmin)*(1-prog),1],[x0+cw*.67,rmin+(rmax-rmin)*prog,1.35]].forEach(([cx,r,sp])=>{
    g.fillStyle='#3b2b22';g.beginPath();g.arc(cx,cyy,r,0,7);g.fill();g.fillStyle='#e9e9e4';g.beginPath();g.arc(cx,cyy,rmin*.86,0,7);g.fill();
    g.fillStyle='#101114';for(let i=0;i<6;i++){const a=S.a*sp+i*1.0472;g.beginPath();g.arc(cx+Math.cos(a)*rmin*.55,cyy+Math.sin(a)*rmin*.55,rmin*.13,0,7);g.fill()}
    g.beginPath();g.arc(cx,cyy,rmin*.2,0,7);g.fill()});
  g.restore();
  const segs=22,vy=y0+ch*.74,sw=cw*.8/segs;
  [[A.bass,0],[A.mid,1],[A.tre,2]].forEach(([v,r])=>{for(let i=0;i<segs;i++){g.fillStyle=i/segs<v?col(.25+i/segs*.75):'#2c2d34';g.fillRect(x0+cw*.1+i*sw,vy+r*ch*.055,sw*.78,ch*.035)}});
  g.fillStyle='#55575f';[[.03,.05],[.97,.05],[.03,.95],[.97,.95]].forEach(([a,b])=>{g.beginPath();g.arc(x0+cw*a,y0+ch*b,m*.012,0,7);g.fill()});
}}
];
VIZ2D.forEach(v=>v.grp='Сцены');

/* ---------- анализатор: всё, что Вертушка слышит в треке ---------- */
const VIZAN={name:'Анализатор',draw(w,h,t,dt){
  g.fillStyle=BG;g.fillRect(0,0,w,h);const F='"Segoe UI",sans-serif',fs=Math.max(11,Math.min(15,h*.022)),pad=Math.max(14,w*.025);
  if(!S.v){S.v=new Float32Array(NB);S.pk=new Float32Array(NB);S.hist=[];S.acc=0;S.gp=new Float32Array(6)}
  const x0=pad+fs*2.4,x1=w-pad,y0=pad+fs*1.6,y1=h*.58,sw=x1-x0,sh=y1-y0,fx=f=>x0+Math.log(f/35)/Math.log(16000/35)*sw;
  g.font='400 '+fs+'px '+F;g.textBaseline='middle';g.lineWidth=1;
  g.textAlign='right';for(let d=0;d<=50;d+=10){const y=y0+d/50*sh;g.strokeStyle='rgba(255,255,255,.07)';g.beginPath();g.moveTo(x0,y);g.lineTo(x1,y);g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.fillText(d?'−'+d:'0',x0-6,y)}
  g.textAlign='center';g.textBaseline='top';for(const f of [50,100,200,500,1000,2000,5000,10000]){const x=fx(f);g.strokeStyle='rgba(255,255,255,.07)';g.beginPath();g.moveTo(x,y0);g.lineTo(x,y1);g.stroke();g.fillStyle='rgba(255,255,255,.5)';g.fillText(f<1000?String(f):f/1000+'к',x,y1+5)}
  g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='rgba(255,255,255,.75)';g.font='700 '+fs+'px '+F;g.fillText('Спектр, дБ · Гц',x0,pad+fs*.8);
  const amp=v=>1-Math.pow(v,1/1.7),px=b=>x0+(b+.5)/NB*sw;
  for(let b=0;b<NB;b++){const v=A.bands[b];S.v[b]=v>S.v[b]?v:Math.max(v,S.v[b]-dt*1.3);S.pk[b]=S.v[b]>=S.pk[b]?S.v[b]:Math.max(0,S.pk[b]-dt*.18)}
  const gr=g.createLinearGradient(x0,0,x1,0);for(let i=0;i<=6;i++)gr.addColorStop(i/6,cola(.15+i/6*.85,.85));
  const path=(arr,close)=>{g.beginPath();let lx=px(0),ly=y0+amp(arr[0])*sh;g.moveTo(x0,ly);g.lineTo(lx,ly);for(let b=1;b<NB;b++){const x=px(b),y=y0+amp(arr[b])*sh;g.quadraticCurveTo(lx,ly,(lx+x)/2,(ly+y)/2);lx=x;ly=y}g.lineTo(x1,ly);if(close){g.lineTo(x1,y1);g.lineTo(x0,y1);g.closePath()}};
  path(S.v,true);g.globalAlpha=.55;g.fillStyle=gr;g.fill();g.globalAlpha=1;path(S.v);g.strokeStyle=gr;g.lineWidth=2;g.lineJoin='round';g.stroke();
  path(S.pk);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=1;g.stroke();
  g.fillStyle='#fff';for(let b=0;b<NB;b++){const r=A.rel[b];if(r>.04){g.globalAlpha=Math.min(1,r*5);g.beginPath();g.arc(px(b),y0+amp(S.v[b])*sh,2+r*10,0,7);g.fill()}}g.globalAlpha=1;
  // низ: полосы, датчики, история
  const by0=y1+fs*3.6,by1=h-pad,bh=by1-by0,lx0=pad,mW=sw*.36,lW=sw*.2,hX=x0+mW+lW+pad,hW=x1-hX;
  const nm=['Саб','Бас','Низ середины','Середина','Верх','Воздух'],rh=bh/6,lab=fs*7.2;
  g.textBaseline='middle';
  for(let i=0;i<6;i++){const y=by0+rh*i+rh*.5,v=A.g[i];S.gp[i]=v>=S.gp[i]?v:Math.max(v,S.gp[i]-dt*.35);
    g.textAlign='left';g.font='400 '+fs+'px '+F;g.fillStyle='rgba(255,255,255,.75)';g.fillText(nm[i],lx0,y,lab-6);
    const bx=lx0+lab,bw=x0+mW-pad*.5-bx,bb=Math.max(4,rh*.42);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(bx,y-bb/2,bw,bb);g.fillStyle=col(.25+i/5*.7);g.fillRect(bx,y-bb/2,bw*v,bb);g.fillStyle='#fff';g.fillRect(bx+bw*S.gp[i]-1,y-bb/2-2,2,bb+4)}
  const lx=x0+mW+pad*.5,ln=[['Бочка',A.kick],['Малый',A.snare],['Тарелки',A.hat],['Синт',Math.max(A.syn,A.mel*.8)]],lh=bh/4,lr=Math.max(4,Math.min(lh*.32,lW*.11));
  for(let i=0;i<4;i++){const y=by0+lh*i+lh*.5,v=Math.min(1,ln[i][1]);g.fillStyle='rgba(255,255,255,.12)';g.beginPath();g.arc(lx+lr,y,lr,0,7);g.fill();g.fillStyle=cola(.3+i*.22,v);g.beginPath();g.arc(lx+lr,y,lr*(.55+.45*v),0,7);g.fill();
    g.textAlign='left';g.font='400 '+fs+'px '+F;g.fillStyle='rgba(255,255,255,'+(.55+.45*v).toFixed(2)+')';g.fillText(ln[i][0],lx+lr*2+8,y,Math.max(10,lW-lr*2-8))}
  S.acc+=dt;while(S.acc>=.033){S.acc-=.033;S.hist.push([A.level,A.note,A.mel,A.kick>.8?1:0]);if(S.hist.length>300)S.hist.shift()}
  g.fillStyle='rgba(255,255,255,.05)';g.fillRect(hX,by0,hW,bh);g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle='rgba(255,255,255,.75)';g.font='700 '+fs+'px '+F;g.fillText('Динамика за 10 секунд',hX,by0-8,hW);g.fillText('Полосы и удары',lx0,by0-8,mW+lW);
  const n=S.hist.length,hx=i=>hX+hW-(n-1-i)/299*hW;
  if(n){g.beginPath();g.moveTo(hx(0),by1);for(let i=0;i<n;i++)g.lineTo(hx(i),by1-S.hist[i][0]*bh*.95);g.lineTo(hX+hW,by1);g.closePath();g.fillStyle=cola(.35,.35);g.fill()}
  for(let i=0;i<n;i++){const q=S.hist[i];if(q[3]){g.fillStyle='rgba(255,255,255,.28)';g.fillRect(hx(i),by0,1.5,bh)}if(q[2]>.08){g.fillStyle=cola(.35+q[1]*.65,Math.min(1,q[2]*1.6));g.fillRect(hx(i)-1.5,by1-4-q[1]*(bh-10),3.5,4)}}
}};

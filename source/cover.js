/* Opening scene: a live examination sheet is scanned while the title stands alone. Revealing the
   subtitle streams the sheet into a connected path where candidates pass stage gateways that feed
   intelligence nodes: beyond examinations. The presenter identity follows. Local WebGL and GSAP
   only; assets/hero.png remains the no-WebGL fallback. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="opening"]');if(!slide)return;
const g=window.gsap,stage=$('.cover-stage',slide),canvas=$('.cover-canvas',slide);

const{rng,sub,norm,M,compose,FS_POINTS,VS_FLAT,FS_LINE,FS_SPARK,VS_BG,FS_BG}=window.ELMY_LIGHT;
const rand=rng(1907);

/* The path, gateways and nodes. The GLSL path below must match path() exactly. */
const GATES=[.17,.37,.57,.77],PORTAL=.95,HALF=.34,PEOPLE=24,YAW=-.45;
const PATH={amp:.45,freq:4.6,phase:.4,damp:.4,y0:-1.05,y1:.22,z0:2.9,z1:-9.6};
const CAMERA={fov:.52,eye:[0,2.3,7.2],target:[.3,-.7,-2.2]};
function path(s){return[PATH.amp*Math.sin(s*PATH.freq+PATH.phase)*(1-PATH.damp*s),PATH.y0+PATH.y1*s,PATH.z0+PATH.z1*s];}
function lateral(s){const a=path(s-.002),b=path(s+.002),dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz)||1;return[-dz/l,0,dx/l];}
const tangent=s=>norm(sub(path(s+.002),path(s-.002)));
function along(s,u,h){const p=path(s),l=lateral(s);return[p[0]+l[0]*u*HALF,p[1]+h,p[2]+l[2]*u*HALF];}
const ORB_OUT=[1.35,1,1.15,1],ORB_UP=[1.45,1.5,.95,1.65];
const ORBS=GATES.map((s,k)=>{const side=k%2?-1:1,o=ORB_OUT[k]*side,p=path(s+.015),l=lateral(s+.015);return{side,s,center:[p[0]+l[0]*o,p[1]+ORB_UP[k],p[2]+l[2]*o],ground:[p[0]+l[0]*o,p[1],p[2]+l[2]*o]};});

/* Particle slots. A = the answer sheet (sheet space), B = the path scene (world space or path parameters). */
const A=[],B=[];
const W=2.1,H=2.9,hw=W/2,hh=H/2,sheetT=v=>(hh-v)/H;
const a=(role,u,v,size,alpha,shape=0,color=0,fill=0)=>A.push({role,p:[u,v,0],t:sheetT(v),size,alpha,shape,color,fill});
const b=(role,kind,p,size,alpha,shape=0,color=0,x=[0,0,0,-1])=>B.push({role,kind,p,size,alpha,shape,color,x});

// Sheet border, registration marks and header fields.
for(const[u0,v0,u1,v1]of[[-hw,hh,hw,hh],[hw,hh,hw,-hh],[hw,-hh,-hw,-hh],[-hw,-hh,-hw,hh]]){const n=Math.round(Math.hypot(u1-u0,v1-v0)/.012);for(let i=0;i<n;i++){const k=i/n;a('line',u0+(u1-u0)*k,v0+(v1-v0)*k,.0085,.5);}}
for(const[cu,cv]of[[-hw+.09,hh-.09],[hw-.09,hh-.09],[hw-.09,-hh+.09]])for(let i=0;i<5;i++)for(let j=0;j<5;j++)a('mark',cu-.022+i*.011,cv-.022+j*.011,.012,.8,0,2);
const dash=(u0,v,len,alpha=.42,size=.0072)=>{const n=Math.round(len/.011);for(let i=0;i<=n;i++)a('text',u0+i*.011,v,size,alpha);};
dash(-.86,1.24,.92,.8,.0105);dash(-.86,1.12,.56);dash(-.86,1.01,.74);dash(-.86,.9,.38);dash(-.86,.8,.62);
for(let c=0;c<6;c++){const pick=Math.floor(rand()*10);for(let r=0;r<10;r++)a('id',.36+c*.1,1.28-r*.056,.036,.5,1,0,r===pick?1:0);}
for(let u=-.94;u<=.94;u+=.016)a('text',u,.69,.006,.3);
// Timing track, row numbers and answer bubbles: one mark per question.
for(let r=0;r<20;r++){const v=.56-r*.1;
 for(let i=0;i<5;i++)a('mark',-.985+i*.011,v,.0095,.85,0,2);
 for(let k=0;k<3;k++){const u0=-.8+k*.62,pick=Math.floor(rand()*4);
  for(let i=0;i<3;i++)a('text',u0+i*.012,v,.0065,.4);
  for(let j=0;j<4;j++)a(j===pick?'answer':'bubble',u0+.13+j*.105,v,.066,.68,1,0,j===pick?1:0);
 }}
for(let i=0;i<1100;i++)a('paper',(rand()*2-1)*hw*.98,(rand()*2-1)*hh*.98,.0062,.045,0,2);

// Path surface, edges and slab sides flow slowly toward the destination.
for(let i=0;i<3000;i++)b('ribbon',2,[rand(),rand()*2-1,0],.012,.28,0,rand()<.4?0:2);
for(let i=0;i<2000;i++)b('edge',2,[(i>>1)/1000+rand()*.0005,i%2?1:-1,0],.014,.8);
for(let i=0;i<420;i++)b('glow',2,[rand(),(rand()*2-1)*.55,.01],.26,.045,0,1);
for(let i=0;i<640;i++)b('side',2,[rand(),rand()<.5?1:-1,-rand()*.13],.009,.18,0,4);
// Glass gateways: front and back faces of an outer and inner arch, plus a glass body.
function arch(s,R,r,Hg,depth,id,color,alpha,size,fill){const p=path(s),l=lateral(s),t=tangent(s);
 const put=(x,y,d,al=alpha,sz=size)=>b('gate',1,[p[0]+l[0]*x+t[0]*d,p[1]+y+t[1]*d,p[2]+l[2]*x+t[2]*d],sz,al,0,color,[0,0,0,id]);
 for(const rad of[R,r])for(const d of[-depth,depth]){const leg=Math.round(Hg/.012);for(let i=0;i<=leg;i++){put(-rad,i*.012,d);put(rad,i*.012,d);}const n=Math.round(Math.PI*rad/.012);for(let i=1;i<n;i++){const q=Math.PI*i/n;put(-Math.cos(q)*rad,Hg+Math.sin(q)*rad,d);}}
 const onArch=rad=>{const len=2*Hg+Math.PI*rad,m=rand()*len;if(m<Hg)return[-rad,m];if(m<Hg+Math.PI*rad){const q=(m-Hg)/rad;return[-Math.cos(q)*rad,Hg+Math.sin(q)*rad];}return[rad,m-Hg-Math.PI*rad];};
 for(let i=0;i<fill;i++){const[x,y]=onArch(r+(R-r)*rand());put(x,y,(rand()*2-1)*depth,alpha*.3,size*.7);}
 for(let i=0;i<240;i++){const[x,y]=onArch((R+r)/2);put(x,y,0,.013,.17);}
}
GATES.forEach((s,k)=>arch(s,.44,.36,.78,.045,k,1,.52,.016,90));
arch(PORTAL,.52,.47,.9,.03,4,0,.55,.014,0);
{const p=path(PORTAL),l=lateral(PORTAL);for(let i=0;i<380;i++){const x=(rand()*2-1)*.46,top=.9+Math.sqrt(Math.max(0,.46*.46-x*x)),y=rand()*top;b('portal',1,[p[0]+l[0]*x,p[1]+y,p[2]+l[2]*x],.03,.15,0,2,[0,0,0,4]);}}
// Intelligence nodes: a glass sphere, a soft core and a pictogram that always faces the camera.
const icons=[
 ()=>{const o=[];for(let i=0;i<=9;i++){o.push([-.045+i*.01,.06],[-.045+i*.01,-.06]);}for(let i=1;i<12;i++){o.push([-.045,.06-i*.01],[.045,.06-i*.01]);}for(const y of[.03,.005,-.02])for(let i=0;i<=6;i++)o.push([-.03+i*.01,y]);return o;},
 ()=>{const o=[];for(const[cx,cy,r]of[[-.05,.025,.016],[0,.04,.019],[.05,.025,.016]]){for(let i=0;i<12;i++){const q=i/12*Math.PI*2;o.push([cx+Math.cos(q)*r,cy+Math.sin(q)*r]);}for(let i=0;i<=8;i++){const q=Math.PI*i/8;o.push([cx-Math.cos(q)*r*1.7,cy-r*2.6+Math.sin(q)*r*1.3]);}}return o;},
 ()=>{const o=[];for(let i=0;i<=12;i++)o.push([-.06+i*.01,-.055]);for(const[x,h]of[[-.036,.05],[0,.075],[.036,.1]])for(let y=0;y<=h;y+=.01)o.push([x-.007,-.045+y],[x+.007,-.045+y]);return o;},
 ()=>{const o=[];for(let i=0;i<10;i++){const q=i/10*Math.PI*2;o.push([Math.cos(q)*.014,Math.sin(q)*.014]);}for(let k=0;k<6;k++){const q=k/6*Math.PI*2+.3;for(let j=2;j<=6;j++)o.push([Math.cos(q)*j*.0105,Math.sin(q)*j*.0105]);for(let i=0;i<7;i++){const w=i/7*Math.PI*2;o.push([Math.cos(q)*.075+Math.cos(w)*.009,Math.sin(q)*.075+Math.sin(w)*.009]);}}return o;}];
ORBS.forEach((orb,k)=>{
 const n=300,R=.25;for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),q=i*2.39996;b('orb',5,orb.center,.012,.56,0,0,[Math.cos(q)*r*R,y*R,Math.sin(q)*r*R,k]);}
 b('core',6,orb.center,.75,.085,0,1,[0,0,0,k]);b('core',6,orb.center,.22,.2,0,0,[0,0,0,k]);
 for(const[x,y]of icons[k]())b('icon',7,orb.center,.018,1,0,2,[x*1.5,y*1.5,0,k]);
});
// Candidates: a head and a body that walk the path and brighten at each gateway.
const walkers=[];for(let i=0;i<PEOPLE;i++){const w={s0:i/PEOPLE+rand()*.02,u:(rand()*2-1)*.62,speed:.0095+rand()*.004};walkers.push(w);
 b('person',3,[w.s0,w.u,.17],.36,.78,3,2,[w.speed,i,0,-1]);}

/* Pair the two states so the top of the sheet streams toward the top of the frame. */
const baseVP=compose(M.perspective(CAMERA.fov,1.6,.1,60),M.lookAt(CAMERA.eye,CAMERA.target,[0,1,0]),M.ry(YAW));
function screenY(slot){let p=slot.p;if(slot.kind>=2&&slot.kind<=4)p=along(p[0],p[1],p[2]);const c=M.apply(baseVP,p);return c[1]/c[3];}
const pick=(arr,role)=>arr.filter(x=>x.role===role);
const persons=pick(B,'person'),answers=pick(A,'answer').sort((x,y)=>x.t-y.t);
const spread=(arr,count)=>Array.from({length:count},(_,i)=>arr[Math.floor(i*arr.length/count)]);
const personA=spread(answers,PEOPLE),used=new Set(personA);
let poolA=A.filter(x=>!used.has(x)),poolB=B.filter(x=>x.role!=='person');
while(poolA.length<poolB.length)poolA.push({role:'ghost',p:[(rand()*2-1)*hw*.96,(rand()*2-1)*hh*.96,0],t:0,size:.006,alpha:0,shape:0,color:0,fill:0});
poolA.forEach(x=>{if(x.role==='ghost')x.t=sheetT(x.p[1]);x.key=x.t+rand()*.05;});
poolA.sort((x,y)=>x.key-y.key);
poolB.forEach(x=>x.key=-screenY(x)+rand()*.05);poolB.sort((x,y)=>x.key-y.key);
while(poolB.length<poolA.length){const src=poolA[poolB.length];poolB.push({role:'vanish',kind:1,p:[0,0,0],size:.006,alpha:0,shape:0,color:0,x:[0,0,0,-1],src});}
const pairs=[];
// Each scanned answer becomes a candidate: the top of the sheet walks furthest.
persons.sort((x,y)=>y.p[0]-x.p[0]);personA.forEach((x,i)=>pairs.push([x,persons[i]]));
poolA.forEach((x,i)=>pairs.push([x,poolB[i]]));
// Scan beam and ambient atmosphere.
const extra=[];
for(let i=0;i<=200;i++)extra.push({kind:8,a:[-1.12+i*.0112,0,.012],size:.011,alpha:.95,color:3});
for(let i=0;i<34;i++)extra.push({kind:8,a:[-1.1+i*.066,0,.02],size:.15,alpha:.05,color:3});
for(let i=0;i<520;i++){const big=rand()<.07;extra.push({kind:0,a:[-3.2+rand()*7.6,-1.4+rand()*4.2,-9+rand()*12],size:big?.09+rand()*.12:.008+rand()*.026,alpha:big?.025+rand()*.03:.05+rand()*.2,color:rand()<.7?0:1});}

/* Interleaved buffer: aA(3) aB(3) aM(4: kind, seed, delay, sheetT) aSA(4) aSB(4) aX(4) aF(1). */
const STRIDE=23,total=pairs.length+extra.length,data=new Float32Array(total*STRIDE);
let n=0;
const write=(pa,pb,m,sa,sb,x,f)=>{const o=n++*STRIDE;data.set(pa,o);data.set(pb,o+3);data.set(m,o+6);data.set(sa,o+10);data.set(sb,o+14);data.set(x,o+18);data[o+22]=f;};
const rankCount=pairs.length;
pairs.forEach(([pa,pb],i)=>{
 const delay=Math.min(1,pa.t*.82+rand()*.18),kind=pb.role==='vanish'?9:pb.kind;
 const bp=pb.role==='vanish'?[0,0,0]:pb.p;
 write(pa.p,bp,[kind,rand()*100,delay,pa.t],[pa.size,pa.alpha,pa.shape,pa.color],[pb.size,pb.alpha,pb.shape,pb.color],pb.x,pa.fill||0);
});
extra.forEach(e=>write(e.a,e.a,[e.kind,rand()*100,0,e.kind===8?0:0],[e.size,e.alpha,0,e.color],[e.size,e.kind===8?0:e.alpha,0,e.color],[0,0,0,-1],0));

/* Shaders. */
const f=n=>n.toFixed(4);
const GLSL_PATH=`const float HALF=${f(HALF)};
vec3 path(float s){return vec3(${f(PATH.amp)}*sin(s*${f(PATH.freq)}+${f(PATH.phase)})*(1.-${f(PATH.damp)}*s),${f(PATH.y0)}+${f(PATH.y1)}*s,${f(PATH.z0)}+${f(PATH.z1)}*s);}
vec3 lat(float s){vec3 d=path(s+.002)-path(s-.002);return normalize(vec3(-d.z,0.,d.x));}
vec3 along(float s,float u,float h){return path(s)+lat(s)*u*HALF+vec3(0.,h,0.);}`;
const VS_POINTS=`precision highp float;
attribute vec3 aA;attribute vec3 aB;attribute vec4 aM;attribute vec4 aSA;attribute vec4 aSB;attribute vec4 aX;attribute float aF;
uniform mat4 uProj,uView,uSheet,uWorld;uniform vec2 uShift;uniform vec3 uCamR,uCamU;
uniform float uPx,uTime,uPeople,uMorph,uAssemble,uScan,uScanVis,uPortalF;uniform vec4 uGateS,uGateF,uOrbF;
varying vec4 vC;varying float vS,vP;
${GLSL_PATH}
float hash(float n){return fract(sin(n*12.9898)*43758.5453);}
vec3 pal(float i){if(i<.5)return vec3(.765,.776,1.);if(i<1.5)return vec3(.36,.43,1.);if(i<2.5)return vec3(.96,.965,.98);if(i<3.5)return vec3(.8,.937,.678);return vec3(.204,.271,.922);}
float pick(vec4 v,float k){return dot(v,vec4(equal(vec4(k),vec4(0.,1.,2.,3.))));}
void main(){
 float kind=aM.x,seed=aM.y,delay=aM.z,st=aM.w;
 bool ambient=kind<.5,scan=kind>7.5&&kind<8.5;
 float ea=ambient?1.:clamp(uAssemble*1.6-st*.45-hash(seed)*.15,0.,1.);ea=1.-pow(1.-ea,3.);
 vec3 pa;
 if(ambient)pa=(uWorld*vec4(aA,1.)).xyz;
 else{vec3 q=aA;if(scan)q.y=mix(1.47,-1.47,uScan);pa=(uSheet*vec4(q,1.)).xyz;
  vec3 dir=normalize(vec3(hash(seed+1.),hash(seed+2.),hash(seed+3.))-.5+.0001);pa+=dir*(1.-ea)*(1.6+2.4*hash(seed+4.));}
 vec3 pb=aB;float flow=-1.;
 if(kind>1.5&&kind<2.5){flow=fract(aB.x+uTime*.0035);pb=along(flow,aB.y,aB.z);}
 else if(kind>2.5&&kind<4.5){flow=fract(aB.x+uPeople*aX.x);pb=along(flow,aB.y,aB.z);pb.y+=.006*abs(sin(uTime*3.2+aX.y*1.7));}
 else if(kind>4.5&&kind<5.5){float r=uTime*.2+aX.w;vec3 o=aX.xyz;o.xz=mat2(cos(r),sin(r),-sin(r),cos(r))*o.xz;pb=aB+o;}
 else if(kind>6.5&&kind<7.5)pb=aB+uCamR*aX.x+uCamU*aX.y;
 if(scan||kind>8.5)pb=pa;else pb=(uWorld*vec4(pb,1.)).xyz;
 float lm=clamp((uMorph-delay*.42)/.58,0.,1.),em=lm*lm*(3.-2.*lm),fl=sin(3.14159*em);
 vec3 p=mix(pa,pb,em)+vec3(.1,.5,.32)*fl*(.25+hash(seed+5.))*(ambient?0.:1.);
 if(ambient)p+=vec3(sin(uTime*.07+seed*9.)*.14,sin(uTime*.05+seed*5.)*.2,cos(uTime*.06+seed*7.)*.14);
 vec3 ca=pal(aSA.w),cb=pal(aSB.w);float sa=aSA.x,aa=aSA.y,sha=aSA.z,sb=aSB.x,ab=aSB.y;
 float done=step(st,uScan)*step(.5,aF);
 sha=mix(sha,2.,done);ca=mix(ca,pal(3.),done);aa=mix(aa,.95,done);sa*=mix(1.,.84,done);
 if(!ambient&&!scan){float beam=exp(-pow((st-uScan)*30.,2.))*uScanVis;aa+=beam*.5;ca=mix(ca,vec3(1.),beam*.6);}
 if(scan)aa*=uScanVis;
 if(!ambient)aa*=ea;
 if(flow>=0.){ab*=kind>2.5?smoothstep(.09,.17,flow)*smoothstep(.965,.935,flow):smoothstep(0.,.05,flow)*smoothstep(1.,.95,flow);
  if(kind>2.5){float f=0.;for(int k=0;k<4;k++){float d=flow-uGateS[k];f=max(f,exp(-d*d*4200.));}
   cb=mix(cb,pal(3.),f*.9);ab=min(1.,ab+f*.6);sb*=1.+f*.3;cb=mix(cb,vec3(1.),flow*.3);}}
 if(kind>.5&&kind<1.5&&aX.w>-.5){float gf=aX.w>3.5?uPortalF:pick(uGateF,aX.w);ab+=gf*.22;cb=mix(cb,vec3(.86,.9,1.),gf*.3);}
 if(kind>4.5&&kind<7.5){float of=pick(uOrbF,aX.w);ab+=of*.45;cb=mix(cb,pal(3.),of*.4);}
 float size=mix(sa,sb,em)*(1.+fl*.35),alpha=mix(aa,ab,em)+fl*.16*(ambient?0.:1.);
 vec3 col=mix(mix(ca,cb,em),vec3(.86,.9,1.),fl*.4);
 vec4 v=uView*vec4(p,1.),c=uProj*v;c.xy+=uShift*c.w;gl_Position=c;
 float px=size*uPx/c.w;alpha*=clamp(1.32-(c.w-6.)*.055,.3,1.)*smoothstep(2.,3.3,c.w);
 if(px<1.6){alpha*=px/1.6;px=1.6;}
 gl_PointSize=px;vC=vec4(col,clamp(alpha,0.,1.));vS=mix(sha,aSB.z,em);vP=kind>2.5&&kind<4.5?sin(uTime*3.2+aX.y*1.7):0.;
}`;
/* WebGL setup. Without WebGL the original artwork is shown instead. */
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);const img=$('.cover-fallback',slide);if(img){img.loading='eager';img.src=img.getAttribute('src');}stage.classList.add('is-fallback');}
let gl=null,program,attribs,P,L,K,BG,pointBuf,lineBuf,sparkBuf,quadBuf,ready=false;
function init(){
 try{
  const kit=window.ELMY_LIGHT.context(canvas);
  if(!kit)throw new Error('WebGL unavailable');
  ({gl,program,attribs}=kit);
  P=program(VS_POINTS,FS_POINTS);L=program(VS_FLAT,FS_LINE);K=program(VS_FLAT,FS_SPARK);BG=program(VS_BG,FS_BG);
  pointBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pointBuf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
  lineBuf=gl.createBuffer();sparkBuf=gl.createBuffer();
  quadBuf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quadBuf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});
  ready=true;stage.classList.remove('is-fallback');
 }catch(e){useFallback(e.message||e);}
}

/* Scene state, animated by GSAP. */
const S={assemble:1,scan:1,scanVis:0,morph:1};
let goal=1,step=2,motion=true,active=false,played=false,time=0,people=0,last=0,raf=0,tl=null,textTl=null,frames=0,rays=0;
const look={yaw:0,pitch:0,ty:0,tp:0};
let layout={shift:[.42,.02],fov:CAMERA.fov,mobile:false};

// Static lines: node stems and the sagging wire that links the four nodes.
const staticLines=[];
const pushLine=(p,q,c,a1,a2=a1)=>staticLines.push(...p,...c,a1,0,...q,...c,a2,0);
ORBS.forEach(o=>pushLine([o.center[0],o.center[1]-.25,o.center[2]],o.ground,[.76,.78,1],.36,0));
const wire=[];for(let k=0;k<ORBS.length-1;k++){const p=ORBS[k].center,q=ORBS[k+1].center,seg=[];for(let i=0;i<=24;i++){const t=i/24;seg.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t-Math.sin(Math.PI*t)*.32,p[2]+(q[2]-p[2])*t]);}wire.push(seg);for(let i=0;i<24;i++)pushLine(seg[i],seg[i+1],[.76,.78,1],.24);}
const lineData=new Float32Array(staticLines.length+PEOPLE*GATES.length*16),sparkData=new Float32Array(400*8);
const pointOnWire=(seg,t)=>{const f=t*(seg.length-1),i=Math.min(seg.length-2,Math.floor(f)),k=f-i;return[seg[i][0]+(seg[i+1][0]-seg[i][0])*k,seg[i][1]+(seg[i+1][1]-seg[i][1])*k,seg[i][2]+(seg[i+1][2]-seg[i][2])*k];};

function measure(){
 const aspect=window.ELMY_LIGHT.fit(canvas),mobile=(canvas.clientWidth||innerWidth)<=900;
 layout=mobile?{shift:[aspect<.8?-.12:.12,aspect<.8?-.42:-.2],fov:aspect<.8?.9:.64,mobile}:{shift:[.42*Math.min(1,aspect/1.6),.02],fov:aspect<1.45?.58:CAMERA.fov,mobile};
 return aspect;
}
function render(){
 if(!ready||!gl)return;
 const aspect=measure();
 gl.viewport(0,0,canvas.width,canvas.height);
 const proj=M.perspective(layout.fov,aspect,.1,60),view=M.lookAt(CAMERA.eye,CAMERA.target,[0,1,0]);
 const drift=motion?Math.sin(time*.11)*.035:0;
 const turn=compose(M.ry(look.yaw+drift),M.rx(look.pitch)),world=M.mul(turn,M.ry(YAW));
 const float=motion?Math.sin(time*.5)*.025:0;
 const sheet=compose(turn,M.translate(.28,.08+float,0),M.ry(.3+(motion?Math.sin(time*.23)*.03:0)),M.rx(-.3),M.rz(-.02),M.scale(.8));
 const px=(canvas.height/2)/Math.tan(layout.fov/2);
 // People positions drive gateway flashes, evidence rays and node pulses.
 const gateF=[0,0,0,0],orbF=[0,0,0,0];let portalF=0,lines=staticLines.length,sparks=0;rays=0;
 lineData.set(staticLines);
 const visB=Math.max(0,Math.min(1,(S.morph-.82)/.18));
 const spark=(p,size,c,alpha)=>{if(sparks>=400)return;sparkData.set([...p,...c,alpha,size],sparks*8);sparks++;};
 if(visB>0){
  for(const w of walkers){const s=((w.s0+people*w.speed)%1+1)%1;
   GATES.forEach((gs,k)=>{const d=s-gs;gateF[k]=Math.min(1,gateF[k]+Math.exp(-d*d*4200));
    if(d>0&&d<.034){const t=d/.034,head=along(s,w.u,.3),orb=ORBS[k].center,alpha=Math.sin(Math.PI*Math.min(1,t*1.15))*.7*visB;
     lineData.set([...head,.8,.94,.68,alpha,0,...orb,.8,.94,.68,alpha*.35,0],lines);lines+=16;rays++;
     // A short comet of evidence travels from the candidate to the node.
     const e=1-Math.pow(1-t,2);for(let j=0;j<6;j++){const q=e-j*.035;if(q<=0)break;spark([head[0]+(orb[0]-head[0])*q,head[1]+(orb[1]-head[1])*q,head[2]+(orb[2]-head[2])*q],.06*(1-j*.12),[.8,.94,.68],.95*(1-j/6)*visB);}
     orbF[k]=Math.min(1,orbF[k]+Math.exp(-Math.pow((t-.92)*7,2)));}});
   const dp=s-PORTAL;portalF=Math.min(1,portalF+Math.exp(-dp*dp*3000)*.6);}
  wire.forEach((seg,k)=>{for(let j=0;j<2;j++){const t=((time*.16+j*.5+k*.27)%1);spark(pointOnWire(seg,t),.04,[.86,.88,1],Math.sin(Math.PI*t)*.85*visB);}});
 }
 // Background with a glow that follows the focus of the current state.
 const vp=M.mul(proj,view);
 const focus=p=>{const c=M.apply(vp,p);return[(c[0]/c[3]+layout.shift[0])*.5+.5,(c[1]/c[3]+layout.shift[1])*.5+.5];};
 const fa=focus(M.apply(sheet,[0,0,0])),fb=focus(M.apply(world,path(PORTAL))),m=S.morph;
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quadBuf,[['aP',2,0]],2);
 gl.uniform2f(BG.u.uRes,canvas.width,canvas.height);gl.uniform2f(BG.u.uVig,.62,.52);gl.uniform2f(BG.u.uGlow,fa[0]+(fb[0]-fa[0])*m,fa[1]+(fb[1]-fa[1])*m);gl.uniform1f(BG.u.uGlowA,.75+.35*m);
 gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 // Particles.
 gl.useProgram(P.p);attribs(P,pointBuf,[['aA',3,0],['aB',3,3],['aM',4,6],['aSA',4,10],['aSB',4,14],['aX',4,18],['aF',1,22]],STRIDE);
 const u=P.u;gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniformMatrix4fv(u.uSheet,false,sheet);gl.uniformMatrix4fv(u.uWorld,false,world);
 // Pictograms face the camera: express its axes in the scene's pre-rotation space.
 const toScene=v=>[0,1,2].map(i=>world[i*4]*v[0]+world[i*4+1]*v[1]+world[i*4+2]*v[2]);
 gl.uniform2f(u.uShift,layout.shift[0],layout.shift[1]);gl.uniform3f(u.uCamR,...toScene([view[0],view[4],view[8]]));gl.uniform3f(u.uCamU,...toScene([view[1],view[5],view[9]]));
 gl.uniform1f(u.uPx,px);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uPeople,people);gl.uniform1f(u.uMorph,S.morph);gl.uniform1f(u.uAssemble,S.assemble);gl.uniform1f(u.uScan,S.scan);gl.uniform1f(u.uScanVis,S.scanVis);gl.uniform1f(u.uPortalF,portalF);
 gl.uniform4f(u.uGateS,...GATES);gl.uniform4f(u.uGateF,...gateF);gl.uniform4f(u.uOrbF,...orbF);
 gl.drawArrays(gl.POINTS,0,total);
 // Lines and sparks.
 if(visB>0){
  for(const[info,mode,buf,arr,count]of[[L,gl.LINES,lineBuf,lineData,lines/8],[K,gl.POINTS,sparkBuf,sparkData,sparks]]){if(!count)continue;
   gl.useProgram(info.p);gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,arr.subarray(0,count*8),gl.DYNAMIC_DRAW);attribs(info,buf,[['aP',3,0],['aC',4,3],['aS',1,7]],8);
   gl.uniformMatrix4fv(info.u.uProj,false,proj);gl.uniformMatrix4fv(info.u.uView,false,view);gl.uniformMatrix4fv(info.u.uWorld,false,world);gl.uniform2f(info.u.uShift,layout.shift[0],layout.shift[1]);
   if(info.u.uPx)gl.uniform1f(info.u.uPx,px);gl.uniform1f(info.u.uVis,visB);gl.uniform2f(info.u.uFog,6,.055);gl.uniform1f(info.u.uMirror,0);gl.drawArrays(mode,0,count);}
 }
 frames++;
}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;if(S.morph>.9)people+=dt*Math.min(1,(S.morph-.9)*10);
 look.yaw+=(look.ty-look.yaw)*Math.min(1,dt*2.4);look.pitch+=(look.tp-look.pitch)*Math.min(1,dt*2.4);render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Presenter reveals: 0 the title alone over the examination sheet, 1 the subtitle as the sheet
   becomes the connected path, 2 the presenter identity. */
const STEPS=2;
function kill(){tl?.kill();tl=null;}
function finish(){if(tl){tl.progress(1,true);kill();}Object.assign(S,{assemble:1,scan:1,scanVis:0,morph:goal});}
function go(i,animate=motion){i=i?1:0;if(i===goal&&!tl)return;goal=i;kill();
 if(!g||!animate||!ready){Object.assign(S,{assemble:1,scan:1,scanVis:0,morph:i});render();return;}
 if(i===0)tl=g.timeline().to(S,{assemble:1,duration:.6},0).to(S,{morph:0,duration:2.4,ease:'power2.inOut'},0).set(S,{scan:0},.2).to(S,{scanVis:1,duration:.3},1.9).to(S,{scan:1,duration:1.5,ease:'power1.inOut'},2).to(S,{scanVis:0,duration:.5},3.4);
 else tl=g.timeline().to(S,{assemble:1,duration:.6},0).to(S,{scanVis:0,duration:.3},0).to(S,{scan:1,duration:.3},0).to(S,{morph:1,duration:2.9,ease:'power2.inOut'},0);
}
function setStep(i,animate=motion){i=Math.max(0,Math.min(STEPS,i));step=i;slide.dataset.coverStep=String(i);go(i>=1?1:0,animate);}
function intro(){kill();goal=0;Object.assign(S,{assemble:0,scan:0,scanVis:0,morph:0});
 tl=g.timeline()
  .to(S,{assemble:1,duration:2.2,ease:'power2.out'},.1)
  .to(S,{scanVis:1,duration:.35},1.45).to(S,{scan:1,duration:1.75,ease:'power1.inOut'},1.5).to(S,{scanVis:0,duration:.5},3.25);
}
function text(full){textTl?.kill();if(!g||!motion){settleText();return;}
 textTl=g.timeline().fromTo($$('.cover-line>span',slide),{yPercent:112},{yPercent:0,duration:1.3,stagger:.11,ease:'power4.out'},full?.35:.05);
}
function settleText(){textTl?.kill();textTl=null;if(g)g.set($$('.cover-line>span',slide),{clearProps:'transform'});}

addEventListener('pointermove',e=>{if(!active||layout.mobile)return;look.ty=(e.clientX/innerWidth-.5)*.16;look.tp=(e.clientY/innerHeight-.5)*.07;},{passive:true});
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);

window.ELMY_COVER={
 id:'opening',keys:['ArrowUp','ArrowDown'],
 activate(s,on){motion=on;const was=active;active=s===slide;document.body.classList.toggle('on-cover',active);
  if(!active){stop();finish();textTl?.progress(1,true);played=true;return;}
  if(was)return;
  // First visit starts on the title alone; returning to the cover shows it complete.
  if(!played){played=true;step=0;slide.dataset.coverStep='0';if(on&&g&&ready){intro();text(true);}else{goal=0;finish();text(false);}}
  else{step=STEPS;slide.dataset.coverStep=String(STEPS);goal=1;finish();text(false);}
  render();start();},
 mode(on){motion=on;if(!on){finish();settleText();stop();look.ty=look.tp=0;look.yaw=look.pitch=0;render();}else start();},
 key(k){if(k==='ArrowUp')setStep(step-1);else if(step<STEPS)setStep(step+1);else document.getElementById('next')?.click();},
 next(){if(step>=STEPS)return false;setStep(step+1);return true;},
 prev(){if(step<=0)return false;setStep(step-1);return true;},
 get step(){return step;},
 debug:{S,at(t,p=0){if(!tl||!tl.paused()){intro();text(true);}tl.pause().time(t);textTl?.pause().time(t);time=t;people=p;render();},step:setStep,replay(){if(!g||!ready)return;played=true;intro();text(true);start();},seek(o={}){if(o.time!==undefined)time=o.time;if(o.people!==undefined)people=o.people;Object.assign(S,o.state||{});render();},get state(){return{...S,step,goal,ready,time,people,frames,particles:total,rays,canvas:[canvas.width,canvas.height]};}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_COVER);
init();
})();

/* Institution scene: the recruitment continuum. Six stage gateways stand before four principle
   columns that carry one lintel, the Civil Service Board; beams show which principle governs each
   stage. The slide opens on the examination alone, then pulls back to reveal the whole.
   Local WebGL and GSAP only; assets/institution-sculpture.png is the no-WebGL fallback. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="institution"]');if(!slide||!window.ELMY_LIGHT)return;
const{rng,M,FS_POINTS,VS_FLAT,FS_SPARK,VS_BG,FS_BG}=window.ELMY_LIGHT,g=window.gsap,rand=rng(2026);
const stage=$('.ct-stage',slide),canvas=$('.ct-canvas',slide),steps=$$('.ct-step',slide),pillars=$$('.ct-pillar',slide),lintelTag=$('.ct-lintel',slide);
const panel={count:$('.ct-count b',slide),principle:$('.ct-principle em',slide),name:$('.ct-name',slide),text:$('.ct-text',slide)};
const PRINCIPLES=['Fairness','Merit','Integrity','Accountability'];
const STAGES=steps.map(b=>({name:$('b',b).textContent,principle:PRINCIPLES.indexOf(b.dataset.principle),copy:b.dataset.copy}));
const pad=n=>String(n).padStart(2,'0');

/* Geometry in world units: gateways straddle a path along x; columns stand behind at COLZ. */
const FLOOR=-1,GATE_R=.5,GATE_H=.8,HALF=.4,COLX=[-2,-.7,.7,2],COLZ=-1.6,COL_TOP=1.75,COL_R=.2,ATTACH=.7,EXAM=3;
const gateX=i=>-2.5+i;
const apex=i=>[gateX(i),FLOOR+GATE_H+GATE_R+.07,0];
const anchor=c=>[COLX[c],ATTACH,COLZ+COL_R+.03];
function beamPoint(i,t){const p=anchor(STAGES[i].principle),q=apex(i),dx=Math.abs(q[0]-p[0]),c=[(p[0]+q[0])/2,Math.max(p[1],q[1])+.5+.24*dx,(p[2]+q[2])/2+.4],u=1-t;
 return[u*u*p[0]+2*u*t*c[0]+t*t*q[0],u*u*p[1]+2*u*t*c[1]+t*t*q[1],u*u*p[2]+2*u*t*c[2]+t*t*q[2]];}

/* Particles: position(3), kind, index, reveal key, seed, size, alpha, shape, colour. */
const STRIDE=11,raw=[];
const put=(p,kind,idx,key,size,alpha,shape=0,color=0)=>raw.push(p[0],p[1],p[2],kind,idx,key,rand()*100,size,alpha,shape,color);
const fromExam=x=>Math.min(1,Math.abs(x-gateX(EXAM))/6.5);
// 1 path: surface, edges and slab sides, revealed outward from the examination gateway.
const PATH=[-3.7,4.1],edgeFade=x=>Math.min(1,(x-PATH[0])/.7,(PATH[1]-x)/.7);
for(let i=0;i<2400;i++){const x=PATH[0]+rand()*(PATH[1]-PATH[0]);put([x,FLOOR,(rand()*2-1)*HALF],1,0,fromExam(x),.012,.26*edgeFade(x),0,rand()<.4?0:2);}
for(let i=0;i<1600;i++){const x=PATH[0]+(i>>1)/800*(PATH[1]-PATH[0]);put([x,FLOOR,i%2?HALF:-HALF],1,0,fromExam(x),.014,.75*edgeFade(x));}
for(let i=0;i<560;i++){const x=PATH[0]+rand()*(PATH[1]-PATH[0]);put([x,FLOOR-rand()*.12,rand()<.5?HALF:-HALF],1,0,fromExam(x),.009,.18*edgeFade(x),0,4);}
// 2 floor: a quiet plaza grid around the path.
for(let x=-4.5;x<=5;x+=.25)for(let z=-3.5;z<=3;z+=.25){if(Math.abs(z)<HALF+.1)continue;const fade=Math.max(0,1-Math.hypot(x*.8,z)/4.6);if(fade>0)put([x,FLOOR,z],2,0,fromExam(x)*.8+Math.abs(z)*.04,.011,.11*fade);}
// 3 gateways: outer and inner arches, front and back, a glass body and a soft bloom.
function gateway(i){const x0=gateX(i),key=Math.abs(i-EXAM)*.15;
 const at=(z,y,d,s,a,c=1)=>put([x0+d,FLOOR+y,z],3,i,key,s,a,0,c);
 for(const r of[GATE_R,GATE_R-.08])for(const d of[-.045,.045]){for(let y=0;y<=GATE_H;y+=.012){at(-r,y,d,.02,.5);at(r,y,d,.02,.5);}const n=Math.round(Math.PI*r/.012);for(let k=1;k<n;k++){const q=Math.PI*k/n;at(-Math.cos(q)*r,GATE_H+Math.sin(q)*r,d,.02,.5);}}
 const onArch=r=>{const len=2*GATE_H+Math.PI*r,m=rand()*len;if(m<GATE_H)return[-r,m];if(m<GATE_H+Math.PI*r){const q=(m-GATE_H)/r;return[-Math.cos(q)*r,GATE_H+Math.sin(q)*r];}return[r,m-GATE_H-Math.PI*r];};
 for(let k=0;k<90;k++){const[z,y]=onArch(GATE_R-.08+rand()*.08);at(z,y,(rand()*2-1)*.045,.011,.15);}
 for(let k=0;k<240;k++){const[z,y]=onArch(GATE_R-.04);at(z,y,0,.24,.014);}
 // A pool of light on the floor beneath the gateway (kind 9), lit when the stage is active.
 for(let k=0;k<260;k++){const a=rand()*Math.PI*2,r=Math.pow(rand(),.7)*.8;put([x0+Math.cos(a)*r*.75,FLOOR+.005,Math.sin(a)*r],9,i,key,.07+rand()*.06,.05*(1-r/.85),0,3);}
}
for(let i=0;i<6;i++)gateway(i);
// 4 columns: fluted shafts with base and capital rings; the key is the height fraction, so they rise.
function column(c){const x0=COLX[c],H=COL_TOP-FLOOR,at=(p,s,a,col=0)=>put(p,4,c,(p[1]-FLOOR)/H,s,a,0,col);
 for(let f=0;f<16;f++){const q=f/16*Math.PI*2;for(let y=FLOOR+.2;y<=COL_TOP-.18;y+=.016)at([x0+Math.cos(q)*COL_R,y,COLZ+Math.sin(q)*COL_R],.0125,.3);}
 for(const[y,r]of[[FLOOR+.04,.31],[FLOOR+.1,.27],[FLOOR+.17,.23],[COL_TOP-.15,.23],[COL_TOP-.09,.27],[COL_TOP-.03,.31]])for(let k=0;k<96;k++){const q=k/96*Math.PI*2;at([x0+Math.cos(q)*r,y,COLZ+Math.sin(q)*r],.012,.58);}
 for(let y=FLOOR+.2;y<COL_TOP-.15;y+=.07)at([x0,y,COLZ],.3,.018,1);
}
for(let c=0;c<4;c++)column(c);
// 5 lintel: the Civil Service Board, drawn outward from its centre.
for(let x=-2.45;x<=2.45;x+=.012)for(const[y,z]of[[COL_TOP,COLZ+.33],[COL_TOP+.17,COLZ+.33],[COL_TOP,COLZ-.33],[COL_TOP+.17,COLZ-.33]])put([x,y,z],5,0,Math.abs(x)/2.45,.013,.55);
for(let i=0;i<1000;i++){const x=(rand()*2-1)*2.45;put([x,COL_TOP+rand()*.17,COLZ+.33],5,0,Math.abs(x)/2.45,.01,.12);}
for(let i=0;i<160;i++){const x=(rand()*2-1)*2.3;put([x,COL_TOP+.085,COLZ+.33],5,0,Math.abs(x)/2.45,.22,.016,0,1);}
// 6 beams from each principle to the stages it governs (key 0 at the column, 1 at the gateway).
STAGES.forEach((s,i)=>{for(let k=0;k<=160;k++)put(beamPoint(i,k/160),6,i,k/160,.0115,.55);for(let k=0;k<=60;k++)put(beamPoint(i,k/60),6,i,k/60,.13,.02,0,3);});
// 7 attachment nodes on the columns.
for(let c=0;c<4;c++){put(anchor(c),7,c,1,.17,.5,1,0);put(anchor(c),7,c,1,.06,.8,0,2);}
// 8 candidates walking the continuum.
const WALKERS=14;for(let i=0;i<WALKERS;i++)put([PATH[0]+rand()*(PATH[1]-PATH[0]),(rand()*2-1)*.24,.17],8,i,0,.36,.78,3,2);
// 0 atmosphere.
for(let i=0;i<320;i++){const big=rand()<.07;put([-5+rand()*11,-1+rand()*4.4,-6+rand()*9],0,0,0,big?.08+rand()*.1:.008+rand()*.024,big?.025+rand()*.025:.05+rand()*.17,0,rand()<.7?0:1);}
const data=new Float32Array(raw),total=data.length/STRIDE;

const VS_POINTS=`precision highp float;
attribute vec3 aP;attribute vec4 aK;attribute vec4 aS;
uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uPx,uTime,uMirror,uFloor,uPath;uniform vec4 uReveal;uniform float uGate[6],uCol[4];
varying vec4 vC;varying float vS,vP;
float hash(float n){return fract(sin(n*12.9898)*43758.5453);}
vec3 pal(float i){if(i<.5)return vec3(.765,.776,1.);if(i<1.5)return vec3(.36,.43,1.);if(i<2.5)return vec3(.96,.965,.98);if(i<3.5)return vec3(.8,.937,.678);return vec3(.204,.271,.922);}
void main(){
 float kind=aK.x,key=aK.z,seed=aK.w;int idx=int(aK.y+.5);
 vec3 p=aP,col=pal(aS.w);float a=aS.y,size=aS.x,show=1.;vP=0.;
 if(kind<.5){p+=vec3(sin(uTime*.07+seed*9.)*.2,sin(uTime*.05+seed*5.)*.25,cos(uTime*.06+seed*7.)*.2);}
 else if(kind<2.5){show=smoothstep(key,key+.06,uPath)*(kind>1.5?1.-uMirror:1.);}
 else if(kind<3.5){float r=clamp((uReveal.x*1.75-key)/.75,0.,1.),h=uGate[idx];show=r;p.y-=(1.-r)*.3;a*=.55+h*1.6;size*=1.+h*.2;col=mix(col,vec3(.86,.97,.78),h*.7);}
 else if(kind<4.5){float h=uCol[idx],front=exp(-pow((key-uReveal.y)*22.,2.))*(1.-step(.999,uReveal.y)),band=exp(-pow((key-fract(uTime*.3+float(idx)*.25))*12.,2.))*h;show=step(key,uReveal.y);a=a*(.45+h*1.5)+front*.9+band*.7;col=mix(col,vec3(.93,.95,1.),h*.45+front);col=mix(col,pal(3.),band*.6);}
 else if(kind<5.5){show=step(key,uReveal.z);}
 else if(kind<6.5){float h=uGate[idx];show=step(key,uReveal.w);a*=.2+h*1.25;col=mix(col,pal(3.),h*.85);size*=1.+h*.4;}
 else if(kind<7.5){float h=uCol[idx];show=uReveal.y;a*=.35+h*1.3;col=mix(col,pal(3.),h*.6);}
 else if(kind>8.5){float h=uGate[idx];show=clamp((uReveal.x*1.75-key)/.75,0.,1.)*(1.-uMirror);a*=.15+h*2.6;col=mix(pal(1.),col,h);}

 else if(kind<8.5){float x=mod(aP.x+3.7+uTime*(.13+.07*hash(seed)),7.8)-3.7;p=vec3(x,uFloor+aP.z+.006*abs(sin(uTime*3.2+aK.y*1.7)),aP.y);
  float f=0.;for(int i=0;i<6;i++){float d=x-(-2.5+float(i));f=max(f,exp(-d*d*70.)*(.3+uGate[i]*.7));}
  a*=smoothstep(-3.7,-3.1,x)*smoothstep(4.1,3.5,x)*smoothstep(.6,1.,uPath);col=mix(col,pal(3.),f*.9);a=min(1.,a+f*.35);vP=sin(uTime*3.2+aK.y*1.7);}
 if(uMirror>.5){p.y=2.*uFloor-p.y;a*=.17*exp(-(uFloor-p.y)*1.3);}
 vec4 v=uView*vec4(p,1.),c=uProj*v;c.xy+=uShift*c.w;gl_Position=c;
 float px=size*uPx/c.w;a*=show*clamp(1.25-(c.w-11.)*.05,.35,1.);if(px<1.6){a*=px/1.6;px=1.6;}
 gl_PointSize=px;vC=vec4(col,clamp(a,0.,1.));vS=aS.z;
}`;

/* WebGL. */
let gl=null,program,attribs,P,K,BG,pointBuf,sparkBuf,quadBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);const img=$('.ct-fallback',slide);if(img){img.loading='eager';img.src=img.getAttribute('src');}stage.classList.add('is-fallback');slide.classList.add('ct-flat');}
function init(){
 try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  P=program(VS_POINTS,FS_POINTS);K=program(VS_FLAT,FS_SPARK);BG=program(VS_BG,FS_BG);
  pointBuf=kit.buffer(data);sparkBuf=gl.createBuffer();quadBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;
 }catch(e){useFallback(e.message||e);}
}

/* Scene state (GSAP-animated), camera and layout. */
const S={gates:1,cols:1,lintel:1,beams:1,path:1,gate:[0,0,0,0,0,0],col:[0,0,0,0]};
const CLOSE={ex:2.35,ey:-.02,ez:2.3,tx:.45,ty:-.38,tz:-.05};
function view(i){const a=.685+(i-2.5)*.035,r=13.4,tx=-.4+(i-2.5)*.07;return{ex:tx+Math.sin(a)*r,ey:1.9,ez:-.9+Math.cos(a)*r,tx,ty:.3,tz:-.9};}
const cam={...view(0)},look={x:0,y:0,tx:0,ty:0};
let active=false,motion=true,played=false,current=0,time=0,last=0,raf=0,tl=null,textTl=null,panelTl=null,layout={shift:[.36,.02],fov:.5,flat:false},sparks=new Float32Array(64*8),frames=0;
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),w=canvas.clientWidth||innerWidth,flat=innerWidth<=900||stage.classList.contains('is-fallback');
 slide.classList.toggle('ct-flat',flat);layout=flat?{shift:[0,-.04],fov:aspect<.8?.78:.52,flat}:{shift:[aspect<1.45?.37:.34*Math.min(1,aspect/1.6),.04],fov:aspect<1.45?.62:.48,flat};return aspect;}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight,c[3]];}
const revealOf=i=>Math.max(0,Math.min(1,(S.gates*1.75-Math.abs(i-EXAM)*.15)/.75));

function render(){
 if(!ready)return;frames++;
 const aspect=measure(),W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const eye=[cam.ex+look.x*.7,cam.ey+look.y*.35,cam.ez],target=[cam.tx,cam.ty,cam.tz];
 const proj=M.perspective(layout.fov,aspect,.1,80),viewM=M.lookAt(eye,target,[0,1,0]),vp=M.mul(proj,viewM),px=(H/2)/Math.tan(layout.fov/2);
 // Sparks run from each principle down its beam; the active stage's beam runs faster and brighter.
 let n=0;const spark=(p,size,c,a)=>{if(n<64){sparks.set([...p,...c,a,size],n*8);n++;}};
 if(S.beams>.99)STAGES.forEach((s,i)=>{const on=S.gate[i],count=on>.5?3:1;for(let j=0;j<count;j++){const t=(time*(on>.5?.42:.18)+j/count+i*.17)%1;spark(beamPoint(i,t),.05+on*.03,on>.5?[.8,.94,.68]:[.76,.78,1],Math.sin(Math.PI*t)*(.35+on*.6));}});
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quadBuf,[['aP',2,0]],2);
 const glow=project(vp,[0,1.2,COLZ]);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,glow[0]/canvas.clientWidth,1-glow[1]/canvas.clientHeight);gl.uniform2f(BG.u.uVig,.6,.5);gl.uniform1f(BG.u.uGlowA,.55+.45*S.cols);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 for(const mirror of[1,0]){
  gl.useProgram(P.p);attribs(P,pointBuf,[['aP',3,0],['aK',4,3],['aS',4,7]],STRIDE);const u=P.u;
  gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,viewM);gl.uniform2f(u.uShift,...layout.shift);
  gl.uniform1f(u.uPx,px);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uMirror,mirror);gl.uniform1f(u.uFloor,FLOOR);gl.uniform1f(u.uPath,S.path);
  gl.uniform4f(u.uReveal,S.gates,S.cols,S.lintel,S.beams);gl.uniform1fv(u.uGate,S.gate);gl.uniform1fv(u.uCol,S.col);
  gl.drawArrays(gl.POINTS,0,total);
  if(n){gl.useProgram(K.p);gl.bindBuffer(gl.ARRAY_BUFFER,sparkBuf);gl.bufferData(gl.ARRAY_BUFFER,sparks.subarray(0,n*8),gl.DYNAMIC_DRAW);attribs(K,sparkBuf,[['aP',3,0],['aC',4,3],['aS',1,7]],8);
   gl.uniformMatrix4fv(K.u.uProj,false,proj);gl.uniformMatrix4fv(K.u.uView,false,viewM);gl.uniformMatrix4fv(K.u.uWorld,false,M.translate(0,0,0));gl.uniform2f(K.u.uShift,...layout.shift);
   gl.uniform1f(K.u.uPx,px);gl.uniform1f(K.u.uVis,1);gl.uniform2f(K.u.uFog,11,.05);gl.uniform1f(K.u.uMirror,mirror);gl.uniform1f(K.u.uFloor,FLOOR);gl.drawArrays(gl.POINTS,0,n);}
 }
 place(vp);
}
/* HTML labels follow their 3D anchors: stage buttons under the gateways, principles on the columns. */
function place(vp){
 if(layout.flat){steps.forEach(b=>{b.style.transform='';b.style.opacity='';});pillars.forEach(t=>t.style.opacity='0');if(lintelTag)lintelTag.style.opacity='0';return;}
 steps.forEach((b,i)=>{const[x,y]=project(vp,[gateX(i),FLOOR,HALF+.24]);b.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0)`;b.style.opacity=String(revealOf(i));b.style.visibility=revealOf(i)>.02?'visible':'hidden';});
 pillars.forEach((t,c)=>{const[x,y]=project(vp,[COLX[c],COL_TOP-.42,COLZ+COL_R+.05]);t.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;t.style.opacity=String(Math.max(0,Math.min(1,(S.cols-.75)*4)));});
 if(lintelTag){const[x,y]=project(vp,[0,COL_TOP+.3,COLZ]);lintelTag.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-100%)`;lintelTag.style.opacity=String(Math.max(0,Math.min(1,(S.lintel-.6)*2.5)));}
}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;look.x+=(look.tx-look.x)*Math.min(1,dt*2.2);look.y+=(look.ty-look.y)*Math.min(1,dt*2.2);render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Stage state: highlights, camera orbit, labels and the reading panel. */
function highlight(i){return{gate:S.gate.map((_,k)=>k===i?1:0),col:S.col.map((_,c)=>c===STAGES[i].principle?1:0)};}
function write(i){const s=STAGES[i];panel.count.textContent=pad(i+1);panel.principle.textContent=PRINCIPLES[s.principle];panel.name.textContent=s.name;panel.text.textContent=s.copy;
 steps.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));pillars.forEach((t,c)=>t.classList.toggle('is-on',c===s.principle));slide.dataset.stage=String(i+1);slide.style.setProperty('--stage',String(i+1));}
function go(i,animate=motion){i=Math.max(0,Math.min(5,i));if(i===current&&!tl)return;const previous=current;current=i;tl?.progress(1);tl=null;
 const h=highlight(i);
 if(!g||!animate||!ready){S.gate=h.gate;S.col=h.col;Object.assign(cam,view(i));write(i);render();return;}
 g.to(S.gate,{...Object.fromEntries(h.gate.map((v,k)=>[k,v])),duration:.7,ease:'power2.out',overwrite:true});
 g.to(S.col,{...Object.fromEntries(h.col.map((v,k)=>[k,v])),duration:.7,ease:'power2.out',overwrite:true});
 g.to(cam,{...view(i),duration:1.4,ease:'power3.inOut',overwrite:true});
 const parts=[panel.name,panel.text,$('.ct-principle',slide),panel.count],dir=i>previous?1:-1;
 panelTl?.progress(1);panelTl=g.timeline().to(parts,{opacity:0,y:-10*dir,duration:.22,ease:'power2.in',stagger:.03}).add(()=>write(i)).fromTo(parts,{opacity:0,y:14*dir},{opacity:1,y:0,duration:.6,ease:'power3.out',stagger:.05});
}
function intro(){
 Object.assign(S,{gates:0,cols:0,lintel:0,beams:0,path:0});S.gate=[0,0,0,1,0,0];S.col=[0,0,0,0];Object.assign(cam,CLOSE);current=0;write(0);
 tl=g.timeline()
  .to(S,{gates:.32,path:.14,duration:1.1,ease:'power2.out'},.1)
  .to(cam,{...view(0),duration:3,ease:'power2.inOut'},1.05)
  .to(S,{path:1,duration:2.2,ease:'power2.inOut'},1.3)
  .to(S,{gates:1,duration:1.7,ease:'power2.out'},1.5)
  .to(S,{cols:1,duration:1.35,ease:'power2.out'},2.35)
  .to(S,{lintel:1,duration:.9,ease:'power2.inOut'},3.3)
  .to(S,{beams:1,duration:1,ease:'power2.inOut'},3.6)
  .to(S.gate,{0:1,3:0,duration:.8,ease:'power2.inOut'},4.1)
  .to(S.col,{[STAGES[0].principle]:1,duration:.8,ease:'power2.inOut'},4.1);
}
function text(full){textTl?.kill();if(!g||!motion){settleText();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.ct-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.ct-line>span'),{yPercent:112},{yPercent:0,duration:1.2,stagger:.1,ease:'power4.out'},full?.2:.05)
  .fromTo(q('.ct-thesis'),{opacity:0,y:12},{opacity:1,y:0,duration:.9},full?2.5:.3)
  .fromTo(q('.ct-panel'),{opacity:0,y:18},{opacity:1,y:0,duration:1},full?4:.4)
  .fromTo(q('.ct-hint,.ct-foot'),{opacity:0},{opacity:1,duration:1},full?4.5:.6);
}
function settleText(){textTl?.kill();textTl=null;if(g)g.set($$('.ct-kicker,.ct-line>span,.ct-thesis,.ct-panel,.ct-hint,.ct-foot,.ct-name,.ct-text,.ct-principle,.ct-count b',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}Object.assign(S,{gates:1,cols:1,lintel:1,beams:1,path:1});const h=highlight(current);S.gate=h.gate;S.col=h.col;Object.assign(cam,view(current));write(current);}

steps.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||layout.flat||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});
addEventListener('pointermove',e=>{if(!active||layout.flat)return;look.tx=(e.clientX/innerWidth-.5);look.ty=-(e.clientY/innerHeight-.5);},{passive:true});
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);

window.ELMY_CONTINUUM={
 id:'institution',keys:['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}render();start();},
 mode(on){motion=on;if(!on){finish();settleText();stop();look.tx=look.ty=look.x=look.y=0;render();}else start();},
 key(k){if(['ArrowDown','PageDown'].includes(k))go(current+1);else if(['ArrowUp','PageUp'].includes(k))go(current-1);else if(k==='Home')go(0);else if(k==='End')go(5);},
 go,
 debug:{S,cam,at(t){if(!tl||!tl.paused()){intro();text(true);}tl.pause().time(t);textTl?.pause().time(t);time=t;render();},get state(){return{current,ready,frames,particles:total,canvas:[canvas.width,canvas.height],failure:canvas.dataset.failure||null};}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_CONTINUUM);
init();
})();

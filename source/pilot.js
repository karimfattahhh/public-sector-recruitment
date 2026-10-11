/* Pilot scene, the deck's close. Act one: five floating steps (Understand, Design, Pilot, Evaluate,
   Scale) rise into depth with a checkpoint on the path between each; a walking figure climbs one
   step per phase, finished steps turn solid and Scale shows broader use only as dashed platforms
   that need a separate decision. Act two, the finale: the roadmap copy clears, the camera glides
   down behind the figure at the foot of the stairs, a light runs up the path toward a warm horizon
   and the end card asks the closing question. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="pilot"]');if(!slide||!window.ELMY_LIGHT)return;
const{M,FS_POINTS}=window.ELMY_LIGHT,g=window.gsap;
const PH=JSON.parse($('.pl-data',slide).textContent);
const canvas=$('.pl-canvas',slide),steps=$$('.pl-step',slide),tagStart=$('.pl-start',slide),tagBroad=$('.pl-broad',slide),revealBtn=$('.pl-reveal',slide);
const panel={num:$('.pl-num',slide),count:$('.pl-count',slide),name:$('.pl-name',slide),title:$('.pl-detail h3',slide),text:$('.pl-text',slide),check:$('.pl-check',slide)};
const pad=n=>String(n).padStart(2,'0'),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t;

/* Geometry: step tops rise to the right and back; two dashed platforms sit beside the last. */
const HX=.46,HZ=.46,R=.12,TH=.14,STEP=k=>[-1.4+.72*k,.6*k,1-.6*k],SATS=[[-1.05,.18,-.75],[.4,.3,-1.2]];
const mesh=[],vtx=(x,y,z,lx,lz,face,shade)=>mesh.push(x,y,z,lx,lz,face,shade);
const outline=[];for(const[cx,cz,a0]of[[HX-R,HZ-R,0],[-(HX-R),HZ-R,Math.PI/2],[-(HX-R),-(HZ-R),Math.PI],[HX-R,-(HZ-R),1.5*Math.PI]])for(let k=0;k<=10;k++){const a=a0+k/10*Math.PI/2;outline.push([cx+Math.cos(a)*R,cz+Math.sin(a)*R,Math.cos(a),Math.sin(a)]);}
for(let k=0;k<outline.length;k++){const a=outline[k],b=outline[(k+1)%outline.length],shade=clamp(.55*a[3]+.45*a[2]+.2);
 vtx(a[0],0,a[1],a[0],a[1],1,shade);vtx(b[0],0,b[1],b[0],b[1],1,shade);vtx(a[0],-TH,a[1],a[0],a[1],1,shade);vtx(b[0],0,b[1],b[0],b[1],1,shade);vtx(b[0],-TH,b[1],b[0],b[1],1,shade);vtx(a[0],-TH,a[1],a[0],a[1],1,shade);}
const TOP0=mesh.length/7;for(const[x,z]of[[-HX,-HZ],[HX,-HZ],[HX,HZ],[-HX,-HZ],[HX,HZ],[-HX,HZ]])vtx(x,0,z,x,z,0,1);
const RIM_N=TOP0,ALL_N=mesh.length/7;

const VS_SLAB=`precision highp float;attribute vec3 aPos;attribute vec2 aLocal,aInfo;uniform mat4 uProj,uView;uniform vec2 uShift;uniform vec3 uOff;uniform float uScale;
varying vec2 vL;varying float vFace,vShade;
void main(){vec3 p=vec3(aPos.x*uScale,aPos.y,aPos.z*uScale)+uOff;vec4 c=uProj*uView*vec4(p,1.);c.xy+=uShift*c.w;gl_Position=c;vL=aLocal*uScale;vFace=aInfo.x;vShade=aInfo.y;}`;
const FS_SLAB=ext=>`${ext?'#extension GL_OES_standard_derivatives : enable\n':''}precision highp float;varying vec2 vL;varying float vFace,vShade;
uniform float uDone,uCur,uGhost,uAlpha,uScale,uTime;${ext?'':'float fwidth(float x){return .004;}'}
float sdRR(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){vec3 white=vec3(.95,.955,1.),lav=vec3(.765,.776,1.),lime=vec3(.8,.937,.678),deep=vec3(.11,.15,.55);
 if(vFace>.5){vec3 c=mix(deep,mix(lav,lime,uCur*.7),.25+.55*vShade);float a=mix(.92,.34,uGhost)*uAlpha;gl_FragColor=vec4(c*a,a);return;}
 vec2 b=vec2(${HX.toFixed(2)},${HZ.toFixed(2)})*uScale;float d=sdRR(vL,b,${R.toFixed(2)}),aa=fwidth(d),inside=1.-smoothstep(-aa,aa,d);if(inside<.002)discard;
 vec2 q=fract(vL/.115)-.5;float dots=1.-smoothstep(.07,.11,length(q));
 vec3 col=mix(white,lav,.18+.12*uDone);col=mix(col,lav*.82,dots*.32);
 float inner=1.-smoothstep(.011-aa,.011+aa,abs(d+.075));col=mix(col,mix(col,lime,.42),uCur);col=mix(col,vec3(.55,.75,.36),inner*uCur);
 float a=inside*.96;
 // Ghosted steps: a dashed outline and a faint fill.
 float per=atan(vL.y,vL.x)*6.,dash=step(.42,fract(per)),edge=(1.-smoothstep(.013-aa,.013+aa,abs(d+.022)))*dash;
 col=mix(col,mix(lav,white,edge),uGhost);a=mix(a,max(edge,inside*.17),uGhost);
 a*=uAlpha;gl_FragColor=vec4(col*a,a);}`;
const VS_DOTS=`precision highp float;attribute vec3 aP;attribute vec4 aC;attribute vec3 aS;uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uPx;varying vec4 vC;varying float vS,vP;
void main(){vec4 c=uProj*uView*vec4(aP,1.);c.xy+=uShift*c.w;gl_Position=c;gl_PointSize=max(1.5,aS.x*uPx/c.w);vC=aC;vS=aS.y;vP=aS.z;}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS_BG=`precision mediump float;uniform vec2 uRes,uGlow,uHor;uniform float uWarm;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 p=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 d=(p-uGlow)*vec2(asp,1.),e=(p-uHor)*vec2(asp,1.);
 vec3 col=mix(vec3(.16,.21,.8),vec3(.235,.3,.95),smoothstep(1.2,0.,length(d)));col=mix(col,vec3(.13,.17,.68),smoothstep(.55,1.25,length((p-.5)*vec2(asp,1.))));
 col+=(vec3(.86,1.,.76)*exp(-dot(e,e)*22.)*.3+vec3(.62,.72,1.)*exp(-dot(e,e)*4.)*.11+vec3(.8,.94,.7)*exp(-dot(e,e)*1.2)*.05)*uWarm;
 col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

let gl=null,program,attribs,SL,DT,BG,slabBuf,dotBuf,fullBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('pl-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  const ext=!!gl.getExtension('OES_standard_derivatives');SL=program(VS_SLAB,FS_SLAB(ext));DT=program(VS_DOTS,FS_POINTS);BG=program(VS_BG,FS_BG);
  slabBuf=kit.buffer(new Float32Array(mesh));dotBuf=gl.createBuffer();fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State, tweened by GSAP. cam blends the roadmap camera into the finale's hero view behind the figure;
   lift runs light up the path and warm brings up the horizon. */
const S={rise:[1,1,1,1,1],done:[0,0,0,0,0],cur:[1,0,0,0,0],ghost:[0,1,1,1,1],dim:[1,1,1,1,1],fig:0,figA:1,broad:0,start:0,focus:0,paths:1,cam:0,lift:0,warm:0};
let phase=0,ending=false,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,panelTl=null,endTl=null,placed='',moving=0;
let view={shift:[.44,-.07],fov:.5,phone:false};
const motes=Array.from({length:46},(_,i)=>[(Math.sin(i*12.9)*.5+.5)*9-4.5,(Math.sin(i*7.3)*.5+.5)*4-.8,(Math.sin(i*3.1)*.5+.5)*-4-.5,.02+.02*(i%3),i*.37]);
const add=(a,b)=>a.map((v,i)=>v+b[i]),mixv=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
const HERO={eye:add(STEP(0),[-2.82,1.42,5.86]),target:add(STEP(2),[0,.5,0])};
function cam(aspect){const phone=innerWidth<=900,wide=aspect>=1.45,f=S.focus,t=STEP(f),k=S.cam;
 const rt=[lerp(0,t[0],.07),lerp(1.2,t[1],.07),lerp(-.2,t[2],.07)],re=add(rt,[3,3.2,10.6]);
 const rs=phone?[0,-.02]:[wide?.44:.42,-.07],rf=phone?.5:(wide?.5:.64),hs=phone?[-.05,.25]:[.554,.093],hf=phone?.55:.75;
 view={shift:mixv(rs,hs,k),fov:lerp(rf,hf,k),phone};
 return{proj:M.perspective(view.fov,aspect,.05,60),view:M.lookAt(mixv(re,HERO.eye,k),mixv(rt,HERO.target,k),[0,1,0])};}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+view.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+view.shift[1]))/2*canvas.clientHeight];}
const top=k=>{const p=STEP(k);return[p[0],p[1]-(1-S.rise[k])*1.4,p[2]];};
function figPos(){const f=clamp(S.fig,0,4),k=Math.min(3,Math.floor(f)),t=f-k,a=top(k),b=top(k+1);return[lerp(a[0],b[0],t),lerp(a[1],b[1],t)+Math.sin(Math.PI*t)*.42,lerp(a[2],b[2],t)];}
const dots=new Float32Array(300*10);
function render(){if(!ready)return;const aspect=window.ELMY_LIGHT.fit(canvas);frames++;const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const{proj,view:V}=cam(aspect),vp=M.mul(proj,V),px=(H/2)/Math.tan(view.fov/2),glow=project(vp,top(Math.round(clamp(S.focus,0,4)))),hor=project(vp,add(STEP(4),[.9,1.1,-.9]));
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,glow[0]/canvas.clientWidth,1-glow[1]/canvas.clientHeight);
 gl.uniform2f(BG.u.uHor,hor[0]/canvas.clientWidth,1-hor[1]/canvas.clientHeight);gl.uniform1f(BG.u.uWarm,S.warm);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 // Dots: motes, shadows, path and checkpoints, the satellites' connectors, the figure.
 let n=0;const dot=(p,c,a,size,shape,ph=0)=>{if(a<.004)return;dots.set([p[0],p[1],p[2],c[0],c[1],c[2],a,size,shape,ph],n++*10);};
 const lime=[.8,.937,.678],lav=[.765,.776,1],navy=[.03,.05,.2],white=[.97,.97,1];
 motes.forEach(m=>{const rise=S.warm*(((time*.07+m[4])%1)*3.2-1.2);dot([m[0]+Math.sin(time*.1+m[4])*.2,m[1]+Math.cos(time*.08+m[4])*.15+rise,m[2]],mixv(lav,lime,S.warm*.5),.28*(1-.4*S.warm*Math.abs(rise)/2),m[3],0);});
 const shadows=n;for(let k=0;k<5;k++){const p=top(k);dot([p[0],p[1]-.62,p[2]],navy,.32*S.rise[k]*S.dim[k]*(1-.6*S.ghost[k]),1.5,0);}
 if(S.broad>.01)SATS.forEach(o=>{const p=STEP(4);dot([p[0]+o[0],p[1]+o[1]-.62,p[2]+o[2]],navy,.12*S.broad,1.3,0);});
 const shadowN=n-shadows,pulse=((time*.28)%1.35)-.1;
 for(let k=0;k<4;k++){const a=top(k),b=top(k+1),vis=Math.min(S.rise[k],S.rise[k+1])*S.paths*Math.min(S.dim[k],S.dim[k+1]);
  for(let i=1;i<10;i++){const t=.12+.76*i/10,u=(k+t)/4,lit=Math.max(clamp(S.done[k]),clamp((S.lift*1.15-u)*8)),gl2=S.warm*Math.exp(-Math.pow((u-pulse)*9,2)),p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)+Math.sin(Math.PI*t)*.36+.04,lerp(a[2],b[2],t)];
   dot(p,lit>.5?lime:lav,vis*lerp(.4,.95,lit)+gl2*.5,.036+gl2*.03,2);}
  const u=(k+.5)/4,lit=Math.max(clamp(S.done[k]),clamp((S.lift*1.15-u)*8)),m=[lerp(a[0],b[0],.5),lerp(a[1],b[1],.5)+.4,lerp(a[2],b[2],.5)];
  dot(m,lit>.5?lime:lav,vis*lerp(.55,1,lit),.17,1);if(lit>.01)dot(m,lime,vis*lit,.075,2);}
 if(S.broad>.01)SATS.forEach(o=>{const a=top(4),b=[a[0]+o[0],a[1]+o[1],a[2]+o[2]];for(let i=1;i<7;i++){const t=.18+.64*i/7;dot([lerp(a[0],b[0],t),lerp(a[1],b[1],t)+.05,lerp(a[2],b[2],t)],lav,.45*S.broad,.03,2);}});
 const f=figPos(),stride=moving?Math.sin(time*16)*.9:0;dot([f[0],f[1]+.05,f[2]],lime,(.55+.25*S.warm)*S.figA,.55+.25*S.cam,0);dot([f[0],f[1]+.33,f[2]],white,S.figA,.68,3,stride);
 if(S.start>.01){const p=top(0),r=.7+.6*((time*.6)%1);dot([p[0],p[1]+.02,p[2]],lime,S.start*(1-((time*.6)%1))*.9,r*1.6,1);}
 gl.bindBuffer(gl.ARRAY_BUFFER,dotBuf);gl.bufferData(gl.ARRAY_BUFFER,dots.subarray(0,n*10),gl.DYNAMIC_DRAW);
 const drawDots=(first,count)=>{if(count<=0)return;gl.useProgram(DT.p);attribs(DT,dotBuf,[['aP',3,0],['aC',4,3],['aS',3,7]],10);gl.uniformMatrix4fv(DT.u.uProj,false,proj);gl.uniformMatrix4fv(DT.u.uView,false,V);gl.uniform2f(DT.u.uShift,...view.shift);gl.uniform1f(DT.u.uPx,px);gl.drawArrays(gl.POINTS,first,count);};
 drawDots(0,shadows+shadowN);
 // Slabs, back to front; satellites first.
 const slab=(off,scale,done,cur,ghost,alpha)=>{gl.useProgram(SL.p);attribs(SL,slabBuf,[['aPos',3,0],['aLocal',2,3],['aInfo',2,5]],7);const u=SL.u;
  gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,V);gl.uniform2f(u.uShift,...view.shift);gl.uniform3f(u.uOff,...off);gl.uniform1f(u.uScale,scale);
  gl.uniform1f(u.uDone,done);gl.uniform1f(u.uCur,cur);gl.uniform1f(u.uGhost,ghost);gl.uniform1f(u.uAlpha,alpha);gl.uniform1f(u.uTime,time);gl.drawArrays(gl.TRIANGLES,0,ALL_N);};
 if(S.broad>.01)SATS.forEach(o=>{const p=STEP(4);slab([p[0]+o[0],p[1]+o[1],p[2]+o[2]],.9,0,0,1,S.broad);});
 for(let k=4;k>=0;k--){const r=S.rise[k];if(r<.01)continue;slab(top(k),1,S.done[k],S.cur[k],S.ghost[k],clamp(r*1.5)*S.dim[k]);}
 drawDots(shadows+shadowN,n-shadows-shadowN);
 place(vp);}
/* Step buttons sit under their slabs (roadmap only); tags mark the first step and the dashed platforms. */
function place(vp){const key=[...S.rise,...S.dim,S.focus,S.broad,S.start,S.cam,canvas.clientWidth,canvas.clientHeight].map(v=>v.toFixed(3)).join();if(key===placed)return;placed=key;
 const road=clamp(1-S.cam*1.6);
 steps.forEach((b,k)=>{const p=top(k),[x,y]=project(vp,[p[0],p[1]-TH,p[2]+HZ]);b.style.transform=`translate(${x.toFixed(1)}px,${(y+10).toFixed(1)}px) translate(-50%,0)`;b.style.opacity=String(+(clamp(S.rise[k]*1.4)*road).toFixed(3));b.style.visibility=road<.02?'hidden':'';});
 const s0=top(0),[sx,sy]=project(vp,[s0[0],s0[1]+lerp(1.05,.86,S.cam),s0[2]]);tagStart.style.transform=`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) translate(-50%,-100%)`;tagStart.style.opacity=String(+S.start.toFixed(3));
 const s4=STEP(4),[bx,by]=project(vp,[s4[0]+(SATS[0][0]+SATS[1][0])/2,s4[1]+Math.max(SATS[0][1],SATS[1][1])+.42,s4[2]+(SATS[0][2]+SATS[1][2])/2]);const bw=tagBroad.offsetWidth/2,cx=Math.max(bw+10,Math.min(canvas.clientWidth-bw-10,bx));tagBroad.style.transform=`translate(${cx.toFixed(1)}px,${by.toFixed(1)}px) translate(-50%,-100%)`;tagBroad.style.opacity=String(+(S.broad*road).toFixed(3));}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Act one: the phases. */
function targets(p,end){const K=[0,1,2,3,4];return{done:K.map(k=>!end&&k<p?1:0),cur:K.map(k=>(end?k===0:k===p)?1:0),ghost:K.map(k=>!end&&k>p?1:0),dim:K.map(()=>1),
 fig:end?0:p,broad:!end&&p===4?1:0,start:end?1:0,focus:end?0:p,cam:end?1:0,lift:end?1:0,warm:end?1:0};}
function snap(t){['done','cur','ghost','dim'].forEach(n=>t[n].forEach((v,k)=>S[n][k]=v));Object.assign(S,{fig:t.fig,broad:t.broad,start:t.start,focus:t.focus,cam:t.cam,lift:t.lift,warm:t.warm});moving=0;}
function apply(t){const arr=(name,dur,ease,stag=0)=>t[name].forEach((v,k)=>g.to(S[name],{[k]:v,duration:dur,ease,delay:stag*k,overwrite:'auto'}));
 arr('done',.6,'power2.out');arr('cur',.6,'power2.out');arr('ghost',.7,'power2.out');arr('dim',.6,'power2.out');
 const dist=Math.abs(t.fig-S.fig);g.killTweensOf(S,'fig,focus,broad,start');
 if(dist>.01){moving=1;g.to(S,{fig:t.fig,duration:Math.min(2.2,.75+dist*.38),ease:'power2.inOut',onComplete:()=>{moving=0;}});}
 g.to(S,{focus:t.focus,duration:1.3,ease:'power3.inOut'});g.to(S,{broad:t.broad,duration:.8,delay:t.broad?.6:0,ease:'power2.out'});g.to(S,{start:t.start,duration:.6,delay:t.start?.5:0});}
function write(p){const v=PH[p];panel.num.textContent=pad(p+1);panel.count.textContent=pad(p+1);panel.name.textContent=v.name;panel.title.textContent=v.title;panel.text.textContent=v.text;panel.check.textContent=v.check;
 steps.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===p)));slide.dataset.phase=String(p+1);}
function showPanel(p,dir){const parts=[panel.num,panel.title,panel.text,panel.check.parentElement,$('.pl-meta',slide)];panelTl?.progress(1);
 panelTl=g.timeline().to(parts,{opacity:0,y:-8*dir,duration:.2,ease:'power2.in',stagger:.02}).add(()=>write(p)).fromTo(parts,{opacity:0,y:12*dir},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.04});}
const anim=()=>motion&&!!g&&ready;
function go(p){p=Math.max(0,Math.min(4,p));if(ending){setEnding(false,p);return;}if(p===phase)return;const dir=p>phase?1:-1;phase=p;
 if(!anim()){snap(targets(p,false));write(p);render();return;}apply(targets(p,false));showPanel(p,dir);}

/* Act two: the finale. The roadmap copy and labels clear, the camera glides behind the figure at the
   foot of the stairs, light runs up the path and the end card asks the closing question. */
const roadmapCopy=[$('.pl-copy',slide),$('.pl-decision',slide)],endCard=$('.pl-end',slide);
const q=s=>$$(s,slide);
function chrome(){document.body.classList.toggle('pl-ending',ending&&active);}
function setEnding(on,toPhase=phase){if(on===ending&&toPhase===phase)return;ending=on;phase=toPhase;if(on||!anim())slide.classList.toggle('pl-ended',on);endCard.setAttribute('aria-hidden',String(!on));roadmapCopy.forEach(e=>e.setAttribute('aria-hidden',String(on)));
 revealBtn.setAttribute('aria-expanded',String(on));chrome();write(phase);
 const t=targets(phase,on);endTl?.kill();
 if(!anim()){snap(t);settleEnd();render();return;}
 endTl=g.timeline({defaults:{ease:'power3.out',lazy:false}});
 if(on){endTl.to(roadmapCopy,{opacity:0,y:-12,duration:.45,ease:'power2.in',stagger:.06},0)
   .to(S,{cam:1,duration:2.1,ease:'power3.inOut'},.15).to(S,{warm:1,duration:1.8,ease:'power2.out'},1.1).fromTo(S,{lift:0},{lift:1,duration:1.7,ease:'power2.inOut'},1.35)
   .fromTo(q('.pl-end-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},1.05)
   .fromTo(q('.pl-eline>span'),{yPercent:112},{yPercent:0,duration:1.2,stagger:.11,ease:'power4.out'},1.15)
   .fromTo(q('.pl-end-action'),{opacity:0,y:14},{opacity:1,y:0,duration:.9},1.75)
   .fromTo(q('.pl-sign'),{opacity:0,y:14},{opacity:1,y:0,duration:1},2.2);
  apply(t);g.killTweensOf(S.ghost);[1,2,3,4].forEach(k=>endTl.to(S.ghost,{[k]:0,duration:.6,ease:'power2.out'},1.4+k*.18));}
 else{endTl.to(q('.pl-end-top,.pl-sign'),{opacity:0,y:-10,duration:.35,ease:'power2.in'},0).to(S,{cam:0,duration:1.6,ease:'power3.inOut'},.1).to(S,{warm:0,lift:0,duration:.8},.1)
   .add(()=>{g.set(roadmapCopy,{opacity:0});slide.classList.remove('pl-ended');},.45).fromTo(roadmapCopy,{opacity:0,y:12},{opacity:1,y:0,duration:.8,stagger:.08,immediateRender:false},1);apply(t);showPanel(phase,-1);}
 endTl.add(settleEnd);}
function settleEnd(){if(g)g.set([...roadmapCopy,...q('.pl-end-top,.pl-end-kicker,.pl-eline>span,.pl-end-action,.pl-sign')],{clearProps:'opacity,transform'});}
function step(dir){if(dir>0){if(ending)return;if(phase<4)go(phase+1);else setEnding(true);}else{if(ending)setEnding(false,phase);else go(phase-1);}}
steps.forEach((b,k)=>b.addEventListener('click',()=>go(k)));
revealBtn.addEventListener('click',()=>setEnding(!ending));
$('.pl-back',slide).addEventListener('click',()=>setEnding(false));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;step(Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){tl?.kill();S.rise.fill(0);S.figA=0;S.paths=0;tl=g.timeline({onComplete:()=>{tl=null;}});
 S.rise.forEach((_,k)=>tl.to(S.rise,{[k]:1,duration:1.2,ease:'expo.out'},.4+k*.12));
 tl.to(S,{paths:1,duration:1,ease:'power2.out'},1.1).fromTo(S,{figA:0},{figA:1,duration:.6},1.5);}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}
 textTl=g.timeline({defaults:{ease:'power3.out',lazy:false}});if(ending)return;
 textTl.fromTo(q('.pl-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.pl-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.pl-detail'),{opacity:0,y:14},{opacity:1,y:0,duration:.9},full?.65:.2)
  .fromTo(q('.pl-decision'),{opacity:0,y:16},{opacity:1,y:0,duration:.9},full?.9:.3)
  .fromTo(q('.pl-foot'),{opacity:0},{opacity:1,duration:.8},full?1.3:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set(q('.pl-kicker,.pl-line>span,.pl-detail,.pl-decision,.pl-foot'),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}panelTl?.progress(1);endTl?.progress(1);if(g)g.killTweensOf([S,S.done,S.cur,S.ghost,S.dim,S.rise]);
 S.rise.fill(1);S.figA=1;S.paths=1;snap(targets(phase,ending));write(phase);settleEnd();placed='';}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{placed='';if(active&&!raf)render();}).observe(canvas);

window.ELMY_PILOT={
 id:'pilot',keys:['ArrowDown','ArrowUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;chrome();if(!active){stop();textTl?.progress(1,true);finish();if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}placed='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){step(k==='ArrowDown'?1:-1);},
 go,end:setEnding,
 debug:{S,render,get state(){return{phase,ending,ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_PILOT);
init();finish();write(0);
})();

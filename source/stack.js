/* Slide 6 (Nizar brief): One candidate. One journey. One integrated experience. Front stage and back
   stage: a glass slab carries Candidate 1047's seven stages, a concept screen floats above the
   current stage, and the four layers of work behind it (Academic, Technology, Operations,
   Governance) open beneath on request. The camera travels with the candidate.
   Slabs, patterns and the active-stage band are drawn analytically in the fragment shader, so the
   scene is crisp at any size and cheap to draw. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="candidate"]');if(!slide||!window.ELMY_LIGHT)return;
const{M,FS_POINTS}=window.ELMY_LIGHT,g=window.gsap;
const DATA=JSON.parse($('.sk-data',slide).textContent),STEPS=DATA.steps,LAST=STEPS.length-1,NS=DATA.names.length;
const canvas=$('.sk-canvas',slide),tags=$$('.sk-tag',slide),cardsWrap=$('.sk-cards',slide),cards=$$('.sk-card',slide),more=$('.sk-more',slide),rail=$('.sk-rail',slide),nodes=$$('.jr-node',rail);
const panel={count:$('.sk-count',slide),name:$('.sk-name',slide),sub:$('.sk-sub',slide),summary:$('.sk-summary',slide),lines:$$('.sk-line-text',slide)};
// Each step with a stage has its own concept screen, in step order.
const CARD=[];{let k=0;STEPS.forEach((st,i)=>{CARD[i]=st.stage>=0?k++:-1;});}
const pad=n=>String(n).padStart(2,'0');

/* Geometry: stage columns along x; slab 0 is the applicant's surface, slabs 1–4 the layers. */
const HX=3.65,HZ=1.1,R=.22,TH=.07,LEVEL=[1.6,1.02,.44,-.14,-.72],X=s=>-3+s;
const CAMERA={fov:.56,eye:[5.7,6.2,12],target:[.3,-.1,0]};
// Slab mesh: one quad for the top (its rounded shape comes from an SDF) and a strip for the rim.
const mesh=[];
const vtx=(x,y,z,slab,face,shade)=>mesh.push(x,y,z,x,z,slab,face,shade);
const outline=[];for(const[cx,cz,a0]of[[HX-R,HZ-R,0],[-(HX-R),HZ-R,Math.PI/2],[-(HX-R),-(HZ-R),Math.PI],[HX-R,-(HZ-R),1.5*Math.PI]])for(let k=0;k<=10;k++){const a=a0+k/10*Math.PI/2;outline.push([cx+Math.cos(a)*R,cz+Math.sin(a)*R,Math.cos(a),Math.sin(a)]);}
const SLAB_START=[];
for(let s=0;s<5;s++){SLAB_START.push(mesh.length/8);
 for(let k=0;k<outline.length;k++){const a=outline[k],b=outline[(k+1)%outline.length],shade=Math.max(0,.55*a[3]+.45*a[2]);
  vtx(a[0],0,a[1],s,1,shade);vtx(b[0],0,b[1],s,1,shade);vtx(a[0],-TH,a[1],s,1,shade);vtx(b[0],0,b[1],s,1,shade);vtx(b[0],-TH,b[1],s,1,shade);vtx(a[0],-TH,a[1],s,1,shade);}
 for(const[x,z]of[[-HX,-HZ],[HX,-HZ],[HX,HZ],[-HX,-HZ],[HX,HZ],[-HX,HZ]])vtx(x,0,z,s,0,1);}
const SLAB_COUNT=mesh.length/8/5,meshData=new Float32Array(mesh);

const VS_SLAB=`precision highp float;
attribute vec3 aPos;attribute vec2 aLocal;attribute vec3 aInfo;
uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uY;
varying vec2 vL;varying float vFace,vShade;
void main(){vec4 c=uProj*uView*vec4(aPos+vec3(0.,uY,0.),1.);c.xy+=uShift*c.w;gl_Position=c;vL=aLocal;vFace=aInfo.y;vShade=aInfo.z;}`;
const FS_SLAB=ext=>`${ext?'#extension GL_OES_standard_derivatives : enable\n':''}precision highp float;
varying vec2 vL;varying float vFace,vShade;
uniform float uSlab,uActive,uBand,uFade,uHi,uAny;
${ext?'':'float fwidth(float x){return .006;}'}
float sdRR(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float stroke(float d,float w){float aa=fwidth(d)*.9;return 1.-smoothstep(w-aa,w+aa,abs(d));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 int s=int(uSlab+.5);
 vec3 base=s==0?vec3(1.):s==1?vec3(.8,.81,1.):s==2?vec3(.6,.65,1.):s==3?vec3(.4,.47,.98):vec3(.2,.27,.82);
 float fill=s==0?.95:s==4?.62:.5,emph=(1.-uAny*.5+uHi*.55)*uFade;
 if(vFace>.5){vec3 c=base*mix(.62,.9,vShade);float a=(s==0?.9:.72)*emph;gl_FragColor=vec4(c*a,a);return;}
 float d=sdRR(vL,vec2(${HX.toFixed(2)},${HZ.toFixed(2)}),${R.toFixed(2)}),aa=fwidth(d),inside=1.-smoothstep(-aa,aa,d);if(inside<.002)discard;
 float depth=(vL.y+${HZ.toFixed(2)})/${(2*HZ).toFixed(2)};
 vec3 col=base*mix(1.05,.93,depth);
 vec3 ink=s<2?vec3(.063,.086,.169):vec3(1.);float pat=0.;
 if(s==0){pat=stroke(vL.y,.012)*.85;for(int k=0;k<7;k++)pat=max(pat,stroke(length(vL-vec2(-3.+float(k),0.))-.17,.012)*.85);}
 else if(s==1){vec2 c=fract(vL/.27)-.5;pat=stroke(length(c)-.17,.011)*.55;}
 else if(s==2){float row=floor(vL.y/.2+.5);float z=(fract(vL.y/.2+.5)-.5)*.2;float seg=step(.32,fract(vL.x*.85+row*.43));pat=stroke(z,.008)*seg*.75;vec2 c=fract(vL/.2+.5)-.5;pat=max(pat,(1.-smoothstep(.08,.12,length(c)))*step(.72,hash(floor(vL/.2+.5)))*.9);}
 else if(s==3){vec2 c=fract(vL/.15)-.5;pat=(1.-smoothstep(.13,.19,length(c)))*step(.5,hash(floor(vL/.15)))*.7;}
 else{pat=stroke(fract((vL.x+vL.y)/.13)-.5,.06)*.22;pat=max(pat,stroke(sdRR(vL,vec2(${(HX-.18).toFixed(2)},${(HZ-.16).toFixed(2)}),.14),.012)*.85);}
 float dx=abs(vL.x-uActive),band=(1.-smoothstep(.4-aa,.4+aa,dx))*uBand,edge=stroke(dx-.4,.01)*uBand;
 col=mix(col,s==0?vec3(.9,.92,1.):mix(col,vec3(1.),.3),band*.7);
 col=mix(col,ink,pat*(.42+band*.5));
 col=mix(col,s==0?vec3(.063,.086,.169):vec3(1.),stroke(d+.016,.007)*.55);
 col=mix(col,s==0?vec3(.204,.271,.922):vec3(.8,.937,.678),edge);
 if(s==0){vec2 q=(vL-vec2(uActive,.05))*vec2(2.,3.6);col*=1.-exp(-dot(q,q))*.22*uBand;}
 float a=mix(fill,min(1.,fill+.25),band)*inside*emph;gl_FragColor=vec4(col*a,a);}`;
const VS_BEAM=`precision highp float;attribute vec3 aPos;attribute vec2 aUv;uniform mat4 uProj,uView;uniform vec2 uShift;varying vec2 vUv;
void main(){vec4 c=uProj*uView*vec4(aPos,1.);c.xy+=uShift*c.w;gl_Position=c;vUv=aUv;}`;
const FS_BEAM=`precision mediump float;varying vec2 vUv;uniform float uAlpha,uTime;
void main(){float x=abs(vUv.x-.5)*2.,core=exp(-x*x*18.),glow=exp(-x*x*3.),pulse=.75+.25*sin(vUv.y*14.-uTime*5.);
 float a=(core*.85+glow*.25)*uAlpha*pulse;vec3 c=mix(vec3(.204,.271,.922),vec3(.55,.62,1.),core*.4);gl_FragColor=vec4(c*a,a);}`;
const VS_DOTS=`precision highp float;attribute vec3 aP;attribute vec4 aC;attribute vec2 aS;uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uPx;varying vec4 vC;varying float vS,vP;
void main(){vec4 c=uProj*uView*vec4(aP,1.);c.xy+=uShift*c.w;gl_Position=c;gl_PointSize=max(1.5,aS.x*uPx/c.w);vC=aC;vS=aS.y;vP=0.;}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS_BG=`precision mediump float;uniform vec2 uRes,uShadow;uniform float uShadowA;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 p=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec3 col=mix(vec3(.961,.965,.98),vec3(.93,.94,.99),smoothstep(.1,1.,1.-distance(p,vec2(.7,.55))));
 vec2 d=(p-uShadow)*vec2(asp,1.)*vec2(1.1,3.6);col*=1.-exp(-dot(d,d)*3.)*.07*uShadowA;col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

let gl=null,program,attribs,SL,BM,DT,BG,slabBuf,beamBuf,dotBuf,quadBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('sk-flat');layout.flat=true;}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  const ext=!!gl.getExtension('OES_standard_derivatives');
  SL=program(VS_SLAB,FS_SLAB(ext));BM=program(VS_BEAM,FS_BEAM);DT=program(VS_DOTS,FS_POINTS);BG=program(VS_BG,FS_BG);
  slabBuf=kit.buffer(meshData);beamBuf=gl.createBuffer();dotBuf=gl.createBuffer();quadBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State: slab positions (explode), the active band and walker, layer emphasis. */
const S={explode:[0,0,0,0],active:X(0),band:0,hi:[0,0,0,0],any:0,stride:0,camX:0,zoom:1};
let current=0,open=false,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,panelTl=null,layout={shift:[.44,-.1],fov:CAMERA.fov,flat:false},placed='';
const slabY=s=>s===0?LEVEL[0]:LEVEL[0]-.06-s*.035+(LEVEL[s]-LEVEL[0]+.06+s*.035)*S.explode[s-1];
const slabFade=s=>s===0?1:Math.min(1,S.explode[s-1]*3);
const beam=new Float32Array(6*5*4),dots=new Float32Array(32*9);
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),flat=innerWidth<=900;slide.classList.toggle('sk-flat',flat||!ready);
 layout=flat?{shift:[0,-.04],fov:aspect<1?.9:.6,flat}:{shift:[aspect<1.45?.42:.44,(aspect>1.7?-.24:-.28)-.16*(1-S.explode.reduce((a,b)=>a+b,0)/4)],fov:aspect<1.45?.74:aspect>1.7?.6:CAMERA.fov,flat};return aspect;}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight];}
function render(){if(!ready)return;const aspect=measure();if(layout.flat){place(null);return;}frames++;
 const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const T=[CAMERA.target[0]+S.camX,CAMERA.target[1],CAMERA.target[2]],E=[0,1,2].map(k=>T[k]+(CAMERA.eye[k]-CAMERA.target[k])*S.zoom);
 const proj=M.perspective(layout.fov,aspect,.1,80),view=M.lookAt(E,T,[0,1,0]),vp=M.mul(proj,view),px=(H/2)/Math.tan(layout.fov/2);
 const right=[view[0],view[4],view[8]],shadow=project(vp,[0,LEVEL[4]-.55,0]);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quadBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uShadow,shadow[0]/canvas.clientWidth,1-shadow[1]/canvas.clientHeight);gl.uniform1f(BG.u.uShadowA,S.explode[3]);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 // Beam segments (one per gap) and node dots, interleaved with the slabs from the bottom up.
 const ys=[0,1,2,3,4].map(slabY),w=.075;let bn=0;
 for(let s=4;s>0;s--){const y0=ys[s],y1=ys[s-1]-TH;for(const[ox,oy,u,v]of[[-1,y0,0,0],[1,y0,1,0],[-1,y1,0,1],[1,y0,1,0],[1,y1,1,1],[-1,y1,0,1]])beam.set([S.active+right[0]*w*ox,oy,right[2]*w*ox,u,v],bn++*5);}
 gl.bindBuffer(gl.ARRAY_BUFFER,beamBuf);gl.bufferData(gl.ARRAY_BUFFER,beam.subarray(0,bn*5),gl.DYNAMIC_DRAW);
 let dn=0;const dot=(p,size,c,a,shape)=>{dots.set([...p,...c,a,size,shape],dn++*9);};
 for(let s=1;s<5;s++){dot([S.active,ys[s]+.005,0],.3,[.204,.271,.922],.85*S.band*slabFade(s),1);dot([S.active,ys[s]+.005,0],.08,[1,1,1],S.band*slabFade(s),2);}
 const rise=motion?[0,1,2].map(j=>(time*.4+j/3)%1):[];rise.forEach(t=>dot([S.active,ys[4]+(ys[0]-ys[4])*t,0],.09,[.204,.271,.922],Math.sin(Math.PI*t)*.9*S.band,0));
 dot([S.active-.62,ys[0]+.23,.32],.5,[.063,.086,.169],.92*S.band,3);
 gl.bindBuffer(gl.ARRAY_BUFFER,dotBuf);gl.bufferData(gl.ARRAY_BUFFER,dots.subarray(0,dn*9),gl.DYNAMIC_DRAW);
 const slab=s=>{gl.useProgram(SL.p);attribs(SL,slabBuf,[['aPos',3,0],['aLocal',2,3],['aInfo',3,5]],8);const u=SL.u;
  gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniform2f(u.uShift,...layout.shift);gl.uniform1f(u.uY,ys[s]);gl.uniform1f(u.uSlab,s);
  gl.uniform1f(u.uActive,S.active);gl.uniform1f(u.uBand,S.band);gl.uniform1f(u.uFade,slabFade(s));gl.uniform1f(u.uHi,s>0?S.hi[s-1]:0);gl.uniform1f(u.uAny,s>0?S.any:0);gl.drawArrays(gl.TRIANGLES,SLAB_START[s],SLAB_COUNT);};
 const dotsRange=(first,count)=>{gl.useProgram(DT.p);attribs(DT,dotBuf,[['aP',3,0],['aC',4,3],['aS',2,7]],9);gl.uniformMatrix4fv(DT.u.uProj,false,proj);gl.uniformMatrix4fv(DT.u.uView,false,view);gl.uniform2f(DT.u.uShift,...layout.shift);gl.uniform1f(DT.u.uPx,px);gl.drawArrays(gl.POINTS,first,count);};
 const beamSeg=k=>{gl.useProgram(BM.p);attribs(BM,beamBuf,[['aPos',3,0],['aUv',2,3]],5);gl.uniformMatrix4fv(BM.u.uProj,false,proj);gl.uniformMatrix4fv(BM.u.uView,false,view);gl.uniform2f(BM.u.uShift,...layout.shift);gl.uniform1f(BM.u.uAlpha,.75*S.band*slabFade(4-k));gl.uniform1f(BM.u.uTime,time);gl.drawArrays(gl.TRIANGLES,k*6,6);};
 for(let s=4;s>=0;s--){slab(s);if(s>0){dotsRange((s-1)*2,2);beamSeg(4-s);}}
 dotsRange(8,dn-8);
 place(vp);
}
/* HTML follows the drawing; positions are only written when they change. */
function place(vp){
 if(layout.flat){if(placed!=='flat'){placed='flat';tags.forEach(t=>t.style.opacity='0');cardsWrap.style.transform='';}return;}
 const key=[S.active,S.camX,S.zoom,...S.explode,canvas.clientWidth,canvas.clientHeight].map(v=>v.toFixed(3)).join();if(key===placed)return;placed=key;
 const[cx,cy]=project(vp,[S.active,slabY(0),-HZ*.15]),h=($('.sk-card.is-on',slide)?.offsetHeight)||0,top=Math.max(84+h,cy-30);
 cardsWrap.style.transform=`translate(${(cx-cardsWrap.offsetWidth/2).toFixed(1)}px,${top.toFixed(1)}px)`;
 // Layer names are printed on their own slab, near its front-left corner in view.
 tags.forEach((t,i)=>{const[x,y]=project(vp,[Math.max(-HX+.42,S.camX-2.4),slabY(i)+.005,HZ-.2]);t.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(0,-50%)`;t.style.opacity=String(i===0?1:Math.max(0,(S.explode[i-1]-.65)/.35));});
}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps: 0 the overview, then each stage (exam day and the result in parts), then the closing line. */
const pad2=n=>String(n).padStart(2,'0');
function write(n){const st=STEPS[n],i=st.stage;slide.dataset.view=i===-1?'overview':i===-2?'final':'stage';
 panel.summary.textContent=st.text;
 if(i>=0){panel.count.textContent=`${pad2(i+1)} / ${pad2(NS)}`+(st.phase?` · ${st.phase}`:'');panel.name.textContent=DATA.names[i];panel.sub.textContent=DATA.subs[i];panel.lines.forEach((el,l)=>el.textContent=DATA.layers[i][l]);}
 else if(i===-1){panel.count.textContent='';panel.name.textContent='Seven stages';}
 nodes.forEach((b,k)=>{b.setAttribute('aria-pressed',String(k===i));b.classList.toggle('is-done',i>=0&&k<i);});
 rail.classList.toggle('is-idle',i===-1);rail.classList.toggle('is-all',i===-2);rail.style.setProperty('--jr-p',String(i===-2?1:i<0?0:i/(NS-1)));
 cards.forEach((c,k)=>{const on=k===CARD[n];c.classList.toggle('is-on',on);c.setAttribute('aria-hidden',String(!on));});placed='';}
function targets(n){const i=STEPS[n].stage,stage=i>=0;return{active:X(stage?i:3),band:stage?1:0,camX:stage?X(i)*.92:0,zoom:stage?.8:1,explode:(i===-2||open)?1:0};}
function go(n,animate=motion){n=Math.max(0,Math.min(LAST,n));if(n===current&&!tl)return;const prev=current;current=n;const T=targets(n),moving=STEPS[n].stage!==STEPS[prev].stage;
 if(!g||!animate||!ready){Object.assign(S,{active:T.active,band:T.band,camX:T.camX,zoom:T.zoom});S.explode=S.explode.map(()=>T.explode);write(n);placed='';render();return;}
 const d=.7+Math.min(4,Math.abs(T.active-S.active))*.12;
 g.to(S,{active:T.active,camX:T.camX,zoom:T.zoom,duration:d,ease:'power3.inOut',overwrite:'auto'});g.to(S,{band:T.band,duration:.5,overwrite:'auto'});
 S.explode.forEach((v,l)=>g.to(S.explode,{[l]:T.explode,duration:1,ease:'power3.inOut',delay:T.explode?l*.08:(3-l)*.05,overwrite:'auto'}));
 if(moving){const parts=[panel.count,panel.name,panel.sub,panel.summary,...panel.lines],dir=n>prev?1:-1;panelTl?.progress(1);
  panelTl=g.timeline().to(parts,{opacity:0,y:-8*dir,duration:.2,ease:'power2.in',stagger:.02}).add(()=>write(n)).fromTo(parts,{opacity:0,y:12*dir},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.04,clearProps:'opacity,transform'});}
 else write(n);}
function setOpen(on,animate=motion){open=on;more.setAttribute('aria-expanded',String(on));more.firstElementChild.textContent=on?'Hide the work behind this stage':'Show the work behind this stage';slide.classList.toggle('sk-open',on);
 const e=(STEPS[current].stage===-2||on)?1:0;if(g&&animate&&ready)S.explode.forEach((v,l)=>g.to(S.explode,{[l]:e,duration:1,ease:'power3.inOut',delay:e?l*.08:(3-l)*.05,overwrite:'auto'}));else{S.explode=S.explode.map(()=>e);placed='';render();}}
more.addEventListener('click',()=>setOpen(!open));
nodes.forEach((b,i)=>b.addEventListener('click',()=>go(STEPS.findIndex(st=>st.stage===i))));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||layout.flat||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){tl?.kill();S.explode=[1,1,1,1];tl=g.timeline();S.explode.forEach((_,l)=>tl.to(S.explode,{[l]:0,duration:1.2,ease:'power3.inOut'},1.1+(3-l)*.1));}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.sk-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.sk-title-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.sk-subtitle,.sk-candidate'),{opacity:0,y:14},{opacity:1,y:0,duration:.9,stagger:.12},full?.6:.2)
  .fromTo(q('.sk-rail .jr-line'),{scaleX:0,transformOrigin:'0 50%'},{scaleX:1,duration:1.4,ease:'power2.inOut'},full?.4:.1)
  .fromTo(q('.sk-rail li'),{opacity:0,y:10},{opacity:1,y:0,duration:.7,stagger:.08},full?.5:.12)
  .fromTo(q('.sk-foot'),{opacity:0},{opacity:1,duration:.8},full?1.5:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.sk-kicker,.sk-title-line>span,.sk-subtitle,.sk-candidate,.sk-rail .jr-line,.sk-rail li,.sk-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}const T=targets(current);Object.assign(S,{active:T.active,band:T.band,camX:T.camX,zoom:T.zoom,stride:0});S.explode=S.explode.map(()=>T.explode);}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{placed='';if(active&&!raf)render();}).observe(canvas);

window.ELMY_STACK={
 id:'candidate',keys:['ArrowDown','ArrowUp','PageDown','PageUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}placed='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(current+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,
 debug:{S,render,setOpen,get state(){return{current,open,ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_STACK);
write(0);init();
})();

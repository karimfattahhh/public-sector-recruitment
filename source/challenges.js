/* Slide 3 (Nizar brief): Seven stages. Five institutional challenges. Ink threads carry the shared
   seven-stage rail into five challenge cards. Each challenge starts as disorder (a tangle, a maze,
   a leaking ring, a scattered cloud, fog) and resolves into its desired outcome (streamlined lanes,
   one coordinated path, a sealed shield, a target, a chart) when it is revealed; the finale links
   all five. Local WebGL and GSAP only; inline SVG icons are the no-WebGL fallback. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="challenges"]');if(!slide||!window.ELMY_LIGHT)return;
const{rng,FS_POINTS}=window.ELMY_LIGHT,g=window.gsap,rand=rng(303);
const canvas=$('.cx-canvas',slide),cards=$$('.cx-card',slide),arts=cards.map(c=>$('.cx-art',c)),counter=$('.cx-count b',slide);
const DATA=JSON.parse($('.cx-data',slide).textContent),rail=$('.cx-rail',slide),nodes=$$('.jr-node',rail),dots=nodes.map(b=>$('.jr-dot',b));
const D={num:$('.cx-dnum',slide),name:$('.cx-dname',slide),text:$('.cx-dtext',slide),out:$('.cx-dout span',slide)};
// Threads: each stage feeds the challenges it touches; four bridges link the cards in the finale.
const LINKS=[];DATA.forEach((c,ci)=>c.stages.forEach(st=>LINKS.push([st,ci])));const NL=LINKS.length,NB=4,NT=NL+NB;
const N=1300,TAU=Math.PI*2;

/* Shape helpers in unit space (roughly -1..1). */
const sample=(polys,n,jit=0)=>window.ELMY_LIGHT.sample(polys,n,jit,rand);
const curve=(f,n=160)=>Array.from({length:n+1},(_,i)=>f(i/n));
const circle=(r,cx=0,cy=0,n=120)=>curve(t=>[cx+Math.cos(t*TAU)*r,cy+Math.sin(t*TAU)*r,0],n);
const quad=(a,c,b,n=40)=>curve(t=>{const u=1-t;return[u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1],0];},n);
const gauss=()=>{let u=0,v=0;while(!u)u=rand();while(!v)v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(TAU*v);};
const pathPoint=t=>[-.86+1.72*t,-.62+1.24*t+.3*Math.sin(t*TAU),0];
const split=(n,parts)=>parts.map(p=>Math.round(n*p));

/* Each entry returns {a:[], b:[]} of N points plus per-point extras for b. */
const SHAPES=[
 // 1 Administrative complexity: a tangle resolves into five streamlined, flowing lanes.
 ()=>{const knot=curve(t=>{const u=t*TAU;return[.55*Math.sin(2*u)+.32*Math.sin(5*u+1),.5*Math.cos(3*u)+.3*Math.sin(7*u+.4),.45*Math.sin(4*u+.5)+.2*Math.cos(9*u)];},700);
  const a=sample([knot],N,.05),b=[];for(let i=0;i<N;i++){const lane=i%5,x=rand()*2-1;if(((x+1)*4.2)%1>.62){i--;continue;}b.push({p:[x,-.56+lane*.28,0],flow:1,color:lane===2?1:0});}return{a,b};},
 // 2 Operational coordination: a dead-end maze resolves into one coordinated path with people on it.
 ()=>{const walk=[[-.8,-.8,0]];let x=-.8,y=-.8;const step=.32;for(let k=0;k<26;k++){const dirs=[[1,0],[0,1],[-1,0],[0,-1]].filter(([dx,dy])=>Math.abs(x+dx*step)<=.82&&Math.abs(y+dy*step)<=.82);const[dx,dy]=dirs[Math.floor(rand()*dirs.length)];x+=dx*step;y+=dy*step;walk.push([x,y,(rand()-.5)*.3]);}
  const a=sample([walk],N,.03),travellers=14,line=sample([curve(pathPoint,200)],N-travellers-160,.006).map(p=>({p}));
  const ends=[...sample([circle(.07,-.86,-.62,40)],80,.004),...sample([circle(.07,.86,.62,40)],80,.004)].map(p=>({p,color:1}));
  const movers=Array.from({length:travellers},(_,i)=>({p:[i/travellers,0,0],flow:2,color:1,size:2.4}));return{a,b:[...line,...ends,...movers]};},
 // 3 Assessment quality & integrity: a ring leaking fragments resolves into a sealed shield.
 ()=>{const gaps=[.3,1.5,2.6,3.9,5.1],a=[];for(let i=0;i<N;i++){const t=rand()*TAU,inGap=gaps.some(g=>Math.abs(((t-g+Math.PI)%TAU+TAU)%TAU-Math.PI)<.16),r=.76+(inGap?.14+rand()*.36:(rand()-.5)*.05);a.push([Math.cos(t)*r,Math.sin(t)*r,(rand()-.5)*.25]);}
  const shield=[[[-.62,.7,0],[0,.86,0],[.62,.7,0],[.62,.08,0]],quad([.62,.08,0],[.6,-.55,0],[0,-.92,0]),quad([0,-.92,0],[-.6,-.55,0],[-.62,.08,0]),[[-.62,.08,0],[-.62,.7,0]]];
  const inner=shield.map(l=>l.map(p=>[p[0]*.8,p[1]*.8-.02,0])),check=[[[-.28,-.04,0],[-.07,-.26,0],[.32,.22,0]]];
  const[n1,n2,n3]=split(N,[.56,.24,.2]);const b=[...sample(shield,n1,.006).map(p=>({p})),...sample(inner,n2,.006).map(p=>({p})),...sample(check,N-n1-n2,.012).map(p=>({p,color:1}))];return{a,b};},
 // 4 Evaluation efficiency & accountability: an uneven scatter resolves into a target aligned on its centre.
 ()=>{const blobs=Array.from({length:6},()=>[(rand()*2-1)*.65,(rand()*2-1)*.65,(rand()*2-1)*.4]),a=[];
  for(let i=0;i<N;i++){const c=blobs[i%6],s=.12+(i%6)*.04;a.push([c[0]+gauss()*s,c[1]+gauss()*s,c[2]+gauss()*s]);}
  const[n1,n2,n3,n4]=split(N,[.18,.24,.3,.12]),cross=[[[-1,0,0],[-.66,0,0]],[[.66,0,0],[1,0,0]],[[0,-1,0],[0,-.66,0]],[[0,.66,0],[0,1,0]]];
  const b=[...sample([circle(.28)],n1,.005).map(p=>({p})),...sample([circle(.56)],n2,.005).map(p=>({p})),...sample([circle(.84)],n3,.005).map(p=>({p})),...sample(cross,n4,.005).map(p=>({p,color:1}))];
  while(b.length<N){const r=Math.sqrt(rand())*.09,t=rand()*TAU;b.push({p:[Math.cos(t)*r,Math.sin(t)*r,0],color:1});}return{a,b};},
 // 5 Institutional intelligence: fog resolves into a crisp chart with its trend.
 ()=>{const a=[];for(let i=0;i<N;i++)a.push([gauss()*.48,gauss()*.4,gauss()*.35]);
  const heights=[.5,.78,.66,1.02,1.38],base=-.76,b=[];
  // Bars as an ordered halftone grid: evidence made legible.
  heights.forEach((h,k)=>{const x0=-.72+k*.36;for(let y=base+.015;y<=base+h;y+=.03)for(let c=-3;c<=3;c++)b.push({p:[x0+c*.03,y,0]});});
  const tops=heights.map((h,k)=>[-.72+k*.36,base+h+.1,0]);b.push(...sample([tops],120,.004).map(p=>({p,color:1})));
  b.push(...sample([[[-.95,base,0],[.95,base,0]]],80,.004).map(p=>({p,color:1})));
  while(b.length<N){const k=Math.floor(rand()*5),t=rand()*TAU;b.push({p:[tops[k][0]+Math.cos(t)*.045,tops[k][1]+Math.sin(t)*.045,0],color:1});}return{a,b};}
];

/* Interleaved particles: aA(3) aB(3) aK(cluster, seed, delay, flow) aS(sizeA, sizeB, alphaA, alphaB) aT(shapeA, colourB). */
const STRIDE=16,raw=[],angle=p=>Math.atan2(p[1],p[0]);
SHAPES.forEach((make,c)=>{const{a,b}=make();a.sort((x,y)=>angle(x)-angle(y));const order=b.map((v,i)=>i).sort((x,y)=>angle(b[x].p)-angle(b[y].p));const fog=c===4;
 for(let i=0;i<N;i++){const A=a[i],B=b[order[i]],soft=fog&&i%3===0;
  raw.push(...A,...B.p,c,rand()*100,rand()*.55+Math.abs(angle(B.p))/Math.PI*.3,B.flow||0,soft?15:2.1,B.size||2.2,soft?.07:.5,.92,soft?0:2,B.color||0);}});
const data=new Float32Array(raw),total=data.length/STRIDE;

const VS=`precision highp float;
attribute vec3 aA,aB;attribute vec4 aK,aS;attribute vec2 aT;
uniform vec2 uRes,uCenter[5];uniform float uScale[5],uOpen[5],uHover[5],uRot[5],uTime,uIntro,uDpr;
varying vec4 vC;varying float vS,vP;
vec3 path(float t){return vec3(-.86+1.72*t,-.62+1.24*t+.3*sin(t*6.28318),0.);}
void main(){
 int c=int(aK.x+.5);float seed=aK.y,delay=aK.z,flow=aK.w,open=uOpen[c],hover=uHover[c];
 float lm=clamp((open-delay*.45)/.55,0.,1.),e=lm*lm*(3.-2.*lm),arc=sin(3.14159*e);
 vec3 a=aA+vec3(sin(uTime*1.6+seed*7.),cos(uTime*1.3+seed*5.),sin(uTime*1.1+seed*3.))*(.03+.03*hover);
 vec3 b=aB;float fade=1.;
 if(flow>.5&&flow<1.5){b.x=mod(aB.x+uTime*.16+1.,2.)-1.;fade=smoothstep(-1.,-.86,b.x)*smoothstep(1.,.86,b.x);}
 else if(flow>1.5){float t=fract(aB.x+uTime*.09);b=path(t);fade=smoothstep(0.,.06,t)*smoothstep(1.,.94,t);}
 vec3 p=mix(a,b,e);p.z+=arc*.45;
 float ang=mix(uRot[c],sin(uTime*.45+float(c)*1.3)*.22,e),tilt=mix(.42,.1,e);
 p.xz=mat2(cos(ang),sin(ang),-sin(ang),cos(ang))*p.xz;p.yz=mat2(cos(tilt),sin(tilt),-sin(tilt),cos(tilt))*p.yz;
 float f=1./(1.-p.z*.22),k=clamp(uIntro*1.5-delay*.5-float(c)*.06,0.,1.);k=k*k*(3.-2.*k);
 vec2 scr=uCenter[c]+vec2(p.x,-p.y)*uScale[c]*f*mix(1.7,1.,k)*(1.+hover*.04*e);
 gl_Position=vec4(scr.x/uRes.x*2.-1.,1.-scr.y/uRes.y*2.,0.,1.);
 vec3 chaos=vec3(.43,.46,.64),order=aT.y>.5?vec3(.063,.086,.169):vec3(.204,.271,.922);
 gl_PointSize=max(1.,mix(aS.x,aS.y,e)*f*uDpr*(1.+arc*.4));
 vC=vec4(mix(chaos,order,e),mix(aS.z*(1.+hover*.4),aS.w,e)*k*mix(1.,fade,e));vS=mix(aT.x,2.,e);vP=0.;
}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS_BG=`precision mediump float;uniform vec2 uRes;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 p=gl_FragCoord.xy/uRes;vec3 col=mix(vec3(.961,.965,.98),vec3(.925,.933,.99),smoothstep(.2,1.2,distance(p,vec2(.85,.95))*-1.+1.2));
 col=mix(col,vec3(.93,.94,.98),smoothstep(.55,0.,p.y)*.35);col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

/* Thread particles: link index, position along the link, seed, bead flag. */
const TH=[],PER=110;for(let l=0;l<NT;l++){for(let k=0;k<=PER;k++)TH.push(l,k/PER,rand()*100,0);for(let k=0;k<4;k++)TH.push(l,k/4,rand()*100,1);}
const thData=new Float32Array(TH),thTotal=thData.length/4;
const VS_TH=`precision highp float;
attribute vec4 aL;uniform vec2 uRes,uA[${NT}],uB[${NT}],uC[${NT}];uniform float uDraw[${NT}],uAlpha[${NT}],uTime,uDpr;
varying vec4 vC;varying float vS,vP;
void main(){int l=int(aL.x+.5);float t=aL.y,bead=aL.w,draw=uDraw[l];
 if(bead>.5)t=fract(t+uTime*.12+aL.z*.01);
 vec2 a=uA[l],b=uB[l],c=uC[l];float u=1.-t;vec2 p=u*u*a+2.*u*t*c+t*t*b;
 gl_Position=vec4(p.x/uRes.x*2.-1.,1.-p.y/uRes.y*2.,0.,1.);
 float on=step(t,draw*1.02)*uAlpha[l],br=float(l)<${NL}.0?0.:1.;
 gl_PointSize=(bead>.5?5.:1.9)*uDpr;
 vC=vec4(mix(vec3(.204,.271,.922),vec3(.063,.086,.169),br*.25),on*(bead>.5?.85*step(.999,draw):.42+.2*br)*smoothstep(0.,.04,t)*smoothstep(1.,.96,t));vS=2.;vP=0.;}`;
let gl=null,program,attribs,P,TP,BG,buf,thBuf,quadBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('cx-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  P=program(VS,FS_POINTS);TP=program(VS_TH,FS_POINTS);BG=program(VS_BG,FS_BG);buf=kit.buffer(data);thBuf=kit.buffer(thData);quadBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State: open and hover per card, an intro gather and per-card spin while unresolved. */
const S={open:[0,0,0,0,0],hover:[0,0,0,0,0],intro:1,draw:Array(NT).fill(1),alpha:Array(NT).fill(.42)},rot=[0,1.2,2.4,3.6,4.8];
let active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,textTl=null,stack=[];
function render(){if(!ready)return;frames++;
 window.ELMY_LIGHT.fit(canvas);const box=canvas.getBoundingClientRect();
 const centers=[],scales=[];arts.forEach(el=>{const r=el.getBoundingClientRect();centers.push(r.left-box.left+r.width/2,r.top-box.top+r.height/2);scales.push(Math.min(r.width,r.height)/2.25);});
 gl.viewport(0,0,canvas.width,canvas.height);gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quadBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(P.p);
 attribs(P,buf,[['aA',3,0],['aB',3,3],['aK',4,6],['aS',4,10],['aT',2,14]],STRIDE);const u=P.u;
 gl.uniform2f(u.uRes,box.width||1,box.height||1);gl.uniform2fv(u.uCenter,centers);gl.uniform1fv(u.uScale,scales);gl.uniform1fv(u.uOpen,S.open);gl.uniform1fv(u.uHover,S.hover);gl.uniform1fv(u.uRot,rot);
 gl.uniform1f(u.uTime,time);gl.uniform1f(u.uIntro,S.intro);gl.uniform1f(u.uDpr,canvas.width/(box.width||1));
 // Threads measure the rail dots and card drawings, and draw beneath the ink.
 const A=[],B=[],C=[];
 LINKS.forEach(([st,ci])=>{const r=dots[st].getBoundingClientRect(),x0=r.left-box.left+r.width/2,y0=nodes[st].getBoundingClientRect().bottom-box.top+6,ar=arts[ci].getBoundingClientRect(),x1=ar.left-box.left+ar.width/2,y1=ar.top-box.top+ar.height*.12;A.push(x0,y0);B.push(x1,y1);C.push(x0,(y0+y1)/2+(y1-y0)*.18);});
 for(let k=0;k<NB;k++){const x0=centers[k*2],y0=centers[k*2+1],x1=centers[k*2+2],y1=centers[k*2+3],w=x1-x0;A.push(x0+w*.18,y0);B.push(x1-w*.18,y1);C.push((x0+x1)/2,y0-scales[k]*.95);}
 gl.useProgram(TP.p);attribs(TP,thBuf,[['aL',4,0]],4);const v=TP.u;
 gl.uniform2f(v.uRes,box.width||1,box.height||1);gl.uniform2fv(v.uA,A);gl.uniform2fv(v.uB,B);gl.uniform2fv(v.uC,C);gl.uniform1fv(v.uDraw,S.draw);gl.uniform1fv(v.uAlpha,S.alpha);gl.uniform1f(v.uTime,time);gl.uniform1f(v.uDpr,canvas.width/(box.width||1));
 if(innerWidth>900)gl.drawArrays(gl.POINTS,0,thTotal);// On phones the panel sits between rail and cards.
 gl.useProgram(P.p);attribs(P,buf,[['aA',3,0],['aB',3,3],['aK',4,6],['aS',4,10],['aT',2,14]],STRIDE);gl.drawArrays(gl.POINTS,0,total);}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;rot.forEach((r,i)=>rot[i]=r+dt*(.32+S.hover[i]*.9)*(1-S.open[i]));render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Cards: open ones show their desired outcome; one is current in the reading panel; the finale links all five. */
let current=-1,linked=false;
const isOpen=i=>cards[i].classList.contains('is-open');
function threads(animate=motion){const alpha=S.alpha.map((_,l)=>{if(l>=NL)return linked?1:0;const ci=LINKS[l][1];return linked?.7:current<0?.42:ci===current?1:.14;}),draw=S.draw.map((_,l)=>l>=NL?(linked?1:0):1);
 if(g&&animate&&ready){g.to(S.alpha,{...Object.fromEntries(alpha.map((v,k)=>[k,v])),duration:.7,ease:'power2.out',overwrite:'auto'});g.to(S.draw,{...Object.fromEntries(draw.map((v,k)=>[k,v])),duration:linked?1.4:.5,ease:'power2.inOut',overwrite:'auto'});}
 else{alpha.forEach((v,k)=>S.alpha[k]=v);draw.forEach((v,k)=>S.draw[k]=v);}}
function sync(animate=motion){const n=cards.filter((c,i)=>isOpen(i)).length;if(counter)counter.textContent=String(n);
 slide.classList.toggle('cx-linked',linked);slide.dataset.view=linked?'final':current>=0?'detail':'intro';
 cards.forEach((c,i)=>c.classList.toggle('is-current',i===current&&!linked));
 const lit=current>=0&&!linked?DATA[current].stages:[];nodes.forEach((b,k)=>{b.classList.toggle('is-lit',lit.includes(k));b.setAttribute('aria-pressed',String(lit.includes(k)));});
 rail.classList.toggle('is-all',linked);rail.classList.add('is-idle');
 if(current>=0){const d=DATA[current];D.num.textContent=String(current+1).padStart(2,'0');D.name.textContent=d.name;D.text.textContent=d.text;D.out.textContent=d.outcome;}
 threads(animate);if(!raf)render();}
function set(i,open,animate=motion){const card=cards[i],btn=$('.cx-toggle',card);if(isOpen(i)===open)return;
 card.classList.toggle('is-open',open);btn.setAttribute('aria-expanded',String(open));$('.cx-short',card).setAttribute('aria-hidden',String(!open));$('.cx-toggle span',card).textContent=open?'Show the challenge':'Reveal the challenge';
 stack=stack.filter(x=>x!==i);if(open)stack.push(i);
 if(g&&animate&&ready){g.to(S.open,{[i]:open?1:0,duration:open?1.6:1.1,ease:open?'power3.inOut':'power2.inOut',overwrite:'auto'});}else{S.open[i]=open?1:0;}}
function select(i,animate=motion){linked=false;current=i;if(i>=0)set(i,true,animate);
 if(g&&animate&&i>=0)g.fromTo($$('.cx-dname,.cx-dtext,.cx-dout',slide),{opacity:0,y:10},{opacity:1,y:0,duration:.6,stagger:.06,ease:'power3.out',clearProps:'opacity,transform'});
 sync(animate);}
function close(i,animate=motion){set(i,false,animate);if(current===i){const prev=stack[stack.length-1];current=prev===undefined?-1:prev;}linked=false;sync(animate);}
function link(on,animate=motion){linked=on;if(on)cards.forEach((c,i)=>set(i,true,animate));else current=stack[stack.length-1]??-1;sync(animate);}
cards.forEach((card,i)=>{card.addEventListener('click',e=>{if(e.target.closest('a'))return;if(!isOpen(i)||current!==i||linked)select(i);else close(i);});
 card.addEventListener('pointerenter',()=>{if(g&&motion)g.to(S.hover,{[i]:1,duration:.5,overwrite:'auto'});});
 card.addEventListener('pointerleave',()=>{if(g&&motion)g.to(S.hover,{[i]:0,duration:.8,overwrite:'auto'});else S.hover[i]=0;});});
nodes.forEach((b,k)=>b.addEventListener('click',()=>{const i=DATA.findIndex(d=>d.stages.includes(k));if(i>=0)select(i);}));
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.cx-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.cx-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.cx-subtitle,.cx-panel'),{opacity:0,y:14},{opacity:1,y:0,duration:.9,stagger:.15},full?.5:.2)
  .fromTo(q('.cx-rail .jr-line'),{scaleX:0,transformOrigin:'0 50%'},{scaleX:1,duration:1.4,ease:'power2.inOut'},full?.45:.1)
  .fromTo(q('.cx-rail li'),{opacity:0,y:10},{opacity:1,y:0,duration:.7,stagger:.09},full?.55:.12)
  .fromTo(cards.map(c=>[...c.children].filter(x=>!x.matches('.cx-art'))).flat(),{opacity:0,y:16},{opacity:1,y:0,duration:.8,stagger:.03},full?.7:.25)
  .fromTo(q('.cx-foot'),{opacity:0},{opacity:1,duration:.8},full?1.4:.5);
 if(full&&ready){S.intro=0;LINKS.forEach((_,k)=>S.draw[k]=0);textTl.to(S,{intro:1,duration:2.1,ease:'power2.out'},.9).to(S.draw,{...Object.fromEntries(LINKS.map((_,k)=>[k,1])),duration:1.5,ease:'power2.inOut'},.9);}}
function settle(){textTl?.kill();textTl=null;S.intro=1;threads(false);if(g)g.set($$('.cx-kicker,.cx-line>span,.cx-subtitle,.cx-panel,.cx-rail .jr-line,.cx-rail li,.cx-card>*,.cx-foot',slide),{clearProps:'opacity,transform'});}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);
slide.addEventListener('scroll',()=>{if(active&&!raf)render();},{passive:true});

window.ELMY_CHALLENGES={
 id:'challenges',keys:['ArrowDown','ArrowUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&!played){played=true;sync(false);text(true);}else{settle();text(false);}render();start();},
 mode(on){motion=on;if(!on){settle();stop();S.hover=S.hover.map(()=>0);S.open=cards.map(c=>c.classList.contains('is-open')?1:0);render();}else start();},
 key(k){if(k==='ArrowDown'){if(linked)return;const i=cards.findIndex((c,j)=>!isOpen(j));if(i>=0)select(i);else link(true);}
  else{if(linked){link(false);return;}const i=stack[stack.length-1];if(i!==undefined)close(i);}},
 debug:{S,render,select,link,get state(){return{ready,frames,particles:total,current,linked,open:S.open.slice(),failure:canvas.dataset.failure||null};}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_CHALLENGES);
sync(false);init();
})();

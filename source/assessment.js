/* Slide 7 (Nizar brief): What makes an examination credible? One illustrative question (Q-1047) sits
   at the centre; six glass foundation cards arrive around it one at a time and link to it; the finale
   draws the quality cycle through all six. Card contents are drawn analytically in the fragment
   shader. Local WebGL and GSAP only; without WebGL the question and the panel carry the slide. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="assessment"]');if(!slide||!window.ELMY_LIGHT)return;
const{M,rng,FS_POINTS,VS_FLAT,FS_SPARK,VS_BG,FS_BG}=window.ELMY_LIGHT,g=window.gsap,rand=rng(606);
const DATA=JSON.parse($('.qa-data',slide).textContent),F=DATA.f,NF=F.length,LAST=NF+1;
const canvas=$('.qa-canvas',slide),labels=$$('.qa-label',slide),verbs=$$('.qa-verb',slide),question=$('.qa-question',slide),extras=$$('.qa-extra',slide);
const P={count:$('.qa-count',slide),tag:$('.qa-tag',slide),name:$('.qa-name',slide),text:$('.qa-text',slide),step:$('.qa-step',slide)};
const pad=n=>String(n).padStart(2,'0');

/* Cards sit on a flat-topped hexagon around the question, read clockwise from the top left. */
const CW=.8,CH=1.05,KIND=[0,1,2,6,3,5],ANG=[120,60,0,-60,-120,180].map(d=>d*Math.PI/180),CARD_S=.4;
let RX=2.55,RY=1.98;
const slot=k=>[Math.cos(ANG[k])*RX,Math.sin(ANG[k])*RY,0];
const VS_CARD=`precision highp float;attribute vec2 aQ;uniform mat4 uProj,uView,uModel;uniform vec2 uShift;varying vec2 vL;
void main(){vL=aQ*vec2(${(CW+.32).toFixed(2)},${(CH+.32).toFixed(2)});vec4 c=uProj*uView*uModel*vec4(vL,0.,1.);c.xy+=uShift*c.w;gl_Position=c;}`;
const FS_CARD=ext=>`${ext?'#extension GL_OES_standard_derivatives : enable\n':''}precision highp float;varying vec2 vL;
uniform float uKind,uAlpha,uHi,uReveal,uSeal,uTime;
${ext?'':'float fwidth(float x){return .004;}'}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
float fill(float d){float aa=fwidth(d);return 1.-smoothstep(-aa,aa,d);}
float ring(float d,float w){float aa=fwidth(d);return 1.-smoothstep(w-aa,w+aa,abs(d));}
float bar(vec2 p,float x0,float x1,float y,float h){return fill(box(p-vec2((x0+x1)*.5,y),vec2((x1-x0)*.5,h),h));}
float check(vec2 p,vec2 c,float s){return min(seg(p,c+vec2(-.5,0.)*s,c+vec2(-.15,-.35)*s),seg(p,c+vec2(-.15,-.35)*s,c+vec2(.55,.4)*s));}
void main(){
 vec2 p=vL;int k=int(uKind+.5);
 float d=box(p,vec2(${CW.toFixed(2)},${CH.toFixed(2)}),.09),aa=fwidth(d);
 float inside=1.-smoothstep(-aa,aa,d),glow=exp(-max(d,0.)*9.)*(1.-inside);
 float top=(p.y+${CH.toFixed(2)})/${(2*CH).toFixed(2)};
 vec3 lav=vec3(.765,.776,1.),lime=vec3(.8,.937,.678),white=vec3(.96,.965,.98);
 vec3 col=mix(vec3(.18,.24,.62),vec3(.32,.38,.9),top);float a=(.34+.14*top+uHi*.12)*inside;
 // Contents, revealed from the top down.
 float show=smoothstep(0.,.08,uReveal*1.25-(1.-top)),ink=0.,acc=0.;
 if(k==0){ink=fill(length(p-vec2(-.46,.6))-.1);ink=max(ink,fill(box(p-vec2(-.46,.4),vec2(.17,.07),.07)));
  ink=max(ink,bar(p,-.18,.55,.64,.022)*.8);ink=max(ink,bar(p,-.18,.32,.5,.022)*.6);
  for(int i=0;i<4;i++){float y=.12-float(i)*.25,len=i==0?.75:i==1?.55:i==2?.88:.42;ink=max(ink,bar(p,-.62,-.28,y,.02)*.6);ink=max(ink,bar(p,-.16,.6,y,.035)*.2);float f=bar(p,-.16,-.16+.76*len,y,.035);if(i==2)acc=max(acc,f);else ink=max(ink,f*.9);}}
 else if(k==1){ink=bar(p,-.6,.2,.82,.025)*.8;for(int c=0;c<4;c++)for(int r=0;r<5;r++){vec2 q=vec2(-.45+float(c)*.3,.48-float(r)*.27);float w=fract(sin(float(c*7+r*3)*12.9898)*43758.5453);float cell=fill(box(p-q,vec2(.12,.1),.02));ink=max(ink,cell*(.18+w*.55));if(w>.82)acc=max(acc,cell);}
  ink=max(ink,ring(box(p-vec2(0.,-.06),vec2(.62,.7),.04),.006)*.7);}
 else if(k==2||k==4){ink=max(bar(p,-.62,.55,.66,.024),bar(p,-.62,.42,.54,.024));ink=max(ink,bar(p,-.62,-.05,.42,.024));
  for(int i=0;i<4;i++){float y=.12-float(i)*.25;ink=max(ink,ring(length(p-vec2(-.52,y))-.065,.012));ink=max(ink,bar(p,-.36,.4-float(i)*.08,y,.02)*.75);if(i==1)acc=max(acc,fill(length(p-vec2(-.52,y))-.045));}
  if(k==4){float lock=max(fill(box(p-vec2(0.,-.66),vec2(.13,.1),.03)),ring(length(p-vec2(0.,-.56))-.08,.016)*step(-.56,p.y));ink=max(ink*.55,lock*uSeal);
   float sealD=length(p-vec2(.5,-.68))-.17;acc=max(acc*.6,max(ring(sealD,.014),fill(check(p,vec2(.5,-.68),.2)-.018))*uSeal);acc=max(acc,ring(sealD+.05,.006)*uSeal*.7);}}
 else if(k==3){ink=max(bar(p,-.62,.4,.66,.022)*.5,bar(p,-.62,.2,.55,.022)*.5);ink=max(ink,ring(box(p-vec2(0.,.6),vec2(.7,.18),.04),.006)*.4);
  for(int i=0;i<2;i++){vec2 c=vec2(-.4+float(i)*.5,.12);ink=max(ink,ring(length(p-c)-.13,.014));ink=max(ink,fill(length(p-c-vec2(0.,.04))-.04));ink=max(ink,fill(box(p-c-vec2(0.,-.05),vec2(.06,.025),.025)));acc=max(acc,fill(check(p,c+vec2(.13,-.13),.1)-.012));}
  float st=length(p-vec2(.25,-.5))-.24;acc=max(acc,max(ring(st,.016),ring(st+.06,.008)*.7));acc=max(acc,fill(check(p,vec2(.25,-.5),.24)-.022));ink=max(ink,bar(p,-.62,-.25,-.5,.022)*.6);ink=max(ink,bar(p,-.62,-.35,-.62,.022)*.5);}
 else if(k==6){ink=bar(p,-.6,.2,.82,.025)*.8;
  for(int i=0;i<3;i++){float y=.42-float(i)*.3;ink=max(ink,fill(box(p-vec2(-.34,y),vec2(.22,.1),.04))*(i==1?0.:.35));if(i==1)acc=max(acc,fill(box(p-vec2(-.34,y),vec2(.22,.1),.04)));}
  for(int i=0;i<4;i++){float y=.5-float(i)*.25;float w=.18+.07*float(i);ink=max(ink,fill(box(p-vec2(.34,y),vec2(w*.5,.08),.04))*(i==2?0.:.35));if(i==2)acc=max(acc,fill(box(p-vec2(.34,y),vec2(w*.5,.08),.04)));}
  ink=max(ink,bar(p,-.01,.01,.04,.5)*.4);ink=max(ink,bar(p,-.62,.62,-.62,.008)*.6);
  for(int i=0;i<3;i++)ink=max(ink,fill(length(p-vec2(-.4+float(i)*.4,-.78))-.035)*.6);}
 else{ink=bar(p,-.6,.2,.78,.025)*.8;for(int i=0;i<6;i++){float x=-.52+float(i)*.21,h=.25+.12*float(i)+.1*sin(float(i)*2.3);ink=max(ink,fill(box(p-vec2(x,-.72+h*.5),vec2(.065,h*.5),.02))*.55);}
  float tr=1e3;for(int i=0;i<5;i++){float x0=-.52+float(i)*.21,x1=x0+.21,h0=.25+.12*float(i)+.1*sin(float(i)*2.3),h1=.25+.12*float(i+1)+.1*sin(float(i+1)*2.3);tr=min(tr,seg(p,vec2(x0,-.72+h0+.08),vec2(x1,-.72+h1+.08)));}acc=max(acc,fill(tr-.012));
  ink=max(ink,bar(p,-.62,.62,-.76,.008)*.7);}
 ink*=show;acc*=show;
 col=mix(col,lav,ink*.85);col=mix(col,lime,acc);a=max(a,(ink*.9+acc)*inside);
 // Rim, highlight and outer glow.
 float rim=ring(d+.004,.006);col=mix(col,white,rim*(.6+uHi*.4));a=max(a,rim*(.7+uHi*.3));
 col=mix(col,lime,uSeal*ring(d-.02,.01)*step(3.5,uKind)*step(uKind,4.5));
 a+=glow*(.12+uHi*.16+uSeal*.2*step(3.5,uKind)*step(uKind,4.5));col=mix(col,uSeal>.5&&k==4?lime:lav,glow*.6*(1.-inside));
 a*=uAlpha;if(a<.003)discard;gl_FragColor=vec4(col*a,a);}`;
const VS_DOTS=`precision highp float;attribute vec3 aP;attribute vec2 aS;uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uPx,uTime;varying vec4 vC;varying float vS,vP;
void main(){vec3 p=aP+vec3(sin(uTime*.07+aS.y*9.)*.3,sin(uTime*.05+aS.y*5.)*.3,0.);vec4 c=uProj*uView*vec4(p,1.);c.xy+=uShift*c.w;gl_Position=c;gl_PointSize=max(1.5,aS.x*uPx/c.w);vC=vec4(.765,.776,1.,.35*fract(aS.y*7.31)+.08);vS=0.;vP=0.;}`;

let gl=null,program,attribs,CD,DT,K,BG,quadBuf,fullBuf,dotBuf,linkBuf,ready=false;
const motes=[];for(let i=0;i<180;i++)motes.push(-9+rand()*20,-3+rand()*6,-4-rand()*5,.012+rand()*.03,rand()*10);
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('qa-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  const ext=!!gl.getExtension('OES_standard_derivatives');CD=program(VS_CARD,FS_CARD(ext));DT=program(VS_DOTS,FS_POINTS);K=program(VS_FLAT,FS_SPARK);BG=program(VS_BG,FS_BG);
  quadBuf=kit.buffer(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]));fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));dotBuf=kit.buffer(new Float32Array(motes));linkBuf=gl.createBuffer();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State: each card's arrival (t), emphasis and contents; the spokes and the cycle ring. */
const cards=Array.from({length:NF},()=>({t:0,hi:0,reveal:0}));
const S={q:1,link:Array(NF).fill(0),ring:0};
let current=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,panelTl=null,layout={shift:[.36,-.02],fov:.5,flat:false,rs:1},placed='';
const links=new Float32Array(4000*8);
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),flat=innerWidth<=900||!ready;slide.classList.toggle('qa-flat',flat);
 const rs=Math.min(1,aspect/1.6),narrow=aspect<1.45,H=canvas.clientHeight;RX=narrow?1.8:2.55*rs;RY=(narrow?2.1:1.98)*(H<800?.93:1);
 layout=flat?{shift:[0,0],fov:.6,flat,rs}:{shift:[aspect<1.45?.41:.35,.0],fov:.5,flat,rs};return aspect;}
function camera(aspect){return{proj:M.perspective(layout.fov,aspect,.1,80),view:M.lookAt([.7,.3,12.5],[0,0,0],[0,1,0])};}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight];}
function cardPos(k){const c=cards[k],e=c.t,s=slot(k);return[s[0]*e,s[1]*e,-1.2*(1-e)+(motion?Math.sin(time*.8+k*1.3)*.03:0)];}
function render(){if(!ready)return;const aspect=measure();if(layout.flat){place(null);return;}frames++;
 const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);const{proj,view}=camera(aspect),vp=M.mul(proj,view),px=(H/2)/Math.tan(layout.fov/2);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);const c0=project(vp,[0,0,0]);gl.uniform2f(BG.u.uGlow,c0[0]/canvas.clientWidth,1-c0[1]/canvas.clientHeight);gl.uniform2f(BG.u.uVig,.6,.5);gl.uniform1f(BG.u.uGlowA,.8);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 gl.useProgram(DT.p);attribs(DT,dotBuf,[['aP',3,0],['aS',2,3]],5);gl.uniformMatrix4fv(DT.u.uProj,false,proj);gl.uniformMatrix4fv(DT.u.uView,false,view);gl.uniform2f(DT.u.uShift,...layout.shift);gl.uniform1f(DT.u.uPx,px);gl.uniform1f(DT.u.uTime,time);gl.drawArrays(gl.POINTS,0,motes.length/5);
 // Spokes from the question to each card, and the cycle ring through all six.
 let n=0;const dot=(p,c,a,s)=>{if(n<4000&&a>.005){links.set([...p,...c,a,s],n*8);n++;}};
 const lav=[.765,.776,1],lime=[.8,.937,.678];
 for(let k=0;k<NF;k++){const L=S.link[k];if(L<.01)continue;const p=cardPos(k),on=cards[k].hi;
  for(let j=0;j<=60;j++){const t=.3+j/60*.62;if(t>.3+.62*L)break;dot([p[0]*t,p[1]*t,p[2]*t-.2],on>.5?lime:lav,.35+.4*on,.028);}
  if(L>.99){const b=(time*.35+k*.17)%1;dot([p[0]*(.3+.62*b),p[1]*(.3+.62*b),-.2],lime,Math.sin(Math.PI*b)*.9,.07);}}
 if(S.ring>.01){const N=360;for(let j=0;j<=N*S.ring;j++){const a=ANG[0]-j/N*Math.PI*2;dot([Math.cos(a)*RX,Math.sin(a)*RY,-.35],lime,.55,.03);}
  if(S.ring>.99)for(let q=0;q<6;q++){const a=ANG[0]-((time*.08+q/6)%1)*Math.PI*2;for(let c=0;c<5;c++){const ac=a+c*.03;dot([Math.cos(ac)*RX,Math.sin(ac)*RY,-.34],lime,(1-c/5)*.95,.075*(1-c*.12));}}}
 if(n){gl.useProgram(K.p);gl.bindBuffer(gl.ARRAY_BUFFER,linkBuf);gl.bufferData(gl.ARRAY_BUFFER,links.subarray(0,n*8),gl.DYNAMIC_DRAW);attribs(K,linkBuf,[['aP',3,0],['aC',4,3],['aS',1,7]],8);
  gl.uniformMatrix4fv(K.u.uProj,false,proj);gl.uniformMatrix4fv(K.u.uView,false,view);gl.uniformMatrix4fv(K.u.uWorld,false,M.translate(0,0,0));gl.uniform2f(K.u.uShift,...layout.shift);
  gl.uniform1f(K.u.uPx,px);gl.uniform1f(K.u.uVis,1);gl.uniform2f(K.u.uFog,30,0);gl.uniform1f(K.u.uMirror,0);gl.uniform1f(K.u.uFloor,0);gl.drawArrays(gl.POINTS,0,n);}
 // Cards back to front.
 gl.useProgram(CD.p);attribs(CD,quadBuf,[['aQ',2,0]],2);const u=CD.u;gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniform2f(u.uShift,...layout.shift);gl.uniform1f(u.uTime,time);
 for(let k=0;k<NF;k++){const c=cards[k];if(c.t<.01)continue;const p=cardPos(k),sc=CARD_S*(.35+.65*c.t)*(1+c.hi*.08),yaw=-.22*Math.cos(ANG[k])+(motion?Math.sin(time*.6+k)*.03:0);
  gl.uniformMatrix4fv(u.uModel,false,M.mul(M.translate(...p),M.mul(M.ry(yaw),M.scale(sc))));gl.uniform1f(u.uKind,KIND[k]);gl.uniform1f(u.uAlpha,Math.min(1,c.t*1.4)*(.62+.38*Math.max(c.hi,S.ring)));gl.uniform1f(u.uHi,c.hi);gl.uniform1f(u.uReveal,c.reveal);gl.uniform1f(u.uSeal,0);gl.drawArrays(gl.TRIANGLES,0,6);}
 place(vp);}
/* The question sits at the centre; captions under (or over) their cards; cycle verbs on the ring. */
function place(vp){
 if(!vp){if(placed!=='flat'){placed='flat';question.style.transform='';question.style.opacity='';}return;}
 const key=[...cards.map(c=>c.t+c.hi),S.ring,S.q,RX,canvas.clientWidth,canvas.clientHeight].map(v=>v.toFixed(3)).join();if(key===placed)return;placed=key;
 const[qx,qy]=project(vp,[0,0,0]);question.style.transform=`translate(${(qx-question.offsetWidth/2).toFixed(1)}px,${(qy-question.offsetHeight/2).toFixed(1)}px)`;question.style.opacity=String(S.q);
 labels.forEach((l,k)=>{const c=cards[k],s=slot(k),up=Math.sin(ANG[k])>.5,[x,y]=project(vp,[s[0],s[1]+(up?1:-1)*(CH*CARD_S+.14),0]),o=c.t>.9?.55+.45*Math.max(c.hi,S.ring):0;
  l.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,${up?'-100%':'0'})`;l.style.opacity=String(o);l.style.visibility=o>.01?'visible':'hidden';});
 verbs.forEach((v,k)=>{const a=ANG[k]-Math.PI/6,[x,y]=project(vp,[Math.cos(a)*RX,Math.sin(a)*RY,-.35]),o=Math.max(0,Math.min(1,(S.ring-.6)*3));v.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;v.style.opacity=String(o);v.style.visibility=o>.01?'visible':'hidden';});}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps: 0 the question alone, 1-6 one foundation each, 7 the quality cycle. */
function targets(n){return{cards:cards.map((_,k)=>({t:n>k?1:0,hi:n===k+1?1:n===LAST?.6:0,reveal:n>k?1:0})),link:S.link.map((_,k)=>n>k?1:0),ring:n===LAST?1:0};}
function write(n){slide.dataset.step=String(n);slide.dataset.view=n===0?'intro':n===LAST?'final':'detail';slide.dataset.meta=n>=3?'on':'off';slide.dataset.key=n>=5?'on':'off';P.step.textContent=`${Math.min(n,NF)} / ${NF}`;
 if(n>=1&&n<=NF){const f=F[n-1];P.count.textContent=pad(n);P.tag.textContent=f.tag;P.name.textContent=f.name;P.text.textContent=f.text;extras.forEach(x=>x.classList.toggle('is-on',x.dataset.x===f.extra));}}
function go(n,animate=motion){n=Math.max(0,Math.min(LAST,n));if(n===current&&!tl)return;const prev=current;current=n;const T=targets(n);
 if(!g||!animate||!ready){cards.forEach((c,k)=>Object.assign(c,T.cards[k]));S.link=T.link;S.ring=T.ring;write(n);placed='';render();return;}
 cards.forEach((c,k)=>{const d=T.cards[k],arriving=d.t>c.t;g.to(c,{t:d.t,hi:d.hi,duration:arriving?1.1:.6,ease:arriving?'back.out(1.2)':'power2.in',delay:arriving?.1:0,overwrite:'auto'});
  if(d.reveal>c.reveal)g.fromTo(c,{reveal:0},{reveal:1,duration:1,ease:'power2.out',delay:.45});else if(d.reveal<c.reveal)c.reveal=d.reveal;});
 S.link.forEach((v,k)=>{if(v!==T.link[k])g.to(S.link,{[k]:T.link[k],duration:T.link[k]?.8:.3,delay:T.link[k]?.5:0,ease:'power2.inOut',overwrite:'auto'});});
 g.to(S,{ring:T.ring,duration:T.ring?1.8:.4,ease:'power2.inOut',overwrite:'auto'});
 if(n>=1&&n<=NF&&prev>=1&&prev<=NF){const parts=[P.count.parentNode,P.name,P.text,...extras],dir=n>prev?1:-1;panelTl?.progress(1);
  panelTl=g.timeline().to(parts,{opacity:0,y:-8*dir,duration:.2,ease:'power2.in'}).add(()=>write(n)).fromTo(parts,{opacity:0,y:12*dir},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.04,clearProps:'opacity,transform'});}
 else write(n);}
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||layout.flat||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});
function intro(){tl?.kill();S.q=0;tl=g.timeline().to(S,{q:1,duration:1,ease:'power2.out'},.6).fromTo(question,{y:24},{y:0,duration:1.1,ease:'power3.out',clearProps:'transform',onUpdate:()=>{placed='';}},.6);}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.qa-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.qa-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.qa-subtitle,.qa-panel,.qa-hint'),{opacity:0,y:14},{opacity:1,y:0,duration:.9,stagger:.1},full?.6:.2)
  .fromTo(q('.qa-foot'),{opacity:0},{opacity:1,duration:.8},full?1.3:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.qa-kicker,.qa-line>span,.qa-subtitle,.qa-panel,.qa-hint,.qa-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}S.q=1;const T=targets(current);cards.forEach((c,k)=>Object.assign(c,T.cards[k]));S.link=T.link;S.ring=T.ring;placed='';}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{placed='';if(active&&!raf)render();}).observe(canvas);

window.ELMY_ASSESSMENT={
 id:'assessment',keys:['ArrowDown','ArrowUp','PageDown','PageUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}placed='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(current+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,
 debug:{S,cards,render,get state(){return{current,ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_ASSESSMENT);
write(0);init();finish();
})();

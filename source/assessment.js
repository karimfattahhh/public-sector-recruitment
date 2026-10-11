/* Assessment scene: an examination question is built from glass cards along the six-step method.
   Competencies (framework, blueprint) and academic rigor (question, independent review) happen
   before examination day; institutional authority stacks every card into one sealed question that
   crosses the examination-day line, followed by documented scoring. Cards and their contents are
   drawn analytically in the fragment shader. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="assessment"]');if(!slide||!window.ELMY_LIGHT)return;
const{M,rng,FS_POINTS,VS_BG,FS_BG}=window.ELMY_LIGHT,g=window.gsap,rand=rng(606);
const FOUNDATIONS=JSON.parse($('.qa-data',slide).textContent);
const canvas=$('.qa-canvas',slide),tabs=$$('.qa-tab',slide),stations=$$('.qa-station',slide),labels=$$('.qa-label',slide),dayTag=$('.qa-day-tag',slide);
const panel={count:$('.qa-count',slide),title:$('.qa-detail h3',slide),text:$('.qa-detail p:not(.qa-meta)',slide),source:$('.qa-detail small',slide),name:$('.qa-name',slide)};
const pad=n=>String(n).padStart(2,'0');

/* World: stations along x; cards are 1.6 x 2.1 portrait panes at z = 0. */
const STATION=s=>-5.5+2.2*s,DAY=2.2,CW=.8,CH=1.05;
// Cards: 0 framework, 1 blueprint, 2 question, 3 review, 4 sealed question, 5 scoring.
const HOME=[STATION(0),STATION(1),STATION(2),STATION(3),STATION(4),STATION(5)];
const STEP_CARDS=[[0,1],[2,3],[4,5]];
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
const VS_LINE=`precision highp float;attribute vec2 aQ;uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uX;varying vec2 vQ;
void main(){vQ=aQ;vec4 c=uProj*uView*vec4(uX+aQ.x*.12,aQ.y*1.75+.05,-.4,1.);c.xy+=uShift*c.w;gl_Position=c;}`;
const FS_LINE=`precision mediump float;varying vec2 vQ;uniform float uAlpha,uTime;
void main(){float x=abs(vQ.x),core=exp(-x*x*90.),glow=exp(-x*x*6.);float dash=step(.45,fract(vQ.y*9.-uTime*.6));float fade=smoothstep(1.,.75,abs(vQ.y));
 float a=(core*(.35+.65*dash)+glow*.14)*fade*uAlpha;vec3 c=mix(vec3(.8,.937,.678),vec3(.96,.97,.98),core*.4);gl_FragColor=vec4(c*a,a);}`;
const VS_DOTS=`precision highp float;attribute vec3 aP;attribute vec2 aS;uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uPx,uTime;varying vec4 vC;varying float vS,vP;
void main(){vec3 p=aP+vec3(sin(uTime*.07+aS.y*9.)*.3,sin(uTime*.05+aS.y*5.)*.3,0.);vec4 c=uProj*uView*vec4(p,1.);c.xy+=uShift*c.w;gl_Position=c;gl_PointSize=max(1.5,aS.x*uPx/c.w);vC=vec4(.765,.776,1.,.35*fract(aS.y*7.31)+.08);vS=0.;vP=0.;}`;

let gl=null,program,attribs,CD,LN,DT,BG,quadBuf,fullBuf,dotBuf,ready=false;
const motes=[];for(let i=0;i<180;i++)motes.push(-9+rand()*20,-2.2+rand()*4.6,-4-rand()*5,.012+rand()*.03,rand()*10);
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('qa-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  const ext=!!gl.getExtension('OES_standard_derivatives');CD=program(VS_CARD,FS_CARD(ext));LN=program(VS_LINE,FS_LINE);DT=program(VS_DOTS,FS_POINTS);BG=program(VS_BG,FS_BG);
  quadBuf=kit.buffer(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]));fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));dotBuf=kit.buffer(new Float32Array(motes));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* Card state: position, yaw, opacity, emphasis, reveal; camera follows the current step. */
const cards=Array.from({length:6},(_,i)=>({x:HOME[i],y:0,z:0,yaw:.24,alpha:0,hi:0,reveal:0,seal:0}));
const S={camX:STATION(0)+1.1,day:0};
let current=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,panelTl=null,layout={shift:[.32,.04],fov:.5,flat:false},placed='';
function target(step){
 return cards.map((c,i)=>{
  const mine=STEP_CARDS[step].includes(i),before=i<4;
  // Finished cards are filed into a pile behind the current pair, clear of the copy column.
  if(step===1&&i<2)return{x:HOME[2]-.3-.26*(1-i),y:.09*(2-i),z:-.3*(2-i),yaw:.24,alpha:.55,hi:0,reveal:0,seal:0};
  if(step<2){const visible=i<2||(step===1&&i<4);return{x:HOME[i],y:0,z:0,yaw:.24,alpha:visible?1:0,hi:mine?1:0,reveal:visible?1:0,seal:0};}
  if(before)return{x:HOME[4]-.12*(4-i),y:.05*(4-i),z:-.16*(4-i),yaw:.24,alpha:.55,hi:0,reveal:0,seal:0};
  return{x:HOME[i],y:0,z:i===4?.06:0,yaw:.24,alpha:1,hi:1,reveal:1,seal:i===4?1:0};});}
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),flat=innerWidth<=900||!ready;slide.classList.toggle('qa-flat',flat);
 layout=flat?{shift:[0,.06],fov:aspect<1?.95:.62,flat}:{shift:[aspect<1.45?.42:.38,-.02],fov:aspect<1.45?.62:aspect>1.7?.54:.5,flat};return aspect;}
function camera(aspect){const tx=S.camX;return{proj:M.perspective(layout.fov,aspect,.1,80),view:M.lookAt([tx+2.4,.9,13.2],[tx,-.15,0],[0,1,0])};}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight];}
function render(){if(!ready)return;const aspect=measure();if(layout.flat)return;frames++;
 const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);const{proj,view}=camera(aspect),vp=M.mul(proj,view),px=(H/2)/Math.tan(layout.fov/2);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,.64,.56);gl.uniform2f(BG.u.uVig,.6,.5);gl.uniform1f(BG.u.uGlowA,.85);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 gl.useProgram(DT.p);attribs(DT,dotBuf,[['aP',3,0],['aS',2,3]],5);gl.uniformMatrix4fv(DT.u.uProj,false,proj);gl.uniformMatrix4fv(DT.u.uView,false,view);gl.uniform2f(DT.u.uShift,...layout.shift);gl.uniform1f(DT.u.uPx,px);gl.uniform1f(DT.u.uTime,time);gl.drawArrays(gl.POINTS,0,motes.length/5);
 // The examination-day line, behind the cards.
 gl.useProgram(LN.p);attribs(LN,quadBuf,[['aQ',2,0]],2);gl.uniformMatrix4fv(LN.u.uProj,false,proj);gl.uniformMatrix4fv(LN.u.uView,false,view);gl.uniform2f(LN.u.uShift,...layout.shift);gl.uniform1f(LN.u.uX,DAY);gl.uniform1f(LN.u.uAlpha,S.day);gl.uniform1f(LN.u.uTime,time);gl.drawArrays(gl.TRIANGLES,0,6);
 // Cards back to front.
 gl.useProgram(CD.p);attribs(CD,quadBuf,[['aQ',2,0]],2);const u=CD.u;gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniform2f(u.uShift,...layout.shift);gl.uniform1f(u.uTime,time);
 const order=cards.map((c,i)=>i).sort((a,b)=>cards[a].z-cards[b].z);
 for(const i of order){const c=cards[i];if(c.alpha<.005)continue;const sway=motion?Math.sin(time*.6+i)*.025:0,bob=motion?Math.sin(time*.8+i*1.3)*.03:0;
  gl.uniformMatrix4fv(u.uModel,false,M.mul(M.translate(c.x,c.y+bob,c.z),M.ry(c.yaw+sway)));gl.uniform1f(u.uKind,i);gl.uniform1f(u.uAlpha,c.alpha);gl.uniform1f(u.uHi,c.hi);gl.uniform1f(u.uReveal,c.reveal);gl.uniform1f(u.uSeal,c.seal);gl.drawArrays(gl.TRIANGLES,0,6);}
 place(vp);}
/* Card captions and the examination-day tag follow the scene; written only when they move. */
function place(vp){const key=[S.camX,S.day,...cards.map(c=>c.x+c.alpha),canvas.clientWidth,canvas.clientHeight].map(v=>v.toFixed(3)).join();if(key===placed)return;placed=key;
 labels.forEach((l,i)=>{const c=cards[i],[x,y]=project(vp,[c.x,-CH-.22,c.z]);const show=i<4?(c.alpha>.5&&c.hi>.5?1:0):c.alpha;l.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0)`;l.style.opacity=String(show);});
 const[dx,dy]=project(vp,[DAY,1.9,-.4]);dayTag.style.transform=`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) translate(-50%,-100%)`;dayTag.style.opacity=String(S.day);}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Foundations. */
function write(i){const f=FOUNDATIONS[i];panel.count.textContent=pad(i+1);panel.name.textContent=f.name;panel.title.textContent=f.title;panel.text.textContent=f.text;panel.source.textContent=f.source;
 tabs.forEach((t,k)=>t.setAttribute('aria-pressed',String(k===i)));stations.forEach((s,k)=>{s.classList.toggle('is-current',Math.floor(k/2)===i);s.classList.toggle('is-done',Math.floor(k/2)<i);});slide.dataset.step=String(i+1);}
function go(i,animate=motion){i=Math.max(0,Math.min(2,i));if(i===current&&!tl)return;const previous=current;current=i;const t=target(i);
 if(!g||!animate||!ready){cards.forEach((c,k)=>Object.assign(c,t[k]));S.camX=i===2?STATION(4)+1.1:STATION(i*2)+1.1;S.day=i===0?0:1;write(i);render();return;}
 tl?.kill();tl=g.timeline();
 tl.to(S,{camX:i===2?STATION(4)+1.1:STATION(i*2)+1.1,duration:1.5,ease:'power3.inOut'},0).to(S,{day:i===0?0:1,duration:.8},.2);
 cards.forEach((c,k)=>{const d=t[k],gather=i===2&&k<4,delay=gather?.1+(3-k)*.09:STEP_CARDS[i].includes(k)?.45:0;
  tl.to(c,{x:d.x,y:d.y,z:d.z,yaw:d.yaw,alpha:d.alpha,hi:d.hi,...(d.reveal<c.reveal?{reveal:d.reveal}:{}),duration:gather?1.4:.9,ease:'power3.inOut'},delay);
  if(d.reveal>c.reveal)tl.fromTo(c,{reveal:0},{reveal:1,duration:1.1,ease:'power2.out'},delay+.3);
  tl.to(c,{seal:d.seal,duration:.7,ease:'back.out(1.6)'},d.seal?1.5:0);});
 const parts=[panel.name,panel.title,panel.text,panel.source],dir=i>previous?1:-1;panelTl?.progress(1);
 panelTl=g.timeline().to(parts,{opacity:0,y:-8*dir,duration:.2,ease:'power2.in',stagger:.02}).add(()=>write(i)).fromTo(parts,{opacity:0,y:12*dir},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.05});}
tabs.forEach((t,i)=>t.addEventListener('click',()=>go(i)));
stations.forEach((s,k)=>s.addEventListener('click',()=>go(Math.floor(k/2))));

function intro(){tl?.kill();cards.forEach(c=>Object.assign(c,{alpha:0,reveal:0,hi:0,seal:0}));S.camX=STATION(0)+1.1;S.day=0;current=0;write(0);const t=target(0);tl=g.timeline();
 [0,1].forEach((k,j)=>{cards[k].y=-.6;tl.to(cards[k],{y:0,alpha:1,hi:1,duration:1.1,ease:'power3.out'},.5+j*.18).to(cards[k],{reveal:1,duration:1.2,ease:'power2.out'},.85+j*.18);});}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.qa-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.qa-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.qa-tabs,.qa-detail'),{opacity:0,y:14},{opacity:1,y:0,duration:.9,stagger:.1},full?.6:.2)
  .fromTo(q('.qa-rail'),{opacity:0,y:12},{opacity:1,y:0,duration:.9},full?.9:.3)
  .fromTo(q('.qa-foot'),{opacity:0},{opacity:1,duration:.8},full?1.3:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.qa-kicker,.qa-line>span,.qa-tabs,.qa-detail,.qa-rail,.qa-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}const t=target(current);cards.forEach((c,k)=>Object.assign(c,t[k]));S.camX=current===2?STATION(4)+1.1:STATION(current*2)+1.1;S.day=current===0?0:1;placed='';}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{placed='';if(active&&!raf)render();}).observe(canvas);

window.ELMY_ASSESSMENT={
 id:'assessment',keys:['ArrowDown','ArrowUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}placed='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(current+(k==='ArrowDown'?1:-1));},
 go,
 debug:{S,cards,render,get state(){return{current,ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_ASSESSMENT);
init();finish();write(0);
})();

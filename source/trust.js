/* Slide 11: Innovation must earn institutional trust. The seven-stage journey runs as a loop around the
   Civil Service Board seal, inside a six-part governance frame. Each foundation lights its part of the
   frame and shows where it applies: spokes of authority, a protective sheath, an assisted path, double
   checks, a backup route and connections to existing systems. Geometry is drawn in 2D shaders in CSS
   pixels, so the HTML labels sit exactly on it. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="safeguards"]');if(!slide||!window.ELMY_LIGHT)return;
const g=window.gsap;
const DATA=JSON.parse($('.tr-data',slide).textContent),ITEMS=DATA.items,STAGES=DATA.stages,LAST=ITEMS.length+1;
const canvas=$('.tr-canvas',slide),copy=$('.tr-copy',slide),list=$$('.tr-f',slide),openBtn=$('.tr-open',slide),matrix=$('.tr-matrix',slide),closeBtn=$('.tr-close',slide);
const el={chip:$('.tr-chip',slide),seal:$('.tr-seal',slide),nodes:$$('.tr-node',slide),badges:$$('.tr-badge',slide),where:$('.tr-where',slide),whereLabel:$('.tr-where small',slide),chips:$('.tr-chips',slide)};
const panel={title:$('.tr-detail h3',slide),text:$('.tr-text',slide),step:$('.tr-step',slide)};
const INTRO={title:panel.title.textContent,text:panel.text.textContent};
const pad=n=>String(n).padStart(2,'0'),mix=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>t*t*(3-2*t),TAU=Math.PI*2;
// The journey stages each foundation touches (0-based), matching the chips in the copy.
const HL=[[1,2,4,5],[0,1,2,3,4,5,6],[0,1,3,5],[2,3,4,5],[3,4],[0,5,6]];

/* Colours (straight RGBA). */
const BGN=[.043,.071,.157,1],SEAL=[.075,.106,.29,1],LAV=[.765,.776,1,1],LIME=[.8,.937,.678,1],NODE=[.06,.09,.22,1];

/* Shaders. Positions arrive in CSS pixels (y down). */
// Batched primitives: 0 rounded rect (x,y,w,h; radius, stroke), 1 soft shadow (x,y,w,h; radius, blur),
// 2 capsule (x0,y0,x1,y1; half width, dash period), 3 circle (cx,cy,r,ring width; a ring of 2r is a disc).
const VS_PRIM=`precision highp float;attribute vec2 aQ;attribute vec4 aG,aP,aC;uniform vec2 uRes;varying vec2 vX;varying vec4 vG,vP,vC;
void main(){float t=aP.x,pad=2.+(t>.5&&t<1.5?aP.z*2.:0.);vec2 lo,hi;
 if(t<1.5){lo=aG.xy;hi=aG.xy+aG.zw;}else if(t<2.5){lo=min(aG.xy,aG.zw)-aP.y;hi=max(aG.xy,aG.zw)+aP.y;}else{lo=aG.xy-aG.z;hi=aG.xy+aG.z;}
 vec2 s=mix(lo-pad,hi+pad,aQ*.5+.5);vX=s;vG=aG;vP=aP;vC=aC;gl_Position=vec4(s.x/uRes.x*2.-1.,1.-s.y/uRes.y*2.,0.,1.);}`;
const FS_PRIM=`precision highp float;varying vec2 vX;varying vec4 vG,vP,vC;uniform float uAA;
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
void main(){float t=vP.x,a;
 if(t<.5){vec2 h=vG.zw*.5;float d=box(vX-vG.xy-h,h,min(vP.y,min(h.x,h.y)));if(vP.z>0.)d=abs(d+vP.z*.5)-vP.z*.5;a=1.-smoothstep(-uAA,uAA,d);}
 else if(t<1.5){vec2 h=vG.zw*.5;float d=box(vX-vG.xy-h,h,min(vP.y,min(h.x,h.y)));a=1.-smoothstep(-vP.z*.3,vP.z,d);a*=a;}
 else if(t<2.5){vec2 pa=vX-vG.xy,ba=vG.zw-vG.xy;float hh=clamp(dot(pa,ba)/max(dot(ba,ba),1e-4),0.,1.),d=length(pa-ba*hh)-vP.y;a=1.-smoothstep(-uAA,uAA,d);
  if(vP.z>0.)a*=1.-smoothstep(.45,.55,fract(length(ba)*hh/vP.z));}
 else{float r=length(vX-vG.xy),w=min(vG.w,vG.z*2.),d=abs(r-(vG.z-w*.5))-w*.5;a=1.-smoothstep(-uAA,uAA,d);}
 a*=vC.a;if(a<.002)discard;gl_FragColor=vec4(vC.rgb*a,a);}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS_BG=`precision mediump float;uniform vec2 uRes,uC;uniform float uDpr,uR,uLift;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 f=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;float d=length(f-uC)/max(uR,1.);
 vec3 col=mix(vec3(.043,.071,.157),vec3(.08,.115,.31),exp(-d*d*1.1)*(.55+.25*uLift));
 vec2 gp=mod(f-uC+11.,22.)-11.;col+=vec3(.765,.776,1.)*(1.-smoothstep(.5,1.3,length(gp)))*.045*smoothstep(1.6,.9,d);
 col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

let gl=null,program,attribs,PR,BG,fullBuf,primBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('tr-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  PR=program(VS_PRIM,FS_PRIM);BG=program(VS_BG,FS_BG);fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));primBuf=gl.createBuffer();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* The primitive batch, rebuilt each frame on the CPU. */
const MAXP=2200,STRIDE=14,batch=new Float32Array(MAXP*6*STRIDE),CORNERS=[[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]];let np=0;
function prim(t,a,b,c,d,p1,p2,col,alpha){const A=col[3]*alpha;if(np>=MAXP||A<=.003)return;let o=np*6*STRIDE;
 for(const q of CORNERS){batch.set([q[0],q[1],a,b,c,d,t,p1,p2,0,col[0],col[1],col[2],A],o);o+=STRIDE;}np++;}
const rect=(x,y,w,h,r,col,a,stroke=0)=>{if(w>.05&&h>.05)prim(0,x,y,w,h,r,stroke,col,a);};
const glow=(x,y,r,col,a)=>prim(1,x-r,y-r,2*r,2*r,r,r*.6,col,a);
const seg=(x0,y0,x1,y1,hw,col,a,dash=0)=>prim(2,x0,y0,x1,y1,hw,dash,col,a);
const disc=(x,y,r,ring,col,a)=>{if(r>.05)prim(3,x,y,r,ring,0,0,col,a);};
const mixc=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t),1];
// An arc of radius R from angle a0 to a1, drawn as short capsules, optionally dashed.
function arc(l,R,a0,a1,hw,col,a,dash=0,n=0){n=n||Math.max(6,Math.ceil(Math.abs(a1-a0)*R/9));for(let s=0;s<n;s++){const u0=mix(a0,a1,s/n),u1=mix(a0,a1,(s+1)/n);
 seg(l.cx+Math.cos(u0)*R,l.cy+Math.sin(u0)*R,l.cx+Math.cos(u1)*R,l.cy+Math.sin(u1)*R,hw,col,a,dash);}}
const at=(l,R,u)=>[l.cx+Math.cos(u)*R,l.cy+Math.sin(u)*R];

/* Layout in CSS pixels: a box to the right of the copy (below it on phones). */
let L=null,layoutKey='';
function layout(){const W=canvas.clientWidth,H=canvas.clientHeight,phone=innerWidth<=900;
 const cr=phone?0:Math.round(copy.getBoundingClientRect().right-canvas.getBoundingClientRect().left),key=[W,H,phone,cr].join();if(key===layoutKey&&L)return L;layoutKey=key;
 let box;
 if(phone)box={x:14,y:8,w:W-28,h:H-16};
 else{const x0=Math.max(W*(W/H<1.45?.5:.47),cr+48),x1=W-Math.max(W*.055,40),y0=Math.max(104,H*.125),y1=H-Math.max(120,H*.15);box={x:x0,y:y0,w:x1-x0,h:y1-y0};}
 const narrow=box.w<480;slide.classList.toggle('tr-narrow',narrow);el.where.style.maxWidth=Math.floor(box.w)+'px';
 const topBand=40,bottomBand=phone?120:narrow?96:84,cx=box.x+box.w/2,cy=box.y+topBand+(box.h-topBand-bottomBand)/2;
 const Ro=Math.max(60,Math.min(box.w/2-22,(box.h-topBand-bottomBand)/2-20)),Rj=Ro*.6,Rs=Ro*.27,rn=clamp(Ro*.052,10,15),rb=clamp(Ro*.06,11,16);
 L={W,H,box,narrow,phone,cx,cy,Ro,Rj,Rs,rn,rb,capY:box.y+box.h-bottomBand+14};placed='';return L;}
const nodeA=k=>-Math.PI/2+k*TAU/7,segA=k=>-Math.PI/2+k*TAU/6;

/* Scene state, tweened by GSAP: the build, one strength per foundation, and the finale. */
const S={build:0,a1:0,a2:0,a3:0,a4:0,a5:0,a6:0,fin:0};
const TARGET=Array.from({length:LAST+1},(_,i)=>{const o={build:1,a1:0,a2:0,a3:0,a4:0,a5:0,a6:0,fin:i===LAST?1:0};if(i>=1&&i<=6)o['a'+i]=1;if(i===LAST)o.a1=.35;return o;});
const KEYS=Object.keys(S),A=k=>S['a'+(k+1)];
let current=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,panelTl=null,placed='';
const nodeLit=k=>{let v=0;HL.forEach((h,f)=>{if(h.includes(k))v=Math.max(v,A(f));});return v;};
const segLit=k=>Math.max(A(k),S.fin);

function draw(l){np=0;const B=S.build,{cx,cy,Ro,Rj,Rs,rn,rb}=l;
 // The frame: a fine tick scale, then six parts that light with their foundation.
 for(let i=0;i<120;i++){const u=i/120*TAU-Math.PI/2,v=ease(clamp(B*1.5-.3-i/240));if(v<.01)continue;const[x0,y0]=at(l,Ro+11,u),[x1,y1]=at(l,Ro+(i%5?15:19),u);seg(x0,y0,x1,y1,.55,LAV,.16*v);}
 for(let k=0;k<6;k++){const m=segA(k),hs=Math.PI/6-.055,v=ease(clamp(B*1.6-.45-k*.07)),lit=segLit(k);if(v<.01)continue;
  const a0=m-hs*v,a1=m+hs*v;if(lit>.01)arc(l,Ro,a0,a1,12,LIME,.09*lit);arc(l,Ro,a0,a1,4.2,mixc(LAV,LIME,lit),mix(.34,1,lit));}
 if(S.fin>.01&&motion){const u=-Math.PI/2+(time*.09%1)*TAU,[x,y]=at(l,Ro,u);glow(x,y,16,LIME,.35*S.fin);disc(x,y,3.4,6.8,[1,1,1,1],.9*S.fin);}
 // Authority: spokes from the Board to every stage; lime where the Board decides.
 const a1=A(0);if(a1>.01)for(let k=0;k<7;k++){const f=ease(clamp(a1*1.5-k*.06)),u=nodeA(k),on=HL[0].includes(k),[x0,y0]=at(l,Rs+5,u),[x1,y1]=at(l,mix(Rs+5,Rj-rn-5,f),u);seg(x0,y0,x1,y1,on?1.5:1,on?LIME:LAV,(on?.9:.4)*Math.min(1,a1*1.4));}
 // Data protection: a sheath around the whole journey.
 const a2=A(1);if(a2>.01)for(const R of[Rj-rn-9,Rj+rn+9]){const f=ease(clamp(a2*1.3));arc(l,R,-Math.PI/2,-Math.PI/2+TAU*f,1.5,LIME,.85*Math.min(1,a2*2),0,84);}
 // The journey loop: six joined steps and a dashed return to the next cycle, with direction marks.
 for(let k=0;k<7;k++){const v=ease(clamp(B*1.7-.2-k*.08));if(v<.01)continue;const d=(rn+6)/Rj,u0=nodeA(k)+d,u1=nodeA(k)+TAU/7-d;
  arc(l,Rj,u0,mix(u0,u1,v),1.4,LAV,k===6?.3:.6,k===6?6:0,12);
  if(v>.95&&k<6){const um=(u0+u1)/2,[x,y]=at(l,Rj,um),tx=-Math.sin(um),ty=Math.cos(um);for(const sg of[1,-1]){const ca=Math.cos(2.5*sg),sa=Math.sin(2.5*sg);seg(x,y,x+(tx*ca-ty*sa)*6,y+(tx*sa+ty*ca)*6,1.2,LAV,.7);}}}
 // Fairness: an assisted path alongside the first four stages.
 const a3=A(2);if(a3>.01){const R=Rj-rn-17,f=ease(clamp(a3*1.3)),u0=nodeA(0),u1=nodeA(3);arc(l,R,u0,mix(u0,u1,f),1.7,LIME,.95*Math.min(1,a3*2),7);
  for(const u of[u0,u1]){const[x0,y0]=at(l,Rj-rn-3,u),[x1,y1]=at(l,R,u);seg(x0,y0,x1,y1,1.4,LIME,.9*a3);}
  if(motion){const u=mix(u0,u1,(time*.18)%1),[x,y]=at(l,R,u);glow(x,y,10,LIME,.4*a3);disc(x,y,3,6,LIME,a3);}}
 // Integrity: recorded approvals trace back to the Board.
 const a4=A(3);if(a4>.01)for(const k of HL[3]){const u=nodeA(k),[x0,y0]=at(l,Rj-rn-7,u),[x1,y1]=at(l,Rs+6,u);seg(x0,y0,mix(x0,x1,ease(clamp(a4*1.4))),mix(y0,y1,ease(clamp(a4*1.4))),1.4,LIME,.9*a4,7);}
 // Continuity: a backup route around exam day.
 const a5=A(4);if(a5>.01){const u=nodeA(3),R=Rj+rn+20,f=ease(clamp(a5*1.3)),u0=u-.36,u1=u+.36;arc(l,R,u0,mix(u0,u1,f),1.7,LIME,.95*Math.min(1,a5*2),7);
  for(const v of[u0,u1]){const[x0,y0]=at(l,Rj+3,v),[x1,y1]=at(l,R,v);seg(x0,y0,x1,y1,1.4,LIME,.9*a5);}
  if(motion){const v=mix(u0,u1,(time*.35)%1),[x,y]=at(l,R,v);glow(x,y,10,LIME,.4*a5);disc(x,y,3,6,LIME,a5);}}
 // Integration: connections from the journey out through the frame to existing systems.
 const a6=A(5);if(a6>.01)for(const k of HL[5]){const u=nodeA(k),f=ease(clamp(a6*1.4-.1)),[x0,y0]=at(l,Rj+rn+4,u),[x1,y1]=at(l,mix(Rj+rn+4,Ro+30,f),u);seg(x0,y0,x1,y1,1.4,LIME,.9*a6);
  if(f>.9){const[px,py]=at(l,Ro+38,u);rect(px-8,py-8,16,16,3,LIME,a6,1.6);rect(px-3,py-3,6,6,1,LIME,a6);}}
 // Stages: lime where the current foundation applies; integrity adds a second ring (two-person checks).
 for(let k=0;k<7;k++){const v=ease(clamp(B*1.8-.3-k*.07));if(v<.01)continue;const[x,y]=at(l,Rj,nodeA(k)),lit=nodeLit(k),r=rn*mix(.4,1,v);
  disc(x,y,r+4,2*r+8,BGN,v);disc(x,y,r,2*r,mixc(NODE,LIME,lit),v);disc(x,y,r,1.5,mixc(LAV,LIME,lit),v*mix(.75,1,lit));
  if(a4>.01&&HL[3].includes(k))disc(x,y,r+6,1.4,LIME,a4);}
 // Badges on the frame, one per foundation.
 for(let k=0;k<6;k++){const v=ease(clamp(B*1.6-.6-k*.07));if(v<.01)continue;const[x,y]=at(l,Ro,segA(k)),lit=segLit(k);
  disc(x,y,rb+4,2*rb+8,BGN,v);disc(x,y,rb,2*rb,mixc(SEAL,LIME,lit),v);disc(x,y,rb,1.5,mixc(LAV,LIME,lit),v*.8);}
 // The Board at the centre.
 const sv=ease(clamp(B*1.6-.1)),sl=Math.max(a1,S.fin);if(sv>.01){glow(cx,cy,Rs*1.9,LIME,.14*sl*sv);glow(cx,cy,Rs*1.5,LAV,.07*sv);
  disc(cx,cy,Rs*mix(.6,1,sv),2*Rs,SEAL,sv);disc(cx,cy,Rs*mix(.6,1,sv),1.8,mixc(LAV,LIME,sl),sv*mix(.6,1,sl));disc(cx,cy,Rs-7,.8,LAV,.25*sv);}}

function render(){if(!ready)return;window.ELMY_LIGHT.fit(canvas);const l=layout();frames++;
 const W=canvas.width,H=canvas.height,dpr=W/Math.max(1,l.W);gl.viewport(0,0,W,H);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,l.W,l.H);gl.uniform2f(BG.u.uC,l.cx,l.cy);gl.uniform1f(BG.u.uR,l.Ro);gl.uniform1f(BG.u.uDpr,dpr);gl.uniform1f(BG.u.uLift,S.fin);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);draw(l);
 if(np){gl.useProgram(PR.p);gl.bindBuffer(gl.ARRAY_BUFFER,primBuf);gl.bufferData(gl.ARRAY_BUFFER,batch.subarray(0,np*6*STRIDE),gl.DYNAMIC_DRAW);
  attribs(PR,primBuf,[['aQ',2,0],['aG',4,2],['aP',4,6],['aC',4,10]],STRIDE);gl.uniform2f(PR.u.uRes,l.W,l.H);gl.uniform1f(PR.u.uAA,.75/dpr);gl.drawArrays(gl.TRIANGLES,0,np*6);}
 place();}

/* Labels follow the drawing; styles are written only when something moved. */
const css=(e,x,y,tx,ty,op,sc=1)=>{e.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${tx}%,${ty}%)${sc!==1?` scale(${sc.toFixed(3)})`:''}`;if(op!==null)e.style.opacity=String(+clamp(op).toFixed(3));};
function place(){const l=layout(),key=[...KEYS.map(k=>S[k]),l.W,l.H].map(x=>x.toFixed(3)).join();if(key===placed)return;placed=key;
 const b=l.box,B=S.build;
 css(el.chip,b.x,b.y,0,0,null);if(!l.phone)css(openBtn,b.x+b.w,b.y-3,-100,0,null);
 el.seal.style.setProperty('--rs',l.Rs.toFixed(1)+'px');css(el.seal,l.cx,l.cy,-50,-50,ease(clamp(B*1.6-.3)));
 el.nodes.forEach((e,k)=>{const[x,y]=at(l,l.Rj,nodeA(k));css(e,x,y,-50,-50,ease(clamp(B*1.8-.4-k*.07)));e.classList.toggle('is-lit',nodeLit(k)>.5);});
 el.badges.forEach((e,k)=>{const[x,y]=at(l,l.Ro,segA(k));css(e,x,y,-50,-50,ease(clamp(B*1.6-.7-k*.07)));e.classList.toggle('is-lit',segLit(k)>.5);});
 css(el.where,l.cx,l.capY,-50,0,null);
 if(matrix&&!matrix.hidden&&!l.phone)Object.assign(matrix.style,{left:b.x+'px',top:(b.y+40)+'px',width:b.w+'px',maxHeight:(b.h-40)+'px'});}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps: the overview, six foundations, then the closing statement. */
function caption(i){const f=i>=1&&i<=LAST-1?ITEMS[i-1]:null;
 const label=f?`${pad(i)} · ${f.name} · ${f.where}`:i===0?'The recruitment journey · seven stages':'All six foundations · around every stage';
 const chips=f?f.chips:i===0?STAGES.map((s,k)=>`${pad(k+1)} ${s}`):[];
 el.whereLabel.textContent=label;el.chips.replaceChildren(...chips.map(c=>{const s=document.createElement('span');s.textContent=c;return s;}));}
function write(i){const f=i>=1&&i<=LAST-1?ITEMS[i-1]:null;panel.title.textContent=f?f.head:INTRO.title;panel.text.textContent=f?f.text:INTRO.text;
 panel.step.textContent=pad(Math.min(i,6))+' / 06';
 list.forEach((b,k)=>{b.setAttribute('aria-pressed',String(k===i-1));b.classList.toggle('is-done',i===LAST);});
 slide.dataset.view=i===LAST?'final':i===0?'intro':'item';caption(i);}
function go(i,animate=motion){i=Math.max(0,Math.min(LAST,i));if(i===current)return;const from=current;current=i;
 if(!g||!animate||!ready){tl?.kill();tl=null;Object.assign(S,TARGET[i]);write(i);placed='';render();return;}
 tl?.kill();tl=g.timeline({onComplete:()=>{tl=null;}}).to(S,{...TARGET[i],build:1,duration:1.2,ease:'power2.inOut'});
 // The caption is positioned by place(), so it only fades.
 const parts=[panel.title,panel.text],d=i>from?1:-1;panelTl?.progress(1);
 panelTl=g.timeline().to(parts,{opacity:0,y:-8*d,duration:.2,ease:'power2.in',stagger:.02}).to(el.where,{opacity:0,duration:.2,ease:'power2.in'},0).add(()=>write(i))
  .fromTo(parts,{opacity:0,y:12*d},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.05}).to(el.where,{opacity:1,duration:.5,ease:'power2.out'},'<');}
list.forEach((b,k)=>b.addEventListener('click',()=>go(k+1)));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||!matrix.hidden||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<900)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

/* The optional responsibility matrix. */
function setMatrix(on){if(!matrix)return;matrix.hidden=!on;openBtn.setAttribute('aria-expanded',String(on));slide.classList.toggle('tr-mopen',on);
 if(on){placed='';render();closeBtn.focus({preventScroll:true});}else if(matrix.contains(document.activeElement))openBtn.focus({preventScroll:true});}
openBtn.addEventListener('click',()=>setMatrix(matrix.hidden));closeBtn.addEventListener('click',()=>setMatrix(false));

function intro(){tl?.kill();Object.assign(S,TARGET[0],{build:0});current=0;write(0);
 tl=g.timeline({onComplete:()=>{tl=null;}}).to(S,{build:1,duration:2.4,ease:'power2.out'},.35);}
const TEXT='.tr-kicker,.tr-line>span,.tr-subtitle,.tr-list li,.tr-detail,.tr-final,.tr-hint,.tr-foot,.tr-open';
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.tr-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.tr-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.tr-subtitle,.tr-list li'),{opacity:0,y:12},{opacity:1,y:0,duration:.8,stagger:.05},full?.55:.15)
  .fromTo(q('.tr-detail,.tr-final,.tr-hint'),{opacity:0,y:12},{opacity:1,y:0,duration:.8,stagger:.08},full?.95:.25)
  .fromTo(q('.tr-foot,.tr-open'),{opacity:0},{opacity:1,duration:.8},full?1.3:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$(TEXT,slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}panelTl?.progress(1);Object.assign(S,TARGET[current]);placed='';}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{layoutKey='';if(active&&!raf)render();}).observe(canvas);
addEventListener('resize',()=>{layoutKey='';});

window.ELMY_TRUST={
 id:'safeguards',keys:['ArrowDown','ArrowUp','PageDown','PageUp','Escape'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();setMatrix(false);textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}layoutKey='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){if(k==='Escape'){setMatrix(false);return;}go(current+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,
 debug:{S,render,layout:()=>layout(),setMatrix,get state(){return{current,ready,frames,prims:np,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_TRUST);
init();finish();write(0);
})();

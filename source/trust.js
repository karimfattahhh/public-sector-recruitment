/* Trust scene: innovation as a gyroscope of six patterned rings tumbling around a core. Each
   safeguard the presenter opens swings its ring into one common plane and lights its notch on a
   vertical key line; with all six in place a pulse climbs the line and the core becomes a seal.
   Rings are screen-width ribbons with procedural patterns (gates, ruler, cipher, twin rails,
   seals, chevrons). Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="safeguards"]');if(!slide||!window.ELMY_LIGHT)return;
const{M,rng,FS_POINTS,VS_BG,FS_BG}=window.ELMY_LIGHT,g=window.gsap,rand=rng(808);
const canvas=$('.tg-canvas',slide),items=$$('.tg-item',slide),buttons=$$('.tg-q',slide),labels=$$('.tg-label',slide),pips=$$('.tg-pips i',slide);
const count=$('.tg-count b',slide),reset=$('.tg-reset',slide);
const pad=n=>String(n).padStart(2,'0'),clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

/* World: rings 0–5 from the core outward, in a plane tilted back and turned toward the copy. */
const RAD=k=>.7+.2*k,EYE=[0,.25,10],SEG=360,HALF=11;
const TILT=M.mul(M.ry(.32),M.rx(-.42));
const ringData=new Float32Array(SEG*12);for(let i=0;i<SEG;i++){const a=i/SEG,b=(i+1)/SEG;ringData.set([a,-1,a,1,b,-1,b,-1,a,1,b,1],i*12);}
const VS_RING=`precision highp float;attribute vec2 aR;
uniform mat4 uProj,uView,uModel;uniform vec2 uShift;uniform vec3 uEye;uniform float uRad,uHalf,uFocal;
varying float vU,vV,vDepth;
void main(){float th=1.5707963-6.2831853*aR.x;vec3 lp=vec3(cos(th),sin(th),0.)*uRad,lt=vec3(sin(th),-cos(th),0.);
 vec3 wp=(uModel*vec4(lp,1.)).xyz,wt=normalize((uModel*vec4(lt,0.)).xyz),e=normalize(uEye-wp);
 vec3 n=cross(wt,e);float ln=length(n);n=ln>1e-4?n/ln:vec3(0.,1.,0.);
 vec3 p=wp+n*aR.y*uHalf*length(uEye-wp)/uFocal;vec4 c=uProj*uView*vec4(p,1.);c.xy+=uShift*c.w;gl_Position=c;
 vU=aR.x;vV=aR.y;vDepth=dot(normalize(uEye),wp)/uRad;}`;
// Patterns in CSS pixels across (d) and along (uCirc) the ring: 0 gates, 1 ruler, 2 cipher, 3 twin rails, 4 seals, 5 chevrons.
const FS_RING=`precision highp float;varying float vU,vV,vDepth;
uniform float uKind,uLock,uSel,uFlash,uPulse,uAll,uAlpha,uCirc,uHalf;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float band(float d,float w){return 1.-smoothstep(w-.55,w+.55,d);}
void main(){
 float d=abs(vV)*11.,u=vU,lw=mix(.62,1.05,clamp(uLock,0.,1.))+uSel*.25,line=band(d,lw),pat=0.;int k=int(uKind+.5);
 if(k==0){float g=abs(fract(u*6.)-.5)/6.*uCirc;line*=smoothstep(4.,5.,g);pat=(1.-smoothstep(.5,1.2,abs(g-4.6)))*band(d,5.5);}
 else if(k==1){float n=120.,s=fract(u*n),g=min(s,1.-s)/n*uCirc,maj=1.-step(.5,mod(floor(u*n+.5),10.));pat=(1.-smoothstep(.45,1.05,g))*band(d,mix(3.,6.5,maj))*mix(.75,1.,maj);}
 else if(k==2){float n=150.,s=fract(u*n),on=step(.4,hash(vec2(floor(u*n),step(0.,vV))));pat=on*step(.16,s)*step(s,.84)*(1.-smoothstep(.45,1.05,abs(d-3.2)));line*=.4;}
 else if(k==3){float s=fract(u*40.),g=min(s,1.-s)/40.*uCirc;pat=max(1.-smoothstep(.45,1.05,abs(d-3.3)),(1.-smoothstep(.45,1.,g))*band(d,3.3)*.8);line=0.;}
 else if(k==4){line=band(d,lw+.45);float x=(fract(u*4.)-.5)/4.*uCirc,y=vV*11.,dm=abs(x)+abs(y)-5.;pat=max(1.-smoothstep(.45,1.05,abs(dm+.6)),1.-smoothstep(-.6,.6,length(vec2(x,y))-1.6));}
 else{float x=(fract(u*36.)-.5)/36.*uCirc;pat=(1.-smoothstep(.45,1.05,abs(x-d*.75+1.5)))*band(d,5.);line*=.45;}
 float notch=(1.-smoothstep(1.,2.,min(u,1.-u)*uCirc))*band(d,8.),glow=exp(-d*d/34.)*.2;
 float depth=mix(.32,1.,smoothstep(-1.,1.,vDepth)),lock=clamp(uLock,0.,1.);
 float inten=(mix(.42,1.05,lock)+uSel*.4+uFlash*.9+uPulse*1.2)*depth;
 vec3 lav=vec3(.765,.776,1.),lime=vec3(.8,.937,.678),col=mix(lav,lime,clamp(uSel*.85+uPulse+uAll*.35,0.,1.));
 float m=max(line,pat);
 vec3 o=col*(m+glow*(.4+lock))*inten+lime*notch*mix(.5,1.15,lock)*depth+vec3(m*uFlash*.4);
 gl_FragColor=vec4(o*uAlpha,1.);}`;
const VS_DOTS=`precision highp float;attribute vec3 aP;attribute vec4 aC;attribute vec2 aS;uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uPx;varying vec4 vC;varying float vS,vP;
void main(){vec4 c=uProj*uView*vec4(aP,1.);c.xy+=uShift*c.w;gl_Position=c;gl_PointSize=max(1.5,aS.x*uPx/c.w);vC=aC;vS=aS.y;vP=0.;}`;

let gl=null,program,attribs,RG,DT,BG,ringBuf,dotBuf,fullBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('tg-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  RG=program(VS_RING,FS_RING);DT=program(VS_DOTS,FS_POINTS);BG=program(VS_BG,FS_BG);
  ringBuf=kit.buffer(ringData);dotBuf=gl.createBuffer();fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State. Each ring tumbles freely; its lock blends the tumble into the common plane. */
const rings=Array.from({length:6},(_,k)=>({lock:0,sel:0,flash:0,show:0,phase:rand()*6.283,spin:(.16+.05*k)*(k%2?-1:1)}));
const S={wave:0,all:0,core:0};
const motes=Array.from({length:70},()=>{const a=rand()*6.283,r=2.1+rand()*2.6;return[Math.cos(a)*r,(rand()-.5)*4.2,-1.5-rand()*3,.022+rand()*.035,rand()*6.283,.12+rand()*.22];});
const locked=[false,false,false,false,false,false],order=[];
let open=-1,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,introTl=null,textTl=null,placed='',layout={shift:[.36,-.03],fov:.5,phone:false};
const wrap=a=>a-6.2831853*Math.round(a/6.2831853);
function angles(k){const t=time,r=rings[k],L=r.lock,f=1-L;
 return[1.15*Math.sin(t*(.19+.031*k)+k*1.9)*f,1.0*Math.sin(t*(.15+.027*k)+k*2.7+1.3)*f,wrap(r.phase+t*r.spin)*f];}
function model(k){const[a,b,s]=angles(k);return M.mul(TILT,M.mul(M.ry(b),M.mul(M.rx(a),M.rz(s))));}
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),phone=innerWidth<=900;
 layout=phone?{shift:[0,0],fov:.42,phone}:{shift:[aspect<1.45?.4:.36,-.03],fov:aspect<1.45?.6:.5,phone};return aspect;}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight];}
const dots=new Float32Array(200*9);
function render(){if(!ready)return;const aspect=measure();frames++;
 const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const proj=M.perspective(layout.fov,aspect,.1,60),view=M.lookAt(EYE,[0,0,0],[0,1,0]),vp=M.mul(proj,view);
 const focal=(canvas.clientHeight/2)/Math.tan(layout.fov/2),px=(H/2)/Math.tan(layout.fov/2);
 const lockedShare=rings.reduce((s,r)=>s+clamp(r.lock),0)/6,core=project(vp,[0,0,0]);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);
 gl.uniform2f(BG.u.uGlow,core[0]/canvas.clientWidth,1-core[1]/canvas.clientHeight);gl.uniform2f(BG.u.uVig,.6,.5);gl.uniform1f(BG.u.uGlowA,(.55+.3*lockedShare+.35*S.all)*S.core);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 // Rings, additive.
 gl.useProgram(RG.p);attribs(RG,ringBuf,[['aR',2,0]],2);const u=RG.u;
 gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniform2f(u.uShift,...layout.shift);const half=layout.phone?7:HALF;gl.uniform3f(u.uEye,...EYE);gl.uniform1f(u.uHalf,half);gl.uniform1f(u.uFocal,focal);gl.uniform1f(u.uAll,S.all);
 const wave=S.wave*8-1;
 rings.forEach((r,k)=>{if(r.show<.005)return;const rad=RAD(k)*(.55+.45*r.show);
  gl.uniformMatrix4fv(u.uModel,false,model(k));gl.uniform1f(u.uRad,rad);gl.uniform1f(u.uCirc,6.2831853*rad*focal/10*11/half);gl.uniform1f(u.uKind,k);
  gl.uniform1f(u.uLock,r.lock);gl.uniform1f(u.uSel,r.sel);gl.uniform1f(u.uFlash,r.flash);gl.uniform1f(u.uPulse,S.wave>0&&S.wave<1?Math.max(0,1-Math.abs(wave-k)):0);gl.uniform1f(u.uAlpha,r.show);
  gl.drawArrays(gl.TRIANGLES,0,SEG*6);});
 // Core, key line and dust as point sprites, blended over.
 gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 let n=0;const dot=(p,c,a,size,shape)=>{dots.set([p[0],p[1],p[2],c[0],c[1],c[2],a,size,shape],n++*9);};
 const lav=[.765,.776,1],lime=[.8,.937,.678],mixc=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
 motes.forEach(m=>{const t=time*.08+m[4];dot([m[0]+Math.sin(t)*.25,m[1]+Math.cos(t*.7)*.2,m[2]],lav,m[5]*S.core,m[3],0);});
 const cc=mixc(lav,lime,S.all);dot([0,0,0],cc,(.35+.3*lockedShare+.3*S.all)*S.core,1.3,0);dot([0,0,0],cc,.95*S.core,.3+.06*S.all,2);dot([0,0,0],lime,(.25+.6*S.all)*S.core,.56+.1*S.all,1);
 for(let r=.36;r<=RAD(5)+.09;r+=.07){let k=0;while(k<5&&r>RAD(k)+.02)k++;const on=clamp((rings[k].lock-.55)/.45),p=M.apply(TILT,[0,r,0]);
  const pulse=S.wave>0&&S.wave<1?Math.exp(-Math.pow((r/RAD(5)-S.wave*1.1)*7,2)):0;if(on+pulse<.01)continue;
  dot([p[0],p[1],p[2]],lime,Math.min(1,on*.85+pulse),.022+pulse*.03,2);}
 gl.useProgram(DT.p);gl.bindBuffer(gl.ARRAY_BUFFER,dotBuf);gl.bufferData(gl.ARRAY_BUFFER,dots.subarray(0,n*9),gl.DYNAMIC_DRAW);attribs(DT,dotBuf,[['aP',3,0],['aC',4,3],['aS',2,7]],9);
 gl.uniformMatrix4fv(DT.u.uProj,false,proj);gl.uniformMatrix4fv(DT.u.uView,false,view);gl.uniform2f(DT.u.uShift,...layout.shift);gl.uniform1f(DT.u.uPx,px);gl.drawArrays(gl.POINTS,0,n);
 place(vp);}
/* Each locked ring is named beside the key line, between it and the next ring. */
function place(vp){const key=[...rings.map(r=>r.lock*r.show),canvas.clientWidth,canvas.clientHeight].map(v=>v.toFixed(3)).join();if(key===placed)return;placed=key;
 labels.forEach((l,k)=>{const p=M.apply(TILT,[.07,RAD(k)+.1,0]),[x,y]=project(vp,[p[0],p[1],p[2]]);l.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(0,-50%)`;l.style.opacity=String(+(clamp((rings[k].lock-.6)/.4)*rings[k].show).toFixed(3));});}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Safeguards. Opening a question puts its safeguard in place; Up takes the latest one back. */
function update(){const n=locked.filter(Boolean).length;
 items.forEach((li,k)=>{li.classList.toggle('is-open',k===open);li.dataset.locked=String(locked[k]);buttons[k].setAttribute('aria-expanded',String(k===open));});
 pips.forEach((p,k)=>p.classList.toggle('on',k<n));count.textContent=pad(n);reset.hidden=n===0;slide.classList.toggle('tg-all',n===6);slide.dataset.locked=String(n);
 const tween=(r,v,o)=>g&&motion&&ready?g.to(r,{...v,...o}):Object.assign(r,v);
 rings.forEach((r,k)=>tween(r,{sel:k===open?1:0},{duration:.45,ease:'power2.out',overwrite:'auto'}));if(!motion||!g)render();}
function setLock(k,on,delay=0){if(locked[k]===on)return;locked[k]=on;const r=rings[k];if(on)order.push(k);else order.splice(order.indexOf(k),1);
 const all=locked.every(Boolean);
 if(!g||!motion||!ready){r.lock=on?1:0;r.flash=0;S.all=all?1:0;S.wave=0;return;}
 g.killTweensOf(r,'lock,flash');
 if(on){g.to(r,{lock:1,duration:1.25,ease:'back.out(1.35)'});g.fromTo(r,{flash:0},{flash:1,duration:.18,delay:.85,yoyo:true,repeat:1,ease:'power2.out',onComplete:()=>{r.flash=0;}});
  if(all){g.killTweensOf(S,'wave,all');g.fromTo(S,{wave:0},{wave:1,duration:1.5,delay:1.15,ease:'power1.in',onComplete:()=>{S.wave=0;}});g.to(S,{all:1,duration:1,delay:2.2,ease:'power2.out'});}}
 else{g.to(r,{lock:0,duration:1.05,delay,ease:'power2.inOut'});g.killTweensOf(S,'wave,all');S.wave=0;g.to(S,{all:0,duration:.5});}}
function select(k){if(open===k){open=-1;update();return;}open=k;setLock(k,true);update();}
function step(dir){if(dir>0){const k=locked.indexOf(false);if(k>=0)select(k);return;}
 if(!order.length){open=-1;update();return;}const k=order[order.length-1];setLock(k,false);open=order.length?order[order.length-1]:-1;update();}
function resetAll(){[...order].reverse().forEach((k,i)=>setLock(k,false,i*.08));open=-1;update();}
buttons.forEach((b,k)=>b.addEventListener('click',()=>select(k)));
reset.addEventListener('click',resetAll);
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;step(Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){introTl?.kill();rings.forEach(r=>r.show=0);S.core=0;introTl=g.timeline({onComplete:()=>{introTl=null;}}).to(S,{core:1,duration:1.4,ease:'power2.out'},.3);
 rings.forEach((r,k)=>introTl.to(r,{show:1,duration:1.3,ease:'power3.out'},.45+k*.11));}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.tg-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.tg-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.tg-sub'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.55:.15)
  .fromTo(items,{opacity:0,x:-14},{opacity:1,x:0,duration:.75,stagger:.07},full?.7:.2)
  .fromTo(q('.tg-progress,.tg-foot'),{opacity:0},{opacity:1,duration:.8,stagger:.1},full?1.2:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set([...$$('.tg-kicker,.tg-line>span,.tg-sub,.tg-progress,.tg-foot',slide),...items],{clearProps:'opacity,transform'});}
function finish(){if(introTl){introTl.progress(1,true);introTl.kill();introTl=null;}if(g)g.killTweensOf([S,...rings]);
 rings.forEach((r,k)=>Object.assign(r,{show:1,lock:locked[k]?1:0,sel:k===open?1:0,flash:0}));Object.assign(S,{core:1,wave:0,all:locked.every(Boolean)?1:0});placed='';}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{placed='';if(active&&!raf)render();}).observe(canvas);

window.ELMY_TRUST={
 id:'safeguards',keys:['ArrowDown','ArrowUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}placed='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){step(k==='ArrowDown'?1:-1);},
 select,
 debug:{S,rings,locked,render,get state(){return{open,order:[...order],ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_TRUST);
init();finish();update();
})();

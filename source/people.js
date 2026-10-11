/* Slide 5 (Nizar brief): One integrated partner. The ELMY mark assembles at the centre (its four
   strands fly in and lock around the dot) and five capability nodes connect to it. Each opened
   capability lights its link; the finale draws a ring through all five. The mark stays one flat
   colour; only its glow changes. Masks are drawn from the inline brand SVG into textures, so the mark
   is exact. Local WebGL and GSAP only; without WebGL the flat SVG mark stands in. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="people"]');if(!slide||!window.ELMY_LIGHT)return;
const{M,VS_BG,FS_BG,FS_POINTS,rng}=window.ELMY_LIGHT,g=window.gsap,rand=rng(505);
const canvas=$('.pp-canvas',slide),svg=$('.pp-mark',slide),copy=$('.pp-copy',slide),wrap=$('.pp-nodes',slide),nodes=$$('.pp-node',slide),CAPS=JSON.parse($('.pp-data',slide).textContent);
const C={num:$('.pp-cnum',slide),name:$('.pp-cname',slide),sub:$('.pp-csub',slide),brings:$('.pp-cbrings',slide),value:$('.pp-cvalue',slide)},count=$('.pp-count',slide),NC=nodes.length,LAST=NC+1;
const ANG=Array.from({length:NC},(_,k)=>-Math.PI/2+k*Math.PI*2/NC);
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

/* Strands are the mark's four paths, clockwise from the top; each flies in from its own side. */
const DIRS=[[0,1],[1,0],[0,-1],[-1,0]],KNOT=.815,EYE_D=6;
const VS=`precision highp float;attribute vec2 aQ;uniform mat4 uProj,uView,uModel;uniform vec2 uShift;varying vec2 vUv;
void main(){vec2 q=aQ*.66;vUv=vec2(q.x+.5,.5-q.y);vec4 c=uProj*uView*uModel*vec4(q,0.,1.);c.xy+=uShift*c.w;gl_Position=c;}`;
const FS=`precision highp float;varying vec2 vUv;uniform sampler2D uTex;uniform vec4 uCh;uniform float uAlpha,uDim,uGlow,uSheen;
void main(){float m=dot(texture2D(uTex,vUv),uCh);
 vec2 e=min(vUv,1.-vUv);float edge=smoothstep(-.16,.02,min(e.x,e.y));
 float halo=(dot(texture2D(uTex,vUv,3.5),uCh)*.55+dot(texture2D(uTex,vUv,5.),uCh)*.6)*edge;
 float sh=exp(-pow((vUv.x+vUv.y-uSheen*2.8+.4)*6.,2.))*step(.001,uSheen)*step(uSheen,.999);
 vec3 col=mix(vec3(.94,.945,1.),vec3(1.),sh);float a=m*uAlpha*uDim;
 vec3 glow=vec3(.22,.28,.95)*halo*uGlow*uAlpha*(.25+.75*uDim);
 gl_FragColor=vec4(col*a+glow*(1.-a),a);}`;

/* Links: five spokes from the mark to each node and five arcs that close the ring (index 5-9). */
const LK=[];for(let l=0;l<NC*2;l++){for(let k=0;k<=150;k++)LK.push(l,k/150,rand()*100,0);for(let k=0;k<3;k++)LK.push(l,k/3,rand()*100,1);}
const lkData=new Float32Array(LK),lkTotal=lkData.length/4;
const VS_LK=`precision highp float;attribute vec4 aL;uniform vec2 uRes,uC;uniform float uR,uR0,uNode,uDraw[10],uAlpha[10],uOn[10],uTime,uDpr,uA[5];
varying vec4 vC;varying float vS,vP;
void main(){int l=int(aL.x+.5);float t=aL.y,bead=aL.w;if(bead>.5)t=fract(t+uTime*(l<5?.45:.08));vec2 p;
 if(l<5){float a=uA[l],r=mix(uR0,uR-uNode-8.,t);p=uC+vec2(cos(a),sin(a))*r;}
 else{int k=l-5;float gap=(uNode+10.)/uR,a0=uA[k]+gap,a1=uA[k]+6.2832/5.-gap,a=mix(a0,a1,t);p=uC+vec2(cos(a),sin(a))*uR;}
 gl_Position=vec4(p.x/uRes.x*2.-1.,1.-p.y/uRes.y*2.,0.,1.);
 float on=uOn[l],shown=step(t,uDraw[l]*1.02);
 gl_PointSize=(bead>.5?5.5:2.)*uDpr;
 vec3 col=mix(vec3(.765,.776,1.),vec3(.8,.937,.678),on);
 vC=vec4(col,shown*uAlpha[l]*(bead>.5?on*step(.999,uDraw[l]):.38+.5*on));vS=bead>.5?0.:2.;vP=0.;}`;
let gl=null,program,attribs,LY,BG,LP,quadBuf,fullBuf,lkBuf,tex=[],ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('pp-flat');}
function masks(){const N=1024,s=N/1400,make=draw=>{const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,N,N);
  x.setTransform(s,0,0,s,-300*s,-300*s);x.globalCompositeOperation='lighter';draw(x);return c;};
 const paths=$$('path',svg).map(p=>new Path2D(p.getAttribute('d'))),r=$('rect',svg),cx=+r.getAttribute('x')+ +r.getAttribute('width')/2,cy=+r.getAttribute('y')+ +r.getAttribute('height')/2,rad=+r.getAttribute('width')/2;
 return[make(x=>['#f00','#0f0','#00f'].forEach((c,k)=>{x.fillStyle=c;x.fill(paths[k]);})),make(x=>{x.fillStyle='#f00';x.fill(paths[3]);x.fillStyle='#0f0';x.beginPath();x.arc(cx,cy,rad,0,Math.PI*2);x.fill();})];}
function upload(c){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  LY=program(VS,FS);BG=program(VS_BG,FS_BG);LP=program(VS_LK,FS_POINTS);quadBuf=kit.buffer(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]));fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));lkBuf=kit.buffer(lkData);
  tex=masks().map(upload);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State: each strand's arrival and emphasis, the dot, a glow flash and one sheen pass. */
const S={inn:[0,0,0,0],dim:[1,1,1,1],dot:0,flash:0,sheen:0,glow:1,node:Array(NC).fill(1),draw:Array(NC*2).fill(0),alpha:Array(NC*2).fill(1),on:Array(NC*2).fill(0)};
let step=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,view={c:[0,0],px:400,fov:.5},ring={c:[0,0],R:200,r0:60,node:28};
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),W=canvas.clientWidth,H=canvas.clientHeight,phone=innerWidth<=900;
 const nodeR=(nodes[0]?.querySelector('.pp-ring').getBoundingClientRect().width||56)/2;let cx,cy,R;
 if(phone){cx=W/2;cy=H/2;R=Math.min(W,H)*.36;}
 else{const left=copy.getBoundingClientRect().right-canvas.getBoundingClientRect().left+60,right=W*.95,top=Math.max(96,H*.12),bottom=H-Math.max(110,H*.13);
  cx=(left+right)/2;cy=(top+bottom)/2-10;R=Math.min((right-left)*.36,(bottom-top)*.36);}
 const size=R*.78;ring={c:[cx,cy],R,r0:size*.6,node:nodeR};view={c:[cx,cy],px:size/KNOT,fov:.5};return aspect;}
function render(){if(!ready){measure();S.node.fill(1);place();slide.style.setProperty('--mx',ring.c[0]+'px');slide.style.setProperty('--my',ring.c[1]+'px');slide.style.setProperty('--ms',ring.R*.78+'px');return;}const aspect=measure();frames++;const W=canvas.width,H=canvas.height,ch=canvas.clientHeight,cw=canvas.clientWidth;gl.viewport(0,0,W,H);
 const proj=M.perspective(view.fov,aspect,.1,40),camera=M.lookAt([0,0,EYE_D],[0,0,0],[0,1,0]),Q=view.px*EYE_D*Math.tan(view.fov/2)/(ch/2);
 const shift=[(view.c[0]/cw)*2-1,1-(view.c[1]/ch)*2];
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,view.c[0]/cw,1-view.c[1]/ch);gl.uniform2f(BG.u.uVig,.5,.5);gl.uniform1f(BG.u.uGlowA,(innerWidth<=900?.22:.7)+.3*S.dot*(innerWidth<=900?.3:1));gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(LY.p);attribs(LY,quadBuf,[['aQ',2,0]],2);const u=LY.u;
 gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,camera);gl.uniform2f(u.uShift,...shift);gl.uniform1i(u.uTex,0);gl.activeTexture(gl.TEXTURE0);gl.uniform1f(u.uSheen,S.sheen);
 const tilt=motion?M.mul(M.rx(.07*Math.sin(time*.31)),M.ry(.1*Math.sin(time*.23))):M.rx(0);
 const layer=(k,t,ch4,alpha,dim,glow,model)=>{gl.bindTexture(gl.TEXTURE_2D,tex[t]);gl.uniform4f(u.uCh,...ch4);gl.uniform1f(u.uAlpha,alpha);gl.uniform1f(u.uDim,dim);gl.uniform1f(u.uGlow,glow);gl.uniformMatrix4fv(u.uModel,false,model);gl.drawArrays(gl.TRIANGLES,0,6);};
 const CH=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[1,0,0,0]];
 for(let k=0;k<4;k++){const e=S.inn[k],f=1-e,d=DIRS[k];if(e<.002)continue;
  const model=M.mul(tilt,M.mul(M.translate(d[0]*f*.26*Q,d[1]*f*.26*Q,-f*2.6),M.mul(M.rz(f*.42*(k%2?1:-1)),M.scale(Q))));
  layer(k,k<3?0:1,CH[k],clamp(e*e*1.6),S.dim[k],(S.glow+S.flash*1.5)*(.55+.45*S.dim[k]),model);}
 if(S.dot>.002)layer(4,1,[0,1,0,0],clamp(S.dot*2),1,S.glow+S.flash*2.2,M.mul(tilt,M.mul(M.translate(0,0,.02),M.scale(Q*Math.max(.001,S.dot)))));
 gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(LP.p);attribs(LP,lkBuf,[['aL',4,0]],4);const v=LP.u;
 gl.uniform2f(v.uRes,cw,ch);gl.uniform2f(v.uC,...ring.c);gl.uniform1f(v.uR,ring.R);gl.uniform1f(v.uR0,ring.r0);gl.uniform1f(v.uNode,ring.node);gl.uniform1fv(v.uA,ANG);
 gl.uniform1fv(v.uDraw,S.draw);gl.uniform1fv(v.uAlpha,S.alpha);gl.uniform1fv(v.uOn,S.on);gl.uniform1f(v.uTime,time);gl.uniform1f(v.uDpr,W/cw);gl.drawArrays(gl.POINTS,0,lkTotal);
 place();}
/* Nodes sit on the ring; their labels hang below. Written only when they change. */
function place(){const cb=canvas.getBoundingClientRect(),wb=wrap.getBoundingClientRect(),ox=cb.left-wb.left,oy=cb.top-wb.top;
 nodes.forEach((b,k)=>{const x=ox+ring.c[0]+Math.cos(ANG[k])*ring.R,y=oy+ring.c[1]+Math.sin(ANG[k])*ring.R,o=S.node[k],key=`${x|0},${y|0},${o.toFixed(2)}`;if(b._k===key)return;b._k=key;
  const top=Math.sin(ANG[k])<-.9;b.classList.toggle('is-top',top);const rEl=b.firstElementChild;
  b.style.transform=`translate(${(x-b.offsetWidth/2).toFixed(1)}px,${(y-rEl.offsetTop-ring.node).toFixed(1)}px)`;b.style.opacity=String(o);b.style.visibility=o>.01?'visible':'hidden';});}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps: 0 the identity, 1-5 one capability each, 6 all five reconnected. */
function targets(n){const cap=n>=1&&n<=NC?n-1:-1,fin=n===LAST;
 return{draw:S.draw.map((_,l)=>l<NC?1:fin?1:0),alpha:S.alpha.map((_,l)=>l<NC?(fin?1:cap<0?.55:l===cap?1:.3):1),on:S.on.map((_,l)=>fin?1:l===cap?1:0)};}
function write(n){const cap=n>=1&&n<=NC?n-1:-1;slide.dataset.view=n===0?'id':n===LAST?'final':'cap';count.textContent=`${Math.min(n,NC)} / ${NC}`;
 nodes.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===cap)));slide.classList.toggle('pp-all',n===LAST);slide.classList.toggle('pp-dim',cap>=0);
 if(cap>=0){const c=CAPS[cap];C.num.textContent=String(cap+1).padStart(2,'0');C.name.textContent=c.name;C.sub.textContent=c.sub;C.brings.textContent=c.brings;C.value.textContent=c.value;}}
function go(n,animate=motion){n=Math.max(0,Math.min(LAST,n));if(n===step&&!tl)return;step=n;write(n);const T=targets(n);
 if(!g||!animate||!ready){Object.assign(S,{draw:T.draw,alpha:T.alpha,on:T.on});render();return;}
 const arr=(a,b,o)=>g.to(a,{...Object.fromEntries(b.map((v,k)=>[k,v])),overwrite:true,...o});
 arr(S.alpha,T.alpha,{duration:.6,ease:'power2.out'});arr(S.on,T.on,{duration:.6,ease:'power2.out'});arr(S.draw,T.draw,{duration:n===LAST?1.6:.5,ease:'power2.inOut',stagger:0});
 g.fromTo(S,{flash:.6},{flash:0,duration:1.1,ease:'power2.out',overwrite:'auto'});
 if(n>=1&&n<=NC)g.fromTo($$('.pp-cname,.pp-csub,.pp-cline',slide),{opacity:0,y:10},{opacity:1,y:0,duration:.6,stagger:.06,ease:'power3.out',clearProps:'opacity,transform'});}
nodes.forEach((b,k)=>b.addEventListener('click',()=>go(step===k+1?0:k+1)));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(step+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){tl?.kill();S.inn.fill(0);S.dot=0;S.flash=0;S.sheen=0;S.node.fill(0);S.draw.fill(0);
 tl=g.timeline({onComplete:()=>{tl=null;}});
 S.node.forEach((_,k)=>{tl.to(S.node,{[k]:1,duration:.8,ease:'power2.out'},1.5+k*.12);tl.to(S.draw,{[k]:1,duration:.9,ease:'power2.inOut'},1.35+k*.12);});
 [0,2,1,3].forEach((k,j)=>tl.to(S.inn,{[k]:1,duration:1.35,ease:'expo.out'},.45+j*.13));
 tl.to(S,{dot:1,duration:.9,ease:'back.out(2.2)'},1.25).fromTo(S,{flash:0},{flash:1,duration:.25,ease:'power2.out'},1.3).to(S,{flash:0,duration:1.2,ease:'power2.in'},1.55)
  .fromTo(S,{sheen:0},{sheen:1,duration:1.5,ease:'power2.inOut'},1.7);}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out',lazy:false}})
  .fromTo(q('.pp-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.pp-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.pp-subtitle,.pp-name,.pp-tagline,.pp-statements>div,.pp-hint'),{opacity:0,y:14},{opacity:1,y:0,duration:.85,stagger:.1},full?.6:.2)
  .fromTo(q('.pp-foot'),{opacity:0},{opacity:1,duration:.8},full?1.6:.3);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.pp-kicker,.pp-line>span,.pp-subtitle,.pp-name,.pp-tagline,.pp-statements>div,.pp-hint,.pp-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}S.inn.fill(1);S.dot=1;S.flash=0;S.sheen=0;S.node.fill(1);const T=targets(step);Object.assign(S,{draw:T.draw,alpha:T.alpha,on:T.on});}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);

window.ELMY_PEOPLE={
 id:'people',keys:['ArrowDown','ArrowUp','PageDown','PageUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();textTl?.progress(1,true);finish();if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(step+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,
 debug:{S,render,get state(){return{step,ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_PEOPLE);
write(0);init();finish();
})();

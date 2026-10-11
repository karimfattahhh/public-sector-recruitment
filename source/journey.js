/* Connected-journey scene: six recruitment activities float as separate modules whose handoffs
   drop records into the gap. Connecting them aligns the modules, draws one conduit from Discover
   to Decide and sends evidence packets that grow at every handoff. Local WebGL and GSAP only;
   without WebGL the activity list and the outcomes carry the slide. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="connected"]');if(!slide||!window.ELMY_LIGHT)return;
const{rng,M,FS_POINTS,VS_FLAT,FS_SPARK}=window.ELMY_LIGHT,g=window.gsap,rand=rng(404);
const sample=(polys,n,jit=0)=>window.ELMY_LIGHT.sample(polys,n,jit,rand);
const stage=$('.cn-stage',slide),canvas=$('.cn-canvas',slide),nodes=$$('.cn-node',slide),toggle=$('.cn-toggle',slide),caption=$('.cn-caption',slide),outcomes=$$('.cn-outcomes li',slide);
const CAPTIONS=['Separate activities. Important handoffs.','Each handoff carries evidence into the next decision.'];

/* Modules sit on a line along x when connected; SEP holds each one's drift (dx, dy, dz, yaw) when separate. */
const TILE=.52,R=.14,TH=.06,X=i=>-5+2*i;
const SEP=[[-.2,.4,.8,.35],[.3,-.3,-1.35,-.42],[-.35,.55,.95,.55],[.25,-.4,-1.1,-.32],[-.3,.32,1.25,.45],[.2,-.22,-.85,-.5]];
const CAMERA={fov:.5,eye:[-4,7.5,13],target:[.3,-.3,0]};

/* Particles: position(3), kind, index, key, seed, size, alpha, shape, colour. */
const STRIDE=11,raw=[];
const put=(p,kind,idx,key,size,alpha,shape=0,color=0)=>raw.push(p[0],p[1],p[2],kind,idx,key,rand()*100,size,alpha,shape,color);
const rounded=(h,r,y)=>{const p=[];for(const[cx,cz,a0]of[[h-r,h-r,0],[-(h-r),h-r,Math.PI/2],[-(h-r),-(h-r),Math.PI],[h-r,-(h-r),1.5*Math.PI]])for(let k=0;k<=8;k++){const a=a0+k/8*Math.PI/2;p.push([cx+Math.cos(a)*r,y,cz+Math.sin(a)*r]);}p.push(p[0]);return p;};
const arc=(cx,cy,r,a0,a1,n=24)=>Array.from({length:n+1},(_,k)=>{const a=a0+(a1-a0)*k/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r,0];});
const box=(x0,y0,x1,y1)=>[[x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0],[x0,y0,0]];
const ICONS=[
 [[[-.11,0,0],[-.1,0,0]],arc(-.11,0,.07,-.9,.9),arc(-.11,0,.13,-.9,.9),arc(-.11,0,.19,-.9,.9)],
 [[[-.11,-.16,0],[.11,-.16,0],[.11,.1,0],[.05,.16,0],[-.11,.16,0],[-.11,-.16,0]],[[.05,.16,0],[.05,.1,0],[.11,.1,0]],[[-.06,.04,0],[.06,.04,0]],[[-.06,-.02,0],[.06,-.02,0]],[[-.06,-.08,0],[.03,-.08,0]]],
 [[[-.17,.14,0],[.17,.14,0],[.04,-.02,0],[.04,-.16,0],[-.04,-.11,0],[-.04,-.02,0],[-.17,.14,0]]],
 [box(-.17,.03,-.07,.13),[[-.15,.08,0],[-.12,.05,0],[-.08,.11,0]],[[-.02,.08,0],[.17,.08,0]],box(-.17,-.13,-.07,-.03),[[-.02,-.08,0],[.17,-.08,0]]],
 [[[0,-.16,0],[0,.12,0]],[[-.17,.1,0],[.17,.1,0]],[[-.14,.1,0],[-.19,-.01,0]],[[-.14,.1,0],[-.09,-.01,0]],arc(-.14,-.01,.05,Math.PI,2*Math.PI,16),[[.14,.1,0],[.09,-.01,0]],[[.14,.1,0],[.19,-.01,0]],arc(.14,-.01,.05,Math.PI,2*Math.PI,16),[[-.07,-.16,0],[.07,-.16,0]]],
 [arc(0,0,.16,0,Math.PI*2,48),arc(0,0,.11,0,Math.PI*2,40),[[-.05,0,0],[-.01,-.045,0],[.06,.05,0]]]
];
for(let i=0;i<6;i++){
 // 1 module body: top and bottom outlines, corner edges, a surface grid, a soft core and a bus that lights when connected.
 for(const p of sample([rounded(TILE,R,TH)],380,.003))put(p,1,i,0,.02,.8);
 for(const p of sample([rounded(TILE,R,-TH)],260,.003))put(p,1,i,0,.016,.32);
 for(const[sx,sz]of[[1,1],[-1,1],[-1,-1],[1,-1]]){const c=TILE-R+R*.7071;for(let k=0;k<=10;k++)put([sx*c,-TH+k/10*2*TH,sz*c],1,i,0,.016,.5);}
 for(let gx=-4;gx<=4;gx++)for(let gz=-4;gz<=4;gz++)put([gx*.1,TH,gz*.1],1,i,0,.014,.2);
 for(let k=0;k<6;k++)put([(rand()-.5)*.3,TH+.05,(rand()-.5)*.3],1,i,0,.85,.035,0,1);
 for(const p of sample([[[-TILE,TH+.012,0],[TILE,TH+.012,0]]],90,.002))put(p,1,i,1,.02,.9,0,3);
 // 3 pictogram floating above the module, always facing the camera.
 for(const p of sample(ICONS[i],110,.004))put([p[0]*1.25,p[1]*1.25,0],3,i,0,.019,.95,0,2);
}
// 4 connectors from module edge to module edge, plus a lime glow that only shows once connected.
for(let i=0;i<5;i++){for(let k=0;k<=200;k++)put([k/200,rand()-.5,rand()-.5],4,i,0,.017,.75);for(let k=0;k<=50;k++)put([k/50,0,0],4,i,1,.26,.06,0,3);}
// 7 one shared platform that draws in beneath the chain once every link is connected.
for(const p of sample([rounded(6.1,.35,-.16).map(q=>[q[0],q[1],q[2]*.17])],900,.004))put(p,7,0,(p[0]+6.1)/12.2,.018,.55);
for(const z of[-.62,-.21,.21,.62])for(let x=-5.7;x<=5.7;x+=.12)put([x,-.16,z],7,0,(x+6.1)/12.2,.013,.16);
// 6 floor grid and 0 atmosphere.
for(let x=-7;x<=7;x+=.5)for(let z=-4.5;z<=4.5;z+=.5)put([x,-1.4,z],6,0,0,.016,.16);
for(let i=0;i<260;i++){const big=rand()<.08;put([-7+rand()*14,-1.2+rand()*4.5,-5+rand()*9],0,0,0,big?.1+rand()*.12:.01+rand()*.025,big?.02+rand()*.025:.05+rand()*.15,0,rand()<.7?0:2);}
const data=new Float32Array(raw),total=data.length/STRIDE;

const VS_POINTS=`precision highp float;
attribute vec3 aP;attribute vec4 aK;attribute vec4 aS;
uniform mat4 uProj,uView;uniform vec2 uShift;uniform vec3 uCamR,uCamU;uniform float uPx,uTime;
uniform vec4 uTile[6];uniform float uTileA[6],uFlash[6],uConn[5],uUnity;
varying vec4 vC;varying float vS,vP;
vec3 pal(float i){if(i<.5)return vec3(.765,.776,1.);if(i<1.5)return vec3(.45,.52,1.);if(i<2.5)return vec3(.96,.965,.98);return vec3(.8,.937,.678);}
vec3 tileAt(int i,vec3 q){vec4 T=uTile[i];float c=cos(T.w),s=sin(T.w);return T.xyz+vec3(c*q.x+s*q.z,q.y,-s*q.x+c*q.z);}
void main(){
 float kind=aK.x,key=aK.z,seed=aK.w;int i=int(aK.y+.5);vec3 p=aP,col=pal(aS.w);float a=aS.y,size=aS.x;vP=0.;
 if(kind<.5){p+=vec3(sin(uTime*.07+seed*9.)*.3,sin(uTime*.05+seed*5.)*.3,cos(uTime*.06+seed*7.)*.3);}
 else if(kind<1.5){float f=uFlash[i];p=tileAt(i,aP);a*=uTileA[i]*(1.+f*.8);col=mix(col,vec3(.9,.97,.82),f*.55);
  if(key>.5){float link=i<5?uConn[i]:uConn[4];link=max(link,i>0?uConn[i-1]:0.);a*=link;}}
 else if(kind<3.5){float f=uFlash[i];p=tileAt(i,vec3(0.,.66+.035*sin(uTime*1.1+float(i)*1.3),0.))+uCamR*aP.x+uCamU*aP.y;a*=uTileA[i]*(.8+f*.4);col=mix(col,pal(3.),f*.75);size*=1.+f*.25;}
 else if(kind<4.5){vec3 s0=uTile[i].xyz,s1=uTile[i+1].xyz,d=normalize(s1-s0);vec3 p0=s0+d*TILE,p1=s1-d*TILE;float t=aP.x,c=uConn[i];
  p=mix(p0,p1,t)+vec3(0.,TH+.012+aP.y*.012*(1.-c),aP.z*.012*(1.-c));
  float stub=1.-step(.32,t)*step(t,.68),drawn=step(t,c*1.25-.12),vis=max(stub*(1.-c),drawn);a*=vis*min(uTileA[i],uTileA[i+1]);
  if(key>.5)a*=c*(.7+.3*sin(uTime*2.+t*6.));else{a*=mix(.6,1.,c);col=mix(col,vec3(.95,.98,.9),c*.6);}}
 else if(kind<6.5){a*=smoothstep(7.5,2.5,length(aP.xz));}
 else{a*=step(key,uUnity*1.1-.05)*smoothstep(0.,.3,uUnity);col=mix(col,vec3(.85,.95,.8),.25);}
 vec4 v=uView*vec4(p,1.),c=uProj*v;c.xy+=uShift*c.w;gl_Position=c;
 float px=size*uPx/c.w;if(px<1.6){a*=px/1.6;px=1.6;}
 gl_PointSize=px;vC=vec4(col,clamp(a,0.,1.));vS=aS.z;
}`.replace(/TILE/g,TILE.toFixed(3)).replace(/\bTH\b/g,TH.toFixed(3));
const FS_BG=`precision mediump float;uniform vec2 uRes,uGlow;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 p=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 d=(p-uGlow)*vec2(asp,1.);
 vec3 col=mix(vec3(.13,.2,.68),vec3(.055,.08,.34),smoothstep(0.,1.15,length(d)));col+=vec3(.08,.1,.3)*exp(-dot(d,d)*3.5);
 col*=1.-.28*smoothstep(.5,1.3,distance(p*vec2(asp,1.),vec2(.55*asp,.5)));col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;

let gl=null,program,attribs,P,K,BG,pointBuf,sparkBuf,quadBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('cn-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  P=program(VS_POINTS,FS_POINTS);K=program(VS_FLAT,FS_SPARK);BG=program(VS_BG,FS_BG);pointBuf=kit.buffer(data);sparkBuf=gl.createBuffer();quadBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State: per-module connection and entrance, per-link drawing, packets simulated in JS. */
const S={tile:[0,0,0,0,0,0],link:[0,0,0,0,0],alpha:[1,1,1,1,1,1],drop:[0,0,0,0,0,0]};
let connected=false,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,layout={shift:[.1,-.1],fov:CAMERA.fov,flat:false};
const sparks=new Float32Array(260*8),tiles=new Float32Array(24),flash=new Float32Array(6);
function tileState(i){const s=SEP[i],c=S.tile[i],e=c*c*(3-2*c),bob=motion?(1-e)*.07*Math.sin(time*.8+i*1.7):0;
 return[X(i)+s[0]*(1-e),s[1]*(1-e)+bob+S.drop[i],s[2]*(1-e),s[3]*(1-e)+(motion?(1-e)*.05*Math.sin(time*.5+i):0)];}
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),flat=innerWidth<=900||!ready;slide.classList.toggle('cn-flat',flat);
 layout=flat?{shift:[0,0],fov:aspect<1?.95:.62,flat}:{shift:[aspect<1.45?.14:.2,aspect>1.7?-.11:-.15],fov:aspect<1.45?.6:aspect>1.7?.58:CAMERA.fov,flat};return aspect;}
function render(){if(!ready)return;const aspect=measure();if(layout.flat){nodes.forEach(el=>{el.style.transform='';el.style.opacity='';});return;}frames++;const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const proj=M.perspective(layout.fov,aspect,.1,80),view=M.lookAt(CAMERA.eye,CAMERA.target,[0,1,0]),vp=M.mul(proj,view),px=(H/2)/Math.tan(layout.fov/2);
 const T=[];for(let i=0;i<6;i++){T.push(tileState(i));tiles.set(T[i],i*4);}
 // Packets: lost across the gaps while separate; a growing evidence stream once connected.
 flash.fill(0);let n=0;const spark=(p,size,c,a)=>{if(n<260&&a>.01){sparks.set([...p,...c,a,size],n*8);n++;}};
 const edge=(i)=>{const a=T[i],b=T[i+1],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz);return[[a[0]+dx/l*TILE,a[1]+dy/l*TILE,a[2]+dz/l*TILE],[b[0]-dx/l*TILE,b[1]-dy/l*TILE,b[2]-dz/l*TILE],[dx/l,dy/l,dz/l]];};
 const together=Math.min(...S.link);
 const along=u=>{const k=Math.min(4,Math.floor(u)),f=u-k,a=T[k],b=T[k+1];return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f+TH+.07,a[2]+(b[2]-a[2])*f];};
 if(together>.98){for(let j=0;j<7;j++){const u=((time*.36+j/7)%1)*5.25,k=Math.min(4,Math.floor(u)),f=Math.min(1,u-k);
   if(u<5){for(let c=0;c<6;c++){const uc=u-c*.05;if(uc<0)break;spark(along(uc),(.08+uc*.03)*(1-c*.13),[.8,.94,.68],Math.min(1,u*4)*(1-c/6));}flash[k]+=Math.exp(-f*f*40);flash[k+1]+=Math.exp(-(1-f)*(1-f)*40);}
   else{const r=(u-5)/.25,c=T[5];for(let q=0;q<20;q++){const a=q/20*Math.PI*2;spark([c[0]+Math.cos(a)*(.25+r*.75),c[1]+TH+.04,c[2]+Math.sin(a)*(.25+r*.75)],.06,[.8,.94,.68],(1-r)*.8);}flash[5]+=1-r;}}
  for(let i=0;i<6;i++)flash[i]=Math.min(1,flash[i]);}
 else if(Math.max(...S.link)<.02&&S.alpha.every(a=>a>.98)){for(let i=0;i<5;i++)for(let j=0;j<2;j++){const period=2.6,ph=time/period+i*.37+j*.5,cycle=Math.floor(ph),t=(ph-cycle)*1.4;if(t>1.3)continue;
   const[p0,p1,d]=edge(i),fail=(cycle+i+j)%3!==0;
   // A record's position at time q along its throw; a failed throw falls out of the gap.
   const at=q=>{const tt=Math.min(Math.max(q,0),fail?.5:1),y=.18+.45*Math.sin(Math.PI*tt);let p=[p0[0]+(p1[0]-p0[0])*tt,p0[1]+(p1[1]-p0[1])*tt+y,p0[2]+(p1[2]-p0[2])*tt],alpha=1;
    if(fail&&q>.5){const tau=(q-.5)*1.3;p=[p[0]+d[0]*tau*.5,p[1]-4*tau*tau,p[2]+d[2]*tau*.5];alpha=Math.max(0,1-tau*1.3);}else if(!fail&&q>1)alpha=0;return[p,alpha];};
   for(let c=0;c<5;c++){const[p,alpha]=at(t-c*.035);if(t-c*.035<0)break;spark(p,.095*(1-c*.14),fail&&t>.5?[.76,.78,1]:[.96,.965,.98],alpha*.95*(1-c/5));}if(!fail&&t>.9&&t<1)flash[i+1]=Math.max(flash[i+1],.5);}}
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quadBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,.6,.52);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.useProgram(P.p);attribs(P,pointBuf,[['aP',3,0],['aK',4,3],['aS',4,7]],STRIDE);const u=P.u;
 gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniform2f(u.uShift,...layout.shift);gl.uniform3f(u.uCamR,view[0],view[4],view[8]);gl.uniform3f(u.uCamU,view[1],view[5],view[9]);
 gl.uniform1f(u.uPx,px);gl.uniform1f(u.uTime,time);gl.uniform4fv(u.uTile,tiles);gl.uniform1fv(u.uTileA,S.alpha);gl.uniform1fv(u.uFlash,flash);gl.uniform1fv(u.uConn,S.link);gl.uniform1f(u.uUnity,Math.min(...S.link));gl.drawArrays(gl.POINTS,0,total);
 if(n){gl.useProgram(K.p);gl.bindBuffer(gl.ARRAY_BUFFER,sparkBuf);gl.bufferData(gl.ARRAY_BUFFER,sparks.subarray(0,n*8),gl.DYNAMIC_DRAW);attribs(K,sparkBuf,[['aP',3,0],['aC',4,3],['aS',1,7]],8);
  gl.uniformMatrix4fv(K.u.uProj,false,proj);gl.uniformMatrix4fv(K.u.uView,false,view);gl.uniformMatrix4fv(K.u.uWorld,false,M.translate(0,0,0));gl.uniform2f(K.u.uShift,...layout.shift);
  gl.uniform1f(K.u.uPx,px);gl.uniform1f(K.u.uVis,1);gl.uniform2f(K.u.uFog,14,.03);gl.uniform1f(K.u.uMirror,0);gl.uniform1f(K.u.uFloor,0);gl.drawArrays(gl.POINTS,0,n);}
 // Labels follow the front edge of their module.
 if(!layout.flat)nodes.forEach((el,i)=>{const t=T[i],c=M.apply(vp,[t[0],t[1]-TH,t[2]+TILE+.22]);const x=((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,y=(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight;
  el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0)`;el.style.opacity=String(S.alpha[i]);el.classList.toggle('is-lit',flash[i]>.35);});
 else nodes.forEach(el=>{el.style.transform='';el.style.opacity='';});
}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Connect and separate. */
function ui(on){connected=on;toggle.setAttribute('aria-pressed',String(on));toggle.firstElementChild.textContent=on?'Show separate activities':'Connect the journey';
 slide.classList.toggle('is-connected',on);if(caption){if(g&&motion&&active){g.to(caption,{opacity:0,y:-6,duration:.25,onComplete:()=>{caption.textContent=CAPTIONS[+on];g.fromTo(caption,{opacity:0,y:8},{opacity:1,y:0,duration:.5});}});}else caption.textContent=CAPTIONS[+on];}}
function set(on,animate=motion){if(on===connected&&!tl)return;ui(on);tl?.kill();
 if(!g||!animate||!ready){S.tile=S.tile.map(()=>on?1:0);S.link=S.link.map(()=>on?1:0);render();return;}
 tl=g.timeline();
 if(on){S.tile.forEach((_,i)=>tl.to(S.tile,{[i]:1,duration:1.1,ease:'power3.inOut'},i*.08));S.link.forEach((_,i)=>tl.to(S.link,{[i]:1,duration:.42,ease:'power2.out'},.75+i*.2));}
 else{S.link.forEach((_,i)=>tl.to(S.link,{[i]:0,duration:.35,ease:'power2.in'},(4-i)*.06));S.tile.forEach((_,i)=>tl.to(S.tile,{[i]:0,duration:1,ease:'power3.inOut'},.3+i*.06));}
}
function intro(){tl?.kill();S.alpha=S.alpha.map(()=>0);S.drop=S.drop.map(()=>2.4);tl=g.timeline();
 S.drop.forEach((_,i)=>{tl.to(S.drop,{[i]:0,duration:1.3,ease:'power3.out'},.25+i*.1);tl.to(S.alpha,{[i]:1,duration:.8,ease:'power2.out'},.25+i*.1);});}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.cn-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.cn-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.cn-controls'),{opacity:0,y:14},{opacity:1,y:0,duration:.9},full?.6:.2)
  .fromTo(q('.cn-outcomes,.cn-foot'),{opacity:0,y:10},{opacity:1,y:0,duration:.9,stagger:.1},full?1:.3);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.cn-kicker,.cn-line>span,.cn-controls,.cn-outcomes,.cn-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}S.alpha=S.alpha.map(()=>1);S.drop=S.drop.map(()=>0);S.tile=S.tile.map(()=>connected?1:0);S.link=S.link.map(()=>connected?1:0);}

toggle.addEventListener('click',()=>set(!connected));
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);

window.ELMY_JOURNEY={
 id:'connected',keys:['ArrowDown','ArrowUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){set(k==='ArrowDown');},
 debug:{S,render,set,get state(){return{connected,ready,frames,particles:total,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_JOURNEY);
init();
})();

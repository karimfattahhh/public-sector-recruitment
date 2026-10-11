/* Slide 4: What if we rethought the entire journey? The same seven stages stand as plaques above the
   shared rail. Four supporting layers draw across the whole journey one at a time, links rise at
   every stage and carry signals between them, then a governance frame draws around everything.
   The scene is laid out from the page each frame, so every plaque sits exactly over its rail stage.
   Local WebGL and GSAP only; without WebGL the copy and the rail carry the slide. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="connected"]');if(!slide||!window.ELMY_LIGHT)return;
const{rng,M,FS_POINTS,VS_FLAT,FS_SPARK}=window.ELMY_LIGHT,g=window.gsap,rand=rng(404);
const sample=(polys,n,jit=0)=>window.ELMY_LIGHT.sample(polys,n,jit,rand);
const STEPS=JSON.parse($('.rt-data',slide).textContent),LAST=STEPS.length-1;
const stage=$('.rt-stage',slide),canvas=$('.rt-canvas',slide),rail=$('.rt-rail',slide),nodes=$$('.jr-node',rail),dots=nodes.map(b=>$('.jr-dot',b));
const head=$('.rt-head',slide),panel=$('.rt-panel',slide),laneTags=$$('.rt-lane',slide),govTag=$('.rt-gov',slide),tag=$('.rt-tag',slide),text=$('.rt-text',slide),count=$('.rt-count',slide);
const N=7,L=4,D=10,FOV=.5;

/* Particles: local position(3), kind, index, key, seed, size, alpha, shape, colour. Positions are
   local: the shader places them from the per-frame layout uniforms. */
const STRIDE=11,raw=[];
const put=(p,kind,idx,key,size,alpha,shape=0,color=0)=>raw.push(p[0],p[1],p[2],kind,idx,key,rand()*100,size,alpha,shape,color);
const rounded=(hx,hy,r,z)=>{const p=[];for(const[cx,cy,a0]of[[hx-r,hy-r,0],[-(hx-r),hy-r,Math.PI/2],[-(hx-r),-(hy-r),Math.PI],[hx-r,-(hy-r),1.5*Math.PI]])for(let k=0;k<=10;k++){const a=a0+k/10*Math.PI/2;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r,z]);}p.push(p[0]);return p;};
const arc=(cx,cy,r,a0,a1,n=24)=>Array.from({length:n+1},(_,k)=>{const a=a0+(a1-a0)*k/n;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r,0];});
const box=(x0,y0,x1,y1)=>[[x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0],[x0,y0,0]];
// Stage pictograms in a unit plaque (about -.55..55): notice, application, development, exam day, evaluation, results, analysis.
const ICONS=[
 [[[-.36,0,0],[-.32,0,0]],arc(-.36,0,.2,-.85,.85),arc(-.36,0,.38,-.85,.85),arc(-.36,0,.56,-.85,.85)],
 [[[-.3,-.44,0],[.3,-.44,0],[.3,.28,0],[.14,.44,0],[-.3,.44,0],[-.3,-.44,0]],[[.14,.44,0],[.14,.28,0],[.3,.28,0]],[[-.16,.12,0],[.16,.12,0]],[[-.16,-.04,0],[.16,-.04,0]],[[-.16,-.2,0],[.08,-.2,0]]],
 [[[-.36,-.36,0],[.24,.24,0]],[[.24,.24,0],[.34,.34,0],[.4,.28,0],[.3,.18,0]],[[-.36,-.36,0],[-.42,-.46,0],[-.3,-.42,0]],[[-.46,-.46,0],[.4,-.46,0]]],
 [box(-.44,.12,-.18,.34),box(-.13,.12,.13,.34),box(.18,.12,.44,.34),box(-.44,-.3,-.18,-.08),box(-.13,-.3,.13,-.08),box(.18,-.3,.44,-.08)],
 [box(-.44,.12,-.2,.36),[[-.4,.24,0],[-.33,.16,0],[-.22,.32,0]],[[-.08,.24,0],[.44,.24,0]],box(-.44,-.32,-.2,-.08),[[-.4,-.2,0],[-.33,-.28,0],[-.22,-.12,0]],[[-.08,-.2,0],[.44,-.2,0]]],
 [arc(0,0,.44,0,Math.PI*2,56),arc(0,0,.31,0,Math.PI*2,44),[[-.14,0,0],[-.03,-.12,0],[.17,.13,0]]],
 [[[-.44,-.42,0],[.44,-.42,0]],box(-.36,-.42,-.16,-.06),box(-.1,-.42,.1,.12),box(.16,-.42,.36,.34)]
];
// 1 plaques: front and back rounded faces, corner depth, a soft glass fill and the pictogram on the front.
for(let i=0;i<N;i++){
 for(const p of sample([rounded(1,1,.28,.14)],300,.002))put(p,1,i,0,.02,.82);
 for(const p of sample([rounded(1,1,.28,-.14)],200,.002))put(p,1,i,0,.016,.28);
 for(const[sx,sy]of[[1,1],[-1,1],[-1,-1],[1,-1]]){const c=1-.28+.28*.7071;for(let k=0;k<=8;k++)put([sx*c,sy*c,-.14+k/8*.28],1,i,0,.015,.45);}
 for(let k=0;k<26;k++)put([(rand()*2-1)*.8,(rand()*2-1)*.8,.12],1,i,0,.5,.03,0,1);
 for(const p of sample(ICONS[i],150,.004))put([p[0],p[1],.16],2,i,0,.02,.95,0,2);
}
// 3 layers: a line across the journey per layer (key = position along it) with a ribbon of fine dust.
for(let k=0;k<L;k++){for(let j=0;j<=700;j++)put([j/700,0,0],3,k,j/700,.016,.42,0,k);for(let j=0;j<500;j++){const t=rand();put([t,(rand()*2-1),0],3,k,t,.009,.16,0,k);}}
// 4 stage nodes on each layer (index = layer*7 + stage).
for(let k=0;k<L;k++)for(let i=0;i<N;i++){for(let j=0;j<40;j++){const a=j/40*Math.PI*2;put([Math.cos(a),Math.sin(a),0],4,k*N+i,0,.014,.85,0,k);}put([0,0,0],4,k*N+i,1,.09,.32,2,k);put([0,0,0],4,k*N+i,1,.3,.05,0,k);}
// 5 links rising at every stage (key = height fraction).
for(let i=0;i<N;i++)for(let j=0;j<=260;j++)put([0,j/260,0],5,i,j/260,.014,.6,0,2);
// 6 governance frame (key = position around the perimeter) and its corner brackets.
for(let j=0;j<=1800;j++)put([j/1800,0,0],6,0,j/1800,.017,.75,0,3);
for(let j=0;j<=1800;j++)put([j/1800,0,0],6,1,j/1800,.2,.03,0,3);
// 0 atmosphere.
for(let i=0;i<240;i++){const big=rand()<.08;put([-9+rand()*18,-5+rand()*10,-6+rand()*7],0,0,0,big?.1+rand()*.12:.01+rand()*.025,big?.02+rand()*.025:.05+rand()*.15,0,rand()<.7?0:2);}
const data=new Float32Array(raw),total=data.length/STRIDE;

const VS_POINTS=`precision highp float;
attribute vec3 aP;attribute vec4 aK;attribute vec4 aS;
uniform mat4 uProj,uView;uniform float uPx,uTime;
uniform float uColX[7],uRise[7],uLane[4],uLaneY[4],uFlash[7];uniform vec2 uLaneX;uniform vec4 uFrame;uniform float uRowY,uTile,uConn,uGov,uAll,uIntro;
varying vec4 vC;varying float vS,vP;
vec3 pal(float i){if(i<.5)return vec3(.765,.776,1.);if(i<1.5)return vec3(.96,.965,.98);if(i<2.5)return vec3(.55,.66,1.);return vec3(.8,.937,.678);}
vec2 frame(float t){vec4 F=uFrame;float w=F.z-F.x,h=F.y-F.w,r=min(.35,h*.2),per=2.*(w+h)-8.*r+6.2832*r,s=t*per;
 // Walk the rounded rectangle from the top-left, clockwise.
 float a=w-2.*r,b=h-2.*r,q=1.5708*r;
 if(s<a)return vec2(F.x+r+s,F.y);s-=a;
 if(s<q){float an=1.5708-s/r;return vec2(F.z-r+cos(an)*r,F.y-r+sin(an)*r);}s-=q;
 if(s<b)return vec2(F.z,F.y-r-s);s-=b;
 if(s<q){float an=-s/r;return vec2(F.z-r+cos(an)*r,F.w+r+sin(an)*r);}s-=q;
 if(s<a)return vec2(F.z-r-s,F.w);s-=a;
 if(s<q){float an=-1.5708-s/r;return vec2(F.x+r+cos(an)*r,F.w+r+sin(an)*r);}s-=q;
 if(s<b)return vec2(F.x,F.w+r+s);s-=b;
 float an=3.1416-s/r;return vec2(F.x+r+cos(an)*r,F.y-r+sin(an)*r);}
void main(){
 float kind=aK.x,key=aK.z,seed=aK.w;int i=int(aK.y+.5);vec3 p=aP,col=pal(aS.w);float a=aS.y,size=aS.x;vP=0.;
 if(kind<.5){p+=vec3(sin(uTime*.07+seed*9.)*.3,sin(uTime*.05+seed*5.)*.3,cos(uTime*.06+seed*7.)*.3);a*=uIntro;}
 else if(kind<2.5){float r=uRise[i],f=uFlash[i];p=vec3(uColX[i],uRowY-(1.-r)*1.4,0.)+aP*uTile;a*=r*(1.+f*.7);
  if(kind>1.5){col=mix(col,pal(3.),f*.8);}else col=mix(col,vec3(.9,.97,.82),f*.4);}
 else if(kind<3.5){float on=uLane[i],t=aP.x;p=vec3(mix(uLaneX.x,uLaneX.y,t),uLaneY[i]+aP.y*.05,0.);
  float drawn=step(t,on*1.08-.04),front=exp(-pow((t-on*1.08+.04)*40.,2.))*(1.-step(.99,on));
  float pulse=exp(-pow((fract(t*1.-uTime*.12+float(i)*.21)-.5)*14.,2.))*step(.99,on);
  a*=drawn*(1.+pulse*.8+uAll*.25)+front*1.5;col=mix(col,vec3(1.),front*.6+pulse*.25);}
 else if(kind<4.5){int k=i/7,s=i-k*7;float on=uLane[k],t=(uColX[s]-uLaneX.x)/(uLaneX.y-uLaneX.x),f=uFlash[s];
  float lit=smoothstep(t,t+.03,on*1.08-.04);p=vec3(uColX[s],uLaneY[k],.02)+vec3(aP.xy*.07*(1.+uConn*.35),0.);a*=lit*(.75+uConn*.6+f*.6);col=mix(col,pal(3.),uConn*.5+f*.4);size*=1.+uConn*.2;}
 else if(kind<5.5){float top=uLaneY[0]+.12,bottom=uRowY+uTile*1.02,t=aP.y;p=vec3(uColX[i],mix(bottom,top,t),0.);
  float drawn=step(t,uConn*1.08-.04),f=uFlash[i];a*=drawn*(.55+f*.8);col=mix(col,pal(3.),f*.7);}
 else{vec2 q=frame(aP.x);p=vec3(q,0.);float drawn=step(aP.x,uGov);a*=drawn*(i==0?1.:1.+.6*sin(uTime*1.5+aP.x*40.));}
 vec4 v=uView*vec4(p,1.),c=uProj*v;gl_Position=c;
 float px=size*uPx/c.w;if(px<1.6){a*=px/1.6;px=1.6;}
 gl_PointSize=px;vC=vec4(col,clamp(a,0.,1.));vS=aS.z;
}`;
const FS_BG=`precision mediump float;uniform vec2 uRes,uGlow;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 p=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 d=(p-uGlow)*vec2(asp,1.);
 vec3 col=mix(vec3(.13,.2,.68),vec3(.055,.08,.34),smoothstep(0.,1.15,length(d)));col+=vec3(.08,.1,.3)*exp(-dot(d,d)*3.5);
 col*=1.-.28*smoothstep(.5,1.3,distance(p*vec2(asp,1.),vec2(.55*asp,.5)));col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;

let gl=null,program,attribs,P,K,BG,pointBuf,sparkBuf,quadBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('rt-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  P=program(VS_POINTS,FS_POINTS);K=program(VS_FLAT,FS_SPARK);BG=program(VS_BG,FS_BG);pointBuf=kit.buffer(data);sparkBuf=gl.createBuffer();quadBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State (GSAP-animated) and the page-derived layout. */
const S={rise:Array(N).fill(1),lane:Array(L).fill(0),conn:0,gov:0,all:0,intro:1};
let step=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null;
const look={x:0,y:0,tx:0,ty:0},sparks=new Float32Array(240*8),flash=new Float32Array(N);
let Lay=null;
function layout(){const box=canvas.getBoundingClientRect(),Wc=box.width||1,Hc=box.height||1,f=(Hc/2)/Math.tan(FOV/2)/D;
 const wx=x=>(x-box.left-Wc/2)/f,wy=y=>(Hc/2-(y-box.top))/f;
 const rr=rail.getBoundingClientRect(),cols=dots.map(d=>{const r=d.getBoundingClientRect();return r.left+r.width/2;});
 const bottomPx=Math.min(rr.top-14,box.bottom-10),colW=(cols[N-1]-cols[0])/(N-1)||100;
 const above=[head,panel].map(el=>el.getBoundingClientRect().bottom).filter(v=>v<bottomPx-160&&v>box.top);
 const topPx=(above.length?Math.max(...above):box.top)+30;
 const tilePx=Math.max(16,Math.min(colW*.24,46,(bottomPx-topPx)*.11));
 const rowPx=bottomPx-tilePx-6,laneTop=topPx+46,laneBottom=rowPx-tilePx-34,gap=(laneBottom-laneTop)/(L-1);
 const lanePx=Array.from({length:L},(_,k)=>laneTop+gap*k),edge=colW*.42;
 Lay={f,box,colX:cols.map(wx),rowY:wy(rowPx),tile:tilePx/f,laneY:lanePx.map(wy),laneX:[wx(cols[0]-edge),wx(cols[N-1]+edge)],
  frame:[wx(cols[0]-edge-18),wy(topPx-8),wx(cols[N-1]+edge+18),wy(rowPx+tilePx+14)],lanePx,laneLeft:cols[0]-edge,framePx:[cols[0]-edge-18,topPx-8]};
 return Wc/Hc;}
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas);slide.classList.toggle('rt-flat',!ready);return aspect;}
function render(){if(!ready)return;const aspect=measure();layout();frames++;const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const proj=M.perspective(FOV,aspect,.1,80),view=M.lookAt([look.x*.6,look.y*.4,D],[0,0,0],[0,1,0]),px=(H/2)/Math.tan(FOV/2);
 // Signals: along each finished layer, and up and down the links once the layers connect.
 flash.fill(0);let n=0;const spark=(p,size,c,a)=>{if(n<240&&a>.01){sparks.set([...p,...c,a,size],n*8);n++;}};
 const colours=[[.765,.776,1],[.96,.965,.98],[.55,.66,1],[.8,.937,.678]];
 for(let k=0;k<L;k++)if(S.lane[k]>.99)for(let j=0;j<2;j++){const t=(time*.09+j*.5+k*.23)%1,x=Lay.laneX[0]+(Lay.laneX[1]-Lay.laneX[0])*t;for(let c=0;c<5;c++)spark([x-c*.05,Lay.laneY[k],.03],.07*(1-c*.15),colours[k],(1-c/5)*Math.sin(Math.PI*t));}
 if(S.conn>.99)for(let i=0;i<N;i++){const t=(time*.32+i*.37)%1,up=i%2===0,y0=Lay.rowY+Lay.tile*1.02,y1=Lay.laneY[0]+.12,y=up?y0+(y1-y0)*t:y1+(y0-y1)*t;
  for(let c=0;c<5;c++)spark([Lay.colX[i],y+(up?-1:1)*c*.05,.04],.08*(1-c*.15),[.8,.94,.68],(1-c/5)*Math.sin(Math.PI*t));flash[i]=Math.max(flash[i],up?Math.exp(-Math.pow((t)*6,2)):Math.exp(-Math.pow((1-t)*6,2)));}
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quadBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,.55,.42);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.useProgram(P.p);attribs(P,pointBuf,[['aP',3,0],['aK',4,3],['aS',4,7]],STRIDE);const u=P.u;
 gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniform1f(u.uPx,px);gl.uniform1f(u.uTime,time);
 gl.uniform1fv(u.uColX,Lay.colX);gl.uniform1fv(u.uRise,S.rise);gl.uniform1fv(u.uLane,S.lane);gl.uniform1fv(u.uLaneY,Lay.laneY);gl.uniform1fv(u.uFlash,flash);
 gl.uniform2f(u.uLaneX,...Lay.laneX);gl.uniform4f(u.uFrame,...Lay.frame);gl.uniform1f(u.uRowY,Lay.rowY);gl.uniform1f(u.uTile,Lay.tile);gl.uniform1f(u.uConn,S.conn);gl.uniform1f(u.uGov,S.gov);gl.uniform1f(u.uAll,S.all);gl.uniform1f(u.uIntro,S.intro);
 gl.drawArrays(gl.POINTS,0,total);
 if(n){gl.useProgram(K.p);gl.bindBuffer(gl.ARRAY_BUFFER,sparkBuf);gl.bufferData(gl.ARRAY_BUFFER,sparks.subarray(0,n*8),gl.DYNAMIC_DRAW);attribs(K,sparkBuf,[['aP',3,0],['aC',4,3],['aS',1,7]],8);
  gl.uniformMatrix4fv(K.u.uProj,false,proj);gl.uniformMatrix4fv(K.u.uView,false,view);gl.uniformMatrix4fv(K.u.uWorld,false,M.translate(0,0,0));gl.uniform2f(K.u.uShift,0,0);
  gl.uniform1f(K.u.uPx,px);gl.uniform1f(K.u.uVis,1);gl.uniform2f(K.u.uFog,30,.0);gl.uniform1f(K.u.uMirror,0);gl.uniform1f(K.u.uFloor,0);gl.drawArrays(gl.POINTS,0,n);}
 place();
}
/* Layer labels sit above the start of each layer; the governance label on the frame's top edge. */
function setTag(el,x,y,o){const vis=o>.02,k=vis?`${x|0},${y|0},${o.toFixed(2)}`:'';if(el._k===k)return;el._k=k;el.style.visibility=vis?'visible':'hidden';if(vis){el.style.opacity=String(o);el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;}}
function place(){const b=Lay.box;laneTags.forEach((t,k)=>setTag(t,Lay.laneLeft-b.left,Lay.lanePx[k]-b.top-33,Math.min(1,S.lane[k]*3)));
 setTag(govTag,Lay.framePx[0]-b.left+26,Lay.framePx[1]-b.top-13,Math.max(0,Math.min(1,(S.gov-.15)*3)));}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;look.x+=(look.tx-look.x)*Math.min(1,dt*2);look.y+=(look.ty-look.y)*Math.min(1,dt*2);render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps: 0 the journey; 1-4 one layer each; 5 links at every stage; 6 governance; 7 the closing line. */
function targets(n){return{lane:S.lane.map((_,k)=>n>k?1:0),conn:n>=5?1:0,gov:n>=6?1:0,all:n>=7?1:0};}
function write(n,animate){const s=STEPS[n];const swap=()=>{tag.textContent=s.tag;text.textContent=s.text;};
 slide.dataset.step=String(n);count.textContent=`${n} / ${LAST}`;
 if(g&&animate&&n<LAST){g.timeline().to([tag,text],{opacity:0,y:-6,duration:.18,ease:'power2.in'}).add(swap).fromTo([tag,text],{opacity:0,y:10},{opacity:1,y:0,duration:.5,stagger:.06,ease:'power3.out',clearProps:'opacity,transform'});}else swap();
 nodes.forEach(b=>b.setAttribute('aria-pressed','false'));rail.classList.toggle('is-all',n>=5);rail.classList.toggle('is-idle',n<5);rail.style.setProperty('--jr-p',n>=5?'1':'0');}
function go(n,animate=motion){n=Math.max(0,Math.min(LAST,n));if(n===step&&!tl)return;const up=n>step;step=n;tl?.progress(1);tl=null;write(n,animate);const T=targets(n);
 if(!g||!animate||!ready){S.lane=T.lane;S.conn=T.conn;S.gov=T.gov;S.all=T.all;render();return;}
 S.lane.forEach((v,k)=>{if(v!==T.lane[k])g.to(S.lane,{[k]:T.lane[k],duration:T.lane[k]?1.6:.5,ease:T.lane[k]?'power2.inOut':'power2.in',overwrite:'auto'});});
 g.to(S,{conn:T.conn,duration:T.conn?1.3:.45,ease:'power2.inOut',overwrite:'auto'});
 g.to(S,{gov:T.gov,duration:T.gov?2.2:.5,ease:T.gov?'power2.inOut':'power2.in',overwrite:'auto'});
 g.to(S,{all:T.all,duration:1,overwrite:'auto'});}
function intro(){tl?.kill();S.rise=S.rise.map(()=>0);S.intro=0;tl=g.timeline();
 S.rise.forEach((_,i)=>tl.to(S.rise,{[i]:1,duration:1.1,ease:'power3.out'},.35+i*.11));tl.to(S,{intro:1,duration:1.5},.2);}
function textIn(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.rt-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.rt-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.rt-sub,.rt-panel'),{opacity:0,y:12},{opacity:1,y:0,duration:.9,stagger:.12},full?.6:.2)
  .fromTo(q('.rt-rail .jr-line'),{scaleX:0,transformOrigin:'0 50%'},{scaleX:1,duration:1.4,ease:'power2.inOut'},full?.2:.1)
  .fromTo(q('.rt-rail li'),{opacity:0,y:10},{opacity:1,y:0,duration:.7,stagger:.1},full?.3:.12)
  .fromTo(q('.rt-foot'),{opacity:0},{opacity:1,duration:.8},full?1.2:.3);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.rt-kicker,.rt-line>span,.rt-sub,.rt-panel,.rt-rail .jr-line,.rt-rail li,.rt-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}S.rise=S.rise.map(()=>1);S.intro=1;const T=targets(step);S.lane=T.lane;S.conn=T.conn;S.gov=T.gov;S.all=T.all;}

addEventListener('pointermove',e=>{if(!active)return;look.tx=(e.clientX/innerWidth-.5);look.ty=-(e.clientY/innerHeight-.5);},{passive:true});
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(step+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});
write(0,false);

window.ELMY_JOURNEY={
 id:'connected',keys:['ArrowDown','ArrowUp','PageDown','PageUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();textIn(true);}else{finish();textIn(false);}render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();look.tx=look.ty=look.x=look.y=0;render();}else start();},
 key(k){go(step+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,
 debug:{S,render,get state(){return{step,ready,frames,particles:total,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_JOURNEY);
init();
})();

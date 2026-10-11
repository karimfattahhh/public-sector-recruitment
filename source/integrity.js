/* Slide 8 (Nizar brief, new): Examination integrity by design. One exam room seen through time.
   Before: screens are tested, desks checked, content sealed and staff briefed. During: candidates
   pass check-in and fill the room under walking supervisors while a console watches the systems.
   After: submissions flow to matched records that wait for Board approval before results light.
   The finale shows every safeguard at once; a connection-drop scenario opens only on request.
   Readiness, supervision and approval visuals only: no locks or alarms. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="integrity"]');if(!slide||!window.ELMY_LIGHT)return;
const{rng,M,FS_POINTS,VS_BG,FS_BG}=window.ELMY_LIGHT,g=window.gsap,rand=rng(808);
const DATA=JSON.parse($('.ig8-data',slide).textContent),PH=DATA.phases,LAST=PH.length+1;
const canvas=$('.ig8-canvas',slide),tags=Object.fromEntries($$('.ig8-tag',slide).map(t=>[t.dataset.tag,t])),phs=$$('.ig8-ph',slide);
const P={num:$('.ig8-num',slide),label:$('.ig8-label',slide),name:$('.ig8-name',slide),text:$('.ig8-text',slide),note:$('.ig8-note',slide),step:$('.ig8-step',slide)};

/* The room: desks in five columns and four rows; the front of the room is at +x. */
const COLS=5,ROWS=4,ND=COLS*ROWS,deskX=c=>-2.2+.9*c,deskZ=r=>-1.35+.9*r,INC=7;
const STRIDE=11,raw=[];
const put=(p,kind,idx,key,size,alpha,shape=0,color=0,seed=rand()*100)=>raw.push(p[0],p[1],p[2],kind,idx,key,seed,size,alpha,shape,color);
const line=(a,b,kind,idx,o={})=>{const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/(o.step||.02)));for(let k=0;k<=n;k++){const t=k/n;put([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t],kind,idx,o.key??0,o.size||.016,o.alpha??.6,o.shape??0,o.color??0);}};
const rectXZ=(cx,y,cz,hx,hz,kind,idx,o)=>{line([cx-hx,y,cz-hz],[cx+hx,y,cz-hz],kind,idx,o);line([cx+hx,y,cz-hz],[cx+hx,y,cz+hz],kind,idx,o);line([cx+hx,y,cz+hz],[cx-hx,y,cz+hz],kind,idx,o);line([cx-hx,y,cz+hz],[cx-hx,y,cz-hz],kind,idx,o);};
const rectYZ=(x,cy,cz,hy,hz,kind,idx,o)=>{line([x,cy-hy,cz-hz],[x,cy+hy,cz-hz],kind,idx,o);line([x,cy+hy,cz-hz],[x,cy+hy,cz+hz],kind,idx,o);line([x,cy+hy,cz+hz],[x,cy-hy,cz+hz],kind,idx,o);line([x,cy-hy,cz+hz],[x,cy-hy,cz-hz],kind,idx,o);};
const rectXY=(cx,cy,z,hx,hy,kind,idx,o)=>{line([cx-hx,cy-hy,z],[cx+hx,cy-hy,z],kind,idx,o);line([cx+hx,cy-hy,z],[cx+hx,cy+hy,z],kind,idx,o);line([cx+hx,cy+hy,z],[cx-hx,cy+hy,z],kind,idx,o);line([cx-hx,cy+hy,z],[cx-hx,cy-hy,z],kind,idx,o);};
const person=(p,kind,idx,key,color,size=.44)=>put([p[0],size*.48,p[2]],kind,idx,key,size,.95,3,color);
// 1 the room shell: floor outline and grid, the back wall and the left wall with its door.
rectXZ(.1,0,0,3.1,2.05,1,0,{alpha:.55,size:.018});
for(let x=-2.9;x<=3.1;x+=.3)for(let z=-1.9;z<=1.9;z+=.3)put([x,0,z],1,0,0,.012,.12);
for(const y of[0,.55]){line([-3,y,-2.05],[3.2,y,-2.05],1,0,{alpha:y?.45:.55});line([-3,y,-2.05],[-3,y,-.5],1,0,{alpha:y?.45:.55});line([-3,y,.5],[-3,y,2.05],1,0,{alpha:y?.45:.55});}
for(const[x,z]of[[-3,-2.05],[3.2,-2.05],[-3,2.05]])line([x,0,z],[x,.55,z],1,0,{alpha:.4});
for(const z of[-.5,.5])line([-3,0,z],[-3,1.05,z],1,0,{alpha:.7,size:.02});line([-3,1.05,-.5],[-3,1.05,.5],1,0,{alpha:.7,size:.02});
// 2 desks, 3 monitor frames, 4 screens, 5 ready checks, 6 candidates.
for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const d=r*COLS+c,x=deskX(c),z=deskZ(r),key=(c*ROWS+r)/ND;
 rectXZ(x,.3,z,.24,.17,2,d,{alpha:.8,size:.016});for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]])line([x+sx*.22,0,z+sz*.15],[x+sx*.22,.3,z+sz*.15],2,d,{alpha:.25,size:.012,step:.04});
 rectYZ(x+.15,.44,z,.1,.13,3,d,{alpha:.75,size:.014,step:.015});
 for(let j=0;j<26;j++)put([x+.152,.36+rand()*.16,z-.11+rand()*.22],4,d,key,.05,.12,0,3);
 const cx=x,cy=.74;line([cx-.08,cy,z],[cx-.03,cy-.05,z],5,d,{key,alpha:.95,size:.022,color:3,step:.012});line([cx-.03,cy-.05,z],[cx+.08,cy+.07,z],5,d,{key,alpha:.95,size:.022,color:3,step:.012});
 person([x-.4,0,z],6,d,(r*COLS+c)/ND,2,.38);}
// 7 two supervisors walking the aisles (index 0, 1).
for(let k=0;k<2;k++)person([0,0,0],7,k,0,3,.5);
// 8 staff briefing: three people and a board at the front.
[[2.25,.42],[2.55,.72],[2.2,1.0]].forEach(([x,z],k)=>person([x,0,z],8,k,0,0,.46));rectYZ(3.05,.82,.7,.28,.45,8,9,{alpha:.6,size:.015});for(let j=0;j<3;j++)line([3.04,.95-j*.12,.4],[3.04,.95-j*.12,1.0-j*.12],8,9,{alpha:.4,size:.012});
// 9 protected content: a sealed folder with a ribbon (no locks).
{const x=2.55,z=-1.65,h=.22;rectXZ(x,0,z,.24,.18,9,0,{alpha:.7});rectXZ(x,h,z,.24,.18,9,0,{alpha:.7});for(const[sx,sz]of[[-1,-1],[1,-1],[-1,1],[1,1]])line([x+sx*.24,0,z+sz*.18],[x+sx*.24,h,z+sz*.18],9,0,{alpha:.55});
 line([x-.24,h+.005,z],[x+.24,h+.005,z],9,0,{alpha:.95,color:3,size:.02});line([x,h+.005,z-.18],[x,h+.005,z+.18],9,0,{alpha:.95,color:3,size:.02});}
// 10 the monitoring console: a desk, three screens and four status lights (index 3 is the one that flags an incident).
{const x=2.55,z=-.55;rectXZ(x,.3,z,.2,.42,10,9,{alpha:.6});for(const k of[-1,0,1])rectYZ(x+.12,.47,z+k*.27,.11,.12,10,9,{alpha:.8,size:.014,step:.015});
 for(let k=0;k<4;k++)for(let j=0;j<10;j++)put([x+.14,.62+rand()*.02,z-.36+k*.24+rand()*.02],10,k,1,.06,.5,2,3);}
// 11 check-in outside the door: a desk, a staff member and the gate; 12 candidates arriving.
rectXZ(-3.7,.3,-.85,.16,.3,11,0,{alpha:.65});person([-3.95,0,-.85],11,0,0,0,.44);
for(let k=0;k<6;k++)put([0,0,.19],12,k,k/6,.38,.9,3,2);
// 13 submissions travelling from each screen to the records; 14 the records stack.
for(let d=0;d<ND;d++)for(let j=0;j<2;j++)put([0,0,0],13,d,j*.5,.07,.9,0,3);
for(let k=0;k<5;k++)rectXZ(2.5,.06+k*.05,.25,.2,.27,14,k,{alpha:.7,size:.014,step:.018});
// 15 the Board approval seal; 16 the published results board at the back.
{const cx=2.35,cy=.95,z=1.9;for(let k=0;k<=80;k++){const a=k/80*Math.PI*2;put([cx+Math.cos(a)*.22,cy+Math.sin(a)*.22,z],15,0,0,.022,.95,0,3);put([cx+Math.cos(a)*.27,cy+Math.sin(a)*.27,z],15,0,0,.012,.5,0,3);}
 line([cx-.1,cy,z],[cx-.03,cy-.08,z],15,0,{alpha:1,color:3,size:.024,step:.01});line([cx-.03,cy-.08,z],[cx+.12,cy+.09,z],15,0,{alpha:1,color:3,size:.024,step:.01});}
rectXY(2.2,1.12,-2.07,.7,.36,16,0,{alpha:.75,size:.016});for(let k=0;k<4;k++){line([1.65,1.3-k*.13,-2.07],[2.45,1.3-k*.13,-2.07],16,1,{alpha:.45,size:.012});put([2.65,1.3-k*.13,-2.07],16,2,k/4,.06,.9,2,3);}
// 17 the incident ring around one desk (scenario only).
for(let k=0;k<=90;k++){const a=k/90*Math.PI*2;put([deskX(INC%COLS)+Math.cos(a)*.48,.01,deskZ(Math.floor(INC/COLS))+Math.sin(a)*.42],17,0,0,.024,.9,0,2);}
// 0 atmosphere.
for(let i=0;i<220;i++){const big=rand()<.08;put([-6+rand()*12,-1+rand()*4,-5+rand()*8],0,0,0,big?.1+rand()*.12:.01+rand()*.025,big?.02+rand()*.025:.05+rand()*.14,0,rand()<.7?0:2);}
const data=new Float32Array(raw),total=data.length/STRIDE;

const VS=`precision highp float;
attribute vec3 aP;attribute vec4 aK;attribute vec4 aS;
uniform mat4 uProj,uView;uniform vec2 uShift;uniform float uPx,uTime;uniform vec4 uA,uB,uC,uD,uE;
varying vec4 vC;varying float vS,vP;
float hash(float n){return fract(sin(n*12.9898)*43758.5453);}
vec3 pal(float i){if(i<.5)return vec3(.765,.776,1.);if(i<1.5)return vec3(.45,.52,1.);if(i<2.5)return vec3(.96,.965,.98);return vec3(.8,.937,.678);}
void main(){
 float kind=aK.x,key=aK.z,seed=aK.w;int idx=int(aK.y+.5);vec3 p=aP,col=pal(aS.w);float a=aS.y,size=aS.x;vP=0.;
 float room=uA.x,test=uA.y,on=uA.z,check=uA.w,checkA=uB.x,seat=uB.y,cand=uB.z,sup=uB.w,staff=uC.x,box=uC.y,cons=uC.z,door=uC.w,arrive=uD.x,flow=uD.y,stack=uD.z,seal=uD.w,publish=uE.x,inc=uE.y;
 bool incDesk=idx==${INC};
 if(kind<.5){p+=vec3(sin(uTime*.07+seed*9.)*.3,sin(uTime*.05+seed*5.)*.3,cos(uTime*.06+seed*7.)*.3);}
 else if(kind<1.5)a*=room;
 else if(kind<2.5)a*=room;
 else if(kind<3.5)a*=room*(.7+.3*on);
 else if(kind<4.5){float sweep=exp(-pow((key-test)*9.,2.))*step(.001,test)*step(test,.999);float lit=max(on,sweep*1.4);
  if(incDesk&&inc>.01)lit*=.35+.65*step(.5,fract(uTime*2.3));a*=room*(.25+lit*3.5);col=mix(pal(0.),col,lit);}
 else if(kind<5.5)a*=checkA*smoothstep(key,key+.04,check);
 else if(kind<6.5){a*=cand*smoothstep(key,key+.05,seat);vP=0.;}
 else if(kind<7.5){float z=1.5*sin(uTime*.22+float(idx)*2.5),x=idx==0?-1.75:.5;p=vec3(x,p.y,z);vP=sin(uTime*2.6+float(idx));a*=sup;}
 else if(kind<8.5)a*=staff;
 else if(kind<9.5)a*=box;
 else if(kind<10.5){if(key>.5){a*=cons*(.55+.45*sin(uTime*1.7+float(idx)));if(idx==3&&inc>.01){a*=1.4;col=mix(col,vec3(1.),.6*step(.5,fract(uTime*2.3)));}}else a*=cons*.8+room*.2;}
 else if(kind<11.5)a*=door;
 else if(kind<12.5){float f=fract(uTime*.16+key);p=vec3(mix(-4.6,-2.55,f),p.y,(mod(float(idx),3.)-1.)*.16);vP=sin(uTime*3.2+float(idx));a*=arrive*sin(3.1416*f);}
 else if(kind<13.5){float dx=-2.2+.9*mod(float(idx),5.),dz=-1.35+.9*floor(float(idx)/5.),t=fract(uTime*.3+hash(seed)+key);
  vec3 s0=vec3(dx+.15,.46,dz),s1=vec3(2.5,.32,.25),m=(s0+s1)*.5+vec3(0.,.9,0.);float u=1.-t;p=u*u*s0+2.*u*t*m+t*t*s1;a*=flow*sin(3.1416*t);}
 else if(kind<14.5)a*=stack*smoothstep(float(idx)*.2,float(idx)*.2+.2,stack);
 else if(kind<15.5){a*=seal;size*=1.+.12*seal*sin(uTime*2.);}
 else if(kind<16.5){a*=publish*(idx==2?smoothstep(key,key+.2,publish):1.);if(idx!=2)a*=.6+.4*publish;}
 else{float r=fract(uTime*.6);a*=inc*(1.-r);p=vec3(-2.2+.9*float(${INC%COLS}),p.y,-1.35+.9*float(${Math.floor(INC/COLS)}))+(p-vec3(-2.2+.9*float(${INC%COLS}),p.y,-1.35+.9*float(${Math.floor(INC/COLS)})))*(.7+r*.6);}
 vec4 v=uView*vec4(p,1.),c=uProj*v;c.xy+=uShift*c.w;gl_Position=c;
 float px=size*uPx/c.w;if(px<1.6){a*=px/1.6;px=1.6;}
 gl_PointSize=px;vC=vec4(col,clamp(a,0.,1.));vS=aS.z;
}`;

let gl=null,program,attribs,PR,BG,buf,quad,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('ig8-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  PR=program(VS,FS_POINTS);BG=program(VS_BG,FS_BG);buf=kit.buffer(data);quad=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State (GSAP-animated). */
const KEYS=['room','test','on','check','checkA','seat','cand','sup','staff','box','cons','door','arrive','flow','stack','seal','publish','inc'];
const S=Object.fromEntries(KEYS.map(k=>[k,0]));S.room=1;
const STATES=[
 {room:1},
 {room:1,test:1,check:1,checkA:1,staff:1,box:1,door:.3},
 {room:1,on:1,seat:1,cand:1,sup:1,box:.35,cons:1,door:1,arrive:1},
 {room:1,on:.3,sup:.35,cons:.4,flow:1,stack:1,seal:1,publish:1,box:.35},
 {room:1,on:.6,seat:1,cand:.75,sup:1,box:1,cons:1,door:.8,arrive:.5,flow:.6,stack:1,seal:1,publish:1,checkA:.45,check:1}];
const TAGS=[[],['box','staff','door'],['door','console'],['stack','seal','board'],[]];
const TAG_POS={door:[-3.7,1.05,-.85],box:[2.55,.62,-1.65],staff:[2.4,1.15,.75],console:[2.6,.95,-.55],stack:[2.5,.68,.25],seal:[2.35,.62,1.9],board:[2.2,1.68,-2.07]};
let step=0,scen=false,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,layout={shift:[.34,-.06],fov:.5,flat:false};
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),flat=!ready;slide.classList.toggle('ig8-flat',flat);const phone=innerWidth<=900;
 layout=phone?{shift:[.1,-.06],fov:aspect<1.2?.64:.55,flat}:{shift:[aspect<1.45?.4:.36,-.1],fov:aspect<1.45?.76:.66,flat};return aspect;}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight];}
function render(){if(!ready)return;const aspect=measure();frames++;const W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const proj=M.perspective(layout.fov,aspect,.1,80),view=M.lookAt([5.6,7.4,9.2],[-.2,-.15,0],[0,1,0]),vp=M.mul(proj,view),px=(H/2)/Math.tan(layout.fov/2);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quad,[['aP',2,0]],2);const c0=project(vp,[0,0,0]);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,c0[0]/canvas.clientWidth,1-c0[1]/canvas.clientHeight);gl.uniform2f(BG.u.uVig,.6,.5);gl.uniform1f(BG.u.uGlowA,.9);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(PR.p);attribs(PR,buf,[['aP',3,0],['aK',4,3],['aS',4,7]],STRIDE);const u=PR.u;
 gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,view);gl.uniform2f(u.uShift,...layout.shift);gl.uniform1f(u.uPx,px);gl.uniform1f(u.uTime,time);
 gl.uniform4f(u.uA,S.room,S.test,S.on,S.check);gl.uniform4f(u.uB,S.checkA,S.seat,S.cand,S.sup);gl.uniform4f(u.uC,S.staff,S.box,S.cons,S.door);gl.uniform4f(u.uD,S.arrive,S.flow,S.stack,S.seal);gl.uniform4f(u.uE,S.publish,S.inc,0,0);
 gl.drawArrays(gl.POINTS,0,total);place(vp);}
let placedKey='';
function place(vp){const on=new Set(scen?['console','door']:TAGS[step]),key=[...on].join()+canvas.clientWidth+'x'+canvas.clientHeight;if(key===placedKey)return;placedKey=key;
 for(const[k,el]of Object.entries(tags)){const vis=on.has(k);el.style.visibility=vis?'visible':'hidden';el.style.opacity=vis?'1':'0';el.classList.toggle('is-key',scen&&k==='console');if(vis){const[x,y]=project(vp,TAG_POS[k]);el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,${k==='seal'?'12px':'-100%'})`;}}}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps: 0 the empty room, 1 before, 2 during, 3 after, 4 every safeguard together. */
function target(n){const t=Object.fromEntries(KEYS.map(k=>[k,0]));Object.assign(t,STATES[n]);if(scen)t.inc=1;return t;}
function write(n){slide.dataset.step=String(n);slide.dataset.phase=String(n);slide.dataset.view=scen?'scen':n===0?'intro':n===LAST?'final':'phase';P.step.textContent=`${Math.min(n,PH.length)} / ${PH.length}`;
 phs.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===n-1)));
 if(n>=1&&n<=PH.length){const ph=PH[n-1];P.num.textContent=String(n).padStart(2,'0');P.label.textContent=ph.label+' the exam';P.name.textContent=ph.name;P.text.textContent=ph.text;P.note.textContent=ph.note||'';}
 placedKey='';}
function apply(n,animate){const T=target(n);
 if(!g||!animate||!ready){Object.assign(S,T);render();return;}
 tl?.kill();tl=g.timeline();
 // Sequenced arrivals: tests sweep, checks tick in, seats fill, then records before the seal and the results.
 const order={test:[0,2.2,'none'],check:[.4,2.2,'power1.inOut'],seat:[.3,2.4,'power1.inOut'],stack:[.5,1.2],seal:[1.4,.8],publish:[2.1,1]};
 for(const k of KEYS){const[d,dur,ease]=order[k]&&T[k]>S[k]?order[k]:[0,.8];tl.to(S,{[k]:T[k],duration:dur,ease:ease||'power2.inOut'},d);}
 if(T.test>0&&S.test>=1){S.test=0;}}
function go(n,animate=motion){n=Math.max(0,Math.min(LAST,n));if(n===step&&!tl&&!scen)return;scen=false;step=n;write(n);if(n===1)S.test=0;apply(n,animate);
 if(g&&animate)g.fromTo($$('.ig8-name,.ig8-text,.ig8-note',slide),{opacity:0,y:10},{opacity:1,y:0,duration:.55,stagger:.05,ease:'power3.out',clearProps:'opacity,transform'});}
function scenario(on,animate=motion){scen=on&&step===2;write(step);apply(step,animate);}
$('.ig8-what',slide).addEventListener('click',()=>scenario(true));
$('.ig8-back',slide).addEventListener('click',()=>scenario(false));
phs.forEach((b,k)=>b.addEventListener('click',()=>go(k+1)));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(step+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});
function intro(){S.room=0;tl?.kill();tl=g.timeline().to(S,{room:1,duration:1.8,ease:'power2.out'},.3);}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.ig8-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.ig8-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.ig8-subtitle,.ig8-panel,.ig8-hint'),{opacity:0,y:14},{opacity:1,y:0,duration:.9,stagger:.1},full?.6:.2)
  .fromTo(q('.ig8-time li'),{opacity:0,y:12},{opacity:1,y:0,duration:.8,stagger:.12},full?.9:.25)
  .fromTo(q('.ig8-foot'),{opacity:0},{opacity:1,duration:.8},full?1.4:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.ig8-kicker,.ig8-line>span,.ig8-subtitle,.ig8-panel,.ig8-hint,.ig8-time li,.ig8-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}Object.assign(S,target(step));}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{placedKey='';if(active&&!raf)render();}).observe(canvas);

window.ELMY_INTEGRITY={
 id:'integrity',keys:['ArrowDown','ArrowUp','PageDown','PageUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(step+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,scenario,
 debug:{S,render,get state(){return{step,scen,ready,frames,particles:total,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_INTEGRITY);
write(0);init();
})();

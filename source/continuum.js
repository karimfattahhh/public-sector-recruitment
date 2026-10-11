/* Slide 2: Behind every recruitment cycle. Seven stage gateways stand on one path and are shown whole
   before any detail opens. Each stage flies the camera to its gateway, where a small activity
   illustration assembles above it; the pressure step quickens that illustration. After stage 7 the
   camera pulls back and five recurring themes rise as columns carrying one institutional objective,
   with beams to the stages each theme touches. Local WebGL and GSAP only; the sculpture image is the
   no-WebGL fallback. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="institution"]');if(!slide||!window.ELMY_LIGHT)return;
const{rng,M,FS_POINTS,VS_FLAT,FS_SPARK,VS_BG,FS_BG}=window.ELMY_LIGHT,g=window.gsap,rand=rng(2026);
const DATA=JSON.parse($('.ct-data',slide).textContent),STAGES=DATA.stages,THEMES=DATA.themes,LINKS=DATA.links,N=STAGES.length,LAST=1+2*N;
const stage=$('.ct-stage',slide),canvas=$('.ct-canvas',slide),rail=$('.ct-rail',slide),nodes=$$('.jr-node',rail);
const themeTags=$$('.ct-theme',slide),lintelTag=$('.ct-lintel',slide),labels=$$('.ct-vl',slide).map(el=>({el,i:+el.dataset.stage,x:+el.dataset.x,y:+el.dataset.y,shown:-1}));
const P={count:$('.ct-count b',slide),name:$('.ct-name',slide),text:$('.ct-text',slide),online:$('.ct-online',slide),onlineText:$('.ct-online span',slide),label:$('.ct-label',slide),q:$('.ct-q',slide),opp:$('.ct-opp-text',slide),prev:$('.ct-prev',slide),next:$('.ct-next',slide)};
const pad=n=>String(n).padStart(2,'0');

/* Geometry in world units: gateways straddle a path along x; theme columns stand behind at COLZ. */
const FLOOR=-1,GATE_R=.5,GATE_H=.8,HALF=.4,VY=1.22,VS=1.45,PATH=[-4.3,4.5];
const gateX=i=>-3+i;
const COLX=[-2.4,-1.2,0,1.2,2.4],COLZ=-1.9,COL_TOP=1.75,COL_R=.2,ATTACH=.72;
const apex=i=>[gateX(i),FLOOR+GATE_H+GATE_R+.07,0];
const anchor=c=>[COLX[c],ATTACH,COLZ+COL_R+.03];
function beamPoint(k,t){const[c,i]=LINKS[k],p=anchor(c),q=apex(i),dx=Math.abs(q[0]-p[0]),m=[(p[0]+q[0])/2,Math.max(p[1],q[1])+.42+.18*dx,(p[2]+q[2])/2+.35],u=1-t;
 return[u*u*p[0]+2*u*t*m[0]+t*t*q[0],u*u*p[1]+2*u*t*m[1]+t*t*q[1],u*u*p[2]+2*u*t*m[2]+t*t*q[2]];}

/* Particles: position(3), kind, index, key, seed, size, alpha, shape, colour. */
const STRIDE=11,raw=[];
const put=(p,kind,idx,key,size,alpha,shape=0,color=0,seed=rand()*100)=>raw.push(p[0],p[1],p[2],kind,idx,key,seed,size,alpha,shape,color);
const along=x=>(x-PATH[0])/(PATH[1]-PATH[0]);
// 1 path: surface, edges and slab sides, drawn from the first stage to the last.
const edgeFade=x=>Math.min(1,(x-PATH[0])/.7,(PATH[1]-x)/.7);
for(let i=0;i<2800;i++){const x=PATH[0]+rand()*(PATH[1]-PATH[0]);put([x,FLOOR,(rand()*2-1)*HALF],1,0,along(x)*.9,.012,.26*edgeFade(x),0,rand()<.4?0:2);}
for(let i=0;i<1800;i++){const x=PATH[0]+(i>>1)/900*(PATH[1]-PATH[0]);put([x,FLOOR,i%2?HALF:-HALF],1,0,along(x)*.9,.014,.75*edgeFade(x));}
for(let i=0;i<620;i++){const x=PATH[0]+rand()*(PATH[1]-PATH[0]);put([x,FLOOR-rand()*.12,rand()<.5?HALF:-HALF],1,0,along(x)*.9,.009,.18*edgeFade(x),0,4);}
// 2 floor: a quiet plaza grid around the path.
for(let x=-5;x<=5.5;x+=.25)for(let z=-3.6;z<=3;z+=.25){if(Math.abs(z)<HALF+.1)continue;const fade=Math.max(0,1-Math.hypot(x*.72,z)/4.8);if(fade>0)put([x,FLOOR,z],2,0,along(x)*.8+Math.abs(z)*.04,.011,.11*fade);}
// 3 gateways: outer and inner arches, front and back, a glass body and a soft bloom. 9 floor pools.
function gateway(i){const x0=gateX(i),key=i*.1;
 const at=(z,y,d,s,a,c=1)=>put([x0+d,FLOOR+y,z],3,i,key,s,a,0,c);
 for(const r of[GATE_R,GATE_R-.08])for(const d of[-.045,.045]){for(let y=0;y<=GATE_H;y+=.012){at(-r,y,d,.02,.5);at(r,y,d,.02,.5);}const n=Math.round(Math.PI*r/.012);for(let k=1;k<n;k++){const q=Math.PI*k/n;at(-Math.cos(q)*r,GATE_H+Math.sin(q)*r,d,.02,.5);}}
 const onArch=r=>{const len=2*GATE_H+Math.PI*r,m=rand()*len;if(m<GATE_H)return[-r,m];if(m<GATE_H+Math.PI*r){const q=(m-GATE_H)/r;return[-Math.cos(q)*r,GATE_H+Math.sin(q)*r];}return[r,m-GATE_H-Math.PI*r];};
 for(let k=0;k<90;k++){const[z,y]=onArch(GATE_R-.08+rand()*.08);at(z,y,(rand()*2-1)*.045,.011,.15);}
 for(let k=0;k<240;k++){const[z,y]=onArch(GATE_R-.04);at(z,y,0,.24,.014);}
 for(let k=0;k<260;k++){const a=rand()*Math.PI*2,r=Math.pow(rand(),.7)*.8;put([x0+Math.cos(a)*r*.75,FLOOR+.005,Math.sin(a)*r],9,i,key,.07+rand()*.06,.05*(1-r/.85),0,3);}
 // A stem rising from the arch toward the illustration above it.
 for(let y=apex(i)[1]+.06;y<VY-.47*VS;y+=.012)put([x0,y,0],11,i,0,.011,.42,0,0);
}
for(let i=0;i<N;i++)gateway(i);
// 4 theme columns: fluted shafts with base and capital rings; the key is the height fraction, so they rise.
function column(c){const x0=COLX[c],H=COL_TOP-FLOOR,at=(p,s,a,col=0)=>put(p,4,c,(p[1]-FLOOR)/H,s,a,0,col);
 for(let f=0;f<16;f++){const q=f/16*Math.PI*2;for(let y=FLOOR+.2;y<=COL_TOP-.18;y+=.016)at([x0+Math.cos(q)*COL_R,y,COLZ+Math.sin(q)*COL_R],.0125,.3);}
 for(const[y,r]of[[FLOOR+.04,.31],[FLOOR+.1,.27],[FLOOR+.17,.23],[COL_TOP-.15,.23],[COL_TOP-.09,.27],[COL_TOP-.03,.31]])for(let k=0;k<96;k++){const q=k/96*Math.PI*2;at([x0+Math.cos(q)*r,y,COLZ+Math.sin(q)*r],.012,.58);}
 for(let y=FLOOR+.2;y<COL_TOP-.15;y+=.07)at([x0,y,COLZ],.3,.018,1);
}
for(let c=0;c<THEMES.length;c++)column(c);
// 5 lintel: one institutional objective, drawn outward from its centre.
const LW=2.85;
for(let x=-LW;x<=LW;x+=.012)for(const[y,z]of[[COL_TOP,COLZ+.33],[COL_TOP+.17,COLZ+.33],[COL_TOP,COLZ-.33],[COL_TOP+.17,COLZ-.33]])put([x,y,z],5,0,Math.abs(x)/LW,.013,.55);
for(let i=0;i<1100;i++){const x=(rand()*2-1)*LW;put([x,COL_TOP+rand()*.17,COLZ+.33],5,0,Math.abs(x)/LW,.01,.12);}
for(let i=0;i<180;i++){const x=(rand()*2-1)*(LW-.15);put([x,COL_TOP+.085,COLZ+.33],5,0,Math.abs(x)/LW,.22,.016,0,1);}
// 6 beams from each theme to the stages it touches (key 0 at the column, 1 at the gateway). 7 attachment nodes.
LINKS.forEach((_,k)=>{for(let j=0;j<=160;j++)put(beamPoint(k,j/160),6,k,j/160,.0115,.5);for(let j=0;j<=60;j++)put(beamPoint(k,j/60),6,k,j/60,.13,.018,0,3);});
for(let c=0;c<THEMES.length;c++){put(anchor(c),7,c,1,.17,.5,1,0);put(anchor(c),7,c,1,.06,.8,0,2);}
// 8 candidates walking the journey.
const WALKERS=16;for(let i=0;i<WALKERS;i++)put([PATH[0]+rand()*(PATH[1]-PATH[0]),(rand()*2-1)*.24,.17],8,i,0,.36,.78,3,2);
// 0 atmosphere.
for(let i=0;i<340;i++){const big=rand()<.07;put([-5.5+rand()*12,-1+rand()*4.6,-6+rand()*9],0,0,0,big?.08+rand()*.1:.008+rand()*.024,big?.025+rand()*.025:.05+rand()*.17,0,rand()<.7?0:1);}

/* 10 activity illustrations, one per stage, drawn in a camera-facing plane above each gateway.
   Local units: x right, y up, about 1.5 by 0.9. z holds the animation role: 0 still, 1 a wave that
   travels outward (key = distance), 2 travel along x (key = distance, shared seed moves a glyph as one),
   3 appear in order and reset (key = order), 4 a pulse sweeping a chain (key = position). */
function art(i){
 const pt=(x,y,o={})=>put([x,y,o.role||0],10,i,o.key||0,o.size||.0105,(o.alpha??.8)*(o.shape===0||o.shape===3?1:.95),o.shape??2,o.color??0,o.seed??rand()*100);
 const line=(x0,y0,x1,y1,o={})=>{const n=Math.max(1,Math.round(Math.hypot(x1-x0,y1-y0)/(o.step||.0052)));for(let k=0;k<=n;k++){const t=k/n;pt(x0+(x1-x0)*t,y0+(y1-y0)*t,o.keyAt?{...o,key:o.keyAt(t)}:o);}};
 const rect=(x,y,w,h,o)=>{line(x,y,x+w,y,o);line(x+w,y,x+w,y+h,o);line(x+w,y+h,x,y+h,o);line(x,y+h,x,y,o);};
 const arc=(cx,cy,r,a0,a1,o={})=>{const n=Math.max(2,Math.round(r*Math.abs(a1-a0)/(o.step||.0052)));for(let k=0;k<=n;k++){const a=a0+(a1-a0)*k/n;pt(cx+Math.cos(a)*r,cy+Math.sin(a)*r,o);}};
 const fill=(x,y,w,h,count,o)=>{for(let k=0;k<count;k++)pt(x+rand()*w,y+rand()*h,{shape:0,...o});};
 // A frosted glass panel: a soft even fill under a crisp outline.
 const glass=(x,y,w,h,o={})=>{for(let gx=x+.02;gx<x+w-.01;gx+=.032)for(let gy=y+.02;gy<y+h-.01;gy+=.032)pt(gx,gy,{size:.075,alpha:o.fillA??.035,shape:0,color:o.fill??1,role:o.role,key:o.key});rect(x,y,w,h,o);};
 const text=(x,y,l,o={})=>line(x,y,x+l,y,{size:.0078,alpha:.62,color:2,step:.0048,...o});
 const check=(cx,cy,s,o)=>{line(cx-.034*s,cy+.002*s,cx-.01*s,cy-.024*s,o);line(cx-.01*s,cy-.024*s,cx+.038*s,cy+.03*s,o);};
 const person=(x,y,s,o={})=>pt(x,y,{size:s*1.15,alpha:.9,shape:3,color:2,...o});
 const sheet=(x,y,o)=>{const seed=rand()*100;for(let gx=x+.012;gx<x+.05;gx+=.02)for(let gy=y+.012;gy<y+.066;gy+=.02)pt(gx,gy,{...o,seed,size:.04,alpha:.06,shape:0,color:1});rect(x,y,.05,.066,{size:.0085,...o,seed});line(x+.01,y+.045,x+.04,y+.045,{size:.007,...o,seed,alpha:(o.alpha||.6)*.6});line(x+.01,y+.025,x+.034,y+.025,{size:.007,...o,seed,alpha:(o.alpha||.6)*.6});};
 const ring=(cx,cy,r,o)=>arc(cx,cy,r,0,Math.PI*2,o);
 const qmark=(cx,cy,s,o)=>{const r=.034*s,c=[cx,cy+.04*s],a1=-Math.PI*.38,e=[c[0]+Math.cos(a1)*r,c[1]+Math.sin(a1)*r];arc(c[0],c[1],r,Math.PI*1.05,a1,o);line(e[0],e[1],cx,cy-.004*s,o);line(cx,cy-.004*s,cx,cy-.022*s,o);pt(cx,cy-.058*s,{...o,size:.026,shape:2});};
 if(i===0){// Announcement: an official notice whose updates travel out to candidates.
  glass(-.66,-.34,.46,.66,{color:2,alpha:.75,fillA:.045});fill(-.64,.2,.42,.1,160,{size:.016,alpha:.32,color:1});
  text(-.61,.11,.25,{alpha:.95,size:.011});
  [[.04,.36],[-.03,.32],[-.1,.36],[-.17,.24]].forEach(([y,l])=>text(-.61,y,l));
  pt(-.6,-.265,{size:.036,color:3,alpha:.95});text(-.56,-.265,.16,{color:3,alpha:.7});
  [.14,.25,.36,.47].forEach((r,k)=>arc(-.16,0,r,-.62,.62,{role:1,key:k/4,alpha:.55,size:.011,color:0}));
  [[.36,.24],[.5,.03],[.37,-.2],[.66,.28],[.67,-.15]].forEach(([x,y])=>person(x,y,.15,{role:1,key:Math.min(.99,Math.hypot(x+.16,y)/.9)}));
 }else if(i===1){// Application & eligibility: applications arrive, documents gather, a checklist is worked.
  for(let k=0;k<4;k++)sheet(-.86,-.1+k*.05-(k%2)*.02,{role:2,key:.34,alpha:.7,color:2});
  rect(-.44,-.3,.34,.48,{alpha:.25,color:0});rect(-.41,-.27,.34,.48,{alpha:.42,color:0});glass(-.38,-.24,.34,.48,{alpha:.8,color:2,fillA:.05});
  [.12,.05,-.02,-.09].forEach((y,k)=>text(-.34,y,[.24,.2,.24,.14][k]));
  fill(-.34,.15,.26,.045,70,{size:.014,alpha:.35,color:1});
  for(let k=0;k<5;k++)pt(-.01+k*.02,.0,{role:2,key:.11,size:.022,shape:2,color:0,alpha:.7,seed:k*7.31});
  glass(.12,-.3,.52,.6,{color:0,alpha:.55});
  [.18,.06,-.06,-.18].forEach((y,r)=>{rect(.17,y-.03,.06,.06,{alpha:.7,color:0,size:.009});text(.28,y,[.3,.24,.28,.2][r]);check(.2,y,1,{role:3,key:.12+r*.18,color:3,size:.0125,alpha:1});});
 }else if(i===2){// Examination development: develop, review, approve, prepare, secure.
  const X=[-.56,-.28,0,.28,.56],Y=.05,o={color:2,alpha:.95,size:.0105};
  X.forEach((x,k)=>{ring(x,Y,.09,{role:4,key:k/5+.02,alpha:.65,color:0});for(let j=0;j<40;j++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*.085;pt(x+Math.cos(a)*r,Y+Math.sin(a)*r,{size:.06,alpha:.035,shape:0,color:1});}});
  for(let k=0;k<4;k++)line(X[k]+.09,Y,X[k+1]-.09,Y,{role:4,keyAt:t=>(k+.5+t*.5)/5,alpha:.4,color:0});
  line(-.59,.02,-.53,.08,o);line(-.53,.08,-.52,.07,o);line(-.59,.02,-.6,.01,o);
  ring(-.29,Y+.012,.026,o);line(-.272,Y-.006,-.252,Y-.026,o);
  check(0,Y,1.3,{...o,color:3});
  rect(.255,Y-.035,.05,.07,o);line(.265,Y+.01,.295,Y+.01,o);line(.265,Y-.008,.29,Y-.008,o);
  const sh=[[0,.045],[.034,.03],[.034,-.002],[0,-.042],[-.034,-.002],[-.034,.03],[0,.045]];for(let k=0;k<6;k++)line(.56+sh[k][0],Y+sh[k][1],.56+sh[k+1][0],Y+sh[k+1][1],o);
  [-.56,-.28,0].forEach(x=>person(x,.31,.13,{alpha:.7,color:0}));
 }else if(i===3){// Examination administration: check-in and identification, then seating under supervision.
  glass(-.76,-.17,.32,.09,{color:0,alpha:.7});glass(-.69,-.065,.09,.055,{color:3,alpha:.9,size:.009,fill:3,fillA:.06});text(-.675,-.04,.05,{color:3,alpha:.8,size:.007});
  person(-.53,.06,.15,{color:0,alpha:.8});
  for(let k=0;k<3;k++)person(-1.06,-.3,.14,{role:2,key:.32,seed:k*13.7,alpha:.85});
  for(let k=0;k<5;k++)pt(-.41+k*.03,-.12,{role:2,key:.15,size:.022,color:0,alpha:.7,seed:k*5.9});
  glass(-.27,-.32,.98,.68,{color:0,alpha:.4,fillA:.025});
  for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=-.13+c*.21,y=.2-r*.2;glass(x-.07,y-.075,.14,.035,{color:0,alpha:.6,size:.008,fillA:.05});person(x,y,.135,{role:3,key:.08+(r*4+c)/12*.72});}
  person(.62,.08,.16,{color:3,alpha:.95});
 }else if(i===4){// Evaluation & verification: marking, verification and approval in sequence.
  line(-.76,0,.76,0,{alpha:.22,color:0});
  [-.4,0,.4].forEach((x,k)=>{ring(x,0,.105,{alpha:k===2?.85:.6,color:k===2?3:0});for(let j=0;j<46;j++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*.1;pt(x+Math.cos(a)*r,Math.sin(a)*r,{size:.06,alpha:.035,shape:0,color:k===2?3:1});}});
  const o={color:2,alpha:.95,size:.0105};
  line(-.44,.03,-.4,.03,o);line(-.44,0,-.38,0,o);line(-.44,-.03,-.41,-.03,o);check(-.355,0,.55,{...o,color:3});
  ring(-.01,.012,.03,o);line(.012,-.01,.035,-.033,o);
  check(.4,0,1.4,{...o,color:3});
  for(let k=0;k<4;k++)sheet(-.82,-.033,{role:2,key:1.5,alpha:.65,color:2});
 }else if(i===5){// Results & communication: approval, then publication through the official portal.
  ring(-.42,.04,.15,{color:3,alpha:.8});ring(-.42,.04,.112,{color:3,alpha:.35});for(let k=0;k<28;k++){const a=k/28*Math.PI*2;pt(-.42+Math.cos(a)*.185,.04+Math.sin(a)*.185,{size:.016,color:3,alpha:.6});}
  for(let j=0;j<60;j++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*.14;pt(-.42+Math.cos(a)*r,.04+Math.sin(a)*r,{size:.07,alpha:.03,shape:0,color:3});}
  check(-.42,.04,1.9,{color:3,alpha:1,size:.013});
  for(let k=0;k<5;k++)pt(-.23+k*.03,.04,{role:2,key:.13,size:.02,shape:2,color:0,alpha:.65,seed:k*3.3});
  glass(.02,-.28,.62,.6,{color:0,alpha:.6});line(.02,.24,.64,.24,{color:0,alpha:.45});
  [.05,.08,.11].forEach(x=>pt(x,.282,{size:.018,shape:2,color:0,alpha:.6}));
  rect(.06,.12,.3,.055,{color:2,alpha:.55,size:.0085});pt(.33,.1475,{size:.024,shape:1,color:2,alpha:.8});
  [.03,-.05,-.13,-.21].forEach((y,r)=>{text(.06,y,.1);text(.21,y,.29,{color:0,alpha:.4});pt(.57,y,{role:3,key:.15+r*.17,size:.026,shape:2,color:3,alpha:.9});});
 }else{// Post-examination analysis: one result, and the questions a total score alone leaves open.
  arc(-.3,.02,.26,Math.PI/2-Math.PI*2*.74-.06,-Math.PI*1.5+.06,{color:0,alpha:.35,size:.009});
  arc(-.3,.02,.26,Math.PI/2,Math.PI/2-Math.PI*2*.74,{color:3,alpha:.9,size:.017,step:.0065});
  for(let j=0;j<90;j++){const a=rand()*Math.PI*2,r=Math.sqrt(rand())*.23;pt(-.3+Math.cos(a)*r,.02+Math.sin(a)*r,{size:.08,alpha:.025,shape:0,color:1});}
  [[.17,.22,1.1],[.45,.13,1.25],[.22,-.16,1],[.52,-.22,1.15]].forEach(([x,y,s],k)=>{qmark(x,y,s,{role:1,key:.15+k*.2,color:2,alpha:.85,size:.0115});line(-.02,.02,x-.06,y,{alpha:.18,color:0,size:.007,step:.016});});
 }
}
const VIG0=raw.length/STRIDE;
for(let i=0;i<N;i++)art(i);
const data=new Float32Array(raw),total=data.length/STRIDE;

const VS_POINTS=`precision highp float;
attribute vec3 aP;attribute vec4 aK;attribute vec4 aS;
uniform mat4 uProj,uView;uniform vec2 uShift;uniform vec3 uCamR,uCamU;uniform float uPx,uTime,uMirror,uFloor,uPath,uPress,uActive;uniform vec4 uReveal;uniform float uGate[7],uVig[7],uCol[5];
varying vec4 vC;varying float vS,vP;
float hash(float n){return fract(sin(n*12.9898)*43758.5453);}
vec3 pal(float i){if(i<.5)return vec3(.765,.776,1.);if(i<1.5)return vec3(.36,.43,1.);if(i<2.5)return vec3(.96,.965,.98);if(i<3.5)return vec3(.8,.937,.678);return vec3(.204,.271,.922);}
void main(){
 float kind=aK.x,key=aK.z,seed=aK.w;int idx=int(aK.y+.5);
 vec3 p=aP,col=pal(aS.w);float a=aS.y,size=aS.x,show=1.,shape=aS.z;vP=0.;
 if(kind<.5){p+=vec3(sin(uTime*.07+seed*9.)*.2,sin(uTime*.05+seed*5.)*.25,cos(uTime*.06+seed*7.)*.2);}
 else if(kind<2.5){show=smoothstep(key,key+.06,uPath)*(kind>1.5?1.-uMirror:1.);}
 else if(kind<3.5){float r=clamp((uReveal.x*1.6-key)/.6,0.,1.),h=uGate[idx];show=r;p.y-=(1.-r)*.3;a*=.55+h*1.6;size*=1.+h*.2;col=mix(col,vec3(.86,.97,.78),h*.7);}
 else if(kind<4.5){float h=uCol[idx],front=exp(-pow((key-uReveal.y)*22.,2.))*(1.-step(.999,uReveal.y)),band=exp(-pow((key-fract(uTime*.3+float(idx)*.2))*12.,2.))*h;show=step(key,uReveal.y);a=a*(.45+h*1.3)+front*.9+band*.6;col=mix(col,vec3(.93,.95,1.),h*.4+front);col=mix(col,pal(3.),band*.6);}
 else if(kind<5.5){show=step(key,uReveal.z);}
 else if(kind<6.5){show=step(key,uReveal.w);a*=1.1;col=mix(col,pal(3.),.7);}
 else if(kind<7.5){float h=uCol[idx];show=uReveal.y;a*=.35+h*1.3;col=mix(col,pal(3.),h*.6);}
 else if(kind<8.5){float x=mod(aP.x+4.3+uTime*(.13+.07*hash(seed)),8.8)-4.3;p=vec3(x,uFloor+aP.z+.006*abs(sin(uTime*3.2+aK.y*1.7)),aP.y);
  float f=0.;for(int i=0;i<7;i++){float d=x-(-3.+float(i));f=max(f,exp(-d*d*70.)*(.3+uGate[i]*.7));}
  a*=smoothstep(-4.3,-3.7,x)*smoothstep(4.5,3.9,x)*smoothstep(.6,1.,uPath);col=mix(col,pal(3.),f*.9);a=min(1.,a+f*.35);vP=sin(uTime*3.2+aK.y*1.7);}
 else if(kind<9.5){float h=uGate[idx];show=clamp((uReveal.x*1.6-key)/.6,0.,1.)*(1.-uMirror);a*=.15+h*2.6;col=mix(pal(1.),col,h);}
 else if(kind<10.5){
  float v=uVig[idx],role=aP.z,on=step(abs(float(idx)-uActive),.1),t=uTime*(1.+on*uPress*.9)+hash(float(idx))*10.;
  vec2 q=aP.xy;
  if(role>.5&&role<1.5){float d=fract(t*.32)-key;float w=exp(-d*d*70.);a*=.3+w*1.5;col=mix(col,pal(3.),w*.5);size*=1.+w*.25;}
  else if(role<2.5){float f=fract(t*(.12+.05*hash(seed))+hash(seed+9.));q.x+=f*key;a*=smoothstep(0.,.15,f)*smoothstep(1.,.8,f);}
  else if(role<3.5){float c=fract(t*.13);a*=smoothstep(key,key+.03,c)*(1.-smoothstep(.93,.99,c));}
  else if(role<4.5){float d=fract(t*.22)-key;float w=exp(-d*d*90.);a*=.45+w*1.6;col=mix(col,pal(3.),w*.8);}
  float e=clamp(v*1.5-hash(seed+3.)*.5,0.,1.);e=1.-pow(1.-e,3.);
  q+=normalize(vec2(hash(seed+1.),hash(seed+2.))-.5+.0001)*(1.-e)*(.25+.45*hash(seed+4.));
  q*=${VS.toFixed(3)};p=vec3(-3.+float(idx),${VY.toFixed(3)},0.)+uCamR*q.x+uCamU*q.y;a*=e*(1.-uMirror);show=step(.002,v);
  if(shape>2.5)vP=role>1.5&&role<2.5?sin(t*3.2+seed):0.;
 }
 else{float v=uVig[idx];show=v*(1.-uMirror);a*=v;}
 if(uMirror>.5){p.y=2.*uFloor-p.y;a*=.17*exp(-(uFloor-p.y)*1.3);}
 vec4 vv=uView*vec4(p,1.),c=uProj*vv;c.xy+=uShift*c.w;gl_Position=c;
 float px=size*uPx/c.w;a*=show*clamp(1.25-(c.w-11.)*.05,.35,1.);if(px<1.6){a*=px/1.6;px=1.6;}
 gl_PointSize=px;vC=vec4(col,clamp(a,0.,1.));vS=shape;
}`;

/* WebGL. */
let gl=null,program,attribs,PR,K,BG,pointBuf,sparkBuf,quadBuf,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);const img=$('.ct-fallback',slide);if(img){img.loading='eager';img.src=img.getAttribute('src');}stage.classList.add('is-fallback');slide.classList.add('ct-flat');}
function init(){
 try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  PR=program(VS_POINTS,FS_POINTS);K=program(VS_FLAT,FS_SPARK);BG=program(VS_BG,FS_BG);
  pointBuf=kit.buffer(data);sparkBuf=gl.createBuffer();quadBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;
 }catch(e){useFallback(e.message||e);}
}

/* Scene state (GSAP-animated), cameras and layout. */
const zeros=n=>Array.from({length:n},()=>0);
const S={gates:1,cols:0,lintel:0,beams:0,path:1,press:0,gate:zeros(N),vig:zeros(N),col:zeros(THEMES.length)};
const orbit=(t,a,r,ey)=>({ex:t[0]+Math.sin(a)*r,ey,ez:t[2]+Math.cos(a)*r,tx:t[0],ty:t[1],tz:t[2]});
const OVER=orbit([.1,.05,-.3],.62,13.4,2.55),FINAL=orbit([.15,.5,-.9],.24,15.2,2.75),START=orbit([-1.4,-.2,-.1],.5,10.5,1.6);
const stageView=i=>orbit([gateX(i)+.1,.38,0],.6,8.8,1.62);
const cam={...OVER},look={x:0,y:0,tx:0,ty:0};
let active=false,motion=true,played=false,current=0,shownStage=-1,time=0,last=0,raf=0,tl=null,textTl=null,panelTl=null,layout={shift:[.36,.02],fov:.5,flat:false},sparks=new Float32Array(96*8),frames=0;
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),flat=innerWidth<=900||stage.classList.contains('is-fallback');
 slide.classList.toggle('ct-flat',flat);layout=flat?{shift:[0,-.02],fov:aspect<.8?.8:.56,flat}:{shift:[aspect<1.45?.4:.38*Math.min(1,aspect/1.6),.1],fov:aspect<1.45?.6:.5,flat};return aspect;}
function project(vp,p){const c=M.apply(vp,p);return[((c[0]/c[3]+layout.shift[0])+1)/2*canvas.clientWidth,(1-(c[1]/c[3]+layout.shift[1]))/2*canvas.clientHeight,c[3]];}
const clamp01=v=>Math.max(0,Math.min(1,v));

function render(){
 if(!ready)return;frames++;
 const aspect=measure(),W=canvas.width,H=canvas.height;gl.viewport(0,0,W,H);
 const eye=[cam.ex+look.x*.6,cam.ey+look.y*.3,cam.ez],target=[cam.tx,cam.ty,cam.tz];
 const proj=M.perspective(layout.fov,aspect,.1,80),viewM=M.lookAt(eye,target,[0,1,0]),vp=M.mul(proj,viewM),px=(H/2)/Math.tan(layout.fov/2);
 const camR=[viewM[0],viewM[4],viewM[8]],camU=[viewM[1],viewM[5],viewM[9]];
 // Sparks run from each theme down its beams once the themes stand.
 let n=0;const spark=(p,size,c,a)=>{if(n<96){sparks.set([...p,...c,a,size],n*8);n++;}};
 if(S.beams>.99)LINKS.forEach((_,k)=>{for(let j=0;j<2;j++){const t=(time*.3+j/2+k*.17)%1;spark(beamPoint(k,t),.06,[.8,.94,.68],Math.sin(Math.PI*t)*.85);}});
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,quadBuf,[['aP',2,0]],2);
 const vigOn=Math.max(...S.vig),glow=project(vp,[cam.tx,cam.ty-.15*vigOn,cam.tz]);gl.uniform2f(BG.u.uRes,W,H);gl.uniform2f(BG.u.uGlow,glow[0]/canvas.clientWidth,1-glow[1]/canvas.clientHeight);gl.uniform2f(BG.u.uVig,.6,.5);gl.uniform1f(BG.u.uGlowA,.7+.3*S.cols-.25*vigOn);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
 const hot=S.gate.indexOf(Math.max(...S.gate));
 for(const mirror of[1,0]){
  gl.useProgram(PR.p);attribs(PR,pointBuf,[['aP',3,0],['aK',4,3],['aS',4,7]],STRIDE);const u=PR.u;
  gl.uniformMatrix4fv(u.uProj,false,proj);gl.uniformMatrix4fv(u.uView,false,viewM);gl.uniform2f(u.uShift,...layout.shift);gl.uniform3f(u.uCamR,...camR);gl.uniform3f(u.uCamU,...camU);
  gl.uniform1f(u.uPx,px);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uMirror,mirror);gl.uniform1f(u.uFloor,FLOOR);gl.uniform1f(u.uPath,S.path);gl.uniform1f(u.uPress,S.press);gl.uniform1f(u.uActive,S.gate[hot]>.5?hot:-9);
  gl.uniform4f(u.uReveal,S.gates,S.cols,S.lintel,S.beams);gl.uniform1fv(u.uGate,S.gate);gl.uniform1fv(u.uVig,S.vig);gl.uniform1fv(u.uCol,S.col);
  // The illustrations composite 'over' rather than additively, so lime and paper keep their colour.
  gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.POINTS,0,VIG0);
  if(!mirror&&S.vig.some(v=>v>0)){gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.POINTS,VIG0,total-VIG0);gl.blendFunc(gl.ONE,gl.ONE);}
  if(n){gl.useProgram(K.p);gl.bindBuffer(gl.ARRAY_BUFFER,sparkBuf);gl.bufferData(gl.ARRAY_BUFFER,sparks.subarray(0,n*8),gl.DYNAMIC_DRAW);attribs(K,sparkBuf,[['aP',3,0],['aC',4,3],['aS',1,7]],8);
   gl.uniformMatrix4fv(K.u.uProj,false,proj);gl.uniformMatrix4fv(K.u.uView,false,viewM);gl.uniformMatrix4fv(K.u.uWorld,false,M.translate(0,0,0));gl.uniform2f(K.u.uShift,...layout.shift);
   gl.uniform1f(K.u.uPx,px);gl.uniform1f(K.u.uVis,1);gl.uniform2f(K.u.uFog,12,.05);gl.uniform1f(K.u.uMirror,mirror);gl.uniform1f(K.u.uFloor,FLOOR);gl.drawArrays(gl.POINTS,0,n);}
 }
 place(vp,camR,camU);
}
/* HTML labels follow their 3D anchors; styles are written only when they change. */
function setTag(el,x,y,o,origin){const vis=o>.02,key=vis?`${x.toFixed(1)},${y.toFixed(1)},${o.toFixed(2)}`:'';if(el._k===key)return;el._k=key;el.style.visibility=vis?'visible':'hidden';if(!vis)return;el.style.opacity=String(o);el.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) ${origin}`;}
function place(vp,camR,camU){
 const tagsOn=!layout.flat;
 themeTags.forEach((t,c)=>{const[x,y]=project(vp,[COLX[c],1.02,COLZ+COL_R+.06]);setTag(t,x,y,tagsOn?clamp01((S.cols-.7)*3.3):0,'translate(-50%,-50%)');});
 if(lintelTag){const[x,y]=project(vp,[0,COL_TOP+.34,COLZ]);setTag(lintelTag,x,y,tagsOn?clamp01((S.lintel-.5)*2):0,'translate(-50%,-100%)');}
 for(const l of labels){const lx=l.x*VS,ly=l.y*VS,w=[gateX(l.i)+camR[0]*lx+camU[0]*ly,VY+camR[1]*lx+camU[1]*ly,camR[2]*lx+camU[2]*ly],[x,y]=project(vp,w);setTag(l.el,x,y,clamp01((S.vig[l.i]-.55)*2.4),'translate(-50%,-50%)');}
}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;look.x+=(look.tx-look.x)*Math.min(1,dt*2.2);look.y+=(look.ty-look.y)*Math.min(1,dt*2.2);render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps: 0 the whole journey, then each stage's practice and pressure, then the five themes. */
const viewOf=n=>n<=0?{v:'overview',i:-1}:n>=LAST?{v:'final',i:-1}:{v:(n-1)&1?'pressure':'practice',i:(n-1)>>1};
function targets(n){const{v,i}=viewOf(n),fin=v==='final';
 return{gate:S.gate.map((_,k)=>k===i?1:fin?.45:0),vig:S.vig.map((_,k)=>k===i?1:0),col:S.col.map(()=>fin?1:0),cols:fin?1:0,lintel:fin?1:0,beams:fin?1:0,press:v==='pressure'?1:0,cam:i>=0?stageView(i):fin?FINAL:OVER};}
function write(i){if(i<0)return;const s=STAGES[i];shownStage=i;P.count.textContent=pad(i+1);P.name.textContent=s.name;P.text.textContent=s.practice;P.onlineText.textContent=s.online||'';P.online.classList.toggle('is-empty',!s.online);
 P.label.textContent=s.label;P.q.textContent=s.question;P.opp.textContent=s.opportunity;}
function chrome(n){const{v,i}=viewOf(n);slide.dataset.view=v;slide.dataset.stage=String(i+1);
 nodes.forEach((b,k)=>{b.setAttribute('aria-pressed',String(k===i));b.classList.toggle('is-done',i>=0&&k<i);});
 rail.classList.toggle('is-idle',i<0&&v!=='final');rail.classList.toggle('is-all',v==='final');rail.style.setProperty('--jr-p',String(v==='final'?1:i<0?0:i/(N-1)));}
function go(n,animate=motion){n=Math.max(0,Math.min(LAST,Math.round(n)));if(n===current&&!tl)return;const before=viewOf(current),after=viewOf(n);current=n;tl?.progress(1);tl=null;
 const T=targets(n);chrome(n);
 if(!g||!animate||!ready){Object.assign(S,{cols:T.cols,lintel:T.lintel,beams:T.beams,press:T.press});S.gate=T.gate;S.vig=T.vig;S.col=T.col;Object.assign(cam,T.cam);write(after.i);render();return;}
 const arr=(a,b,o)=>g.to(a,{...Object.fromEntries(b.map((v,k)=>[k,v])),overwrite:true,...o});
 const leavingFinal=before.v==='final',enteringFinal=after.v==='final',moving=after.i!==before.i;
 arr(S.gate,T.gate,{duration:.8,ease:'power2.out'});arr(S.col,T.col,{duration:.8,ease:'power2.out'});
 // The old illustration disperses first; the new one assembles as the camera arrives.
 S.vig.forEach((v,k)=>{if(T.vig[k]<v)g.to(S.vig,{[k]:0,duration:.45,ease:'power2.in',overwrite:'auto'});});
 if(after.i>=0&&S.vig[after.i]<1)g.to(S.vig,{[after.i]:1,duration:1.2,ease:'power2.out',delay:moving?.5:0,overwrite:'auto'});
 g.to(S,{press:T.press,duration:.8,ease:'power2.inOut',overwrite:'auto'});
 g.to(cam,{...T.cam,duration:enteringFinal||leavingFinal?2:1.5,ease:'power3.inOut',overwrite:true});
 if(enteringFinal)g.timeline().to(S,{cols:1,duration:1.6,ease:'power2.out'},.6).to(S,{lintel:1,duration:1,ease:'power2.inOut'},1.5).to(S,{beams:1,duration:1.1,ease:'power2.inOut'},1.9);
 else if(leavingFinal)g.to(S,{cols:0,lintel:0,beams:0,duration:.6,ease:'power2.in',overwrite:'auto'});
 // Panel: a stage change swaps the copy; practice to pressure is handled by the view attribute.
 if(after.i>=0&&after.i!==shownStage){const parts=$$('.ct-count,.ct-name,.ct-practice,.ct-q,.ct-opp,.ct-pressure small',slide),dir=after.i>before.i?1:-1;
  panelTl?.progress(1);
  if(before.i<0){write(after.i);panelTl=g.fromTo(parts,{opacity:0,y:12},{opacity:1,y:0,duration:.6,ease:'power3.out',stagger:.04,clearProps:'opacity,transform'});}
  else panelTl=g.timeline().to(parts,{opacity:0,y:-8*dir,duration:.2,ease:'power2.in',stagger:.02}).add(()=>write(after.i)).fromTo(parts,{opacity:0,y:12*dir},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.04,clearProps:'opacity,transform'});}
}
function intro(){
 Object.assign(S,{gates:0,cols:0,lintel:0,beams:0,path:0,press:0});S.gate=zeros(N);S.vig=zeros(N);S.col=zeros(THEMES.length);Object.assign(cam,START);current=0;chrome(0);
 tl=g.timeline()
  .to(S,{path:1,duration:2.2,ease:'power2.inOut'},.2)
  .to(S,{gates:1,duration:2,ease:'power2.out'},.55)
  .to(cam,{...OVER,duration:3.4,ease:'power2.inOut'},.1);
}
function text(full){textTl?.kill();if(!g||!motion){settleText();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.ct-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.ct-line>span'),{yPercent:112},{yPercent:0,duration:1.2,stagger:.1,ease:'power4.out'},full?.2:.05)
  .fromTo(q('.ct-sub'),{opacity:0,y:12},{opacity:1,y:0,duration:.9},full?.9:.25)
  .fromTo(q('.jr-line'),{scaleX:0,transformOrigin:'0 50%'},{scaleX:1,duration:1.6,ease:'power2.inOut'},full?.6:.1)
  .fromTo(q('.jr li'),{opacity:0,y:10},{opacity:1,y:0,duration:.7,stagger:.12},full?.8:.15)
  .fromTo(q('.ct-panel,.ct-foot'),{opacity:0},{opacity:1,duration:.9},full?2:.4);
}
function settleText(){textTl?.kill();textTl=null;if(g)g.set($$('.ct-kicker,.ct-line>span,.ct-sub,.jr-line,.jr li,.ct-panel,.ct-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}panelTl?.progress(1);const T=targets(current);Object.assign(S,{gates:1,path:1,cols:T.cols,lintel:T.lintel,beams:T.beams,press:T.press});S.gate=T.gate;S.vig=T.vig;S.col=T.col;Object.assign(cam,T.cam);chrome(current);write(viewOf(current).i);}

/* Controls. */
const stageOf=()=>viewOf(current).i;
nodes.forEach((b,i)=>b.addEventListener('click',()=>{const n=1+2*i;go(current===n?n+1:n);}));
P.prev.addEventListener('click',()=>{const i=stageOf();go(i<=0?0:1+2*(i-1));});
P.next.addEventListener('click',()=>{const i=stageOf();go(i>=N-1?LAST:1+2*(i+1));});
$('.ct-back',slide).addEventListener('click',()=>go(0));
$('.ct-reveal',slide).addEventListener('click',()=>{const i=stageOf();if(i>=0)go(2+2*i);});
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||layout.flat||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});
addEventListener('pointermove',e=>{if(!active||layout.flat)return;look.tx=(e.clientX/innerWidth-.5);look.ty=-(e.clientY/innerHeight-.5);},{passive:true});
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);
chrome(0);

window.ELMY_CONTINUUM={
 id:'institution',keys:['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}render();start();},
 mode(on){motion=on;if(!on){finish();settleText();stop();look.tx=look.ty=look.x=look.y=0;render();}else start();},
 key(k){if(['ArrowDown','PageDown'].includes(k))go(current+1);else if(['ArrowUp','PageUp'].includes(k))go(current-1);else if(k==='Home')go(0);else if(k==='End')go(LAST);},
 go,
 debug:{S,cam,render,at(t){if(!tl||!tl.paused()){intro();text(true);}tl.pause().time(t);textTl?.pause().time(t);time=t;render();},seek(o={}){if(o.time!==undefined)time=o.time;render();},get state(){return{current,view:viewOf(current),ready,frames,particles:total,canvas:[canvas.width,canvas.height],failure:canvas.dataset.failure||null};}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_CONTINUUM);
init();
})();

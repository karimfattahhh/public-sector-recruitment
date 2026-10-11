/* Intelligence scene: one examination score; then the competency profile of a candidate, shown
   separately from the score; then that profile pulls back into a synthetic cohort of 160 whose
   glyphs regroup by their strongest dimension. Everything is drawn analytically in 2D fragment
   shaders in CSS pixels, so the HTML labels sit exactly on the drawing. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="intelligence"]');if(!slide||!window.ELMY_LIGHT)return;
const{rng}=window.ELMY_LIGHT,g=window.gsap,rand=rng(707);
const DATA=JSON.parse($('.ig-data',slide).textContent),VIEWS=DATA.views,HERO=DATA.dims.map(d=>d[1]/100);
const canvas=$('.ig-canvas',slide),tabs=$$('.ig-tab',slide),next=$('.ig-next',slide),nextLabel=$('.ig-next span',slide);
const el={num:$('.ig-num',slide),count:$('.ig-count',slide),pill:$('.ig-pill',slide),petals:$$('.ig-petal',slide),tag:$('.ig-tag',slide),caption:$('.ig-caption',slide),base:$('.ig-base',slide),counts:$$('.ig-colcount',slide),names:$$('.ig-colname',slide)};
const panel={step:$('.ig-step',slide),name:$('.ig-name',slide),title:$('.ig-detail h3',slide),text:$('.ig-text',slide)};
const pad=n=>String(n).padStart(2,'0'),mix=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

/* Synthetic cohort. The presented profile is one of the 160; the rest are seeded, illustrative values. */
const COLS=16,ROWS=10,N=COLS*ROWS,HERO_SLOT=4*COLS+7,PER=5;
const MEANS=[.74,.71,.715,.67];
const gauss=()=>{let u=0,v=0;while(!u)u=rand();while(!v)v=rand();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);};
const cohort=Array.from({length:N},(_,i)=>{const vals=i===HERO_SLOT?HERO.slice():MEANS.map(m=>clamp(m+gauss()*.1,.36,.97));let strong=0;vals.forEach((v,k)=>{if(v>vals[strong])strong=k;});return{vals,strong,delay:rand()};});
const COUNTS=[0,1,2,3].map(k=>cohort.filter(c=>c.strong===k).length);
// Within each column, glyphs fill from the left of the field so their flights cross as little as possible.
const order=cohort.map((c,i)=>i).sort((a,b)=>(a%COLS)-(b%COLS)||Math.floor(a/COLS)-Math.floor(b/COLS)),slotOf=new Array(N),fillCount=[0,0,0,0];
order.forEach(i=>{slotOf[i]=fillCount[cohort[i].strong]++;});
el.counts.forEach((c,k)=>c.textContent=COUNTS[k]);

/* Shaders. Positions arrive in CSS pixels (y down); local drawing space is pixels with y up. */
const AA=ext=>ext?'#extension GL_OES_standard_derivatives : enable\n':'';
const AAF=ext=>ext?'float aa(float d){return max(fwidth(d),.0001);}':'uniform float uDpr;float aa(float d){return .75/uDpr;}';
const PETALS=`
float sdPie(vec2 p,vec2 c,float r){p.x=abs(p.x);float l=length(p)-r;float m=length(p-c*clamp(dot(p,c),0.,r));return max(l,m*sign(c.y*p.x-c.x*p.y));}
// Four sectors on the diagonals: 0 top right, 1 bottom right, 2 bottom left, 3 top left.
vec4 petals(vec2 p,float R,vec4 v,float strong,float se,float shine){
 vec4 acc=vec4(0.);float rl=length(p),big=smoothstep(26.,90.,R),lw=mix(.6,.75,big);
 for(int k=0;k<4;k++){
  float th=.785398-float(k)*1.570796;vec2 ax=vec2(cos(th),sin(th));
  float gap=R*.045,rr=v[k]*R-gap;if(rr<.5)continue;
  vec2 q=vec2(dot(p,vec2(-ax.y,ax.x)),dot(p,ax)-gap);
  float rnd=min(rr*.06,2.5),d=sdPie(q,vec2(.5807,.8141),rr-rnd)-rnd,w=aa(d);
  float inside=1.-smoothstep(-w,w,d);if(inside<.001)continue;
  float isS=1.-step(.5,abs(float(k)-strong));
  // Small glyphs read as solid petals; the large profile is drawn as an instrument: light fill,
  // contour lines every 7px, crisp sides and a bold arc at the value.
  float side=1.-smoothstep(lw-w,lw+w,-d),ql=length(q);
  float arcW=mix(1.2,2.6,big),arc=inside*(1.-smoothstep(arcW-w,arcW+w,rr-ql))*step(.5,q.y);
  float cw=aa(ql),contour=(1.-smoothstep(.35,.35+cw*1.5,abs(fract(ql/7.)-.5)*7.))*big*step(ql,rr-arcW-1.5);
  vec3 deep=vec3(.204,.271,.922)*(1.+shine),soft=mix(vec3(.62,.66,1.),deep,smoothstep(.15*R,R,rl));
  float fillA=mix(.85,.13,big)+contour*.3;
  vec3 col=mix(soft,deep,contour);float a=inside*fillA;
  float line=max(side*mix(.75,.9,big),arc);col=mix(col,mix(vec3(.11,.16,.68),deep,arc),line);a=mix(a,inside,line);
  float tip=(1.-smoothstep(-w,w,length(q-vec2(0.,rr))-max(2.4,R*.017)))*big;
  col=mix(col,vec3(.063,.086,.169),tip);a=max(a,tip);
  // Sorted tokens: white petals on a cobalt disc, the strongest dimension in lime.
  col=mix(col,mix(vec3(.86,.88,1.),vec3(.8,.937,.678),isS),se);a=mix(a,inside*mix(.3,1.,isS),se);
  acc+=vec4(col*a,a)*(1.-acc.a);}
 return acc;}`;
const VS_QUAD=`precision highp float;attribute vec2 aQ;uniform vec2 uRes,uC;uniform float uH;varying vec2 vP;
void main(){vec2 s=uC+aQ*uH;vP=vec2(aQ.x,-aQ.y)*uH;gl_Position=vec4(s.x/uRes.x*2.-1.,1.-s.y/uRes.y*2.,0.,1.);}`;
const FS_DIAL=ext=>`${AA(ext)}precision highp float;varying vec2 vP;uniform float uR,uDial,uFill,uTime,uMotion;${AAF(ext)}
float hair(float d,float w){float a=aa(d);return 1.-smoothstep(w-a,w+a,abs(d));}
void main(){
 float r=length(vP),t=fract(atan(vP.x,vP.y)/6.283185+1.),i=mod(floor(t*100.+.5),100.),ti=i/100.,da=t-ti;
 if(da>.5)da-=1.;if(da<-.5)da+=1.;da*=6.283185*r;
 float vis=smoothstep(ti-.04,ti,uDial*1.04),filled=clamp(uFill*100.-i,0.,1.),last=step(abs(i-73.),.5)*step(.735,uFill);
 float L=uR*.105*vis*(1.+last*.5),hw=max(.9,uR*.0085)*(1.+last*.3);
 float d=max(abs(da)-hw,abs(r-(uR-L*.5))-L*.5),w=aa(d),tick=(1.-smoothstep(-w,w,d))*step(.001,vis);
 vec3 on=mix(vec3(.45,.5,1.),vec3(.204,.271,.922),smoothstep(0.,.55,ti));
 float sweep=fract(ti-uTime*.06);on+=vec3(.16,.14,.05)*exp(-pow((sweep-.5)*16.,2.))*uMotion;
 vec3 col=mix(vec3(.855,.865,.93),on,filled);col=mix(col,vec3(.063,.086,.169),last);
 float a=tick*mix(.9,1.,filled);vec4 o=vec4(col*a,a);
 // Progress track inside the ticks, with a marker at the result.
 float ra=uR*.84,arcW=max(1.1,uR*.0072),along=(min(uFill,uDial)-t)*6.283185*ra,arc=hair(r-ra,arcW)*smoothstep(-.8,.8,along);
 float tf=min(uFill,uDial)*6.283185;vec2 endP=ra*vec2(sin(tf),cos(tf));float dotD=length(vP-endP)-max(3.2,uR*.02),cap=(1.-smoothstep(-aa(dotD),aa(dotD),dotD))*step(.02,uFill);
 vec3 arcC=mix(vec3(.45,.5,1.),vec3(.204,.271,.922),smoothstep(0.,.55,t));
 o+=vec4(arcC*arc,arc)*(1.-o.a);o=mix(o,vec4(vec3(.063,.086,.169),1.),cap*smoothstep(0.,.2,uDial));
 float rings=hair(r-uR*1.07,.5)*.2+hair(r-ra,.5)*.13*(1.-arc);rings*=smoothstep(0.,.3,uDial)*smoothstep(0.,1.,uDial);
 o+=vec4(vec3(.063,.086,.169)*rings,rings)*(1.-o.a);gl_FragColor=o;}`;
const FS_GUIDE=ext=>`${AA(ext)}precision highp float;varying vec2 vP;uniform float uR,uRings;${AAF(ext)}
float hair(float d,float w){float a=aa(d);return 1.-smoothstep(w-a,w+a,abs(d));}
void main(){float r=length(vP),a=0.;
 for(int k=1;k<=4;k++){float rr=uR*float(k)*.25*uRings;float h=hair(r-rr,.5);
  if(k==4)h*=step(.42,fract(atan(vP.y,vP.x)*rr/9.));a=max(a,h*(k==4?.3:.13));}
 float diag=min(abs(vP.x-vP.y),abs(vP.x+vP.y))*.7071;a=max(a,hair(diag,.45)*.11*(1.-smoothstep(uR*1.02*uRings,uR*1.1*uRings,r)));
 a*=uRings;gl_FragColor=vec4(vec3(.063,.086,.169)*a,a);}`;
// Glyphs: corner, grid slot, chart slot, four values, (strongest, ripple, sort delay, hero).
const VS_GLYPH=`precision highp float;attribute vec2 aQ,aGrid,aSort;attribute vec4 aV,aI;
uniform vec2 uRes,uFocus,uSlot;uniform vec4 uBox;uniform float uZ,uR1,uR2,uSort,uField,uHeroA,uGrow,uTime,uMotion;
varying vec2 vL;varying vec4 vV,vI;varying float vHero,vShine;
void main(){
 float se=clamp(uSort*1.5-aI.z*.5,0.,1.);se=se*se*(3.-2.*se);
 vec2 grid=uFocus+(aGrid-uSlot)*uZ,dir=aSort-grid;float len=length(dir);
 vec2 pos=mix(grid,aSort,se)+(len>1.?vec2(-dir.y,dir.x)/len:vec2(0.))*sin(3.14159*se)*min(len*.18,46.);
 float R=mix(uR1*uZ,uR2,se),hero=step(.5,aI.w);
 float app=clamp(uField*1.7-aI.y*.7,0.,1.);app=app*app*(3.-2.*app);
 float out_=max(max(uBox.x-pos.x,pos.x-uBox.x-uBox.z),max(uBox.y-pos.y,pos.y-uBox.y-uBox.w));
 float alpha=mix(app*(1.-smoothstep(-R*.75,4.,out_)),uHeroA,hero);R*=mix(mix(.35,1.,app),1.,hero);
 vec2 s=pos+aQ*R*1.32;gl_Position=vec4(s.x/uRes.x*2.-1.,1.-s.y/uRes.y*2.,0.,1.);
 vec4 grow=clamp(vec4(uGrow*1.6)-vec4(0.,.2,.4,.6),0.,1.);grow=grow*grow*(3.-2.*grow);
 vV=aV*mix(vec4(1.),grow,hero);vI=vec4(aI.x,se,alpha,R);vL=vec2(aQ.x,-aQ.y)*1.32;vHero=hero;
 vShine=.07*sin(uTime*1.3-pos.x*.011-pos.y*.007)*uMotion*(1.-hero);}`;
const FS_GLYPH=ext=>`${AA(ext)}precision highp float;varying vec2 vL;varying vec4 vV,vI;varying float vHero,vShine;uniform float uTag,uRings;${AAF(ext)}
${PETALS}
void main(){float R=vI.w;vec2 p=vL*R;float r=length(p);
 vec4 o=petals(p,R,vV,vI.x,vI.y,vShine);
 float w=aa(r-R),disc=(1.-smoothstep(-w,w,r-R))*vI.y;
 o+=vec4(mix(vec3(.204,.271,.922),vec3(.15,.2,.78),smoothstep(0.,R,r))*(1.+vShine)*disc,disc)*(1.-o.a);
 float ref=(1.-smoothstep(.5-w,.5+w,abs(r-R)))*.14*(1.-vI.y)*(1.-vHero*uRings);
 o+=vec4(vec3(.063,.086,.169)*ref,ref)*(1.-o.a);
 float ring=(1.-smoothstep(.8-w,.8+w,abs(r-R*1.2)))*uTag*vHero;o+=vec4(vec3(.063,.086,.169)*ring,ring)*(1.-o.a);
 o*=vI.z;if(o.a<.003)discard;gl_FragColor=o;}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS_BG=`precision mediump float;uniform vec2 uRes;uniform vec4 uBox;uniform float uDpr,uGrid;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 f=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 vec2 c=uBox.xy+uBox.zw*.5,q=(f-c)/max(uBox.z,uBox.w);vec3 col=mix(vec3(.961,.965,.98),vec3(.92,.927,.995),exp(-dot(q,q)*4.)*.9);
 vec2 gp=mod(f-uBox.xy+11.,22.)-11.;float dotA=1.-smoothstep(.55,1.35,length(gp));
 float edge=min(min(f.x-uBox.x,uBox.x+uBox.z-f.x),min(f.y-uBox.y,uBox.y+uBox.w-f.y));
 col=mix(col,vec3(.063,.086,.169),dotA*.075*uGrid*smoothstep(-30.,50.,edge));
 col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

let gl=null,program,attribs,DL,GD,GL,BG,quadBuf,fullBuf,glyphBuf,ext=false,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('ig-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  ext=!!gl.getExtension('OES_standard_derivatives');
  DL=program(VS_QUAD,FS_DIAL(ext));GD=program(VS_QUAD,FS_GUIDE(ext));GL=program(VS_GLYPH,FS_GLYPH(ext));BG=program(VS_BG,FS_BG);
  quadBuf=kit.buffer(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]));fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));glyphBuf=gl.createBuffer();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* Layout in CSS pixels: a box to the right of the copy (below it on phones) holds every view. */
let L=null,layoutKey='';
function layout(){const W=canvas.clientWidth,H=canvas.clientHeight,key=W+'x'+H;if(key===layoutKey&&L)return L;layoutKey=key;
 const phone=innerWidth<=900;let box;
 if(phone)box={x:12,y:8,w:W-24,h:H-16};
 else{const x0=W*(W/H<1.45?.5:.47),x1=W-Math.max(W*.055,40),y0=H*.31,y1=H-Math.max(H*.15,118);box={x:x0,y:y0,w:x1-x0,h:y1-y0};}
 const cx=box.x+box.w/2,cy=box.y+box.h/2,narrow=box.w<420;slide.classList.toggle('ig-narrow',narrow);
 const dialR=Math.min(box.w,box.h)*(narrow?.36:.4),dialC=[cx,narrow?box.y+box.h*.47:cy];
 const roseR=narrow?Math.min(box.w*.34,box.h*.27):Math.min(box.w*.27,box.h*.38),roseC=narrow?[cx,box.y+box.h*.43]:[cx,cy+box.h*.035];
 const fieldTop=box.y+(narrow?46:34),fieldH=box.h-(narrow?52:44),cell=Math.min(box.w/COLS,fieldH/ROWS),gx0=cx-cell*COLS/2,gy0=fieldTop+(fieldH-cell*ROWS)/2;
 const rows=Math.ceil(Math.max(...COUNTS)/PER),baseY=box.y+box.h-(narrow?52:46),cell2=Math.min(box.w*.95/(4*PER+3*1.6),(baseY-box.y-(narrow?46:52))/rows);
 const blockW=cell2*(4*PER+3*1.6),bx0=cx-blockW/2,colX=k=>bx0+k*(PER+1.6)*cell2+PER*cell2/2;
 const grid=i=>[gx0+(i%COLS+.5)*cell,gy0+(Math.floor(i/COLS)+.5)*cell];
 const sort=i=>{const k=cohort[i].strong,j=slotOf[i];return[bx0+k*(PER+1.6)*cell2+(j%PER+.5)*cell2,baseY-(Math.floor(j/PER)+.5)*cell2];};
 const slot=grid(HERO_SLOT),far=Math.hypot(COLS,ROWS)*cell*.6;
 const data=new Float32Array(N*6*14);let o=0;
 for(let i=0;i<N;i++){const c=cohort[i],gp=grid(i),sp=sort(i),ripple=clamp(Math.hypot(gp[0]-slot[0],gp[1]-slot[1])/far);
  for(const[qx,qy]of[[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]]){data.set([qx,qy,gp[0],gp[1],sp[0],sp[1],...c.vals,c.strong,ripple,c.delay*.85+(c.strong*.04),i===HERO_SLOT?1:0],o);o+=14;}}
 if(ready){gl.bindBuffer(gl.ARRAY_BUFFER,glyphBuf);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);}
 L={W,H,box,narrow,phone,dialR,dialC,roseR,roseC,cell,r1:cell*.42,cell2,r2:cell2*.42,slot,baseY,bx0,blockW,colX,colTop:k=>baseY-Math.ceil(COUNTS[k]/PER)*cell2};placed='';return L;}

/* Scene state, tweened by GSAP. */
const S={dial:0,fill:0,num:0,numA:0,rings:0,grow:0,plab:0,heroA:0,zoom:0,field:0,sort:0,cols:0,tag:0};
const TARGET=[
 {dial:1,fill:.74,num:0,numA:1,rings:0,grow:0,plab:0,heroA:1,zoom:0,field:0,sort:0,cols:0,tag:0},
 {dial:0,fill:.74,num:1,numA:1,rings:1,grow:1,plab:1,heroA:1,zoom:0,field:0,sort:0,cols:0,tag:0},
 {dial:0,fill:.74,num:1,numA:0,rings:0,grow:1,plab:0,heroA:1,zoom:1,field:1,sort:1,cols:1,tag:0}];
const KEYS=Object.keys(TARGET[0]);
let current=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,panelTl=null,placed='';
function view(){const l=layout(),e=S.zoom,Z0=l.roseR/l.r1,Z=Math.exp(Math.log(Z0)*(1-e));
 return{Z,focus:[mix(l.roseC[0],l.slot[0],e),mix(l.roseC[1],l.slot[1],e)]};}
function render(){if(!ready)return;window.ELMY_LIGHT.fit(canvas);const l=layout();frames++;
 const W=canvas.width,H=canvas.height,dpr=W/Math.max(1,l.W),v=view();gl.viewport(0,0,W,H);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,l.W,l.H);gl.uniform4f(BG.u.uBox,l.box.x,l.box.y,l.box.w,l.box.h);gl.uniform1f(BG.u.uDpr,dpr);gl.uniform1f(BG.u.uGrid,.55+.45*S.field);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 const quad=(P,c,h)=>{gl.useProgram(P.p);attribs(P,quadBuf,[['aQ',2,0]],2);gl.uniform2f(P.u.uRes,l.W,l.H);gl.uniform2f(P.u.uC,c[0],c[1]);gl.uniform1f(P.u.uH,h);if(!ext)gl.uniform1f(P.u.uDpr,dpr);};
 if(S.rings>.001){quad(GD,l.roseC,l.roseR*1.15);gl.uniform1f(GD.u.uR,l.roseR);gl.uniform1f(GD.u.uRings,S.rings);gl.drawArrays(gl.TRIANGLES,0,6);}
 if(S.dial>.001){quad(DL,l.dialC,l.dialR*1.12);const u=DL.u;gl.uniform1f(u.uR,l.dialR);gl.uniform1f(u.uDial,S.dial);gl.uniform1f(u.uFill,S.fill);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uMotion,motion?1:0);gl.drawArrays(gl.TRIANGLES,0,6);}
 if(S.grow>.001||S.field>.001){gl.useProgram(GL.p);attribs(GL,glyphBuf,[['aQ',2,0],['aGrid',2,2],['aSort',2,4],['aV',4,6],['aI',4,10]],14);const u=GL.u;
  gl.uniform2f(u.uRes,l.W,l.H);gl.uniform2f(u.uFocus,...v.focus);gl.uniform2f(u.uSlot,...l.slot);gl.uniform4f(u.uBox,l.box.x-10,l.box.y-6,l.box.w+20,l.box.h+12);gl.uniform1f(u.uZ,v.Z);gl.uniform1f(u.uR1,l.r1);gl.uniform1f(u.uR2,l.r2);
  gl.uniform1f(u.uSort,S.sort);gl.uniform1f(u.uField,S.field);gl.uniform1f(u.uHeroA,S.heroA);gl.uniform1f(u.uGrow,S.grow);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uMotion,motion?1:0);
  gl.uniform1f(u.uTag,S.tag);gl.uniform1f(u.uRings,S.rings);if(!ext)gl.uniform1f(u.uDpr,dpr);gl.drawArrays(gl.TRIANGLES,0,N*6);}
 place(v);}

/* Labels follow the drawing; styles are written only when something moved. */
const css=(e,x,y,tx,ty,op,sc=1)=>{e.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${tx}%,${ty}%)${sc!==1?` scale(${sc.toFixed(3)})`:''}`;e.style.opacity=String(+op.toFixed(3));};
function place(v){const l=layout(),key=[...KEYS.map(k=>S[k]),l.W,l.H].map(x=>x.toFixed(3)).join();if(key===placed)return;placed=key;
 el.count.textContent=String(Math.round(S.fill*100));
 const pillY=l.box.y+(l.narrow?4:6),n=S.num;
 css(el.num,mix(l.dialC[0],l.box.x+l.box.w/2,n),mix(l.dialC[1],pillY+14,n),-50,-50,S.numA*(1-clamp((n-.45)/.4))*clamp(S.dial*3+n),mix(1,.3,n));
 css(el.pill,l.box.x+l.box.w/2,pillY,-50,0,S.numA*clamp((n-.6)/.4));
 el.petals.forEach((p,k)=>{const op=clamp(S.plab*1.6-k*.2);
  if(l.narrow){css(p,l.box.x+(k===0||k===1?l.box.w*.54:l.box.w*.06),l.box.y+l.box.h*.75+(k===0||k===3?0:56),0,0,op);return;}
  const sx=k<2?1:-1,sy=k===0||k===3?-1:1,d=HERO[k]*l.roseR*S.grow*.98+16;
  css(p,l.roseC[0]+sx*d*.7071,l.roseC[1]+sy*d*.7071,sx>0?0:-100,sy<0?-100:0,op);});
 const hx=v.focus[0],hy=v.focus[1],hr=l.r1*v.Z*1.2;css(el.tag,hx,hy-hr-6,-50,-100,S.tag);
 css(el.caption,l.box.x+l.box.w,l.box.y-(l.narrow?2:4),-100,0,S.field);el.caption.lastElementChild.style.opacity=String(+S.cols.toFixed(3));
 css(el.base,l.bx0,l.baseY+4,0,0,S.cols);el.base.style.width=l.blockW.toFixed(1)+'px';
 el.counts.forEach((c,k)=>css(c,l.colX(k),l.colTop(k)-6,-50,-100,S.cols));
 el.names.forEach((c,k)=>{css(c,l.colX(k),l.baseY+12,-50,0,S.cols);c.style.maxWidth=(l.cell2*PER+l.cell2*1.4).toFixed(0)+'px';});}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Views. Each hop between neighbours has its own choreography; a jump plays both hops faster. */
function hop(t,from,to,at){
 if(from===0&&to===1){t.to(S,{dial:0,duration:.9,ease:'power2.inOut'},at).to(S,{num:1,duration:1.1,ease:'power3.inOut'},at+.1)
  .to(S,{rings:1,duration:1.1,ease:'power3.out'},at+.35).to(S,{grow:1,duration:1.5,ease:'power3.out'},at+.5).to(S,{plab:1,duration:.9,ease:'power2.out'},at+1.1);return at+1.9;}
 if(from===1&&to===0){t.to(S,{plab:0,duration:.35,ease:'power2.in'},at).to(S,{grow:0,duration:.8,ease:'power2.in'},at+.1).to(S,{rings:0,duration:.7,ease:'power2.in'},at+.3)
  .to(S,{num:0,duration:1.1,ease:'power3.inOut'},at+.35).to(S,{dial:1,duration:1.1,ease:'power2.out'},at+.6);return at+1.7;}
 if(from===1&&to===2){t.to(S,{plab:0,numA:0,duration:.35,ease:'power2.in'},at).to(S,{rings:0,duration:.5,ease:'power2.in'},at+.1)
  .to(S,{zoom:1,duration:1.55,ease:'power3.inOut'},at+.3).to(S,{field:1,duration:1.4,ease:'power2.out'},at+.55)
  .to(S,{tag:1,duration:.35},at+.8).to(S,{tag:0,duration:.35},at+1.95).to(S,{sort:1,duration:1.7,ease:'power2.inOut'},at+1.95).to(S,{cols:1,duration:.7,ease:'power2.out'},at+2.95);return at+3.65;}
 if(from===2&&to===1){t.to(S,{cols:0,tag:0,duration:.35,ease:'power2.in'},at).to(S,{sort:0,duration:1.2,ease:'power2.inOut'},at+.1).to(S,{field:0,duration:.9,ease:'power2.in'},at+.9)
  .to(S,{zoom:0,duration:1.4,ease:'power3.inOut'},at+.9).to(S,{rings:1,duration:.8,ease:'power2.out'},at+1.9).to(S,{plab:1,numA:1,duration:.8,ease:'power2.out'},at+2.1);return at+2.9;}
 return at;}
function write(i){const v=VIEWS[i];panel.step.textContent=pad(i+1);panel.name.textContent=v.name;panel.title.textContent=v.title;panel.text.textContent=v.text;nextLabel.textContent=v.next;
 tabs.forEach((t,k)=>t.setAttribute('aria-pressed',String(k===i)));slide.dataset.view=String(i+1);}
function go(i,animate=motion){i=Math.max(0,Math.min(2,i));if(i===current)return;const previous=current;current=i;
 if(!g||!animate||!ready){tl?.kill();tl=null;Object.assign(S,TARGET[i]);write(i);placed='';render();return;}
 // Start each hop from its resting state so an interrupted transition never leaves a mix behind.
 const from=previous;tl?.progress(1);tl?.kill();Object.assign(S,TARGET[from]);
 tl=g.timeline({onComplete:()=>{tl=null;}});let at=0;const dir=i>from?1:-1;for(let k=from;k!==i;k+=dir)at=hop(tl,k,k+dir,at);
 if(Math.abs(i-from)>1)tl.timeScale(1.45);
 const parts=[panel.name,panel.title,panel.text,nextLabel],d=i>previous?1:-1;panelTl?.progress(1);
 panelTl=g.timeline().to(parts,{opacity:0,y:-8*d,duration:.2,ease:'power2.in',stagger:.02}).add(()=>write(i)).fromTo(parts,{opacity:0,y:12*d},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.05});}
tabs.forEach((t,i)=>t.addEventListener('click',()=>go(i)));
next.addEventListener('click',()=>go((current+1)%3));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<900)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){tl?.kill();Object.assign(S,TARGET[0],{dial:0,fill:0,numA:0});current=0;write(0);
 tl=g.timeline({onComplete:()=>{tl=null;}}).to(S,{numA:1,duration:.8,ease:'power2.out'},.55).to(S,{dial:1,duration:1.3,ease:'power2.inOut'},.45).to(S,{fill:.74,duration:1.9,ease:'power3.inOut'},1.05);}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.ig-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.ig-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.ig-tabs,.ig-detail,.ig-next'),{opacity:0,y:14},{opacity:1,y:0,duration:.9,stagger:.1},full?.6:.2)
  .fromTo(q('.ig-foot'),{opacity:0},{opacity:1,duration:.8},full?1.3:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.ig-kicker,.ig-line>span,.ig-tabs,.ig-detail,.ig-next,.ig-foot',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}Object.assign(S,TARGET[current]);placed='';}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{layoutKey='';if(active&&!raf)render();}).observe(canvas);

window.ELMY_INTELLIGENCE={
 id:'intelligence',keys:['ArrowDown','ArrowUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}placed='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(current+(k==='ArrowDown'?1:-1));},
 go,
 debug:{S,cohort,COUNTS,render,layout:()=>layout(),get state(){return{current,ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_INTELLIGENCE);
init();finish();write(0);
})();

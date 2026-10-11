/* Slide 10: Beyond results. One fictional score (a live dial) shrinks into a label; four solid bars show
   the candidate's example profile; then the candidate becomes one dot among 100 and the group files into
   four question rows (group data, drawn as dots); the rows shrink into one panel of an approved
   institutional dashboard; a five-step cycle closes the slide. Geometry is drawn in 2D shaders in CSS
   pixels, so the HTML labels sit exactly on it. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="intelligence"]');if(!slide||!window.ELMY_LIGHT)return;
const g=window.gsap,rand=window.ELMY_LIGHT.rng(1047);
const DATA=JSON.parse($('.ig-data',slide).textContent),VIEWS=DATA.views,DIMS=DATA.dims.map(d=>d[1]/100),ITEMS=DATA.items.map(d=>d[1]),LAST=VIEWS.length-1;
const canvas=$('.ig-canvas',slide),copy=$('.ig-copy',slide),levels=$$('.ig-lv',slide);
const el={chip:$('.ig-chip',slide),chipText:$('.ig-chip b',slide),illus:$('.ig-illus',slide),num:$('.ig-num',slide),count:$('.ig-count',slide),pill:$('.ig-pill',slide),
 dname:$$('.ig-dname',slide),dval:$$('.ig-dval',slide),ticks:$$('.ig-tick',slide),axis:$('.ig-axis',slide),legend:$('.ig-legend',slide),
 qname:$$('.ig-qname',slide),qval:$$('.ig-qval',slide),flag:$('.ig-flag',slide),qaxis:$('.ig-qaxis',slide),tag:$('.ig-tag',slide),
 tt:$$('.ig-tt',slide),ts:$$('.ig-ts',slide),cn:$$('.ig-cn',slide),cl:$$('.ig-cl',slide),cc:$('.ig-cc',slide)};
const panel={title:$('.ig-detail h3',slide),text:$('.ig-text',slide),note:$('.ig-note',slide),step:$('.ig-step',slide)};
const pad=n=>String(n).padStart(2,'0'),mix=(a,b,t)=>a+(b-a)*t,clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),ease=t=>t*t*(3-2*t);

/* A fictional group of 100. Candidate 1047 sits at the centre of the group (index 0). For each question the
   candidates take slots left to right, so the correct answers (slots below the rate) read as a bar of dots. */
const N=100,GOLD=2.399963;
const unit=Array.from({length:N},(_,i)=>{const r=Math.sqrt((i+.3)/N),a=i*GOLD;return[r*Math.cos(a),r*Math.sin(a)];});
const slotOf=ITEMS.map(()=>{const k=unit.map((p,i)=>({i,k:p[0]+(rand()-.5)*.45}));k.sort((a,b)=>a.k-b.k);const s=new Array(N);k.forEach((o,j)=>{s[o.i]=j;});return s;});
const delay=Array.from({length:N},()=>rand());

/* Colours (straight RGBA). */
const NAVY=[.063,.086,.169,1],COBALT=[.204,.271,.922,1],LAV=[.765,.776,1,1],LIME=[.8,.937,.678,1],WHITE=[1,1,1,1],PAPER=[.961,.965,.98,1];

/* Shaders. Positions arrive in CSS pixels (y down). */
const AA=ext=>ext?'#extension GL_OES_standard_derivatives : enable\n':'';
const AAF=ext=>ext?'float aa(float d){return max(fwidth(d),.0001);}':'uniform float uDpr;float aa(float d){return .75/uDpr;}';
const VS_QUAD=`precision highp float;attribute vec2 aQ;uniform vec2 uRes,uC;uniform float uH;varying vec2 vP;
void main(){vec2 s=uC+aQ*uH;vP=vec2(aQ.x,-aQ.y)*uH;gl_Position=vec4(s.x/uRes.x*2.-1.,1.-s.y/uRes.y*2.,0.,1.);}`;
// The score dial: 100 ticks fill to the result, with a progress track and a marker at 74.
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
 float ra=uR*.84,arcW=max(1.1,uR*.0072),along=(min(uFill,uDial)-t)*6.283185*ra,arc=hair(r-ra,arcW)*smoothstep(-.8,.8,along);
 float tf=min(uFill,uDial)*6.283185;vec2 endP=ra*vec2(sin(tf),cos(tf));float dotD=length(vP-endP)-max(3.2,uR*.02),cap=(1.-smoothstep(-aa(dotD),aa(dotD),dotD))*step(.02,uFill);
 vec3 arcC=mix(vec3(.45,.5,1.),vec3(.204,.271,.922),smoothstep(0.,.55,t));
 o+=vec4(arcC*arc,arc)*(1.-o.a);o=mix(o,vec4(vec3(.063,.086,.169),1.),cap*smoothstep(0.,.2,uDial));
 float rings=hair(r-uR*1.07,.5)*.2+hair(r-ra,.5)*.13*(1.-arc);rings*=smoothstep(0.,.3,uDial)*smoothstep(0.,1.,uDial);
 o+=vec4(vec3(.063,.086,.169)*rings,rings)*(1.-o.a);gl_FragColor=o;}`;
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
const FS_BG=`precision mediump float;uniform vec2 uRes;uniform vec4 uBox;uniform float uDpr,uGrid;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 f=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;
 vec2 c=uBox.xy+uBox.zw*.5,q=(f-c)/max(uBox.z,uBox.w);vec3 col=mix(vec3(.961,.965,.98),vec3(.92,.927,.995),exp(-dot(q,q)*4.)*.9);
 vec2 gp=mod(f-uBox.xy+11.,22.)-11.;float dotA=1.-smoothstep(.55,1.35,length(gp));
 float edge=min(min(f.x-uBox.x,uBox.x+uBox.z-f.x),min(f.y-uBox.y,uBox.y+uBox.w-f.y));
 col=mix(col,vec3(.063,.086,.169),dotA*.07*uGrid*smoothstep(-30.,50.,edge));
 col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

let gl=null,program,attribs,DL,PR,BG,quadBuf,fullBuf,primBuf,ext=false,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('ig-flat');}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  ext=!!gl.getExtension('OES_standard_derivatives');
  DL=program(VS_QUAD,FS_DIAL(ext));PR=program(VS_PRIM,FS_PRIM);BG=program(VS_BG,FS_BG);
  quadBuf=kit.buffer(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]));fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));primBuf=gl.createBuffer();
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* The primitive batch, rebuilt each frame on the CPU. */
const MAXP=1500,STRIDE=14,batch=new Float32Array(MAXP*6*STRIDE),CORNERS=[[-1,-1],[1,-1],[-1,1],[-1,1],[1,-1],[1,1]];let np=0;
function prim(t,a,b,c,d,p1,p2,col,alpha){const A=col[3]*alpha;if(np>=MAXP||A<=.003)return;let o=np*6*STRIDE;
 for(const q of CORNERS){batch.set([q[0],q[1],a,b,c,d,t,p1,p2,0,col[0],col[1],col[2],A],o);o+=STRIDE;}np++;}
const rect=(x,y,w,h,r,col,a,stroke=0)=>{if(w>.05&&h>.05)prim(0,x,y,w,h,r,stroke,col,a);};
const shade=(x,y,w,h,r,blur,col,a)=>prim(1,x,y,w,h,r,blur,col,a);
const seg=(x0,y0,x1,y1,hw,col,a,dash=0)=>prim(2,x0,y0,x1,y1,hw,dash,col,a);
const disc=(x,y,r,ring,col,a)=>{if(r>.05)prim(3,x,y,r,ring,0,0,col,a);};

/* Layout in CSS pixels: a box to the right of the copy (below it on phones) holds every view. */
let L=null,layoutKey='';
// The widest data-level label, measured with the live font, decides whether the two labels share a line.
function chipMax(){const keep=el.chipText.textContent;let w=0;for(const t of new Set(VIEWS.map(v=>v.chip))){el.chipText.textContent=t;w=Math.max(w,el.chip.offsetWidth);}el.chipText.textContent=keep;return w;}
function layout(){const W=canvas.clientWidth,H=canvas.clientHeight,phone=innerWidth<=900;
 const cr=phone?0:Math.round(copy.getBoundingClientRect().right-canvas.getBoundingClientRect().left),key=[W,H,phone,cr].join();if(key===layoutKey&&L)return L;layoutKey=key;
 let box;
 if(phone)box={x:18,y:8,w:W-36,h:H-16};
 else{const x0=Math.max(W*(W/H<1.45?.5:.47),cr+48),x1=W-Math.max(W*.055,40),y0=Math.max(104,H*.125),y1=H-Math.max(120,H*.15);box={x:x0,y:y0,w:x1-x0,h:y1-y0};}
 const narrow=box.w<480;slide.classList.toggle('ig-narrow',narrow);
 // Captions wrap to the stage width; the illustrative label moves under the level label when both do not fit.
 for(const e of[el.illus,el.axis,el.qaxis])e.style.maxWidth=Math.floor(box.w)+'px';
 const stack=narrow||chipMax()+el.illus.offsetWidth+16>box.w,top=box.y+(stack?40+el.illus.offsetHeight:46),bottom=box.y+box.h,ch=bottom-top,cx=box.x+box.w/2,cy=top+ch/2;
 // Bars and question rows share one grid: label line, then the bar or dot row; ticks and a caption below.
 const valW=narrow?46:62,trackX=box.x,trackW=box.w-valW,cols=narrow?25:50,lines=narrow?4:2,barH=narrow?11:13;
 const pitch=Math.min(narrow?86:96,(ch-56-50)/4),p=Math.min(trackW/cols,(pitch-32)/lines),rowH=Math.max(barH,lines*p);
 const groupH=56+3*pitch+24+rowH+12+30,groupTop=top+Math.max(0,(ch-groupH)/2),rowsTop=groupTop+56,rowY=k=>rowsTop+k*pitch,tickY=rowY(3)+24+rowH+12;
 // The group as a cloud; the dial; the dashboard grid; the cycle.
 const Rc=Math.min(box.w*.34,ch*.36),rc=clamp(Rc*.068,3,7.5),R=Math.min(box.w*.34,ch*.4);
 const tc=narrow?2:3,tr=narrow?3:2,gap=narrow?10:14,tw=(box.w-gap*(tc-1))/tc,th=(ch-gap*(tr-1))/tr,head=narrow?40:46,foot=narrow?28:34;
 const tiles=Array.from({length:6},(_,i)=>{const x=box.x+(i%tc)*(tw+gap),y=top+Math.floor(i/tc)*(th+gap);return{x,y,w:tw,h:th,c:{x:x+14,y:y+head,w:tw-28,h:th-head-foot}};});
 const q=tiles[3].c,p2=Math.min(q.w/25,q.h/(16+3*1.2)),qx0=q.x+(q.w-25*p2)/2,qy0=q.y+(q.h-(16+3*1.2)*p2)/2;
 const Ry=Math.min(box.w*(narrow?.25:.3),ch*.34),nr=narrow?17:24;
 L={W,H,box,narrow,stack,phone,top,bottom,ch,cx,cy,trackX,trackW,cols,lines,barH,pitch,p,rowH,groupTop,rowsTop,rowY,tickY,Rc,rc,R,tiles,p2,qx0,qy0,Ry,nr};placed='';return L;}
const rowPos=(l,q,j)=>[l.trackX+(Math.floor(j/l.lines)+.5)*l.p,l.rowY(q)+24+(j%l.lines+.5)*l.p];
const tilePos=(l,q,j)=>[l.qx0+(Math.floor(j/4)+.5)*l.p2,l.qy0+q*5.2*l.p2+(j%4+.5)*l.p2];
const cloudPos=(l,i)=>[l.cx+unit[i][0]*l.Rc,l.cy+unit[i][1]*l.Rc];
const heroStart=l=>[l.box.x+20,l.groupTop+17];
const tileIn=k=>ease(clamp(S.dash*1.7-.35-k*.1));
const cycIn=k=>ease(clamp(S.cyc*1.8-.2-k*.16));
const node=(l,k)=>{const a=-Math.PI/2+k*Math.PI*2/5;return[l.cx+Math.cos(a)*l.Ry,l.cy+Math.sin(a)*l.Ry,a];};

/* Scene state, tweened by GSAP. */
const S={dial:0,fill:0,numA:0,num:0,bars:0,lab:0,one:0,cloud:0,rows:0,mark:0,dash:0,cyc:0};
const base={dial:0,fill:.74,numA:1,num:1,bars:0,lab:0,one:1,cloud:1,rows:1,mark:1,dash:0,cyc:0};
const TARGET=[{...base,dial:1,num:0,one:0,cloud:0,rows:0,mark:0},{...base,bars:1,lab:1,one:0,cloud:0,rows:0,mark:0},{...base},{...base,dash:1},{...base,dash:1,cyc:1}];
const KEYS=Object.keys(S);
let current=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,panelTl=null,placed='';

function draw(l){np=0;
 // Candidate profile: tracks, solid bars and light gridlines on a 0–100 scale.
 if(S.bars>.001||S.lab>.001){
  for(let t=0;t<=4;t++){const x=l.trackX+l.trackW*t/4;seg(x,l.rowY(0)+16,x,l.tickY-6,.5,NAVY,.12*S.lab,5);}
  DIMS.forEach((v,k)=>{const b=ease(clamp(S.bars*1.6-k*.2)),y=l.rowY(k)+24+(l.rowH-l.barH)/2;
   rect(l.trackX,y,l.trackW,l.barH,l.barH/2,NAVY,.07*clamp(S.bars*3-k*.3));rect(l.trackX,y,l.trackW*v*b,l.barH,l.barH/2,COBALT,clamp(b*4));});}
 // Dashboard panels with their own small illustrative charts.
 if(S.dash>.001)l.tiles.forEach((t,k)=>{const a=tileIn(k);if(a<.003)return;const y=t.y+(1-a)*14,c=t.c,cy=c.y+(1-a)*14,gr=ease(clamp(S.dash*1.7-.6-k*.1));
  shade(t.x,y+8,t.w,t.h,14,16,NAVY,.09*a);rect(t.x,y,t.w,t.h,14,WHITE,a);rect(t.x,y,t.w,t.h,14,NAVY,.09*a,1);
  if(k===0){const sw=(c.w-6*5)/7,bh=clamp((c.h-26-16)/3,6,15);for(let s=0;s<7;s++)rect(c.x+s*(sw+5),cy+2,sw,6,3,s<5?COBALT:s===5?LAV:NAVY,a*(s===6?.1:1)*clamp(gr*7-s*.6));
   [1,.76,.64].forEach((w,s)=>rect(c.x,cy+24+s*(bh+8),c.w*w*gr,bh,4,s===0?NAVY:COBALT,a*(s===2?.6:1)));}
  if(k===1){const bw=c.w/13;for(let s=0;s<13;s++){const h=c.h*(.08+.88*Math.exp(-Math.pow((s-6.3)/2.8,2)))*gr;rect(c.x+s*bw+1.5,cy+c.h-h,bw-3,h,2.5,COBALT,a*.88);}seg(c.x,cy+c.h+4,c.x+c.w,cy+c.h+4,.6,NAVY,.3*a);}
  if(k===2){const bh=clamp(c.h/4*.38,5,12);[.71,.64,.57,.62].forEach((v,s)=>{const yy=cy+(s+.5)*c.h/4-bh/2;rect(c.x,yy,c.w,bh,bh/2,NAVY,.07*a);rect(c.x,yy,c.w*v*gr,bh,bh/2,s%2?COBALT:NAVY,a);});}
  if(k===4){for(let s=0;s<3;s++){const yy=cy+c.h*(s+.5)/3;seg(c.x,yy,c.x+c.w,yy,.5,NAVY,.14*a,4);}
   const vals=[.46,.55,.52,.61,.67],P=vals.map((v,s)=>[c.x+c.w*(.04+.92*s/4),cy+c.h*(1-v)]),f=gr*4;
   for(let s=0;s<4;s++){const u=clamp(f-s);if(u<=0)break;seg(P[s][0],P[s][1],mix(P[s][0],P[s+1][0],u),mix(P[s][1],P[s+1][1],u),1.4,COBALT,a);}
   P.forEach((pt,s)=>{const u=clamp(f-s+.5);disc(pt[0],pt[1],5,10,WHITE,a*u);disc(pt[0],pt[1],3.4,6.8,NAVY,a*u);});}
  if(k===5){const ph=c.h-14,pw=Math.min(c.w*.5,ph*.78),px=c.x+(c.w-pw-12)/2,py=cy+10;
   rect(px+12,py-8,pw,ph,6,LAV,.45*a);rect(px+12,py-8,pw,ph,6,NAVY,.12*a,1);rect(px,py,pw,ph,6,WHITE,a);rect(px,py,pw,ph,6,NAVY,.24*a,1);
   seg(px+10,py+14,px+pw*.55,py+14,2.4,COBALT,a);[.8,.66,.74,.5].forEach((w,s)=>seg(px+10,py+28+s*10,px+10+(pw-20)*w*gr,py+28+s*10,1.5,NAVY,.2*a));
   const sr=Math.min(19,ph*.17),sx=px+pw-2,sy=py+ph-sr-4;disc(sx,sy,sr+3,2*sr+6,WHITE,a*gr);disc(sx,sy,sr,2*sr,NAVY,a*gr);
   seg(sx-.42*sr,sy+.02*sr,sx-.1*sr,sy+.32*sr,1.8,LIME,a*gr);seg(sx-.1*sr,sy+.32*sr,sx+.44*sr,sy-.3*sr,1.8,LIME,a*gr);}});
 // The group: candidate 1047 appears where the score label was, 99 others join, and they file into rows.
 if(S.one>.001){const hs=heroStart(l),dk=ease(clamp(S.dash*1.3-.05)),hf=ease(clamp(S.rows*1.7-delay[0]*.5));
  for(let q=0;q<4;q++)for(let i=0;i<N;i++){const f=ease(clamp(S.rows*1.7-delay[i]*.5-q*.08));if(q>0&&f<.001)continue;
   const j=slotOf[q][i],rp=rowPos(l,q,j),cp=cloudPos(l,i);let x,y,r,a;
   if(i===0){const m=ease(clamp(S.cloud*1.5));x=mix(hs[0],cp[0],m);y=mix(hs[1],cp[1],m);r=l.rc*mix(1.3,1.2,m)*ease(clamp(S.one*1.4));a=1;}
   else{const ap=ease(clamp(S.cloud*1.7-(i/N)*.7));x=cp[0];y=cp[1];r=l.rc*ap;a=ap;}
   const tp=tilePos(l,q,j);x=mix(mix(x,rp[0],f),tp[0],dk);y=mix(mix(y,rp[1],f),tp[1],dk);r=mix(mix(r,l.p*.38,f),l.p2*.38,dk);
   const wrong=j>=ITEMS[q],m=wrong?S.mark:0,hero=i===0?1-f:0;
   const col=hero>.001?[mix(COBALT[0],NAVY[0],hero),mix(COBALT[1],NAVY[1],hero),mix(COBALT[2],NAVY[2],hero),1]:COBALT;
   disc(x,y,r,mix(2*r,Math.max(1.1,r*.42),m),m>.001?[mix(col[0],NAVY[0],m),mix(col[1],NAVY[1],m),mix(col[2],NAVY[2],m),1]:col,a*mix(1,.42,m));
   if(i===0&&q===0&&hero>.001)disc(x,y,r*2.3,1.6,COBALT,.55*hero*ease(clamp(S.one*1.4)));}
  const ta=clamp(S.cloud*2-.4)*(1-clamp(S.rows*3)),hx=l.cx,hy=l.cy;if(ta>.003)seg(hx,l.cy-l.Rc-12,hx,hy-l.rc*2.8,.6,NAVY,.5*ta);}
 // Closing cycle over a paper veil: five steps joined by arrows, with a light travelling round.
 if(S.cyc>.001){rect(l.box.x-8,l.top-6,l.box.w+16,l.ch+12,16,PAPER,.95*ease(clamp(S.cyc*2)));
  const d=(l.nr+9)/l.Ry;
  for(let k=0;k<5;k++){const f=ease(clamp(S.cyc*1.8-.35-k*.16));if(f<.001)continue;const a0=node(l,k)[2]+d,a1=a0+(Math.PI*2/5-2*d)*f,n=16;
   for(let s=0;s<n;s++){const u0=a0+(a1-a0)*s/n,u1=a0+(a1-a0)*(s+1)/n;seg(l.cx+Math.cos(u0)*l.Ry,l.cy+Math.sin(u0)*l.Ry,l.cx+Math.cos(u1)*l.Ry,l.cy+Math.sin(u1)*l.Ry,1.1,COBALT,.75);}
   if(f>.97){const ex=l.cx+Math.cos(a1)*l.Ry,ey=l.cy+Math.sin(a1)*l.Ry,tx=-Math.sin(a1),ty=Math.cos(a1);
    for(const sg of[1,-1]){const ca=Math.cos(2.6*sg),sa=Math.sin(2.6*sg);seg(ex,ey,ex+(tx*ca-ty*sa)*8,ey+(tx*sa+ty*ca)*8,1.1,COBALT,.75);}}}
  if(motion){const u=-Math.PI/2+((time*.11)%1)*Math.PI*2;disc(l.cx+Math.cos(u)*l.Ry,l.cy+Math.sin(u)*l.Ry,4.2,8.4,COBALT,.85*clamp(S.cyc*2-1));}
  for(let k=0;k<5;k++){const c=cycIn(k),[x,y]=node(l,k);disc(x,y,l.nr+5,2*l.nr+10,PAPER,c);disc(x,y,l.nr*mix(.6,1,c),2*l.nr,NAVY,c);}}}

function render(){if(!ready)return;window.ELMY_LIGHT.fit(canvas);const l=layout();frames++;
 const W=canvas.width,H=canvas.height,dpr=W/Math.max(1,l.W);gl.viewport(0,0,W,H);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,l.W,l.H);gl.uniform4f(BG.u.uBox,l.box.x,l.box.y,l.box.w,l.box.h);gl.uniform1f(BG.u.uDpr,dpr);gl.uniform1f(BG.u.uGrid,.5+.5*S.dash);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 if(S.dial>.001){gl.useProgram(DL.p);attribs(DL,quadBuf,[['aQ',2,0]],2);const u=DL.u;gl.uniform2f(u.uRes,l.W,l.H);gl.uniform2f(u.uC,l.cx,l.cy);gl.uniform1f(u.uH,l.R*1.12);if(!ext)gl.uniform1f(u.uDpr,dpr);
  gl.uniform1f(u.uR,l.R);gl.uniform1f(u.uDial,S.dial);gl.uniform1f(u.uFill,S.fill);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uMotion,motion?1:0);gl.drawArrays(gl.TRIANGLES,0,6);}
 draw(l);
 if(np){gl.useProgram(PR.p);gl.bindBuffer(gl.ARRAY_BUFFER,primBuf);gl.bufferData(gl.ARRAY_BUFFER,batch.subarray(0,np*6*STRIDE),gl.DYNAMIC_DRAW);
  attribs(PR,primBuf,[['aQ',2,0],['aG',4,2],['aP',4,6],['aC',4,10]],STRIDE);gl.uniform2f(PR.u.uRes,l.W,l.H);gl.uniform1f(PR.u.uAA,.75/dpr);gl.drawArrays(gl.TRIANGLES,0,np*6);}
 place();}

/* Labels follow the drawing; styles are written only when something moved. */
const css=(e,x,y,tx,ty,op,sc=1)=>{e.style.transform=`translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(${tx}%,${ty}%)${sc!==1?` scale(${sc.toFixed(3)})`:''}`;if(op!==null)e.style.opacity=String(+clamp(op).toFixed(3));};
function place(){const l=layout(),key=[...KEYS.map(k=>S[k]),l.W,l.H].map(x=>x.toFixed(3)).join();if(key===placed)return;placed=key;
 const b=l.box,right=b.x+b.w,veil=1-clamp(S.cyc*1.4);
 css(el.chip,b.x,b.y,0,0,null);
 if(l.stack)css(el.illus,b.x,b.y+30,0,0,null);else css(el.illus,right,b.y,-100,0,null);
 el.count.textContent=String(Math.round(S.fill*100));
 const n=S.num,hs=heroStart(l);
 css(el.num,mix(l.cx,hs[0]+18,n),mix(l.cy,hs[1],n),-50,-50,S.numA*(1-clamp((n-.45)/.4))*clamp(S.dial*3+n),mix(1,.3,n));
 css(el.pill,b.x,l.groupTop,0,0,S.numA*clamp((n-.6)/.4)*(1-clamp(S.one*2.5)));
 el.dname.forEach((e,k)=>{const a=clamp(S.lab*1.6-k*.2);css(e,l.trackX,l.rowY(k),0,0,a);css(el.dval[k],right,l.rowY(k)+24+l.rowH/2,-100,-50,a);});
 el.ticks.forEach((e,k)=>css(e,l.trackX+l.trackW*k/4,l.tickY,-50,0,S.lab));css(el.axis,l.trackX,l.tickY+18,0,0,S.lab);
 const qa=S.mark*(1-clamp(S.dash*2.5));
 css(el.legend,b.x,l.groupTop+6,0,0,qa);css(el.qaxis,l.trackX,l.tickY+2,0,0,qa);
 el.qname.forEach((e,k)=>{const a=qa*clamp(S.mark*1.6-k*.15);css(e,l.trackX,l.rowY(k),0,0,a);css(el.qval[k],right,l.rowY(k)+24+l.lines*l.p/2,-100,-50,a);});
 css(el.flag,right,l.rowY(2)-3,-100,0,qa*clamp(S.mark*2-1));
 css(el.tag,l.cx,l.cy-l.Rc-14,-50,-100,clamp(S.cloud*2-.4)*(1-clamp(S.rows*3)));
 l.tiles.forEach((t,k)=>{const a=tileIn(k)*veil,y=(1-tileIn(k))*14;css(el.tt[k],t.x+14,t.y+15+y,0,0,a);css(el.ts[k],t.x+14,t.y+t.h-11+y,0,-100,a);el.ts[k].style.maxWidth=(t.w-28).toFixed(0)+'px';});
 for(let k=0;k<5;k++){const c=cycIn(k),[x,y,ang]=node(l,k),dx=Math.cos(ang),dy=Math.sin(ang),rr=l.Ry+l.nr+12;
  css(el.cn[k],x,y,-50,-50,c);css(el.cl[k],l.cx+dx*rr,l.cy+dy*rr,dx>.3?0:dx<-.3?-100:-50,dy>.3?0:dy<-.3?-100:-50,c);}
 css(el.cc,l.cx,l.cy,-50,-50,clamp(S.cyc*2.2-1.2));}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Steps. Each hop between neighbours has its own choreography; a jump plays the hops faster. */
function hop(t,a,b,at){
 if(a===0&&b===1){t.to(S,{dial:0,duration:.8,ease:'power2.inOut'},at).to(S,{num:1,duration:1,ease:'power3.inOut'},at+.1).to(S,{bars:1,duration:1.4,ease:'power3.out'},at+.5).to(S,{lab:1,duration:.8,ease:'power2.out'},at+.8);return at+1.9;}
 if(a===1&&b===0){t.to(S,{lab:0,duration:.35,ease:'power2.in'},at).to(S,{bars:0,duration:.7,ease:'power2.in'},at+.05).to(S,{num:0,duration:1,ease:'power3.inOut'},at+.3).to(S,{dial:1,duration:1,ease:'power2.out'},at+.55);return at+1.6;}
 if(a===1&&b===2){t.to(S,{lab:0,duration:.35,ease:'power2.in'},at).to(S,{bars:0,duration:.6,ease:'power2.in'},at+.05).to(S,{one:1,duration:.6,ease:'power2.out'},at+.4)
  .to(S,{cloud:1,duration:1.3,ease:'power2.out'},at+.85).to(S,{rows:1,duration:1.6,ease:'power2.inOut'},at+2.1).to(S,{mark:1,duration:.8,ease:'power2.out'},at+3.2);return at+4;}
 if(a===2&&b===1){t.to(S,{mark:0,duration:.3,ease:'power2.in'},at).to(S,{rows:0,duration:1,ease:'power2.inOut'},at+.1).to(S,{cloud:0,duration:.7,ease:'power2.in'},at+.9)
  .to(S,{one:0,duration:.4,ease:'power2.in'},at+1.4).to(S,{bars:1,duration:1,ease:'power3.out'},at+1.5).to(S,{lab:1,duration:.6,ease:'power2.out'},at+1.8);return at+2.4;}
 if(a===2&&b===3){t.to(S,{dash:1,duration:1.9,ease:'power2.inOut'},at);return at+1.9;}
 if(a===3&&b===2){t.to(S,{dash:0,duration:1.2,ease:'power2.inOut'},at);return at+1.2;}
 if(a===3&&b===4){t.to(S,{cyc:1,duration:2.1,ease:'power1.inOut'},at);return at+2.1;}
 if(a===4&&b===3){t.to(S,{cyc:0,duration:.9,ease:'power2.in'},at);return at+.9;}
 return at;}
function write(i){const v=VIEWS[i];panel.title.textContent=v.title;panel.text.textContent=v.text;panel.note.textContent=v.note;panel.step.textContent=pad(i+1)+' / '+pad(LAST+1);
 levels.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));slide.dataset.view=i===LAST?'final':'level';slide.dataset.level=String(i);}
function chip(i,animate){const t=VIEWS[i].chip;if(el.chipText.textContent===t)return;if(!g||!animate){el.chipText.textContent=t;return;}
 g.killTweensOf(el.chip);g.timeline().to(el.chip,{opacity:0,duration:.18,ease:'power2.in'}).add(()=>{el.chipText.textContent=t;}).to(el.chip,{opacity:1,duration:.45,ease:'power2.out'});}
function go(i,animate=motion){i=Math.max(0,Math.min(LAST,i));if(i===current)return;const from=current;current=i;chip(i,animate);
 if(!g||!animate||!ready){tl?.kill();tl=null;Object.assign(S,TARGET[i]);write(i);placed='';render();return;}
 // Start each hop from its resting state so an interrupted transition never leaves a mix behind.
 tl?.progress(1);tl?.kill();Object.assign(S,TARGET[from]);
 tl=g.timeline({onComplete:()=>{tl=null;}});let at=0;const dir=i>from?1:-1;for(let k=from;k!==i;k+=dir)at=hop(tl,k,k+dir,at);
 if(Math.abs(i-from)>1)tl.timeScale(1.7);
 const parts=[panel.title,panel.text,panel.note],d=i>from?1:-1;panelTl?.progress(1);
 panelTl=g.timeline().to(parts,{opacity:0,y:-8*d,duration:.2,ease:'power2.in',stagger:.02}).add(()=>write(i)).fromTo(parts,{opacity:0,y:12*d},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.05});}
levels.forEach((b,i)=>b.addEventListener('click',()=>go(i)));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<900)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){tl?.kill();Object.assign(S,TARGET[0],{dial:0,fill:0,numA:0});current=0;write(0);chip(0,false);
 tl=g.timeline({onComplete:()=>{tl=null;}}).to(S,{numA:1,duration:.8,ease:'power2.out'},.55).to(S,{dial:1,duration:1.3,ease:'power2.inOut'},.45).to(S,{fill:.74,duration:1.9,ease:'power3.inOut'},1.05);}
const TEXT='.ig-kicker,.ig-line>span,.ig-subtitle,.ig-levels li,.ig-detail,.ig-final,.ig-hint,.ig-foot';
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out'}})
  .fromTo(q('.ig-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.ig-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.ig-subtitle,.ig-levels li'),{opacity:0,y:12},{opacity:1,y:0,duration:.8,stagger:.06},full?.55:.15)
  .fromTo(q('.ig-detail,.ig-final,.ig-hint'),{opacity:0,y:12},{opacity:1,y:0,duration:.8,stagger:.08},full?.9:.25)
  .fromTo(q('.ig-foot'),{opacity:0},{opacity:1,duration:.8},full?1.3:.4);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$(TEXT,slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}panelTl?.progress(1);Object.assign(S,TARGET[current]);placed='';}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{layoutKey='';if(active&&!raf)render();}).observe(canvas);
addEventListener('resize',()=>{layoutKey='';});

window.ELMY_INTELLIGENCE={
 id:'intelligence',keys:['ArrowDown','ArrowUp','PageDown','PageUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();finish();textTl?.progress(1,true);if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}layoutKey='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(current+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,
 debug:{S,render,layout:()=>layout(),get state(){return{current,ready,frames,prims:np,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_INTELLIGENCE);
init();finish();write(0);
})();

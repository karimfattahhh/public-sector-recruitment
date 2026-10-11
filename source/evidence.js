/* Slide 9 (Nizar brief): From operational challenges to institutional impact. One anonymised
   project in steps: the context, four evidence areas, then its relevance to the Board. Each step's
   anonymised images arrive as a cobalt halftone "plan" and a scan line develops them into the
   photograph. No client name and no figures. Images keep their proportions in a justified collage.
   Local WebGL and GSAP only; the images are listed in source/media.js. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="experience"]');if(!slide||!window.ELMY_LIGHT||!window.PROJECT_MEDIA)return;
const g=window.gsap,MEDIA=window.PROJECT_MEDIA,CH=JSON.parse($('.ev-data',slide).textContent);
const canvas=$('.ev-canvas',slide),layer=$('.ev-cards',slide),chapters=$$('.ev-ch',slide),copy=$('.ev-copy',slide),LAST=CH.length-1;
const detail={title:$('.ev-detail h3',slide),text:$('.ev-text',slide)};
// The four evidence areas are steps 1-4; the list shows how many images each holds.
$$('.ev-k',slide).forEach((b,i)=>b.textContent=String(MEDIA[i+1].length));

/* Images, decoded up front; each becomes a texture once loaded. */
const items=MEDIA.map((list,c)=>list.map(([file,caption])=>({file,caption,c})));
const all=items.flat();all.forEach((m,i)=>{m.i=i;m.img=new Image();m.img.decoding='async';m.img.src='assets/project/'+m.file;m.tex=null;m.img.decode?.().catch(()=>{});});
const aspect=m=>m.img.naturalWidth?m.img.naturalWidth/m.img.naturalHeight:1.5;

const AA=ext=>ext?'#extension GL_OES_standard_derivatives : enable\n':'';
const AAF=ext=>ext?'float aa(float d){return max(fwidth(d),.0001);}':'uniform float uDpr;float aa(float d){return .75/uDpr;}';
const VS_CARD=`precision highp float;attribute vec2 aQ;uniform vec2 uRes;uniform vec4 uRect;uniform float uPad;varying vec2 vP;
void main(){vec2 h=uRect.zw*.5+uPad,s=uRect.xy+uRect.zw*.5+aQ*h;vP=aQ*h;gl_Position=vec4(s.x/uRes.x*2.-1.,1.-s.y/uRes.y*2.,0.,1.);}`;
const FS_CARD=ext=>`${AA(ext)}precision highp float;varying vec2 vP;uniform vec4 uRect;uniform sampler2D uTex;
uniform float uMode,uDev,uIn,uHover,uReady,uRad,uTime;${AAF(ext)}
float box(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}
vec3 photo(vec2 p,vec2 h){return texture2D(uTex,clamp((p+h)/(2.*h),0.,1.)).rgb;}
void main(){vec2 h=uRect.zw*.5;
 if(uMode<.5){float ds=box(vP-vec2(0.,9.+5.*uHover),h-vec2(8.),uRad);float a=(1.-smoothstep(-22.,30.,ds))*(.12+.07*uHover)*uIn;
  if(a<.002)discard;gl_FragColor=vec4(vec3(.063,.086,.169)*a,a);return;}
 float d=box(vP,h,uRad),w=aa(d),inside=1.-smoothstep(-w,w,d);if(inside<.002)discard;
 vec3 paper=vec3(.925,.932,.995),cobalt=vec3(.204,.271,.922),col;
 if(uReady<.5){col=paper*(1.-.03*sin(vP.x*.02+uTime*3.));}
 else{
  // The plan: cobalt halftone on a 45 degree grid, each dot sized by the image at its cell centre.
  const float C=5.5;vec2 q=mat2(.7071,.7071,-.7071,.7071)*vP,cell=(floor(q/C)+.5)*C,ctr=mat2(.7071,-.7071,.7071,.7071)*cell;
  float L=dot(photo(ctr,h),vec3(.299,.587,.114)),r=C*.5*sqrt(clamp(1.-L,0.,1.))*1.12,dt=1.-smoothstep(r-.6,r+.6,length(q-cell));
  vec3 plan=mix(paper,cobalt,dt);
  // The scan develops it from the top: photograph above the line, plan below.
  float sy=mix(-h.y-40.,h.y+40.,uDev),dev=1.-smoothstep(sy-1.,sy+1.,vP.y),run=step(.001,uDev)*step(uDev,.999);
  col=mix(plan,photo(vP,h),dev);
  col+=vec3(.8,.937,.678)*exp(-max(0.,sy-vP.y)/34.)*dev*run*.42;
  col=mix(col,vec3(.063,.086,.169),exp(-pow((vP.y-sy-2.4)/.9,2.))*run*.55);
  col=mix(col,vec3(.88,1.,.76),exp(-pow((vP.y-sy)/1.5,2.))*run);}
 col*=1.+uHover*.04;col=mix(col,vec3(.063,.086,.169),(1.-smoothstep(.5,.5+w*1.5,abs(d+.6)))*.14);
 float a=inside*uIn;gl_FragColor=vec4(col*a,a);}`;
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS_BG=`precision mediump float;uniform vec2 uRes;uniform vec4 uBox;uniform float uDpr;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 f=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr,c=uBox.xy+uBox.zw*.5,q=(f-c)/max(uBox.z,uBox.w);
 vec3 col=mix(vec3(.961,.965,.98),vec3(.925,.93,.995),exp(-dot(q,q)*3.5)*.85);col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

let gl=null,program,attribs,CD,BG,quadBuf,fullBuf,ext=false,ready=false;
function useFallback(reason){ready=false;stop();if(reason)canvas.dataset.failure=String(reason);slide.classList.add('ev-flat');}
function upload(m){if(!gl||m.tex||!m.img.naturalWidth)return;const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,m.img);for(const[p,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,p,v);m.tex=t;}
function init(){try{const kit=window.ELMY_LIGHT.context(canvas);if(!kit)throw new Error('WebGL unavailable');({gl,program,attribs}=kit);
  ext=!!gl.getExtension('OES_standard_derivatives');CD=program(VS_CARD,FS_CARD(ext));BG=program(VS_BG,FS_BG);
  quadBuf=kit.buffer(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]));fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  all.forEach(m=>{if(m.img.complete)upload(m);m.img.addEventListener('load',()=>{upload(m);layoutKey='';if(active)render();});});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* Justified collage: every image keeps its proportions; rows are chosen to fill the stage best. */
function justify(as,W,H,gap){const n=as.length;let best=null;
 for(let mask=0;mask<1<<(n-1);mask++){const rows=[];let cur=[0];for(let i=1;i<n;i++){if(mask&1<<(i-1)){rows.push(cur);cur=[i];}else cur.push(i);}rows.push(cur);if(rows.length>3)continue;
  const hs=rows.map(r=>(W-gap*(r.length-1))/r.reduce((s,i)=>s+as[i],0)),inner=hs.reduce((a,b)=>a+b,0),s=Math.min(1,(H-gap*(rows.length-1))/inner);
  const area=rows.reduce((a,r,k)=>a+(hs[k]*s)**2*r.reduce((x,i)=>x+as[i],0),0),score=area*Math.pow(Math.min(...hs)/Math.max(...hs),.6);
  if(!best||score>best.score)best={rows,hs,s,score};}
 const{rows,hs,s}=best,T=hs.reduce((a,b)=>a+b*s,0)+gap*(rows.length-1),out=[];let y=(H-T)/2;
 rows.forEach((r,k)=>{const h=hs[k]*s,rw=r.reduce((x,i)=>x+as[i]*h,0)+gap*(r.length-1);let x=(W-rw)/2;r.forEach(i=>{const w=as[i]*h;out[i]=[x,y,w,h];x+=w+gap;});y+=h+gap;});return out;}
let stage={x:0,y:0,w:1,h:1},layoutKey='';
function measure(){window.ELMY_LIGHT.fit(canvas);const W=canvas.clientWidth,H=canvas.clientHeight,phone=innerWidth<=900,key=[W,H,phone,current,all.filter(m=>m.img.naturalWidth).length].join();
 if(key===layoutKey)return;layoutKey=key;
 if(phone)stage={x:14,y:8,w:W-28,h:H-16};
 else{const x0=Math.max(W*(W/H<1.45?.47:.43),copy.getBoundingClientRect().right+40),y0=Math.min(140,Math.max(98,H*.135)),y1=H-Math.max(118,H*.14);stage={x:x0,y:y0,w:W-Math.max(W*.055,40)-x0,h:y1-y0};}
 placeCards(cards.filter(c=>c.c===current));}
function placeCards(set){const rects=justify(set.map(c=>aspect(c.m)),stage.w,stage.h,12);
 set.forEach((c,k)=>{const[x,y,w,h]=rects[k];c.rect=[stage.x+x,stage.y+y,w,h];Object.assign(c.el.style,{left:c.rect[0].toFixed(1)+'px',top:c.rect[1].toFixed(1)+'px',width:w.toFixed(1)+'px',height:h.toFixed(1)+'px'});c.el.classList.toggle('is-small',w<120||h<70);});}
function render(){if(!ready)return;measure();frames++;const W=canvas.width,H=canvas.height,cw=canvas.clientWidth,ch=canvas.clientHeight,dpr=W/Math.max(1,cw);gl.viewport(0,0,W,H);
 gl.disable(gl.BLEND);gl.useProgram(BG.p);attribs(BG,fullBuf,[['aP',2,0]],2);gl.uniform2f(BG.u.uRes,cw,ch);gl.uniform4f(BG.u.uBox,stage.x,stage.y,stage.w,stage.h);gl.uniform1f(BG.u.uDpr,dpr);gl.drawArrays(gl.TRIANGLES,0,3);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.useProgram(CD.p);attribs(CD,quadBuf,[['aQ',2,0]],2);const u=CD.u;
 gl.uniform2f(u.uRes,cw,ch);gl.uniform1f(u.uRad,Math.min(10,stage.w*.014));gl.uniform1f(u.uTime,time);if(!ext)gl.uniform1f(u.uDpr,dpr);gl.uniform1i(u.uTex,0);gl.activeTexture(gl.TEXTURE0);
 for(const mode of[0,1])for(const c of cards){if(c.in<.003||!c.rect)continue;const s=.965+.035*c.in,[x,y,w,h]=c.rect,shift=(1-c.in)*14*c.dir-c.hover*3;
  gl.uniform4f(u.uRect,x+w*(1-s)/2,y+h*(1-s)/2+shift,w*s,h*s);gl.uniform1f(u.uPad,mode?1:40);gl.uniform1f(u.uMode,mode);gl.uniform1f(u.uIn,c.in);gl.uniform1f(u.uHover,c.hover);gl.uniform1f(u.uDev,c.dev);
  gl.uniform1f(u.uReady,c.m.tex?1:0);if(c.m.tex)gl.bindTexture(gl.TEXTURE_2D,c.m.tex);gl.drawArrays(gl.TRIANGLES,0,6);}}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Cards: one per image of the current chapter, with an accessible button over each for enlarging. */
let cards=[],current=0,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,textTl=null,panelTl=null;
function makeCard(m){const el=document.createElement('button');el.type='button';el.className='ev-card';el.setAttribute('aria-label',`Enlarge: ${m.caption}`);
 el.innerHTML=`<img src="assets/project/${m.file}" alt="" decoding="async"><span class="ev-cap">${m.caption}</span>`;layer.append(el);
 const c={m,c:m.c,el,rect:null,in:0,dev:0,hover:0,dir:1};
 el.addEventListener('pointerenter',()=>tw(c,{hover:1},.35));el.addEventListener('pointerleave',()=>tw(c,{hover:0},.35));el.addEventListener('focus',()=>tw(c,{hover:1},.35));el.addEventListener('blur',()=>tw(c,{hover:0},.35));
 el.addEventListener('click',()=>openMedia(m,el));return c;}
const tw=(o,v,d)=>{if(g&&motion&&ready)g.to(o,{...v,duration:d,ease:'power2.out',overwrite:'auto'});else{Object.assign(o,v);render();}};
function openMedia(m,trigger){let d=document.getElementById('media-dialog');
 if(!d){d=document.createElement('dialog');d.id='media-dialog';d.innerHTML='<div><p></p><button type="button">Close ×</button></div><img alt="">';document.body.append(d);d.querySelector('button').onclick=()=>d.close();d.addEventListener('close',()=>window.lastMediaTrigger?.focus());}
 window.lastMediaTrigger=trigger;const cap=m.caption;d.querySelector('img').src='assets/project/'+m.file;d.querySelector('img').alt=cap;d.querySelector('p').textContent=cap;d.showModal();}
function write(i){const c=CH[i];detail.title.textContent=c.title;detail.text.textContent=c.text;chapters.forEach((b,k)=>b.setAttribute('aria-pressed',String(k+1===i)));slide.dataset.chapter=String(i);slide.dataset.view=i===0?'intro':i===LAST?'final':'area';}
function show(i,animate){const old=cards;old.forEach(c=>{c.el.classList.remove('is-dev');c.el.tabIndex=-1;});
 const next=items[i].map(makeCard);cards=[...old,...next];layoutKey='';measure();
 if(!animate){old.forEach(c=>c.el.remove());cards=next;next.forEach(c=>{c.in=1;c.dev=1;c.el.classList.add('is-dev');});render();return;}
 old.forEach(c=>{c.dir=-1;g.killTweensOf(c);g.to(c,{in:0,duration:.35,ease:'power2.in',onComplete:()=>{c.el.remove();cards=cards.filter(x=>x!==c);}});});
 next.forEach((c,k)=>{g.to(c,{in:1,duration:.55,delay:.2+k*.06,ease:'power3.out'});
  g.to(c,{dev:1,duration:1.05,delay:.6+k*.16,ease:'power2.inOut',onComplete:()=>c.el.classList.add('is-dev')});});}
function go(i,animate=motion){i=Math.max(0,Math.min(CH.length-1,i));if(i===current)return;const dir=i>current?1:-1;current=i;
 if(!g||!animate||!ready){write(i);show(i,false);return;}
 show(i,true);const parts=[detail.title,detail.text];panelTl?.progress(1);
 panelTl=g.timeline().to(parts,{opacity:0,y:-8*dir,duration:.2,ease:'power2.in',stagger:.02}).add(()=>write(i)).fromTo(parts,{opacity:0,y:12*dir},{opacity:1,y:0,duration:.55,ease:'power3.out',stagger:.05});}
chapters.forEach((b,i)=>b.addEventListener('click',()=>go(i+1)));
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;go(current+Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){cards.forEach(c=>{c.in=0;c.dev=0;c.el.classList.remove('is-dev');g.killTweensOf(c);});
 cards.forEach((c,k)=>{g.to(c,{in:1,duration:.7,delay:.55+k*.07,ease:'power3.out'});g.to(c,{dev:1,duration:1.1,delay:1.05+k*.17,ease:'power2.inOut',onComplete:()=>c.el.classList.add('is-dev')});});}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out',lazy:false}})
  .fromTo(q('.ev-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.ev-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.ev-list li'),{opacity:0,x:-12},{opacity:1,x:0,duration:.7,stagger:.07},full?.55:.15)
  .fromTo(q('.ev-subtitle,.ev-detail,.ev-final'),{opacity:0,y:12},{opacity:1,y:0,duration:.8,stagger:.08},full?.5:.2)
  .fromTo(q('.ev-foot'),{opacity:0},{opacity:1,duration:.8},full?1.4:.45);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.ev-kicker,.ev-line>span,.ev-subtitle,.ev-list li,.ev-detail,.ev-final,.ev-foot',slide),{clearProps:'opacity,transform'});}
function finish(){cards.forEach(c=>{if(g)g.killTweensOf(c);});cards.filter(c=>c.c!==current).forEach(c=>c.el.remove());cards=cards.filter(c=>c.c===current);
 cards.forEach(c=>{c.in=1;c.dev=1;c.dir=1;c.el.classList.add('is-dev');c.el.tabIndex=0;});}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{layoutKey='';if(active){if(!raf)render();else measure();}}).observe(canvas);
addEventListener('resize',()=>{layoutKey='';});

window.ELMY_EVIDENCE={
 id:'experience',keys:['ArrowDown','ArrowUp','PageDown','PageUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();textTl?.progress(1,true);finish();if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}layoutKey='';render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){go(current+(['ArrowDown','PageDown'].includes(k)?1:-1));},
 go,
 debug:{get cards(){return cards;},render,get stage(){return stage;},get state(){return{current,ready,frames,failure:canvas.dataset.failure||null,textures:all.filter(m=>m.tex).length};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_EVIDENCE);
init();write(current);show(current,false);
})();

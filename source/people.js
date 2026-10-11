/* People scene: the ELMY knot as four strands around a centre dot, one strand per leader. The
   strands fly in from four sides and lock together; selecting a leader lights that strand and opens
   their perspective. The mark stays one flat colour; only its glow and opacity change. Masks are
   drawn from the inline brand SVG into textures, so the mark is exact. Local WebGL and GSAP only. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const slide=$('[data-semantic-id="people"]');if(!slide||!window.ELMY_LIGHT)return;
const{M,VS_BG,FS_BG}=window.ELMY_LIGHT,g=window.gsap;
const canvas=$('.pp-canvas',slide),svg=$('.pp-mark',slide),people=$$('.pp-person',slide),list=$('.pp-people',slide);
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

let gl=null,program,attribs,LY,BG,quadBuf,fullBuf,tex=[],ready=false;
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
  LY=program(VS,FS);BG=program(VS_BG,FS_BG);quadBuf=kit.buffer(new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]));fullBuf=kit.buffer(new Float32Array([-1,-1,3,-1,-1,3]));
  tex=masks().map(upload);canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();useFallback('context lost');});ready=true;}catch(e){useFallback(e.message||e);}}

/* State: each strand's arrival and emphasis, the dot, a glow flash and one sheen pass. */
const S={inn:[0,0,0,0],dim:[1,1,1,1],dot:0,flash:0,sheen:0,glow:1};
let selected=-1,hovered=-1,active=false,motion=true,played=false,time=0,last=0,raf=0,frames=0,tl=null,textTl=null,view={c:[0,0],px:400,fov:.5};
function measure(){const aspect=window.ELMY_LIGHT.fit(canvas),W=canvas.clientWidth,H=canvas.clientHeight,phone=innerWidth<=900;
 if(phone){const s=Math.min(W,H)*.8;view={c:[W/2,H/2],px:s/KNOT,fov:.5};return aspect;}
 const top=slide.getBoundingClientRect().top,band0=Math.max(90,H*.115),band1=list.getBoundingClientRect().bottom-top-168,size=Math.min(W*.29,(band1-band0)*.9);
 view={c:[W*(aspect<1.45?.73:.71),(band0+band1)/2],px:size/KNOT,fov:.5};return aspect;}
function render(){if(!ready)return;const aspect=measure();frames++;const W=canvas.width,H=canvas.height,ch=canvas.clientHeight,cw=canvas.clientWidth;gl.viewport(0,0,W,H);
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
 if(S.dot>.002)layer(4,1,[0,1,0,0],clamp(S.dot*2),1,S.glow+S.flash*2.2,M.mul(tilt,M.mul(M.translate(0,0,.02),M.scale(Q*Math.max(.001,S.dot)))));}
function loop(now){raf=requestAnimationFrame(loop);const dt=Math.min(.05,(now-(last||now))/1000);last=now;time+=dt;render();}
function start(){if(!ready||raf||!active||!motion||document.hidden)return;last=0;raf=requestAnimationFrame(loop);}
function stop(){cancelAnimationFrame(raf);raf=0;}

/* Leaders. Hover previews a strand; a click (or Down/Up) selects one and opens their perspective. */
function emphasis(){const focus=hovered>=0?hovered:selected,target=S.dim.map((_,k)=>focus<0||k===focus?1:.2);
 people.forEach((b,k)=>{b.setAttribute('aria-pressed',String(k===selected));b.classList.toggle('is-focus',k===focus);});slide.classList.toggle('pp-focused',focus>=0);
 if(g&&motion&&ready)g.to(S.dim,{...Object.fromEntries(target.map((v,k)=>[k,v])),duration:.5,ease:'power2.out',overwrite:true});else{target.forEach((v,k)=>S.dim[k]=v);render();}}
function select(k){selected=selected===k?-1:k;emphasis();}
function step(dir){const order=[-1,0,1,2,3],i=order.indexOf(selected);selected=order[(i+dir+order.length)%order.length];hovered=-1;emphasis();}
people.forEach((b,k)=>{b.addEventListener('click',()=>select(k));b.addEventListener('pointerenter',()=>{hovered=k;emphasis();});b.addEventListener('pointerleave',()=>{hovered=-1;emphasis();});
 b.addEventListener('focus',()=>{hovered=k;emphasis();});b.addEventListener('blur',()=>{hovered=-1;emphasis();});});
let wheelSum=0,wheelLast=0,wheelTime=0;
slide.addEventListener('wheel',e=>{if(!active||innerWidth<=900||Math.abs(e.deltaX)>=Math.abs(e.deltaY))return;e.preventDefault();const now=Date.now();if(now-wheelLast>180)wheelSum=0;wheelLast=now;if(now-wheelTime<800)return;wheelSum+=e.deltaY;if(Math.abs(wheelSum)<60)return;step(Math.sign(wheelSum));wheelSum=0;wheelTime=now;},{passive:false});

function intro(){tl?.kill();S.inn.fill(0);S.dot=0;S.flash=0;S.sheen=0;
 tl=g.timeline({onComplete:()=>{tl=null;}});
 [0,2,1,3].forEach((k,j)=>tl.to(S.inn,{[k]:1,duration:1.35,ease:'expo.out'},.45+j*.13));
 tl.to(S,{dot:1,duration:.9,ease:'back.out(2.2)'},1.25).fromTo(S,{flash:0},{flash:1,duration:.25,ease:'power2.out'},1.3).to(S,{flash:0,duration:1.2,ease:'power2.in'},1.55)
  .fromTo(S,{sheen:0},{sheen:1,duration:1.5,ease:'power2.inOut'},1.7);}
function text(full){textTl?.kill();if(!g||!motion){settle();return;}const q=s=>$$(s,slide);
 textTl=g.timeline({defaults:{ease:'power3.out',lazy:false}})
  .fromTo(q('.pp-kicker'),{opacity:0,y:10},{opacity:1,y:0,duration:.8},full?.1:0)
  .fromTo(q('.pp-line>span'),{yPercent:112},{yPercent:0,duration:1.15,stagger:.1,ease:'power4.out'},full?.18:.04)
  .fromTo(q('.pp-statements>div'),{opacity:0,y:14},{opacity:1,y:0,duration:.85,stagger:.12},full?.7:.2)
  .fromTo(q('.pp-people li'),{opacity:0,y:22},{opacity:1,y:0,duration:.9,stagger:.09},full?1.2:.3);}
function settle(){textTl?.kill();textTl=null;if(g)g.set($$('.pp-kicker,.pp-line>span,.pp-statements>div,.pp-people li',slide),{clearProps:'opacity,transform'});}
function finish(){if(tl){tl.progress(1,true);tl.kill();tl=null;}S.inn.fill(1);S.dot=1;S.flash=0;S.sheen=0;}
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
new ResizeObserver(()=>{if(active&&!raf)render();}).observe(canvas);

window.ELMY_PEOPLE={
 id:'people',keys:['ArrowDown','ArrowUp'],
 activate(s,on){motion=on;const was=active;active=s===slide;if(!active){stop();textTl?.progress(1,true);finish();if(was)played=true;return;}if(was)return;
  if(on&&g&&ready&&!played){played=true;intro();text(true);}else{finish();text(false);}render();start();},
 mode(on){motion=on;if(!on){finish();settle();stop();render();}else start();},
 key(k){step(k==='ArrowDown'?1:-1);},
 select,
 debug:{S,render,get state(){return{selected,hovered,ready,frames,failure:canvas.dataset.failure||null};},seek(t){time=t;render();}}
};
(window.ELMY_SCENES=window.ELMY_SCENES||[]).push(window.ELMY_PEOPLE);
init();finish();
})();

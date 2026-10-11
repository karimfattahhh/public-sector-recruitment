/* Shared toolkit for the deck's real-time light scenes: seeded randomness, matrix maths,
   WebGL program helpers and the common point, line, spark and background shaders. */
(()=>{'use strict';
function rng(seed){return()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l];};
const M={
 mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
 perspective(f,a,n,far){const t=1/Math.tan(f/2),nf=1/(n-far);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(far+n)*nf,-1,0,0,2*far*n*nf,0]);},
 lookAt(e,c,u){const z=norm(sub(e,c)),x=norm(cross(u,z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,e),-dot(y,e),-dot(z,e),1]);},
 translate(x,y,z){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]);},
 scale(s){return new Float32Array([s,0,0,0,0,s,0,0,0,0,s,0,0,0,0,1]);},
 rx(t){const c=Math.cos(t),s=Math.sin(t);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);},
 ry(t){const c=Math.cos(t),s=Math.sin(t);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);},
 rz(t){const c=Math.cos(t),s=Math.sin(t);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]);},
 apply(m,p){const[x,y,z]=p;return[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14],m[3]*x+m[7]*y+m[11]*z+m[15]];}
};
const compose=(...m)=>m.reduce((a,b)=>M.mul(a,b));
/* Points spread evenly along polylines ([[x,y,z],...] each), with optional jitter. */
function sample(polys,n,jit,rand){const segs=[];let total=0;
 for(const p of polys)for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);if(l>0){segs.push([a,b,l]);total+=l;}}
 const out=[];let si=0,acc=0;
 for(let k=0;k<n;k++){const d=(k+rand()*.6)/n*total;while(si<segs.length-1&&acc+segs[si][2]<d){acc+=segs[si][2];si++;}const[a,b,l]=segs[si],t=Math.min(1,(d-acc)/l);
  out.push([a[0]+(b[0]-a[0])*t+(rand()-.5)*jit,a[1]+(b[1]-a[1])*t+(rand()-.5)*jit,a[2]+(b[2]-a[2])*t+(rand()-.5)*jit]);}
 return out;}

/* Point sprites: 0 soft dot, 1 ring, 2 disk, 3 walking figure (vP is the stride phase). */
const FS_POINTS=`precision mediump float;varying vec4 vC;varying float vS,vP;
float figure(vec2 q,float ph){float head=length(q-vec2(0.,-.7))-.19;
 float wt=mix(.25,.19,clamp((q.y+.46)/.7,0.,1.)),torso=max(abs(q.x)-wt,abs(q.y+.1)-.36);
 float l1=.05*max(0.,ph),l2=.05*max(0.,-ph);
 float a=max(abs(q.x+.085)-.068,abs(q.y-.575+l1*.5)-.375+l1*.5),b=max(abs(q.x-.085)-.068,abs(q.y-.575+l2*.5)-.375+l2*.5);
 return(1.-smoothstep(-.02,.03,min(min(head,torso),min(a,b))))*(.8-.25*q.y);}
void main(){vec2 q=gl_PointCoord*2.-1.;float r=length(q);if(r>1.)discard;
 float d0=exp(-r*r*7.)+exp(-r*r*42.)*.6,d1=smoothstep(.13,0.,abs(r-.7))+(1.-smoothstep(.55,.66,r))*.07,d2=1.-smoothstep(.72,.86,r),d3=vS>2.?figure(q,vP):0.;
 float a=d0*clamp(1.-abs(vS),0.,1.)+d1*clamp(1.-abs(vS-1.),0.,1.)+d2*clamp(1.-abs(vS-2.),0.,1.)+d3*clamp(1.-abs(vS-3.),0.,1.);
 a*=vC.a;if(a<.003)discard;gl_FragColor=vec4(vC.rgb*a,a);}`;
/* Dynamic lines and sparks: position, rgba and world size; uFog = (distance, falloff). */
const VS_FLAT=`precision highp float;attribute vec3 aP;attribute vec4 aC;attribute float aS;uniform mat4 uProj,uView,uWorld;uniform vec2 uShift,uFog;uniform float uPx,uVis,uMirror,uFloor;varying vec4 vC;
void main(){vec3 p=aP;float m=1.;if(uMirror>.5){p.y=2.*uFloor-p.y;m=.16*exp(-(uFloor-p.y)*1.6);}vec4 v=uView*uWorld*vec4(p,1.),c=uProj*v;c.xy+=uShift*c.w;gl_Position=c;gl_PointSize=max(1.6,aS*uPx/c.w);vC=vec4(aC.rgb,aC.a*m*uVis*clamp(1.32-(c.w-uFog.x)*uFog.y,.3,1.));}`;
const FS_LINE=`precision mediump float;varying vec4 vC;void main(){gl_FragColor=vec4(vC.rgb*vC.a,vC.a);}`;
const FS_SPARK=`precision mediump float;varying vec4 vC;void main(){vec2 q=gl_PointCoord*2.-1.;float r=dot(q,q);float a=(exp(-r*6.)+exp(-r*40.)*.8)*vC.a;gl_FragColor=vec4(vC.rgb*a,a);}`;
/* Navy field with a cobalt glow at uGlow and a vignette centred on uVig. */
const VS_BG=`attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}`;
const FS_BG=`precision mediump float;uniform vec2 uRes,uGlow,uVig;uniform float uGlowA;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 p=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 d=(p-uGlow)*vec2(asp,1.);float r2=dot(d,d);
 vec3 col=vec3(.043,.071,.157)+vec3(.09,.12,.4)*exp(-r2*2.4)*uGlowA+vec3(.14,.16,.36)*exp(-r2*13.)*uGlowA*.55+vec3(.018,.024,.06)*(1.-p.y);
 col*=1.-.34*smoothstep(.35,1.3,distance(p*vec2(asp,1.),uVig*vec2(asp,1.)));col+=(h(gl_FragCoord.xy)-.5)/255.;gl_FragColor=vec4(col,1.);}`;

/* A WebGL context with program and attribute helpers; null when WebGL is unavailable. */
function context(canvas){
 const gl=canvas.getContext('webgl',{alpha:false,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
 if(!gl)return null;
 let enabled=new Set();
 function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
 function program(vs,fs){const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const info={p,a:{},u:{}};for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);i++){const x=gl.getActiveAttrib(p,i);info.a[x.name]=gl.getAttribLocation(p,x.name);}
  for(let i=0;i<gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i++){const x=gl.getActiveUniform(p,i);info.u[x.name.replace('[0]','')]=gl.getUniformLocation(p,x.name);}return info;}
 function attribs(info,buffer,layout,stride){gl.bindBuffer(gl.ARRAY_BUFFER,buffer);const next=new Set();for(const[name,size,offset]of layout){const loc=info.a[name];if(loc===undefined||loc<0)continue;next.add(loc);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride*4,offset*4);}
  for(const loc of enabled)if(!next.has(loc))gl.disableVertexAttribArray(loc);enabled=next;}
 function buffer(data,usage=gl.STATIC_DRAW){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,usage);return b;}
 return{gl,program,attribs,buffer};
}
/* Match the canvas backing store to its CSS size (capped device pixel ratio); returns the aspect ratio. */
function fit(canvas){const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight,dpr=Math.min(devicePixelRatio||1,2,3200/Math.max(w,1));
 const W=Math.max(1,Math.round(w*dpr)),H=Math.max(1,Math.round(h*dpr));if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}return w/h;}
window.ELMY_LIGHT={rng,sub,dot,cross,norm,M,compose,sample,context,fit,FS_POINTS,VS_FLAT,FS_LINE,FS_SPARK,VS_BG,FS_BG};
})();

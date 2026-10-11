/* Framer-inspired variants and layout transitions; Raylight-inspired scene timing.
   Local GSAP owns the timelines. No network or third-party runtime is required. */
(()=>{'use strict';
 const g=window.gsap,$=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
 let interaction=null,sceneTimeline=null,enabled=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const icon='<svg class="ui-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 18L18 6M6 6H18V18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
 function reset(){interaction?.revert();interaction=null;$$('[data-final-count]').forEach(e=>e.textContent=e.dataset.finalCount);}
 function finish(){sceneTimeline?.progress(1);}
 function scope(s,fn){if(!g||!enabled||!s?.classList.contains('active'))return;finish();interaction?.revert();interaction=g.context(fn,s);}
 function reveal(t,els,at=.2,vars={}){els=Array.isArray(els)?els:[els];els=els.filter(Boolean);if(els.length)t.fromTo(els,{opacity:0,y:24,...vars},{opacity:1,y:0,scale:1,rotation:0,duration:.8,stagger:.075,ease:'power3.out'},at);}
 function headline(t,s){reveal(t,$('.eyebrow',s),.08,{y:0});let lines=$$('.motion-line,.title-mask>span',s);if(lines.length)t.fromTo(lines,{yPercent:108,rotation:1.5},{yPercent:0,rotation:0,duration:1.05,stagger:.11,ease:'power4.out'},.13);}
 function count(t,e,at=.3){if(!e)return;const final=e.dataset.finalCount||e.textContent;const end=Number(final.replace(/,/g,''));if(!Number.isFinite(end))return;e.dataset.finalCount=final;const v={n:0};t.to(v,{n:end,duration:1.2,ease:'power3.out',onUpdate:()=>e.textContent=Math.round(v.n).toLocaleString('en-US'),onComplete:()=>e.textContent=final},at);}
 function scene(s){if(!g)return;enabled=true;const id=s.dataset.semanticId,t=g.timeline({defaults:{ease:'power3.out'}});sceneTimeline=t;if(id!=='opening')headline(t,s);
  
  
  
  
  
  reveal(t,$('.footnote',s),1.3,{y:0});return t;
 }
 function state(id,i,previous,s,on){enabled=on;if(!on||!s.classList.contains('active'))return;scope(s,()=>{const t=g.timeline();});}
 function detail(elements,on){enabled=on;const s=elements[0]?.closest('.slide');scope(s,()=>{const t=g.timeline();reveal(t,elements,0,{y:13});});}
 function capture(r){return [...r.children].map(el=>({el,rect:el.getBoundingClientRect()}));}
 function layout(before,t){if(innerWidth<=900)return;for(const {el,rect} of before||[]){if(el.hidden)continue;const next=el.getBoundingClientRect();if(!next.width||!rect.width)continue;t.fromTo(el,{x:rect.left-next.left,y:rect.top-next.top,scaleX:rect.width/next.width,transformOrigin:'left top'},{x:0,y:0,scaleX:1,duration:.7,ease:'power3.inOut'},0);}}
 function expansion(b,open,before,on){enabled=on;const s=b.closest('.slide'),parent=b.parentElement;if(b.classList.contains('challenge')&&innerWidth>1100){parent.style.gridTemplateColumns=$$('.challenge',parent).map(x=>x.getAttribute('aria-expanded')==='true'?'1.55fr':'1fr').join(' ');}if(!on)return;scope(s,()=>{const t=g.timeline();layout(before,t);if(open)reveal(t,$$('.revealed:not([hidden]),p:not([hidden])',b),.15,{y:13});});}
 
 window.ELMY_FX={icon,finish,scene,state,detail,reset,capture,expansion,mode:on=>{enabled=on;reset();}};
 
 
})();

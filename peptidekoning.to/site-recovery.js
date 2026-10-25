(function(){
'use strict';
const base='/peptidekoning/peptidekoning.to/';
const origin='https://peptidekoning.to';
function local(url){try{const u=new URL(url,location.href);if(u.hostname==='peptidekoning.to'||u.hostname==='www.peptidekoning.to'){
let p=u.pathname;if(p==='/'||p==='')p='/index.html';else if(p.endsWith('/'))p+='index.html';else if(!/\.[a-z0-9]+$/i.test(p))p+='.html';
return base+p.replace(/^\//,'')+u.search+u.hash;
}return null;}catch(e){return null;}}
// Capture navigation before Next.js' client router can send users back to the old domain.
document.addEventListener('click',function(e){const a=e.target.closest&&e.target.closest('a[href]');if(!a)return;const target=local(a.href);if(target){e.preventDefault();e.stopImmediatePropagation();if(e.ctrlKey||e.metaKey||e.button===1)window.open(target,'_blank');else location.assign(target);}},true);
// Remove Next.js original-domain image optimizer references when a local HTTrack image exists.
function imageFix(){document.querySelectorAll('img').forEach(function(im){const raw=im.getAttribute('src')||'';if(raw.includes('/_next/')&&raw.includes('?url=')){im.setAttribute('src',raw.split('?')[0]);}if(im.hasAttribute('srcset')){const ss=im.getAttribute('srcset');if(ss.includes('?url=')){im.setAttribute('srcset',ss.replace(/\?url=[^\s,]*/g,''));}}});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',imageFix);else imageFix();
})();

/* Recover product listings hidden by server-rendered reveal animations. */
(function(){
 function reveal(){
  document.querySelectorAll('.products-grid [style]').forEach(function(el){
   var st=el.style;
   if(st.opacity==='0' && (st.transform||st.transitionDelay)){
    st.setProperty('opacity','1','important');
    st.setProperty('transform','none','important');
    st.setProperty('visibility','visible','important');
   }
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal);
 else reveal();
 var n=0;var observer=new MutationObserver(function(){if(n++<150)reveal();else observer.disconnect()});
 observer.observe(document.documentElement,{childList:true,subtree:true});
 window.addEventListener('load',reveal);
})();

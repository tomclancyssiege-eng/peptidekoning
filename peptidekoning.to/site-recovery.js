
/* Product links must do a complete document load so the offline controls initialize. */
(function(){'use strict';
window.addEventListener('click',function(event){
 if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 const anchor=event.target.closest&&event.target.closest('a[href]');if(!anchor||anchor.hasAttribute('download')||anchor.target==='_blank')return;
 let u;try{u=new URL(anchor.href,location.href)}catch(_){return}
 if(u.origin!==location.origin)return;
 if(!/\/(?:nl\/)?products\/[^/]+\.html$/i.test(u.pathname))return;
 if(u.href===location.href)return;
 event.preventDefault();event.stopImmediatePropagation();
 window.location.assign(u.href);
},true);
})();

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

/* Unified offline catalog: sort/filter across all archived product pages. */
(function(){'use strict';
const BASE='/peptidekoning/peptidekoning.to/';
const CATS={'all':'all','peptides':'peptides','nasal sprays':'nasal sprays','topicals':'topicals','pens':'pens','research supplies':'research supplies','bundles':'bundles'};
const pageRoutes={'all':'products.html','peptides':'products3d6b.html','nasal sprays':'products59fa.html','topicals':'products9ec1.html','pens':'products23b0.html','research supplies':'productsaa38.html','bundles':'bundles.html'};
function label(s){return (s||'').trim().toLowerCase().replace(/\s+/g,' ')}
function init(){
 const grid=document.querySelector('.products-grid > div');if(!grid)return;
 const search=document.querySelector('input[placeholder*="Search products"],input[placeholder*="Zoek producten"]');
 const sort=document.querySelector('select#sort');
 const params=new URLSearchParams(location.search);
 const path=location.pathname.split('/').pop();
 let category=Object.keys(pageRoutes).find(k=>pageRoutes[k]===path)||'all';
 if(path==='products3d6b.html')category='peptides';
 let page=1, perPage=12, data=[];
 const pagination=document.createElement('nav');pagination.id='pk-pagination';pagination.style.cssText='display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:10px;padding:25px;color:#eee';
 grid.parentElement.appendChild(pagination);
 const error=document.createElement('p');error.style.cssText='text-align:center;color:#ddd;padding:16px';grid.parentElement.appendChild(error);
 function setCategory(c){if(c==='bundles'||['pens','nasal sprays','topicals','research supplies'].includes(c)){location.assign(BASE+pageRoutes[c]);return;}category=c;page=1;search&&(search.value='');render();history.replaceState(null,'',BASE+(pageRoutes[c]||'products.html'));}
 function render(){
  if(!data.length)return;
  let q=label(search?.value);let filtered=data.filter(x=>(category==='all'||x.category===category)&&(!q||label(x.name).includes(q)));
  let mode=sort?.value||'popularity-desc';
  if(mode==='price-asc')filtered.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
  if(mode==='price-desc')filtered.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));
  if(mode==='title-asc')filtered.sort((a,b)=>a.name.localeCompare(b.name));
  if(mode==='title-desc')filtered.sort((a,b)=>b.name.localeCompare(a.name));
  const count=Math.max(1,Math.ceil(filtered.length/perPage));page=Math.max(1,Math.min(page,count));
  grid.innerHTML=filtered.slice((page-1)*perPage,page*perPage).map(x=>x.html).join('');
  error.textContent=filtered.length?'':'Geen producten gevonden / No products found';
  pagination.innerHTML='';
  function btn(txt,p,disabled){let b=document.createElement('button');b.textContent=txt;b.disabled=disabled;b.style.cssText='background:#e5c541;color:#151515;padding:8px 13px;border-radius:3px;cursor:pointer;opacity:'+(disabled?'.4':'1');b.addEventListener('click',()=>{page=p;render();grid.scrollIntoView({block:'start',behavior:'smooth'});});pagination.appendChild(b)}
  if(count>1){btn('‹',page-1,page===1);for(let i=1;i<=count;i++)btn(String(i),i,i===page);btn('›',page+1,page===count)}
  document.querySelectorAll('button').forEach(b=>{const c=CATS[label(b.textContent)];if(!c)return;b.setAttribute('aria-pressed',String(c===category));});
 }
 search?.addEventListener('input',()=>{page=1;render()});sort?.addEventListener('change',()=>{page=1;render()});
 // Capture top-level category controls before broken React handlers run.
 document.addEventListener('click',function(e){let b=e.target.closest('button');if(!b)return;const c=CATS[label(b.textContent)];if(!c)return;
 const parent=b.parentElement;if(!parent)return;const siblings=[...parent.children].filter(x=>x.tagName==='BUTTON');
 if(siblings.length<5||!siblings.some(x=>label(x.textContent)==='research supplies'))return;
 e.preventDefault();e.stopImmediatePropagation();setCategory(c);
 },true);
 fetch(BASE+'offline-catalog.json').then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(items=>{data=items;render()}).catch(err=>{error.textContent='Productcatalogus kan niet worden geladen: '+err.message;console.error(err)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

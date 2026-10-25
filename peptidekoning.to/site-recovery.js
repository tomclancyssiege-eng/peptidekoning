
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

/* Shop category separation and one pagination control; preserves product-page cart fixes. */
(function(){'use strict';
const BASE='/peptidekoning/peptidekoning.to/';
const ROUTES={'all':'products.html','peptides':'products6d27.html','nasal sprays':'products59fa.html','topicals':'products9ec1.html','pens':'products23b0.html','research supplies':'productsaa38.html','bundles':'bundles.html'};
const names={'all':'ALL','peptides':'PEPTIDES','nasal sprays':'NASAL SPRAYS','topicals':'TOPICALS','pens':'PENS','research supplies':'RESEARCH SUPPLIES','bundles':'BUNDLES'};
const norm=s=>(s||'').trim().replace(/\s+/g,' ').toUpperCase();
function init(){
 const grid=document.querySelector('.products-grid > div'); if(!grid)return;
 const path=location.pathname.split('/').pop();
 let category=Object.keys(ROUTES).find(k=>ROUTES[k]===path)||'all';
 // Some archived Peptides pages have alternate filenames.
 if(/^products(?:3d6b|6d27)\.html$/.test(path))category='peptides';
 const search=document.querySelector('input[placeholder*="Search products"],input[placeholder*="Zoek producten"]');
 const sort=document.querySelector('select#sort');
 let page=1, data=[]; const perPage=12;
 const style=document.createElement('style');style.textContent='.products-pagination{display:none!important}#pk-shop-pages{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:36px 0}#pk-shop-pages button{padding:10px 15px;border-radius:3px;background:#e5c646;color:#000}#pk-shop-pages button:disabled{opacity:.55;cursor:default}';document.head.appendChild(style);
 const nav=document.createElement('nav');nav.id='pk-shop-pages';nav.setAttribute('aria-label','Product pages');grid.parentElement.appendChild(nav);
 const msg=document.createElement('p');msg.style.cssText='text-align:center;padding:20px;color:#ddd';grid.parentElement.appendChild(msg);
 function render(){
  if(!data.length){grid.replaceChildren();msg.textContent='Geen producten beschikbaar';nav.replaceChildren();return}
  const q=norm(search&&search.value);let items=data.filter(x=>(category==='all'||x.category===category)&&(!q||norm(x.name).includes(q)));
  const order=sort&&sort.value;
  if(order==='price-asc')items.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
  else if(order==='price-desc')items.sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));
  else if(order==='title-asc')items.sort((a,b)=>a.name.localeCompare(b.name));
  else if(order==='title-desc')items.sort((a,b)=>b.name.localeCompare(a.name));
  const pages=Math.ceil(items.length/perPage);page=Math.min(Math.max(1,page),Math.max(1,pages));
  grid.innerHTML=items.slice((page-1)*perPage,page*perPage).map(x=>x.html).join('');
  msg.textContent=items.length?'':'Geen producten gevonden / No products found';
  nav.replaceChildren();
  function button(label,target,disabled){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;b.addEventListener('click',()=>{page=target;render();grid.scrollIntoView({behavior:'smooth',block:'start'})});nav.appendChild(b)}
  if(pages>1){button('‹',page-1,page===1);for(let i=1;i<=pages;i++)button(String(i),i,i===page);button('›',page+1,page===pages)}
  document.querySelectorAll('button').forEach(b=>{const key=Object.keys(names).find(k=>names[k]===norm(b.textContent));if(key)b.setAttribute('aria-pressed',String(key===category))});
 }
 function changeCategory(c){
  if(c==='bundles'){location.assign(BASE+'bundles.html');return}
  category=c;page=1;if(search)search.value='';
  // Full navigation gives the proper original category title and highlighted tab.
  location.assign(BASE+ROUTES[c]);
 }
 document.addEventListener('click',function(e){const b=e.target.closest&&e.target.closest('button');if(!b)return;const key=Object.keys(names).find(k=>names[k]===norm(b.textContent));if(!key)return;
  const siblings=b.parentElement&&[...b.parentElement.children].filter(x=>x.tagName==='BUTTON');
  if(!siblings||siblings.length<5||!siblings.some(x=>norm(x.textContent)==='RESEARCH SUPPLIES'))return;
  e.preventDefault();e.stopImmediatePropagation();if(key!==category)changeCategory(key);
 },true);
 search&&search.addEventListener('input',()=>{page=1;render()});
 sort&&sort.addEventListener('change',()=>{page=1;render()});
 fetch(BASE+'offline-catalog.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(x=>{data=x;render()}).catch(e=>{msg.textContent='Catalogus kon niet worden geladen: '+e.message;console.error('Shop catalog',e)});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


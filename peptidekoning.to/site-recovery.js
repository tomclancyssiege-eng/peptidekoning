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


/* Offline product controls and shared cart, no checkout or unverified prices. */
(function(){'use strict';
const KEY='pk_offline_cart_v1';
const moneyNote='Test cart only. Prices and checkout are not yet connected.';
const get=()=>{try{let x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch(e){return []}};
const save=x=>{try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){console.warn('Cart storage unavailable',e)}};
function start(){
 const drawer=document.querySelector('.cart-drawer'),overlay=document.querySelector('.cart-drawer-overlay');
 function close(){drawer?.classList.add('translate-x-full');overlay?.classList.add('opacity-0','pointer-events-none')}
 function open(){drawer?.classList.remove('translate-x-full');overlay?.classList.remove('opacity-0','pointer-events-none');render()}
 function render(){let dest=drawer?.querySelector('.cart-drawer-items');if(!dest)return;dest.replaceChildren();let cart=get();if(!cart.length){let p=document.createElement('p');p.className='text-center py-10';p.textContent='Your cart is empty';dest.append(p);return}
 cart.forEach((item,i)=>{let row=document.createElement('div');row.className='border-b border-gray-600 py-4 text-white';let title=document.createElement('strong');title.textContent=(item.name||'Product')+' × '+(item.quantity||1);row.append(title);let opts=document.createElement('p');opts.className='text-sm text-gray-400 my-2';opts.textContent=Object.entries(item.options||{}).map(([k,v])=>k+': '+v).join(' · ');row.append(opts);let note=document.createElement('p');note.className='text-sm';note.textContent='Price to be confirmed';row.append(note);let remove=document.createElement('button');remove.textContent='Remove';remove.className='text-yellow-400 underline mt-2';remove.addEventListener('click',()=>{let x=get();x.splice(i,1);save(x);render()});row.append(remove);dest.append(row)});let p=document.createElement('p');p.className='text-sm text-yellow-400 mt-4';p.textContent=moneyNote;dest.append(p)}
 document.querySelectorAll('button[aria-label="Cart"]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open()},true));
 drawer?.querySelector('.cart-drawer-close')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();close()},true);
 overlay?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();close()},true);
 // GHK-CU already has its own working controls. Avoid double listeners.
 if(document.querySelector('script[src*="ghk-cu-cart-fix.js"]'))return;
 const add=[...document.querySelectorAll('button')].find(b=>['Select options','Add to Cart','Toevoegen aan winkelwagen','Selecteer opties'].includes(b.textContent.trim()));
 if(!add || add.disabled && /out of stock|uitverkocht/i.test(add.textContent))return;
 const h=document.querySelector('main h1');if(!h)return;
 const form=add.parentElement?.parentElement;
 const labels=[...document.querySelectorAll('main label')];
 const groups=labels.filter(l=>/concentration|bacteriostatic water|insulin needles|alcohol swabs|sterkte|concentratie|naalden|alcoholdoekjes/i.test(l.textContent.trim())).map(l=>{
 const box=l.parentElement;let buttons=[...box.querySelectorAll('button')].filter(b=>b.textContent.trim());
 return {name:l.textContent.trim(),buttons,selected:null};
 }).filter(g=>g.buttons.length);
 // Included-by-default options are explicit defaults; all other choices remain unselected.
 groups.forEach(g=>{let b=g.buttons.find(b=>/included by default|included as standard|standaard inbegrepen|standaard meegeleverd/i.test(b.textContent));if(b)g.selected=b.textContent.trim()});
 const qty=labels.find(l=>/^(quantity|aantal)$/i.test(l.textContent.trim()))?.parentElement?.querySelector('input[type="number"]') || document.querySelector('main input[type="number"]');
 const qwrap=qty?.parentElement;
 const valid=()=>groups.every(g=>g.selected!==null);
 function paint(){groups.forEach(g=>g.buttons.forEach(b=>{let active=g.selected===b.textContent.trim();b.style.backgroundColor=active?'#e5c646':'';b.style.color=active?'#000':'';b.style.borderColor=active?'#e5c646':'';b.setAttribute('aria-pressed',String(active))}));add.disabled=!valid();add.textContent=valid()?'Add to Cart':'Select options';add.style.backgroundColor=valid()?'#e5c646':'';add.style.color=valid()?'#000':'';}
 groups.forEach(g=>g.buttons.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();g.selected=b.textContent.trim();paint()},true)));
 if(qwrap&&qty){[...qwrap.querySelectorAll('button')].forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();let diff=b.textContent.trim()==='+'?1:-1;qty.value=String(Math.max(1,(parseInt(qty.value,10)||1)+diff))},true));}
 add.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(!valid())return;let cart=get();cart.push({name:h.textContent.trim(),url:location.pathname,quantity:Math.max(1,parseInt(qty?.value,10)||1),options:Object.fromEntries(groups.map(g=>[g.name,g.selected]))});save(cart);open()},true);
 paint();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

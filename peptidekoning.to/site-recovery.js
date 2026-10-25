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

/* Peptidekoning: independent static catalog controls, no original-site navigation. */
(function(){'use strict';
const pages={"all": "products.html", "pens": "products23b0.html", "peptides": "products3d6b.html", "nasal sprays": "products59fa.html", "topicals": "products9ec1.html", "research supplies": "productsaa38.html"};
const categoryAliases={'alle':'all','all':'all','peptiden':'peptides','peptides':'peptides','neussprays':'nasal sprays','nasal sprays':'nasal sprays','topicals':'topicals','pennen':'pens','pens':'pens','research supplies':'research supplies','bundels':'bundles','bundles':'bundles'};
function init(){
 const grid=document.querySelector('.products-grid > div');if(!grid)return;
 const cards=[...grid.children].filter(el=>el.querySelector('.pb-product-card'));
 const q=document.querySelector('input[placeholder*="Search products"],input[placeholder*="Zoek producten"]');
 const sort=document.querySelector('select#sort');
 const price=el=>{let t=el.querySelector('.pb-product-card')?.innerText||'';let m=t.match(/[€$]\s*([\d.,]+)/);return m?parseFloat(m[1].replace(',','.')):Infinity};
 const name=el=>el.querySelector('.pb-product-card h3')?.textContent.trim()||'';
 const initial=cards.slice();
 function refresh(){let term=(q?.value||'').trim().toLocaleLowerCase();let arr=initial.filter(el=>name(el).toLocaleLowerCase().includes(term));
 let mode=sort?.value||'';if(mode==='price-asc')arr.sort((a,b)=>price(a)-price(b));else if(mode==='price-desc')arr.sort((a,b)=>price(b)-price(a));else if(mode==='title-asc')arr.sort((a,b)=>name(a).localeCompare(name(b)));else if(mode==='title-desc')arr.sort((a,b)=>name(b).localeCompare(name(a)));
 const allowed=new Set(arr);initial.forEach(el=>{el.hidden=!allowed.has(el);el.style.display=allowed.has(el)?'':'none';});arr.forEach(el=>grid.appendChild(el));
 let empty=document.getElementById('pk-no-results');if(!empty){empty=document.createElement('p');empty.id='pk-no-results';empty.style.cssText='color:#ddd;padding:25px;text-align:center';grid.parentElement.appendChild(empty);}empty.textContent=arr.length?'':(document.documentElement.lang==='nl'?'Geen producten gevonden':'No products found');}
 q?.addEventListener('input',refresh);sort?.addEventListener('change',refresh);refresh();
 // Static copies of filtered categories exist as separately downloaded HTML files.
 document.querySelectorAll('button').forEach(b=>{const label=b.textContent.trim().toLocaleLowerCase().replace(/\s+/g,' ');const category=categoryAliases[label];if(!category)return;
 const parent=b.parentElement;if(!parent||!([...parent.querySelectorAll(':scope > button')].some(x=>categoryAliases[x.textContent.trim().toLocaleLowerCase().replace(/\s+/g,' ')])))return;
 // Do not override nested secondary filters; their original product-category metadata was not archived.
 const siblings=[...parent.children].filter(x=>x.tagName==='BUTTON');if(siblings.length<5)return;
 b.addEventListener('click',function(e){if(!pages[category])return;e.preventDefault();e.stopImmediatePropagation();location.assign(pages[category]+location.hash);},true);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
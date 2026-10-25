(()=>{'use strict';
const KEY='pk_offline_cart_v1';
function init(){
if(window.__pkProductFixLoaded)return;
const buttons=[...document.querySelectorAll('main button')];
const add=buttons.find(b=>/^(Select options|Add to Cart|Selecteer opties|Toevoegen aan winkelwagen)$/i.test(b.textContent.trim()));
if(!add)return;window.__pkProductFixLoaded=true;
const panel=add.parentElement;
const labels=[...panel.querySelectorAll('label')];
const groups=labels.filter(l=>!(/^(Quantity|Aantal)$/i.test(l.textContent.trim()))).map(l=>({name:l.textContent.trim(),buttons:[...l.parentElement.querySelectorAll('button')].filter(b=>b.textContent.trim()&&!['+','−','-'].includes(b.textContent.trim())),selected:null})).filter(g=>g.buttons.length>0);
for(const g of groups){const def=g.buttons.find(b=>/included by default|included as standard|standaard inbegrepen|standaard meegeleverd/i.test(b.textContent));if(def)g.selected=def.textContent.trim();}
const qty=panel.querySelector('input[type="number"]');const qwrap=qty?.parentElement;
const valid=()=>groups.every(g=>g.selected!==null);
function paint(){for(const g of groups)for(const b of g.buttons){const selected=g.selected===b.textContent.trim();b.style.backgroundColor=selected?'#e5c646':'';b.style.color=selected?'#000':'';b.style.borderColor=selected?'#e5c646':'';b.setAttribute('aria-pressed',String(selected));}
add.disabled=!valid();add.textContent=valid()?'Add to Cart':'Select options';add.style.backgroundColor=valid()?'#e5c646':'';add.style.color=valid()?'#000':'';}
for(const g of groups)for(const b of g.buttons)b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();g.selected=b.textContent.trim();paint();},true);
if(qwrap&&qty){for(const b of qwrap.querySelectorAll('button'))b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const delta=b.textContent.trim()==='+'?1:-1;qty.value=String(Math.max(1,(parseInt(qty.value,10)||1)+delta));},true);}
function get(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function save(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){console.warn('Cart storage unavailable',e)}}
const drawer=document.querySelector('.cart-drawer'),overlay=document.querySelector('.cart-drawer-overlay');
function close(){drawer?.classList.add('translate-x-full');overlay?.classList.add('opacity-0','pointer-events-none')}
function open(){drawer?.classList.remove('translate-x-full');overlay?.classList.remove('opacity-0','pointer-events-none');render()}
function render(){const target=drawer?.querySelector('.cart-drawer-items');if(!target)return;target.replaceChildren();const cart=get();if(!cart.length){const p=document.createElement('p');p.textContent='Your cart is empty';p.className='text-center py-10';target.append(p);return;}
cart.forEach((item,i)=>{const row=document.createElement('div');row.className='border-b border-gray-600 py-4 text-white';const title=document.createElement('strong');title.textContent=(item.name||'Product')+' × '+(item.quantity||1);row.append(title);const opts=document.createElement('p');opts.className='text-sm text-gray-400 my-2';opts.textContent=Object.entries(item.options||{}).map(([k,v])=>k+': '+v).join(' · ');row.append(opts);const note=document.createElement('p');note.className='text-sm';note.textContent='Price to be confirmed';row.append(note);const remove=document.createElement('button');remove.textContent='Remove';remove.className='text-yellow-400 underline mt-2';remove.addEventListener('click',()=>{const v=get();v.splice(i,1);save(v);render()});row.append(remove);target.append(row)});const p=document.createElement('p');p.className='text-sm text-yellow-400 mt-4';p.textContent='Test cart only. Prices and checkout are not yet connected.';target.append(p);}
add.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(!valid())return;const cart=get();const name=document.querySelector('main h1')?.textContent.trim()||document.title.split('|')[0].trim();cart.push({name,url:location.pathname,quantity:Math.max(1,parseInt(qty?.value,10)||1),options:Object.fromEntries(groups.map(g=>[g.name,g.selected]))});save(cart);open()},true);
for(const b of document.querySelectorAll('button[aria-label="Cart"]'))b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open()},true);
drawer?.querySelector('.cart-drawer-close')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();close()},true);
overlay?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();close()},true);
paint();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

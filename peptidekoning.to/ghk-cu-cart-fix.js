(()=>{'use strict';
const KEY='pk_offline_cart_v1';
const buttons=[...document.querySelectorAll('button')];
const add=buttons.find(b=>b.textContent.trim()==='Select options');if(!add)return;
const panel=add.parentElement;const groups=[...panel.querySelectorAll('label')].filter(l=>['Concentration (mg)','Bacteriostatic Water','Insulin Needles','Alcohol Swabs'].includes(l.textContent.trim())).map(l=>({name:l.textContent.trim(),buttons:[...l.parentElement.querySelectorAll('button')],selected:null}));
const qty=panel.querySelector('input[type=number]');
const count=qty?.parentElement;
const state=()=>groups.every(g=>g.selected!==null);
const paint=()=>{groups.forEach(g=>g.buttons.forEach(b=>{const active=g.selected===b.textContent.trim();b.style.backgroundColor=active?'#e5c646':'';b.style.color=active?'#000':'';b.style.borderColor=active?'#e5c646':'';b.setAttribute('aria-pressed',String(active));}));add.disabled=!state();add.textContent=state()?'Add to Cart':'Select options';add.classList.toggle('cursor-not-allowed',!state());add.style.backgroundColor=state()?'#e5c646':'';add.style.color=state()?'#000':'';};
groups.forEach(g=>g.buttons.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();g.selected=b.textContent.trim();paint();},true)));
if(count){const btn=[...count.querySelectorAll('button')];btn.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();qty.value=String(Math.max(1,(parseInt(qty.value,10)||1)+(b.textContent.trim()==='+'?1:-1)));btn[0].disabled=+qty.value<=1;},true));}
function getCart(){try{const c=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(c)?c:[]}catch{return []}}
function save(c){localStorage.setItem(KEY,JSON.stringify(c));}
const drawer=document.querySelector('.cart-drawer'),overlay=document.querySelector('.cart-drawer-overlay');
function close(){drawer?.classList.add('translate-x-full');overlay?.classList.add('opacity-0','pointer-events-none');}
function open(){drawer?.classList.remove('translate-x-full');overlay?.classList.remove('opacity-0','pointer-events-none');render();}
function render(){const container=drawer?.querySelector('.cart-drawer-items');if(!container)return;container.replaceChildren();const cart=getCart();if(!cart.length){const p=document.createElement('p');p.textContent='Your cart is empty';p.className='text-center py-10';container.append(p);return;}cart.forEach((item,i)=>{const row=document.createElement('div');row.className='border-b border-gray-600 py-4 text-white';const title=document.createElement('strong');title.textContent=item.name+' × '+item.quantity;row.append(title);const opts=document.createElement('p');opts.className='text-sm text-gray-400 my-2';opts.textContent=Object.entries(item.options).map(([k,v])=>k+': '+v).join(' · ');row.append(opts);const note=document.createElement('p');note.className='text-sm';note.textContent='Price to be confirmed';row.append(note);const remove=document.createElement('button');remove.textContent='Remove';remove.className='text-yellow-400 underline mt-2';remove.onclick=()=>{const c=getCart();c.splice(i,1);save(c);render()};row.append(remove);container.append(row)});const warning=document.createElement('p');warning.className='text-sm text-yellow-400 mt-4';warning.textContent='Test cart only. Prices and checkout are not yet connected.';container.append(warning)}
add.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();if(!state())return;const cart=getCart();cart.push({name:'GHK-CU',url:location.pathname,quantity:Math.max(1,parseInt(qty?.value,10)||1),options:Object.fromEntries(groups.map(g=>[g.name,g.selected]))});save(cart);open();},true);
document.querySelectorAll('button[aria-label="Cart"]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open()},true));drawer?.querySelector('.cart-drawer-close')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();close()},true);overlay?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();close()},true);
paint();
})();

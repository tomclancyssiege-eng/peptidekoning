/* Peptide Koning offline UI: carousel controls and dismissible notices. */
(function(){'use strict';
if(window.__pkCarouselControls)return;window.__pkCarouselControls=true;
function trackFor(btn){
 const p=btn.parentElement;if(!p)return null;
 const children=[...p.children];const i=children.indexOf(btn);
 const forward=(btn.getAttribute('aria-label')||'').startsWith('Next');
 const candidates=forward?children.slice(0,i).reverse():children.slice(i+1);
 return candidates.find(x=>x.matches&&((x.classList.contains('pb-bundle-track'))||(x.scrollWidth>x.clientWidth+4&&x.children.length>1)))||null;
}
function carousel(btn){
 const label=btn.getAttribute('aria-label')||'';if(!/^(Previous|Next) (products|bundles)$/.test(label))return false;
 const track=trackFor(btn);if(!track)return false;
 const next=label.startsWith('Next');const first=track.firstElementChild;
 const step=first?first.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap||getComputedStyle(track).gap||0):track.clientWidth;
 track.scrollBy({left:(next?1:-1)*(step||track.clientWidth),behavior:'smooth'});
 return true;
}
function dots(btn){
 const label=btn.getAttribute('aria-label')||'';const match=label.match(/^Go to (product|bundle) (\d+)$/);if(!match)return false;
 const group=btn.parentElement;const container=group&&group.parentElement;if(!container)return false;
 const section=btn.closest('section')||container.parentElement;
 const track=section&&section.querySelector(match[1]==='bundle'?'.pb-bundle-track':'[style*="scroll-snap-type"]');
 if(!track)return false;
 const children=[...track.children];const index=Number(match[2])-1;
 if(!children[index])return false;
 children[index].scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});
 return true;
}
document.addEventListener('click',function(e){
 const btn=e.target.closest&&e.target.closest('button');if(!btn)return;
 if(btn.getAttribute('aria-label')==='Dismiss notice'){
  const notice=btn.closest('[role="region"]');if(notice){e.preventDefault();e.stopImmediatePropagation();notice.remove();}return;
 }
 if(carousel(btn)||dots(btn)){e.preventDefault();e.stopImmediatePropagation();}
},true);
})();

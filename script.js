const CATS=[{id:'bran',i:'🌾',n:'ব্রান',q:1},{id:'rice',i:'🍚',n:'চাল',q:1},{id:'sink',i:'🐟',n:'ডুবন্ত ফিড',q:1},{id:'float',i:'🎣',n:'ভাসমান ফিড',q:1},{id:'med',i:'💊',n:'ওষুধ'},{id:'wage',i:'👷',n:'কাজের বেতন'},{id:'car',i:'🚚',n:'গাড়ি ভাড়া'},{id:'oth',i:'📦',n:'অন্যান্য'}];
const UNITS=['কেজি','বস্তা','মন'],MN=['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const $=id=>document.getElementById(id),cat=id=>CATS.find(c=>c.id===id);
const bn=n=>Number(n).toLocaleString('bn-BD',{maximumFractionDigits:2}),tk=n=>'৳ '+bn(n);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let data=[],editId=null,catFil=null,manual=false,delArm=null;
try{data=JSON.parse(localStorage.getItem('mff_data')||'[]')}catch(e){data=[]}
const save=()=>{try{localStorage.setItem('mff_data',JSON.stringify(data))}catch(e){}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const mlabel=k=>{const[y,m]=k.split('-');return MN[+m-1]+' '+bn(y).replace(/,/g,'')};
const qtyTxt=e=>e.qty!=null?bn(e.qty)+' '+e.unit:'—';

const opts=cats=>cats.map(c=>`<option value="${c.id}">${c.i} ${c.n}</option>`).join('');
$('fCat').innerHTML=opts(CATS);
$('sumCat').innerHTML='<option value="all">📋 সব ক্যাটাগরি</option>'+opts(CATS);
$('fDate').value=today();

function toggle(){const q=cat($('fCat').value).q;document.querySelectorAll('.q').forEach(e=>e.classList.toggle('hide',!q));if(!q){$('fQty').value='';$('fPrice').value='';}manual=false}
function calc(){const q=+$('fQty').value,p=+$('fPrice').value;if(!manual&&q>0&&p>0)$('fTotal').value=+(q*p).toFixed(2)}
$('fCat').onchange=toggle;
['fQty','fPrice'].forEach(i=>$(i).oninput=()=>{manual=false;calc()});
$('fUnit').onchange=()=>{};
$('fTotal').oninput=()=>{manual=true};

function resetForm(){editId=null;$('f').reset();$('fDate').value=today();$('fCat').value='bran';toggle();$('fTitle').textContent='➕ নতুন খরচ যোগ করুন';$('fSave').textContent='সংরক্ষণ করুন';$('fCancel').classList.add('hide')}
$('fCancel').onclick=resetForm;
$('f').onsubmit=ev=>{ev.preventDefault();const c=cat($('fCat').value),t=+$('fTotal').value;if(!(t>=0)||$('fTotal').value==='')return;
 const e={id:editId||Date.now().toString(36),date:$('fDate').value,cat:c.id,total:t,note:$('fNote').value.trim()};
 if(c.q&&+$('fQty').value>0){e.qty=+$('fQty').value;e.unit=$('fUnit').value;e.price=+$('fPrice').value||(t/e.qty)}
 if(editId)data=data.map(x=>x.id===editId?e:x);else data.push(e);
 save();resetForm();render()};

function edit(id){const e=data.find(x=>x.id===id);if(!e)return;editId=id;$('fDate').value=e.date;$('fCat').value=e.cat;toggle();
 $('fQty').value=e.qty??'';if(e.unit)$('fUnit').value=e.unit;$('fPrice').value=e.price!=null?+(+e.price).toFixed(2):'';$('fTotal').value=e.total;$('fNote').value=e.note||'';manual=true;
 $('fTitle').textContent='✏️ এন্ট্রি সম্পাদনা';$('fSave').textContent='আপডেট করুন';$('fCancel').classList.remove('hide');$('f').scrollIntoView({behavior:'smooth'})}
function del(id,btn){if(delArm===id){data=data.filter(x=>x.id!==id);delArm=null;if(editId===id)resetForm();save();render()}else{delArm=id;btn.textContent='নিশ্চিত?';setTimeout(()=>{if(delArm===id){delArm=null;btn.textContent='🗑'}},3000)}}

function filtered(){const m=$('mFil').value,s=$('search').value.trim().toLowerCase();
 return data.filter(e=>(!m||e.date.startsWith(m))&&(!catFil||e.cat===catFil)&&(!s||(e.note||'').toLowerCase().includes(s))).sort((a,b)=>b.date.localeCompare(a.date))}

function render(){
 const mk=today().slice(0,7);
 $('sTot').textContent=tk(data.reduce((s,e)=>s+e.total,0));$('sCnt').textContent=bn(data.length);
 $('sMon').textContent=tk(data.filter(e=>e.date.startsWith(mk)).reduce((s,e)=>s+e.total,0));
 $('cats').innerHTML=CATS.map(c=>{const l=data.filter(e=>e.cat===c.id),sum=l.reduce((s,e)=>s+e.total,0);let q='';
  if(c.q){const u={};l.forEach(e=>{if(e.qty!=null)u[e.unit]=(u[e.unit]||0)+e.qty});q=UNITS.filter(x=>u[x]).map(x=>bn(u[x])+' '+x).join(' + ')}
  return `<div class="card cat ${catFil===c.id?'on':''}" data-c="${c.id}"><div class="ic">${c.i}</div><div class="t">${c.n}</div><div class="m">${tk(sum)}</div><div class="q">${esc(q)}</div></div>`}).join('');
 document.querySelectorAll('.cat').forEach(el=>el.onclick=()=>{catFil=catFil===el.dataset.c?null:el.dataset.c;render()});
 // summary
 const sc=$('sumCat').value,rows=[];
 CATS.filter(c=>sc==='all'||c.id===sc).forEach(c=>{const l=data.filter(e=>e.cat===c.id);if(!l.length)return;
  if(c.q){UNITS.forEach(u=>{const x=l.filter(e=>e.unit===u);if(!x.length)return;const q=x.reduce((s,e)=>s+e.qty,0),t=x.reduce((s,e)=>s+e.total,0);rows.push([c,u,bn(q),tk(t),tk(t/q)])});
   const nu=l.filter(e=>e.qty==null);if(nu.length)rows.push([c,'—','—',tk(nu.reduce((s,e)=>s+e.total,0)),'—'])}
  else rows.push([c,'—','—',tk(l.reduce((s,e)=>s+e.total,0)),'—'])});
 $('sumBody').innerHTML=rows.length?rows.map(r=>`<tr><td data-l="ক্যাটাগরি">${r[0].i} ${r[0].n}</td><td data-l="একক">${r[1]}</td><td data-l="মোট পরিমাণ">${r[2]}</td><td data-l="মোট খরচ" class="mon">${r[3]}</td><td data-l="গড় দাম/একক">${r[4]}</td></tr>`).join(''):'<tr><td colspan="5" class="empty">কোনো তথ্য নেই</td></tr>';
 // month filter
 const cur=$('mFil').value,ms=[...new Set(data.map(e=>e.date.slice(0,7)))].sort().reverse();
 $('mFil').innerHTML='<option value="">📅 সব মাস</option>'+ms.map(m=>`<option value="${m}">${mlabel(m)}</option>`).join('');$('mFil').value=ms.includes(cur)?cur:'';
 // table
 const l=filtered(),fi=$('fil');
 if(catFil){fi.classList.remove('hide');fi.textContent='ফিল্টার: '+cat(catFil).i+' '+cat(catFil).n+' • মোট '+tk(l.reduce((s,e)=>s+e.total,0))}else fi.classList.add('hide');
 $('body').innerHTML=l.length?l.map(e=>{const c=cat(e.cat);return `<tr><td data-l="তারিখ">${e.date.split('-').reverse().map(x=>bn(x).replace(/,/g,'')).join('/')}</td><td data-l="ক্যাটাগরি">${c.i} ${c.n}</td><td data-l="পরিমাণ">${qtyTxt(e)}</td><td data-l="এককের দাম">${e.price!=null?tk(e.price):'—'}</td><td data-l="মোট" class="mon">${tk(e.total)}</td><td data-l="বিবরণ">${esc(e.note)||'—'}</td><td><button class="btn sm ghost" data-e="${e.id}">✏️</button> <button class="btn sm red" data-d="${e.id}">🗑</button></td></tr>`}).join(''):'<tr><td colspan="7" class="empty">🐟 কোনো এন্ট্রি পাওয়া যায়নি</td></tr>';
 document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>edit(b.dataset.e));
 document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>del(b.dataset.d,b));
}
['sumCat','mFil'].forEach(i=>$(i).onchange=render);$('search').oninput=render;

$('exp').onclick=async()=>{const q=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
 const r=[['তারিখ','ক্যাটাগরি','পরিমাণ','একক','এককের দাম','মোট খরচ','বিবরণ'].map(q).join(',')];
 filtered().forEach(e=>r.push([e.date,cat(e.cat).n,e.qty??'',e.unit||'',e.price!=null?+(+e.price).toFixed(2):'',e.total,e.note].map(q).join(',')));
 const t=r.join('\n');$('csv').value=t;$('dl').href='data:text/csv;charset=utf-8,%EF%BB%BF'+encodeURIComponent(t);
 try{const b=new Blob(['\uFEFF'+t],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='masud-fish-farm-'+today()+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return}catch(e){}
 $('dlg').showModal()};
$('cl').onclick=()=>$('dlg').close();
$('cp').onclick=async()=>{try{await navigator.clipboard.writeText($('csv').value);$('cp').textContent='কপি হয়েছে ✓'}catch(e){$('csv').select();document.execCommand('copy')}};
toggle();render();
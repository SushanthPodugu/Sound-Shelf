const KEY = "soundshelf_store_v1";
const seedItems = [
 {id:"g1",name:"Fender Player Stratocaster",category:"Instruments",type:"Electric guitar",price:850,stock:2,emoji:"🎸",description:"Versatile electric guitar for practice, stage and recording."},
 {id:"g2",name:"Yamaha Stage Custom Drum Kit",category:"Instruments",type:"Drum kit",price:1500,stock:1,emoji:"🥁",description:"A punchy, gig-ready acoustic drum setup."},
 {id:"g3",name:"Casio CT-S300 Keyboard",category:"Instruments",type:"Keyboard",price:650,stock:3,emoji:"🎹",description:"Portable 61-key keyboard for writing and rehearsals."},
 {id:"g4",name:"Shure SM58 Microphone",category:"Audio",type:"Dynamic microphone",price:300,stock:5,emoji:"🎤",description:"A dependable vocal microphone for live and studio use."},
 {id:"g5",name:"Focusrite Scarlett 2i2",category:"Studio",type:"Audio interface",price:500,stock:2,emoji:"🎛️",description:"Two-input interface for clean home-studio recording."},
 {id:"g6",name:"KRK Rokit 5 Monitor Pair",category:"Studio",type:"Studio monitors",price:900,stock:1,emoji:"🔊",description:"Accurate nearfield monitors for mixing and production."},
 {id:"g7",name:"Pioneer DDJ-FLX4",category:"DJ",type:"DJ controller",price:1100,stock:2,emoji:"🎚️",description:"Compact two-channel controller for DJ practice and sets."},
 {id:"g8",name:"Audio-Technica ATH-M50x",category:"Audio",type:"Studio headphones",price:250,stock:4,emoji:"🎧",description:"Closed-back headphones for tracking and focused listening."},
 {id:"g9",name:"Roland Cube Street EX",category:"Audio",type:"Portable amplifier",price:700,stock:2,emoji:"📻",description:"Battery-powered amp for busking and small performances."}
];
function readStore(){try{return JSON.parse(localStorage.getItem(KEY))||{items:seedItems,bookings:[]}}catch{return{items:seedItems,bookings:[]}}}
function saveStore(s){localStorage.setItem(KEY,JSON.stringify(s))}
let store=readStore(); if(!store.items?.length){store.items=seedItems;saveStore(store)}
let cart={};let activeCategory="All";
const $=id=>document.getElementById(id);
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
function toast(msg){const el=$("toast");if(!el)return;el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2400)}
function renderProducts(){
 const q=($("search")?.value||"").toLowerCase();let items=store.items.filter(i=>(activeCategory==="All"||i.category===activeCategory)&&`${i.name} ${i.category} ${i.type}`.toLowerCase().includes(q));
 const sort=$("sort-select")?.value;if(sort==="low")items.sort((a,b)=>a.price-b.price);if(sort==="high")items.sort((a,b)=>b.price-a.price);
 $("product-grid").innerHTML=items.length?items.map(i=>`<article class="product-card"><div class="product-visual"><span class="stock-pill ${i.stock<1?"unavailable":""}">${i.stock>0?i.stock+" available":"Unavailable"}</span><span class="emoji">${i.emoji||"🎵"}</span></div><div class="product-info"><div class="product-meta"><span>${i.category}</span><span>${i.type||"Equipment"}</span></div><h3>${escapeHTML(i.name)}</h3><p>${escapeHTML(i.description||"Quality rental equipment.")}</p><div class="product-bottom"><span class="price">${money(i.price)} <small>/ day</small></span><button class="add-btn" data-add="${i.id}" ${i.stock<1?"disabled":""}>${i.stock<1?"Unavailable":"+ Add to list"}</button></div></div></article>`).join(""):`<div class="empty-state">No equipment matches your search.</div>`;
 document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{cart[b.dataset.add]=(cart[b.dataset.add]||0)+1;renderCart();toast("Added to your rental list")}));
}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function renderCart(){
 const entries=Object.entries(cart).filter(([id,n])=>n>0);$("cart-count").textContent=entries.reduce((a,[,n])=>a+n,0);
 $("cart-items").innerHTML=entries.length?entries.map(([id,n])=>{const i=store.items.find(x=>x.id===id);return i?`<div class="cart-line"><div><strong>${escapeHTML(i.name)}</strong><small>${money(i.price)} per day · Qty ${n}</small></div><button class="remove-btn" data-remove="${id}">Remove</button></div>`:""}).join(""):`<div class="empty-state">Your list is empty. Add some gear to get started.</div>`;
 document.querySelectorAll("[data-remove]").forEach(b=>b.addEventListener("click",()=>{delete cart[b.dataset.remove];renderCart()}));updateTotal();
}
function days(){const a=$("start-date")?.value,b=$("end-date")?.value;if(!a||!b)return 1;return Math.max(1,Math.ceil((new Date(b)-new Date(a))/86400000)+1)}
function updateTotal(){let total=Object.entries(cart).reduce((sum,[id,n])=>{const i=store.items.find(x=>x.id===id);return sum+(i?i.price*n:0)},0)*days();if($("cart-total"))$("cart-total").textContent=money(total)}
function renderBookings(){
 const mine=store.bookings.filter(b=>b.customerPhone===localStorage.getItem("soundshelf_customer_phone"));
 $("customer-bookings").innerHTML=mine.length?mine.slice().reverse().map(b=>`<div class="booking-card"><div><h3>Booking #${b.id.slice(-6)} · ${escapeHTML(b.items.map(x=>x.name).join(", "))}</h3><p>${escapeHTML(b.customerName)} · ${b.startDate} to ${b.endDate} · ${money(b.total)}</p></div><span class="status ${b.status}">${b.status}</span></div>`).join(""):`<div class="empty-state">Your booking requests will appear here once you submit one.</div>`;
}
function openCart(){$("cart-drawer").classList.add("open");$("scrim").classList.add("show");$("cart-drawer").setAttribute("aria-hidden","false")}
function closeCart(){$("cart-drawer").classList.remove("open");$("scrim").classList.remove("show");$("cart-drawer").setAttribute("aria-hidden","true")}
document.addEventListener("DOMContentLoaded",()=>{
 if(!$("product-grid"))return;
 const today=new Date().toISOString().slice(0,10);$("start-date").min=today;$("end-date").min=today;$("start-date").value=today;$("end-date").value=today;
 $("search").addEventListener("input",renderProducts);$("sort-select").addEventListener("change",renderProducts);
 $("category-filters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderProducts()});
 $("cart-toggle").addEventListener("click",openCart);$("close-cart").addEventListener("click",closeCart);$("scrim").addEventListener("click",closeCart);
 ["start-date","end-date"].forEach(id=>$(id).addEventListener("change",()=>{if($("start-date").value)$("end-date").min=$("start-date").value;updateTotal()}));
 $("submit-booking").addEventListener("click",()=>{
  const entries=Object.entries(cart).filter(([id,n])=>n>0);const name=$("customer-name").value.trim(),phone=$("customer-phone").value.trim(),start=$("start-date").value,end=$("end-date").value;
  if(!entries.length)return toast("Add at least one item first.");if(!name||!phone)return toast("Enter your name and contact number.");if(!start||!end||end<start)return toast("Choose valid rental dates.");
  const current=readStore();const bookingItems=[];for(const [id,qty] of entries){const item=current.items.find(i=>i.id===id);if(!item||item.stock<qty)return toast("One item no longer has enough stock. Refresh the page.");bookingItems.push({id:item.id,name:item.name,qty,price:item.price})}
  const total=bookingItems.reduce((s,i)=>s+i.price*i.qty,0)*Math.max(1,Math.ceil((new Date(end)-new Date(start))/86400000)+1);
  const booking={id:"SS"+Date.now(),customerName:name,customerPhone:phone,items:bookingItems,startDate:start,endDate:end,total,status:"pending",createdAt:new Date().toISOString()};
  current.bookings.push(booking);saveStore(current);localStorage.setItem("soundshelf_customer_phone",phone);store=current;cart={};renderCart();renderBookings();closeCart();toast("Booking request sent to the owner!");
 });
 renderProducts();renderCart();renderBookings();
 window.addEventListener("storage",()=>{store=readStore();renderProducts();renderBookings()});
});
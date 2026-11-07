const KEY="soundshelf_store_v1";
const seedItems=[
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
const $=id=>document.getElementById(id),money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
function read(){try{return JSON.parse(localStorage.getItem(KEY))||{items:seedItems,bookings:[]}}catch{return{items:seedItems,bookings:[]}}}
let store=read();if(!store.items?.length)store.items=seedItems;
function save(){localStorage.setItem(KEY,JSON.stringify(store));render()}
function escapeHTML(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(s){const t=$("toast");t.textContent=s;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function renderStats(){
 $("stat-items").textContent=store.items.length;
 $("stat-pending").textContent=store.bookings.filter(b=>b.status==="pending").length;
 $("stat-approved").textContent=store.bookings.filter(b=>["approved","completed"].includes(b.status)).length;
 $("stat-revenue").textContent=money(store.bookings.filter(b=>["approved","completed"].includes(b.status)).reduce((s,b)=>s+Number(b.total||0),0));
}

function renderBookings(){
 const filter=$("booking-filter").value;
 const list=store.bookings
   .filter(b=>filter==="all"||b.status===filter)
   .slice()
   .reverse();

 $("no-bookings").hidden=list.length>0;

 $("booking-rows").innerHTML=list.map(b=>`
 <tr>
   <td>
     <strong>${escapeHTML(b.customerName)}</strong>
     <small>#${b.id.slice(-6)} · ${escapeHTML(b.customerPhone)}</small>
   </td>
   <td>${b.items.map(i=>`${escapeHTML(i.name)} × ${i.qty}`).join("<br>")}</td>
   <td>${b.startDate}<br><small>to ${b.endDate}</small></td>
   <td><strong>${money(b.total)}</strong></td>
   <td><span class="status ${b.status}">${b.status}</span></td>
   <td>
     <div class="action-group">
       ${b.status!=="approved"?`<button class="action approve" data-status="approved" data-id="${b.id}">Approve</button>`:""}
       ${b.status!=="rejected"?`<button class="action reject" data-status="rejected" data-id="${b.id}">Reject</button>`:""}
       ${b.status==="approved"?`<button class="action" data-status="completed" data-id="${b.id}">Complete</button>`:""}
       ${b.status!=="pending"?`<button class="action" data-status="pending" data-id="${b.id}">Reset</button>`:""}
       <button class="action reject" data-delete-booking="${b.id}">Delete</button>
     </div>
   </td>
 </tr>
 `).join("");

 document.querySelectorAll("[data-status]").forEach(btn=>{
   btn.addEventListener("click",()=>{
     const booking=store.bookings.find(b=>b.id===btn.dataset.id);
     if(!booking)return;
     booking.status=btn.dataset.status;
     save();
     toast("Booking status updated");
   });
 });

 document.querySelectorAll("[data-delete-booking]").forEach(btn=>{
   btn.addEventListener("click",()=>{
     const id=btn.dataset.deleteBooking;

     if(!confirm("Are you sure you want to delete this booking request?"))return;

     store.bookings=store.bookings.filter(b=>b.id!==id);
     save();
     toast("Booking request deleted");
   });
 });
}

function renderInventory(){
 const q=$("inventory-search").value.toLowerCase();const items=store.items.filter(i=>i.name.toLowerCase().includes(q)||i.category.toLowerCase().includes(q));
 $("inventory-grid").innerHTML=items.length?items.map(i=>`<article class="inventory-card"><div class="inventory-icon">${i.emoji||"🎵"}</div><div><h3>${escapeHTML(i.name)}</h3><p>${escapeHTML(i.category)} · ${money(i.price)}/day · Qty ${i.stock}</p></div><div class="inventory-actions"><span class="availability ${i.stock<1?"off":""}">${i.stock>0?"AVAILABLE":"UNAVAILABLE"}</span><div><button data-edit="${i.id}">Edit</button> <button data-delete="${i.id}">Delete</button></div></div></article>`).join(""):`<div class="empty">No matching equipment found.</div>`;
 document.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>editItem(b.dataset.edit)));
 document.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",()=>{if(!confirm("Delete this equipment from the store?"))return;store.items=store.items.filter(i=>i.id!==b.dataset.delete);save();toast("Equipment deleted")}));
}
function render(){renderStats();renderBookings();renderInventory()}
function showModal(item=null){
 $("equipment-form").reset();$("edit-id").value=item?.id||"";$("modal-title").textContent=item?"Edit equipment":"Add equipment";
 if(item){$("item-name").value=item.name;$("item-category").value=item.category;$("item-type").value=item.type;$("item-price").value=item.price;$("item-stock").value=item.stock;$("item-emoji").value=item.emoji;$("item-description").value=item.description}
 $("modal-backdrop").classList.add("show");
}
function editItem(id){const item=store.items.find(i=>i.id===id);if(item)showModal(item)}
document.addEventListener("DOMContentLoaded",()=>{
 $("open-add").addEventListener("click",()=>showModal());$("close-modal").addEventListener("click",()=>$("modal-backdrop").classList.remove("show"));
 $("modal-backdrop").addEventListener("click",e=>{if(e.target===$("modal-backdrop"))$("modal-backdrop").classList.remove("show")});
 $("booking-filter").addEventListener("change",renderBookings);$("inventory-search").addEventListener("input",renderInventory);
 $("equipment-form").addEventListener("submit",e=>{e.preventDefault();const id=$("edit-id").value;const item={id:id||"g"+Date.now(),name:$("item-name").value.trim(),category:$("item-category").value,type:$("item-type").value.trim(),price:Number($("item-price").value),stock:Number($("item-stock").value),emoji:$("item-emoji").value.trim()||"🎵",description:$("item-description").value.trim()};if(id){const index=store.items.findIndex(x=>x.id===id);if(index>=0)store.items[index]=item}else store.items.push(item);save();$("modal-backdrop").classList.remove("show");toast(id?"Equipment updated":"Equipment added")});
 window.addEventListener("storage",()=>{store=read();render()});render();
});
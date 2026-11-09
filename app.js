/* TATKA BAZAR - CUSTOMER APP | A Brand of M-Tech */
const items=[
{id:1,name:"মিনিকেট চাল",cat:"নিত্যপ্রয়োজনীয়",price:72,unit:"কেজি",kgPerUnit:1,emoji:"🍚",img:""},
{id:2,name:"মসুর ডাল",cat:"নিত্যপ্রয়োজনীয়",price:125,unit:"কেজি",kgPerUnit:1,emoji:"🫘",img:""},
{id:3,name:"সয়াবিন তেল",cat:"নিত্যপ্রয়োজনীয়",price:170,unit:"লিটার",kgPerUnit:0.91,emoji:"🫗",img:""},
{id:4,name:"আলু",cat:"শাকসবজি",price:35,unit:"কেজি",kgPerUnit:1,emoji:"🥔",img:""},
{id:5,name:"টমেটো",cat:"শাকসবজি",price:60,unit:"কেজি",kgPerUnit:1,emoji:"🍅",img:""},
{id:6,name:"বেগুন",cat:"শাকসবজি",price:55,unit:"কেজি",kgPerUnit:1,emoji:"🍆",img:""},
{id:7,name:"পালং শাক",cat:"শাকসবজি",price:25,unit:"কেজি",kgPerUnit:1,emoji:"🥬",img:"",note:"আঁটি নয় - কেজি/গ্রামে"},
{id:8,name:"রুই মাছ",cat:"মাছ",price:320,unit:"কেজি",kgPerUnit:1,emoji:"🐟",img:""},
{id:9,name:"তেলাপিয়া",cat:"মাছ",price:190,unit:"কেজি",kgPerUnit:1,emoji:"🐠",img:""},
{id:10,name:"হলুদ গুঁড়া",cat:"মসলা",price:260,unit:"কেজি",kgPerUnit:1,emoji:"🟡",img:"",allowGram:true},
{id:11,name:"মরিচ গুঁড়া",cat:"মসলা",price:340,unit:"কেজি",kgPerUnit:1,emoji:"🌶️",img:"",allowGram:true},
{id:12,name:"জিরা",cat:"মসলা",price:680,unit:"কেজি",kgPerUnit:1,emoji:"🧂",img:"",allowGram:true}
];
function getItemById(id){return items.find(x=>x.id===Number(id))}
// এলাকা ভেদে দাম: ইউনিয়ন/জেলা=বেস, বিভাগীয়/পৌরসভা=+৫%, সিটি=+৮% (অ্যাডমিন আলাদা দাম বসালে সেটাই চলবে)
function priceForArea(item,areaType){if(!item)return 0;if(areaType==="সিটি কর্পোরেশন")return item.priceCity||Math.round(item.price*1.08);if(areaType==="পৌরসভা")return item.priceDivision||Math.round(item.price*1.05);return item.price}
function getSavedProducts(){try{return JSON.parse(localStorage.getItem("tatkaProducts"))||null}catch{return null}}
function saveProducts(){localStorage.setItem("tatkaProducts",JSON.stringify(items))}
// আগের সেভ করা পণ্য থাকলে লোড করো
(function(){const s=getSavedProducts();if(s&&s.length){items.length=0;s.forEach(x=>items.push(x))}})();
// পরিমাণ পার্স: আঁটি বাতিল, গ্রাম->কেজি, লিটার->কেজি(০.৯১), মিলি->লিটার
function parseQty(text,item){
 if(!text)return null;const t=text.toLowerCase();
 if(t.includes("আঁটি")||t.includes("আটি")||t.includes("aati")||t.includes("বান্ডিল")||t.includes("bundle"))return {error:"আঁটি / বান্ডিলে হবে না। কেজি বা গ্রামে লিখুন। যেমন: ১ কেজি / ৫০০ গ্রাম"};
 const m=t.match(/[\d.]+/);if(!m)return null;const val=parseFloat(m[0])||0;
 if(t.includes("গ্রাম")||t.includes("gram")||t.includes("gm")){
   const kg=val/1000; // গ্রাম -> কেজি
   return {qtyDisplay:kg,weightKg:kg,subtotal:Math.round(item.price*kg),label:val+" গ্রাম"};
 }
 if(t.includes("মিলি")||t.includes("ml")){
   const liter=val/1000;return {qtyDisplay:liter,weightKg:liter*(item.kgPerUnit||1),subtotal:Math.round(item.price*liter),label:val+" মিলি"};
 }
 if(t.includes("লিটার")||t.includes("liter")||t.includes("litre")){
   return {qtyDisplay:val,weightKg:val*(item.kgPerUnit||1),subtotal:Math.round(item.price*val),label:val+" লিটার"};
 }
 // ডিফল্ট কেজি
 return {qtyDisplay:val,weightKg:val*(item.unit==="লিটার"?(item.kgPerUnit||1):1),subtotal:Math.round(item.price*val),label:val+" "+item.unit};
}
function parseWeightInKg(text){if(!text)return 1;const t=text.toLowerCase();if(t.includes("আঁটি")||t.includes("আটি"))return 0;const m=t.match(/[\d.]+/);if(!m)return 1;const v=parseFloat(m[0])||1;if(t.includes("গ্রাম")&&!t.includes("কেজি"))return v/1000;if(t.includes("লিটার"))return v*0.91;if(t.includes("মিলি"))return v/1000*0.91;return v}

const cart={}; const SERVICE_CHARGE=25; let customerBalance=150.00;
function money(n){return "৳"+Number(n||0).toLocaleString("bn-BD")}
function getElement(id){return document.getElementById(id)}
function escapeHTML(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[c])}
function validPhone(p){return /^(?:\+?88)?01[3-9]\d{8}$/.test(p.replace(/[\s-]/g,""))}
function makeOrderNumber(){return "TB-"+Date.now().toString().slice(-8)}
function parseWeightInKg(text){if(!text)return 1;text=text.toLowerCase().trim();const m=text.match(/[\d.]+/);if(!m)return 1;const val=parseFloat(m[0])||1;if(text.includes("গ্রাম")&&!text.includes("কেজি"))return val/1000;return val}
function getDeliveryCharge(w){if(w<=0)return 0;if(w<=5)return 25;if(w<=10)return 50;if(w<=15)return 75;if(w<=20)return 100;if(w<=30)return 125;if(w<=40)return 150;return -1}
function getSavedOrders(){try{return JSON.parse(localStorage.getItem("tatkaOrders"))||[]}catch{return[]}}
function saveOrders(o){localStorage.setItem("tatkaOrders",JSON.stringify(o))}
function getSavedDeliveryOnly(){try{return JSON.parse(localStorage.getItem("tatkaDeliveryOnly"))||[]}catch{return[]}}
function saveDeliveryOnly(l){localStorage.setItem("tatkaDeliveryOnly",JSON.stringify(l))}
/* প্যানেল */
const registerPanel=getElement("registerPanel"),shopPanel=getElement("shopPanel"),checkoutPanel=getElement("checkoutPanel"),deliveryOnlyPanel=getElement("deliveryOnlyPanel");
function showCustomerPanel(panel){[registerPanel,shopPanel,checkoutPanel,deliveryOnlyPanel].forEach(p=>{if(p)p.hidden=true});if(panel){panel.hidden=false;panel.scrollIntoView({behavior:"smooth",block:"start"})}}
const showRegBtn=getElement("showRegister"),showShopBtn=getElement("showShop"),showGuestBtn=getElement("showGuest"),showDeliveryOnlyBtn=getElement("showDeliveryOnly");
if(showRegBtn)showRegBtn.onclick=()=>showCustomerPanel(registerPanel);
if(showShopBtn)showShopBtn.onclick=()=>showCustomerPanel(shopPanel);
if(showGuestBtn)showGuestBtn.onclick=()=>showCustomerPanel(checkoutPanel);
if(showDeliveryOnlyBtn)showDeliveryOnlyBtn.onclick=()=>showCustomerPanel(deliveryOnlyPanel);
/* নিবন্ধন */
const regBtn=getElement("registerButton");
if(regBtn)regBtn.onclick=function(){const name=getElement("regName").value.trim(),phone=getElement("regPhone").value.trim(),msg=getElement("registerMessage");if(!name||!phone){msg.textContent="পূর্ণ নাম ও মোবাইল নম্বর লিখুন।";return}if(!validPhone(phone)){msg.textContent="সঠিক বাংলাদেশি মোবাইল নম্বর দিন।";return}msg.textContent="ডেমো নিবন্ধন সফল! (বাস্তব OTP সিস্টেম পরবর্তীতে যুক্ত হবে)"};
/* পণ্য */
function drawProducts(){const qEl=getElement("q"),catEl=getElement("cat"),box=getElement("products");if(!box)return;const q=qEl?qEl.value.trim().toLowerCase():"",cat=catEl?catEl.value:"all";const filtered=items.filter(it=>(cat==="all"||it.cat===cat)&&it.name.toLowerCase().includes(q));box.innerHTML=filtered.map(it=>`<article class="product"><div class="prod-img">${it.img?`<img src="${escapeHTML(it.img)}" alt="">`:it.emoji}</div><h3>${escapeHTML(it.name)}</h3><small>${escapeHTML(it.cat)} · প্রতি ${escapeHTML(it.unit)} (${money(it.price)}) ${it.note?`· ${escapeHTML(it.note)}`:``}</small><small style="color:#888">এলাকা ভেদে দাম: পৌরসভা ${money(priceForArea(it,"পৌরসভা"))} · সিটি ${money(priceForArea(it,"সিটি কর্পোরেশন"))} (চেকআউটে এলাকা অনুযায়ী চূড়ান্ত হবে)</small><div style="margin-top:12px"><input type="text" id="qty-${it.id}" value="১ ${it.unit}" placeholder="${it.unit==="লিটার"?"যেমন: ১ লিটার / ৫০০ মিলি":it.allowGram?"যেমন: ১ কেজি / ৫০০ গ্রাম":"যেমন: ১ কেজি / ৫০০ গ্রাম"}" style="padding:8px;font-size:13px;margin-bottom:8px;text-align:center;width:100%"><button type="button" data-add="${it.id}" style="width:100%">+ কার্টে যোগ করুন</button><p id="qtyerr-${it.id}" style="color:#d9534f;font-size:12px"></p></div></article>`).join("");document.querySelectorAll("[data-add]").forEach(b=>{b.onclick=function(){const id=Number(this.dataset.add),it=getItemById(id),el=getElement(`qty-${id}`),val=el?el.value.trim():`১ ${it.unit}`;const p=parseQty(val,it);const err=getElement(`qtyerr-${id}`);if(!p||p.error){if(err)err.textContent=p?p.error:"পরিমাণ লিখুন।";return}if(err)err.textContent="";cart[id]={qtyText:p.label,weightKg:p.weightKg,subtotal:p.subtotal,qtyDisplay:p.qtyDisplay};drawCart()}})}
function getCartSubtotal(){return Object.values(cart).reduce((s,i)=>s+i.subtotal,0)}
function getTotalCartWeight(){return Object.values(cart).reduce((s,i)=>s+i.weightKg,0)}
function drawCart(){const box=getElement("cart"),tot=getElement("total");if(!box||!tot)return;let html="";Object.entries(cart).forEach(([id,info])=>{const it=getItemById(id);html+=`<div style="display:flex;justify-content:space-between;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:6px"><span><b>${escapeHTML(it.name)}</b> (${escapeHTML(info.qtyText)}) — ${money(info.subtotal)}</span><button type="button" data-remove="${id}" style="padding:4px 8px;background:#dc3545;color:#fff;border:none;border-radius:4px;font-size:11px">বাদ</button></div>`});box.innerHTML=html||"পণ্য যোগ করলে এখানে দেখা যাবে।";const sub=getCartSubtotal(),w=getTotalCartWeight(),dc=getDeliveryCharge(w);let dt="",grand=sub+SERVICE_CHARGE;if(dc===-1){dt="কর্তৃপক্ষের সিদ্ধান্ত (৪০ কেজির বেশি)";grand+=150}else{dt=money(dc);grand+=dc}tot.innerHTML=`বাজার মূল্য: ${money(sub)}<br>সার্ভিস চার্জ: ${money(SERVICE_CHARGE)}<br>মোট ওজন: ${w.toFixed(2)} কেজি<br>পরিবহন চার্জ: ${dt}<br><hr><b>সর্বমোট প্রাক্কলিত বিল: ${money(grand)}</b>`;document.querySelectorAll("[data-remove]").forEach(b=>{b.onclick=function(){delete cart[Number(this.dataset.remove)];drawCart()}})}
const checkoutFromCartBtn=getElement("checkoutFromCart");
if(checkoutFromCartBtn)checkoutFromCartBtn.onclick=function(){if(Object.keys(cart).length===0){alert("প্রথমে বাজারের তালিকায় পণ্য যোগ করুন।");return}showCustomerPanel(checkoutPanel)};
/* ঠিকানা - checkout */
const divisionSelect=getElement("division"),districtSelect=getElement("district"),upazilaSelect=getElement("upazila"),areaTypeSelect=getElement("areaType"),areaNameSelect=getElement("areaName"),manualAreaInput=getElement("manualArea");
function fillLocationSelect(sel,list,ph){if(!sel)return;sel.innerHTML="";const o=document.createElement("option");o.value="";o.textContent=ph;sel.appendChild(o);list.forEach(n=>{const op=document.createElement("option");op.value=n;op.textContent=n;sel.appendChild(op)});sel.disabled=list.length===0}
if(divisionSelect)divisionSelect.addEventListener("change",function(){const d=typeof locationData!=="undefined"?Object.keys(locationData):[];fillLocationSelect(districtSelect,this.value==="খুলনা"?d:[],"জেলা নির্বাচন করুন");fillLocationSelect(upazilaSelect,[],"আগে জেলা নির্বাচন করুন");fillLocationSelect(areaNameSelect,[],"আগে উপজেলা নির্বাচন করুন");if(manualAreaInput)manualAreaInput.hidden=true});
if(districtSelect)districtSelect.addEventListener("change",function(){const u=typeof locationData!=="undefined"?locationData[this.value]||[]:[];fillLocationSelect(upazilaSelect,u,"উপজেলা নির্বাচন করুন");fillLocationSelect(areaNameSelect,[],"আগে উপজেলা নির্বাচন করুন")});
function updateAreaList(){if(!upazilaSelect||!areaTypeSelect||!areaNameSelect)return;const a=typeof areaData!=="undefined"&&areaData[upazilaSelect.value]?areaData[upazilaSelect.value][areaTypeSelect.value]||[]:[];fillLocationSelect(areaNameSelect,a,a.length?"এলাকা নির্বাচন করুন":"তালিকা পাওয়া যায়নি");if(manualAreaInput){manualAreaInput.hidden=a.length>0;if(a.length===0)manualAreaInput.value=""}}
if(upazilaSelect)upazilaSelect.addEventListener("change",updateAreaList);
if(areaTypeSelect)areaTypeSelect.addEventListener("change",updateAreaList);

/* অর্ডার */
const placeDemoOrderBtn=getElement("placeDemoOrder");
if(placeDemoOrderBtn)placeDemoOrderBtn.onclick=function(){
const name=getElement("orderName").value.trim(),phone=getElement("orderPhone").value.trim(),division=divisionSelect?divisionSelect.value:"",district=districtSelect?districtSelect.value:"",upazila=upazilaSelect?upazilaSelect.value:"",areaType=areaTypeSelect?areaTypeSelect.value:"",areaName=(areaNameSelect?areaNameSelect.value:"")||(manualAreaInput?manualAreaInput.value.trim():""),details=getElement("addressDetails").value.trim(),msg=getElement("orderMessage");
if(!name||!validPhone(phone)||!division||!district||!areaType||!details||Object.keys(cart).length===0){if(msg)msg.textContent="অনুগ্রহ করে সঠিক নাম, মোবাইল, সম্পূর্ণ ঠিকানা ও পণ্যের তালিকা নিশ্চিত করুন।";return}
const _areaTypeForOrder=areaTypeSelect?areaTypeSelect.value:"";const _adjSub=Object.entries(cart).reduce((s,[id,info])=>{const _it=getItemById(id);const _p=priceForArea(_it,_areaTypeForOrder);return s+Math.round(_p*(_it.unit==="লিটার"?info.qtyDisplay:info.weightKg))},0);const sub=_adjSub,w=getTotalCartWeight(),dc=getDeliveryCharge(w),adc=dc===-1?150:dc,grand=sub+SERVICE_CHARGE+adc,orderNumber=makeOrderNumber();
let fromBal=0,due=grand;if(customerBalance>0){if(customerBalance>=grand){fromBal=grand;due=0}else{fromBal=customerBalance;due=grand-customerBalance}}
const order={orderNumber,name,phone:phone.replace(/[\s-]/g,""),address:{division,district,upazila,areaType,areaName,details},items:Object.entries(cart).map(([id,info])=>{const _it=getItemById(id);const _areaPrice=priceForArea(_it,areaType);const _qtyKg=info.weightKg;const _sub=Math.round(_areaPrice*( _it.unit==="লিটার"? info.qtyDisplay : _qtyKg));return {productId:Number(id),name:_it.name,customQuantity:info.qtyText,weightKg:info.weightKg,unitPrice:_areaPrice,subtotal:_sub}}),subtotal:sub,serviceCharge:SERVICE_CHARGE,deliveryCharge:adc,grandTotal:grand,amountFromBalance:fromBal,remainingDue:due,status:"অনুমোদনের অপেক্ষায়",createdAt:new Date().toISOString()};
const orders=getSavedOrders();orders.push(order);saveOrders(orders);
if(msg)msg.innerHTML=`<div style="background:#e8f5eb;padding:15px;border-radius:10px;border:1px solid #16834a"><h3>🎉 ডেমো অর্ডার তৈরি হয়েছে!</h3><p><b>অর্ডার নম্বর:</b> ${escapeHTML(orderNumber)}</p><p><b>সর্বমোট বিল:</b> ${money(grand)}</p><p>অগ্রিম থেকে পরিশোধ: <b>${money(fromBal)}</b></p>${due>0?`<p style="color:#d9534f">বাকি: <b>${money(due)}</b></p>`:`<p style="color:green"><b>সম্পূর্ণ বিল ব্যালেন্স থেকে পরিশোধিত!</b></p>`}</div>`;
Object.keys(cart).forEach(id=>delete cart[id]);drawCart();if(msg)msg.scrollIntoView({behavior:"smooth",block:"center"})};
/* লোকেশন - ডেলিভারি অনলি: পিকআপ + গন্তব্য (একই locationData) */
function wireDeliveryLocation(divId,distId,upaId){const div=getElement(divId),dist=getElement(distId),upa=getElement(upaId);if(!div||!dist||!upa)return;div.addEventListener("change",function(){const d=typeof locationData!=="undefined"?Object.keys(locationData):[];fillLocationSelect(dist,this.value==="খুলনা"?d:[],"জেলা নির্বাচন করুন");fillLocationSelect(upa,[],"আগে জেলা নির্বাচন করুন")});dist.addEventListener("change",function(){const u=typeof locationData!=="undefined"?locationData[this.value]||[]:[];fillLocationSelect(upa,u,"উপজেলা নির্বাচন করুন")})}
wireDeliveryLocation("dlPickupDivision","dlPickupDistrict","dlPickupUpazila");
wireDeliveryLocation("dlDestDivision","dlDestDistrict","dlDestUpazila");
/* শুধুমাত্র ডেলিভারি - রিকুইজেশন */
const submitDeliveryOnlyBtn=getElement("submitDeliveryOnly");
if(submitDeliveryOnlyBtn)submitDeliveryOnlyBtn.onclick=function(){
const msg=getElement("deliveryOnlyMessage"),v=id=>getElement(id)?getElement(id).value.trim():"";
const data={requisitionNo:v("dlSerial")||makeOrderNumber().replace("TB-","DL-"),product:v("dlProduct"),pickup:{division:v("dlPickupDivision"),district:v("dlPickupDistrict"),upazila:v("dlPickupUpazila"),details:v("dlPickupDetails")},destination:{division:v("dlDestDivision"),district:v("dlDestDistrict"),upazila:v("dlDestUpazila"),details:v("dlDestDetails")},weightText:v("dlWeight"),weightKg:parseWeightInKg(v("dlWeight")),name:v("dlName"),phone:v("dlPhone"),time:getElement("dlTime")?getElement("dlTime").value:"",address:v("dlAddress"),deliveryCharge:null,chargeStatus:"চার্জের অপেক্ষায় - অ্যাডমিন নির্ধারণ করবেন",status:"রিকুইজেশন পেয়েছি - প্রতিনিধির কাছে পাঠানোর অপেক্ষায়",createdAt:new Date().toISOString()};
if(!data.product||!data.name||!validPhone(data.phone)||!data.time||!data.address){if(msg)msg.textContent="পণ্য, নাম, সঠিক মোবাইল, ডেলিভারির সময় ও ঠিকানা অবশ্যই দিন।";return}
if(!data.pickup.details||!data.destination.details){if(msg)msg.textContent="কোথা থেকে নিতে হবে আর কোথায় যাবে - বিস্তারিত ঠিকানা ২টাই দিন।";return}
const list=getSavedDeliveryOnly();list.push(data);saveDeliveryOnly(list);
if(msg)msg.innerHTML=`✅ রিকুইজেশন <b>${escapeHTML(data.requisitionNo)}</b> পাঠানো হয়েছে। অ্যাডমিন চার্জ নির্ধারণ করে মার্কেট প্রতিনিধির কাছে পাঠাবেন।`;
["dlSerial","dlProduct","dlPickupDetails","dlDestDetails","dlWeight","dlName","dlPhone","dlTime","dlAddress"].forEach(id=>{const el=getElement(id);if(el)el.value=""});renderDeliveryLists();};
/* অ্যাডমিন: চার্জ বসানো + প্রতিনিধির কাছে পাঠানো */
function renderDeliveryLists(){
const adminBox=getElement("adminDeliveryList"),partnerBox=getElement("partnerDeliveryList");const list=getSavedDeliveryOnly();
if(adminBox){if(!list.length){adminBox.textContent="এখনো কোনো রিকুইজেশন আসেনি."}else{adminBox.innerHTML=list.map((d,i)=>`<div class="delivery-item"><p><b>${escapeHTML(d.requisitionNo)}</b> — ${escapeHTML(d.product)} (${escapeHTML(d.weightText||"")})</p><p>গ্রাহক: ${escapeHTML(d.name)} — ${escapeHTML(d.phone)}</p><p>পিকআপ: ${escapeHTML(d.pickup.details)} (${escapeHTML(d.pickup.upazila||"")}, ${escapeHTML(d.pickup.district||"")})</p><p>গন্তব্য: ${escapeHTML(d.destination.details)} (${escapeHTML(d.destination.upazila||"")}, ${escapeHTML(d.destination.district||"")})</p><p>সময়: ${escapeHTML(d.time)} | ঠিকানা: ${escapeHTML(d.address)}</p><p>অবস্থা: ${escapeHTML(d.status)} | চার্জ: ${d.deliveryCharge==null?"— অ্যাডমিন বসাবেন —":money(d.deliveryCharge)}</p>${d.deliveryCharge==null?`<input type="number" id="charge-${i}" placeholder="চার্জের টাকা লিখুন (৳)"><button type="button" data-setcharge="${i}">চার্জ বসিয়ে প্রতিনিধির কাছে পাঠান</button>`:`<p style="color:green"><b>✅ প্রতিনিধির কাছে পাঠানো হয়েছে</b></p>`}</div>`).join("");adminBox.querySelectorAll("[data-setcharge]").forEach(b=>{b.onclick=function(){const idx=Number(this.dataset.setcharge),inp=getElement("charge-"+idx),val=Number(inp?inp.value:0);if(!val||val<=0){alert("চার্জের টাকা লিখুন।");return}const l=getSavedDeliveryOnly();l[idx].deliveryCharge=val;l[idx].status="অ্যাডমিন চার্জ নির্ধারণ করেছেন - প্রতিনিধির কাছে পাঠানো হয়েছে";saveDeliveryOnly(l);renderDeliveryLists();}})}}
if(partnerBox){const sent=list.filter(d=>d.deliveryCharge!=null);if(!sent.length){partnerBox.textContent="এখনো কোনো ডেলিভারি-অনলি রিকুইজেশন পাঠানো হয়নি."}else{partnerBox.innerHTML=sent.map(d=>`<div class="delivery-item"><p><b>${escapeHTML(d.requisitionNo)}</b> — ${escapeHTML(d.product)}</p><p>গ্রাহক: ${escapeHTML(d.name)} — ${escapeHTML(d.phone)}</p><p>পিকআপ: ${escapeHTML(d.pickup.details)}</p><p>গন্তব্য: ${escapeHTML(d.destination.details)}</p><p><b>ডেলিভারি চার্জ: ${money(d.deliveryCharge)}</b></p></div>`).join("")}}}
}
/* নেভিগেশন */
document.querySelectorAll("nav button").forEach(btn=>{btn.addEventListener("click",function(){document.querySelectorAll("nav button").forEach(it=>it.classList.toggle("active",it===btn));document.querySelectorAll(".screen").forEach(s=>{s.classList.toggle("show",s.id===btn.dataset.tab)});if(btn.dataset.tab==="customer"){showCustomerPanel(null)}if(btn.dataset.tab==="admin"||btn.dataset.tab==="partner"){renderDeliveryLists()}})});
const qInput=getElement("q"),catSelect=getElement("cat");if(qInput)qInput.addEventListener("input",drawProducts);if(catSelect)catSelect.addEventListener("change",drawProducts);
drawProducts();drawCart();showCustomerPanel(null);renderDeliveryLists();
if(districtSelect&&upazilaSelect){districtSelect.addEventListener("change",function(){const el=getElement("demoAreaName");if(el&&this.value)el.textContent=this.value});upazilaSelect.addEventListener("change",function(){const el=getElement("demoAreaName");if(el&&this.value)el.textContent=this.value})}
document.addEventListener("change",function(e){if(e.target&&(e.target.id==="district"||e.target.id==="upazila")){const el=document.getElementById("demoAreaName");if(el&&e.target.value)el.textContent=e.target.value}});

/* ===== অ্যাডমিন: পণ্য যোগ/এডিট/ডিলিট (শুধু অ্যাডমিন) ===== */
let editingProdId=null;
function renderAdminProducts(){
 const box=getElement("adminProductList");if(!box)return;
 box.innerHTML=items.map(it=>`<div class="delivery-item" style="display:flex;gap:12px;align-items:center"><div style="width:56px;height:56px;border-radius:8px;overflow:hidden;background:#f4f8f5;display:grid;place-items:center;font-size:28px;flex-shrink:0">${it.img?`<img src="${escapeHTML(it.img)}" style="width:100%;height:100%;object-fit:cover">`:it.emoji}</div><div style="flex:1"><p><b>${escapeHTML(it.name)}</b> — ${escapeHTML(it.cat)} · ${money(it.price)}/${escapeHTML(it.unit)}</p><p style="font-size:13px">পৌরসভা: ${money(priceForArea(it,"পৌরসভা"))} · সিটি: ${money(priceForArea(it,"সিটি কর্পোরেশন"))} ${it.note?`· ${escapeHTML(it.note)}`:``}</p></div><div style="display:flex;gap:6px"><button type="button" data-editprod="${it.id}">এডিট</button><button type="button" data-delprod="${it.id}" style="background:#dc3545">ডিলিট</button></div></div>`).join("");
 box.querySelectorAll("[data-editprod]").forEach(b=>{b.onclick=()=>{const it=getItemById(b.dataset.editprod);editingProdId=it.id;getElement("admProdName").value=it.name;getElement("admProdCat").value=it.cat;getElement("admProdUnit").value=it.unit;getElement("admProdPrice").value=it.price;getElement("admProdPriceDivision").value=it.priceDivision||"";getElement("admProdPriceCity").value=it.priceCity||"";getElement("admProdImg").value=it.img||"";getElement("admProdEmoji").value=it.emoji||"";document.getElementById("admProdMsg").textContent="এডিট করছেন: "+it.name+" — সেভ করলে আপডেট হবে।";}});
 box.querySelectorAll("[data-delprod]").forEach(b=>{b.onclick=()=>{if(!confirm("এই পণ্যটি ডিলিট করবেন?"))return;const idx=items.findIndex(x=>x.id===Number(b.dataset.delprod));if(idx>=0)items.splice(idx,1);saveProducts();renderAdminProducts();drawProducts();}});
}
const admProdSave=getElement("admProdSave");
if(admProdSave)admProdSave.onclick=function(){
 const name=getElement("admProdName").value.trim(),cat=getElement("admProdCat").value,unit=getElement("admProdUnit").value,price=Number(getElement("admProdPrice").value),pDiv=Number(getElement("admProdPriceDivision").value)||0,pCity=Number(getElement("admProdPriceCity").value)||0,img=getElement("admProdImg").value.trim(),emoji=getElement("admProdEmoji").value.trim()||"🛒",msg=getElement("admProdMsg");
 if(!name||!price||price<=0){msg.textContent="পণ্যের নাম ও সঠিক দাম দিন।";return}
 if(editingProdId){const it=getItemById(editingProdId);Object.assign(it,{name,cat,price,unit,priceDivision:pDiv||undefined,priceCity:pCity||undefined,img,emoji,kgPerUnit:unit==="লিটার"?0.91:1,allowGram:unit!=="লিটার"});msg.textContent="✅ পণ্য আপডেট হয়েছে।";editingProdId=null}
 else{const id=Date.now();items.push({id,name,cat,price,unit,kgPerUnit:unit==="লিটার"?0.91:1,emoji,img,priceDivision:pDiv||undefined,priceCity:pCity||undefined,allowGram:unit!=="লিটার"});msg.textContent="✅ নতুন পণ্য যোগ হয়েছে।"}
 saveProducts();renderAdminProducts();drawProducts();
 ["admProdName","admProdPrice","admProdPriceDivision","admProdPriceCity","admProdImg","admProdEmoji"].forEach(id=>{const e=getElement(id);if(e)e.value=""});
};
/* ===== অ্যাডমিনের ভিতরে: প্রতিনিধি + ব্যবসায়ী ===== */
function getReps(){try{return JSON.parse(localStorage.getItem("tatkaReps"))||[]}catch{return[]}}
function saveReps(l){localStorage.setItem("tatkaReps",JSON.stringify(l))}
function getBiz(){try{return JSON.parse(localStorage.getItem("tatkaBusiness"))||[]}catch{return[]}}
function saveBiz(l){localStorage.setItem("tatkaBusiness",JSON.stringify(l))}
function renderReps(){const box=getElement("repList");if(!box)return;const l=getReps();box.innerHTML=!l.length?"এখনো কোনো প্রতিনিধি যোগ হয়নি.":l.map((r,i)=>`<div class="delivery-item"><p><b>${escapeHTML(r.name)}</b> — ${escapeHTML(r.area||"")}</p><p>মোবাইল: ${escapeHTML(r.phone)} · বাজার: ${escapeHTML(r.market||"")}</p><button type="button" data-delrep="${i}" style="background:#dc3545">ডিলিট</button></div>`).join("");box.querySelectorAll("[data-delrep]").forEach(b=>{b.onclick=()=>{const l=getReps();l.splice(Number(b.dataset.delrep),1);saveReps(l);renderReps()}})}
function renderBiz(){const box=getElement("bizList");if(!box)return;const l=getBiz();box.innerHTML=!l.length?"এখনো কোনো ব্যবসায়ী যোগ হয়নি.":l.map((b,i)=>`<div class="delivery-item"><p><b>${escapeHTML(b.shop)}</b> — ${escapeHTML(b.area||"")}</p><p>ব্যবসায়ী: ${escapeHTML(b.owner)} · মোবাইল: ${escapeHTML(b.phone)}</p><p>ঠিকানা: ${escapeHTML(b.addr)}</p><button type="button" data-delbiz="${i}" style="background:#dc3545">ডিলিট</button></div>`).join("");box.querySelectorAll("[data-delbiz]").forEach(btn=>{btn.onclick=()=>{const l=getBiz();l.splice(Number(btn.dataset.delbiz),1);saveBiz(l);renderBiz()}})}
const showRepCard=getElement("showRepCard"),showBizCard=getElement("showBizCard");
if(showRepCard)showRepCard.onclick=()=>{const c=getElement("repCard");c.hidden=!c.hidden;if(!c.hidden){getElement("bizCard").hidden=true;renderReps()}};
if(showBizCard)showBizCard.onclick=()=>{const c=getElement("bizCard");c.hidden=!c.hidden;if(!c.hidden){getElement("repCard").hidden=true;renderBiz()}};
const repSave=getElement("repSave");
if(repSave)repSave.onclick=()=>{const name=getElement("repName").value.trim(),phone=getElement("repPhone").value.trim(),area=getElement("repArea").value.trim(),market=getElement("repMarket").value.trim();if(!name||!validPhone(phone)){alert("প্রতিনিধির নাম ও সঠিক মোবাইল দিন।");return}const l=getReps();l.push({name,phone,area,market});saveReps(l);renderReps();["repName","repPhone","repArea","repMarket"].forEach(id=>getElement(id).value="")};
const bizSave=getElement("bizSave");
if(bizSave)bizSave.onclick=()=>{const shop=getElement("bizShop").value.trim(),owner=getElement("bizOwner").value.trim(),addr=getElement("bizAddr").value.trim(),phone=getElement("bizPhone").value.trim(),area=getElement("bizArea").value.trim();if(!shop||!owner||!validPhone(phone)){alert("দোকানের নাম, ব্যবসায়ীর নাম ও সঠিক মোবাইল দিন।");return}const l=getBiz();l.push({shop,owner,addr,phone,area});saveBiz(l);renderBiz();["bizShop","bizOwner","bizAddr","bizPhone","bizArea"].forEach(id=>getElement(id).value="")};
/* অ্যাডমিন ট্যাব খুললে পণ্য + রিকুইজেশন রেন্ডার */
const _origNav=document.querySelectorAll("nav button");
_origNav.forEach(btn=>{btn.addEventListener("click",()=>{if(btn.dataset.tab==="admin"){renderAdminProducts();renderReps();renderBiz();renderDeliveryLists()}})});
renderAdminProducts();renderReps();renderBiz();

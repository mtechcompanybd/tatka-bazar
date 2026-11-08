/* =========================================
   TATKA BAZAR - CUSTOMER APP
   Advanced Public Demo Version with Custom Qty & Billing
========================================= */

// =========================================
// ১. পণ্যের তালিকা (ইউনিট সহ)
// =========================================

const items = [
    ["মিনিকেট চাল", "নিত্যপ্রয়োজনীয়", 72, "কেজি", "🍚"],
    ["মসুর ডাল", "নিত্যপ্রয়োজনীয়", 125, "কেজি", "🫘"],
    ["সয়াবিন তেল", "নিত্যপ্রয়োজনীয়", 170, "লিটার", "🫗"],
    ["আলু", "শাকসবজি", 35, "কেজি", "🥔"],
    ["টমেটো", "শাকসবজি", 60, "কেজি", "🍅"],
    ["বেগুন", "শাকসবজি", 55, "কেজি", "🍆"],
    ["পালং শাক", "শাকসবজি", 25, "আঁটি", "🥬"],
    ["রুই মাছ", "মাছ", 320, "কেজি", "🐟"],
    ["তেলাপিয়া", "মাছ", 190, "কেজি", "🐠"],
    ["হলুদ গুঁড়া", "মসলা", 260, "কেজি", "🟡"],
    ["মরিচ গুঁড়া", "মসলা", 340, "কেজি", "🌶️"],
    ["জিরা", "মসলা", 680, "কেজি", "🧂"]
];

// কার্টে স্টোর হবে: { 0: { qtyText: "১.৫ কেজি", weightKg: 1.5, subtotal: 108 }, ... }
const cart = {};

const SERVICE_CHARGE = 25;

// ডেমো গ্রাহক ব্যালেন্স (অগ্রিম জমা)
let customerBalance = 150.00; 


// =========================================
// ২. সাধারণ ফাংশন
// =========================================

function money(number) {
    return "৳" + Number(number || 0).toLocaleString("bn-BD");
}

function getElement(id) {
    return document.getElementById(id);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[char]);
}

function validPhone(phone) {
    const clean = phone.replace(/[\s-]/g, "");
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(clean);
}

function makeOrderNumber() {
    return "TB-" + Date.now().toString().slice(-8);
}


// =========================================
// ৩. সুনির্দিষ্ট ওজন বিশ্লেষণ (Text থেকে Kg রূপান্তর)
// =========================================

function parseWeightInKg(text) {
    text = text.toLowerCase().trim();
    let totalKg = 0;

    // কেজি বা লিটার হিসাব
    if (text.includes("কেজি") || text.includes("লিটার")) {
        const parts = text.split(/কেজি|লিটার/);
        const mainVal = parseFloat(parts[0]) || 0;
        totalKg += mainVal;
    } 
    // গ্রাম হিসাব
    else if (text.includes("গ্রাম")) {
        const val = parseFloat(text) || 0;
        totalKg += val / 1000;
    } 
    // সংখ্যা থাকলে ডিফল্ট কেজি ধরা
    else {
        totalKg += parseFloat(text) || 1;
    }

    return totalKg;
}


// =========================================
// ৪. ওজন অনুযায়ী পরিবহন চার্জ (আপনার চার্ট অনুযায়ী)
// =========================================

function getDeliveryCharge(totalWeightKg) {
    if (totalWeightKg <= 0) return 0;
    if (totalWeightKg <= 5) return 25;
    if (totalWeightKg <= 10) return 50;
    if (totalWeightKg <= 15) return 75;
    if (totalWeightKg <= 20) return 100;
    if (totalWeightKg <= 30) return 125;
    if (totalWeightKg <= 40) return 150;
    return -1; // ৪০ কেজির বেশি হলে কর্তৃপক্ষের সিদ্ধান্ত
}


// =========================================
// ৫. ডাটা স্টোরেজ হ্যান্ডলার
// =========================================

function getSavedOrders() {
    try {
        return JSON.parse(localStorage.getItem("tatkaOrders")) || [];
    } catch {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem("tatkaOrders", JSON.stringify(orders));
}

function getSavedComplaints() {
    try {
        return JSON.parse(localStorage.getItem("tatkaComplaints")) || [];
    } catch {
        return [];
    }
}

function saveComplaints(complaints) {
    localStorage.setItem("tatkaComplaints", JSON.stringify(complaints));
}


// =========================================
// ৬. গ্রাহক অ্যাপের প্যানেল কন্ট্রোল
// =========================================

const registerPanel = getElement("registerPanel");
const shopPanel = getElement("shopPanel");
const checkoutPanel = getElement("checkoutPanel");

function showCustomerPanel(panel) {
    [registerPanel, shopPanel, checkoutPanel].forEach(item => {
        if (item) item.hidden = true;
    });

    if (panel) {
        panel.hidden = false;
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

getElement("showRegister").onclick = () => showCustomerPanel(registerPanel);
getElement("showShop").onclick = () => showCustomerPanel(shopPanel);
getElement("showGuest").onclick = () => showCustomerPanel(checkoutPanel);


// =========================================
// ৭. নিবন্ধন ব্যবস্থা
// =========================================

getElement("registerButton").onclick = function () {
    const name = getElement("regName").value.trim();
    const phone = getElement("regPhone").value.trim();
    const message = getElement("registerMessage");

    if (!name || !phone) {
        message.textContent = "পূর্ণ নাম ও মোবাইল নম্বর লিখুন।";
        return;
    }
    if (!validPhone(phone)) {
        message.textContent = "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।";
        return;
    }
    message.textContent = "ডেমো নিবন্ধন সফল! (বাস্তব OTP সিস্টেম পরবর্তীতে যুক্ত হবে)";
};


// =========================================
// ৮. পণ্য রেন্ডার ও কাস্টম পরিমাণ ইনপুট
// =========================================

function drawProducts() {
    const query = getElement("q").value.trim().toLowerCase();
    const category = getElement("cat").value;

    const filtered = items
        .map((item, index) => ({
            id: index,
            name: item[0],
            category: item[1],
            price: item[2],
            unit: item[3],
            emoji: item[4]
        }))
        .filter(item =>
            (category === "all" || item.category === category) &&
            item.name.toLowerCase().includes(query)
        );

    getElement("products").innerHTML = filtered.map(item => `
        <article class="product">
            <div>${item.emoji}</div>
            <h3>${escapeHTML(item.name)}</h3>
            <small>${escapeHTML(item.category)} · প্রতি ${escapeHTML(item.unit)} (${money(item.price)})</small>
            
            <div style="margin-top: 10px;">
                <input type="text" id="qty-${item.id}" value="১ ${item.unit}" 
                    style="padding: 6px; font-size: 13px; margin-bottom: 6px; text-align: center;">
                <button type="button" data-add="${item.id}" style="width: 100%;">
                    + কার্টে যোগ করুন
                </button>
            </div>
        </article>
    `).join("");

    document.querySelectorAll("[data-add]").forEach(button => {
        button.onclick = function () {
            const id = Number(this.dataset.add);
            const inputVal = getElement(`qty-${id}`).value.trim() || `১ ${items[id][3]}`;
            
            const weightKg = parseWeightInKg(inputVal);
            const unitPrice = items[id][2];
            const subtotal = Math.round(unitPrice * weightKg);

            cart[id] = {
                qtyText: inputVal,
                weightKg: weightKg,
                subtotal: subtotal
            };

            drawCart();
        };
    });
}


// =========================================
// ৯. কার্ট ও চূড়ান্ত বিল হিসাব (পরিবহন চার্জসহ)
// =========================================

function getCartSubtotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.subtotal, 0);
}

function getTotalCartWeight() {
    return Object.values(cart).reduce((sum, item) => sum + item.weightKg, 0);
}

function drawCart() {
    let html = "";

    Object.entries(cart).forEach(([id, info]) => {
        const item = items[Number(id)];
        html += `
            <p style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span><b>${escapeHTML(item[0])}</b> (${escapeHTML(info.qtyText)}) — ${money(info.subtotal)}</span>
                <button type="button" data-remove="${id}" style="padding: 4px 8px; background: #dc3545; font-size: 11px;">বাদ</button>
            </p>
        `;
    });

    getElement("cart").innerHTML = html || "পণ্য যোগ করলে এখানে দেখা যাবে।";

    const subtotal = getCartSubtotal();
    const totalWeight = getTotalCartWeight();
    const deliveryCharge = getDeliveryCharge(totalWeight);

    let deliveryText = "";
    let grandTotal = subtotal + SERVICE_CHARGE;

    if (deliveryCharge === -1) {
        deliveryText = "কর্তৃপক্ষের সিদ্ধান্ত (৪০ কেজির বেশি)";
    } else {
        deliveryText = money(deliveryCharge);
        grandTotal += deliveryCharge;
    }

    // টেমপ্লেটে বিল সামারি দেখানোর জন্য আপডেট
    getElement("total").innerHTML = `
        বাজার মূল্য: ${money(subtotal)}<br>
        সার্ভিস চার্জ: ${money(SERVICE_CHARGE)}<br>
        মোট ওজন: ${totalWeight.toFixed(2)} কেজি<br>
        পরিবহন চার্জ: ${deliveryText}<br>
        <hr style="margin: 6px 0; border: 0; border-top: 1px dashed #ccc;">
        <b>সর্বমোট প্রাক্কলিত বিল: ${money(grandTotal)}</b>
    `;

    document.querySelectorAll("[data-remove]").forEach(button => {
        button.onclick = function () {
            delete cart[Number(this.dataset.remove)];
            drawCart();
        };
    });
}


// =========================================
// ১০. কার্ট থেকে অর্ডার পেজে যাওয়া
// =========================================

getElement("checkoutFromCart").onclick = function () {
    if (Object.keys(cart).length === 0) {
        alert("প্রথমে বাজারের তালিকায় পণ্য যোগ করুন।");
        return;
    }
    showCustomerPanel(checkoutPanel);
};


// =========================================
// ১১. ঠিকানা নির্বাচন লজিক
// =========================================

const divisionSelect = getElement("division");
const districtSelect = getElement("district");
const upazilaSelect = getElement("upazila");
const areaTypeSelect = getElement("areaType");
const areaNameSelect = getElement("areaName");
const manualAreaInput = getElement("manualArea");

function fillLocationSelect(select, list, placeholder) {
    select.innerHTML = "";
    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = placeholder;
    select.appendChild(firstOption);

    list.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
    select.disabled = list.length === 0;
}

divisionSelect.addEventListener("change", function () {
    const districts = typeof locationData !== "undefined" ? Object.keys(locationData) : [];
    fillLocationSelect(districtSelect, this.value === "খুলনা" ? districts : [], "জেলা নির্বাচন করুন");
    fillLocationSelect(upazilaSelect, [], "আগে জেলা নির্বাচন করুন");
    fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");
    manualAreaInput.hidden = true;
});

districtSelect.addEventListener("change", function () {
    const upazilas = typeof locationData !== "undefined" ? locationData[this.value] || [] : [];
    fillLocationSelect(upazilaSelect, upazilas, "উপজেলা নির্বাচন করুন");
    fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");
    manualAreaInput.hidden = true;
});

function updateAreaList() {
    const upazila = upazilaSelect.value;
    const areaType = areaTypeSelect.value;
    const areas = typeof areaData !== "undefined" && areaData[upazila] ? areaData[upazila][areaType] || [] : [];

    fillLocationSelect(areaNameSelect, areas, areas.length ? "এলাকা নির্বাচন করুন" : "তালিকা পাওয়া যায়নি");
    manualAreaInput.hidden = areas.length > 0;
    if (areas.length === 0) manualAreaInput.value = "";
}

upazilaSelect.addEventListener("change", updateAreaList);
areaTypeSelect.addEventListener("change", updateAreaList);


// =========================================
// ১২. চূড়ান্ত ডেমো অর্ডার ও পেমেন্ট গেটওয়ে সংযোজন
// =========================================

getElement("placeDemoOrder").onclick = function () {
    const name = getElement("orderName").value.trim();
    const phone = getElement("orderPhone").value.trim();
    const division = divisionSelect.value;
    const district = districtSelect.value;
    const upazila = upazilaSelect.value;
    const areaType = areaTypeSelect.value;
    const areaName = areaNameSelect.value || manualAreaInput.value.trim();
    const details = getElement("addressDetails").value.trim();
    const message = getElement("orderMessage");

    if (!name || !validPhone(phone) || !division || !district || !areaType || !details || Object.keys(cart).length === 0) {
        message.textContent = "অনুগ্রহ করে সঠিক নাম, মোবাইল, সম্পূর্ণ ঠিকানা ও পণ্যের তালিকা নিশ্চিত করুন।";
        return;
    }

    const subtotal = getCartSubtotal();
    const totalWeight = getTotalCartWeight();
    const deliveryCharge = getDeliveryCharge(totalWeight);
    const actualDeliveryCharge = deliveryCharge === -1 ? 150 : deliveryCharge; // ডিফল্ট বা নির্ধারিত চার্জ
    
    const grandTotal = subtotal + SERVICE_CHARGE + actualDeliveryCharge;
    const orderNumber = makeOrderNumber();

    // ব্যালেন্স থেকে কর্তন হিসাব
    let amountFromBalance = 0;
    let remainingDue = grandTotal;

    if (customerBalance > 0) {
        if (customerBalance >= grandTotal) {
            amountFromBalance = grandTotal;
            remainingDue = 0;
        } else {
            amountFromBalance = customerBalance;
            remainingDue = grandTotal - customerBalance;
        }
    }

    const orderItems = Object.entries(cart).map(([id, info]) => ({
        productId: Number(id),
        name: items[Number(id)][0],
        customQuantity: info.qtyText,
        weightKg: info.weightKg,
        subtotal: info.subtotal
    }));

    const order = {
        orderNumber,
        name,
        phone: phone.replace(/[\s-]/g, ""),
        address: { division, district, upazila, areaType, areaName, details },
        items: orderItems,
        subtotal,
        serviceCharge: SERVICE_CHARGE,
        deliveryCharge: actualDeliveryCharge,
        grandTotal,
        amountFromBalance,
        remainingDue,
        status: "অনুমোদনের অপেক্ষায়",
        createdAt: new Date().toISOString()
    };

    const orders = getSavedOrders();
    orders.push(order);
    saveOrders(orders);

    // পেমেন্ট অপشنসহ সফলতার বার্তা তৈরি
    message.innerHTML = `
        <div style="background: #e8f5eb; padding: 15px; border-radius: 10px; border: 1px solid #16834a;">
            <h3 style="color: #096438; margin-top:0;">🎉 সফলভাবে ডেমো অর্ডার তৈরি হয়েছে!</h3>
            <p><b>অর্ডার নম্বর:</b> ${escapeHTML(orderNumber)}</p>
            <p><b>মোট বাজারের দাম:</b> ${money(subtotal)}</p>
            <p><b>সার্ভিস চার্জ:</b> ${money(SERVICE_CHARGE)}</p>
            <p><b>পরিবহন চার্জ (${totalWeight.toFixed(2)} কেজি):</b> ${money(actualDeliveryCharge)}</p>
            <p style="font-size: 16px; color: #16834a;"><b>পরিশোধযোগ্য মোট বিল (Payable Bill): ${money(grandTotal)}</b></p>
            
            <hr style="margin: 10px 0;">
            <p><b>ব্যালেন্স পেমেন্ট তথ্য:</b></p>
            <p>আপনার অগ্রিম জমা অ্যাকাউন্ট থেকে পরিশোধ: <b>${money(amountFromBalance)}</b></p>
            ${remainingDue > intToFloat = 0 ? `<p style="color: #d9534f;">বাকি পরিশোধযোগ্য: <b>${money(remainingDue)}</b></p>` : `<p style="color: green;"><b>সম্পূর্ণ বিল ব্যালেন্স থেকে পরিশোধিত!</b></p>`}

            ${remainingDue > 0 ? `
                <div style="margin-top: 15px;">
                    <p><b>বাকি টাকা পেমেন্ট করার মাধ্যম নির্বাচন করুন:</b></p>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                        <button type="button" onclick="alert('বিকাশ পেমেন্ট ডেমো গেটওয়ে সফল!')" style="background: #e2136e; color: #fff;">বিকাশ (bKash)</button>
                        <button type="button" onclick="alert('নগদ পেমেন্ট ডেমো গেটওয়ে সফল!')" style="background: #ec1c24; color: #fff;">নগদ (Nagad)</button>
                        <button type="button" onclick="alert('রকেট পেমেন্ট ডেমো গেটওয়ে সফল!')" style="background: #8b3a9b; color: #fff;">রকেট (Rocket)</button>
                        <button type="button" onclick="alert('ব্যাংক পেমেন্ট ডেমো সফল!')" style="background: #0055a5; color: #fff;">ব্যাংক পেমেন্ট</button>
                    </div>
                </div>
            ` : ""}
        </div>
    `;

    // কার্ট খালি করা
    Object.keys(cart).forEach(id => delete cart[id]);
    drawCart();

    message.scrollIntoView({ behavior: "smooth", block: "center" });
};


// =========================================
// ১৩. অভিযোগ ও অন্যান্য মডিউল (পূর্বের মতো অক্ষুণ্ণ)
// =========================================

function addComplaintSection() {
    const customerScreen = getElement("customer");
    if (!customerScreen || getElement("complaintSection")) return;

    const section = document.createElement("section");
    section.id = "complaintSection";
    section.className = "panel";
    section.innerHTML = `
        <h2>অভিযোগ ও মতামত</h2>
        <p>আপনার কোনো সমস্যা বা অভিযোগ থাকলে জানান।</p>
        <label>আপনার নাম</label>
        <input id="complaintName" type="text" placeholder="পূর্ণ নাম">
        <label>মোবাইল নম্বর</label>
        <input id="complaintPhone" type="tel" placeholder="01XXXXXXXXX">
        <label>অর্ডার নম্বর (ঐচ্ছিক)</label>
        <input id="complaintOrder" type="text" placeholder="TB-XXXXXXXX">
        <label>অভিযোগের ধরন</label>
        <select id="complaintCategory">
            <option value="">নির্বাচন করুন</option>
            <option>পণ্যের মান খারাপ</option>
            <option>ওজনে কম বা বেশি</option>
            <option>ভুল পণ্য সরবরাহ</option>
            <option>অন্যান্য</option>
        </select>
        <label>বিস্তারিত অভিযোগ</label>
        <textarea id="complaintDetails" rows="3" placeholder="আপনার অভিযোগ লিখুন"></textarea>
        <button type="button" id="submitComplaint">অভিযোগ জমা দিন</button>
        <p id="complaintMessage"></p>
    `;
    customerScreen.appendChild(section);

    getElement("submitComplaint").onclick = function () {
        const name = getElement("complaintName").value.trim();
        const phone = getElement("complaintPhone").value.trim();
        const details = getElement("complaintDetails").value.trim();
        const msg = getElement("complaintMessage");

        if (!name || !validPhone(phone) || !details) {
            msg.textContent = "সবগুলো সঠিক তথ্য দিয়ে পূরণ করুন।";
            return;
        }

        const complaints = getSavedComplaints();
        complaints.push({
            complaintNumber: "CMP-" + Date.now().toString().slice(-7),
            name, phone, details, status: "নতুন"
        });
        saveComplaints(complaints);
        msg.textContent = "আপনার অভিযোগ সফলভাবে জমা হয়েছে। ধন্যবাদ!";
    };
}


// =========================================
// ১৪. ইনিশিয়ালাইজেশন
// =========================================

document.querySelectorAll("nav button").forEach(button => {
    button.addEventListener("click", function () {
        document.querySelectorAll("nav button").forEach(item => item.classList.toggle("active", item === button));
        document.querySelectorAll(".screen").forEach(screen => screen.classList.toggle("show", screen.id === button.dataset.tab));
        if (button.dataset.tab === "customer") showCustomerPanel(null);
    });
});

getElement("q").addEventListener("input", drawProducts);
getElement("cat").addEventListener("change", drawProducts);

drawProducts();
drawCart();
showCustomerPanel(null);
addComplaintSection();

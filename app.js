/* =========================================
   TATKA BAZAR - CUSTOMER APP (FIXED & SECURE)
   A Brand of M-Tech
========================================= */

// =========================================
// ১. পণ্যের তালিকা
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

const cart = {};
const SERVICE_CHARGE = 25;
let customerBalance = 150.00; // ডেমো অগ্রিম ব্যালেন্স

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
// ৩. ওজন হিসাব (Text থেকে Kg)
// =========================================

function parseWeightInKg(text) {
    text = text.toLowerCase().trim();
    let totalKg = 0;

    if (text.includes("কেজি") || text.includes("লিটার")) {
        const parts = text.split(/কেজি|লিটার/);
        totalKg += parseFloat(parts[0]) || 1;
    } else if (text.includes("গ্রাম")) {
        const val = parseFloat(text) || 0;
        totalKg += val / 1000;
    } else {
        totalKg += parseFloat(text) || 1;
    }
    return totalKg;
}

// =========================================
// ৪. ওজন অনুযায়ী পরিবহন চার্জ
// =========================================

function getDeliveryCharge(totalWeightKg) {
    if (totalWeightKg <= 0) return 0;
    if (totalWeightKg <= 5) return 25;
    if (totalWeightKg <= 10) return 50;
    if (totalWeightKg <= 15) return 75;
    if (totalWeightKg <= 20) return 100;
    if (totalWeightKg <= 30) return 125;
    if (totalWeightKg <= 40) return 150;
    return -1; // ৪০ কেজির বেশি
}

// =========================================
// ৫. ডাটা স্টোরেজ
// =========================================

function getSavedOrders() {
    try { return JSON.parse(localStorage.getItem("tatkaOrders")) || []; } catch { return []; }
}
function saveOrders(orders) {
    localStorage.setItem("tatkaOrders", JSON.stringify(orders));
}
function getSavedComplaints() {
    try { return JSON.parse(localStorage.getItem("tatkaComplaints")) || []; } catch { return []; }
}
function saveComplaints(complaints) {
    localStorage.setItem("tatkaComplaints", JSON.stringify(complaints));
}

// =========================================
// ৬. প্যানেল কন্ট্রোল (ফিক্সড)
// =========================================

const registerPanel = getElement("registerPanel");
const shopPanel = getElement("shopPanel");
const checkoutPanel = getElement("checkoutPanel");

function showCustomerPanel(panel) {
    if (registerPanel) registerPanel.hidden = true;
    if (shopPanel) shopPanel.hidden = true;
    if (checkoutPanel) checkoutPanel.hidden = true;

    if (panel) {
        panel.hidden = false;
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

const showRegBtn = getElement("showRegister");
const showShopBtn = getElement("showShop");
const showGuestBtn = getElement("showGuest");

if (showRegBtn) {
    showRegBtn.onclick = () => showCustomerPanel(registerPanel);
}
if (showShopBtn) {
    showShopBtn.onclick = () => showCustomerPanel(shopPanel);
}
if (showGuestBtn) {
    showGuestBtn.onclick = () => showCustomerPanel(checkoutPanel);
}

// =========================================
// ৭. নিবন্ধন ব্যবস্থা
// =========================================

const regBtn = getElement("registerButton");
if (regBtn) {
    regBtn.onclick = function () {
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
}

// =========================================
// ৮. পণ্য রেন্ডার ও কাস্টম পরিমাণ ইনপুট
// =========================================

function drawProducts() {
    const qEl = getElement("q");
    const catEl = getElement("cat");
    const productsContainer = getElement("products");

    if (!productsContainer) return;

    const query = qEl ? qEl.value.trim().toLowerCase() : "";
    const category = catEl ? catEl.value : "all";

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

    productsContainer.innerHTML = filtered.map(item => `
        <article class="product">
            <div>${item.emoji}</div>
            <h3>${escapeHTML(item.name)}</h3>
            <small>${escapeHTML(item.category)} · প্রতি ${escapeHTML(item.unit)} (${money(item.price)})</small>
            
            <div style="margin-top: 12px;">
                <input type="text" id="qty-${item.id}" value="১ ${item.unit}" 
                    style="padding: 8px; font-size: 13px; margin-bottom: 8px; text-align: center; border: 1px solid #ccc; border-radius: 6px; width: 100%;">
                <button type="button" data-add="${item.id}" style="width: 100%;">
                    + কার্টে যোগ করুন
                </button>
            </div>
        </article>
    `).join("");

    document.querySelectorAll("[data-add]").forEach(button => {
        button.onclick = function () {
            const id = Number(this.dataset.add);
            const inputValEl = getElement(`qty-${id}`);
            const inputVal = inputValEl ? inputValEl.value.trim() : `১ ${items[id][3]}`;
            
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
// ৯. কার্ট ও বিল হিসাব
// =========================================

function getCartSubtotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.subtotal, 0);
}

function getTotalCartWeight() {
    return Object.values(cart).reduce((sum, item) => sum + item.weightKg, 0);
}

function drawCart() {
    const cartContainer = getElement("cart");
    const totalContainer = getElement("total");

    if (!cartContainer || !totalContainer) return;

    let html = "";

    Object.entries(cart).forEach(([id, info]) => {
        const item = items[Number(id)];
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 6px;">
                <span><b>${escapeHTML(item[0])}</b> (${escapeHTML(info.qtyText)}) — ${money(info.subtotal)}</span>
                <button type="button" data-remove="${id}" style="padding: 4px 8px; background: #dc3545; color: #fff; border: none; border-radius: 4px; font-size: 11px; cursor: pointer;">বাদ</button>
            </div>
        `;
    });

    cartContainer.innerHTML = html || "পণ্য যোগ করলে এখানে দেখা যাবে।";

    const subtotal = getCartSubtotal();
    const totalWeight = getTotalCartWeight();
    const deliveryCharge = getDeliveryCharge(totalWeight);

    let deliveryText = "";
    let grandTotal = subtotal + SERVICE_CHARGE;

    if (deliveryCharge === -1) {
        deliveryText = "কর্তৃপক্ষের সিদ্ধান্ত (৪০ কেজির বেশি)";
        grandTotal += 150;
    } else {
        deliveryText = money(deliveryCharge);
        grandTotal += deliveryCharge;
    }

    totalContainer.innerHTML = `
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

const checkoutFromCartBtn = getElement("checkoutFromCart");
if (checkoutFromCartBtn) {
    checkoutFromCartBtn.onclick = function () {
        if (Object.keys(cart).length === 0) {
            alert("প্রথমে বাজারের তালিকায় পণ্য যোগ করুন।");
            return;
        }
        showCustomerPanel(checkoutPanel);
    };
}

// =========================================
// ১০. ঠিকানা নির্বাচন
// =========================================

const divisionSelect = getElement("division");
const districtSelect = getElement("district");
const upazilaSelect = getElement("upazila");
const areaTypeSelect = getElement("areaType");
const areaNameSelect = getElement("areaName");
const manualAreaInput = getElement("manualArea");

function fillLocationSelect(select, list, placeholder) {
    if (!select) return;
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

if (divisionSelect) {
    divisionSelect.addEventListener("change", function () {
        const districts = typeof locationData !== "undefined" ? Object.keys(locationData) : [];
        fillLocationSelect(districtSelect, this.value === "খুলনা" ? districts : [], "জেলা নির্বাচন করুন");
        fillLocationSelect(upazilaSelect, [], "আগে জেলা নির্বাচন করুন");
        fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");
        if (manualAreaInput) manualAreaInput.hidden = true;
    });
}

if (districtSelect) {
    districtSelect.addEventListener("change", function () {
        const upazilas = typeof locationData !== "undefined" ? locationData[this.value] || [] : [];
        fillLocationSelect(upazilaSelect, upazilas, "উপজেলা নির্বাচন করুন");
        fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");
        if (manualAreaInput) manualAreaInput.hidden = true;
    });
}

function updateAreaList() {
    if (!upazilaSelect || !areaTypeSelect || !areaNameSelect) return;
    const upazila = upazilaSelect.value;
    const areaType = areaTypeSelect.value;
    const areas = typeof areaData !== "undefined" && areaData[upazila] ? areaData[upazila][areaType] || [] : [];

    fillLocationSelect(areaNameSelect, areas, areas.length ? "এলাকা নির্বাচন করুন" : "তালিকা পাওয়া যায়নি");
    if (manualAreaInput) {
        manualAreaInput.hidden = areas.length > 0;
        if (areas.length === 0) manualAreaInput.value = "";
    }
}

if (upazilaSelect) upazilaSelect.addEventListener("change", updateAreaList);
if (areaTypeSelect) areaTypeSelect.addEventListener("change", updateAreaList);

// =========================================
// ১১. অর্ডার প্লেস ও পেমেন্ট গেটওয়ে
// =========================================

const placeDemoOrderBtn = getElement("placeDemoOrder");
if (placeDemoOrderBtn) {
    placeDemoOrderBtn.onclick = function () {
        const name = getElement("orderName").value.trim();
        const phone = getElement("orderPhone").value.trim();
        const division = divisionSelect ? divisionSelect.value : "";
        const district = districtSelect ? districtSelect.value : "";
        const upazila = upazilaSelect ? upazilaSelect.value : "";
        const areaType = areaTypeSelect ? areaTypeSelect.value : "";
        const areaName = (areaNameSelect ? areaNameSelect.value : "") || (manualAreaInput ? manualAreaInput.value.trim() : "");
        const details = getElement("addressDetails").value.trim();
        const message = getElement("orderMessage");

        if (!name || !validPhone(phone) || !division || !district || !areaType || !details || Object.keys(cart).length === 0) {
            if (message) message.textContent = "অনুগ্রহ করে সঠিক নাম, মোবাইল, সম্পূর্ণ ঠিকানা ও পণ্যের তালিকা নিশ্চিত করুন।";
            return;
        }

        const subtotal = getCartSubtotal();
        const totalWeight = getTotalCartWeight();
        const deliveryCharge = getDeliveryCharge(totalWeight);
        const actualDeliveryCharge = deliveryCharge === -1 ? 150 : deliveryCharge;
        
        const grandTotal = subtotal + SERVICE_CHARGE + actualDeliveryCharge;
        const orderNumber = makeOrderNumber();

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

        if (message) {
            message.innerHTML = `
                <div style="background: #e8f5eb; padding: 15px; border-radius: 10px; border: 1px solid #16834a; text-align: left;">
                    <h3 style="color: #096438; margin-top:0;">🎉 সফলভাবে ডেমো অর্ডার তৈরি হয়েছে!</h3>
                    <p><b>অর্ডার নম্বর:</b> ${escapeHTML(orderNumber)}</p>
                    <p><b>মোট বাজারের দাম:</b> ${money(subtotal)}</p>
                    <p><b>সার্ভিস চার্জ:</b> ${money(SERVICE_CHARGE)}</p>
                    <p><b>পরিবহন চার্জ (${totalWeight.toFixed(2)} কেজি):</b> ${money(actualDeliveryCharge)}</p>
                    <p style="font-size: 16px; color: #16834a;"><b>পরিশোধযোগ্য মোট বিল: ${money(grandTotal)}</b></p>
                    <hr style="margin: 10px 0;">
                    <p>আপনার অগ্রিম জমা অ্যাকাউন্ট থেকে পরিশোধ: <b>${money(amountFromBalance)}</b></p>
                    ${remainingDue > 0 ? `<p style="color: #d9534f;">বাকি পরিশোধযোগ্য: <b>${money(remainingDue)}</b></p>` : `<p style="color: green;"><b>সম্পূর্ণ বিল ব্যালেন্স থেকে পরিশোধিত!</b></p>`}
                    
                    ${remainingDue > 0 ? `
                        <div style="margin-top: 15px;">
                            <p><b>বাকি টাকা পেমেন্ট করার মাধ্যম নির্বাচন করুন:</b></p>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                                <button type="button" onclick="alert('বিকাশ পেমেন্ট ডেমো সফল!')" style="background: #e2136e; color: #fff; padding: 8px 12px; border: none; border-radius: 6px;">বিকাশ (bKash)</button>
                                <button type="button" onclick="alert('নগদ পেমেন্ট ডেমো সফল!')" style="background: #ec1c24; color: #fff; padding: 8px 12px; border: none; border-radius: 6px;">নগদ (Nagad)</button>
                                <button type="button" onclick="alert('রকেট পেমেন্ট ডেমো সফল!')" style="background: #8b3a9b; color: #fff; padding: 8px 12px; border: none; border-radius: 6px;">রকেট (Rocket)</button>
                                <button type="button" onclick="alert('ব্যাংক পেমেন্ট ডেমো সফল!')" style="background: #0055a5; color: #fff; padding: 8px 12px; border: none; border-radius: 6px;">ব্যাংক পেমেন্ট</button>
                            </div>
                        </div>
                    ` : ""}
                </div>
            `;
        }

        Object.keys(cart).forEach(id => delete cart[id]);
        drawCart();
        if (message) message.scrollIntoView({ behavior: "smooth", block: "center" });
    };
}

// =========================================
// ১২. নেভিগেশন ট্যাব সুইচিং
// =========================================

document.querySelectorAll("nav button").forEach(button => {
    button.addEventListener("click", function () {
        document.querySelectorAll("nav button").forEach(item => item.classList.toggle("active", item === button));
        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.toggle("show", screen.id === button.dataset.tab);
        });
        if (button.dataset.tab === "customer") {
            showCustomerPanel(null);
        }
    });
});

const qInput = getElement("q");
const catSelect = getElement("cat");
if (qInput) qInput.addEventListener("input", drawProducts);
if (catSelect) catSelect.addEventListener("change", drawProducts);

// =========================================
// ১৩. প্রাথমিক রান
// =========================================

drawProducts();
drawCart();
showCustomerPanel(null);
// জেলা বা উপজেলা পরিবর্তন করলে ডেমো এলাকার নাম আপডেট করার ফাংশন
if (districtSelect && upazilaSelect) {
    districtSelect.addEventListener("change", function() {
        const demoAreaEl = getElement("demoAreaName");
        if (demoAreaEl && this.value) {
            demoAreaEl.textContent = this.value;
        }
    });

    upazilaSelect.addEventListener("change", function() {
        const demoAreaEl = getElement("demoAreaName");
        if (demoAreaEl && this.value) {
            demoAreaEl.textContent = this.value;
        }
    });
}
document.addEventListener("change", function(e) {
    if (e.target && (e.target.id === "district" || e.target.id === "upazila")) {
        const demoAreaEl = document.getElementById("demoAreaName");
        if (demoAreaEl && e.target.value) {
            demoAreaEl.textContent = e.target.value;
        }
    }
});

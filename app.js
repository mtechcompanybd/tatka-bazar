/* =========================================
   TATKA BAZAR - CUSTOMER APP
   Public Demo Version
========================================= */

// পণ্যের তালিকা
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

// কার্ট
const cart = {};


// =========================================
// সাধারণ ফাংশন
// =========================================

function money(number) {
    return "৳" + number.toLocaleString("bn-BD");
}

function getElement(id) {
    return document.getElementById(id);
}


// =========================================
// গ্রাহক অ্যাপের প্যানেল
// =========================================

const registerPanel = getElement("registerPanel");
const shopPanel = getElement("shopPanel");
const checkoutPanel = getElement("checkoutPanel");

function showCustomerPanel(panel) {
    registerPanel.hidden = true;
    shopPanel.hidden = true;
    checkoutPanel.hidden = true;

    if (panel) {
        panel.hidden = false;
        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

getElement("showRegister").onclick = function () {
    showCustomerPanel(registerPanel);
};

getElement("showShop").onclick = function () {
    showCustomerPanel(shopPanel);
};

getElement("showGuest").onclick = function () {
    showCustomerPanel(checkoutPanel);
};


// =========================================
// নিবন্ধন ব্যবস্থা - OTP এখনো চালু নয়
// =========================================

getElement("registerButton").onclick = function () {

    const name = getElement("regName").value.trim();
    const phone = getElement("regPhone").value.trim();
    const message = getElement("registerMessage");

    if (!name || !phone) {
        message.textContent =
            "অনুগ্রহ করে পূর্ণ নাম ও মোবাইল নম্বর লিখুন।";
        return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");

    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(cleanPhone)) {
        message.textContent =
            "সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন।";
        return;
    }

    message.textContent =
        "নিবন্ধন ব্যবস্থা প্রস্তুত হচ্ছে। বাস্তব OTP সেবা এখনো সংযুক্ত হয়নি; তাই অ্যাকাউন্ট তৈরি বা নম্বর যাচাই করা হয়নি।";
};


// =========================================
// পণ্য দেখানো ও অনুসন্ধান
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
            (category === "all" ||
                item.category === category) &&
            item.name.toLowerCase().includes(query)
        );

    getElement("products").innerHTML = filtered.map(item => `
        <article class="product">
            <div>${item.emoji}</div>

            <h3>${item.name}</h3>

            <small>
                ${item.category} · প্রতি ${item.unit}
            </small>

            <div class="foot">
                <b>${money(item.price)}</b>

                <button type="button" data-add="${item.id}">
                    + যোগ
                </button>
            </div>
        </article>
    `).join("");

    document.querySelectorAll("[data-add]").forEach(button => {

        button.onclick = function () {

            const id = Number(this.dataset.add);

            cart[id] = (cart[id] || 0) + 1;

            drawCart();
        };
    });
}


// =========================================
// কার্ট দেখানো
// =========================================

function drawCart() {

    let productTotal = 0;
    let html = "";

    Object.entries(cart).forEach(([id, quantity]) => {

        const item = items[Number(id)];
        const subtotal = item[2] * quantity;

        productTotal += subtotal;

        html += `
            <p>
                ${item[0]} × ${quantity}
                — ${money(subtotal)}
            </p>
        `;
    });

    getElement("cart").innerHTML =
        html || "পণ্য যোগ করলে এখানে দেখা যাবে।";

    const serviceCharge = Math.round(productTotal * 0.05);

    const grandTotal = productTotal + serviceCharge;

    getElement("total").textContent = money(grandTotal);
}


// =========================================
// কার্ট থেকে অর্ডার
// =========================================

getElement("checkoutFromCart").onclick = function () {

    if (Object.keys(cart).length === 0) {
        alert("প্রথমে বাজারের তালিকায় পণ্য যোগ করুন।");
        return;
    }

    showCustomerPanel(checkoutPanel);
};


// =========================================
// ঠিকানা নির্বাচন ব্যবস্থা
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


// বিভাগ নির্বাচন

divisionSelect.addEventListener("change", function () {

    const districts =
        typeof locationData !== "undefined"
            ? Object.keys(locationData)
            : [];

    fillLocationSelect(
        districtSelect,
        this.value === "খুলনা" ? districts : [],
        "জেলা নির্বাচন করুন"
    );

    fillLocationSelect(
        upazilaSelect,
        [],
        "আগে জেলা নির্বাচন করুন"
    );

    fillLocationSelect(
        areaNameSelect,
        [],
        "আগে উপজেলা নির্বাচন করুন"
    );

    manualAreaInput.hidden = true;
});


// জেলা নির্বাচন

districtSelect.addEventListener("change", function () {

    const upazilas =
        typeof locationData !== "undefined"
            ? locationData[this.value] || []
            : [];

    fillLocationSelect(
        upazilaSelect,
        upazilas,
        "উপজেলা নির্বাচন করুন"
    );

    fillLocationSelect(
        areaNameSelect,
        [],
        "আগে উপজেলা নির্বাচন করুন"
    );

    manualAreaInput.hidden = true;
});


// এলাকা তালিকা আপডেট

function updateAreaList() {

    const upazila = upazilaSelect.value;
    const areaType = areaTypeSelect.value;

    const areas =
        typeof areaData !== "undefined" &&
        areaData[upazila]
            ? areaData[upazila][areaType] || []
            : [];

    fillLocationSelect(
        areaNameSelect,
        areas,
        areas.length
            ? "এলাকা নির্বাচন করুন"
            : "তালিকা পাওয়া যায়নি"
    );

    // তালিকায় তথ্য না থাকলে নিজে লেখার সুযোগ
    manualAreaInput.hidden = areas.length > 0;

    if (areas.length === 0) {
        manualAreaInput.value = "";
    }
}

upazilaSelect.addEventListener("change", updateAreaList);

areaTypeSelect.addEventListener("change", updateAreaList);


// =========================================
// ডেমো অর্ডার তৈরি
// =========================================

getElement("placeDemoOrder").onclick = function () {

    const name = getElement("orderName").value.trim();
    const phone = getElement("orderPhone").value.trim();

    const division = divisionSelect.value;
    const district = districtSelect.value;
    const upazila = upazilaSelect.value;
    const areaType = areaTypeSelect.value;

    const selectedArea = areaNameSelect.value;
    const manualArea = manualAreaInput.value.trim();

    const areaName = selectedArea || manualArea;

    const ward = getElement("ward").value.trim();

    const details =
        getElement("addressDetails").value.trim();

    const message = getElement("orderMessage");

    // নাম যাচাই
    if (!name) {
        message.textContent = "গ্রাহকের পূর্ণ নাম লিখুন।";
        return;
    }

    // মোবাইল যাচাই
    const cleanPhone = phone.replace(/[\s-]/g, "");

    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(cleanPhone)) {
        message.textContent =
            "সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।";
        return;
    }

    if (!division || !district) {
        message.textContent =
            "বিভাগ ও জেলা নির্বাচন করুন।";
        return;
    }

    if (!areaType) {
        message.textContent =
            "এলাকার ধরন নির্বাচন করুন।";
        return;
    }

    // সিটি কর্পোরেশন ছাড়া উপজেলা প্রয়োজন
    if (areaType !== "সিটি কর্পোরেশন" && !upazila) {
        message.textContent =
            "উপজেলা / থানা নির্বাচন করুন।";
        return;
    }

    if (!areaName) {
        message.textContent =
            "ইউনিয়ন / পৌরসভা / এলাকার নাম লিখুন বা নির্বাচন করুন।";
        return;
    }

    if (!details) {
        message.textContent =
            "বিস্তারিত ডেলিভারি ঠিকানা লিখুন।";
        return;
    }

    if (Object.keys(cart).length === 0) {
        message.textContent =
            "অর্ডার করার আগে অন্তত একটি পণ্য যোগ করুন।";
        return;
    }

    // মোট হিসাব
    let productTotal = 0;

    Object.entries(cart).forEach(([id, quantity]) => {
        productTotal += items[Number(id)][2] * quantity;
    });

    const serviceCharge = Math.round(productTotal * 0.05);
    const grandTotal = productTotal + serviceCharge;

    const orderNumber =
        "DEMO-" + Date.now().toString().slice(-7);

    // অর্ডারের সারাংশ
    const orderSummary = Object.entries(cart)
        .map(([id, quantity]) => {
            const item = items[Number(id)];
            return `${item[0]} × ${quantity}`;
        })
        .join(", ");

    message.innerHTML = `
        <strong>ডেমো অর্ডার তৈরি হয়েছে!</strong><br>
        অর্ডার নম্বর: ${orderNumber}<br>
        গ্রাহক: ${name}<br>
        মোবাইল: ${cleanPhone}<br>
        পণ্য: ${orderSummary}<br>
        পণ্যের মূল্য: ${money(productTotal)}<br>
        সার্ভিস চার্জ (৫%): ${money(serviceCharge)}<br>
        মোট: ${money(grandTotal)}<br><br>
        <strong>
            এটি শুধু আপনার স্ক্রিনে তৈরি নমুনা।
            অর্ডার সার্ভারে পাঠানো হয়নি বা সংরক্ষণ করা হয়নি।
        </strong>
    `;

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
};


// =========================================
// প্রধান নেভিগেশন
// =========================================

document.querySelectorAll("nav button").forEach(button => {

    button.addEventListener("click", function () {

        document.querySelectorAll("nav button").forEach(item => {
            item.classList.toggle("active", item === button);
        });

        document.querySelectorAll(".screen").forEach(screen => {
            screen.classList.toggle(
                "show",
                screen.id === button.dataset.tab
            );
        });

        // গ্রাহক অ্যাপে ফিরলে সব প্যানেল বন্ধ থাকবে
        if (button.dataset.tab === "customer") {
            showCustomerPanel(null);
        }
    });
});


// =========================================
// অনুসন্ধান ও ক্যাটাগরি
// =========================================

getElement("q").addEventListener("input", drawProducts);
getElement("cat").addEventListener("change", drawProducts);


// =========================================
// প্রথমবার চালু
// =========================================

drawProducts();
drawCart();
showCustomerPanel(null);

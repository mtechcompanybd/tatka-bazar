
/* =========================================
   TATKA BAZAR - CUSTOMER APP
   Updated Public Demo Version
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

function getCartSubtotal() {
    return Object.entries(cart).reduce((total, [id, quantity]) => {
        return total + items[Number(id)][2] * quantity;
    }, 0);
}


// =========================================
// ৩. ওজন অনুযায়ী ডেলিভারি চার্জ
// =========================================

function getDeliveryCharge(weight) {

    if (weight <= 5) return 25;
    if (weight <= 10) return 50;
    if (weight <= 15) return 75;
    if (weight <= 20) return 100;
    if (weight <= 30) return 125;
    if (weight <= 40) return 150;

    return null;
}


// =========================================
// ৪. অর্ডার সংরক্ষণের ডেমো ব্যবস্থা
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
// ৫. গ্রাহক অ্যাপের প্যানেল
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
        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}

getElement("showRegister").onclick = () => {
    showCustomerPanel(registerPanel);
};

getElement("showShop").onclick = () => {
    showCustomerPanel(shopPanel);
};

getElement("showGuest").onclick = () => {
    showCustomerPanel(checkoutPanel);
};


// =========================================
// ৬. নিবন্ধন ব্যবস্থা
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

    message.textContent =
        "ডেমো নিবন্ধন: বাস্তব OTP ও অ্যাকাউন্ট ব্যবস্থা এখনো চালু হয়নি।";
};


// =========================================
// ৭. পণ্য দেখানো
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
            <small>${escapeHTML(item.category)} · প্রতি ${escapeHTML(item.unit)}</small>
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
// ৮. কার্ট ও প্রাথমিক হিসাব
// =========================================

function drawCart() {

    let html = "";

    Object.entries(cart).forEach(([id, quantity]) => {

        const item = items[Number(id)];
        const subtotal = item[2] * quantity;

        html += `
            <p>
                ${escapeHTML(item[0])}
                × ${quantity} ${escapeHTML(item[3])}
                — ${money(subtotal)}
                <button type="button" data-remove="${id}">
                    বাদ দিন
                </button>
            </p>
        `;
    });

    getElement("cart").innerHTML =
        html || "পণ্য যোগ করলে এখানে দেখা যাবে।";

    const subtotal = getCartSubtotal();

    const estimatedTotal = subtotal + SERVICE_CHARGE;

    getElement("total").textContent = money(estimatedTotal);

    document.querySelectorAll("[data-remove]").forEach(button => {
        button.onclick = function () {
            delete cart[Number(this.dataset.remove)];
            drawCart();
        };
    });
}


// =========================================
// ৯. কার্ট থেকে অর্ডার
// =========================================

getElement("checkoutFromCart").onclick = function () {

    if (Object.keys(cart).length === 0) {
        alert("প্রথমে বাজারের তালিকায় পণ্য যোগ করুন।");
        return;
    }

    showCustomerPanel(checkoutPanel);
};


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

    const districts =
        typeof locationData !== "undefined"
            ? Object.keys(locationData)
            : [];

    fillLocationSelect(
        districtSelect,
        this.value === "খুলনা" ? districts : [],
        "জেলা নির্বাচন করুন"
    );

    fillLocationSelect(upazilaSelect, [], "আগে জেলা নির্বাচন করুন");
    fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");

    manualAreaInput.hidden = true;
});

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

    fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");

    manualAreaInput.hidden = true;
});

function updateAreaList() {

    const upazila = upazilaSelect.value;
    const areaType = areaTypeSelect.value;

    const areas =
        typeof areaData !== "undefined" && areaData[upazila]
            ? areaData[upazila][areaType] || []
            : [];

    fillLocationSelect(
        areaNameSelect,
        areas,
        areas.length ? "এলাকা নির্বাচন করুন" : "তালিকা পাওয়া যায়নি"
    );

    manualAreaInput.hidden = areas.length > 0;

    if (areas.length === 0) {
        manualAreaInput.value = "";
    }
}

upazilaSelect.addEventListener("change", updateAreaList);
areaTypeSelect.addEventListener("change", updateAreaList);


// =========================================
// ১১. প্রাথমিক অর্ডার তৈরি
// =========================================

getElement("placeDemoOrder").onclick = function () {

    const name = getElement("orderName").value.trim();
    const phone = getElement("orderPhone").value.trim();

    const division = divisionSelect.value;
    const district = districtSelect.value;
    const upazila = upazilaSelect.value;
    const areaType = areaTypeSelect.value;

    const areaName =
        areaNameSelect.value || manualAreaInput.value.trim();

    const ward = getElement("ward").value.trim();
    const details = getElement("addressDetails").value.trim();

    const message = getElement("orderMessage");

    if (!name) {
        message.textContent = "গ্রাহকের পূর্ণ নাম লিখুন।";
        return;
    }

    if (!validPhone(phone)) {
        message.textContent = "সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন।";
        return;
    }

    if (!division || !district) {
        message.textContent = "বিভাগ ও জেলা নির্বাচন করুন।";
        return;
    }

    if (!areaType) {
        message.textContent = "এলাকার ধরন নির্বাচন করুন।";
        return;
    }

    if (areaType !== "সিটি কর্পোরেশন" && !upazila) {
        message.textContent = "উপজেলা / থানা নির্বাচন করুন।";
        return;
    }

    if (!areaName) {
        message.textContent = "এলাকার নাম নির্বাচন বা লিখুন।";
        return;
    }

    if (!details) {
        message.textContent = "বিস্তারিত ডেলিভারি ঠিকানা লিখুন।";
        return;
    }

    if (Object.keys(cart).length === 0) {
        message.textContent = "অন্তত একটি পণ্য যোগ করুন।";
        return;
    }

    const subtotal = getCartSubtotal();
    const estimatedTotal = subtotal + SERVICE_CHARGE;

    const orderNumber = makeOrderNumber();

    const orderItems = Object.entries(cart).map(([id, quantity]) => ({
        productId: Number(id),
        name: items[Number(id)][0],
        requestedQuantity: quantity,
        unit: items[Number(id)][3],
        requestedPrice: items[Number(id)][2],
        actualWeight: null,
        actualPrice: null
    }));

    const order = {
        orderNumber,
        name,
        phone: phone.replace(/[\s-]/g, ""),
        address: {
            division,
            district,
            upazila,
            areaType,
            areaName,
            ward,
            details
        },
        items: orderItems,
        subtotal,
        serviceCharge: SERVICE_CHARGE,
        deliveryCharge: null,
        finalTotal: null,
        status: "প্রাথমিক অর্ডার",
        representative: null,
        createdAt: new Date().toISOString()
    };

    const orders = getSavedOrders();
    orders.push(order);
    saveOrders(orders);

    message.innerHTML = `
        <strong>প্রাথমিক অর্ডার তৈরি হয়েছে!</strong><br>
        অর্ডার নম্বর: ${escapeHTML(orderNumber)}<br>
        গ্রাহক: ${escapeHTML(name)}<br>
        মোবাইল: ${escapeHTML(order.phone)}<br>
        পণ্যের আনুমানিক মূল্য: ${money(subtotal)}<br>
        সার্ভিস চার্জ: ${money(SERVICE_CHARGE)}<br>
        আনুমানিক মোট: ${money(estimatedTotal)}<br><br>
        <strong>অর্ডারের অবস্থা: প্রাথমিক অর্ডার</strong><br>
        বাজার প্রতিনিধি প্রকৃত ওজন ও কেনা দাম দেওয়ার পর চূড়ান্ত বিল তৈরি হবে। আপনার অনুমোদনের আগে চূড়ান্ত পেমেন্ট নেওয়া হবে না।<br><br>
        <small>এটি ব্রাউজারে সংরক্ষিত ডেমো অর্ডার। সার্ভারে পাঠানো হয়নি।</small>
    `;

    Object.keys(cart).forEach(id => delete cart[id]);
    drawCart();

    message.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
};


// =========================================
// ১২. গ্রাহকের অভিযোগ ফর্ম
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
            <option>ডেলিভারিতে বিলম্ব</option>
            <option>বাজার প্রতিনিধির আচরণ</option>
            <option>ডেলিভারি কর্মীর আচরণ</option>
            <option>বিল বা টাকা সংক্রান্ত সমস্যা</option>
            <option>অন্যান্য</option>
        </select>

        <label>বিস্তারিত অভিযোগ</label>
        <textarea id="complaintDetails" rows="4"
            placeholder="আপনার অভিযোগ লিখুন"></textarea>

        <button type="button" id="submitComplaint">
            অভিযোগ জমা দিন
        </button>

        <p id="complaintMessage"></p>
    `;

    customerScreen.appendChild(section);

    getElement("submitComplaint").onclick = function () {

        const name = getElement("complaintName").value.trim();
        const phone = getElement("complaintPhone").value.trim();
        const orderNumber = getElement("complaintOrder").value.trim();
        const category = getElement("complaintCategory").value;
        const details = getElement("complaintDetails").value.trim();
        const message = getElement("complaintMessage");

        if (!name || !validPhone(phone) || !category || !details) {
            message.textContent = "নাম, সঠিক মোবাইল, অভিযোগের ধরন ও বিবরণ পূরণ করুন।";
            return;
        }

        const complaintNumber =
            "CMP-" + Date.now().toString().slice(-7);

        const complaints = getSavedComplaints();

        complaints.push({
            complaintNumber,
            name,
            phone,
            orderNumber,
            category,
            details,
            status: "নতুন অভিযোগ",
            resolution: "",
            createdAt: new Date().toISOString()
        });

        saveComplaints(complaints);

        message.textContent =
            "অভিযোগ জমা হয়েছে। অভিযোগ নম্বর: " + complaintNumber;
    };
}


// =========================================
// ১৩. অ্যাডমিন: অভিযোগ ব্যবস্থাপনা
// =========================================

function addAdminComplaintManagement() {

    const adminScreen = getElement("admin");

    if (!adminScreen || getElement("adminComplaintSection")) return;

    const section = document.createElement("section");

    section.id = "adminComplaintSection";
    section.className = "panel";

    section.innerHTML = `
        <h2>অভিযোগ ব্যবস্থাপনা</h2>
        <button type="button" id="refreshComplaints">
            অভিযোগের তালিকা দেখুন
        </button>
        <div id="adminComplaintList"></div>
    `;

    adminScreen.appendChild(section);

    function drawComplaints() {

        const complaints = getSavedComplaints();
        const container = getElement("adminComplaintList");

        if (!complaints.length) {
            container.innerHTML = "<p>এখনো কোনো অভিযোগ নেই।</p>";
            return;
        }

        container.innerHTML = complaints.map((complaint, index) => `
            <article class="panel">
                <h3>${escapeHTML(complaint.complaintNumber)}</h3>
                <p>নাম: ${escapeHTML(complaint.name)}</p>
                <p>মোবাইল: ${escapeHTML(complaint.phone)}</p>
                <p>অর্ডার: ${escapeHTML(complaint.orderNumber || "উল্লেখ নেই")}</p>
                <p>ধরন: ${escapeHTML(complaint.category)}</p>
                <p>বিবরণ: ${escapeHTML(complaint.details)}</p>

                <label>অভিযোগের অবস্থা</label>
                <select data-complaint-status="${index}">
                    ${[
                        "নতুন অভিযোগ",
                        "পর্যালোচনাধীন",
                        "তদন্তাধীন",
                        "সমাধান হয়েছে",
                        "বাতিল"
                    ].map(status => `
                        <option ${complaint.status === status ? "selected" : ""}>
                            ${status}
                        </option>
                    `).join("")}
                </select>

                <label>সমাধানের বিবরণ</label>
                <textarea data-complaint-resolution="${index}"
                    rows="2">${escapeHTML(complaint.resolution)}</textarea>

                <button type="button" data-save-complaint="${index}">
                    আপডেট সংরক্ষণ
                </button>
            </article>
        `).join("");

        document.querySelectorAll("[data-save-complaint]").forEach(button => {

            button.onclick = function () {

                const index = Number(this.dataset.saveComplaint);
                const all = getSavedComplaints();

                all[index].status =
                    document.querySelector(`[data-complaint-status="${index}"]`).value;

                all[index].resolution =
                    document.querySelector(`[data-complaint-resolution="${index}"]`).value.trim();

                saveComplaints(all);
                drawComplaints();

                alert("অভিযোগের তথ্য আপডেট হয়েছে।");
            };
        });
    }

    getElement("refreshComplaints").onclick = drawComplaints;

    drawComplaints();
}


// =========================================
// ১৪. অ্যাডমিন: বাজার প্রতিনিধি ব্যবস্থাপনা
// =========================================

function addRepresentativeManagement() {

    const adminScreen = getElement("admin");

    if (!adminScreen || getElement("representativeManagement")) return;

    const section = document.createElement("section");

    section.id = "representativeManagement";
    section.className = "panel";

    section.innerHTML = `
        <h2>বাজার প্রতিনিধি ব্যবস্থাপনা</h2>
        <p>প্রতিনিধির তথ্য ও দায়িত্বপ্রাপ্ত এলাকা ব্যবস্থাপনার ডেমো অংশ।</p>

        <label>প্রতিনিধির পূর্ণ নাম</label>
        <input id="repName" type="text" placeholder="নাম">

        <label>মোবাইল নম্বর</label>
        <input id="repPhone" type="tel" placeholder="01XXXXXXXXX">

        <label>দায়িত্বপ্রাপ্ত এলাকা / ওয়ার্ড</label>
        <input id="repArea" type="text" placeholder="যেমন: ১ নং ওয়ার্ড">

        <button type="button" id="addRepresentative">
            প্রতিনিধি যোগ করুন
        </button>

        <div id="representativeList"></div>
    `;

    adminScreen.appendChild(section);

    function getRepresentatives() {
        try {
            return JSON.parse(localStorage.getItem("tatkaRepresentatives")) || [];
        } catch {
            return [];
        }
    }

    function drawRepresentatives() {

        const list = getRepresentatives();

        getElement("representativeList").innerHTML =
            list.length
                ? list.map((rep, index) => `
                    <article class="panel">
                        <strong>${escapeHTML(rep.id)} — ${escapeHTML(rep.name)}</strong>
                        <p>মোবাইল: ${escapeHTML(rep.phone)}</p>
                        <p>এলাকা: ${escapeHTML(rep.area)}</p>
                        <p>অবস্থা: ${escapeHTML(rep.status)}</p>
                        <button type="button" data-toggle-rep="${index}">
                            সক্রিয় / নিষ্ক্রিয় পরিবর্তন
                        </button>
                    </article>
                `).join("")
                : "<p>এখনো কোনো প্রতিনিধি যোগ করা হয়নি।</p>";

        document.querySelectorAll("[data-toggle-rep]").forEach(button => {

            button.onclick = function () {

                const index = Number(this.dataset.toggleRep);
                const reps = getRepresentatives();

                reps[index].status =
                    reps[index].status === "সক্রিয়" ? "নিষ্ক্রিয়" : "সক্রিয়";

                localStorage.setItem("tatkaRepresentatives", JSON.stringify(reps));
                drawRepresentatives();
            };
        });
    }

    getElement("addRepresentative").onclick = function () {

        const name = getElement("repName").value.trim();
        const phone = getElement("repPhone").value.trim();
        const area = getElement("repArea").value.trim();

        if (!name || !validPhone(phone) || !area) {
            alert("নাম, সঠিক মোবাইল নম্বর ও দায়িত্বপ্রাপ্ত এলাকা লিখুন।");
            return;
        }

        const reps = getRepresentatives();

        reps.push({
            id: "REP-" + Date.now().toString().slice(-6),
            name,
            phone,
            area,
            status: "সক্রিয়"
        });

        localStorage.setItem("tatkaRepresentatives", JSON.stringify(reps));

        getElement("repName").value = "";
        getElement("repPhone").value = "";
        getElement("repArea").value = "";

        drawRepresentatives();
    };

    drawRepresentatives();
}


// =========================================
// ১৫. নেভিগেশন
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

        if (button.dataset.tab === "customer") {
            showCustomerPanel(null);
        }
    });
});


// =========================================
// ১৬. অনুসন্ধান ও ক্যাটাগরি
// =========================================

getElement("q").addEventListener("input", drawProducts);
getElement("cat").addEventListener("change", drawProducts);


// =========================================
// ১৭. প্রথমবার চালু
// =========================================

drawProducts();
drawCart();
showCustomerPanel(null);

addComplaintSection();
addAdminComplaintManagement();
addRepresentativeManagement();

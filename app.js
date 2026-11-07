const items = [
["মিনিকেট চাল","নিত্যপ্রয়োজনীয়",72,"কেজি","🍚"],
["মসুর ডাল","নিত্যপ্রয়োজনীয়",125,"কেজি","🫘"],
["সয়াবিন তেল","নিত্যপ্রয়োজনীয়",170,"লিটার","🫗"],
["আলু","শাকসবজি",35,"কেজি","🥔"],
["টমেটো","শাকসবজি",60,"কেজি","🍅"],
["বেগুন","শাকসবজি",55,"কেজি","🍆"],
["পালং শাক","শাকসবজি",25,"আঁটি","🥬"],
["রুই মাছ","মাছ",320,"কেজি","🐟"],
["তেলাপিয়া","মাছ",190,"কেজি","🐠"],
["হলুদ গুঁড়া","মসলা",260,"কেজি","🟡"],
["মরিচ গুঁড়া","মসলা",340,"কেজি","🌶️"],
["জিরা","মসলা",680,"কেজি","🧂"]
];

const cart = {};

function money(n) {
  return "৳" + n.toLocaleString("bn-BD");
}

function drawProducts() {
  const q = document.querySelector("#q").value.toLowerCase();
  const cat = document.querySelector("#cat").value;

  const filtered = items
    .map((x,i) => ({
      id:i, name:x[0], cat:x[1],
      price:x[2], unit:x[3], emoji:x[4]
    }))
    .filter(x =>
      (cat === "all" || x.cat === cat) &&
      x.name.toLowerCase().includes(q)
    );

  document.querySelector("#products").innerHTML =
    filtered.map(x => `
      <article class="product">
        <div>${x.emoji}</div>
        <h3>${x.name}</h3>
        <small>${x.cat} · প্রতি ${x.unit}</small>
        <div class="foot">
          <b>${money(x.price)}</b>
          <button data-add="${x.id}">+ যোগ</button>
        </div>
      </article>
    `).join("");

  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.add;
      cart[id] = (cart[id] || 0) + 1;
      drawCart();
    };
  });
}

function drawCart() {
  let total = 0;
  let html = "";

  Object.entries(cart).forEach(([id, qty]) => {
    const item = items[id];
    total += item[2] * qty;
    html += `<p>${item[0]} × ${qty} — ${money(item[2] * qty)}</p>`;
  });

  document.querySelector("#cart").innerHTML =
    html || "পণ্য যোগ করলে এখানে দেখা যাবে।";

  const serviceCharge = Math.round(total * 0.05);

  document.querySelector("#total").textContent =
    money(total + serviceCharge);
}

document.querySelectorAll("nav button").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll("nav button").forEach(x =>
      x.classList.toggle("active", x === btn)
    );

    document.querySelectorAll(".screen").forEach(x =>
      x.classList.toggle("show", x.id === btn.dataset.tab)
    );
  };
});

document.querySelector("#q").oninput = drawProducts;
document.querySelector("#cat").onchange = drawProducts;

document.querySelector("#order").onclick = () => {
  document.querySelector("#msg").textContent =
    Object.keys(cart).length
      ? "নমুনা অর্ডার তৈরি হয়েছে—বাস্তবে পাঠানো হয়নি।"
      : "আগে পণ্য যোগ করুন।";
};

drawProducts();
drawCart();

// ===================================
// ডেলিভারি ঠিকানা নির্বাচন ব্যবস্থা
// ===================================

const divisionSelect = document.querySelector("#division");
const districtSelect = document.querySelector("#district");
const upazilaSelect = document.querySelector("#upazila");
const areaTypeSelect = document.querySelector("#areaType");
const areaNameSelect = document.querySelector("#areaName");
const wardSelect = document.querySelector("#ward");

// ড্রপডাউনে তালিকা বসানোর ফাংশন
function fillLocationSelect(select, items, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;

  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
  });

  select.disabled = items.length === 0;
}

// বিভাগ নির্বাচন
divisionSelect.addEventListener("change", function () {
  const districts = Object.keys(locationData);

  fillLocationSelect(
    districtSelect,
    this.value === "খুলনা" ? districts : [],
    "জেলা নির্বাচন করুন"
  );

  fillLocationSelect(upazilaSelect, [], "উপজেলা নির্বাচন করুন");
  fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");
  fillLocationSelect(wardSelect, [], "আগে এলাকা নির্বাচন করুন");
});

// জেলা নির্বাচন
districtSelect.addEventListener("change", function () {
  const upazilas = locationData[this.value] || [];

  fillLocationSelect(
    upazilaSelect,
    upazilas,
    "উপজেলা নির্বাচন করুন"
  );

  fillLocationSelect(areaNameSelect, [], "আগে উপজেলা নির্বাচন করুন");
  fillLocationSelect(wardSelect, [], "আগে এলাকা নির্বাচন করুন");
});

// ইউনিয়ন / পৌরসভা তালিকা দেখানো
function updateAreaList() {
  const upazila = upazilaSelect.value;
  const areaType = areaTypeSelect.value;

  const areas = areaData[upazila]?.[areaType] || [];

  fillLocationSelect(
    areaNameSelect,
    areas,
    areas.length ? "এলাকা নির্বাচন করুন" : "তালিকা এখনো যোগ করা হয়নি"
  );

  fillLocationSelect(wardSelect, [], "আগে এলাকা নির্বাচন করুন");
}

// উপজেলা নির্বাচন
upazilaSelect.addEventListener("change", updateAreaList);

// এলাকার ধরন নির্বাচন
areaTypeSelect.addEventListener("change", updateAreaList);

// এলাকা নির্বাচন করলে ওয়ার্ড দেখানো
areaNameSelect.addEventListener("change", function () {
  const wards = Array.from({ length: 9 }, (_, i) => String(i + 1));

  fillLocationSelect(
    wardSelect,
    this.value ? wards : [],
    "ওয়ার্ড নির্বাচন করুন"
  );
});

// ঠিকানা সংরক্ষণ
document.querySelector("#saveAddress").addEventListener("click", function () {
  const address = {
    division: divisionSelect.value,
    district: districtSelect.value,
    upazila: upazilaSelect.value,
    areaType: areaTypeSelect.value,
    areaName: areaNameSelect.value,
    ward: wardSelect.value,
    details: document.querySelector("#addressDetails").value.trim()
  };

  if (
    !address.division ||
    !address.district ||
    !address.upazila ||
    !address.areaType ||
    !address.areaName ||
    !address.ward
  ) {
    document.querySelector("#addressMessage").textContent =
      "অনুগ্রহ করে ঠিকানার সব প্রয়োজনীয় তথ্য নির্বাচন করুন।";
    return;
  }

  localStorage.setItem(
    "tatkaBazarAddress",
    JSON.stringify(address)
  );

  document.querySelector("#addressMessage").textContent =
    "আপনার ঠিকানা সফলভাবে সংরক্ষিত হয়েছে।";
});


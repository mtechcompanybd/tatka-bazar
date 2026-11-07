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

const STORE_NAME = "OffCourt";
const TAX_RATE   = 0.08;
const IS_OPEN    = true;
const SID        = Symbol("sid");
const BIG        = 9007199254740991n;
let   lastSearch = undefined;

console.log(typeof STORE_NAME, typeof TAX_RATE, typeof IS_OPEN, typeof null, typeof SID, typeof BIG);

const sneakers = [
  { id:1, name:"Air Velocity Pro",  brand:"SpeedX",     price:159.99, category:"running",    rating:4.7, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/e/9/e9a821bNike-IF4391-100_1.jpg?rnd=20200526195200&tr=w-1080" },
  { id:2, name:"Urban Classic",     brand:"StreetWear", price:89.99,  category:"casual",     rating:4.3, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/b/0/b0e4965Nike-IR5776-400_1.png?rnd=20200526195200&tr=w-1080" },
  { id:3, name:"Court Dominator",   brand:"HoopKing",   price:199.99, category:"basketball", rating:4.9, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/5/3/5324c8eNike-554724-069_1.jpg?rnd=20200526195200&tr=w-1080" },
  { id:4, name:"Breeze Runner",     brand:"SpeedX",     price:129.99, category:"running",    rating:4.5, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/5/3/5324c8eNike-IU2363-100_1.jpg?rnd=20200526195200&tr=w-1080" },
  { id:5, name:"Retro Vibe",        brand:"StreetWear", price:109.99, category:"casual",     rating:4.6, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/5/3/5324c8eNike-IB7746-200_1.jpg?rnd=20200526195200&tr=w-1080" },
  { id:6, name:"Shadow Elite",      brand:"HoopKing",   price:219.99, category:"basketball", rating:4.8, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/5/3/5324c8eNike-DN3577-700_1.jpg?rnd=20200526195200&tr=w-1080" },
  { id:7, name:"Trail Blazer X",    brand:"SpeedX",     price:174.99, category:"running",    rating:4.4, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/5/3/5324c8eNike-IM4692-200_1.jpg?rnd=20200526195200&tr=w-1080" },
  { id:8, name:"Daily Step",        brand:"StreetWear", price:69.99,  category:"casual",     rating:4.1, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/9/f/9fe448dNike-IB6606-600_1.jpg?rnd=20200526195200&tr=w-1080" },
  { id:9, name:"Slam Dunk Pro",     brand:"HoopKing",   price:189.99, category:"basketball", rating:4.7, img:"https://adn-static1.nykaa.com/nykdesignstudio-images/pub/media/catalog/product/f/f/ff7c9fbNike-DZ5485-003_1.jpg?rnd=20200526195200&tr=w-1080" },
];

let activeCat = "all", sortOpt = "price-asc", searchQ = "", cart = [], discount = 0;

function makeWishlist() {
  var items = [];
  return {
    add(s)     { if (!items.find(x => x.id === s.id)) items.push(s); },
    remove(id) { items = items.filter(s => s.id !== id); },
    has(id)    { return !!items.find(s => s.id === id); },
    getAll()   { return items.slice(); },
    count()    { return items.length; }
  };
}

function makePromo() {
  var codes = { "OFFCOURT10": 10, "SPEED20": 20, "HOOP15": 15 };
  var tries = 3;
  return function(code) {
    tries--;
    var pct = codes[code.trim().toUpperCase()];
    if (pct) return { ok: true, pct };
    var msg = tries > 0 ? "Wrong code. " + tries + " tries left." : "No more tries.";
    return { ok: false, msg, noTries: tries <= 0 };
  };
}

const wishlist  = makeWishlist();
const applyCode = makePromo();

function formatPrice(p, sym) {
  if (sym === undefined) sym = "$";
  return typeof p === "number" ? sym + p.toFixed(2) : sym + "0.00";
}

function loyaltyPrice(price, tiers) {
  if (tiers <= 0) return price;
  return loyaltyPrice(price * 0.98, tiers - 1);
}

function bulkAdd(...ids) {
  for (var id of ids) addToCart(id);
}

function doubled(p) { p = p * 2; return p; }
function markSeen(obj) { obj._seen = true; }
console.log("by value:", doubled(100), "original: 100");
markSeen(sneakers[0]);
console.log("by ref _seen:", sneakers[0]._seen);

for (var key in sneakers[0]) {
  if (key !== "img") console.log(key + ":", sneakers[0][key]);
}

const getCatClass = cat =>
  cat === "running" ? "cat-running" : cat === "basketball" ? "cat-basketball" : "cat-casual";

function renderStats() {
  var total    = sneakers.reduce((acc, s) => acc + s.price, 0);
  var priciest = sneakers.reduce((max, s) => s.price > max.price ? s : max);
  document.getElementById("stat-total").textContent = sneakers.length;
  document.getElementById("stat-avg").textContent   = formatPrice(total / sneakers.length);
  document.getElementById("stat-top").textContent   = priciest.name;
  console.table(sneakers.map(s => ({ Name: s.name, Price: formatPrice(s.price), Category: s.category })));
}

function renderProducts() {
  var list = activeCat === "all" ? sneakers.slice() : sneakers.filter(s => s.category === activeCat);
  if (searchQ) list = list.filter(s => s.name.toLowerCase().includes(searchQ) || s.brand.toLowerCase().includes(searchQ));
  list = list.sort((a, b) => {
    switch (sortOpt) {
      case "price-asc":  return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating":     return b.rating - a.rating;
      case "name":       return a.name.localeCompare(b.name);
      default:           return 0;
    }
  });

  var grid = document.getElementById("product-grid");
  if (list.length === 0) { grid.innerHTML = "<div class='empty-state'>No sneakers found.</div>"; return; }

  grid.innerHTML = list.map(s =>
    "<div class='sneaker-card'>" +
      "<img src='" + s.img + "' alt='" + s.name + "'>" +
      "<div class='card-body'>" +
        "<div class='card-brand'>" + s.brand + "</div>" +
        "<div class='card-name'>" + s.name + "</div>" +
        "<span class='card-cat " + getCatClass(s.category) + "'>" + s.category + "</span>" +
        "<div class='card-rating'>★ " + s.rating + "</div>" +
        "<div class='card-bottom'>" +
          "<span class='card-price'>" + formatPrice(s.price) + "</span>" +
          "<div class='card-actions'>" +
            "<button class='wish-btn " + (wishlist.has(s.id) ? "wished" : "") + "' onclick='toggleWish(" + s.id + ")'>" + (wishlist.has(s.id) ? "❤" : "♡") + "</button>" +
            "<button class='add-btn' onclick='addToCart(" + s.id + ")'>+ Cart</button>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>"
  ).join("");
}

function addToCart(id) {
  const s = sneakers.find(s => s.id === id);
  if (!s) return;
  const ex = cart.find(c => c.id === id);
  if (ex) {
    cart = cart.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
  } else {
    cart.push({ id: s.id, name: s.name, price: s.price, img: s.img, qty: 1 });
  }
  renderCart(); updateBadges(); showToast(s.name + " added!");
}

const removeFromCart = id => { cart = cart.filter(c => c.id !== id); renderCart(); updateBadges(); };
const updateQty      = (id, d) => { cart = cart.map(c => c.id === id ? { ...c, qty: c.qty + d } : c).filter(c => c.qty > 0); renderCart(); updateBadges(); };

function renderCart() {
  const body   = document.getElementById("cart-body");
  const footer = document.getElementById("cart-footer");
  if (cart.length === 0) { body.innerHTML = "<p class='empty-msg'>Cart is empty.</p>"; footer.style.display = "none"; discount = 0; return; }
  footer.style.display = "block";

 
  var html = "", i = 0;
  while (i < cart.length) {
    var c = cart[i];
    html += "<div class='cart-item'><img src='" + c.img + "'><div class='cart-item-info'><div class='cart-item-name'>" + c.name + "</div><div class='cart-item-price'>" + formatPrice(c.price) + " each</div><div class='qty-row'><button class='qty-btn' onclick='updateQty(" + c.id + ",-1)'>-</button><span class='qty-val'>" + c.qty + "</span><button class='qty-btn' onclick='updateQty(" + c.id + ",1)'>+</button><button class='remove-btn' onclick='removeFromCart(" + c.id + ")'>X</button></div></div></div>";
    i++;
  }
  body.innerHTML = html;

  const raw = cart.reduce((acc, c) => acc + c.price * c.qty, 0);
  if (discount > 0) {
    const saving = raw * (discount / 100);
    document.getElementById("discount-row").style.display  = "flex";
    document.getElementById("discount-label").textContent  = "-" + formatPrice(saving) + " (" + discount + "% off)";
    document.getElementById("cart-total").textContent      = formatPrice(raw - saving);
  } else {
    document.getElementById("discount-row").style.display = "none";
    document.getElementById("cart-total").textContent      = formatPrice(raw);
  }
}

function toggleWish(id) {
  const s = sneakers.find(x => x.id === id);
  if (!s) return;
  wishlist.has(id) ? (wishlist.remove(id), showToast("Removed from wishlist")) : (wishlist.add(s), showToast(s.name + " wishlisted!"));
  renderProducts(); renderWishlist(); updateBadges();
}

function renderWishlist() {
  const items = wishlist.getAll();
  document.getElementById("wish-body").innerHTML = items.length === 0
    ? "<p class='empty-msg'>Wishlist is empty.</p>"
    : items.map(s =>
        "<div class='wish-item'><img src='" + s.img + "'><div class='wish-item-info'><div class='wish-item-name'>" + s.name + "</div><div class='wish-item-price'>" + formatPrice(s.price) + "</div><div class='wish-actions'><button class='wish-add-btn' onclick='addToCart(" + s.id + ")'>+ Cart</button><button class='wish-remove-btn' onclick='toggleWish(" + s.id + ")'>Remove</button></div></div></div>"
      ).join("");
}

function handlePromo() {
  const code = document.getElementById("promo-input").value;
  const msg  = document.getElementById("promo-msg");
  if (typeof code !== "string" || code.trim() === "") { msg.textContent = "Enter a code."; msg.className = "promo-msg err"; return; }
  const r = applyCode(code);
  if (r.ok) {
    discount = r.pct; msg.textContent = "Applied! " + r.pct + "% off!"; msg.className = "promo-msg ok";
    document.getElementById("promo-input").disabled = document.getElementById("promo-btn").disabled = true;
    renderCart();
  } else {
    msg.textContent = r.msg; msg.className = "promo-msg err";
    if (r.noTries) document.getElementById("promo-input").disabled = document.getElementById("promo-btn").disabled = true;
  }
}

function handleCheckout() {
  if (!cart.length) { showToast("Cart is empty!"); return; }
  var raw = cart.reduce((a, c) => a + c.price * c.qty, 0);
  console.log("Loyalty price (recursive):", formatPrice(loyaltyPrice(cart[0].price, 3)));
  var summary = "ORDER\n\n";
  for (var i = 0; i < cart.length; i++) summary += cart[i].name + " x" + cart[i].qty + " — " + formatPrice(cart[i].price * cart[i].qty) + "\n";
  summary += discount > 0 ? "\nDiscount: -" + formatPrice(raw * discount / 100) + "\n" : "\n";
  summary += "Total: " + formatPrice(raw - (discount > 0 ? raw * discount / 100 : 0)) + "\n\nThanks!";
  alert(summary);
  cart = []; discount = 0; renderCart(); updateBadges(); closePanels(); showToast("Order placed!");
}

function updateBadges() {
  document.getElementById("cart-count").textContent = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById("wish-count").textContent = wishlist.count();
}

var toastTimer = null;
function showToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove("show"); }, 2500);
}

function openCart()     { document.getElementById("overlay").classList.add("open"); document.getElementById("cart-sidebar").classList.add("open"); document.getElementById("wish-sidebar").classList.remove("open"); }
function openWishlist() { document.getElementById("overlay").classList.add("open"); document.getElementById("wish-sidebar").classList.add("open"); document.getElementById("cart-sidebar").classList.remove("open"); renderWishlist(); }
function closePanels()  { ["overlay","cart-sidebar","wish-sidebar"].forEach(id => document.getElementById(id).classList.remove("open")); }

var filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach(btn => btn.addEventListener("click", () => {
  activeCat = btn.getAttribute("data-cat");
  filterBtns.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts();
}));

document.getElementById("sort-select").addEventListener("change",  e => { sortOpt = e.target.value; renderProducts(); });
document.getElementById("search-input").addEventListener("input",   e => { searchQ = e.target.value.toLowerCase(); lastSearch = searchQ; renderProducts(); });
document.getElementById("cart-btn").addEventListener("click",       openCart);
document.getElementById("wishlist-btn").addEventListener("click",   openWishlist);
document.getElementById("close-cart").addEventListener("click",     closePanels);
document.getElementById("close-wish").addEventListener("click",     closePanels);
document.getElementById("overlay").addEventListener("click",        closePanels);
document.getElementById("promo-btn").addEventListener("click",      handlePromo);
document.getElementById("promo-input").addEventListener("keydown",  e => { if (e.key === "Enter") handlePromo(); });
document.getElementById("checkout-btn").addEventListener("click",   handleCheckout);

renderStats(); renderProducts(); renderCart(); updateBadges();
console.log(`${STORE_NAME} loaded | promo codes: OFFCOURT10  SPEED20  HOOP15`);
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

let activeCategory = "all";
let sortOption = "price-asc";
let searchQuery = "";
let cart = [];
let discount = 0;

for (var key in sneakers[0]) {
  if (key !== "img") {
    console.log(key + ": " + sneakers[0][key]);
  }
}

function makeWishlist() {
  var items = [];
  return {
    add: function(sneaker) {
      var alreadyAdded = false;
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === sneaker.id) {
          alreadyAdded = true;
        }
      }
      if (!alreadyAdded) {
        items.push(sneaker);
      }
    },
    remove: function(id) {
      items = items.filter(function(s) {
        return s.id !== id;
      });
    },
    has: function(id) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].id === id) {
          return true;
        }
      }
      return false;
    },
    getAll: function() {
      return items.slice();
    },
    count: function() {
      return items.length;
    }
  };
}

function makePromo() {
  var codes = { "OFFCOURT10": 10, "SPEED20": 20, "HOOP15": 15 };
  var tries = 3;
  return function(code) {
    tries = tries - 1;
    var upper = code.trim().toUpperCase();
    if (codes[upper] !== undefined) {
      return { ok: true, pct: codes[upper] };
    }
    if (tries > 0) {
      return { ok: false, msg: "Wrong code. " + tries + " tries left.", noTries: false };
    } else {
      return { ok: false, msg: "No more tries.", noTries: true };
    }
  };
}

var wishlist = makeWishlist();
var applyCode = makePromo();

function formatPrice(price, symbol) {
  if (symbol === undefined) {
    symbol = "$";
  }
  if (typeof price !== "number") {
    return symbol + "0.00";
  }
  return symbol + price.toFixed(2);
}

function loyaltyPrice(price, tiers) {
  if (tiers <= 0) {
    return price;
  }
  return loyaltyPrice(price * 0.98, tiers - 1);
}

function bulkAdd(id1, id2, id3) {
  var ids = [id1, id2, id3];
  for (var i = 0; i < ids.length; i++) {
    if (ids[i] !== undefined) {
      addToCart(ids[i]);
    }
  }
}

function getCategoryClass(category) {
  if (category === "running") {
    return "cat-running";
  } else if (category === "basketball") {
    return "cat-basketball";
  } else {
    return "cat-casual";
  }
}

function renderStats() {
  var total = sneakers.reduce(function(acc, s) {
    return acc + s.price;
  }, 0);

  var priciest = sneakers.reduce(function(max, s) {
    if (s.price > max.price) {
      return s;
    }
    return max;
  });

  document.getElementById("stat-total").textContent = sneakers.length;
  document.getElementById("stat-avg").textContent = formatPrice(total / sneakers.length);
  document.getElementById("stat-top").textContent = priciest.name;

  console.table(sneakers.map(function(s) {
    return { Name: s.name, Price: formatPrice(s.price), Category: s.category };
  }));
}

function renderProducts() {
  var list = [];

  if (activeCategory === "all") {
    list = sneakers.slice();
  } else {
    list = sneakers.filter(function(s) {
      return s.category === activeCategory;
    });
  }

  if (searchQuery !== "") {
    list = list.filter(function(s) {
      var nameMatch = s.name.toLowerCase().includes(searchQuery);
      var brandMatch = s.brand.toLowerCase().includes(searchQuery);
      return nameMatch || brandMatch;
    });
  }

  list = list.sort(function(a, b) {
    switch (sortOption) {
      case "price-asc":  return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "rating":     return b.rating - a.rating;
      case "name":       return a.name.localeCompare(b.name);
      default:           return 0;
    }
  });

  var grid = document.getElementById("product-grid");

  if (list.length === 0) {
    grid.innerHTML = "<div class='empty-state'>No sneakers found.</div>";
    return;
  }

  grid.innerHTML = list.map(function(s) {
    var heartIcon = wishlist.has(s.id) ? "❤" : "♡";
    var heartClass = wishlist.has(s.id) ? "wish-btn wished" : "wish-btn";
    return (
      "<div class='sneaker-card'>" +
        "<img src='" + s.img + "' alt='" + s.name + "'>" +
        "<div class='card-body'>" +
          "<div class='card-brand'>" + s.brand + "</div>" +
          "<div class='card-name'>" + s.name + "</div>" +
          "<span class='card-cat " + getCategoryClass(s.category) + "'>" + s.category + "</span>" +
          "<div class='card-rating'>* " + s.rating + "</div>" +
          "<div class='card-bottom'>" +
            "<span class='card-price'>" + formatPrice(s.price) + "</span>" +
            "<div class='card-actions'>" +
              "<button class='" + heartClass + "' onclick='toggleWish(" + s.id + ")'>" + heartIcon + "</button>" +
              "<button class='add-btn' onclick='addToCart(" + s.id + ")'>+ Cart</button>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }).join("");
}

function addToCart(id) {
  var sneaker = null;
  for (var i = 0; i < sneakers.length; i++) {
    if (sneakers[i].id === id) {
      sneaker = sneakers[i];
    }
  }
  if (sneaker === null) {
    return;
  }

  var existing = null;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      existing = cart[i];
    }
  }

  if (existing !== null) {
    existing.qty = existing.qty + 1;
  } else {
    cart.push({ id: sneaker.id, name: sneaker.name, price: sneaker.price, img: sneaker.img, qty: 1 });
  }

  renderCart();
  updateBadges();
  showToast(sneaker.name + " added to cart!");
}

function removeFromCart(id) {
  cart = cart.filter(function(item) {
    return item.id !== id;
  });
  renderCart();
  updateBadges();
}

function updateQty(id, change) {
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].id === id) {
      cart[i].qty = cart[i].qty + change;
    }
  }
  cart = cart.filter(function(item) {
    return item.qty > 0;
  });
  renderCart();
  updateBadges();
}

function renderCart() {
  var body = document.getElementById("cart-body");
  var footer = document.getElementById("cart-footer");

  if (cart.length === 0) {
    body.innerHTML = "<p class='empty-msg'>Cart is empty.</p>";
    footer.style.display = "none";
    discount = 0;
    return;
  }

  footer.style.display = "block";

  var html = "";
  var i = 0;
  while (i < cart.length) {
    var item = cart[i];
    html += "<div class='cart-item'>";
    html += "<img src='" + item.img + "' alt='" + item.name + "'>";
    html += "<div class='cart-item-info'>";
    html += "<div class='cart-item-name'>" + item.name + "</div>";
    html += "<div class='cart-item-price'>" + formatPrice(item.price) + " each</div>";
    html += "<div class='qty-row'>";
    html += "<button class='qty-btn' onclick='updateQty(" + item.id + ", -1)'>-</button>";
    html += "<span class='qty-val'>" + item.qty + "</span>";
    html += "<button class='qty-btn' onclick='updateQty(" + item.id + ", 1)'>+</button>";
    html += "<button class='remove-btn' onclick='removeFromCart(" + item.id + ")'>X</button>";
    html += "</div></div></div>";
    i = i + 1;
  }
  body.innerHTML = html;

  var raw = cart.reduce(function(total, item) {
    return total + item.price * item.qty;
  }, 0);

  if (discount > 0) {
    var saving = raw * (discount / 100);
    document.getElementById("discount-row").style.display = "flex";
    document.getElementById("discount-label").textContent = "-" + formatPrice(saving) + " (" + discount + "% off)";
    document.getElementById("cart-total").textContent = formatPrice(raw - saving);
  } else {
    document.getElementById("discount-row").style.display = "none";
    document.getElementById("cart-total").textContent = formatPrice(raw);
  }
}

function toggleWish(id) {
  var sneaker = null;
  for (var i = 0; i < sneakers.length; i++) {
    if (sneakers[i].id === id) {
      sneaker = sneakers[i];
    }
  }
  if (sneaker === null) {
    return;
  }
  if (wishlist.has(id)) {
    wishlist.remove(id);
    showToast("Removed from wishlist");
  } else {
    wishlist.add(sneaker);
    showToast(sneaker.name + " added to wishlist!");
  }
  renderProducts();
  renderWishlist();
  updateBadges();
}

function renderWishlist() {
  var items = wishlist.getAll();
  var body = document.getElementById("wish-body");

  if (items.length === 0) {
    body.innerHTML = "<p class='empty-msg'>Wishlist is empty.</p>";
    return;
  }

  body.innerHTML = items.map(function(s) {
    return (
      "<div class='wish-item'>" +
        "<img src='" + s.img + "' alt='" + s.name + "'>" +
        "<div class='wish-item-info'>" +
          "<div class='wish-item-name'>" + s.name + "</div>" +
          "<div class='wish-item-price'>" + formatPrice(s.price) + "</div>" +
          "<div class='wish-actions'>" +
            "<button class='wish-add-btn' onclick='addToCart(" + s.id + ")'>+ Cart</button>" +
            "<button class='wish-remove-btn' onclick='toggleWish(" + s.id + ")'>Remove</button>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }).join("");
}

function handlePromo() {
  var code = document.getElementById("promo-input").value;
  var msgEl = document.getElementById("promo-msg");

  if (code.trim() === "") {
    msgEl.textContent = "Enter a code first.";
    msgEl.className = "promo-msg err";
    return;
  }

  var result = applyCode(code);

  if (result.ok) {
    discount = result.pct;
    msgEl.textContent = "Applied! " + result.pct + "% off!";
    msgEl.className = "promo-msg ok";
    document.getElementById("promo-input").disabled = true;
    document.getElementById("promo-btn").disabled = true;
    renderCart();
  } else {
    msgEl.textContent = result.msg;
    msgEl.className = "promo-msg err";
    if (result.noTries) {
      document.getElementById("promo-input").disabled = true;
      document.getElementById("promo-btn").disabled = true;
    }
  }
}

function handleCheckout() {
  if (cart.length === 0) {
    showToast("Cart is empty!");
    return;
  }

  var raw = cart.reduce(function(total, item) {
    return total + item.price * item.qty;
  }, 0);

  var finalTotal = raw;
  if (discount > 0) {
    finalTotal = raw - raw * (discount / 100);
  }

  console.log("Loyalty price demo:", formatPrice(loyaltyPrice(cart[0].price, 3)));

  var summary = "ORDER SUMMARY\n\n";
  for (var i = 0; i < cart.length; i++) {
    summary += cart[i].name + " x" + cart[i].qty + " - " + formatPrice(cart[i].price * cart[i].qty) + "\n";
  }
  if (discount > 0) {
    summary += "\nDiscount: -" + formatPrice(raw * discount / 100) + "\n";
  }
  summary += "\nTotal: " + formatPrice(finalTotal);
  summary += "\n\nThank you for shopping at " + STORE_NAME + "!";

  alert(summary);
  cart = [];
  discount = 0;
  renderCart();
  updateBadges();
  closePanels();
  showToast("Order placed! Thank you!");
}

function updateBadges() {
  var cartTotal = cart.reduce(function(sum, item) {
    return sum + item.qty;
  }, 0);
  document.getElementById("cart-count").textContent = cartTotal;
  document.getElementById("wish-count").textContent = wishlist.count();
}

var toastTimer = null;
function showToast(message) {
  var el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  if (toastTimer !== null) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(function() {
    el.classList.remove("show");
    toastTimer = null;
  }, 2500);
}

function openCart() {
  document.getElementById("overlay").classList.add("open");
  document.getElementById("cart-sidebar").classList.add("open");
  document.getElementById("wish-sidebar").classList.remove("open");
}

function openWishlist() {
  document.getElementById("overlay").classList.add("open");
  document.getElementById("wish-sidebar").classList.add("open");
  document.getElementById("cart-sidebar").classList.remove("open");
  renderWishlist();
}

function closePanels() {
  document.getElementById("overlay").classList.remove("open");
  document.getElementById("cart-sidebar").classList.remove("open");
  document.getElementById("wish-sidebar").classList.remove("open");
}

var filterBtns = document.querySelectorAll(".filter-btn");
filterBtns.forEach(function(btn) {
  btn.addEventListener("click", function() {
    activeCategory = btn.getAttribute("data-cat");
    filterBtns.forEach(function(b) {
      b.classList.remove("active");
    });
    btn.classList.add("active");
    renderProducts();
  });
});

document.getElementById("sort-select").addEventListener("change", function(e) {
  sortOption = e.target.value;
  renderProducts();
});

document.getElementById("search-input").addEventListener("input", function(e) {
  searchQuery = e.target.value.toLowerCase();
  lastSearch = searchQuery;
  renderProducts();
});

document.getElementById("cart-btn").addEventListener("click", openCart);
document.getElementById("wishlist-btn").addEventListener("click", openWishlist);
document.getElementById("close-cart").addEventListener("click", closePanels);
document.getElementById("close-wish").addEventListener("click", closePanels);
document.getElementById("overlay").addEventListener("click", closePanels);
document.getElementById("promo-btn").addEventListener("click", handlePromo);
document.getElementById("checkout-btn").addEventListener("click", handleCheckout);

document.getElementById("promo-input").addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    handlePromo();
  }
});

renderStats();
renderProducts();
renderCart();
updateBadges();

console.log(`${STORE_NAME} is open: ${IS_OPEN} | Tax rate: ${TAX_RATE}`);
console.log("Promo codes: OFFCOURT10  SPEED20  HOOP15");

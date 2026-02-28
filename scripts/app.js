const products = [
  {
    id: "p1",
    title: "Sunset Study",
    category: "original",
    price: 450,
    desc: "Acrylic on canvas, 16x20",
  },
  {
    id: "p2",
    title: "Wild Bloom",
    category: "print",
    price: 35,
    desc: "Museum quality print, multiple sizes",
  },
  {
    id: "p3",
    title: "Commission Slot",
    category: "commission",
    price: 200,
    desc: "Start a custom piece request",
  },
  {
    id: "p4",
    title: "Night Lines",
    category: "print",
    price: 28,
    desc: "Matte print, 8x10",
  },
  {
    id: "p5",
    title: "Field Notes",
    category: "original",
    price: 320,
    desc: "Ink and wash, 11x14",
  },
  {
    id: "p6",
    title: "Soft Horizon",
    category: "print",
    price: 40,
    desc: "Giclée print, multiple sizes",
  }
];

const grid = document.getElementById("productGrid");
const search = document.getElementById("search");
const category = document.getElementById("category");

const cartBtn = document.getElementById("cartBtn");
const cart = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutBtn = document.getElementById("checkoutBtn");

const year = document.getElementById("year");
year.textContent = new Date().getFullYear();

let cartState = JSON.parse(localStorage.getItem("art_cart") || "[]");

function money(n){
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function openCart(){
  cart.classList.add("open");
  cart.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}
function closeCartUi(){
  cart.classList.remove("open");
  cart.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

cartBtn.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartUi);
overlay.addEventListener("click", closeCartUi);

function addToCart(productId){
  const found = cartState.find(i => i.id === productId);
  if(found) found.qty += 1;
  else cartState.push({ id: productId, qty: 1 });
  persist();
  renderCart();
  openCart();
}

function updateQty(productId, delta){
  const found = cartState.find(i => i.id === productId);
  if(!found) return;
  found.qty += delta;
  if(found.qty <= 0){
    cartState = cartState.filter(i => i.id !== productId);
  }
  persist();
  renderCart();
}

function persist(){
  localStorage.setItem("art_cart", JSON.stringify(cartState));
}

function getVisibleProducts(){
  const q = (search.value || "").trim().toLowerCase();
  const cat = category.value;
  return products.filter(p => {
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
    const matchesCat = cat === "all" || p.category === cat;
    return matchesSearch && matchesCat;
  });
}

function renderProducts(){
  const visible = getVisibleProducts();
  grid.innerHTML = visible.map(p => `
    <article class="card">
      <div class="cardImage" aria-label="${p.title} image placeholder"></div>
      <div class="cardBody">
        <h3 class="cardTitle">${p.title}</h3>
        <p class="cardMeta">${p.desc}</p>
        <div class="cardRow">
          <div class="price">${money(p.price)}</div>
          <button class="btn small" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-add]").forEach(btn => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function renderCart(){
  const items = cartState.map(ci => {
    const p = products.find(x => x.id === ci.id);
    if(!p) return "";
    return `
      <div class="cartItem">
        <div class="thumb" aria-label="${p.title} thumbnail placeholder"></div>
        <div class="itemInfo">
          <p class="itemTitle">${p.title}</p>
          <p class="itemSub">${p.desc}</p>
          <div class="qtyRow">
            <button class="qtyBtn" data-qty="${p.id}" data-delta="-1">−</button>
            <div>${ci.qty}</div>
            <button class="qtyBtn" data-qty="${p.id}" data-delta="1">+</button>
          </div>
        </div>
        <div class="price">${money(p.price * ci.qty)}</div>
      </div>
    `;
  }).join("");

  cartItems.innerHTML = items || `<div class="tiny">Your cart is empty. Add something you love.</div>`;

  const total = cartState.reduce((sum, ci) => {
    const p = products.find(x => x.id === ci.id);
    return sum + (p ? p.price * ci.qty : 0);
  }, 0);

  cartTotal.textContent = money(total);

  const count = cartState.reduce((sum, ci) => sum + ci.qty, 0);
  cartCount.textContent = count;

  cartItems.querySelectorAll("[data-qty]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.qty;
      const delta = Number(btn.dataset.delta);
      updateQty(id, delta);
    });
  });
}

search.addEventListener("input", renderProducts);
category.addEventListener("change", renderProducts);

checkoutBtn.addEventListener("click", () => {
  alert("Checkout is not connected yet. Next step is Stripe or Shopify Buy Button.");
});

const contactForm = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formNote.textContent = "Message sent (demo). Next step: connect to Formspree or your email.";
  contactForm.reset();
});

renderProducts();
renderCart();
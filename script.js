// ================= STATE =================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function formatPrice(num) {
    return "₹" + Number(num).toLocaleString("en-IN");
}

function parsePrice(str) {
    return Number(String(str).replace(/[^0-9.]/g, "")) || 0;
}

// ================= TOAST =================
function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className =
            "fixed bottom-6 right-6 left-6 sm:left-auto z-50 flex items-center gap-2 " +
            "bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-lg " +
            "transition-all duration-300 translate-y-5 opacity-0 pointer-events-none";
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-green-400"></i><span>${message}</span>`;
    toast.classList.remove("translate-y-5", "opacity-0", "pointer-events-none");
    toast.classList.add("translate-y-0", "opacity-100");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove("translate-y-0", "opacity-100");
        toast.classList.add("translate-y-5", "opacity-0", "pointer-events-none");
    }, 2500);
}

// ================= ADD TO CART (product listing page) =================
let addButtons = document.querySelectorAll(".add-card");

addButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        let card = e.target.closest(".product-card");
        let name = card.querySelector(".product-name").innerText.trim();
        let price = parsePrice(card.querySelector(".product-price").innerText);
        let img = card.querySelector("img")?.getAttribute("src") || "";

        let existing = cart.find((item) => item.name === name);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ name, price, img, quantity: 1 });
        }

        saveCart();
        updateCartCount();
        showToast(`${name} added to cart`);
    });
});

// ================= CART COUNT BADGE (all pages) =================
function updateCartCount() {
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll(".cart-count").forEach((el) => {
        el.innerText = totalItems;
        el.classList.toggle("hidden", totalItems === 0);
        el.classList.toggle("flex", totalItems > 0);
    });
}

// ================= CART PAGE =================
let cartContainer = document.getElementById("cart-container");

function displayCart() {
    if (!cartContainer) return;

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="text-center bg-white border border-dashed border-pink-200 rounded-2xl py-16 px-5 text-gray-400">
                <i class="fa-solid fa-basket-shopping text-4xl text-pink-200 mb-4"></i>
                <p>Your cart is empty</p>
                <a href="index.html" class="inline-block mt-4 bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-full text-sm font-medium transition">Continue Shopping</a>
            </div>`;
        updateSummary();
        return;
    }

    cartContainer.innerHTML = cart.map((item, index) => `
        <div class="flex flex-wrap sm:flex-nowrap items-center gap-4 bg-white border border-pink-100 rounded-2xl p-4">
            <img src="${item.img}" alt="${item.name}" class="w-16 h-16 object-contain bg-pink-50 rounded-lg">
            <div class="flex-1 min-w-[120px]">
                <h3 class="text-base font-semibold text-gray-900">${item.name}</h3>
                <p class="text-xs text-gray-400">${formatPrice(item.price)} each</p>
            </div>
            <div class="quantity-box flex items-center border border-pink-200 rounded-full overflow-hidden">
                <button class="decrease w-8 h-8 bg-pink-50 hover:bg-pink-100 text-pink-600 text-base" data-index="${index}">−</button>
                <span class="quantity w-8 text-center text-sm font-medium">${item.quantity}</span>
                <button class="increase w-8 h-8 bg-pink-50 hover:bg-pink-100 text-pink-600 text-base" data-index="${index}">+</button>
            </div>
            <p class="font-semibold text-gray-900 min-w-[70px] text-right">${formatPrice(item.price * item.quantity)}</p>
            <button class="rem-btn text-red-500 hover:text-red-700 p-2" data-index="${index}" title="Remove item">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>
    `).join("");

    attachCartEvents();
    updateSummary();
}

function attachCartEvents() {
    document.querySelectorAll(".rem-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            let removed = cart[btn.dataset.index];
            cart.splice(btn.dataset.index, 1);
            saveCart();
            updateCartCount();
            displayCart();
            showToast(`${removed.name} removed from cart`);
        });
    });

    document.querySelectorAll(".increase").forEach((btn) => {
        btn.addEventListener("click", () => {
            cart[btn.dataset.index].quantity++;
            saveCart();
            updateCartCount();
            displayCart();
        });
    });

    document.querySelectorAll(".decrease").forEach((btn) => {
        btn.addEventListener("click", () => {
            let i = btn.dataset.index;
            if (cart[i].quantity > 1) {
                cart[i].quantity--;
                saveCart();
                updateCartCount();
                displayCart();
            }
        });
    });
}

function updateSummary() {
    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let subtotalEl = document.getElementById("subtotal");
    let totalEl = document.getElementById("total");
    let checkoutBtn = document.getElementById("checkout-btn");

    if (subtotalEl) subtotalEl.innerText = formatPrice(subtotal);
    if (totalEl) totalEl.innerText = formatPrice(subtotal);

    if (checkoutBtn) {
        let isEmpty = cart.length === 0;
        checkoutBtn.classList.toggle("opacity-50", isEmpty);
        checkoutBtn.classList.toggle("pointer-events-none", isEmpty);
        checkoutBtn.setAttribute("aria-disabled", isEmpty);
    }
}

// ================= CHECKOUT PAGE =================
function displayCheckoutSummary() {
    let summaryEl = document.getElementById("checkout-items");
    if (!summaryEl) return;

    if (cart.length === 0) {
        window.location.href = "cart.html";
        return;
    }

    summaryEl.innerHTML = cart.map((item) => `
        <div class="grid grid-cols-[50px_1fr_auto] items-center gap-3">
            <img src="${item.img}" alt="${item.name}" class="w-[50px] h-[50px] object-contain bg-pink-50 rounded-lg">
            <div>
                <h4 class="text-sm font-medium text-gray-900">${item.name}</h4>
                <p class="text-xs text-gray-400">Qty: ${item.quantity}</p>
            </div>
            <span class="text-sm font-semibold text-gray-900">${formatPrice(item.price * item.quantity)}</span>
        </div>
    `).join("");

    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById("checkout-subtotal").innerText = formatPrice(subtotal);
    document.getElementById("checkout-total").innerText = formatPrice(subtotal);
}

let checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Order placed successfully!");
        localStorage.removeItem("cart");
        cart = [];
        checkoutForm.reset();
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    });
}

// ================= INIT =================
updateCartCount();
displayCart();
displayCheckoutSummary();

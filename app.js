"use strict";

// Venue Data Model
const venueData = {
  name: "Grand Theatre",
  sections: [
    {
      id: "vip",
      name: "VIP Zone",
      price: 50,
      rows: [
        { rowLabel: "A", seatCount: 10 },
        { rowLabel: "B", seatCount: 10 }
      ]
    },
    {
      id: "main",
      name: "Main Hall",
      price: 30,
      rows: [
        { rowLabel: "C", seatCount: 12 },
        { rowLabel: "D", seatCount: 12 },
        { rowLabel: "E", seatCount: 12 }
      ]
    },
    {
      id: "balcony",
      name: "Balcony",
      price: 15,
      rows: [
        { rowLabel: "F", seatCount: 14 },
        { rowLabel: "G", seatCount: 14 }
      ]
    }
  ],
  unavailableSeats: ["A-3", "A-4", "C-7", "D-1"]
};

// Application State
let currentInspectedSeat = null;

// DOM Selectors
const venueMap = document.querySelector("#venue-map");
const seatInfoContainer = document.querySelector("#seat-info");
const addToCartBtn = document.querySelector("#add-to-cart-btn");

// Dynamically Render Venue Map
function renderVenueMap() {
  venueMap.innerHTML = "";

  venueData.sections.forEach((section) => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "section-block";

    const sectionTitle = document.createElement("h3");
    sectionTitle.className = "section-title";
    sectionTitle.textContent = `${section.name} ($${section.price})`;
    sectionElement.appendChild(sectionTitle);

    section.rows.forEach((row) => {
      const rowElement = document.createElement("div");
      rowElement.className = "seat-row";

      const rowLabel = document.createElement("span");
      rowLabel.className = "row-label";
      rowLabel.textContent = row.rowLabel;
      rowElement.appendChild(rowLabel);

      for (let i = 1; i <= row.seatCount; i++) {
        const seatId = `${row.rowLabel}-${i}`;
        const seatButton = document.createElement("button");
        seatButton.type = "button";
        seatButton.className = "seat";
        seatButton.textContent = i;
        seatButton.dataset.seatId = seatId;

        if (venueData.unavailableSeats.includes(seatId)) {
          seatButton.classList.add("unavailable");
          seatButton.disabled = true;
        } else {
          seatButton.classList.add("available");
          seatButton.addEventListener("click", () => {
            handleSeatInspection(seatId, section.name, section.price, seatButton);
          });
        }

        rowElement.appendChild(seatButton);
      }

      sectionElement.appendChild(rowElement);
    });

    venueMap.appendChild(sectionElement);
  });
}

// Handle Seat Click (Inspection state)
function handleSeatInspection(seatId, sectionName, price, buttonElement) {
  // Clear previous inspected seat highlight if it was not added to cart
  if (currentInspectedSeat) {
    const prevButton = document.querySelector(`[data-seat-id="${currentInspectedSeat.id}"]`);
    if (prevButton && prevButton.classList.contains("inspected")) {
      prevButton.className = "seat available";
    }
  }

  currentInspectedSeat = { id: seatId, section: sectionName, price: price };

  if (!buttonElement.classList.contains("in-cart")) {
    buttonElement.className = "seat inspected";
  }

  seatInfoContainer.innerHTML = `
    <p><strong>Seat ID:</strong> ${seatId}</p>
    <p><strong>Section:</strong> ${sectionName}</p>
    <p><strong>Price:</strong> $${price}</p>
    <p><strong>Status:</strong> ${buttonElement.classList.contains("in-cart") ? "In Cart" : "Inspected"}</p>
  `;

  addToCartBtn.disabled = buttonElement.classList.contains("in-cart");
}

// DOM Selectors for Cart
const cartList = document.querySelector("#cart-list");
const totalPriceElement = document.querySelector("#total-price");

// Global Cart Array
const cart = [];

// Add currently inspected seat to cart
addToCartBtn.addEventListener("click", () => {
  if (!currentInspectedSeat) return;

  // Prevent duplicate addition
  const alreadyInCart = cart.some((item) => item.id === currentInspectedSeat.id);
  if (alreadyInCart) return;

  // Push seat to cart state
  cart.push({ ...currentInspectedSeat });
  saveCartToStorage();

  // Update corresponding button on the venue map
  const seatButton = document.querySelector(`[data-seat-id="${currentInspectedSeat.id}"]`);
  if (seatButton) {
    seatButton.className = "seat in-cart";
  }

  // Update UI and clear inspection panel state
  renderCart();
  currentInspectedSeat = null;
  seatInfoContainer.innerHTML = "<p>Click on an available seat to inspect details.</p>";
  addToCartBtn.disabled = true;
});

// Render Cart items and update Total Price
function renderCart() {
  cartList.innerHTML = "";

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.className = "cart-item";

    const itemText = document.createElement("span");
    itemText.textContent = `${item.id} (${item.section}) - $${item.price}`;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => removeFromCart(item.id));

    li.append(itemText, removeBtn);
    cartList.append(li);
  });

  // Calculate and display total price using reduce
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  totalPriceElement.textContent = total;
}

// Remove item from cart and synchronize with venue map
function removeFromCart(seatId) {
  const itemIndex = cart.findIndex((item) => item.id === seatId);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    saveCartToStorage();
  }

  // Restore seat status on map back to available
  const seatButton = document.querySelector(`[data-seat-id="${seatId}"]`);
  if (seatButton) {
    seatButton.className = "seat available";
  }

  renderCart();
}

// LocalStorage Key
const STORAGE_KEY = "venue_ticketing_cart";

// Save Cart array to localStorage
function saveCartToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// Restore Cart and Map seat states from localStorage on page load
function loadCartFromStorage() {
  const savedCartData = localStorage.getItem(STORAGE_KEY);
  if (savedCartData) {
    try {
      const parsedCart = JSON.parse(savedCartData);
      parsedCart.forEach((item) => {
        cart.push(item);
        // Mark matching seat on map as in-cart
        const seatButton = document.querySelector(`[data-seat-id="${item.id}"]`);
        if (seatButton) {
          seatButton.className = "seat in-cart";
        }
      });
      renderCart();
    } catch (error) {
      console.error("Error loading cart from storage:", error);
    }
  }
}

// Initial Call
renderVenueMap();
loadCartFromStorage(); // Restore saved cart state
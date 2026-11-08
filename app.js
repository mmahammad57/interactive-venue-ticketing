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

        // Accessible seat status assignment
        if (venueData.unavailableSeats.includes(seatId)) {
          seatButton.classList.add("unavailable");
          seatButton.setAttribute("aria-disabled", "true"); // Replaces native disabled
        } else {
          seatButton.classList.add("available");
        }

        // Attach click listener to ALL seats so unavailable ones can be inspected
        seatButton.addEventListener("click", () => {
          handleSeatInspection(seatId, section.name, section.price, seatButton);
        });

        rowElement.appendChild(seatButton);
      }

      sectionElement.appendChild(rowElement);
    });

    venueMap.appendChild(sectionElement);
  });
}

// Handle Seat Click (Inspection state & status logic)
function handleSeatInspection(seatId, sectionName, price, buttonElement) {
  // Clear previous inspected seat highlight
  if (currentInspectedSeat) {
    const prevButton = document.querySelector(`[data-seat-id="${currentInspectedSeat.id}"]`);
    if (prevButton && prevButton.classList.contains("inspected")) {
      prevButton.classList.remove("inspected");
      if (!prevButton.classList.contains("in-cart") && !prevButton.classList.contains("unavailable")) {
        prevButton.classList.add("available");
      }
    }
  }

  const isUnavailable = buttonElement.classList.contains("unavailable");
  const isInCart = buttonElement.classList.contains("in-cart");
  
  // Register seat as actionable only if it is not unavailable
  currentInspectedSeat = isUnavailable ? null : { id: seatId, section: sectionName, price: price };

  let statusText = "Available";
  
  if (isUnavailable) {
    statusText = '<span style="color: #e74c3c; font-weight: bold;">Unavailable</span>';
    addToCartBtn.disabled = true;
  } else if (isInCart) {
    statusText = "In Cart";
    addToCartBtn.disabled = true;
  } else {
    statusText = "Inspected";
    buttonElement.classList.add("inspected");
    addToCartBtn.disabled = false;
  }

  seatInfoContainer.innerHTML = `
    <p><strong>Seat ID:</strong> ${seatId}</p>
    <p><strong>Section:</strong> ${sectionName}</p>
    <p><strong>Price:</strong> $${price}</p>
    <p><strong>Status:</strong> ${statusText}</p>
  `;
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

// Helper function to check if seat is already in cart
function isSeatInCart(seatId) {
  return cart.some((item) => item.id === seatId);
}

// LocalStorage Key
const STORAGE_KEY = "venue_ticketing_cart";

// Save Cart array to localStorage
function saveCartToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// Restore Cart and Map seat states from localStorage on page load
// Safe localStorage loader with try-catch and structural validation
function loadCartFromStorage() {
  try {
    const savedCartData = localStorage.getItem(STORAGE_KEY);
    if (!savedCartData) return;

    const parsedCart = JSON.parse(savedCartData);
    
    // Validate if parsed data is a valid array
    if (!Array.isArray(parsedCart)) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    parsedCart.forEach((item) => {
      // Validate object properties before adding to cart
      if (item && item.id && typeof item.price === "number") {
        if (!isSeatInCart(item.id)) {
          cart.push(item);
          const seatButton = document.querySelector(`[data-seat-id="${item.id}"]`);
          if (seatButton) {
            seatButton.className = "seat in-cart";
          }
        }
      }
    });

    renderCart();
  } catch (error) {
    console.error("Corrupted localStorage data encountered. Resetting cart storage.", error);
    localStorage.removeItem(STORAGE_KEY); // Clear corrupted data safely
  }
}

// Initial Call
renderVenueMap();
loadCartFromStorage(); // Restore saved cart state

// Map Navigation State Variables
let scale = 1;
let panX = 0;
let panY = 0;

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.0;
const PAN_STEP = 30;

// Apply CSS Transform to Venue Map
function updateMapTransform() {
  venueMap.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
}

// Map Controls Event Listeners
document.querySelector("#zoom-in").addEventListener("click", () => {
  if (scale < MAX_SCALE) {
    scale = parseFloat((scale + ZOOM_STEP).toFixed(2));
    updateMapTransform();
  }
});

document.querySelector("#zoom-out").addEventListener("click", () => {
  if (scale > MIN_SCALE) {
    scale = parseFloat((scale - ZOOM_STEP).toFixed(2));
    updateMapTransform();
  }
});

document.querySelector("#move-up").addEventListener("click", () => {
  panY += PAN_STEP;
  updateMapTransform();
});

document.querySelector("#move-down").addEventListener("click", () => {
  panY -= PAN_STEP;
  updateMapTransform();
});

document.querySelector("#move-left").addEventListener("click", () => {
  panX += PAN_STEP;
  updateMapTransform();
});

document.querySelector("#move-right").addEventListener("click", () => {
  panX -= PAN_STEP;
  updateMapTransform();
});

document.querySelector("#reset-view").addEventListener("click", () => {
  scale = 1;
  panX = 0;
  panY = 0;
  updateMapTransform();
});


// Bonus 10%: Mouse-wheel zoom and click/drag panning integration

const mapViewport = document.querySelector(".map-viewport");
let isDragging = false;
let startX = 0;
let startY = 0;

// 1. Mouse-wheel zoom
mapViewport.addEventListener("wheel", (e) => {
  e.preventDefault(); // Prevent default browser page scrolling

  if (e.deltaY < 0) {
    // Scroll up -> Zoom In
    if (scale < MAX_SCALE) {
      scale = parseFloat((scale + ZOOM_STEP).toFixed(2));
    }
  } else {
    // Scroll down -> Zoom Out
    if (scale > MIN_SCALE) {
      scale = parseFloat((scale - ZOOM_STEP).toFixed(2));
    }
  }

  updateMapTransform();
}, { passive: false });

// 2. Click & Drag panning (with seat click safeguard)
mapViewport.addEventListener("mousedown", (e) => {
  // Trigger dragging only on left mouse button press AND ignore if clicking directly on a seat
  if (e.button !== 0 || e.target.closest('.seat')) return;
  
  isDragging = true;
  startX = e.clientX - panX;
  startY = e.clientY - panY;
  mapViewport.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  
  panX = e.clientX - startX;
  panY = e.clientY - startY;
  updateMapTransform();
});

window.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    mapViewport.style.cursor = "default";
  }
});
// =====================================================
// ECOSTOCK - POS BILLING & EXPIRY ENGINE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    let products = typeof initializeEcoStockProducts === "function" 
        ? initializeEcoStockProducts() 
        : JSON.parse(localStorage.getItem("ecoStockProducts")) || [];

    let cart = [];
    let bills = JSON.parse(localStorage.getItem("ecoStockBills")) || [];
    let blockedExpiredCount = 0;

    // --- DOM Elements ---
    const productSelect = document.getElementById("posProductSelect");
    const quantityInput = document.getElementById("posQuantity");
    const alertBanner = document.getElementById("expiryAlertBanner");
    const alertIcon = document.getElementById("expiryAlertIcon");
    const alertTitle = document.getElementById("expiryAlertTitle");
    const alertText = document.getElementById("expiryAlertText");
    const blockExpiredToggle = document.getElementById("blockExpiredToggle");

    const previewIcon = document.getElementById("previewItemIcon");
    const previewName = document.getElementById("previewItemName");
    const previewStock = document.getElementById("previewItemStock");
    const previewPrice = document.getElementById("previewItemPrice");

    // ==========================================
    // GET PRODUCT STATUS & DAYS REMAINING
    // ==========================================
    function evaluateExpiryStatus(expiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(expiryDate);
        expiry.setHours(0, 0, 0, 0);

        const difference = expiry - today;
        const days = Math.ceil(difference / (1000 * 60 * 60 * 24));

        if (days < 0) {
            const passed = Math.abs(days);
            return {
                status: "expired",
                daysText: passed === 1 ? "Expired yesterday" : `Expired ${passed} days ago`,
                badge: "🔴 EXPIRED"
            };
        } else if (days <= 7) {
            return {
                status: "warning",
                daysText: days === 0 ? "Expires today" : days === 1 ? "Expires tomorrow" : `Expires in ${days} days`,
                badge: "🟠 EXPIRING SOON"
            };
        } else {
            return {
                status: "safe",
                daysText: `Safe (${days} days left)`,
                badge: "🟢 SAFE"
            };
        }
    }

    // ==========================================
    // POPULATE PRODUCT DROPDOWN
    // ==========================================
    function loadProductDropdown() {
        productSelect.innerHTML = '<option value="">-- Choose a product --</option>';

        // Re-read latest products
        products = JSON.parse(localStorage.getItem("ecoStockProducts")) || [];

        products.forEach(p => {
            const exp = evaluateExpiryStatus(p.expiryDate);
            const option = document.createElement("option");
            option.value = p.id;
            option.textContent = `${p.name} | Stock: ${p.quantity} ${p.unit} | ₹${(p.price || 0).toFixed(2)} [${exp.badge}]`;
            
            if (exp.status === "expired") {
                option.style.color = "#c92a2a";
                option.style.fontWeight = "bold";
            } else if (exp.status === "warning") {
                option.style.color = "#d97706";
            }
            productSelect.appendChild(option);
        });

        updatePOSStats();
    }

    // ==========================================
    // ON PRODUCT SELECT CHANGE
    // ==========================================
    productSelect.addEventListener("change", () => {
        const productId = Number(productSelect.value);
        const product = products.find(p => p.id === productId);

        if (!product) {
            alertBanner.style.display = "none";
            previewIcon.textContent = "📦";
            previewName.textContent = "No product selected";
            previewStock.textContent = "Select a product to view stock & expiry info";
            previewPrice.textContent = "₹0.00";
            return;
        }

        const exp = evaluateExpiryStatus(product.expiryDate);
        const iconMap = { food: "🍎", medicine: "💊", personal: "🧴", household: "🏠" };
        
        previewIcon.textContent = iconMap[product.category] || "📦";
        previewName.textContent = product.name;
        previewStock.textContent = `Stock: ${product.quantity} ${product.unit} | Expiry: ${product.expiryDate} (${exp.daysText})`;
        previewPrice.textContent = `₹${(product.price || 0).toFixed(2)}`;

        // Display Expiry Alert Banner
        alertBanner.style.display = "flex";
        alertBanner.className = `billing-alert-banner ${exp.status}`;
        
        if (exp.status === "expired") {
            alertIcon.textContent = "🔴";
            alertTitle.textContent = "EXPIRED PRODUCT DETECTED!";
            alertText.textContent = `Product expired on ${product.expiryDate} (${exp.daysText}). Do NOT sell unless authorized.`;
        } else if (exp.status === "warning") {
            alertIcon.textContent = "🟠";
            alertTitle.textContent = "EXPIRING SOON WARNING";
            alertText.textContent = `Product expires on ${product.expiryDate} (${exp.daysText}). Ensure FIFO dispatch.`;
        } else {
            alertIcon.textContent = "🟢";
            alertTitle.textContent = "Safe Product";
            alertText.textContent = `Product is fresh and safe until ${product.expiryDate} (${exp.daysText}).`;
        }
    });

    // ==========================================
    // ADD ITEM TO CART
    // ==========================================
    window.addItemToCart = function() {
        const productId = Number(productSelect.value);
        const qty = parseInt(quantityInput.value);

        if (!productId) {
            alert("⚠️ Please select a product first.");
            return;
        }

        if (!qty || qty <= 0) {
            alert("⚠️ Please enter a valid quantity.");
            return;
        }

        const product = products.find(p => p.id === productId);
        if (!product) return;

        const exp = evaluateExpiryStatus(product.expiryDate);

        // EXPIRED CHECK
        if (exp.status === "expired" && blockExpiredToggle.checked) {
            blockedExpiredCount++;
            document.getElementById("statBlockedExpired").textContent = blockedExpiredCount;
            alert(`🚫 SALE BLOCKED!\n\n"${product.name}" has EXPIRED (${exp.daysText}).\nSafety policy prevents adding expired items to customer bills.`);
            return;
        }

        // STOCK CHECK
        const existingCartItem = cart.find(c => c.id === productId);
        const currentInCartQty = existingCartItem ? existingCartItem.quantity : 0;

        if (currentInCartQty + qty > product.quantity) {
            alert(`⚠️ Stock shortage! Only ${product.quantity - currentInCartQty} ${product.unit} available in inventory.`);
            return;
        }

        if (existingCartItem) {
            existingCartItem.quantity += qty;
            existingCartItem.total = existingCartItem.quantity * existingCartItem.price;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                category: product.category,
                price: product.price || 0,
                unit: product.unit,
                quantity: qty,
                expiryDate: product.expiryDate,
                status: exp.status,
                statusBadge: exp.badge,
                total: qty * (product.price || 0)
            });
        }

        quantityInput.value = "1";
        renderCart();
    };

    // ==========================================
    // RENDER CART TABLE & FINANCIAL BREAKDOWN
    // ==========================================
    window.renderCart = function() {
        const tbody = document.getElementById("cartTableBody");
        tbody.innerHTML = "";

        if (cart.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 25px; color: var(--text-light);">
                        🛒 Cart is empty. Add products from the left panel.
                    </td>
                </tr>
            `;
            document.getElementById("summarySubtotal").textContent = "₹0.00";
            document.getElementById("summaryTax").textContent = "₹0.00";
            document.getElementById("summaryDiscount").textContent = "-₹0.00";
            document.getElementById("summaryGrandTotal").textContent = "₹0.00";
            document.getElementById("cartItemCountBadge").textContent = "0 Items";
            return;
        }

        let subtotal = 0;

        cart.forEach((item, index) => {
            subtotal += item.total;
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>
                    <strong>${item.name}</strong>
                    <div style="font-size: 10px; color: var(--text-light);">${item.unit}</div>
                </td>
                <td>
                    <span class="receipt-expiry-tag ${item.status}">
                        ${item.statusBadge}
                    </span>
                </td>
                <td>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateCartQty(${index}, ${item.quantity - 1})">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartQty(${index}, ${item.quantity + 1})">+</button>
                    </div>
                </td>
                <td>₹${item.price.toFixed(2)}</td>
                <td><strong style="color: var(--primary);">₹${item.total.toFixed(2)}</strong></td>
                <td>
                    <button class="action-btn" onclick="removeFromCart(${index})" title="Remove item">
                        🗑️
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Financial Math
        const taxRate = parseFloat(document.getElementById("taxRateInput").value) || 0;
        const discountVal = parseFloat(document.getElementById("discountInput").value) || 0;

        const taxAmount = (subtotal * taxRate) / 100;
        const grandTotal = Math.max(0, subtotal + taxAmount - discountVal);

        document.getElementById("summarySubtotal").textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById("summaryTax").textContent = `₹${taxAmount.toFixed(2)}`;
        document.getElementById("summaryDiscount").textContent = `-₹${discountVal.toFixed(2)}`;
        document.getElementById("summaryGrandTotal").textContent = `₹${grandTotal.toFixed(2)}`;
        document.getElementById("cartItemCountBadge").textContent = `${cart.length} Item(s)`;
    };

    // ==========================================
    // CART ITEM ACTIONS
    // ==========================================
    window.updateCartQty = function(index, newQty) {
        if (newQty <= 0) {
            removeFromCart(index);
            return;
        }

        const item = cart[index];
        const product = products.find(p => p.id === item.id);

        if (product && newQty > product.quantity) {
            alert(`⚠️ Cannot exceed available stock of ${product.quantity} ${product.unit}.`);
            return;
        }

        item.quantity = newQty;
        item.total = item.quantity * item.price;
        renderCart();
    };

    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        renderCart();
    };

    window.clearCart = function() {
        if (cart.length === 0) return;
        if (confirm("Clear all items from the current bill cart?")) {
            cart = [];
            renderCart();
        }
    };

    // ==========================================
    // GENERATE & PRINT INVOICE
    // ==========================================
    window.generateAndPrintInvoice = function() {
        if (cart.length === 0) {
            alert("⚠️ Add at least one item to the cart before generating an invoice.");
            return;
        }

        const custName = document.getElementById("custName").value.trim() || "Walk-in Customer";
        const custPhone = document.getElementById("custPhone").value.trim() || "N/A";
        const paymentMode = document.getElementById("custPayment").value;

        // Subtotal & Math
        let subtotal = cart.reduce((sum, item) => sum + item.total, 0);
        const taxRate = parseFloat(document.getElementById("taxRateInput").value) || 0;
        const discountVal = parseFloat(document.getElementById("discountInput").value) || 0;
        const taxAmount = (subtotal * taxRate) / 100;
        const grandTotal = Math.max(0, subtotal + taxAmount - discountVal);

        const invoiceNo = "INV-" + Math.floor(100000 + Math.random() * 900000);
        const dateStr = new Date().toLocaleString("en-GB", {
            day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
        });

        // 1. DEDUCT INVENTORY STOCK IN LOCAL STORAGE
        products = JSON.parse(localStorage.getItem("ecoStockProducts")) || [];
        cart.forEach(cartItem => {
            const prod = products.find(p => p.id === cartItem.id);
            if (prod) {
                prod.quantity = Math.max(0, prod.quantity - cartItem.quantity);
            }
        });
        localStorage.setItem("ecoStockProducts", JSON.stringify(products));

        // 2. SAVE BILL TO HISTORY
        const newBill = {
            invoiceNo,
            date: dateStr,
            customerName: custName,
            customerPhone: custPhone,
            paymentMode,
            items: [...cart],
            subtotal,
            taxAmount,
            discountVal,
            grandTotal
        };

        bills.unshift(newBill);
        localStorage.setItem("ecoStockBills", JSON.stringify(bills));

        // 3. POPULATE RECEIPT MODAL
        document.getElementById("recInvoiceNo").textContent = invoiceNo;
        document.getElementById("recDate").textContent = dateStr;
        document.getElementById("recCustomer").textContent = custName;
        document.getElementById("recPayment").textContent = paymentMode;

        const recTbody = document.getElementById("recTableBody");
        recTbody.innerHTML = "";

        cart.forEach(item => {
            recTbody.innerHTML += `
                <tr>
                    <td>
                        <strong>${item.name}</strong>
                        <span class="receipt-expiry-tag ${item.status}">${item.statusBadge}</span>
                    </td>
                    <td style="text-align: center;">${item.quantity} ${item.unit}</td>
                    <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                    <td style="text-align: right;">₹${item.total.toFixed(2)}</td>
                </tr>
            `;
        });

        document.getElementById("recSubtotal").textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById("recTax").textContent = `₹${taxAmount.toFixed(2)}`;
        document.getElementById("recDiscount").textContent = `-₹${discountVal.toFixed(2)}`;
        document.getElementById("recGrandTotal").textContent = `₹${grandTotal.toFixed(2)}`;

        // Open Modal
        document.getElementById("receiptModal").classList.add("active");

        // 4. RESET CART & REFRESH
        cart = [];
        document.getElementById("custName").value = "";
        document.getElementById("custPhone").value = "";
        renderCart();
        loadProductDropdown();
        renderBillHistory();
        updatePOSStats();
    };

    window.closeReceiptModal = function() {
        document.getElementById("receiptModal").classList.remove("active");
    };

    window.resetBillingForm = function() {
        cart = [];
        productSelect.value = "";
        alertBanner.style.display = "none";
        renderCart();
    };

    // ==========================================
    // RENDER BILL HISTORY TABLE
    // ==========================================
    function renderBillHistory() {
        const historyTbody = document.getElementById("billHistoryTable");
        if (!historyTbody) return;

        bills = JSON.parse(localStorage.getItem("ecoStockBills")) || [];
        historyTbody.innerHTML = "";

        if (bills.length === 0) {
            historyTbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-light); padding: 20px;">
                        No invoices generated yet.
                    </td>
                </tr>
            `;
            return;
        }

        bills.forEach(bill => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${bill.invoiceNo}</strong></td>
                <td>${bill.date}</td>
                <td>${bill.customerName}</td>
                <td>${bill.items.length} items</td>
                <td><strong style="color: var(--primary);">₹${bill.grandTotal.toFixed(2)}</strong></td>
                <td><span class="category-badge">${bill.paymentMode}</span></td>
                <td>
                    <button class="action-btn" onclick="reprintInvoice('${bill.invoiceNo}')" title="Print Receipt">
                        🖨️
                    </button>
                </td>
            `;
            historyTbody.appendChild(tr);
        });
    }

    window.reprintInvoice = function(invoiceNo) {
        const bill = bills.find(b => b.invoiceNo === invoiceNo);
        if (!bill) return;

        document.getElementById("recInvoiceNo").textContent = bill.invoiceNo;
        document.getElementById("recDate").textContent = bill.date;
        document.getElementById("recCustomer").textContent = bill.customerName;
        document.getElementById("recPayment").textContent = bill.paymentMode;

        const recTbody = document.getElementById("recTableBody");
        recTbody.innerHTML = "";

        bill.items.forEach(item => {
            recTbody.innerHTML += `
                <tr>
                    <td>
                        <strong>${item.name}</strong>
                        <span class="receipt-expiry-tag ${item.status}">${item.statusBadge}</span>
                    </td>
                    <td style="text-align: center;">${item.quantity} ${item.unit}</td>
                    <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                    <td style="text-align: right;">₹${item.total.toFixed(2)}</td>
                </tr>
            `;
        });

        document.getElementById("recSubtotal").textContent = `₹${bill.subtotal.toFixed(2)}`;
        document.getElementById("recTax").textContent = `₹${bill.taxAmount.toFixed(2)}`;
        document.getElementById("recDiscount").textContent = `-₹${bill.discountVal.toFixed(2)}`;
        document.getElementById("recGrandTotal").textContent = `₹${bill.grandTotal.toFixed(2)}`;

        document.getElementById("receiptModal").classList.add("active");
    };

    // ==========================================
    // UPDATE POS DASHBOARD STATS
    // ==========================================
    function updatePOSStats() {
        bills = JSON.parse(localStorage.getItem("ecoStockBills")) || [];
        products = JSON.parse(localStorage.getItem("ecoStockProducts")) || [];

        const todayStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        const todayBills = bills.filter(b => b.date.includes(todayStr));

        const todayRevenue = todayBills.reduce((sum, b) => sum + b.grandTotal, 0);
        const activeStockCount = products.reduce((sum, p) => sum + p.quantity, 0);

        document.getElementById("statTodayRevenue").textContent = `₹${todayRevenue.toFixed(2)}`;
        document.getElementById("statInvoicesCount").textContent = todayBills.length;
        document.getElementById("statTotalStock").textContent = activeStockCount;
        document.getElementById("statBlockedExpired").textContent = blockedExpiredCount;
    }

    // --- INITIAL LOAD ---
    loadProductDropdown();
    renderBillHistory();
});

// =====================================================
// ECOSTOCK - GLOBAL APP
// Dashboard + Notifications
// =====================================================

function initializeEcoStockProducts() {
    let existing = JSON.parse(localStorage.getItem("ecoStockProducts"));
    const now = new Date();
    const formatDateStr = (offsetDays) => {
        const d = new Date();
        d.setDate(now.getDate() + offsetDays);
        return d.toISOString().split("T")[0];
    };

    if (!existing || existing.length === 0 || !existing[0].price) {
        const sampleProducts = [
            {
                id: 101,
                name: "Fresh Milk Pack 1L",
                category: "food",
                quantity: 12,
                unit: "Packs",
                price: 64.00,
                purchaseDate: formatDateStr(-10),
                expiryDate: formatDateStr(-1),
                notes: "Pasteurized Whole Milk - Store refrigerated"
            },
            {
                id: 102,
                name: "Whole Wheat Bread 400g",
                category: "food",
                quantity: 18,
                unit: "Packs",
                price: 45.00,
                purchaseDate: formatDateStr(-3),
                expiryDate: formatDateStr(2),
                notes: "Fresh artisan bakery loaf"
            },
            {
                id: 103,
                name: "Organic Farm Tomatoes",
                category: "food",
                quantity: 25,
                unit: "Kg",
                price: 38.00,
                purchaseDate: formatDateStr(-4),
                expiryDate: formatDateStr(4),
                notes: "Locally sourced greenhouse tomatoes"
            },
            {
                id: 104,
                name: "Paracetamol 500mg",
                category: "medicine",
                quantity: 40,
                unit: "Strips",
                price: 28.50,
                purchaseDate: formatDateStr(-30),
                expiryDate: formatDateStr(180),
                notes: "Pain reliever & fever reducer"
            },
            {
                id: 105,
                name: "Vitamin C 1000mg Chewable",
                category: "medicine",
                quantity: 30,
                unit: "Bottles",
                price: 240.00,
                purchaseDate: formatDateStr(-15),
                expiryDate: formatDateStr(240),
                notes: "Immunity support tablets"
            },
            {
                id: 106,
                name: "Eco Herbal Shampoo 300ml",
                category: "personal",
                quantity: 15,
                unit: "Bottles",
                price: 185.00,
                purchaseDate: formatDateStr(-20),
                expiryDate: formatDateStr(15),
                notes: "Sulfate-free natural shampoo"
            },
            {
                id: 107,
                name: "Bio-Degradable Dish Soap",
                category: "household",
                quantity: 20,
                unit: "Bottles",
                price: 120.00,
                purchaseDate: formatDateStr(-40),
                expiryDate: formatDateStr(120),
                notes: "Eco-friendly citrus liquid soap"
            }
        ];
        localStorage.setItem("ecoStockProducts", JSON.stringify(sampleProducts));
        return sampleProducts;
    }
    return existing;
}

document.addEventListener("DOMContentLoaded", () => {

    const products = initializeEcoStockProducts();


    // ==========================================
    // GET PRODUCT STATUS
    // ==========================================

    function getStatus(expiryDate) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const expiry = new Date(expiryDate);

        expiry.setHours(0, 0, 0, 0);

        const difference = expiry - today;

        const days = Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );


        if (days < 0) {
            return "expired";
        }

        if (days <= 7) {
            return "warning";
        }

        return "safe";

    }


    // ==========================================
    // COUNT PRODUCTS
    // ==========================================

    let safe = 0;
    let warning = 0;
    let expired = 0;


    products.forEach(product => {

        const status =
            getStatus(product.expiryDate);


        if (status === "safe") {

            safe++;

        } else if (status === "warning") {

            warning++;

        } else {

            expired++;

        }

    });


    const total = products.length;


    // ==========================================
    // UPDATE DASHBOARD STAT CARDS
    // ==========================================

    const totalElement =
        document.getElementById("totalProducts");

    const safeElement =
        document.getElementById("safeProducts");

    const warningElement =
        document.getElementById("warningProducts");

    const expiredElement =
        document.getElementById("expiredProducts");


    if (totalElement) {

        totalElement.textContent = total;

    }


    if (safeElement) {

        safeElement.textContent = safe;

    }


    if (warningElement) {

        warningElement.textContent = warning;

    }


    if (expiredElement) {

        expiredElement.textContent = expired;

    }


    // ==========================================
    // UPDATE ALERT BADGE
    // ==========================================

    const alertCount =
        document.querySelector(".alert-count");


    if (alertCount) {

        const alerts =
            warning + expired;


        alertCount.textContent =
            alerts;

    }


    // ==========================================
    // WASTE PREVENTION SCORE
    // ==========================================

    const wasteScore =
        document.getElementById(
            "wasteScore"
        );


    if (wasteScore) {

        let score = 100;


        if (total > 0) {

            score =
                Math.round(
                    ((safe + warning) / total) * 100
                );

        }


        wasteScore.textContent =
            score + "%";

    }


    // ==========================================
    // RECENT ALERTS
    // ==========================================

    const alertContainer =
        document.getElementById(
            "dashboardAlerts"
        );


    if (alertContainer) {

        const alerts =
            products
                .filter(product => {

                    const status =
                        getStatus(
                            product.expiryDate
                        );

                    return (
                        status === "expired" ||
                        status === "warning"
                    );

                })
                .sort(
                    (a, b) =>
                        new Date(a.expiryDate) -
                        new Date(b.expiryDate)
                )
                .slice(0, 5);


        alertContainer.innerHTML = "";


        if (alerts.length === 0) {

            alertContainer.innerHTML = `

                <div class="empty-alert">

                    <div>🌿</div>

                    <strong>
                        No expiry alerts
                    </strong>

                    <span>
                        Your inventory is looking good!
                    </span>

                </div>

            `;

        } else {

            alerts.forEach(product => {

                const status =
                    getStatus(
                        product.expiryDate
                    );


                const row =
                    document.createElement("div");


                row.className =
                    "dashboard-alert-row";


                row.innerHTML = `

                    <div class="dashboard-alert-icon">

                        ${
                            status === "expired"
                                ? "🔴"
                                : "🟠"
                        }

                    </div>


                    <div class="dashboard-alert-info">

                        <strong>
                            ${product.name}
                        </strong>

                        <span>
                            ${
                                status === "expired"
                                    ? "Product has expired"
                                    : "Product expires soon"
                            }
                        </span>

                    </div>


                    <div class="dashboard-alert-status">

                        ${
                            status === "expired"
                                ? "Expired"
                                : "Expiring Soon"
                        }

                    </div>

                `;


                alertContainer.appendChild(row);

            });

        }

    }


    // ==========================================
    // RECENT PRODUCTS
    // ==========================================

    const recentContainer =
        document.getElementById(
            "recentProducts"
        );


    if (recentContainer) {

        const recent =
            [...products]
                .reverse()
                .slice(0, 5);


        recentContainer.innerHTML = "";


        if (recent.length === 0) {

            recentContainer.innerHTML = `

                <div class="empty-alert">

                    <div>📦</div>

                    <strong>
                        No products yet
                    </strong>

                    <span>
                        Add your first product.
                    </span>

                </div>

            `;

        } else {

            recent.forEach(product => {

                const row =
                    document.createElement("div");


                row.className =
                    "recent-product-row";


                row.innerHTML = `

                    <div class="recent-product-icon">

                        ${
                            product.category === "food"
                                ? "🍎"
                                : product.category === "medicine"
                                ? "💊"
                                : product.category === "personal"
                                ? "🧴"
                                : product.category === "household"
                                ? "🏠"
                                : "📦"
                        }

                    </div>


                    <div class="recent-product-info">

                        <strong>
                            ${product.name}
                        </strong>

                        <span>
                            ${product.quantity}
                            ${product.unit}
                        </span>

                    </div>

                `;


                recentContainer.appendChild(row);

            });

        }

    }


    // ==========================================
    // GLOBAL SEARCH
    // ==========================================

    const searchInput =
        document.querySelector(
            ".search-box input"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    searchInput.value.trim()
                ) {

                    const search =
                        searchInput.value
                            .trim()
                            .toLowerCase();


                    const match =
                        products.find(
                            product =>
                                product.name
                                    .toLowerCase()
                                    .includes(search)
                        );


                    if (match) {

                        window.location.href =
                            "inventory.html";

                    } else {

                        alert(
                            "No product found."
                        );

                    }

                }

            }
        );

    }

});
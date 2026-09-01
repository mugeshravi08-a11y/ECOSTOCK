// =====================================================
// ECOSTOCK - INVENTORY
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const table =
        document.getElementById("inventoryTable");


    // ==========================================
    // GET PRODUCTS FROM LOCAL STORAGE
    // ==========================================

    let products =
        JSON.parse(
            localStorage.getItem("ecoStockProducts")
        ) || [];


    // ==========================================
    // CALCULATE PRODUCT STATUS
    // ==========================================

    function getStatus(expiryDate) {

        const today =
            new Date();

        today.setHours(0, 0, 0, 0);


        const expiry =
            new Date(expiryDate);

        expiry.setHours(0, 0, 0, 0);


        const difference =
            expiry - today;


        const days =
            Math.ceil(
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
    // FORMAT DATE
    // ==========================================

    function formatDate(dateString) {

        const date =
            new Date(dateString);

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // ==========================================
    // PRODUCT ICON
    // ==========================================

    function getIcon(category) {

        const icons = {

            food: "🍎",

            medicine: "💊",

            personal: "🧴",

            household: "🏠"

        };

        return icons[category] || "📦";

    }


    // ==========================================
    // CATEGORY NAME
    // ==========================================

    function getCategoryName(category) {

        const names = {

            food: "Food & Beverages",

            medicine: "Medicine",

            personal: "Personal Care",

            household: "Household"

        };

        return names[category] || "Other";

    }


    // ==========================================
    // DISPLAY PRODUCTS
    // ==========================================

    function displayProducts(list = products) {

        // Remove old locally-added rows

        document
            .querySelectorAll(
                "#inventoryTable tr.dynamic-product"
            )
            .forEach(row => row.remove());


        list.forEach(product => {

            const status =
                getStatus(product.expiryDate);


            const row =
                document.createElement("tr");


            row.className =
                "dynamic-product";


            row.dataset.category =
                product.category;


            row.dataset.status =
                status;


            let statusText;


            if (status === "expired") {

                statusText = "Expired";

            } else if (status === "warning") {

                statusText = "Expiring Soon";

            } else {

                statusText = "Safe";

            }


            row.innerHTML = `

                <td>

                    <div class="product-cell">

                        <div class="product-image">
                            ${getIcon(product.category)}
                        </div>

                        <div class="product-name">

                            <strong>
                                ${product.name}
                            </strong>

                            <span>
                                ${product.notes || "Inventory product"}
                            </span>

                        </div>

                    </div>

                </td>


                <td>

                    <span class="category-badge">
                        ${getCategoryName(product.category)}
                    </span>

                </td>


                <td>

                    <span class="quantity">
                        ${product.quantity}
                    </span>

                    ${product.unit}

                </td>


                <td>
                    <strong>₹${(product.price || 0).toFixed(2)}</strong>
                </td>


                <td>
                    <strong style="color: var(--primary);">₹${((product.quantity || 0) * (product.price || 0)).toFixed(2)}</strong>
                </td>


                <td>

                    <span class="date">
                        ${formatDate(product.expiryDate)}
                    </span>

                </td>


                <td>

                    <span class="table-status ${status}">

                        <span class="status-dot"></span>

                        ${statusText}

                    </span>

                </td>


                <td>

                    <div class="actions">

                        <button
                            class="action-btn delete-product"
                            data-id="${product.id}"
                            title="Delete">

                            🗑️

                        </button>

                    </div>

                </td>

            `;


            table.appendChild(row);

        });


        attachDeleteEvents();

        applyFilters();

    }


    // ==========================================
    // DELETE PRODUCT
    // ==========================================

    function attachDeleteEvents() {

        document
            .querySelectorAll(".delete-product")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(button.dataset.id);


                        const confirmed =
                            confirm(
                                "Delete this product?"
                            );


                        if (!confirmed) return;


                        products =
                            products.filter(
                                product =>
                                    product.id !== id
                            );


                        localStorage.setItem(
                            "ecoStockProducts",
                            JSON.stringify(products)
                        );


                        displayProducts();

                    }
                );

            });

    }


    // ==========================================
    // SEARCH & FILTER
    // ==========================================

    const searchInput =
        document.getElementById(
            "inventorySearch"
        );


    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    function applyFilters() {

        const search =
            searchInput.value
                .toLowerCase();


        const category =
            categoryFilter.value;


        const status =
            statusFilter.value;


        const allRows =
            document.querySelectorAll(
                "#inventoryTable tr"
            );


        allRows.forEach(row => {

            const name =
                row.querySelector(
                    ".product-name strong"
                )?.textContent
                .toLowerCase() || "";


            const rowCategory =
                row.dataset.category || "";


            const rowStatus =
                row.dataset.status || "";


            const searchMatch =
                name.includes(search);


            const categoryMatch =
                category === "all" ||
                rowCategory === category;


            const statusMatch =
                status === "all" ||
                rowStatus === status;


            row.style.display =
                searchMatch &&
                categoryMatch &&
                statusMatch
                    ? ""
                    : "none";

        });

    }


    searchInput.addEventListener(
        "input",
        applyFilters
    );


    categoryFilter.addEventListener(
        "change",
        applyFilters
    );


    statusFilter.addEventListener(
        "change",
        applyFilters
    );


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    displayProducts();

});
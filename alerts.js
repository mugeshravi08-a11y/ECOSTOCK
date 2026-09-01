// =====================================================
// ECOSTOCK - EXPIRY ALERTS
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    let products =
        JSON.parse(
            localStorage.getItem("ecoStockProducts")
        ) || [];


    // ==========================================
    // CALCULATE STATUS
    // ==========================================

    function getStatus(expiryDate) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);


        const expiry = new Date(expiryDate);

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
    // DAYS REMAINING
    // ==========================================

    function getDaysText(expiryDate) {

        const today = new Date();

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

            const passed =
                Math.abs(days);

            return passed === 1
                ? "Expired yesterday"
                : `Expired ${passed} days ago`;

        }


        if (days === 0) {
            return "Expires today";
        }


        if (days === 1) {
            return "Expires tomorrow";
        }


        return `Expires in ${days} days`;

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
    // ICON
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
    // DISPLAY ALERTS
    // ==========================================

    function displayAlerts() {

        const expired =
            products.filter(
                product =>
                    getStatus(product.expiryDate)
                    === "expired"
            );


        const warning =
            products.filter(
                product =>
                    getStatus(product.expiryDate)
                    === "warning"
            );


        const safe =
            products.filter(
                product =>
                    getStatus(product.expiryDate)
                    === "safe"
            );


        // COUNTS

        document.getElementById(
            "expiredCount"
        ).textContent = expired.length;


        document.getElementById(
            "warningCount"
        ).textContent = warning.length;


        document.getElementById(
            "safeCount"
        ).textContent = safe.length;


        document.getElementById(
            "expiredBadge"
        ).textContent =
            `${expired.length} Products`;


        document.getElementById(
            "warningBadge"
        ).textContent =
            `${warning.length} Products`;


        displayList(
            expired,
            "expiredProducts",
            "expired"
        );


        displayList(
            warning,
            "warningProducts",
            "warning"
        );

    }


    // ==========================================
    // DISPLAY PRODUCT LIST
    // ==========================================

    function displayList(
        list,
        containerId,
        type
    ) {

        const container =
            document.getElementById(containerId);


        container.innerHTML = "";


        if (list.length === 0) {

            container.innerHTML = `

                <div class="empty-alert">

                    <div>
                        ${
                            type === "expired"
                                ? "🎉"
                                : "🌿"
                        }
                    </div>

                    <strong>
                        ${
                            type === "expired"
                                ? "No expired products"
                                : "No products expiring soon"
                        }
                    </strong>

                    <span>
                        Your inventory is looking good!
                    </span>

                </div>

            `;

            return;

        }


        list.forEach(product => {

            const row =
                document.createElement("div");


            row.className =
                "product-alert-row";


            row.innerHTML = `

                <div class="alert-product-icon">
                    ${getIcon(product.category)}
                </div>


                <div class="alert-product-info">

                    <strong>
                        ${product.name}
                    </strong>

                    <span>
                        Quantity: ${product.quantity}
                        ${product.unit}
                    </span>

                </div>


                <div class="expiry-date">

                    <strong>
                        ${formatDate(product.expiryDate)}
                    </strong>

                    <span>
                        ${getDaysText(product.expiryDate)}
                    </span>

                </div>


                <button
                    class="alert-action ${
                        type === "expired"
                            ? "remove-button"
                            : "use-button"
                    }"
                    data-id="${product.id}">

                    ${
                        type === "expired"
                            ? "Remove"
                            : "Use First"
                    }

                </button>

            `;


            container.appendChild(row);

        });


        // BUTTON EVENTS

        container
            .querySelectorAll(".alert-action")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            Number(
                                button.dataset.id
                            );


                        if (
                            type === "expired"
                        ) {

                            const confirmed =
                                confirm(
                                    "Remove this expired product?"
                                );


                            if (!confirmed) {
                                return;
                            }

                        }


                        products =
                            products.filter(
                                product =>
                                    product.id !== id
                            );


                        localStorage.setItem(
                            "ecoStockProducts",
                            JSON.stringify(products)
                        );


                        displayAlerts();

                    }
                );

            });

    }


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    displayAlerts();

});
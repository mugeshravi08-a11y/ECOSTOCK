// =====================================================
// ECOSTOCK - ANALYTICS
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const products =
        JSON.parse(
            localStorage.getItem("ecoStockProducts")
        ) || [];


    // ==========================================
    // GET PRODUCT STATUS
    // ==========================================

    function getStatus(expiryDate) {

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
            return "expired";
        }


        if (days <= 7) {
            return "warning";
        }


        return "safe";

    }


    // ==========================================
    // COUNT STATUS
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


    const total =
        products.length;


    // ==========================================
    // UPDATE STAT CARDS
    // ==========================================

    document.getElementById(
        "totalProducts"
    ).textContent = total;


    document.getElementById(
        "safeProducts"
    ).textContent = safe;


    document.getElementById(
        "warningProductsCount"
    ).textContent = warning;


    document.getElementById(
        "expiredProducts"
    ).textContent = expired;


    // ==========================================
    // PERCENTAGES
    // ==========================================

    function percentage(value) {

        if (total === 0) {
            return 0;
        }

        return Math.round(
            (value / total) * 100
        );

    }


    const safePercent =
        percentage(safe);


    const warningPercent =
        percentage(warning);


    const expiredPercent =
        percentage(expired);


    // ==========================================
    // STATUS BARS
    // ==========================================

    document.getElementById(
        "safeBar"
    ).style.width =
        safePercent + "%";


    document.getElementById(
        "warningBar"
    ).style.width =
        warningPercent + "%";


    document.getElementById(
        "expiredBar"
    ).style.width =
        expiredPercent + "%";


    document.getElementById(
        "safeNumber"
    ).textContent =
        safePercent + "%";


    document.getElementById(
        "warningNumber"
    ).textContent =
        warningPercent + "%";


    document.getElementById(
        "expiredNumber"
    ).textContent =
        expiredPercent + "%";


    // ==========================================
    // CATEGORY ANALYSIS
    // ==========================================

    const categories = {

        food: {
            name: "Food & Beverages",
            icon: "🍎",
            count: 0
        },

        medicine: {
            name: "Medicine",
            icon: "💊",
            count: 0
        },

        personal: {
            name: "Personal Care",
            icon: "🧴",
            count: 0
        },

        household: {
            name: "Household",
            icon: "🏠",
            count: 0
        }

    };


    products.forEach(product => {

        if (
            categories[product.category]
        ) {

            categories[
                product.category
            ].count++;

        }

    });


    const categoryList =
        document.getElementById(
            "categoryList"
        );


    categoryList.innerHTML = "";


    Object.values(categories)
        .forEach(category => {

            if (category.count === 0) {
                return;
            }


            const percent =
                percentage(category.count);


            const item =
                document.createElement("div");


            item.className =
                "category-item";


            item.innerHTML = `

                <div class="category-icon">
                    ${category.icon}
                </div>

                <div class="category-info">

                    <strong>
                        ${category.name}
                    </strong>

                    <span>
                        ${category.count} product(s)
                    </span>

                </div>

                <div class="category-percent">
                    ${percent}%
                </div>

            `;


            categoryList.appendChild(item);

        });


    // ==========================================
    // EMPTY CATEGORY MESSAGE
    // ==========================================

    if (products.length === 0) {

        categoryList.innerHTML = `

            <div class="empty-alert">

                <div>📦</div>

                <strong>
                    No inventory data
                </strong>

                <span>
                    Add products to see analytics.
                </span>

            </div>

        `;

    }


    // ==========================================
    // WASTE PREVENTION SCORE
    // ==========================================

    let score = 100;


    if (total > 0) {

        score =
            Math.round(
                ((safe + warning) / total) * 100
            );

    }


    document.getElementById(
        "wasteScore"
    ).textContent =
        score + "%";

});
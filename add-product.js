// =====================================================
// ECOSTOCK - ADD PRODUCT
// Save products using localStorage
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("productForm");

    const productName =
        document.getElementById("productName");

    const productCategory =
        document.getElementById("productCategory");

    const productQuantity =
        document.getElementById("productQuantity");

    const productUnit =
        document.getElementById("productUnit");

    const productPrice =
        document.getElementById("productPrice");

    const purchaseDate =
        document.getElementById("purchaseDate");

    const expiryDate =
        document.getElementById("expiryDate");

    const productNotes =
        document.getElementById("productNotes");


    // ===============================
    // PRODUCT PREVIEW
    // ===============================

    const previewName =
        document.getElementById("previewName");

    const previewCategory =
        document.getElementById("previewCategory");

    const previewIcon =
        document.getElementById("previewIcon");


    productName.addEventListener("input", () => {

        previewName.textContent =
            productName.value.trim() || "New Product";

    });


    productCategory.addEventListener("change", () => {

        const selected =
            productCategory.options[
                productCategory.selectedIndex
            ];

        previewCategory.textContent =
            productCategory.value
                ? selected.textContent
                : "Select a category";


        const icons = {

            food: "🍎",

            medicine: "💊",

            personal: "🧴",

            household: "🏠"

        };


        previewIcon.textContent =
            icons[productCategory.value] || "📦";

    });


    // ===============================
    // SAVE PRODUCT
    // ===============================

    form.addEventListener("submit", (event) => {

        event.preventDefault();


        const product = {

            id: Date.now(),

            name:
                productName.value.trim(),

            category:
                productCategory.value,

            quantity:
                Number(productQuantity.value),

            unit:
                productUnit.value,

            price:
                Number(productPrice.value || 0),

            purchaseDate:
                purchaseDate.value,

            expiryDate:
                expiryDate.value,

            notes:
                productNotes.value.trim()

        };


        // Get existing products

        const products =
            JSON.parse(
                localStorage.getItem("ecoStockProducts")
            ) || [];


        // Add new product

        products.push(product);


        // Save back to browser

        localStorage.setItem(
            "ecoStockProducts",
            JSON.stringify(products)
        );


        // Success message

        alert(
            "✅ Product added successfully!"
        );


        // Go to inventory

        window.location.href =
            "inventory.html";

    });

});
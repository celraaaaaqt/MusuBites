import { renderDashboard } from "../admin/pages/dashboard.js";
import { renderProducts, products } from "../admin/pages/products.js";
import { renderCategories, categories } from "../admin/pages/categories.js";

const appContent = document.querySelector("#app-content");

const dashboardLink = document.querySelector("#dashboard-link");
const productsLink = document.querySelector("#products-link");
const categoriesLink = document.querySelector("#categories-link");

function showDashboard() {
  appContent.innerHTML = renderDashboard();
}

function showProducts() {
  appContent.innerHTML = renderProducts();

  const addProductButton = document.querySelector("#add-product-btn");
  const emptyAddProductButton = document.querySelector("#empty-add-product-btn");

  const modal = document.querySelector("#add-product-modal");
  const closeButton = document.querySelector("#close-product-modal");
  const cancelButton = document.querySelector("#cancel-product-modal");

  const form = document.querySelector("#add-product-form");
  const nameInput = document.querySelector("#product-name");
  const priceInput = document.querySelector("#product-price");
  const categoryInput = document.querySelector("#product-category");

  function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  addProductButton.addEventListener("click", openModal);

  if (emptyAddProductButton) {
    emptyAddProductButton.addEventListener("click", openModal);
  }

  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const product = {
      name: nameInput.value.trim(),
      price: priceInput.value,
      category: categoryInput.value
    };

    if (product.name === "") {
      return;
    }

    products.push(product);

    showProducts();
  });
  const deleteButtons = document.querySelectorAll("[data-delete-product]");

deleteButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.deleteProduct);

    products.splice(index, 1);

    showProducts();
  });
});
}



function showCategories() {
  appContent.innerHTML = renderCategories();

  const addCategoryButton = document.querySelector("#add-category-btn");
  const emptyAddCategoryButton = document.querySelector("#empty-add-category-btn");

  const modal = document.querySelector("#add-category-modal");
  const closeButton = document.querySelector("#close-category-modal");
  const cancelButton = document.querySelector("#cancel-category-modal");

  const form = document.querySelector("#add-category-form");
  const nameInput = document.querySelector("#category-name");

  function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  addCategoryButton.addEventListener("click", openModal);

  if (emptyAddCategoryButton) {
    emptyAddCategoryButton.addEventListener("click", openModal);
  }

  closeButton.addEventListener("click", closeModal);
  cancelButton.addEventListener("click", closeModal);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const category = {
      name: nameInput.value.trim()
    };

    if (category.name === "") {
      return;
    }

    categories.push(category);

    showCategories();
  });
}

dashboardLink.addEventListener("click", (event) => {
  event.preventDefault();
  showDashboard();
});

productsLink.addEventListener("click", (event) => {
  event.preventDefault();
  showProducts();
});

categoriesLink.addEventListener("click", (event) => {
  event.preventDefault();
  showCategories();
});

showDashboard();
const socket = io();

const form = document.getElementById("productForm");
const productsList = document.getElementById("productsList");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const product = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value
    };

    socket.emit("addProduct", product);

    form.reset();
});

socket.on("updateProducts", (products) => {
    productsList.innerHTML = "";

    products.forEach((product) => {
        productsList.innerHTML += `
            <li>
                ${product.title} - $${product.price}
                <button onclick="deleteProduct(${product.id})">Eliminar</button>
            </li>
        `;
    });
});

function deleteProduct(id) {
    socket.emit("deleteProduct", id);
}
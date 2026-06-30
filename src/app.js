import express from "express";
import { engine } from "express-handlebars";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public"));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// Productos de prueba
let products = [
  {
    id: 1,
    title: "Notebook",
    price: 1500
  },
  {
    id: 2,
    title: "Mouse",
    price: 30
  }
];

// Vista Home
app.get("/", (req, res) => {
  res.render("home", { products });
});

// Vista en tiempo real
app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { products });
});

// WebSockets
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.emit("updateProducts", products);

  socket.on("addProduct", (product) => {
    product.id = Date.now();
    products.push(product);

    io.emit("updateProducts", products);
  });

  socket.on("deleteProduct", (id) => {
    products = products.filter((p) => p.id != id);

    io.emit("updateProducts", products);
  });
});

httpServer.listen(8080, () => {
  console.log("Servidor escuchando en http://localhost:8080");
});
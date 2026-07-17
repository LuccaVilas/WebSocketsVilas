import { Router } from "express";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, query } = req.query;

    const filter = {};

    if (query) {
      if (query === "available") {
        filter.status = true;
        filter.stock = { $gt: 0 };
      } else if (query === "unavailable") {
        filter.$or = [{ status: false }, { stock: { $lte: 0 } }];
      } else {
        filter.category = query;
      }
    }

    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true,
    };

    if (sort === "asc") options.sort = { price: 1 };
    if (sort === "desc") options.sort = { price: -1 };

    const result = await Product.paginate(filter, options);

    res.render("products", {
      products: result.docs,
      page: result.page,
      totalPages: result.totalPages,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/products/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();

    if (!product) {
      return res.status(404).send("Producto no encontrado");
    }

    res.render("productDetail", { product });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/carts/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).send("Carrito no encontrado");
    }

    res.render("cart", { cart });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
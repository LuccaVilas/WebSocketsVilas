import { Router } from "express";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const router = Router();

// Crear carrito
router.post("/", async (req, res) => {
  try {
    const cart = await Cart.create({ products: [] });

    res.status(201).json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Obtener carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    res.json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "ID inválido",
    });
  }
});

// Agregar producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const product = await Product.findById(pid);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    const existing = cart.products.find(
      (p) => p.product.toString() === pid
    );

    if (existing) {
      existing.quantity++;
    } else {
      cart.products.push({
        product: pid,
        quantity: 1,
      });
    }

    await cart.save();

    res.json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Eliminar un producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    cart.products = cart.products.filter(
      (p) => p.product.toString() !== req.params.pid
    );

    await cart.save();

    res.json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Reemplazar todos los productos
router.put("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    cart.products = req.body.products;

    await cart.save();

    res.json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Actualizar cantidad
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { quantity } = req.body;

    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    const product = cart.products.find(
      (p) => p.product.toString() === req.params.pid
    );

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    product.quantity = quantity;

    await cart.save();

    res.json({
      status: "success",
      payload: cart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      return res.status(404).json({
        status: "error",
        message: "Carrito no encontrado",
      });
    }

    cart.products = [];

    await cart.save();

    res.json({
      status: "success",
      message: "Carrito vaciado correctamente",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

export default router;
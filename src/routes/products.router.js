import { Router } from "express";
import Product from "../models/product.model.js";

const router = Router();

// GET /api/products
// Paginación, filtros y ordenamiento
router.get("/", async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query,
    } = req.query;

    const filter = {};

    // Buscar por categoría o disponibilidad
    if (query) {
      if (query === "available") {
        filter.status = true;
        filter.stock = { $gt: 0 };
      } else if (query === "unavailable") {
        filter.$or = [
          { status: false },
          { stock: { $lte: 0 } },
        ];
      } else {
        filter.category = query;
      }
    }

    const options = {
      limit: Number(limit),
      page: Number(page),
      lean: true,
    };

    // Ordenar por precio
    if (sort === "asc") {
      options.sort = { price: 1 };
    }

    if (sort === "desc") {
      options.sort = { price: -1 };
    }

    const result = await Product.paginate(filter, options);

    const buildLink = (pageNumber) => {
      const params = new URLSearchParams();

      params.set("page", pageNumber);
      params.set("limit", limit);

      if (sort) {
        params.set("sort", sort);
      }

      if (query) {
        params.set("query", query);
      }

      return `/api/products?${params.toString()}`;
    };

    res.json({
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage
        ? buildLink(result.prevPage)
        : null,
      nextLink: result.hasNextPage
        ? buildLink(result.nextPage)
        : null,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid).lean();

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    res.json({
      status: "success",
      payload: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "ID de producto inválido",
    });
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      status: "success",
      payload: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    res.json({
      status: "success",
      payload: product,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.pid);

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Producto no encontrado",
      });
    }

    res.json({
      status: "success",
      message: "Producto eliminado correctamente",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "ID de producto inválido",
    });
  }
});

export default router;
import express from "express";
import {
  changeLanguage,
  testPermission,
  uploadProfile,
  getMyPhoto,
  uploadMultiple,
  uploadProfileOptimize,
} from "../../../controllers/api/userController";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { upload, uploadMemory } from "../../../middlewares/uploadFile";
import {
  getPost,
  getPostsByPagination,
  getInfinitePostsByPagination,
} from "../../../controllers/api/postConterller";
import {
  getProduct,
  getProductsByPagination,
  getCategoryType,
  toggleFavourite,
} from "../../../controllers/api/productController";

const router = express.Router();

router.post("/changeLanguage", changeLanguage);
router.get("/test-permission", authMiddleware, testPermission);

router.patch(
  "/profile/upload",
  authMiddleware,
  upload.single("avatar"),
  uploadProfile
);
router.patch(
  "/profile/upload",
  authMiddleware,
  upload.single("avatar"),
  uploadProfile
);
router.patch(
  "/profile/upload/optimize",
  authMiddleware,
  upload.single("avatar"),
  uploadProfileOptimize
);
router.patch(
  "/profile/multipleUpload",
  authMiddleware,
  upload.array("avatar"),
  uploadMultiple
);

router.get("/profile/myPhoto", getMyPhoto);

router.get("/posts", authMiddleware, getPostsByPagination); // Offset paginatin
router.get("/posts/infinite", authMiddleware, getInfinitePostsByPagination); //cursor pagination
router.get("/posts/:id", authMiddleware, getPost); // Category and Type filtering
router.get("/products/:id", authMiddleware, getProduct);

router.get("/products", authMiddleware, getProductsByPagination); //cursor pagination
router.get("/filter-type", authMiddleware, getCategoryType);
router.patch("/products/toggleFavourite", authMiddleware, toggleFavourite);
export default router;

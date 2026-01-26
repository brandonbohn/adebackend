import { Router } from "express";
import { addDonor, getAllDonors, getDonorById, deleteDonor } from "../controllers/donorController";

const router = Router();

router.post("/", addDonor);
router.get("/", getAllDonors);
router.get("/:id", getDonorById);
router.delete("/:id", deleteDonor);

export default router;
import { Router } from "express";
import { addDonor, getAllDonors, getDonorById, deleteDonor, getAllDonations, createDonation } from "../controllers/donorController";

const router = Router();

router.post("/", addDonor);
router.get("/", getAllDonors);
router.get("/:id", getDonorById);
router.delete("/:id", deleteDonor);

// Donations endpoints
router.get("/donations/all", getAllDonations);
router.post("/donations", createDonation);

export default router;
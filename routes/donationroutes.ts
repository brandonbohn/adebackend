import { Router } from "express";
import { getAllDonations, createDonation } from "../controllers/donationsController";

const router = Router();

router.get("/", getAllDonations);
router.post("/", createDonation);

export default router;
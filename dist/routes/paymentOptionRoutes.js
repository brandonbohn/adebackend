"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentOptionController_1 = require("../controllers/paymentOptionController");
const router = express_1.default.Router();
// Unified payment endpoint for all providers
router.post('/process-payment', paymentOptionController_1.processPayment);
exports.default = router;

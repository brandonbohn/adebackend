"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPayment = processPayment;
exports.createPaymentOption = createPaymentOption;
exports.updatePaymentOption = updatePaymentOption;
exports.getPaymentOptions = getPaymentOptions;
exports.deletePaymentOption = deletePaymentOption;
exports.getAllAvailablePaymentOptions = getAllAvailablePaymentOptions;
const paymentOptionService_1 = require("../services/paymentOptionService");
const PaymentOption_1 = require("../models/PaymentOption");
async function processPayment(req, res) {
    const { amount, currency, paymentOptionType, paymentDetails } = req.body;
    try {
        if (paymentOptionType === 'paypal') {
            const result = await (0, paymentOptionService_1.processPaypalPayment)(req.body);
            return res.json(result);
        }
        else if (paymentOptionType === 'mpesa') {
            const result = await (0, paymentOptionService_1.processMpesaPayment)(req.body);
            return res.json(result);
        }
        else if (paymentOptionType === 'flutterwave') {
            const result = await (0, paymentOptionService_1.processFlutterwavePayment)(req.body);
            return res.json(result);
        }
        else {
            return res.status(400).json({
                status: 'error',
                provider: paymentOptionType,
                message: 'Unsupported payment provider'
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            provider: paymentOptionType,
            message: error.message || 'Payment processing failed'
        });
    }
}
async function createPaymentOption(req, res) {
    try {
        const { type, label, description } = req.body;
        const option = await PaymentOption_1.PaymentOptionModel.create({ type, label, description });
        res.status(201).json(option);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create payment option' });
    }
}
async function updatePaymentOption(req, res) {
    try {
        const id = req.params.id;
        const { type, label, description } = req.body;
        const result = await PaymentOption_1.PaymentOptionModel.findByIdAndUpdate(id, { type, label, description }, { new: true });
        if (result) {
            res.json({ message: 'Payment option updated successfully', option: result });
        }
        else {
            res.status(404).json({ error: 'Payment option not found' });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update payment option' });
    }
}
async function getPaymentOptions(req, res) {
    try {
        const options = await PaymentOption_1.PaymentOptionModel.find();
        res.status(200).json(options);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch payment options' });
    }
}
async function deletePaymentOption(req, res) {
    try {
        const id = req.params.id;
        await PaymentOption_1.PaymentOptionModel.findByIdAndDelete(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete payment option' });
    }
}
function getAllAvailablePaymentOptions(req, res) {
    const options = [
        { id: 1, type: 'paypal', label: 'PayPal' },
        { id: 2, type: 'mpesa', label: 'M-Pesa' },
        { id: 3, type: 'flutterwave', label: 'Flutterwave' }
        // Add more as needed
    ];
    res.json(options);
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayPalOrder = createPayPalOrder;
exports.capturePayPalOrder = capturePayPalOrder;
exports.getPayPalOrderDetails = getPayPalOrderDetails;
exports.verifyPayPalWebhook = verifyPayPalWebhook;
var paypal = require('@paypal/checkout-server-sdk');
/**
 * PayPal Service
 * Handles PayPal payment processing using the PayPal Checkout SDK
 */
// Configure PayPal environment
function getPayPalEnvironment() {
    var clientId = process.env.PAYPAL_CLIENT_ID;
    var clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    var mode = process.env.PAYPAL_MODE || 'sandbox';
    if (!clientId || !clientSecret) {
        throw new Error('PayPal credentials not configured in environment variables');
    }
    // Use sandbox or production environment
    if (mode === 'live' || mode === 'production') {
        return new paypal.core.LiveEnvironment(clientId, clientSecret);
    }
    else {
        return new paypal.core.SandboxEnvironment(clientId, clientSecret);
    }
}
// Create PayPal client
function getPayPalClient() {
    return new paypal.core.PayPalHttpClient(getPayPalEnvironment());
}
/**
 * Create a PayPal order for donation
 */
function createPayPalOrder(amount, currency, donorId, returnUrl, cancelUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var client, request, response, order, approvalUrl, error_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    client = getPayPalClient();
                    request = new paypal.orders.OrdersCreateRequest();
                    request.prefer('return=representation');
                    request.requestBody({
                        intent: 'CAPTURE',
                        application_context: {
                            brand_name: 'ADE Foundation',
                            landing_page: 'BILLING',
                            user_action: 'PAY_NOW',
                            return_url: returnUrl,
                            cancel_url: cancelUrl,
                        },
                        purchase_units: [
                            {
                                reference_id: donorId,
                                description: 'Donation to ADE Foundation',
                                amount: {
                                    currency_code: currency,
                                    value: amount,
                                },
                            },
                        ],
                    });
                    return [4 /*yield*/, client.execute(request)];
                case 1:
                    response = _d.sent();
                    order = response.result;
                    approvalUrl = (_a = order.links.find(function (link) { return link.rel === 'approve'; })) === null || _a === void 0 ? void 0 : _a.href;
                    if (!approvalUrl) {
                        throw new Error('No approval URL returned from PayPal');
                    }
                    console.log("\u2705 PayPal order created: ".concat(order.id, " for ").concat(currency, " ").concat(amount));
                    return [2 /*return*/, {
                            orderId: order.id,
                            approvalUrl: approvalUrl,
                        }];
                case 2:
                    error_1 = _d.sent();
                    console.error('PayPal order creation failed:', {
                        message: (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || String(error_1),
                        details: (error_1 === null || error_1 === void 0 ? void 0 : error_1.details) || error_1,
                        status: error_1 === null || error_1 === void 0 ? void 0 : error_1.statusCode,
                        body: error_1 === null || error_1 === void 0 ? void 0 : error_1.body
                    });
                    throw new Error("PayPal order creation failed: ".concat((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || ((_c = (_b = error_1 === null || error_1 === void 0 ? void 0 : error_1.details) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.issue) || String(error_1)));
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Capture a PayPal order after user approval
 */
function capturePayPalOrder(orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, request, response, order, capture, donorId, error_2;
        var _a, _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 2, , 3]);
                    client = getPayPalClient();
                    request = new paypal.orders.OrdersCaptureRequest(orderId);
                    request.requestBody({});
                    return [4 /*yield*/, client.execute(request)];
                case 1:
                    response = _g.sent();
                    order = response.result;
                    if (order.status === 'COMPLETED') {
                        capture = (_c = (_b = (_a = order.purchase_units[0]) === null || _a === void 0 ? void 0 : _a.payments) === null || _b === void 0 ? void 0 : _b.captures) === null || _c === void 0 ? void 0 : _c[0];
                        donorId = (_d = order.purchase_units[0]) === null || _d === void 0 ? void 0 : _d.reference_id;
                        console.log("\u2705 PayPal payment captured: ".concat(capture === null || capture === void 0 ? void 0 : capture.id, " for order ").concat(orderId));
                        return [2 /*return*/, {
                                success: true,
                                transactionId: capture === null || capture === void 0 ? void 0 : capture.id,
                                amount: (_e = capture === null || capture === void 0 ? void 0 : capture.amount) === null || _e === void 0 ? void 0 : _e.value,
                                currency: (_f = capture === null || capture === void 0 ? void 0 : capture.amount) === null || _f === void 0 ? void 0 : _f.currency_code,
                                donorId: donorId,
                                status: order.status,
                            }];
                    }
                    else {
                        console.warn("\u26A0\uFE0F PayPal order ".concat(orderId, " not completed: ").concat(order.status));
                        return [2 /*return*/, {
                                success: false,
                                status: order.status,
                            }];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _g.sent();
                    console.error('PayPal capture failed:', error_2);
                    throw new Error('Failed to capture PayPal payment');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get PayPal order details
 */
function getPayPalOrderDetails(orderId) {
    return __awaiter(this, void 0, void 0, function () {
        var client, request, response, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getPayPalClient();
                    request = new paypal.orders.OrdersGetRequest(orderId);
                    return [4 /*yield*/, client.execute(request)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.result];
                case 2:
                    error_3 = _a.sent();
                    console.error('Failed to get PayPal order details:', error_3);
                    throw new Error('Failed to retrieve PayPal order');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Verify PayPal webhook signature
 */
function verifyPayPalWebhook(headers, body) {
    return __awaiter(this, void 0, void 0, function () {
        var client, webhookId, request, response, verification, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    client = getPayPalClient();
                    webhookId = process.env.PAYPAL_WEBHOOK_ID;
                    if (!webhookId) {
                        console.warn('⚠️ PAYPAL_WEBHOOK_ID not configured, skipping verification');
                        return [2 /*return*/, false];
                    }
                    request = new paypal.notifications.WebhookVerifySignatureRequest();
                    request.requestBody({
                        auth_algo: headers['paypal-auth-algo'],
                        cert_url: headers['paypal-cert-url'],
                        transmission_id: headers['paypal-transmission-id'],
                        transmission_sig: headers['paypal-transmission-sig'],
                        transmission_time: headers['paypal-transmission-time'],
                        webhook_id: webhookId,
                        webhook_event: body,
                    });
                    return [4 /*yield*/, client.execute(request)];
                case 1:
                    response = _a.sent();
                    verification = response.result;
                    return [2 /*return*/, verification.verification_status === 'SUCCESS'];
                case 2:
                    error_4 = _a.sent();
                    console.error('PayPal webhook verification failed:', error_4);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}

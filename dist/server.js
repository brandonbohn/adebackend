"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const contentRoutes_1 = __importDefault(require("./routes/contentRoutes"));
const path_1 = __importDefault(require("path"));
const donorController_1 = require("./controllers/donorController");
const paymentOptionController_1 = require("./controllers/paymentOptionController");
const cartController_1 = require("./controllers/cartController");
const paymentOptionController_2 = require("./controllers/paymentOptionController");
const paymentOptionController_3 = require("./controllers/paymentOptionController");
dotenv_1.default.config();
console.log('Starting server...');
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: 'https://www.adekiberafoundation.org',
    credentials: true
}));
// Serve static JSON files
app.use('/Backend/json', express_1.default.static(path_1.default.join(__dirname, 'json')));
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/adefc';
mongoose_1.default.connect(mongoUri)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.get('/', (req, res) => {
    res.send('API is running');
});
// Donor CRUD routes
console.log('Registering donor routes');
app.post('/donors', donorController_1.addDonor);
app.get('/donors', donorController_1.getDonors);
app.get('/donors/:id', donorController_1.getDonorById);
app.delete('/donors/:id', donorController_1.deleteDonor);
// Payment Option CRUD routes
app.post('/payment-options', paymentOptionController_1.createPaymentOption);
app.put('/payment-options/:id', paymentOptionController_1.updatePaymentOption);
app.get('/payment-options', paymentOptionController_1.getPaymentOptions);
app.delete('/payment-options/:id', paymentOptionController_1.deletePaymentOption);
// Cart CRUD routes
app.post('/carts', cartController_1.createCart);
app.get('/carts/:id', cartController_1.getCart);
app.post('/carts/:id/items', cartController_1.addItemToCart);
app.delete('/carts/:id/items/:itemIndex', cartController_1.removeItemFromCart);
// Payment Options Available Route
app.get('/available-payment-options', paymentOptionController_2.getAllAvailablePaymentOptions);
// Payment Processing Endpoint
app.post('/process-payment', paymentOptionController_3.processPayment);
// Website Content CRUD routes
app.use('/api/content', contentRoutes_1.default);
// Girls API route
// Removed girls API route as data is now served from content route
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Startup complete');
});
process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const environment_1 = require("./config/environment");
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Security & Utility Middlewares
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Static Uploads Directory
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Mount Main API Routes
app.use('/api/v1', routes_1.default);
// 404 Fallback
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} tidak ditemukan di server Amanah Zakat ERP API.`,
    });
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
// Start HTTP Server
app.listen(environment_1.config.port, () => {
    console.log(`====================================================`);
    console.log(`  🚀 Amanah Zakat ERP Backend API Server Running    `);
    console.log(`  ------------------------------------------------  `);
    console.log(`  Environment : ${environment_1.config.nodeEnv}                  `);
    console.log(`  URL         : http://localhost:${environment_1.config.port}/api/v1`);
    console.log(`  Health Check: http://localhost:${environment_1.config.port}/api/v1/health`);
    console.log(`====================================================`);
});
exports.default = app;

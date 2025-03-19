// routes/index.js

const express = require('express');
const router = express.Router();

const inventoryRoutes = require('./inventoryRoutes');
const outboundOrderRoutes = require('./outboundOrderRoutes');
const productRoutes = require('./productRoutes');
const purchaseOrderRoutes = require('./purchaseOrderRoutes');
const receivingRoutes = require('./receivingGoodsRoutes');
const returnAuthorizationRoutes = require('./returnAuthorizationRoutes');
const roleRoutes = require('./roleRoutes');
const shipmentRoutes = require('./shipmentRoutes');
const stockMovementRoutes = require('./stockMovementRoutes');
const stockTakeRoutes = require('./stockTakeRoutes');
const supplierRoutes = require('./supplierRoutes');
const userRoleRoutes = require('./userRoleRoutes');
const userRoutes = require('./userRoutes');
const warehouseLocationRoutes = require('./warehouseLocationRoutes');

// Function to extract route information
function getRoutes(app) {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            // Direct routes defined on the app instance (less likely in your setup)
            routes.push({
                path: middleware.route.path,
                method: Object.keys(middleware.route.methods).join(', ').toUpperCase(),
                middleware: middleware.route.stack.map(layer => layer.handle.name).filter(name => name !== '<anonymous>').join(', ') || 'None',
            });
        } else if (middleware.handle && middleware.handle.stack) {
            // Handle routers (like the /api router)
            let basePath = middleware.path || ''; // Get the path where the router is mounted

            middleware.handle.stack.forEach((subMiddleware) => {
                if (subMiddleware.route) {
                    routes.push({
                        path: `${basePath}${subMiddleware.route.path}`,
                        method: Object.keys(subMiddleware.route.methods).join(', ').toUpperCase(),
                        middleware: subMiddleware.route.stack.map(layer => layer.handle.name).filter(name => name !== '<anonymous>').join(', ') || 'None',
                    });
                } else if (subMiddleware.handle && subMiddleware.handle.stack) {
                    // Handle nested routers (though less common in your structure)
                    let nestedBasePath = `${basePath}${subMiddleware.path || ''}`;
                    subMiddleware.handle.stack.forEach((nestedSubMiddleware) => {
                        if (nestedSubMiddleware.route) {
                            routes.push({
                                path: `${nestedBasePath}${nestedSubMiddleware.route.path}`,
                                method: Object.keys(nestedSubMiddleware.route.methods).join(', ').toUpperCase(),
                                middleware: nestedSubMiddleware.route.stack.map(layer => layer.handle.name).filter(name => name !== '<anonymous>').join(', ') || 'None',
                            });
                        }
                    });
                }
            });
        }
    });
    return routes;
}

// Route to display all API endpoints
router.get('/api/endpoints', (req, res) => {
    const app = req.app;
    const routes = getRoutes(app);

    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>API Endpoints</title>
            <style>
                body { font-family: sans-serif; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <h1>API Endpoints</h1>
            <table>
                <thead>
                    <tr>
                        <th>Path</th>
                        <th>Method</th>
                        <th>Middleware</th>
                    </tr>
                </thead>
                <tbody>
    `;

    routes.forEach(route => {
        html += `
                    <tr>
                        <td>${route.path}</td>
                        <td>${route.method}</td>
                        <td>${route.middleware}</td>
                    </tr>
        `;
    });

    html += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    res.send(html);
});

// Use each route module
router.use(inventoryRoutes);
router.use(outboundOrderRoutes);
router.use(productRoutes);
router.use(purchaseOrderRoutes);
router.use(receivingRoutes);
router.use(returnAuthorizationRoutes);
router.use(roleRoutes);
router.use(shipmentRoutes);
router.use(stockMovementRoutes);
router.use(stockTakeRoutes);
router.use(supplierRoutes);
router.use(userRoleRoutes);
router.use(userRoutes);
router.use(warehouseLocationRoutes);

module.exports = router;
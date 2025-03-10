require('dotenv').config();
const express = require('express');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');
const promClient = require('prom-client');

const app = express();
app.use(express.json());

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// create matrics to count the number of requests
const httpRequestTotal = new promClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests made',
    labelNames: ["method", "route", "status"]
})
// Register this counter matrics
register.registerMetric(httpRequestTotal); // Still won't work as we need to expose

// Middleware to count the number of requests
app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestTotal.inc({ method: req.method, route: req.url, status: res.statusCode });
    });
    next();
});
// expose the /metrics endpoint for Prometheus to scrape
app.get('/metrics', async(req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});


app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);

app.use((error, req, res, next) => {
    console.error(error.stack); 
    const statusCode = error.message.toLowerCase().includes("not found") ? 404 : 
                      error.message.toLowerCase().includes("invalid") ? 400 : 500; 

    res.status(statusCode).json({
        error: error.message
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
})


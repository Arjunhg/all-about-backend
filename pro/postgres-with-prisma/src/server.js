require('dotenv').config();
const express = require('express');
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { register, metrics, updateMemoryMetrics } = require('./metrics/metrics');

const app = express();
app.use(express.json());

// Middleware to track requests, status and duration
app.use((req, res, next) => {
    const start = process.hrtime();
    metrics.activeRequest.inc({ method: req.method });

    res.on('finish', () => {
        metrics.activeRequest.dec({ method: req.method });

        const duration = process.hrtime(start);
        const durationInMs = duration[0] * 1000 + duration[1] / 1e6;
        const route = req.route?.path || req.path;

        metrics.httpRequestDurationSeconds.observe({
            method: req.method,
            route,
            status: res.statusCode
        }, durationInMs);

        metrics.httpRequestTotal.inc({
            method: req.method,
            route,
            status: res.statusCode
        });

        const statusCategory = Math.floor(res.statusCode / 100) + 'xx';
        metrics.apiResponseCounter.inc({ status_category: statusCategory });
    });

    next();
});

// Update memory metrics every 10 seconds
setInterval(updateMemoryMetrics, 10000);

// expose the /metrics endpoint for Prometheus to scrape
app.get('/metrics', async(req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// additional health check endpoint
app.use('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString()
    })
})

// =========== APPLICATION ROUTES ===========
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);

// =========== ERROR HANDLING ===========
app.use((error, req, res, next) => {
    console.error(error.stack); 
    const statusCode = error.message.toLowerCase().includes("not found") ? 404 : 
                      error.message.toLowerCase().includes("invalid") ? 400 :
                      error.message.toLowerCase().includes("duplicate") ? 409 : 500;

    // categorize error types
    let errorType = 'server_error';
    if(statusCode === 404) errorType = 'not_found';
    else if(statusCode === 400) errorType = 'bad_request';
    else if(statusCode === 409) errorType = 'conflict';

    // increment counter
    metrics.errorCounter.inc({
        method: req.method,
        route: req.route?.path || req.path,
        error_type: errorType
    })
 

    res.status(statusCode).json({
        error: error.message,
        timestamp: new Date().toISOString()
    });
});

// =========== SERVER STARTUP ===========
// Graceful shutdown
// =========== SERVER STARTUP =========== // 

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on port ${PORT}`);
    console.log(`Metrics available at http://localhost:${PORT}/metrics`);
});

// Graceful shutdown
const gracefulShutdown = () => {
    console.log('Received shutdown signal, closing connections...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


module.exports = server;

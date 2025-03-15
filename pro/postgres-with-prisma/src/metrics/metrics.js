const promClient = require('prom-client');

// Create and configure the registry
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// Create metrics
const metrics = {
    httpRequestTotal: new promClient.Counter({
        name: 'http_requests_total',
        help: 'Total number of HTTP requests made',
        labelNames: ["method", "route", "status"]
    }),

    httpRequestDurationSeconds: new promClient.Histogram({
        name: "http_request_duration_seconds",
        help: "Duration of HTTP requests in seconds",
        labelNames: ["method", "route", "status"],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
    }),

    activeRequest: new promClient.Gauge({
        name: 'http_active_requests',
        help: 'Number of active HTTP requests',
        labelNames: ["method"]
    }),

    errorCounter: new promClient.Counter({
        name: 'http_request_errors_total',
        help: 'Total number of HTTP requests that resulted in an error',
        labelNames: ['method', 'route', 'error_type']
    }),

    dbQueryDuration: new promClient.Histogram({
        name: 'db_query_duration_seconds',
        help: 'Duration of database queries in seconds',
        labelNames: ['operation', 'table'],
        buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2]
    }),

    dbPoolGauge: new promClient.Gauge({
        name: 'db_pool_connections',
        help: 'Number of connections in the database pool',
        labelNames: ['state']
    }),

    memoryUsageGauge: new promClient.Gauge({
        name: 'nodejs_memory_usage_bytes',
        help: 'Memory usage in bytes',
        labelNames: ['type']
    }),

    bookCreatedCounter: new promClient.Counter({
        name: 'book_created_total',
        help: 'Total number of book created',
    }),

    bookFailedCounter: new promClient.Counter({
        name: 'book_failed_total',
        help: 'Total number of book creation failures',
    }),

    authorCreatedCounter: new promClient.Counter({
        name: 'author_created_total',
        help: 'Total number of author created',
    }),

    authorFailedCounter: new promClient.Counter({
        name: 'author_failed_total',
        help: 'Total number of author creation failures',
    }),

    apiResponseCounter: new promClient.Counter({
        name: 'api_response_total',
        help: 'Total count of API responses by status category',
        labelNames: ['status_category']
    })
};

// Register all metrics
Object.values(metrics).forEach(metric => register.registerMetric(metric));

// Utility functions
const trackDbQuery = (operation, table, queryFn) => {
    return async (...args) => {
        const end = metrics.dbQueryDuration.startTimer({ operation, table });
        try {
            return await queryFn(...args);
        } catch (error) {
            end();
            throw error;
        }
    }
};

const updateMemoryMetrics = () => {
    const memoryUsage = process.memoryUsage();
    // rss, heapTotal, heapUsed, external
    for(let key in memoryUsage){
        metrics.memoryUsageGauge.set({type: key}, memoryUsage[key]);
    }
};

module.exports = {
    register,
    metrics,
    trackDbQuery,
    updateMemoryMetrics
};

# NodeJS & Express Backend Development Project

A comprehensive learning repository covering backend development with Node.js, Express, MongoDB and SQL, featuring progressive modules from core concepts to production-ready applications.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Core Node.js Concepts](#core-nodejs-concepts)
- [Express.js Implementation](#expressjs-implementation)
- [Database Integration](#database-integration)
- [Security Features](#security-features)
- [Getting Started](#getting-started)
- [Advanced Concepts](#advanced-concepts)

## Overview

This repository serves as both a learning resource and reference implementation for full-stack JavaScript development. It demonstrates the progressive implementation of backend concepts from Node.js fundamentals to production-ready Express APIs with database integration and security best practices.

## Project Structure

```
basics/
├── 01nodejs/               # Core Node.js concepts and APIs
│   ├── CPUIntensive.js     # Thread pool and CPU-bound operations
│   ├── Emitter.js          # Event-driven programming with EventEmitter
│   ├── EventLoop.js        # Node.js event loop explanation and demonstration
│   ├── File/               # File system operations
│   ├── Hash.js             # Cryptographic operations and password hashing
│   ├── OS.js               # Operating system interactions
│   └── Streams/            # Streams implementation and examples
├── 02ExpressJs/            # Express.js framework implementations
│   ├── 01BasicAPI/         # RESTful API implementation with best practices
│   ├── 02Cookie/           # Cookie implementation for session management
│   └── 03ExpressSession/   # Express session management with middleware
├── 03MongoDB/              # MongoDB integration examples and queries
├── 04SQL/                  # SQL database concepts and implementation
└── package.json            # Project dependencies and scripts
```

## Core Node.js Concepts

### Event Loop and Concurrency

The project demonstrates Node.js's event-driven, non-blocking I/O model through practical examples:

- **Event Loop:** Detailed explanation of the Node.js event loop and callback queue prioritization
- **CPU Intensive Operations:** Handling CPU-bound tasks using the thread pool
- **Event Emitters:** Implementation of the Observer pattern using Node's EventEmitter

### File System and Streams

- **File Operations:** Synchronous and asynchronous file operations
- **Streams API:** Efficient data processing with readable and writable streams
- **Backpressure Handling:** Managing data flow between streams

### Cryptography

- **Hashing:** Multiple approaches to secure password hashing using Node's crypto module
- **PBKDF2 vs Bcrypt:** Comparison of different hashing algorithms with security considerations

## Express.js Implementation

### RESTful API

A production-ready API implementation featuring:

- **Clean Architecture:** Well-organized routes, controllers, and middleware
- **Error Handling:** Centralized error management with appropriate status codes
- **Request Validation:** Input validation with proper error responses
- **Pagination:** Efficient data retrieval with pagination support

### Authentication and Session Management

- **Cookie-Based Auth:** Secure cookie implementation with signed cookies
- **Express Session:** Session management using express-session
- **Middleware Patterns:** Authentication middleware for protected routes

### Security Features

- **Helmet Integration:** Protection against common web vulnerabilities
- **Rate Limiting:** Defense against brute force and DoS attacks
- **CORS Configuration:** Secure cross-origin resource sharing
- **HTTP Headers:** Security-focused HTTP headers
- **Request IDs:** Unique identifiers for request tracking and logging

## Database Integration

### MongoDB

- **Query Examples:** Various MongoDB query patterns and advanced features
- **Filtering & Projection:** Efficient data retrieval techniques

### SQL

- **Installation Guides:** Step-by-step MySQL setup instructions
- **Basic Operations:** Fundamental SQL operations and concepts
- **Case Sensitivity:** Handling case sensitivity in different database contexts

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run specific examples:
   ```
   # For Node.js basics
   node 01nodejs/EventLoop.js
   
   # For Express API
   node 02ExpressJs/01BasicAPI/server.js
   
   # Development mode with auto-reload
   npm run dev
   ```

## Advanced Concepts

### Production Readiness

- **Graceful Shutdown:** Proper server shutdown handling for production environments
- **Environment Configuration:** Environment-specific settings with dotenv
- **Logging:** Request logging with Morgan for development and production
- **Error Monitoring:** Uncaught exception and promise rejection handling

### Performance Optimization

- **Compression:** Response compression for improved network performance
- **Efficient Data Parsing:** Proper limits for JSON and URL-encoded data
- **Stream Processing:** Using streams for efficient data handling

---

This project is designed for educational purposes and serves as a reference implementation for Node.js and Express best practices. Each module demonstrates production-ready patterns that can be adapted for real-world applications.
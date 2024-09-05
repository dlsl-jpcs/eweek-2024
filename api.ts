/**
    This handler is basically a middleware.
    It will be called for every request in our site.
    Make sure to call next() as it will pass the request to the next handler.
    
    In development, flow is: handler -> vite middlewares
    In production, flow is: serve static files -> handler -> index.html

    For more information, check the repo at:
    https://github.com/egoist/vite-plugin-mix
    
    Note: This is a small project, we may have to improvise but this allows our
    project to be simplier and easier to maintain. We're not sure how this will
    compromise performance. We'll see how it goes.

    By: Coffee
    Date: 9/6/2024 12:00 AM
 */

import type { Handler } from 'vite-plugin-mix'

// middleware
export const handler: Handler = (req, res, next) => {
  handleRoutes(req, res, next);
  next()
}

// handle routes here
const handleRoutes = (req, res, next) => {
    if (req.url == '/api/v1/token/verify') {
        tokenVerify(req, res, next);
    }
    else if (req.url == '/api/v1/token/register') {
        tokenRegister(req, res, next);
    }
}

const tokenVerify = (req, res, next) => {
    
}

const tokenRegister = (req, res, next) => {
    
}
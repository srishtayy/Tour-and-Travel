const fs = require('fs')
const express = require('express')
const AppError = require('./utils/appError');
const morgan = require('morgan')
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')
const reviewRouter = require('./routes/reviewRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const app = express();
// will add bunch of functions to app


// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());
//MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); //for all routes starting with this


// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
// Prevent parameter pollution
app.use(
    hpp({
        //for which we allow duplicates
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price'
        ]
    })
);
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    console.log("Hello from the middleware")
    next();
})
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers)
    next();
})


app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {


    // const err = new Error(`Can't find ${req.originalUrl} on this server');
    // err.status='fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});



app.use(globalErrorHandler);
module.exports = app;
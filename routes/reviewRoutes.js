const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

//protecting this route for authenticated users only
router.use(authController.protect);

// we only want authenticated users to post reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        // reviewController.setTourUserIds,
        reviewController.createReview
    );

// router
//     .route('/:id')
//     .get(reviewController.getReview)
//     .patch(
//         authController.restrictTo('user', 'admin'),
//         reviewController.updateReview
//     )
//     .delete(
//         authController.restrictTo('user', 'admin'),
//         reviewController.deleteReview
//     );

module.exports = router;
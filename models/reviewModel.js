// review / rating / createdAt / ref to tour / ref to user
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // });
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();

});
//static bec aggregate on the model
reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
      {
        $match: { tour: tourId }
      },
      {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    // console.log(stats);
  //for persisting in tour document
    if (stats.length > 0) {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
      });
    } else {
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      });
    }
  };
  
  reviewSchema.post('save', function() {
    //when a review has been created
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
  });
  
  // findByIdAndUpdate
  // findByIdAndDelete for updating and deleting
  // this usually refers to the query object. This object represents the criteria for selecting or updating documents.
  reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.findOne();
    // console.log(this.r);
    next();
  });
  // Here, this refers to the query object, and you can use this.findOne() to 
  // retrieve the document before the actual findOneAnd... operation takes place. 
  // This is because the pre middleware is executed before the database operation.

  reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
  });

  // In the post middleware, this refers to the result of the query, not the query itself. 
  // The query has already been executed, and this now represents the result of the operation,
  // which might not contain the full document details. This is why you use this.r in the post 
  // middleware, as you stored the document in the r property during the pre middleware.

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
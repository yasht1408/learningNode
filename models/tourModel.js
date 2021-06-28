const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, 'Name is manadatory field but found missing'],
        trim: true,
        maxlength: [40, 'A Tour name must have less or equal then 40 characters'],
        minlength: [5, 'A Tour name must contain at least 5 characters'],
        validate: [validator.isAlpha, 'Name must be alphaNumeric'] // this only works while cretaing a document
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must hav a max group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficulty'],
            message: 'Difficulty must be equal to difficult, easy or medium'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'minium value of rating starts from one'],
        max: [5, 'max value of rating is 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must contains price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price
            },
            message: 'PriceDisvount should be less then Price'    
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must contain a summary']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

//Virtual properties
tourSchema.virtual('durationWeeks').get(function() {
    return (this.duration / 7);
});
//Mongoose middleware
//1.Document middleware
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true} );
    next();
});

//2.QUERY MIDDLEWARE
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function(docs , next) {
    console.log(`The Query took ${Date.now() - this.start} milisieconds`);
    next();
});

//Aggregate Middleware
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: {secretTour: { $ne: true}} });
    next();
});
const Tour = mongoose.model('Tour',tourSchema);

module.exports = Tour;
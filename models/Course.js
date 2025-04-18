const mongoose = require("mongoose")

// Define the Courses schema
const coursesSchema = new mongoose.Schema({
  courseName: { type: String },
  courseDescription: { type: String },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingandReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tag: {
    type: [String],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    ref: "Category",
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  ],
  // Adding studentsEnroled for backward compatibility 
  studentsEnroled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  instructions: {
    type: [String],
  },
  status: {
    type: String,
    enum: ["Draft", "Published"],
  },
  createdAt: { type: Date, default: Date.now },
})

// Export the Courses model
const Course = mongoose.model("Course", coursesSchema)

// Add a middleware to sync studentsEnrolled and studentsEnroled
coursesSchema.pre('save', function(next) {
  // Ensure both fields are synchronized
  if (this.isModified('studentsEnrolled')) {
    this.studentsEnroled = [...this.studentsEnrolled];
  }
  if (this.isModified('studentsEnroled')) {
    this.studentsEnrolled = [...this.studentsEnroled];
  }
  next();
});

// Also sync these fields on updates
coursesSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  // If we're pushing to studentsEnrolled, also push to studentsEnroled
  if (update && update.$push && update.$push.studentsEnrolled) {
    if (!update.$push.studentsEnroled) {
      update.$push.studentsEnroled = update.$push.studentsEnrolled;
    }
  }
  // And vice versa
  if (update && update.$push && update.$push.studentsEnroled) {
    if (!update.$push.studentsEnrolled) {
      update.$push.studentsEnrolled = update.$push.studentsEnroled;
    }
  }
  next();
});

module.exports = Course

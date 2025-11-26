const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: String,
  description: String,
  requirements: [String],
  skills: [String],
  salary: String,
  jobType: String,
  rawHtml: String,
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  userId: String
}, {
  timestamps: true
});

jobSchema.index({ title: 'text', company: 'text', description: 'text' });
jobSchema.index({ userId: 1 });

module.exports = mongoose.model('Job', jobSchema);

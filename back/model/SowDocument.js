import mongoose from 'mongoose';

const sowSchema = new mongoose.Schema({
  sowData: {
    projectTitle: String,
    projectDescription: String,
    deliverables: [{
      name: String,
      description: String,
      deadline: Date,
    }],
    timeline: {
      startDate: Date,
      endDate: Date,
    },
    milestones: [{
      name: String,
      description: String,
      date: Date,
    }],
  }
});

const SowDocument = mongoose.model('SowDocument', sowSchema);

export default SowDocument;
import mongoose from 'mongoose';
import { buildDefaultChecklist } from './checklist.template.js';

const checkItemSchema = new mongoose.Schema(
  {
    status: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    photoPath: { type: String, default: '' },
  },
  { _id: false },
);

const unitSchema = new mongoose.Schema(
  {
    no: { type: String, required: true },
    name: { type: String, default: '' },
    checklist: {
      type: Map,
      of: checkItemSchema,
      default: () => buildDefaultChecklist(),
    },
  },
  { _id: true },
);

const reportSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
    },
    locationName: {
      type: String,
      required: true,
      trim: true,
    },
    createdById: {
      type: String,
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
      trim: true,
    },
    checkedBy: {
      type: String,
      default: '',
    },
    contributors: {
      type: [
        {
          userId: { type: String, required: true },
          userName: { type: String, required: true },
        },
      ],
      default: [],
    },
    note: {
      type: String,
      default: '',
    },
    leaderSign: {
      type: String,
      default: '',
    },
    units: {
      type: [unitSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed'],
      default: 'open',
    },
    excelPath: {
      type: String,
      default: '',
    },
    excelUrl: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const Report = mongoose.model('Report', reportSchema);

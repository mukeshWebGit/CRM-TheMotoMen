import { Schema, model } from 'mongoose'

const inquirySchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  source: { type: String, required: true },
  assignedTo: { type: String, required: true },
  queryDate: { type: Date, required: true },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
})

export const Inquiry = model('Inquiry', inquirySchema)
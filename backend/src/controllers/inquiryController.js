import { Inquiry } from '../models/Inquiry.js'

export async function createInquiry(req, res) {
  const { name, email, mobile, source, assignedTo, queryDate, remarks } = req.body || {}

  if (!name || !email || !mobile || !source || !assignedTo || !queryDate) {
    return res.status(400).json({ message: 'All required fields must be provided.' })
  }

  try {
    const inquiry = new Inquiry({
      name,
      email,
      mobile,
      source,
      assignedTo,
      queryDate: new Date(queryDate),
      remarks: remarks || '',
    })

    await inquiry.save()

    res.status(201).json({ message: 'Inquiry created successfully', inquiry })
  } catch (error) {
    console.error('Create inquiry error:', error)
    res.status(500).json({ message: 'Failed to create inquiry' })
  }
}
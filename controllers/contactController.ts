import { Request, Response } from 'express';
import { sendEmail, generateContactConfirmationEmail, generateAdminContactNotification } from '../utils/emailservice';
import { ContactModel } from '../models/contact';
import { upsertContactInfo } from '../services/contactInfoService';

/**
 * Create a new contact submission
 * POST /api/contacts
 * 
 * Smart Cross-Referencing:
 * - If reason is 'donation', create a lead in donors.json
 * - If reason is 'volunteering', create a lead in volunteers.json
 * - If reason is 'partnership', just store in contacts.json
 */
export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, organization, email, phone, reason = 'general', subject, message } = req.body;
    const normalizedReason = (reason || 'general').toString().toLowerCase();
    const normalizedSubject = subject?.trim() || 'General Inquiry';

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Name must be at least 2 characters',
          field: 'name'
        }
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please enter a valid email address',
          field: 'email'
        }
      });
    }

    if (!message || message.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message must be at least 5 characters',
          field: 'message'
        }
      });
    }

    // Upsert shared ContactInfo and create Contact submission
    const contactInfo = await upsertContactInfo({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
    });

    const created = await ContactModel.create({
      contactid: contactInfo._id as any,
      organization: organization?.trim(),
      reason: normalizedReason,
      subject: normalizedSubject,
      message: message.trim(),
      status: 'new',
    });

    // SMART CROSS-REFERENCING: Create leads based on reason
    let crossReference: any = null;

    // Optional: Cross-referencing could create leads in Mongo here in future

    // Send confirmation email to user
    const confirmationHtml = generateContactConfirmationEmail(name, normalizedSubject);
    await sendEmail({
      to: email,
      subject: 'We Received Your Message - ADE Organization',
      text: `Dear ${name}, Thank you for contacting us regarding: ${subject}. We will get back to you soon.`,
      html: confirmationHtml
    });

    // Send notification email to admin
    if (process.env.EMAIL_USER) {
      const adminNotificationHtml = generateAdminContactNotification(
        name,
        email,
        phone,
        normalizedReason,
        normalizedSubject,
        message
      );
      await sendEmail({
        to: process.env.EMAIL_USER, // Send to organization's email
        subject: `🔔 New Contact Form: ${normalizedReason.toUpperCase()} - ${name}`,
        text: `New contact from ${name} (${email}) regarding ${normalizedReason}. Subject: ${normalizedSubject}`,
        html: adminNotificationHtml
      });
    }

    // Return success response with cross-reference info
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact: {
        _id: String(created._id),
        name: contactInfo.name,
        email: contactInfo.email,
        subject: created.subject,
        reason: created.reason,
        createdAt: created.createdAt?.toISOString?.() || new Date().toISOString()
      },
      // cross-reference placeholder
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to submit contact form. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
};

/**
 * Get all contacts (admin only)
 * GET /api/admin/contacts
 */
export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const contacts = await ContactModel.find().populate('contactid');
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch contacts'
      }
    });
  }
};

/**
 * Get single contact by ID (admin only)
 * GET /api/admin/contacts/:id
 */
export const getContactById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const contact = await ContactModel.findById(id).populate('contactid');
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to fetch contact' }
    });
  }
};

/**
 * Update contact status (admin only)
 * PUT /api/admin/contacts/:id/status
 */
export const updateContactStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['new', 'responded', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Status must be new, responded, or closed'
        }
      });
    }

    const updated = await ContactModel.findByIdAndUpdate(
      id,
      {
        status,
        ...(status === 'responded' ? { respondedAt: new Date() } : {}),
      },
      { new: true }
    ).populate('contactid');

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    res.json({ success: true, message: 'Contact status updated', contact: updated });
  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update status' }
    });
  }
};

/**
 * Delete contact (admin only)
 * DELETE /api/admin/contacts/:id
 */
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await ContactModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete contact' }
    });
  }
};

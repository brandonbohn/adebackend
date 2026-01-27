import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { IContact } from '../models/contact';
import { sendEmail, generateContactConfirmationEmail, generateAdminContactNotification } from '../utils/emailservice';

const contactsFilePath = path.join(__dirname, '../json/contacts.json');
const donorsFilePath = path.join(__dirname, '../json/donors.json');
const volunteersFilePath = path.join(__dirname, '../json/volunteers.json');

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
        error: {
          code: 'INVALID_REASON',
          message: 'Please select a valid reason for contact',
          field: 'reason'
        }
      });
    }

    if (!subject || subject.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SUBJECT',
          message: 'Subject must be at least 3 characters',
          field: 'subject'
        }
      });
    }

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MESSAGE',
          message: 'Message must be at least 10 characters',
          field: 'message'
        }
      });
    }

    // Read existing contacts
    let contacts: IContact[] = [];
    if (fs.existsSync(contactsFilePath)) {
      const fileData = fs.readFileSync(contactsFilePath, 'utf-8');
      contacts = JSON.parse(fileData);
    }

    // Create new contact
    const contactId = randomUUID();
    const newContact: IContact = {
      _id: contactId,
      name: name.trim(),
      organization: organization?.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      reason,
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      createdAt: new Date().toISOString()
    };

    // Add to contacts array
    contacts.push(newContact);

    // Save to contacts.json
    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2));

    // SMART CROSS-REFERENCING: Create leads based on reason
    let crossReference: any = null;

    if (reason === 'donation') {
      // Create a donor lead
      let donors: any[] = [];
      if (fs.existsSync(donorsFilePath)) {
        const donorsData = fs.readFileSync(donorsFilePath, 'utf-8');
        donors = JSON.parse(donorsData);
      }

      // Check if donor already exists
      const existingDonor = donors.find((d: any) => 
        d.email?.toLowerCase() === email.toLowerCase()
      );

      if (!existingDonor) {
        const donorLead = {
          _id: randomUUID(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim(),
          amount: 0, // No donation yet, just a lead
          donations: [],
          status: 'potential', // Lead status
          source: 'contact-form', // Track where they came from
          contactId: contactId, // Link back to contact form
          notes: `Interested in donation. Subject: ${subject}`,
          createdAt: new Date().toISOString()
        };

        donors.push(donorLead);
        fs.writeFileSync(donorsFilePath, JSON.stringify(donors, null, 2));
        crossReference = { type: 'donor-lead', id: donorLead._id };
      }
    }

    if (reason === 'volunteering') {
      // Create a volunteer lead
      let volunteers: any[] = [];
      if (fs.existsSync(volunteersFilePath)) {
        const volunteersData = fs.readFileSync(volunteersFilePath, 'utf-8');
        volunteers = JSON.parse(volunteersData);
      }

      // Check if volunteer already exists
      const existingVolunteer = volunteers.find((v: any) => 
        v.email?.toLowerCase() === email.toLowerCase()
      );

      if (!existingVolunteer) {
        const volunteerLead = {
          _id: randomUUID(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim(),
          location: organization || 'Not specified',
          basedIn: 'remote', // Default, can be updated
          availability: 'To be determined',
          interests: [], // Will be filled when they submit volunteer form
          status: 'interested', // Lead status
          source: 'contact-form', // Track where they came from
          contactId: contactId, // Link back to contact form
          notes: `Interested in volunteering. Subject: ${subject}`,
          createdAt: new Date().toISOString()
        };

        volunteers.push(volunteerLead);
        fs.writeFileSync(volunteersFilePath, JSON.stringify(volunteers, null, 2));
        crossReference = { type: 'volunteer-lead', id: volunteerLead._id };
      }
    }

    // Send confirmation email to user
    const confirmationHtml = generateContactConfirmationEmail(name, subject);
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
        reason,
        subject,
        message
      );
      await sendEmail({
        to: process.env.EMAIL_USER, // Send to organization's email
        subject: `🔔 New Contact Form: ${reason.toUpperCase()} - ${name}`,
        text: `New contact from ${name} (${email}) regarding ${reason}. Subject: ${subject}`,
        html: adminNotificationHtml
      });
    }

    // Return success response with cross-reference info
    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
      contact: {
        _id: newContact._id,
        name: newContact.name,
        email: newContact.email,
        subject: newContact.subject,
        reason: newContact.reason,
        createdAt: newContact.createdAt
      },
      ...(crossReference && {
        leadCreated: crossReference // Let frontend know a lead was created
      })
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
    if (!fs.existsSync(contactsFilePath)) {
      return res.json([]);
    }

    const fileData = fs.readFileSync(contactsFilePath, 'utf-8');
    const contacts = JSON.parse(fileData);

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

    if (!fs.existsSync(contactsFilePath)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    const fileData = fs.readFileSync(contactsFilePath, 'utf-8');
    const contacts = JSON.parse(fileData);
    const contact = contacts.find((c: IContact) => c._id === id);

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

    if (!fs.existsSync(contactsFilePath)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    const fileData = fs.readFileSync(contactsFilePath, 'utf-8');
    const contacts = JSON.parse(fileData);
    const contact = contacts.find((c: IContact) => c._id === id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    contact.status = status;
    if (status === 'responded') {
      contact.respondedAt = new Date().toISOString();
    }
    contact.updatedAt = new Date().toISOString();

    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2));

    res.json({
      success: true,
      message: 'Contact status updated',
      contact
    });
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

    if (!fs.existsSync(contactsFilePath)) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    const fileData = fs.readFileSync(contactsFilePath, 'utf-8');
    let contacts = JSON.parse(fileData);
    const initialLength = contacts.length;

    contacts = contacts.filter((c: IContact) => c._id !== id);

    if (contacts.length === initialLength) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }

    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2));

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to delete contact' }
    });
  }
};

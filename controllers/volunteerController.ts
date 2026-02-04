import { Request, Response } from 'express';
import { CreateVolunteerResponse, ErrorResponse } from '../contracts/donationContract';
import VolunteerModel from '../models/volunteer';
import { upsertContactInfo } from '../services/contactInfoService';

/**
 * Create a new volunteer interest submission
 * POST /api/volunteers
 */
export const createVolunteer = async (req: Request, res: Response) => {
  try {
    let volunteerData = req.body;
    
    // Map frontend field names to backend field names
    if (volunteerData.firstName && !volunteerData.name) {
      volunteerData.name = volunteerData.firstName + (volunteerData.lastName ? ' ' + volunteerData.lastName : '');
    }
    if (volunteerData.skills && !volunteerData.interests) {
      volunteerData.interests = volunteerData.skills;
    }
    
    // Map frontend basedIn display values to backend enum values
    const basedInMap: Record<string, string> = {
      'Nairobi/Kenya': 'nairobi',
      'Remote/International': 'remote',
      'nairobi': 'nairobi',
      'kenya': 'kenya',
      'remote': 'remote'
    };
    if (volunteerData.basedIn && basedInMap[volunteerData.basedIn]) {
      volunteerData.basedIn = basedInMap[volunteerData.basedIn];
    }

    // Validation
    if (!volunteerData.name || volunteerData.name.trim().length < 2) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_NAME',
          message: 'Name must be at least 2 characters',
          field: 'name'
        }
      };
      return res.status(400).json(errorResponse);
    }

    if (!volunteerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(volunteerData.email)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: 'Please enter a valid email address',
          field: 'email'
        }
      };
      return res.status(400).json(errorResponse);
    }

    if (!volunteerData.phone || !/^\+?[0-9]{10,15}$/.test(volunteerData.phone.replace(/[^\d\+]/g, ''))) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: 'Please enter a valid phone number',
          field: 'phone'
        }
      };
      return res.status(400).json(errorResponse);
    }

    if (!volunteerData.interests || volunteerData.interests.length === 0) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NO_INTERESTS',
          message: 'Please select at least one area of interest',
          field: 'interests'
        }
      };
      return res.status(400).json(errorResponse);
    }

    // Upsert ContactInfo and create volunteer referencing contactid
    const email = volunteerData.email.toLowerCase().trim();
    const phone = volunteerData.phone.trim();
    const name = volunteerData.name.trim();
    const contact = await upsertContactInfo({ name, email, phone, country: volunteerData.location?.trim() });

    const created = await VolunteerModel.create({
      name,
      email,
      phone,
      location: volunteerData.location.trim(),
      basedIn: volunteerData.basedIn,
      availability: volunteerData.availability?.trim() || '',
      interests: volunteerData.interests,
      otherInterest: volunteerData.otherInterest?.trim(),
      experience: volunteerData.experience?.trim(),
      languagesSpoken: volunteerData.languagesSpoken || [],
      status: 'pending',
      contactid: contact._id as any,
    });

    // Return success response with complete volunteer data
    const response: CreateVolunteerResponse = {
      success: true,
      message: 'Thank you for your interest in volunteering with ADE! We will contact you soon.',
      volunteer: {
        _id: String(created._id),
        name: created.name,
        email: created.email,
        phone: created.phone,
        location: created.location,
        basedIn: created.basedIn,
        interests: created.interests as any,
        otherInterest: created.otherInterest,
        availability: created.availability || 'Not specified',
        createdAt: created.createdAt?.toISOString?.() || new Date().toISOString()
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating volunteer:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to submit volunteer interest. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Get all volunteer submissions
 * GET /api/volunteers
 */
export const getAllVolunteers = async (req: Request, res: Response) => {
  try {
    const volunteers = await VolunteerModel.find().populate('contactid');
    res.json(volunteers);
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch volunteers',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Get a single volunteer by ID
 * GET /api/volunteers/:id
 */
export const getVolunteerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const volunteer = await VolunteerModel.findById(id).populate('contactid');
    if (!volunteer) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Volunteer not found'
        }
      };
      return res.status(404).json(errorResponse);
    }

    res.json(volunteer);
  } catch (error) {
    console.error('Error fetching volunteer:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch volunteer',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
    res.status(500).json(errorResponse);
  }
};

/**
 * Delete a volunteer submission
 * DELETE /api/volunteers/:id
 */
export const deleteVolunteer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await VolunteerModel.findByIdAndDelete(id);
    if (!deleted) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Volunteer not found'
        }
      };
      return res.status(404).json(errorResponse);
    }

    res.json({ success: true, message: 'Volunteer deleted successfully' });
  } catch (error) {
    console.error('Error deleting volunteer:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete volunteer',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    };
    res.status(500).json(errorResponse);
  }
};

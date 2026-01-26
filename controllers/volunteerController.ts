import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CreateVolunteerRequest, CreateVolunteerResponse, ErrorResponse } from '../contracts/donationContract';
import { Volunteer } from '../models/volunteer';

const volunteersFilePath = path.join(__dirname, '../json/volunteers.json');

/**
 * Create a new volunteer interest submission
 * POST /api/volunteers
 */
export const createVolunteer = async (req: Request, res: Response) => {
  try {
    const volunteerData: CreateVolunteerRequest = req.body;

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

    if (!volunteerData.phone || !/^\+?[0-9]{10,15}$/.test(volunteerData.phone)) {
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

    if (!volunteerData.location || volunteerData.location.trim().length < 2) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_LOCATION',
          message: 'Please enter your location',
          field: 'location'
        }
      };
      return res.status(400).json(errorResponse);
    }

    if (!volunteerData.basedIn || !['nairobi', 'kenya', 'remote'].includes(volunteerData.basedIn)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'INVALID_BASED_IN',
          message: 'Please select where you are based',
          field: 'basedIn'
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

    // Read existing volunteers
    let volunteers: Volunteer[] = [];
    if (fs.existsSync(volunteersFilePath)) {
      const fileData = fs.readFileSync(volunteersFilePath, 'utf-8');
      volunteers = JSON.parse(fileData);
    }

    // Create new volunteer record
    const newVolunteer: Volunteer = {
      _id: uuidv4(),
      name: volunteerData.name.trim(),
      email: volunteerData.email.toLowerCase().trim(),
      phone: volunteerData.phone.trim(),
      location: volunteerData.location.trim(),
      basedIn: volunteerData.basedIn,
      availability: volunteerData.availability?.trim() || '',
      interests: volunteerData.interests,
      otherInterest: volunteerData.otherInterest?.trim(),
      experience: volunteerData.experience?.trim(),
      languagesSpoken: volunteerData.languagesSpoken || [],
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Add to volunteers array
    volunteers.push(newVolunteer);

    // Save to file
    fs.writeFileSync(volunteersFilePath, JSON.stringify(volunteers, null, 2));

    // Return success response with complete volunteer data
    const response: CreateVolunteerResponse = {
      success: true,
      message: 'Thank you for your interest in volunteering with ADE! We will contact you soon.',
      volunteer: {
        _id: newVolunteer._id,
        name: newVolunteer.name,
        email: newVolunteer.email,
        phone: newVolunteer.phone,
        location: newVolunteer.location,
        basedIn: newVolunteer.basedIn,
        interests: newVolunteer.interests,
        otherInterest: newVolunteer.otherInterest,
        availability: newVolunteer.availability || 'Not specified',
        createdAt: newVolunteer.createdAt
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
    if (!fs.existsSync(volunteersFilePath)) {
      return res.json([]);
    }

    const fileData = fs.readFileSync(volunteersFilePath, 'utf-8');
    const volunteers = JSON.parse(fileData);

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

    if (!fs.existsSync(volunteersFilePath)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Volunteer not found'
        }
      };
      return res.status(404).json(errorResponse);
    }

    const fileData = fs.readFileSync(volunteersFilePath, 'utf-8');
    const volunteers = JSON.parse(fileData);
    const volunteer = volunteers.find((v: any) => v._id === id);

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

    if (!fs.existsSync(volunteersFilePath)) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Volunteer not found'
        }
      };
      return res.status(404).json(errorResponse);
    }

    const fileData = fs.readFileSync(volunteersFilePath, 'utf-8');
    let volunteers = JSON.parse(fileData);
    const initialLength = volunteers.length;

    volunteers = volunteers.filter((v: any) => v._id !== id);

    if (volunteers.length === initialLength) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Volunteer not found'
        }
      };
      return res.status(404).json(errorResponse);
    }

    fs.writeFileSync(volunteersFilePath, JSON.stringify(volunteers, null, 2));

    res.json({
      success: true,
      message: 'Volunteer deleted successfully'
    });
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

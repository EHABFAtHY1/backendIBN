import { Request, Response } from 'express';
import ContactMessage from '../models/ContactMessage';
import { AppError } from '../utils/AppError';

/**
 * Submit a contact message
 * POST /api/contact
 */
export const submitContactMessage = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !subject || !message) {
            throw new AppError('All fields are required', 400);
        }

        // Create new contact message
        const contactMessage = await ContactMessage.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            subject: subject.trim(),
            message: message.trim(),
            status: 'new',
        });

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: {
                id: contactMessage._id,
                name: contactMessage.name,
                email: contactMessage.email,
                createdAt: contactMessage.createdAt,
            },
        });
    } catch (error: any) {
        if (error.isOperational) {
            throw error;
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            throw new AppError(messages.join(', '), 400);
        }

        throw new AppError(error.message || 'Error submitting contact message', 500);
    }
};

/**
 * Get all contact messages (Admin only)
 * GET /api/contact
 */
export const getAllContactMessages = async (req: Request, res: Response) => {
    try {
        const { status, sortBy = '-createdAt', limit = '10', page = '1' } = req.query;

        // Build filter
        const filter: any = {};
        if (status && ['new', 'read', 'replied'].includes(status as string)) {
            filter.status = status;
        }

        // Pagination
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;

        // Get messages
        const messages = await ContactMessage.find(filter)
            .sort(sortBy as string)
            .skip(skip)
            .limit(limitNum)
            .lean();

        // Get total count
        const total = await ContactMessage.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: messages,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error: any) {
        throw new AppError(error.message || 'Error fetching messages', 500);
    }
};

/**
 * Get single contact message by ID (Admin only)
 * GET /api/contact/:id
 */
export const getContactMessageById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const message = await ContactMessage.findById(id);

        if (!message) {
            throw new AppError('Contact message not found', 404);
        }

        // Mark as read if it's new
        if (message.status === 'new') {
            message.status = 'read';
            await message.save();
        }

        res.status(200).json({
            success: true,
            data: message,
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid contact message ID', 400);
        }
        throw new AppError(error.message || 'Error fetching message', 500);
    }
};

/**
 * Update contact message status (Admin only)
 * PATCH /api/contact/:id
 */
export const updateContactMessageStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!status || !['new', 'read', 'replied'].includes(status)) {
            throw new AppError('Invalid status. Must be one of: new, read, replied', 400);
        }

        const message = await ContactMessage.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!message) {
            throw new AppError('Contact message not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Message status updated',
            data: message,
        });
    } catch (error: any) {
        if (error.isOperational) {
            throw error;
        }
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid contact message ID', 400);
        }
        throw new AppError(error.message || 'Error updating message', 500);
    }
};

/**
 * Delete contact message (Admin only)
 * DELETE /api/contact/:id
 */
export const deleteContactMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const message = await ContactMessage.findByIdAndDelete(id);

        if (!message) {
            throw new AppError('Contact message not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'Contact message deleted successfully',
        });
    } catch (error: any) {
        if (error.kind === 'ObjectId') {
            throw new AppError('Invalid contact message ID', 400);
        }
        throw new AppError(error.message || 'Error deleting message', 500);
    }
};

/**
 * Get contact message statistics (Admin only)
 * GET /api/contact/stats/overview
 */
export const getContactStats = async (req: Request, res: Response) => {
    try {
        const stats = await ContactMessage.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const total = await ContactMessage.countDocuments();
        const newMessages = await ContactMessage.countDocuments({ status: 'new' });

        res.status(200).json({
            success: true,
            data: {
                total,
                newMessages,
                byStatus: stats.reduce((acc: any, item: any) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
            },
        });
    } catch (error: any) {
        throw new AppError(error.message || 'Error fetching stats', 500);
    }
};

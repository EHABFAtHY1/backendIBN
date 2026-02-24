import { Request, Response, NextFunction } from 'express';
import Partner from '../models/Partner';
import { AppError } from '../utils/AppError';
import {
    PaginationDto,
    createPaginatedResponse,
    buildMongoDBQuery,
    parseSortString,
    parseFieldsString,
    parsePaginationParams,
} from '../dtos/PaginationDto';

/**
 * GET /api/partners
 */
export async function getPartners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['name', 'description'];
        const query = buildMongoDBQuery({ ...dto, isVisible: true }, searchFields);

        const total = await Partner.countDocuments(query);

        let dbQuery: any = Partner.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const partners = await dbQuery.exec();

        res.json(
            createPaginatedResponse(partners, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/partners/all (admin)
 */
export async function getAllPartners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['name', 'description'];
        const query = buildMongoDBQuery(dto, searchFields);

        const total = await Partner.countDocuments(query);

        let dbQuery: any = Partner.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const partners = await dbQuery.exec();

        res.json(
            createPaginatedResponse(partners, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/partners
 */
export async function createPartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partner = await Partner.create(req.body);
        res.status(201).json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/partners/:id
 */
export async function updatePartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partner = await Partner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!partner) {
            throw new AppError('Partner not found.', 404);
        }
        res.json({ success: true, data: partner });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/partners/:id
 */
export async function deletePartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const partner = await Partner.findByIdAndDelete(req.params.id);
        if (!partner) {
            throw new AppError('Partner not found.', 404);
        }
        res.json({ success: true, message: 'Partner deleted.' });
    } catch (error) {
        next(error);
    }
}

import { Request, Response, NextFunction } from 'express';
import Service from '../models/Service';
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
 * GET /api/services
 * Query params:
 *   - page, size, search, sort, fields, isVisible
 */
export async function getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['title', 'description'];
        const query = buildMongoDBQuery({ ...dto, isVisible: true }, searchFields);

        const total = await Service.countDocuments(query);

        let dbQuery: any = Service.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const services = await dbQuery.exec();

        res.json(
            createPaginatedResponse(services, total, page, size, {
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
 * GET /api/services/all (admin)
 */
export async function getAllServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['title', 'description'];
        const query = buildMongoDBQuery(dto, searchFields);

        const total = await Service.countDocuments(query);

        let dbQuery: any = Service.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            const fieldsObj = parseFieldsString(dto.fields);
            dbQuery = dbQuery.select(fieldsObj);
        }

        const services = await dbQuery.exec();

        res.json(
            createPaginatedResponse(services, total, page, size, {
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
 * GET /api/services/:slug
 */
export async function getServiceBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.findOne({ slug: req.params.slug });
        if (!service) {
            throw new AppError('Service not found.', 404);
        }
        res.json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/services
 */
export async function createService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.create(req.body);
        res.status(201).json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
}

/**
 * PUT /api/services/:id
 */
export async function updateService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!service) {
            throw new AppError('Service not found.', 404);
        }
        res.json({ success: true, data: service });
    } catch (error) {
        next(error);
    }
}

/**
 * DELETE /api/services/:id
 */
export async function deleteService(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            throw new AppError('Service not found.', 404);
        }
        res.json({ success: true, message: 'Service deleted.' });
    } catch (error) {
        next(error);
    }
}

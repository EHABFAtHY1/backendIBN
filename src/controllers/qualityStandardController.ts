import { Request, Response, NextFunction } from 'express';
import QualityStandard from '../models/QualityStandard';
import { AppError } from '../utils/AppError';
import {
    PaginationDto,
    createPaginatedResponse,
    buildMongoDBQuery,
    parseSortString,
    parseFieldsString,
    parsePaginationParams,
} from '../dtos/PaginationDto';

export async function getQualityStandards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['titleAr', 'titleEn', 'descriptionAr', 'descriptionEn'];
        const query = buildMongoDBQuery({ ...dto, isVisible: true }, searchFields);

        const total = await QualityStandard.countDocuments(query);

        let dbQuery: any = QualityStandard.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            dbQuery = dbQuery.select(parseFieldsString(dto.fields));
        }

        const qualityStandards = await dbQuery.exec();

        res.json(
            createPaginatedResponse(qualityStandards, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}

export async function getAllQualityStandards(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const dto = req.query as PaginationDto;
        const { page, size, skip } = parsePaginationParams(req.query);

        const searchFields = ['titleAr', 'titleEn', 'descriptionAr', 'descriptionEn'];
        const query = buildMongoDBQuery(dto, searchFields);

        const total = await QualityStandard.countDocuments(query);

        let dbQuery: any = QualityStandard.find(query)
            .sort(parseSortString(dto.sort || 'order'))
            .skip(skip)
            .limit(size);

        if (dto.fields) {
            dbQuery = dbQuery.select(parseFieldsString(dto.fields));
        }

        const qualityStandards = await dbQuery.exec();

        res.json(
            createPaginatedResponse(qualityStandards, total, page, size, {
                search: dto.search,
                sort: dto.sort,
                fields: dto.fields,
            })
        );
    } catch (error) {
        next(error);
    }
}

export async function createQualityStandard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const qualityStandard = await QualityStandard.create(req.body);
        res.status(201).json({ success: true, data: qualityStandard });
    } catch (error) {
        next(error);
    }
}

export async function updateQualityStandard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const qualityStandard = await QualityStandard.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!qualityStandard) {
            throw new AppError('Quality standard not found.', 404);
        }

        res.json({ success: true, data: qualityStandard });
    } catch (error) {
        next(error);
    }
}

export async function deleteQualityStandard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const qualityStandard = await QualityStandard.findByIdAndDelete(req.params.id);

        if (!qualityStandard) {
            throw new AppError('Quality standard not found.', 404);
        }

        res.json({ success: true, message: 'Quality standard deleted.' });
    } catch (error) {
        next(error);
    }
}

/**
 * DTO (Data Transfer Object) للـ Pagination والـ Filtering والـ Searching
 * يمكن استخدامه مع جميع الـ endpoints
 */

/**
 * Base DTO for pagination, filtering, and searching parameters
 * يدعم:
 * - Pagination (page, size)
 * - Searching (search في أي حقل نصي)
 * - Filtering (filter حسب حقول محددة)
 * - Field Selection (اختيار الحقول المطلوبة)
 * - Sorting (ترتيب النتائج)
 */
export class PaginationDto {
    page?: number; // الصفحة (ابدأ من 1)
    size?: number; // عدد العناصر في الصفحة
    search?: string; // البحث في الحقول النصية
    sort?: string; // الترتيب (مثال: "name,-createdAt")
    fields?: string; // الحقول المطلوبة (comma-separated)
    [key: string]: any; // لدعم الفلاتر الديناميكية
}

/**
 * Standard paginated response structure
 */
export interface PaginatedResponseDto<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        size: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    filters?: {
        search?: string;
        sort?: string;
        fields?: string;
        [key: string]: any;
    };
}

/**
 * Helper function to create paginated response
 */
export function createPaginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    size: number,
    filters?: { search?: string; sort?: string; fields?: string;[key: string]: any }
): PaginatedResponseDto<T> {
    return {
        success: true,
        data,
        pagination: {
            total,
            page,
            size,
            totalPages: Math.ceil(total / size),
            hasNextPage: page < Math.ceil(total / size),
            hasPrevPage: page > 1,
        },
        filters: filters ? { search: filters.search, sort: filters.sort, fields: filters.fields } : undefined,
    };
}

/**
 * Helper function to build MongoDB query from filters
 * يساعد في بناء استعلام MongoDB من معاملات الاستعلام
 */
export function buildMongoDBQuery(dto: PaginationDto, searchFields: string[] = []): any {
    const query: any = {};

    // معالجة البحث
    if (dto.search && searchFields.length > 0) {
        query.$or = searchFields.map((field) => ({
            [field]: { $regex: dto.search, $options: 'i' }, // البحث غير حساس لحالة الأحرف
        }));
    }

    // معالجة الفلاتر الأخرى (استبعاد الحقول الخاصة)
    const excludeFields = ['page', 'size', 'search', 'sort', 'fields'];
    for (const key in dto) {
        if (!excludeFields.includes(key) && dto[key] !== undefined) {
            // معالجة الفلاتر المختلفة
            if (key.includes('_gte')) {
                // Greater than or equal
                const fieldName = key.replace('_gte', '');
                query[fieldName] = { ...query[fieldName], $gte: dto[key] };
            } else if (key.includes('_lte')) {
                // Less than or equal
                const fieldName = key.replace('_lte', '');
                query[fieldName] = { ...query[fieldName], $lte: dto[key] };
            } else if (key.includes('_gt')) {
                // Greater than
                const fieldName = key.replace('_gt', '');
                query[fieldName] = { ...query[fieldName], $gt: dto[key] };
            } else if (key.includes('_lt')) {
                // Less than
                const fieldName = key.replace('_lt', '');
                query[fieldName] = { ...query[fieldName], $lt: dto[key] };
            } else if (key.includes('_in')) {
                // In array
                const fieldName = key.replace('_in', '');
                query[fieldName] = { $in: Array.isArray(dto[key]) ? dto[key] : [dto[key]] };
            } else if (key.includes('_exists')) {
                // Field exists
                const fieldName = key.replace('_exists', '');
                query[fieldName] = { $exists: dto[key] === 'true' || dto[key] === true };
            } else {
                // Exact match
                query[key] = dto[key];
            }
        }
    }

    return query;
}

/**
 * Helper function to parse sort string
 * مثال: "name,-createdAt" -> { name: 1, createdAt: -1 }
 */
export function parseSortString(sortString?: string): any {
    if (!sortString) return { createdAt: -1 }; // الترتيب الافتراضي

    const sortObj: any = {};
    const fields = sortString.split(',');

    for (const field of fields) {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
            sortObj[trimmed.substring(1)] = -1; // ترتيب تنازلي
        } else {
            sortObj[trimmed] = 1; // ترتيب تصاعدي
        }
    }

    return sortObj;
}

/**
 * Helper function to select specific fields
 * مثال: "id,name,email" -> { id: 1, name: 1, email: 1 }
 */
export function parseFieldsString(fieldsString?: string): any {
    if (!fieldsString) return null; // إرجاع جميع الحقول

    const fieldsObj: any = {};
    const fields = fieldsString.split(',');

    for (const field of fields) {
        const trimmed = field.trim();
        if (trimmed.startsWith('-')) {
            fieldsObj[trimmed.substring(1)] = 0; // استبعاد الحقل
        } else {
            fieldsObj[trimmed] = 1; // تضمين الحقل
        }
    }

    return fieldsObj;
}

/**
 * Helper function to validate and parse pagination parameters
 */
export function parsePaginationParams(query: any): {
    page: number;
    size: number;
    skip: number;
} {
    let page = parseInt(query.page) || 1;
    let size = parseInt(query.size) || 10;

    // التحقق من الحدود
    page = Math.max(1, page);
    size = Math.max(1, Math.min(100, size)); // max 100 items per page

    const skip = (page - 1) * size;

    return { page, size, skip };
}

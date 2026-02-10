/**
 * Helper to extract a localized string from a bilingual field.
 * If the requested language is not available, falls back to the other.
 */
export function localize(
    field: { ar?: string; en?: string } | string | undefined,
    lang: 'ar' | 'en' = 'ar'
): string {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return field[lang] || field.ar || field.en || '';
}

/**
 * Recursively localize all bilingual fields in an object or array.
 */
export function localizeDocument(doc: any, lang: 'ar' | 'en' = 'ar'): any {
    if (!doc) return doc;
    if (Array.isArray(doc)) {
        return doc.map((item) => localizeDocument(item, lang));
    }
    if (typeof doc === 'object' && doc !== null) {
        // Check if this is a bilingual field { ar, en }
        if (
            Object.keys(doc).length <= 2 &&
            (doc.ar !== undefined || doc.en !== undefined) &&
            typeof doc.ar === 'string'
        ) {
            return localize(doc, lang);
        }
        const result: any = {};
        for (const key of Object.keys(doc)) {
            result[key] = localizeDocument(doc[key], lang);
        }
        return result;
    }
    return doc;
}

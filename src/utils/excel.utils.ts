import { utils, writeFile } from 'xlsx';

/**
 * Defines a column in the excel export
 */
export interface ExcelColumn<T> {
    header: string;
    key: keyof T | ((item: T) => string | number | null | undefined);
    width?: number; // Approximate width in characters
}

/**
 * Generic function to export data to Excel
 * @param data Array of data objects
 * @param columns Column definitions
 * @param fileName Name of the file (without extension)
 * @param sheetName Name of the sheet
 */
export function exportToExcel<T>(
    data: T[],
    columns: ExcelColumn<T>[],
    fileName: string = 'Report',
    sheetName: string = 'Data'
) {
    // Early exit if no data
    if (!data?.length) return;

    // 1. Map data to rows based on column definitions
    const rows = data.map(item => 
        columns.reduce((row, col) => {
            const value = typeof col.key === 'function' 
                ? col.key(item) 
                : (item as any)[col.key];
            
            row[col.header] = value as string | number | null | undefined;
            return row;
        }, {} as Record<string, string | number | null | undefined>)
    );

    // 2. Create worksheet
    const worksheet = utils.json_to_sheet(rows);

    // 3. Set column widths if provided
    if (columns.some(col => col.width)) {
        worksheet['!cols'] = columns.map(col => ({ wch: col.width || 10 }));
    }

    // 4. Create workbook
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31)); // Max 31 chars for sheet name

    // 5. Generate file name with date if needed, ensuring .xlsx extension
    const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

    // 6. Write file (triggers download in browser)
    writeFile(workbook, safeFileName);
}

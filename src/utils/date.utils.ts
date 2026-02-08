import { formatInTimeZone } from 'date-fns-tz';

export const formatDateToLima = (date: Date | string): string => {
    return formatInTimeZone(date, 'America/Lima', "yyyy-MM-dd'T'HH:mm:ssXXX");
};

export const formatDateToUTC = (date: Date | string): string => {
    return formatInTimeZone(date, 'UTC', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
};

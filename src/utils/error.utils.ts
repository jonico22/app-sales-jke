export interface ErrorResponse {
    success: boolean;
    message: string;
    errors?: string | any;
}

export function parseBackendError(error: any): string {
    if (!error) return 'Ocurrió un error desconocido';

    // 1. Direct string error
    if (typeof error === 'string') return error;

    // 2. Standard Axios error response
    if (error.response?.data) {
        const data = error.response.data as ErrorResponse;

        // Check for nested "errors" string that might be JSON
        if (data.errors && typeof data.errors === 'string') {
            // Check for "HTTP 500: {...}" pattern
            if (data.errors.includes('HTTP')) {
                try {
                    // Extract JSON part after first colon
                    const jsonPart = data.errors.substring(data.errors.indexOf('{'));
                    const parsed = JSON.parse(jsonPart);
                    // Prioritize 'error' field, then 'message'
                    return parsed.error || parsed.message || data.errors;
                } catch (e) {
                    // Fallback to raw string if parsing fails
                    return data.errors;
                }
            }
            return data.errors;
        }

        return data.message || 'Error en el servidor';
    }

    // 3. Simple message property
    if (error.message) return error.message;

    return 'Error de conexión o desconocido';
}

import type { ZodError } from 'zod';

/**
 * Parsea los errores de validación de Zod en un objeto para facilitar su acceso en la UI.
 * 
 * @param result El resultado de `schema.safeParse` que falló
 * @returns Un objeto con los mensajes de error mapeados por campo
 */
export function parseZodErrors(result: { success: boolean; error?: ZodError }): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (!result.success && result.error) {
    result.error.issues.forEach((issue) => {
      const fieldName = issue.path[0]?.toString();
      if (fieldName) {
        fieldErrors[fieldName] = issue.message;
      }
    });
  }
  return fieldErrors;
}

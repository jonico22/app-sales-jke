/**
 * Parsea los errores de validación de Zod en un objeto para facilitar su acceso en la UI.
 * 
 * @param result El resultado de `schema.safeParse` que falló
 * @returns Un objeto con los mensajes de error mapeados por campo
 */
export function parseZodErrors(result: any): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  if (result && !result.success && result.error && result.error.issues) {
    result.error.issues.forEach((issue: any) => {
      if (issue.path && issue.path.length > 0) {
        fieldErrors[issue.path[0].toString()] = issue.message;
      }
    });
  }
  return fieldErrors;
}

import { describe, it, expect } from 'vitest';
import { parseZodErrors } from './auth.utils';

describe('parseZodErrors', () => {
  it('maps zod issues by field name', () => {
    const result = {
      success: false,
      error: {
        issues: [
          { path: ['email'], message: 'Correo inválido' },
          { path: ['password'], message: 'Contraseña inválida' },
        ],
      },
    } as never;

    expect(parseZodErrors(result)).toEqual({
      email: 'Correo inválido',
      password: 'Contraseña inválida',
    });
  });

  it('returns an empty object when parsing succeeded', () => {
    expect(parseZodErrors({ success: true })).toEqual({});
  });
});

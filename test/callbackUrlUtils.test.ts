import { describe, expect, it } from 'vitest';

import { sanitizeCallbackUrl } from '@/utils/callbackUrlUtils';

/*
 * El destino al que vuelve el login sale de la query, así que lo escribe quien manda el enlace.
 *
 * Lo que se prueba aquí no es el caso bonito, sino las formas de escribir «otro dominio» que parecen una ruta
 * de casa. Dejar pasar una sola convierte nuestra pantalla de login en el trampolín a una copia de sí misma.
 */
describe('sanitizeCallbackUrl', () => {
  it('acepta una ruta relativa del propio portal', () => {
    expect(sanitizeCallbackUrl('/private-area')).toBe('/private-area');
    expect(sanitizeCallbackUrl('/private-area/invoices?page=2')).toBe(
      '/private-area/invoices?page=2',
    );
    expect(sanitizeCallbackUrl('/private-area#facturas')).toBe('/private-area#facturas');
  });

  it('rechaza URLs absolutas', () => {
    expect(sanitizeCallbackUrl('https://evil.example/phishing')).toBeNull();
    expect(sanitizeCallbackUrl('http://evil.example')).toBeNull();
  });

  it('rechaza rutas protocol-relative', () => {
    expect(sanitizeCallbackUrl('//evil.example/login')).toBeNull();
  });

  /** Empieza por una sola `/` y no por `//`: se colaba por la comprobación que había en `LoginForm`. */
  it('rechaza la contrabarra, que el navegador lee como si fuera una barra', () => {
    expect(sanitizeCallbackUrl('/\\evil.example/login')).toBeNull();
    expect(sanitizeCallbackUrl('/\\/evil.example')).toBeNull();
  });

  it('rechaza los caracteres de control, que el navegador quita antes de leer la URL', () => {
    expect(sanitizeCallbackUrl('/\t/evil.example')).toBeNull();
    expect(sanitizeCallbackUrl('/\n/evil.example')).toBeNull();
  });

  it('rechaza esquemas ejecutables y rutas que no empiezan por /', () => {
    expect(sanitizeCallbackUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeCallbackUrl('private-area')).toBeNull();
  });

  it('trata la ausencia de valor como que no hay destino', () => {
    expect(sanitizeCallbackUrl(null)).toBeNull();
    expect(sanitizeCallbackUrl(undefined)).toBeNull();
    expect(sanitizeCallbackUrl('')).toBeNull();
  });
});

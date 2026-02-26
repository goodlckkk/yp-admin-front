/**
 * Utilidades para validación y formateo de RUT chileno
 * 
 * Usado por:
 * - patientform.tsx (formulario web público)
 * - ManualPatientForm.tsx (formulario manual del dashboard)
 * 
 * El algoritmo módulo 11 verifica que el dígito verificador (último carácter)
 * sea matemáticamente correcto respecto al número base del RUT.
 * 
 * Ejemplo:
 *   RUT 12.345.678-5 → cuerpo=12345678, dv=5
 *   Se multiplica cada dígito de derecha a izquierda por 2,3,4,5,6,7,2,3...
 *   Se suma todo, se calcula 11 - (suma % 11), y se compara con el dv.
 */

/**
 * Limpia un RUT eliminando puntos, guiones y espacios.
 * Retorna solo dígitos y K/k.
 */
export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '')
}

/**
 * Formatea un RUT con puntos y guión: 12.345.678-9
 * Acepta entrada con o sin formato previo.
 */
export function formatRut(value: string): string {
  const cleaned = cleanRut(value)
  if (cleaned.length <= 1) return cleaned

  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1)
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formattedBody}-${dv}`
}

/**
 * Calcula el dígito verificador esperado para un cuerpo de RUT.
 * Algoritmo módulo 11 oficial de Chile.
 * 
 * @param body - Solo los dígitos del RUT sin el dígito verificador
 * @returns El dígito verificador calculado ('0'-'9' o 'K')
 */
function calculateVerifierDigit(body: string): string {
  let sum = 0
  let multiplier = 2

  // Recorrer de derecha a izquierda, multiplicando por 2,3,4,5,6,7,2,3...
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = 11 - (sum % 11)
  if (remainder === 11) return '0'
  if (remainder === 10) return 'K'
  return remainder.toString()
}

/**
 * Valida un RUT chileno completo (formato + dígito verificador).
 * 
 * @param rut - RUT con o sin formato (ej: "12.345.678-5" o "123456785")
 * @returns Objeto con { valid, error? }
 *   - valid: true si el RUT es válido
 *   - error: mensaje de error en español si es inválido
 */
export function validateRutModulo11(rut: string): { valid: boolean; error?: string } {
  if (!rut || !rut.trim()) {
    return { valid: false, error: 'El RUT es obligatorio' }
  }

  const cleaned = cleanRut(rut)

  // Verificar longitud: 8 o 9 caracteres (7-8 dígitos + 1 dv)
  if (cleaned.length < 8 || cleaned.length > 9) {
    return { valid: false, error: 'El RUT debe tener entre 8 y 9 caracteres' }
  }

  const body = cleaned.slice(0, -1)
  const dv = cleaned.slice(-1).toUpperCase()

  // Verificar que el cuerpo solo tenga dígitos
  if (!/^\d+$/.test(body)) {
    return { valid: false, error: 'El RUT contiene caracteres inválidos' }
  }

  // Verificar que el dv sea dígito o K
  if (!/^[0-9K]$/.test(dv)) {
    return { valid: false, error: 'El dígito verificador es inválido' }
  }

  // Calcular y comparar dígito verificador
  const expectedDv = calculateVerifierDigit(body)
  if (expectedDv !== dv) {
    return { valid: false, error: 'El RUT ingresado no es válido (dígito verificador incorrecto)' }
  }

  return { valid: true }
}

/**
 * DTOs para el módulo de Reportes de Analista
 * Validación de parámetros de entrada para filtros
 */

/**
 * DTO para filtrar transacciones por fechas
 */
export interface FilterTransaccionesDTO {
  fecha_inicio?: string;  // Formato: 'YYYY-MM-DD'
  fecha_fin?: string;     // Formato: 'YYYY-MM-DD'
  tipo_accion?: 'COMPRA' | 'VENTA' | 'LIQUIDAR_TODO';  // Opcional: filtrar por tipo
}

/**
 * DTO para filtrar distribución de acciones
 */
export interface FilterDistribucionDTO {
  id_mercado?: number;    // NULL = todos los mercados, o ID específico
  nivel: 'empresa' | 'mercado';  // Agrupar por empresa o mercado
}

/**
 * Validador de fechas
 */
export class ValidadorFechas {
  /**
   * Valida que la fecha tenga formato correcto YYYY-MM-DD
   */
  static esFechaValida(fecha: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;
    
    const date = new Date(fecha);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Valida que fecha_inicio <= fecha_fin
   */
  static rangoValido(fecha_inicio: string, fecha_fin: string): boolean {
    const inicio = new Date(fecha_inicio);
    const fin = new Date(fecha_fin);
    return inicio <= fin;
  }
}

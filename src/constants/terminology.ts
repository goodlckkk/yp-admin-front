/**
 * Terminología oficial de la aplicación
 * 
 * Centraliza todos los términos usados en la interfaz para facilitar
 * cambios futuros y mantener consistencia.
 * 
 * @module terminology
 */

/**
 * Términos principales de la aplicación
 */
export const TERMINOLOGY = {
  /** Término principal para referirse a los estudios */
  TRIAL: {
    singular: 'estudio clínico',
    plural: 'estudios clínicos',
    singularCapitalized: 'Estudio Clínico',
    pluralCapitalized: 'Estudios Clínicos',
  },
  
  /** Términos relacionados con pacientes */
  PATIENT: {
    singular: 'paciente',
    plural: 'pacientes',
    singularCapitalized: 'Paciente',
    pluralCapitalized: 'Pacientes',
  },
  
  /** Términos relacionados con instituciones */
  INSTITUTION: {
    singular: 'institución',
    plural: 'instituciones',
    singularCapitalized: 'Institución',
    pluralCapitalized: 'Instituciones',
  },
  
  /** Términos relacionados con patrocinadores */
  SPONSOR: {
    singular: 'patrocinador',
    plural: 'patrocinadores',
    singularCapitalized: 'Patrocinador',
    pluralCapitalized: 'Patrocinadores',
    types: {
      sponsor: 'Sponsor',
      cro: 'CRO',
    },
  },
  
  /** Acciones comunes */
  ACTIONS: {
    postulate: 'Postular',
    register: 'Registrar',
    edit: 'Editar',
    delete: 'Eliminar',
    view: 'Ver',
    create: 'Crear',
    save: 'Guardar',
    cancel: 'Cancelar',
    search: 'Buscar',
    filter: 'Filtrar',
  },
} as const;

/**
 * Helper para obtener el término correcto de estudio clínico
 */
export const getTrial = (capitalized: boolean = false, plural: boolean = false): string => {
  if (capitalized) {
    return plural ? TERMINOLOGY.TRIAL.pluralCapitalized : TERMINOLOGY.TRIAL.singularCapitalized;
  }
  return plural ? TERMINOLOGY.TRIAL.plural : TERMINOLOGY.TRIAL.singular;
};

/**
 * Helper para obtener el término correcto de paciente
 */
export const getPatient = (capitalized: boolean = false, plural: boolean = false): string => {
  if (capitalized) {
    return plural ? TERMINOLOGY.PATIENT.pluralCapitalized : TERMINOLOGY.PATIENT.singularCapitalized;
  }
  return plural ? TERMINOLOGY.PATIENT.plural : TERMINOLOGY.PATIENT.singular;
};

export default TERMINOLOGY;

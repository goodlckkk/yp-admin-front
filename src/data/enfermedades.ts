export interface Enfermedad {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  prevalencia?: string;
  sintomas?: string[];
}

export const enfermedadesComunes: Enfermedad[] = [
  {
    id: "hipertension",
    nombre: "Hipertensión Arterial",
    descripcion: "La hipertensión arterial es una condición crónica en la que la presión de la sangre en las arterias es persistentemente elevada. Es uno de los principales factores de riesgo cardiovascular en Chile, afectando a aproximadamente el 27% de la población adulta. El diagnóstico temprano y el tratamiento adecuado son fundamentales para prevenir complicaciones como infarto al miocardio, accidente cerebrovascular y enfermedad renal crónica.",
    categoria: "Cardiovascular",
    prevalencia: "27% de la población adulta chilena",
    sintomas: ["Dolor de cabeza", "Mareos", "Visión borrosa", "Fatiga", "Palpitaciones"]
  },
  {
    id: "diabetes",
    nombre: "Diabetes Mellitus Tipo 2",
    descripcion: "La diabetes tipo 2 es una enfermedad metabólica crónica caracterizada por niveles elevados de glucosa en sangre. En Chile, afecta al 12.3% de la población adulta según la Encuesta Nacional de Salud. Esta condición está estrechamente relacionada con el sobrepeso, la obesidad y el sedentarismo. El manejo incluye cambios en el estilo de vida, medicamentos y en algunos casos insulina.",
    categoria: "Endocrina",
    prevalencia: "12.3% de la población adulta",
    sintomas: ["Sed excesiva", "Micción frecuente", "Hambre constante", "Fatiga", "Visión borrosa", "Cicatrización lenta"]
  },
  {
    id: "obesidad",
    nombre: "Obesidad",
    descripcion: "La obesidad es una enfermedad crónica caracterizada por el exceso de grasa corporal. Chile presenta una de las tasas más altas de obesidad en América Latina, con un 31.2% de la población adulta afectada. Es un factor de riesgo importante para diabetes, enfermedades cardiovasculares, algunos tipos de cáncer y problemas articulares. El tratamiento incluye cambios en la alimentación, actividad física y en casos específicos, intervenciones médicas o quirúrgicas.",
    categoria: "Metabólica",
    prevalencia: "31.2% de la población adulta",
    sintomas: ["Exceso de peso corporal", "Dificultad para respirar", "Fatiga", "Dolor articular", "Sudoración excesiva"]
  },
  {
    id: "depresion",
    nombre: "Depresión",
    descripcion: "La depresión es un trastorno mental común que afecta al 6.2% de la población chilena. Se caracteriza por tristeza persistente, pérdida de interés en actividades y diversos síntomas físicos y emocionales. En Chile, es una de las principales causas de discapacidad y tiene un impacto significativo en la calidad de vida. El tratamiento incluye psicoterapia, medicamentos antidepresivos o una combinación de ambos.",
    categoria: "Salud Mental",
    prevalencia: "6.2% de la población",
    sintomas: ["Tristeza persistente", "Pérdida de interés", "Cambios en el apetito", "Trastornos del sueño", "Fatiga", "Dificultad para concentrarse"]
  },
  {
    id: "asma",
    nombre: "Asma Bronquial",
    descripcion: "El asma es una enfermedad respiratoria crónica que causa inflamación y estrechamiento de las vías respiratorias. En Chile, afecta aproximadamente al 5% de la población adulta y es más prevalente en niños. Los síntomas pueden variar desde leves hasta severos y pueden desencadenarse por diversos factores como alérgenos, ejercicio o infecciones respiratorias.",
    categoria: "Respiratoria",
    prevalencia: "5% de la población adulta",
    sintomas: ["Dificultad para respirar", "Sibilancias", "Tos", "Opresión en el pecho", "Falta de aire"]
  },
  {
    id: "artritis-reumatoide",
    nombre: "Artritis Reumatoide",
    descripcion: "La artritis reumatoide es una enfermedad autoinmune crónica que causa inflamación de las articulaciones. En Chile, afecta aproximadamente al 0.5% de la población, siendo más común en mujeres. Causa dolor, rigidez e hinchazón articular, principalmente en manos, pies y rodillas. El diagnóstico temprano y el tratamiento adecuado son cruciales para prevenir el daño articular permanente.",
    categoria: "Reumatológica",
    prevalencia: "0.5% de la población",
    sintomas: ["Dolor articular", "Rigidez matinal", "Hinchazón", "Fatiga", "Pérdida de movilidad"]
  },
  {
    id: "enfermedad-renal-cronica",
    nombre: "Enfermedad Renal Crónica",
    descripcion: "La enfermedad renal crónica es la pérdida gradual de la función renal. En Chile, afecta aproximadamente al 10% de la población adulta, siendo la diabetes y la hipertensión las principales causas. Muchas personas no presentan síntomas en etapas tempranas, por lo que el tamizaje en población de riesgo es fundamental. El tratamiento busca ralentizar la progresión y manejar las complicaciones.",
    categoria: "Renal",
    prevalencia: "10% de la población adulta",
    sintomas: ["Fatiga", "Hinchazón de pies y tobillos", "Cambios en la orina", "Náuseas", "Pérdida de apetito"]
  },
  {
    id: "cancer-gastrico",
    nombre: "Cáncer Gástrico",
    descripcion: "El cáncer gástrico es uno de los cánceres más frecuentes en Chile, con una tasa de incidencia significativamente mayor que el promedio mundial. La infección por Helicobacter pylori es un factor de riesgo importante. El diagnóstico temprano mediante endoscopía digestiva alta mejora significativamente el pronóstico. Chile cuenta con programas de detección precoz para población de riesgo.",
    categoria: "Oncológica",
    prevalencia: "Alta incidencia comparada con otros países",
    sintomas: ["Dolor abdominal", "Pérdida de peso", "Náuseas", "Vómitos", "Sensación de llenura", "Sangrado digestivo"]
  },
  {
    id: "epoc",
    nombre: "Enfermedad Pulmonar Obstructiva Crónica (EPOC)",
    descripcion: "La EPOC es una enfermedad respiratoria crónica que causa obstrucción del flujo de aire. En Chile, afecta aproximadamente al 16.9% de los mayores de 40 años. El tabaquismo es la principal causa. Se caracteriza por síntomas respiratorios persistentes y limitación del flujo de aire. El abandono del tabaco es la intervención más efectiva para frenar la progresión.",
    categoria: "Respiratoria",
    prevalencia: "16.9% de mayores de 40 años",
    sintomas: ["Dificultad para respirar", "Tos crónica", "Producción de esputo", "Sibilancias", "Fatiga"]
  },
  {
    id: "hipotiroidismo",
    nombre: "Hipotiroidismo",
    descripcion: "El hipotiroidismo es una condición en la que la glándula tiroides no produce suficientes hormonas tiroideas. En Chile, es particularmente prevalente, afectando principalmente a mujeres. Los síntomas pueden ser sutiles al inicio y progresar lentamente. El tratamiento con hormona tiroidea sintética es efectivo y generalmente se requiere de por vida.",
    categoria: "Endocrina",
    prevalencia: "Alta prevalencia, especialmente en mujeres",
    sintomas: ["Fatiga", "Aumento de peso", "Sensibilidad al frío", "Piel seca", "Caída del cabello", "Depresión"]
  },
  {
    id: "dislipidemia",
    nombre: "Dislipidemia (Colesterol Alto)",
    descripcion: "La dislipidemia se caracteriza por niveles anormales de lípidos en la sangre, incluyendo colesterol y triglicéridos elevados. En Chile, afecta aproximadamente al 38.5% de la población adulta. Es un factor de riesgo cardiovascular importante. El manejo incluye cambios en el estilo de vida y, cuando es necesario, medicamentos hipolipemiantes.",
    categoria: "Cardiovascular",
    prevalencia: "38.5% de la población adulta",
    sintomas: ["Generalmente asintomática", "Puede causar xantomas", "Riesgo de eventos cardiovasculares"]
  },
  {
    id: "sindrome-metabolico",
    nombre: "Síndrome Metabólico",
    descripcion: "El síndrome metabólico es un conjunto de condiciones que incluyen obesidad abdominal, hipertensión, dislipidemia y resistencia a la insulina. En Chile, afecta aproximadamente al 35% de la población adulta. Aumenta significativamente el riesgo de diabetes tipo 2 y enfermedades cardiovasculares. El tratamiento se enfoca en cambios del estilo de vida.",
    categoria: "Metabólica",
    prevalencia: "35% de la población adulta",
    sintomas: ["Obesidad abdominal", "Presión arterial elevada", "Glucosa elevada", "Triglicéridos altos", "Colesterol HDL bajo"]
  }
];

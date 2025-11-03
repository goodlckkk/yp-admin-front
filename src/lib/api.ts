const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export interface PatientIntakePayload {
  nombres: string;
  apellidos: string;
  rut: string;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  email: string;
  region: string;
  comuna: string;
  direccion?: string;
  condicionPrincipal: string;
  descripcionCondicion: string;
  medicamentosActuales?: string;
  alergias?: string;
  cirugiasPrevias?: string;
  aceptaTerminos: boolean;
  aceptaPrivacidad: boolean;
}

async function request<TResponse>(input: RequestInfo, init?: RequestInit): Promise<TResponse> {
  const response = await fetch(input, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Error al comunicarse con el servidor");
  }

  return response.json() as Promise<TResponse>;
}

export async function createPatientIntake(payload: PatientIntakePayload) {
  return request(`${API_BASE_URL}/patient-intakes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

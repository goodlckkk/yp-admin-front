# Base de Datos CIE-10

## Fuente

Los códigos CIE-10 (Clasificación Internacional de Enfermedades, 10ª Revisión) provienen del repositorio open source:

**GitHub:** https://github.com/verasativa/CIE-10

### Origen de los datos:
- **icdcode.info** - Códigos CIE-10 en español
- **deis.cl** - Departamento de Estadísticas e Información de Salud de Chile

## Estadísticas

- **Total de códigos:** 14,212
- **Formato:** JSON
- **Campos:**
  - `codigo`: Código CIE-10 (ej: "E11.9")
  - `nombre`: Descripción de la enfermedad en español

## Actualización

Para actualizar la base de datos:

1. Descargar el CSV actualizado:
   ```bash
   curl -L "https://raw.githubusercontent.com/verasativa/CIE-10/master/cie-10.csv" -o cie10-chile.csv
   ```

2. Convertir a JSON (script de ejemplo):
   ```javascript
   const fs = require('fs');
   const csvContent = fs.readFileSync('cie10-chile.csv', 'utf-8');
   const lines = csvContent.split('\n');
   const codes = [];
   
   for (let i = 1; i < lines.length; i++) {
     const parts = lines[i].split(',');
     const code = parts[0]?.trim();
     const description = parts[6]?.trim();
     
     if (code && description && !code.includes('-') && code.length >= 3) {
       codes.push({ codigo: code, nombre: description });
     }
   }
   
   fs.writeFileSync('cie10-es.json', JSON.stringify(codes, null, 2));
   ```

## Licencia

Los datos CIE-10 son de dominio público según la OMS (Organización Mundial de la Salud).

## Uso en la aplicación

Este archivo es utilizado por los componentes de autocomplete:
- `Cie10SingleAutocomplete.tsx` - Selección única (condición principal)
- `Cie10Autocomplete.tsx` - Selección múltiple (códigos adicionales)

La búsqueda se realiza localmente (sin API) para mayor velocidad.

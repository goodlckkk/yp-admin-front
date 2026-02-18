/**
 * Tarjeta de Sitio/Institución de Investigación
 * 
 * Muestra información de un sitio que:
 * - Realiza ensayos clínicos
 * - Deriva pacientes al sistema
 * 
 * Similar al diseño de TrialCard
 */

import { Building2, MapPin, Phone, Mail, Users, Microscope, ExternalLink, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface ResearchSiteCardProps {
  site: {
    id: string;
    nombre: string;
    region?: string;
    comuna?: string;
    ciudad?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    sitio_web?: string;
    descripcion?: string;
    activo?: boolean;
    patientCount?: number; // Cantidad de pacientes derivados
    trialCount?: number; // Cantidad de estudios clínicos activos
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (id: string) => void;
}

export function ResearchSiteCard({ site, onEdit, onDelete, onClick }: ResearchSiteCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(site.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(site.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(site.id);
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (site.sitio_web) {
      window.open(site.sitio_web, '_blank');
    }
  };

  // Determinar ubicación (prioridad: ciudad > comuna > region)
  const location = site.ciudad || site.comuna || site.region || 'Ubicación no especificada';

  return (
    <Card 
      className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-[#04BFAD] hover:border-l-[#024959] bg-white"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3 bg-gradient-to-r from-[#A7F2EB]/10 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {/* Icono */}
            <div className="p-3 bg-gradient-to-br from-[#04BFAD] to-[#024959] rounded-xl shadow-md">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            
            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-[#024959] break-words max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px] truncate">
                  {site.nombre}
                </h3>
                {site.activo !== undefined && (
                  <Badge 
                    className={site.activo 
                      ? "bg-green-100 text-green-700 border-green-300" 
                      : "bg-gray-100 text-gray-600 border-gray-300"
                    }
                  >
                    {site.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="break-words max-w-[180px] sm:max-w-[220px] md:max-w-[280px] truncate">{location}</span>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="hover:bg-[#04BFAD] hover:text-white"
            >
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
              className="hover:bg-rose-500 hover:text-white border-rose-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Descripción */}
        {site.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {site.descripcion}
          </p>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-3">
          {/* Estudios clínicos */}
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#024959]/5 to-transparent rounded-lg border border-[#024959]/10">
            <Microscope className="h-5 w-5 text-[#024959]" />
            <div>
              <p className="text-xs text-gray-500">Estudios</p>
              <p className="text-lg font-bold text-[#024959]">
                {site.trialCount ?? 0}
              </p>
            </div>
          </div>

          {/* Pacientes derivados */}
          <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-[#04BFAD]/10 to-transparent rounded-lg border border-[#04BFAD]/20">
            <Users className="h-5 w-5 text-[#04BFAD]" />
            <div>
              <p className="text-xs text-gray-500">Pacientes</p>
              <p className="text-lg font-bold text-[#04BFAD]">
                {site.patientCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-2 pt-2 border-t">
          {site.direccion && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-600 break-words line-clamp-1 max-w-[220px]">{site.direccion}</span>
            </div>
          )}
          
          {site.telefono && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <a 
                href={`tel:${site.telefono}`}
                className="text-[#04BFAD] hover:text-[#024959] hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {site.telefono}
              </a>
            </div>
          )}
          
          {site.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <a 
                href={`mailto:${site.email}`}
                className="text-[#04BFAD] hover:text-[#024959] hover:underline break-all max-w-[200px]"
                onClick={(e) => e.stopPropagation()}
              >
                {site.email}
              </a>
            </div>
          )}

          {site.sitio_web && (
            <div className="flex items-center gap-2 text-sm">
              <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
              <button
                onClick={handleWebsiteClick}
                className="text-[#04BFAD] hover:text-[#024959] hover:underline break-all max-w-[200px] text-left"
              >
                {site.sitio_web.replace(/^https?:\/\//, '')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex items-center justify-between text-xs text-gray-400">
          <span>ID: {site.id.slice(0, 8)}...</span>
          <span className="text-[#04BFAD] font-medium">
            Click para ver detalles
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

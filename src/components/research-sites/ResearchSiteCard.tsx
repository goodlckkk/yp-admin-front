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
  userRole?: string | null;
}

export function ResearchSiteCard({ site, onEdit, onDelete, onClick, userRole }: ResearchSiteCardProps) {
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
      className="hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 border-l-[#04BFAD] hover:border-l-[#024959] bg-white overflow-hidden w-full max-w-md mx-auto md:max-w-none"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2 bg-gradient-to-r from-[#A7F2EB]/10 to-transparent">
        {/* Fila superior: Icono + Nombre */}
        <div className="flex items-start gap-3">
          <div className="p-2.5 sm:p-3 bg-gradient-to-br from-[#04BFAD] to-[#024959] rounded-xl shadow-md shrink-0">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-[#024959] truncate" title={site.nombre}>
              {site.nombre}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm text-gray-600">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        {/* Fila inferior: Badge + Botones */}
        <div className="flex items-center justify-between mt-3">
          <div>
            {site.activo !== undefined && (
              <Badge 
                className={`text-[10px] sm:text-xs ${site.activo 
                  ? "bg-green-100 text-green-700 border-green-300" 
                  : "bg-gray-100 text-gray-600 border-gray-300"
                }`}
              >
                {site.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="hover:bg-[#04BFAD] hover:text-white text-xs h-7 px-2.5"
            >
              Editar
            </Button>
            {userRole === 'ADMIN' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick}
                className="hover:bg-rose-500 hover:text-white border-rose-200 h-7 w-7 p-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-3">
        {/* Descripción */}
        {site.descripcion && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {site.descripcion}
          </p>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-2">
          {/* Estudios clínicos */}
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-[#024959]/5 to-transparent rounded-lg border border-[#024959]/10">
            <Microscope className="h-4 w-4 sm:h-5 sm:w-5 text-[#024959] shrink-0" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Estudios</p>
              <p className="text-base sm:text-lg font-bold text-[#024959]">
                {site.trialCount ?? 0}
              </p>
            </div>
          </div>

          {/* Pacientes derivados */}
          <div className="flex items-center gap-2 p-2 sm:p-3 bg-gradient-to-r from-[#04BFAD]/10 to-transparent rounded-lg border border-[#04BFAD]/20">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-[#04BFAD] shrink-0" />
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Pacientes</p>
              <p className="text-base sm:text-lg font-bold text-[#04BFAD]">
                {site.patientCount ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="space-y-1.5 pt-2 border-t">
          {site.direccion && (
            <div className="flex items-start gap-2 text-xs sm:text-sm min-w-0">
              <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <span className="text-gray-600 truncate">{site.direccion}</span>
            </div>
          )}
          
          {site.telefono && (
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
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
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <a 
                href={`mailto:${site.email}`}
                className="text-[#04BFAD] hover:text-[#024959] hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {site.email}
              </a>
            </div>
          )}

          {site.sitio_web && (
            <div className="flex items-center gap-2 text-xs sm:text-sm min-w-0">
              <ExternalLink className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <button
                onClick={handleWebsiteClick}
                className="text-[#04BFAD] hover:text-[#024959] hover:underline truncate text-left"
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

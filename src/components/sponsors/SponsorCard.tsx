/**
 * Tarjeta de Sponsor
 * 
 * Muestra información de un sponsor que:
 * - Financia ensayos clínicos
 * - Patrocina investigaciones
 * 
 * Similar al diseño de ResearchSiteCard
 */

import { Shield, ExternalLink, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Sponsor } from '../../lib/api';

interface SponsorCardProps {
  sponsor: Sponsor;
  onEdit: (id: string) => void;
  onClick?: (id: string) => void;
}

export function SponsorCard({ sponsor, onEdit, onClick }: SponsorCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(sponsor.id);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(sponsor.id);
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sponsor.web_site) {
      window.open(sponsor.web_site, '_blank');
    }
  };

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
              <Shield className="h-6 w-6 text-white" />
            </div>
            
            {/* Información principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-[#024959] break-words max-w-[200px] sm:max-w-[250px] md:max-w-[300px] truncate">
                  {sponsor.name}
                </h3>
                {sponsor.sponsor_type && (
                  <Badge 
                    className={sponsor.sponsor_type === 'SPONSOR'
                      ? "bg-blue-100 text-blue-700 border-blue-300" 
                      : "bg-purple-100 text-purple-700 border-purple-300"
                    }
                  >
                    {sponsor.sponsor_type === 'SPONSOR' ? 'Sponsor' : 'CRO'}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Botón de editar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="shrink-0 hover:bg-[#04BFAD]/10"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descripción */}
        {sponsor.description && (
          <div className="text-sm text-gray-600 line-clamp-2">
            {sponsor.description}
          </div>
        )}

        {/* Sitio web */}
        {sponsor.web_site && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleWebsiteClick}
              className="text-[#04BFAD] hover:text-[#024959] hover:bg-[#04BFAD]/10 border-[#04BFAD]/30"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visitar sitio web
            </Button>
          </div>
        )}

        {/* Footer con información adicional */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>ID: {sponsor.id.slice(0, 8)}...</span>
        </div>
      </CardContent>
    </Card>
  );
}

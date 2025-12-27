/**
 * Vista Principal de Sponsors
 * 
 * Muestra un grid de tarjetas con todos los sponsors que:
 * - Financian ensayos clínicos
 * - Patrocinan investigaciones
 * 
 * Permite:
 * - Ver lista de sponsors en formato de tarjetas
 * - Buscar sponsors por nombre
 * - Agregar nuevos sponsors
 * - Editar sponsors existentes
 * - Ver estadísticas (estudios patrocinados)
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Shield } from 'lucide-react';
import { SponsorCard } from './SponsorCard';
import { AddSponsorModal } from '../trials/AddSponsorModal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { getSponsors, type Sponsor } from '../../lib/api';

export function SponsorsView() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [filteredSponsors, setFilteredSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Cargar sponsors
  const loadSponsors = async () => {
    try {
      setLoading(true);
      const data = await getSponsors();
      setSponsors(data);
      setFilteredSponsors(data);
    } catch (error) {
      console.error('Error al cargar sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  // Filtrar sponsors por búsqueda
  useEffect(() => {
    let filtered = sponsors;

    // Filtro por búsqueda
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((sponsor) =>
        sponsor.name.toLowerCase().includes(searchLower) ||
        sponsor.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredSponsors(filtered);
  }, [searchTerm, sponsors]);

  const handleEdit = (id: string) => {
    // TODO: Implementar edición de sponsors
    console.log('Editar sponsor:', id);
  };

  const handleAddSuccess = (newSponsor: any) => {
    loadSponsors();
    setIsAddModalOpen(false);
  };

  // Calcular estadísticas
  const totalSponsors = sponsors.length;
  const sponsorTypes = sponsors.reduce((acc, s) => {
    acc[s.sponsor_type || 'SPONSOR'] = (acc[s.sponsor_type || 'SPONSOR'] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#04BFAD]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#024959] flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Sponsors
          </h1>
          <p className="text-gray-600 mt-2">
            Empresas y organizaciones que patrocinan ensayos clínicos
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#04BFAD] hover:bg-[#024959] text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          Agregar Sponsor
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sponsors</p>
              <p className="text-2xl font-bold text-[#024959]">{totalSponsors}</p>
            </div>
            <Shield className="h-8 w-8 text-[#04BFAD]" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sponsors Directos</p>
              <p className="text-2xl font-bold text-[#024959]">{sponsorTypes['SPONSOR'] || 0}</p>
            </div>
            <Shield className="h-8 w-8 text-[#04BFAD]" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CROs</p>
              <p className="text-2xl font-bold text-[#024959]">{sponsorTypes['CRO'] || 0}</p>
            </div>
            <Shield className="h-8 w-8 text-[#04BFAD]" />
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Grid de Sponsors */}
      {filteredSponsors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron sponsors' : 'No hay sponsors registrados'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza agregando el primer sponsor'}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#04BFAD] hover:bg-[#024959] text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Sponsor
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSponsors.map((sponsor) => (
            <SponsorCard
              key={sponsor.id}
              sponsor={sponsor}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Modal para agregar sponsor */}
      {isAddModalOpen && (
        <AddSponsorModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
}

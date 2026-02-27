/**
 * Vista Principal de Sitios/Instituciones de Investigación
 * 
 * Muestra un grid de tarjetas con todos los sitios que:
 * - Realizan ensayos clínicos
 * - Derivan pacientes al sistema
 * 
 * Permite:
 * - Ver lista de sitios en formato de tarjetas
 * - Buscar sitios por nombre o ubicación
 * - Agregar nuevos sitios
 * - Editar sitios existentes
 * - Ver estadísticas (pacientes derivados, estudios activos)
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Filter } from 'lucide-react';
import { ResearchSiteCard } from './ResearchSiteCard';
import { AddInstitutionModal } from '../trials/AddInstitutionModal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { getResearchSites, deleteResearchSite, type ResearchSite } from '../../lib/api';

interface ResearchSitesViewProps {
  userRole?: string | null;
}

export function ResearchSitesView({ userRole }: ResearchSitesViewProps) {
  const [sites, setSites] = useState<ResearchSite[]>([]);
  const [filteredSites, setFilteredSites] = useState<ResearchSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<ResearchSite | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar sitios
  const loadSites = async () => {
    try {
      setLoading(true);
      const data = await getResearchSites();
      setSites(data);
      setFilteredSites(data);
    } catch (error) {
      console.error('Error al cargar sitios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  // Filtrar sitios por búsqueda y estado
  useEffect(() => {
    let filtered = sites;

    // Filtro por búsqueda
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((site) =>
        site.nombre.toLowerCase().includes(searchLower) ||
        site.ciudad?.toLowerCase().includes(searchLower) ||
        site.comuna?.toLowerCase().includes(searchLower) ||
        site.region?.toLowerCase().includes(searchLower) ||
        site.direccion?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado activo
    if (showActiveOnly) {
      filtered = filtered.filter((site) => site.activo !== false);
    }

    setFilteredSites(filtered);
  }, [searchTerm, sites, showActiveOnly]);

  const handleEdit = (id: string) => {
    setSelectedSiteId(id);
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const site = sites.find(s => s.id === id);
    if (!site) return;

    setSiteToDelete(site);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!siteToDelete) return;

    try {
      setIsDeleting(true);
      await deleteResearchSite(siteToDelete.id);
      loadSites(); // Recargar lista
    } catch (error: any) {
      const errorMessage = error.message || 'Error al eliminar el sitio';
      alert(errorMessage);
      console.error('Error al eliminar sitio:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSiteToDelete(null);
    }
  };

  const handleAddSuccess = () => {
    loadSites();
    setIsAddModalOpen(false);
    setSelectedSiteId(null);
  };

  // Calcular estadísticas
  const totalSites = sites.length;
  const activeSites = sites.filter(s => s.activo !== false).length;
  const totalPatients = sites.reduce((sum, s) => sum + ((s as any).patientCount || 0), 0);
  const totalTrials = sites.reduce((sum, s) => sum + ((s as any).trialCount || 0), 0);

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
        <div />
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#04BFAD] hover:bg-[#024959] text-white"
        >
          Agregar Sitio
        </Button>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#04BFAD]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#04BFAD]/10 rounded-lg">
              <Building2 className="h-5 w-5 text-[#04BFAD]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sitios</p>
              <p className="text-2xl font-bold text-[#024959]">{totalSites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sitios Activos</p>
              <p className="text-2xl font-bold text-green-600">{activeSites}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#024959]/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#024959]/10 rounded-lg">
              <Search className="h-5 w-5 text-[#024959]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Estudios Totales</p>
              <p className="text-2xl font-bold text-[#024959]">{totalTrials}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#A7F2EB]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#A7F2EB]/30 rounded-lg">
              <Search className="h-5 w-5 text-[#024959]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pacientes Derivados</p>
              <p className="text-2xl font-bold text-[#04BFAD]">{totalPatients}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, ciudad, comuna o región..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant={showActiveOnly ? "default" : "outline"}
          onClick={() => setShowActiveOnly(!showActiveOnly)}
          className={showActiveOnly ? "bg-[#04BFAD] hover:bg-[#024959]" : ""}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showActiveOnly ? 'Mostrando Activos' : 'Todos'}
        </Button>

        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#04BFAD]/10 to-[#024959]/10 rounded-lg">
          <Building2 className="h-5 w-5 text-[#024959]" />
          <span className="font-semibold text-[#024959]">
            {filteredSites.length} {filteredSites.length === 1 ? 'Sitio' : 'Sitios'}
          </span>
        </div>
      </div>

      {/* Grid de tarjetas */}
      {filteredSites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchTerm || showActiveOnly ? 'No se encontraron sitios' : 'No hay sitios registrados'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || showActiveOnly
              ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
              : 'Comienza agregando un nuevo sitio/institución'}
          </p>
          {!searchTerm && !showActiveOnly && (
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#04BFAD] hover:bg-[#024959] text-white"
            >
              Agregar Primer Sitio
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredSites.map((site) => (
            <ResearchSiteCard
              key={site.id}
              site={{
                ...site,
                patientCount: (site as any).patientCount || 0,
                trialCount: (site as any).trialCount || 0,
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onClick={(id) => {
                // TODO: Abrir modal de detalles
                handleEdit(id);
              }}
              userRole={userRole}
            />
          ))}
        </div>
      )}

      {/* Modal para agregar/editar sitio */}
      <AddInstitutionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedSiteId(null);
        }}
        onSuccess={handleAddSuccess}
        siteId={selectedSiteId}
        userRole={userRole}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSiteToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Institución"
        description={`¿Estás seguro de eliminar "${siteToDelete?.nombre}"? Los estudios clínicos y pacientes asociados serán desvinculados automáticamente. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

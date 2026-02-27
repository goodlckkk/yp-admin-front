"use client"

import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import {
  getPatientIntakes,
  getToken,
  getTokenExpiration,
  getTrials,
  removeToken,
  getStats,
  getTrends,
  updatePatientIntake,
  getUserEmailFromToken,
  getUserRoleFromToken,
  getUserInstitutionIdFromToken,
  getUserInstitutionNameFromToken,
  getResearchSites,
} from "../lib/api"
import { Icons } from "./ui/icons"
import { Input } from "./ui/input"
import { lazy, Suspense, useEffect, useMemo, useState } from "react"
import type { PatientIntake, Trial, DashboardStats, TrendData, ResearchSite } from "../lib/api"
const TrialForm = lazy(() => import('./trials/TrialForm').then(m => ({ default: m.TrialForm })));
const PatientEditForm = lazy(() => import('./patients/PatientEditForm').then(m => ({ default: m.PatientEditForm })));
const ManualPatientForm = lazy(() => import('./patients/ManualPatientForm').then(m => ({ default: m.ManualPatientForm })));
const TrialList = lazy(() => import('./trials/TrialList').then(m => ({ default: m.TrialList })));
const ResearchSitesView = lazy(() => import('./research-sites/ResearchSitesView').then(m => ({ default: m.ResearchSitesView })));
const SponsorsView = lazy(() => import('./sponsors/SponsorsView').then(m => ({ default: m.SponsorsView })));
const HeroSlidesManager = lazy(() => import('./dashboard/HeroSlidesManager'));
const SuccessStoriesManager = lazy(() => import('./dashboard/SuccessStoriesManager'));
import { Cie10SingleAutocomplete } from './ui/Cie10SingleAutocomplete';
import * as XLSX from 'xlsx';
import { useInactivityLogout } from '../hooks/useInactivityLogout';
import { useRequireAuth } from '../hooks/useRequireAuth';


// Función de navegación para Astro - siempre recarga la página
const navigate = (path: string) => {
  window.location.href = path;
};

// Tipos de sección
type Section = "overview" | "pacientes" | "estudios" | "sitios" | "sponsors" | "slider" | "historias"

// Tipos de grupos del menú
type MenuGroup = {
  id: string;
  label: string;
  icon: any;
  items: MenuItem[];
}

type MenuItem = {
  id: Section;
  label: string;
  icon: any;
}

// Tipos de filtros para estudios clínicos
type TrialFilters = {
  status: string;
  searchQuery: string;
  city: string;
  startDate: string;
  endDate: string;
  showFilters: boolean;
};

// Tipos de filtros para pacientes
type PatientFilters = {
  ageMin: string;
  ageMax: string;
  condition: string;
  conditionCode: string; // Código CIE-10 de la condición
  status: string;
  source: string; // Filtro por origen: 'WEB', 'MANUAL', o '' (todos)
  institution: string; // Filtro por institución (ID)
  searchQuery: string;
  showFilters: boolean;
  page: number;
  limit: number;
};

export default function DashboardPage() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [trials, setTrials] = useState<Trial[]>([])
  const [patientIntakes, setPatientIntakes] = useState<PatientIntake[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientError, setPatientError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  
  // Estado para el modal de creación de estudios clínicos
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);
  const [isTrialFormOpen, setIsTrialFormOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientIntake | null>(null);
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);
  
  // Estado para sidebar colapsable
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Función para toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  
  const [isManualPatientFormOpen, setIsManualPatientFormOpen] = useState(false);
  
  // Estado para las instituciones disponibles
  const [researchSites, setResearchSites] = useState<ResearchSite[]>([]);
  
  // Verificar autenticación y controlar inactividad (1 hora)
  useRequireAuth();
  useInactivityLogout(60);

  // Estado para el rol del usuario y datos de institución
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userInstitutionId, setUserInstitutionId] = useState<string | null>(null);
  const [userInstitutionName, setUserInstitutionName] = useState<string | null>(null);
  
  // Función para cerrar sesión
  const handleLogout = () => {
    removeToken();
    navigate('/auth');
  }
  
  // Estado para los filtros de estudios clínicos
  const [trialFilters, setTrialFilters] = useState<TrialFilters>({
    status: '',
    searchQuery: '',
    city: '',
    startDate: '',
    endDate: '',
    showFilters: false
  })
  const [filters, setFilters] = useState<PatientFilters>({
    ageMin: '',
    ageMax: '',
    condition: '',
    conditionCode: '', // Código CIE-10
    status: '',
    source: '', // Filtro por origen: WEB, MANUAL, o '' (todos)
    institution: '', // Filtro por institución
    searchQuery: '',
    showFilters: false,
    page: 1,
    limit: 10 // Límite de 10 pacientes por página con paginación
  })

  // La inactividad se controla exclusivamente por useInactivityLogout(60)

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate?: string): number => {
    if (!birthDate) return 0;
    try {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      
      // Verificar si la fecha es válida
      if (isNaN(birthDateObj.getTime())) return 0;
      
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const monthDiff = today.getMonth() - birthDateObj.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      
      return age > 0 ? age : 0;
    } catch (error) {
      console.error('Error al calcular la edad:', error);
      return 0;
    }
  };



  // Filtrar pacientes según los filtros aplicados
  // Filtrar estudios clínicos según los filtros aplicados
  const filteredTrials = useMemo(() => {
    return trials.filter((trial) => {
      // Filtro por búsqueda
      const searchLower = trialFilters.searchQuery.toLowerCase();
      const matchesSearch = 
        (trial.title?.toLowerCase().includes(searchLower) ||
         (trial as any).description?.toLowerCase().includes(searchLower) ||
         trial.id?.toString().includes(searchLower)) ?? true;

      // Filtro por estado
      const matchesStatus = !trialFilters.status || trial.status === trialFilters.status;
      
      // Filtro por ciudad/comuna (usando researchSite)
      const matchesCity = !trialFilters.city || 
        (trial.researchSite?.ciudad?.toLowerCase().includes(trialFilters.city.toLowerCase()) ?? false) ||
        (trial.researchSite?.comuna?.toLowerCase().includes(trialFilters.city.toLowerCase()) ?? false);
      
      // Filtro por rango de fechas
      const startDate = trialFilters.startDate ? new Date(trialFilters.startDate) : null;
      const endDate = trialFilters.endDate ? new Date(trialFilters.endDate) : null;
      const trialStartDate = trial.start_date ? new Date(trial.start_date) : null;
      
      let matchesDateRange = true;
      if (startDate && trialStartDate) {
        matchesDateRange = trialStartDate >= startDate;
      }
      if (endDate && trialStartDate) {
        matchesDateRange = matchesDateRange && trialStartDate <= endDate;
      }

      return matchesSearch && matchesStatus && matchesCity && matchesDateRange;
    });
  }, [trials, trialFilters]);

  // Función para manejar cambios en los filtros de estudios clínicos
  const handleTrialFilterChange = (updates: Partial<TrialFilters>) => {
    setTrialFilters(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Función para limpiar todos los filtros de estudios clínicos
  const clearTrialFilters = () => {
    setTrialFilters({
      status: '',
      searchQuery: '',
      city: '',
      startDate: '',
      endDate: '',
      showFilters: false
    });
  };


  // Verificación inicial de token al montar — useRequireAuth y useInactivityLogout
  // manejan la lógica de expiración e inactividad respectivamente.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      removeToken()
      window.location.href = "/auth"
      return
    }

    const expiration = getTokenExpiration()
    if (expiration && Date.now() >= expiration) {
      removeToken()
      window.location.href = "/auth"
      return
    }

    setIsAuthorized(true)
  }, [])

  // Cargar TODO una vez al inicio (pacientes, estudios clínicos, stats)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Obtener el rol del usuario y datos de institución desde el token
        const role = getUserRoleFromToken();
        setUserRole(role);
        const instId = getUserInstitutionIdFromToken();
        setUserInstitutionId(instId);
        const instName = getUserInstitutionNameFromToken();
        setUserInstitutionName(instName);
        const [trialsResponse, intakesResponse, statsResponse, trendsResponse, sitesResponse] = await Promise.allSettled([
          getTrials(),
          getPatientIntakes(),
          getStats(),
          getTrends(),
          getResearchSites(),
        ])

        if (trialsResponse.status === "fulfilled") {
          setTrials(trialsResponse.value.data)
          setError(null)
        } else {
          setError(trialsResponse.reason instanceof Error ? trialsResponse.reason.message : "Error al cargar los estudios clínicos")
        }

        if (intakesResponse.status === "fulfilled") {
          setPatientIntakes(intakesResponse.value)
          setPatientError(null)
        } else {
          setPatientError(
            intakesResponse.reason instanceof Error
              ? intakesResponse.reason.message
              : "Error al cargar las postulaciones",
          )
        }

        if (statsResponse.status === "fulfilled") {
          setStats(statsResponse.value)
        }

        if (trendsResponse.status === "fulfilled") {
          setTrends(trendsResponse.value)
        }

        if (sitesResponse.status === "fulfilled") {
          setResearchSites(sitesResponse.value)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (!isAuthorized) {
      return
    }

    // Solo cargar datos una vez al inicio
    fetchData()
  }, [isAuthorized])

  // Función para recargar solo los estudios clínicos
  const refreshTrials = async () => {
    try {
      setLoading(true)
      const response = await getTrials()
      setTrials(response.data)
      setError(null)
    } catch (err) {
      setError("Error al cargar los estudios clínicos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Función para recargar solo los pacientes
  const refreshPatients = async () => {
    try {
      setLoading(true)
      const response = await getPatientIntakes()
      setPatientIntakes(response)
      setPatientError(null)
    } catch (err) {
      setPatientError("Error al cargar las postulaciones")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Función para recargar stats del dashboard
  const refreshStats = async () => {
    try {
      const [statsResponse, trendsResponse] = await Promise.allSettled([
        getStats(),
        getTrends(),
      ])

      if (statsResponse.status === "fulfilled") {
        setStats(statsResponse.value)
      }

      if (trendsResponse.status === "fulfilled") {
        setTrends(trendsResponse.value)
      }
    } catch (err) {
      console.error("Error al recargar estadísticas", err)
    }
  }

  // Callback cuando se crea o actualiza un estudio clínico
  const handleTrialChange = () => {
    refreshTrials()
  }

  // Función para verificar vigencia del consentimiento (15 años)
  const isConsentValid = (registrationDate?: string) => {
    if (!registrationDate) return false;
    const date = new Date(registrationDate);
    const expirationDate = new Date(date);
    expirationDate.setFullYear(date.getFullYear() + 15);
    return new Date() <= expirationDate;
  };

  const patientsToDisplay = useMemo(() => {
    // Combinar búsqueda del header con filtros avanzados
    const combinedSearchQuery = searchQuery || filters.searchQuery;
    
    return patientIntakes.filter((patient) => {
      // Filtro por búsqueda (header o filtros avanzados)
      const searchLower = combinedSearchQuery.toLowerCase();
      const matchesSearch = !combinedSearchQuery || 
        (patient.nombres?.toLowerCase().includes(searchLower) ||
         patient.apellidos?.toLowerCase().includes(searchLower) ||
         patient.rut?.toLowerCase().includes(searchLower) ||
         patient.email?.toLowerCase().includes(searchLower) ||
         patient.condicionPrincipal?.toLowerCase().includes(searchLower) ||
         patient.region?.toLowerCase().includes(searchLower) ||
         patient.comuna?.toLowerCase().includes(searchLower) ||
         patient.trial?.title?.toLowerCase().includes(searchLower));

      // Filtro por rango de edad (solo aplicar si hay valores)
      const matchesAge = (() => {
        if (!filters.ageMin && !filters.ageMax) return true; // Sin filtro de edad
        const age = calculateAge(patient.fechaNacimiento);
        const ageMin = filters.ageMin ? parseInt(filters.ageMin) : 0;
        const ageMax = filters.ageMax ? parseInt(filters.ageMax) : 999;
        return age >= ageMin && age <= ageMax;
      })();

      // Filtro por condición médica
      const matchesCondition = !filters.condition || 
        (patient.condicionPrincipal?.toLowerCase().includes(filters.condition.toLowerCase()) ?? false);

      // Filtro por estado
      const matchesStatus = !filters.status || patient.status === filters.status;

      // Filtro por origen (WEB/MANUAL)
      const matchesSource = !filters.source || patient.source === filters.source;

      // Filtro por institución
      const matchesInstitution = !filters.institution || 
        patient.referralResearchSiteId === filters.institution;

      return matchesSearch && matchesAge && matchesCondition && matchesStatus && matchesSource && matchesInstitution;
    });
  }, [patientIntakes, searchQuery, filters])

  // Función para exportar pacientes a Excel
  const exportPatientsToExcel = () => {
    try {
      // Preparar los datos para exportar
      const dataToExport = patientsToDisplay.map((patient) => {
        // Calcular vigencia del consentimiento (15 años)
        const registrationDate = new Date(patient.createdAt || new Date());
        const expirationDate = new Date(registrationDate);
        expirationDate.setFullYear(registrationDate.getFullYear() + 15);
        const isExpired = new Date() > expirationDate;
        
        // Obtener origen legible
        const sourceMap: Record<string, string> = {
          'WEB_FORM': 'Formulario Web',
          'MANUAL_ENTRY': 'Ingreso Manual',
          'REFERRAL': 'Referido',
          'OTHER': 'Otro'
        };

        // Formatear patologías (array a string)
        const patologiasStr = Array.isArray((patient as any).patologias) 
          ? (patient as any).patologias.join(', ') 
          : '';

        // Formatear otras enfermedades (texto o estructurado)
        let otrasEnfermedadesStr = (patient as any).otrasEnfermedades || '';
        if (Array.isArray((patient as any).otrasEnfermedadesEstructuradas)) {
          const otrasStruct = (patient as any).otrasEnfermedadesEstructuradas
            .map((e: any) => `${e.nombre} (${e.codigo})`)
            .join(', ');
          otrasEnfermedadesStr = otrasEnfermedadesStr 
            ? `${otrasEnfermedadesStr}, ${otrasStruct}`
            : otrasStruct;
        }

        return {
          'RUT': patient.rut || 'N/A',
          'Nombres': patient.nombres || 'N/A',
          'Apellidos': patient.apellidos || 'N/A',
          'Email': patient.email || 'N/A',
          'Teléfono': patient.telefono || 'N/A',
          'Fecha de Nacimiento': formatDate(patient.fechaNacimiento),
          'Edad': calculateAge(patient.fechaNacimiento),
          'Sexo': patient.sexo || 'N/A',
          'Región': patient.region || 'N/A',
          'Comuna': patient.comuna || 'N/A',
          'Dirección': patient.direccion || 'N/A',
          'Condición Principal': patient.condicionPrincipal || 'N/A',
          'Patologías Prevalentes': patologiasStr || 'Ninguna',
          'Otras Enfermedades': otrasEnfermedadesStr || 'Ninguna',
          'Medicamentos Actuales': patient.medicamentosActuales || 'N/A',
          'Estudio Clínico Asignado': patient.trial?.title || 'Sin asignar',
          'Sitio / Institución': patient.referralResearchSite?.nombre || 'N/A',
          'Estado': patient.status || 'RECEIVED',
          'Origen': sourceMap[patient.source || ''] || patient.source || 'N/A',
          'Fecha de Registro': formatDate(patient.createdAt),
          'Vigencia Consentimiento': isExpired ? 'CADUCADO' : 'VIGENTE',
          'Fecha Caducidad': formatDate(expirationDate.toISOString())
        };
      });

      // Crear un libro de trabajo (workbook)
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Pacientes');

      // Ajustar el ancho de las columnas automáticamente
      const maxWidth = 50;
      const colWidths = Object.keys(dataToExport[0] || {}).map(key => ({
        wch: Math.min(
          Math.max(
            key.length,
            ...dataToExport.map(row => String(row[key as keyof typeof row]).length)
          ),
          maxWidth
        )
      }));
      worksheet['!cols'] = colWidths;

      // Generar el archivo con la fecha actual
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const fileName = `pacientes_yoparticipo_${dateStr}.xlsx`;

      // Descargar el archivo
      XLSX.writeFile(workbook, fileName);

      // Mostrar mensaje de éxito (opcional)
      console.log(`✅ Archivo exportado: ${fileName}`);
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      alert('Error al exportar los datos. Por favor, intente nuevamente.');
    }
  };

  // Determinar si el usuario es INSTITUTION (usado en stats, menú, perfil)
  const isInstitution = userRole === 'INSTITUTION';

  const statsOverview = useMemo(() => {
    const baseStats = [
      {
        label: isInstitution ? "Mis Pacientes" : "Total Postulaciones",
        value: isInstitution ? patientIntakes.length.toString() : (stats?.totalPatients || patientIntakes.length).toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "RECEIVED").length}`,
        icon: Icons.Users,
        color: "text-[#04bcbc]",
        bg: "bg-[#dfe3e3]",
      },
      {
        label: "Verificados",
        value: patientIntakes.filter((intake) => intake.status === "VERIFIED").length.toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "VERIFIED").length}`,
        icon: Icons.CheckCircle,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      {
        label: "Pendientes",
        value: patientIntakes.filter((intake) => intake.status === "RECEIVED").length.toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "RECEIVED").length}`,
        icon: Icons.AlertTriangle,
        color: "text-orange-600",
        bg: "bg-orange-100",
      },
    ];

    if (isInstitution) {
      // Para instituciones: Pacientes asignados a estudio en vez de "Sitios activos"
      baseStats.push({
        label: "Asignados a Estudio",
        value: patientIntakes.filter((intake) => intake.status === "STUDY_ASSIGNED").length.toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "STUDY_ASSIGNED").length}`,
        icon: Icons.FileText,
        color: "text-purple-600",
        bg: "bg-purple-100",
      });
    } else {
      // Para admin: Stats completas
      baseStats.push(
        {
          label: "Sitios activos",
          value: patientIntakes.filter((intake) => intake.status === "STUDY_ASSIGNED").length.toString(),
          change: `+${patientIntakes.filter((intake) => intake.status === "STUDY_ASSIGNED").length}`,
          icon: Icons.Building,
          color: "text-purple-600",
          bg: "bg-purple-100",
        },
        {
          label: "Estudios Clínicos Activos",
          value: (stats?.activeTrials || trials.filter((trial) => trial.status === "RECRUITING" || trial.status === "FOLLOW_UP").length).toString(),
          change: `+${trials.filter((trial) => trial.status === "RECRUITING").length}`,
          icon: Icons.Microscope,
          color: "text-green-600",
          bg: "bg-green-100",
        },
      );
    }

    return baseStats;
  }, [patientIntakes, trials, stats, isInstitution])

  const formatDate = (isoDate?: string) => {
    if (!isoDate) return "Sin registro"
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return "Sin registro"
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }


  const formatDateTime = (isoDate?: string) => {
    if (!isoDate) return "Sin registro"
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return "Sin registro"
    return date.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  // Estado para controlar qué grupos están expandidos
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['ensayos', 'web']);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Determinar si el usuario es MODERATOR
  const isModerator = userRole === 'MODERATOR';

  // Estructura del menú con grupos — filtrado por rol
  const menuGroups: (MenuItem | MenuGroup)[] = isInstitution
    ? [
        // Menú limitado para instituciones
        { id: "overview" as Section, label: "Vista General", icon: Icons.Activity },
        { id: "pacientes" as Section, label: "Pacientes", icon: Icons.Users },
        { id: "estudios" as Section, label: "Estudios Clínicos", icon: Icons.FileText },
      ]
    : isModerator
    ? [
        // Menú para moderadores: gestión de ensayos y pacientes, sin Gestión Web
        { id: "overview" as Section, label: "Vista General", icon: Icons.Activity },
        { id: "pacientes" as Section, label: "Pacientes", icon: Icons.Users },
        {
          id: 'ensayos',
          label: 'Gestión de Ensayos',
          icon: Icons.Microscope,
          items: [
            { id: "estudios" as Section, label: "Estudios Clínicos", icon: Icons.FileText },
            { id: "sitios" as Section, label: "Sitios/Instituciones", icon: Icons.Building },
            { id: "sponsors" as Section, label: "Patrocinadores/CROs", icon: Icons.Shield },
          ]
        },
      ]
    : [
        // Menú completo para administradores
        { id: "overview" as Section, label: "Vista General", icon: Icons.Activity },
        { id: "pacientes" as Section, label: "Pacientes", icon: Icons.Users },
        {
          id: 'ensayos',
          label: 'Gestión de Ensayos',
          icon: Icons.Microscope,
          items: [
            { id: "estudios" as Section, label: "Estudios Clínicos", icon: Icons.FileText },
            { id: "sitios" as Section, label: "Sitios/Instituciones", icon: Icons.Building },
            { id: "sponsors" as Section, label: "Patrocinadores/CROs", icon: Icons.Shield },
          ]
        },
        {
          id: 'web',
          label: 'Gestión Web',
          icon: Icons.Globe,
          items: [
            { id: "slider" as Section, label: "Slider Principal", icon: Icons.Image },
            { id: "historias" as Section, label: "Historias que Inspiran", icon: Icons.Heart },
          ]
        },
      ]

  // Función helper para obtener el label de la sección activa
  const getActiveSectionLabel = (section: Section): string => {
    for (const item of menuGroups) {
      if ('items' in item) {
        const found = item.items.find(subItem => subItem.id === section);
        if (found) return found.label;
      } else if (item.id === section) {
        return item.label;
      }
    }
    return 'Dashboard';
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#04BFAD] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Validando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 w-64 ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo y Botón Hamburguer */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="yoParticipo" className="w-8 h-8 scale-150" />
              <div style={{ lineHeight: '0.9' }}>
                <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #04bcbc, #346c84)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0', padding: '0', display: 'block', lineHeight: '0.9' }}>YO</h1>
                <h2 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #04bcbc, #346c84)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0', padding: '0', display: 'block', lineHeight: '1.2' }}>Participo</h2>
                <p className="text-xs text-gray-500">Dashboard Admin</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
              title={isSidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              {isSidebarCollapsed ? <Icons.ChevronRight className="h-4 w-4" /> : <Icons.Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuGroups.map((item) => {
              // Si es un grupo con items
              if ('items' in item) {
                const isExpanded = expandedGroups.includes(item.id);
                return (
                  <div key={item.id} className="space-y-1">
                    {/* Botón del grupo */}
                    <button
                      onClick={() => toggleGroup(item.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-gray-700 hover:bg-gray-100"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <Icons.ChevronDown className={`w-4 h-4 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {/* Items del grupo */}
                    {isExpanded && (
                      <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                        {item.items.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveSection(subItem.id);
                              setShowMobileMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              activeSection === subItem.id
                                ? "text-white shadow-lg"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            style={activeSection === subItem.id ? { background: 'linear-gradient(to right, #04bcbc, #7cdcdc)' } : {}}
                          >
                            <subItem.icon className="w-4 h-4" />
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Si es un item simple
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? "text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  style={activeSection === item.id ? { background: 'linear-gradient(to right, #04bcbc, #7cdcdc)' } : {}}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{isInstitution ? 'IN' : isModerator ? 'MO' : 'AD'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {isInstitution ? (userInstitutionName || 'Institución') : isModerator ? 'Moderador' : 'Admin'}
                </p>
                <p className="text-xs text-gray-500 truncate">{getUserEmailFromToken() || 'admin@yoparticipo.cl'}</p>
                {isInstitution && (
                  <span className="inline-block mt-1 text-[10px] font-medium bg-[#A7F2EB] text-[#024959] px-2 py-0.5 rounded-full">Institución</span>
                )}
                {isModerator && (
                  <span className="inline-block mt-1 text-[10px] font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Moderador</span>
                )}
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <Icons.LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-8">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                {/* Botón hamburguesa mobile */}
                <button 
                  onClick={() => setShowMobileMenu(!showMobileMenu)} 
                  className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icons.Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                {/* Botón toggle sidebar en desktop (visible solo cuando está colapsado) */}
                {isSidebarCollapsed && (
                  <button 
                    onClick={toggleSidebar} 
                    className="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Expandir sidebar"
                  >
                    <Icons.Menu className="w-5 h-5" />
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    {getActiveSectionLabel(activeSection)}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate">
                    {isInstitution ? `Panel de ${userInstitutionName || 'Institución'}` : isModerator ? 'Gestión de estudios y pacientes' : 'Gestiona toda la información de la plataforma'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="relative hover:bg-[#A7F2EB]/20 p-2"
                  title="Notificaciones"
                >
                  <Icons.Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#024959]" />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#04BFAD] rounded-full"></span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => (window.location.href = "/")}
                  className="border-[#04BFAD] text-[#024959] hover:bg-[#A7F2EB]/20 px-2 sm:px-3"
                >
                  <Icons.Globe className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
                  <span className="hidden sm:inline">Ver Sitio</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Overview */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsOverview.map((stat, index) => (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          {stat.change}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Row - Ocultar para usuarios INSTITUTION */}
              {userRole !== 'INSTITUTION' && (
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Crecimiento de Usuarios</CardTitle>
                      <CardDescription>Últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                          <Icons.Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Conecta un gráfico real para visualizar métricas</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <CardHeader>
                      <CardTitle>Actividad Reciente</CardTitle>
                      <CardDescription>En tiempo real</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {patientsToDisplay.slice(0, 5).map((intake, index) => (
                        <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                          <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#04bcbc' }}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{intake.nombres} {intake.apellidos}</p>
                            <p className="text-xs text-gray-500 mt-1">{formatDateTime(intake.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Pacientes */}
          {activeSection === "pacientes" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {/* Header de la sección */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Lista de Pacientes</h3>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {patientsToDisplay.length} de {patientIntakes.length} {patientIntakes.length === 1 ? 'paciente' : 'pacientes'}
                        {patientsToDisplay.length !== patientIntakes.length && ' (filtrados)'}
                      </p>
                    </div>
                    <Button
                      onClick={() => setIsManualPatientFormOpen(true)}
                      size="sm"
                      className="bg-[#04BFAD] hover:bg-[#024959] text-white transition-colors"
                    >
                      <span className="hidden sm:inline">Agregar Paciente</span>
                    </Button>
                  </div>

                  {/* Barra de búsqueda y acciones */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar pacientes..."
                        className="pl-9 w-full"
                        value={filters.searchQuery}
                        onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={refreshPatients}
                        className="text-[#04BFAD] hover:text-[#024959] hover:bg-[#A7F2EB]/20 flex-1 sm:flex-none"
                        title="Actualizar lista de pacientes"
                        disabled={loading}
                      >
                        <Icons.RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Actualizar</span>
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setFilters({...filters, showFilters: !filters.showFilters});
                        }}
                        className="text-[#04BFAD] hover:text-[#024959] hover:bg-[#A7F2EB]/20 flex-1 sm:flex-none"
                      >
                        <Icons.ChevronDown className={`h-4 w-4 sm:mr-2 transition-transform ${filters.showFilters ? 'rotate-180' : ''}`} />
                        <span className="hidden sm:inline">{filters.showFilters ? 'Ocultar' : 'Filtros'}</span>
                      </Button>
                      <Button 
                        onClick={exportPatientsToExcel}
                        size="sm"
                        className="text-white flex-1 sm:flex-none" 
                        style={{ background: 'linear-gradient(to right, #04bcbc, #7cdcdc)' }}
                        disabled={patientsToDisplay.length === 0}
                        title={patientsToDisplay.length === 0 ? 'No hay pacientes para exportar' : `Exportar ${patientsToDisplay.length} paciente(s) a Excel`}
                      >
                        <Icons.Download className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Exportar</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Filtros desplegables */}
                {filters.showFilters && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad Mínima</label>
                        <Input
                          type="number"
                          placeholder="18"
                          min="0"
                          max={filters.ageMax || '120'}
                          value={filters.ageMin}
                          onChange={(e) => setFilters({...filters, ageMin: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Edad Máxima</label>
                        <Input
                          type="number"
                          placeholder="100"
                          min={filters.ageMin || '0'}
                          max="120"
                          value={filters.ageMax}
                          onChange={(e) => setFilters({...filters, ageMax: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condición Médica (CIE-10)</label>
                        <Cie10SingleAutocomplete
                          value={filters.condition}
                          selectedCode={filters.conditionCode}
                          onChange={(value, code) => {
                            setFilters({...filters, condition: value, conditionCode: code});
                          }}
                          placeholder="Buscar condición médica..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={filters.status}
                          onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                          <option value="">Todos los estados</option>
                          <option value="RECEIVED">📥 Recibido</option>
                          <option value="VERIFIED">✅ Verificado</option>
                          <option value="STUDY_ASSIGNED">🔬 Estudio Asignado</option>
                          <option value="AWAITING_STUDY">⏳ En Espera de Estudio</option>
                          <option value="PENDING_CONTACT">📞 Pendiente de Contacto</option>
                          <option value="DISCARDED">🗑️ Descartado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={filters.source}
                          onChange={(e) => setFilters({...filters, source: e.target.value})}
                        >
                          <option value="">Todos los orígenes</option>
                          <option value="WEB_FORM">🌐 Formulario Web</option>
                          <option value="MANUAL_ENTRY">👤 Creado Manual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={filters.institution}
                          onChange={(e) => setFilters({...filters, institution: e.target.value})}
                        >
                          <option value="">Todas las instituciones</option>
                          {researchSites.map((site) => (
                            <option key={site.id} value={site.id}>
                              {site.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilters({
                          ...filters,
                          ageMin: '',
                          ageMax: '',
                          condition: '',
                          conditionCode: '',
                          status: '',
                          source: '',
                          institution: '',
                          showFilters: false
                        })}
                      >
                        <Icons.X className="mr-2 h-4 w-4" />
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Vista de tabla para desktop */}
              <Card className="border-0 shadow-md hidden md:block">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">RUT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Fecha Registro</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Edad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Condición</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Estudio Clínico</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Sitio / Institución</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Consentimiento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#04BFAD] uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patientsToDisplay.slice((filters.page - 1) * filters.limit, filters.page * filters.limit).map((paciente) => (
                          <tr key={paciente.id} className="hover:bg-[#A7F2EB]/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>
                                    {`${paciente.nombres} ${paciente.apellidos}`
                                      .split(" ")
                                      .filter(Boolean)
                                      .slice(0, 2)
                                      .map((n) => n[0]?.toUpperCase())
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium text-gray-900">
                                    {paciente.nombres} {paciente.apellidos}
                                  </span>
                                  {paciente.source && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs w-fit mt-1 ${
                                        paciente.source === 'MANUAL_ENTRY' 
                                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                      }`}
                                    >
                                      {paciente.source === 'MANUAL_ENTRY' ? '👤 Manual' : '🌐 Web'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{paciente.rut}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDateTime(paciente.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {calculateAge(paciente.fechaNacimiento)} años
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">{paciente.condicionPrincipal}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{paciente.trial?.title ?? "Sin asignar"}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{paciente.referralResearchSite?.nombre ?? "N/A"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isConsentValid(paciente.createdAt) ? (
                                <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1">
                                  <Icons.Check className="w-3 h-3" />
                                  Vigente
                                </Badge>
                              ) : (
                                <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 gap-1">
                                  <Icons.X className="w-3 h-3" />
                                  Caducado
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  paciente.status === "RECEIVED"
                                    ? "bg-blue-100 text-blue-700"
                                    : paciente.status === "VERIFIED"
                                      ? "bg-green-100 text-green-700"
                                      : paciente.status === "STUDY_ASSIGNED"
                                        ? "bg-purple-100 text-purple-700"
                                        : paciente.status === "AWAITING_STUDY"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : paciente.status === "PENDING_CONTACT"
                                            ? "bg-orange-100 text-orange-700"
                                            : paciente.status === "DISCARDED"
                                              ? "bg-rose-100 text-rose-700"
                                              : "bg-blue-100 text-blue-700"
                                }
                              >
                                {paciente.status === 'RECEIVED' ? '📥 Recibido' :
                                 paciente.status === 'VERIFIED' ? '✅ Verificado' :
                                 paciente.status === 'STUDY_ASSIGNED' ? '🔬 Estudio Asignado' :
                                 paciente.status === 'AWAITING_STUDY' ? '⏳ En Espera' :
                                 paciente.status === 'PENDING_CONTACT' ? '📞 Pendiente Contacto' :
                                 paciente.status === 'DISCARDED' ? '🗑️ Descartado' :
                                 '📥 Recibido'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button 
                                size="sm"
                                style={{ background: 'linear-gradient(to right, #04bcbc, #346c84)' }}
                                className="text-white hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  setSelectedPatient(paciente);
                                  setIsPatientDetailsOpen(true);
                                }}
                              >
                                Ver Detalles
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Vista de tarjetas para mobile */}
              <div className="md:hidden space-y-4">
                {patientsToDisplay.slice((filters.page - 1) * filters.limit, filters.page * filters.limit).map((paciente) => (
                  <Card key={paciente.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>
                            {`${paciente.nombres} ${paciente.apellidos}`
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((n) => n[0]?.toUpperCase())
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {paciente.nombres} {paciente.apellidos}
                          </h3>
                          <p className="text-sm text-gray-600">{paciente.rut}</p>
                          {paciente.source && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs w-fit mt-1 ${
                                paciente.source === 'MANUAL_ENTRY' 
                                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {paciente.source === 'MANUAL_ENTRY' ? '👤 Manual' : '🌐 Web'}
                            </Badge>
                          )}
                        </div>
                        <Badge
                          className={
                            paciente.status === "RECEIVED"
                              ? "bg-blue-100 text-blue-700"
                              : paciente.status === "VERIFIED"
                                ? "bg-green-100 text-green-700"
                                : paciente.status === "STUDY_ASSIGNED"
                                  ? "bg-purple-100 text-purple-700"
                                  : paciente.status === "AWAITING_STUDY"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : paciente.status === "PENDING_CONTACT"
                                      ? "bg-orange-100 text-orange-700"
                                      : paciente.status === "DISCARDED"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-blue-100 text-blue-700"
                          }
                        >
                          {paciente.status === 'RECEIVED' ? '📥' :
                           paciente.status === 'VERIFIED' ? '✅' :
                           paciente.status === 'STUDY_ASSIGNED' ? '🔬' :
                           paciente.status === 'AWAITING_STUDY' ? '⏳' :
                           paciente.status === 'PENDING_CONTACT' ? '📞' :
                           paciente.status === 'DISCARDED' ? '🗑️' :
                           '📥'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Edad:</span>
                          <span className="font-medium">{calculateAge(paciente.fechaNacimiento)} años</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Condición:</span>
                          <Badge variant="outline" className="text-xs">{paciente.condicionPrincipal}</Badge>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Estudio:</span>
                          <span className="font-medium text-right text-xs max-w-[60%]">{paciente.trial?.title ?? "Sin asignar"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-gray-600">Sitio:</span>
                          <span className="font-medium text-right text-xs max-w-[60%]">{paciente.referralResearchSite?.nombre ?? "N/A"}</span>
                        </div>
                      </div>

                      <Button 
                        size="sm"
                        style={{ background: 'linear-gradient(to right, #04bcbc, #346c84)' }}
                        className="w-full text-white hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setSelectedPatient(paciente);
                          setIsPatientDetailsOpen(true);
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Paginación */}
              {patientsToDisplay.length > filters.limit && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-600">
                    Mostrando {Math.min((filters.page - 1) * filters.limit + 1, patientsToDisplay.length)} - {Math.min(filters.page * filters.limit, patientsToDisplay.length)} de {patientsToDisplay.length} pacientes
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={filters.page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={filters.page >= Math.ceil(patientsToDisplay.length / filters.limit)}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <Suspense fallback={
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-[#04BFAD] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Cargando...</p>
              </div>
            </div>
          }>
            {/* Estudios Clínicos */}
            {activeSection === "estudios" && (
              <TrialList 
                initialTrials={trials}
                onTrialChange={handleTrialChange}
                userRole={userRole}
                userInstitutionId={userInstitutionId}
                userInstitutionName={userInstitutionName}
              />
            )}

            {/* Sitios/Instituciones */}
            {activeSection === "sitios" && (
              <ResearchSitesView userRole={userRole} />
            )}

            {/* Patrocinadores/CROs */}
            {activeSection === "sponsors" && (
              <SponsorsView userRole={userRole} />
            )}

            {/* Slider Principal */}
            {activeSection === "slider" && (
              <HeroSlidesManager />
            )}

            {/* Historias que Inspiran */}
            {activeSection === "historias" && (
              <SuccessStoriesManager />
            )}
          </Suspense>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Modales */}
      <Suspense fallback={null}>
      <TrialForm
        trial={selectedTrial}
        isOpen={isTrialFormOpen}
        onClose={() => {
          setIsTrialFormOpen(false);
          setSelectedTrial(null);
        }}
        onSuccess={() => {
          setIsTrialFormOpen(false);
          setSelectedTrial(null);
          refreshTrials();
        }}
      />

      <ManualPatientForm
        isOpen={isManualPatientFormOpen}
        onClose={() => setIsManualPatientFormOpen(false)}
        onSuccess={() => {
          refreshPatients();
        }}
        userRole={userRole}
      />

      {isPatientDetailsOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl my-8">
            <div className="p-6">
              <PatientEditForm
                patient={selectedPatient}
                isOpen={isPatientDetailsOpen}
                onClose={() => {
                  setIsPatientDetailsOpen(false);
                  setSelectedPatient(null);
                }}
                userRole={userRole}
                onSuccess={async () => {
                  setIsPatientDetailsOpen(false);
                  setSelectedPatient(null);
                  try {
                    const intakesResponse = await getPatientIntakes();
                    setPatientIntakes(intakesResponse);
                  } catch (err) {
                    console.error('Error al recargar pacientes:', err);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
      </Suspense>
    </div>
  )
}
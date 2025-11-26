"use client"

import { Avatar, AvatarFallback } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import {
  getLastActivityTimestamp,
  getPatientIntakes,
  getToken,
  getTokenExpiration,
  getTrials,
  removeToken,
  updateLastActivityTimestamp,
  getStats,
  getTrends,
} from "../lib/api"
import { Icons } from "./ui/icons"
import { CustomIcons } from "./ui/custom-icons"
import { Input } from "./ui/input"
import { useEffect, useMemo, useState } from "react"
import type { PatientIntake, Trial, DashboardStats, TrendData } from "../lib/api"
import { TrialForm } from "./trials/TrialForm"

// Función de navegación para Astro - siempre recarga la página
const navigate = (path: string) => {
  window.location.href = path;
};

type Section = "overview" | "pacientes" | "ensayos"

type TrialFilters = {
  status: string;
  searchQuery: string;
  city: string;
  startDate: string;
  endDate: string;
  showFilters: boolean;
};

type PatientFilters = {
  ageMin: string;
  ageMax: string;
  condition: string;
  status: string;
  searchQuery: string;
  showFilters: boolean;
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
  
  // Estado para el modal de creación de ensayos
  const [isTrialFormOpen, setIsTrialFormOpen] = useState(false)
  
  // Función para cerrar sesión
  const handleLogout = () => {
    removeToken();
    navigate('/auth');
  }
  
  // Estado para los filtros de ensayos
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
    status: '',
    searchQuery: '',
    showFilters: false
  })

  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000

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
  // Filtrar ensayos según los filtros aplicados
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
      
      // Filtro por ciudad
      const matchesCity = !trialFilters.city || 
        (trial.clinic_city?.toLowerCase().includes(trialFilters.city.toLowerCase()) ?? false);
      
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

  // Función para manejar cambios en los filtros de ensayos
  const handleTrialFilterChange = (updates: Partial<TrialFilters>) => {
    setTrialFilters(prev => ({
      ...prev,
      ...updates
    }));
  };

  // Función para limpiar todos los filtros de ensayos
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


  useEffect(() => {
    let redirecting = false

    const handleUnauthorized = () => {
      if (redirecting) return
      redirecting = true
      removeToken()
      setIsAuthorized(false)
      window.location.href = "/auth"
    }

    const ensureAuthenticated = () => {
      const token = getToken()
      if (!token) {
        handleUnauthorized()
        return false
      }

      const expiration = getTokenExpiration()
      if (expiration && Date.now() >= expiration) {
        handleUnauthorized()
        return false
      }

      const lastActivity = getLastActivityTimestamp()
      if (lastActivity && Date.now() - lastActivity >= INACTIVITY_LIMIT_MS) {
        handleUnauthorized()
        return false
      }

      return true
    }

    if (!ensureAuthenticated()) {
      return
    }

    setIsAuthorized(true)
    updateLastActivityTimestamp()

    const activityEvents: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ]

    const registerActivity = () => {
      updateLastActivityTimestamp()
    }

    activityEvents.forEach((event) => window.addEventListener(event, registerActivity))

    const intervalId = window.setInterval(() => {
      ensureAuthenticated()
    }, 60_000)

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, registerActivity))
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [trialsResponse, intakesResponse, statsResponse, trendsResponse] = await Promise.allSettled([
          getTrials(),
          getPatientIntakes(),
          getStats(),
          getTrends(),
        ])

        if (trialsResponse.status === "fulfilled") {
          setTrials(trialsResponse.value.data)
          setError(null)
        } else {
          setError(trialsResponse.reason instanceof Error ? trialsResponse.reason.message : "Error al cargar los ensayos")
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
      } catch (err) {
        setError("Error al cargar los ensayos")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (!isAuthorized) {
      return
    }

    if (activeSection === "ensayos" || activeSection === "overview" || activeSection === "pacientes") {
      fetchData()
    }
  }, [activeSection, isAuthorized])

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

      // Filtro por rango de edad
      const age = calculateAge(patient.fechaNacimiento);
      const ageMin = filters.ageMin ? parseInt(filters.ageMin) : 0;
      const ageMax = filters.ageMax ? parseInt(filters.ageMax) : 120;
      const matchesAge = age >= ageMin && age <= ageMax;

      // Filtro por condición médica
      const matchesCondition = !filters.condition || 
        (patient.condicionPrincipal?.toLowerCase().includes(filters.condition.toLowerCase()) ?? false);

      // Filtro por estado
      const matchesStatus = !filters.status || patient.status === filters.status;

      return matchesSearch && matchesAge && matchesCondition && matchesStatus;
    });
  }, [patientIntakes, searchQuery, filters])

  const statsOverview = useMemo(
    () => [
      {
        label: "Total Postulaciones",
        value: (stats?.totalPatients || patientIntakes.length).toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "RECEIVED").length}`,
        icon: Icons.Users,
        color: "text-[#04bcbc]",
        bg: "bg-[#dfe3e3]",
      },
      {
        label: "Postulaciones Contactadas",
        value: patientIntakes.filter((intake) => intake.status === "CONTACTED").length.toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "CONTACTED").length}`,
        icon: Icons.Phone,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
      },
      {
        label: "Postulaciones en Revisión",
        value: patientIntakes.filter((intake) => intake.status === "REVIEWING").length.toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "REVIEWING").length}`,
        icon: Icons.Activity,
        color: "text-amber-600",
        bg: "bg-amber-100",
      },
      {
        label: "Ensayos Activos",
        value: (stats?.activeTrials || trials.filter((trial) => trial.status === "RECRUITING" || trial.status === "ACTIVE").length).toString(),
        change: `+${trials.filter((trial) => trial.status === "RECRUITING").length}`,
        icon: Icons.Microscope,
        color: "text-green-600",
        bg: "bg-green-100",
      },
    ],
    [patientIntakes, trials, stats],
  )

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

  const menuItems = [
    { id: "overview" as Section, label: "Vista General", icon: Icons.Activity },
    { id: "pacientes" as Section, label: "Pacientes", icon: Icons.Users },
    { id: "ensayos" as Section, label: "Ensayos", icon: Icons.Microscope },
  ]

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Validando sesión...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to right, #04bcbc, #7cdcdc)' }}>
                <Icons.Microscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ background: 'linear-gradient(to right, #04bcbc, #346c84)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>yoParticipo</h1>
                <p className="text-xs text-gray-500">Dashboard Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
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
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
              <Avatar className="w-10 h-10">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@yoparticipo.cl</p>
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
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden">
                  <Icons.Menu className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {menuItems.find((item) => item.id === activeSection)?.label}
                  </h2>
                  <p className="text-sm text-gray-500">Gestiona toda la información de la plataforma</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative hidden md:block">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Icons.Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="ghost" className="relative">
                  <Icons.Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <Button variant="outline" onClick={() => (window.location.href = "/")}>
                  <Icons.Globe className="w-5 h-5 mr-2" />
                  Ver Sitio
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

              {/* Charts Row */}
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
                            <p className="text-xs text-gray-500 mt-1">{formatDate(intake.fechaNacimiento)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Pacientes */}
          {activeSection === "pacientes" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Lista de Pacientes</h3>
                    <p className="text-sm text-gray-500">
                      {patientsToDisplay.length} {patientsToDisplay.length === 1 ? 'paciente' : 'pacientes'} encontrados
                    </p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                      <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar pacientes..."
                        className="pl-9 w-full"
                        value={filters.searchQuery}
                        onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                      />
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setFilters({...filters, showFilters: !filters.showFilters})}
                      className="flex items-center gap-1"
                    >
                      <Icons.Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Filtros</span>
                      {(filters.ageMin || filters.ageMax || filters.condition || filters.status) && (
                        <span className="ml-1 rounded-full bg-primary text-primary-foreground h-5 w-5 text-xs flex items-center justify-center">
                          !
                        </span>
                      )}
                    </Button>
                    <Button className="text-white" style={{ background: 'linear-gradient(to right, #04bcbc, #7cdcdc)' }}>
                      <Icons.ChevronDown className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Exportar</span>
                    </Button>
                  </div>
                </div>

                {/* Filtros desplegables */}
                {filters.showFilters && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Condición Médica</label>
                        <Input
                          placeholder="Ej: Diabetes, Hipertensión..."
                          value={filters.condition}
                          onChange={(e) => setFilters({...filters, condition: e.target.value})}
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
                          <option value="RECEIVED">Recibido</option>
                          <option value="REVIEWING">En revisión</option>
                          <option value="CONTACTED">Contactado</option>
                          <option value="DISCARDED">Descartado</option>
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
                          status: '',
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

              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Nacimiento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condición</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ensayo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {patientsToDisplay.map((paciente) => (
                          <tr key={paciente.id} className="hover:bg-gray-50">
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
                                <span className="text-sm font-medium text-gray-900">
                                  {paciente.nombres} {paciente.apellidos}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{paciente.rut}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {formatDate(paciente.fechaNacimiento)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">{paciente.condicionPrincipal}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{paciente.trial?.title ?? "Sin asignar"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  paciente.status === "CONTACTED"
                                    ? "bg-green-100 text-green-700"
                                    : paciente.status === "REVIEWING"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : paciente.status === "DISCARDED"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-[#dfe3e3] text-[#044c64]"
                                }
                              >
                                {paciente.status ?? "RECEIVED"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button variant="ghost" size="sm">
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
            </div>
          )}

          {activeSection === "ensayos" && (
            <div className="space-y-6">
              {/* Encabezado y controles de filtrado */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Ensayos Clínicos</h2>
                  <p className="text-muted-foreground">
                    {filteredTrials.length} {filteredTrials.length === 1 ? 'ensayo encontrado' : 'ensayos encontrados'}
                  </p>
                </div>
                <Button onClick={() => setIsTrialFormOpen(true)} className="gap-1 text-white" style={{ background: 'linear-gradient(to right, #04bcbc, #7cdcdc)' }}>
                  <CustomIcons.Plus className="h-4 w-4" />
                  <span>Nuevo Ensayo</span>
                </Button>
              </div>

              {/* Barra de búsqueda y filtros */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative flex-1">
                    <CustomIcons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar ensayos..."
                      className="w-full pl-8"
                      value={trialFilters.searchQuery}
                      onChange={(e) => handleTrialFilterChange({ searchQuery: e.target.value })}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => handleTrialFilterChange({ showFilters: !trialFilters.showFilters })}
                    className="gap-1"
                  >
                    <CustomIcons.Filter className="h-4 w-4" />
                    <span>Filtros</span>
                  </Button>
                </div>

                {/* Filtros avanzados */}
                {trialFilters.showFilters && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estado</label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={trialFilters.status}
                          onChange={(e) => handleTrialFilterChange({ status: e.target.value })}
                        >
                          <option value="">Todos los estados</option>
                          <option value="DRAFT">Borrador</option>
                          <option value="RECRUITING">Reclutando</option>
                          <option value="ACTIVE">Activo</option>
                          <option value="CLOSED">Cerrado</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ciudad</label>
                        <Input
                          placeholder="Filtrar por ciudad"
                          value={trialFilters.city}
                          onChange={(e) => handleTrialFilterChange({ city: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha de inicio</label>
                        <Input
                          type="date"
                          value={trialFilters.startDate}
                          onChange={(e) => handleTrialFilterChange({ startDate: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha de fin</label>
                        <Input
                          type="date"
                          value={trialFilters.endDate}
                          onChange={(e) => handleTrialFilterChange({ endDate: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearTrialFilters}
                        disabled={!trialFilters.status && !trialFilters.city && !trialFilters.startDate && !trialFilters.endDate}
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de ensayos */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="h-6 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                      <div className="flex gap-4">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-destructive/10 p-4 rounded-md text-destructive">
                  <p>{error}</p>
                </div>
              ) : filteredTrials.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <CustomIcons.FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No se encontraron ensayos</h3>
                  <p className="text-muted-foreground">
                    No hay ensayos que coincidan con los filtros seleccionados.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={clearTrialFilters}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredTrials.map((ensayo) => (
                    <Card key={ensayo.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle>{ensayo.title}</CardTitle>
                              <Badge
                                className={
                                  ensayo.status === "RECRUITING"
                                    ? "bg-green-100 text-green-700"
                                    : ensayo.status === "ACTIVE"
                                      ? "bg-[#dfe3e3] text-[#044c64]"
                                      : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {ensayo.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Icons.MapPin className="w-4 h-4" />
                                {ensayo.clinic_city}
                              </div>
                              <div className="flex items-center gap-1">
                                <Icons.Shield className="w-4 h-4" />
                                {ensayo.sponsor.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4">{ensayo.public_description}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                            Ver Detalles
                          </Button>
                          <Button className="flex-1 text-white" style={{ background: 'linear-gradient(to right, #04bcbc, #7cdcdc)' }} size="sm">
                            Gestionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Modal de Creación de Ensayos */}
      <TrialForm
        isOpen={isTrialFormOpen}
        onClose={() => setIsTrialFormOpen(false)}
        onSuccess={() => {
          setIsTrialFormOpen(false);
          // Recargar los ensayos después de crear uno nuevo
          if (activeSection === "ensayos" || activeSection === "overview") {
            const fetchData = async () => {
              try {
                const trialsResponse = await getTrials();
                setTrials(trialsResponse.data);
              } catch (err) {
                console.error('Error al recargar ensayos:', err);
              }
            };
            fetchData();
          }
        }}
      />
    </div>
  )
}

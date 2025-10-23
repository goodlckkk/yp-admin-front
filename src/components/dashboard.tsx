"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Icons } from "./ui/icons"

type Section = "overview" | "pacientes" | "instituciones" | "medicos" | "ensayos"

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Mock Data
  const statsOverview = [
    {
      label: "Total Pacientes",
      value: "2,847",
      change: "+12%",
      icon: Icons.Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Instituciones",
      value: "45",
      change: "+5",
      icon: Icons.Shield,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    { label: "Médicos", value: "450", change: "+23", icon: Icons.User, color: "text-teal-600", bg: "bg-teal-100" },
    {
      label: "Ensayos Activos",
      value: "156",
      change: "+8",
      icon: Icons.Microscope,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ]

  const pacientes = [
    {
      id: 1,
      nombre: "Patricia Silva",
      rut: "12.345.678-9",
      edad: 52,
      condicion: "Artritis",
      estado: "Activo",
      ensayo: "Innovación en Diabetes",
      fecha: "15/01/2025",
    },
    {
      id: 2,
      nombre: "Roberto Morales",
      rut: "23.456.789-0",
      edad: 67,
      condicion: "Parkinson",
      estado: "En Seguimiento",
      ensayo: "Neuroplasticidad",
      fecha: "10/01/2025",
    },
    {
      id: 3,
      nombre: "Carmen López",
      rut: "34.567.890-1",
      edad: 43,
      condicion: "Esclerosis",
      estado: "Activo",
      ensayo: "Inmunoterapia",
      fecha: "08/01/2025",
    },
    {
      id: 4,
      nombre: "Juan Pérez",
      rut: "45.678.901-2",
      edad: 58,
      condicion: "Diabetes",
      estado: "Pendiente",
      ensayo: "Innovación en Diabetes",
      fecha: "20/01/2025",
    },
    {
      id: 5,
      nombre: "María González",
      rut: "56.789.012-3",
      edad: 45,
      condicion: "Cáncer",
      estado: "Activo",
      ensayo: "Inmunoterapia",
      fecha: "18/01/2025",
    },
  ]

  const instituciones = [
    {
      id: 1,
      nombre: "Hospital Clínico Universidad de Chile",
      ubicacion: "Santiago, RM",
      ensayos: 23,
      pacientes: 450,
      plan: "Enterprise",
      estado: "Activo",
    },
    {
      id: 2,
      nombre: "Instituto Nacional del Cáncer",
      ubicacion: "Santiago, RM",
      ensayos: 18,
      pacientes: 320,
      plan: "Profesional",
      estado: "Activo",
    },
    {
      id: 3,
      nombre: "Hospital Guillermo Grant Benavente",
      ubicacion: "Concepción, Biobío",
      ensayos: 15,
      pacientes: 280,
      plan: "Profesional",
      estado: "Activo",
    },
    {
      id: 4,
      nombre: "Clínica Las Condes",
      ubicacion: "Santiago, RM",
      ensayos: 12,
      pacientes: 195,
      plan: "Básico",
      estado: "Pendiente",
    },
  ]

  const medicos = [
    {
      id: 1,
      nombre: "Dr. Carlos Mendoza",
      especialidad: "Oncología",
      institucion: "Hospital Clínico UC",
      ensayos: 12,
      pacientes: 85,
      rating: 4.9,
    },
    {
      id: 2,
      nombre: "Dra. María Fernández",
      especialidad: "Cardiología",
      institucion: "Instituto Nacional del Cáncer",
      ensayos: 8,
      pacientes: 62,
      rating: 4.8,
    },
    {
      id: 3,
      nombre: "Dr. Roberto Silva",
      especialidad: "Neurología",
      institucion: "Hospital Guillermo Grant",
      ensayos: 10,
      pacientes: 74,
      rating: 4.9,
    },
    {
      id: 4,
      nombre: "Dra. Patricia Rojas",
      especialidad: "Endocrinología",
      institucion: "Clínica Las Condes",
      ensayos: 6,
      pacientes: 48,
      rating: 4.7,
    },
    {
      id: 5,
      nombre: "Dr. Juan Valenzuela",
      especialidad: "Reumatología",
      institucion: "Hospital Carlos Van Buren",
      ensayos: 7,
      pacientes: 56,
      rating: 4.8,
    },
  ]

  const ensayos = [
    {
      id: 1,
      titulo: "Innovación en Diabetes",
      institucion: "Hospital Clínico UC",
      estado: "Reclutando",
      participantes: 45,
      objetivo: 60,
      inicio: "01/12/2024",
    },
    {
      id: 2,
      titulo: "Inmunoterapia Avanzada",
      institucion: "Instituto Nacional del Cáncer",
      estado: "En Curso",
      participantes: 38,
      objetivo: 50,
      inicio: "15/11/2024",
    },
    {
      id: 3,
      titulo: "Neuroplasticidad Cognitiva",
      institucion: "Hospital Guillermo Grant",
      estado: "Próximamente",
      participantes: 0,
      objetivo: 40,
      inicio: "01/03/2025",
    },
    {
      id: 4,
      titulo: "Terapia Cardiovascular",
      institucion: "Clínica Las Condes",
      estado: "Reclutando",
      participantes: 22,
      objetivo: 35,
      inicio: "10/01/2025",
    },
  ]

  const actividadReciente = [
    {
      tipo: "nuevo_paciente",
      mensaje: "Patricia Silva se registró en Innovación en Diabetes",
      tiempo: "Hace 5 minutos",
    },
    { tipo: "nuevo_ensayo", mensaje: "Hospital Clínico UC publicó nuevo ensayo", tiempo: "Hace 1 hora" },
    { tipo: "actualizacion", mensaje: "Dr. Carlos Mendoza actualizó datos de paciente", tiempo: "Hace 2 horas" },
    { tipo: "completado", mensaje: "Ensayo de Cardiología alcanzó meta de participantes", tiempo: "Hace 3 horas" },
  ]

  const menuItems = [
    { id: "overview" as Section, label: "Vista General", icon: Icons.Activity },
    { id: "pacientes" as Section, label: "Pacientes", icon: Icons.Users },
    { id: "instituciones" as Section, label: "Instituciones", icon: Icons.Shield },
    { id: "medicos" as Section, label: "Médicos", icon: Icons.User },
    { id: "ensayos" as Section, label: "Ensayos", icon: Icons.Microscope },
  ]

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
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icons.Microscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient">yoParticipo</h1>
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
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 cursor-pointer">
              <Avatar className="w-10 h-10">
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@yoparticipo.cl</p>
              </div>
              <Icons.ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
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
                        <p>Gráfico de crecimiento</p>
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
                      {actividadReciente.map((actividad, index) => (
                        <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{actividad.mensaje}</p>
                            <p className="text-xs text-gray-500 mt-1">{actividad.tiempo}</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Lista de Pacientes</h3>
                  <p className="text-sm text-gray-500">Gestiona todos los pacientes registrados</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Icons.Users className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RUT</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condición</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ensayo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {pacientes.map((paciente) => (
                          <tr key={paciente.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback>
                                    {paciente.nombre
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-900">{paciente.nombre}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{paciente.rut}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{paciente.edad}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">{paciente.condicion}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{paciente.ensayo}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={
                                  paciente.estado === "Activo"
                                    ? "bg-green-100 text-green-700"
                                    : paciente.estado === "Pendiente"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-blue-100 text-blue-700"
                                }
                              >
                                {paciente.estado}
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

          {/* Instituciones */}
          {activeSection === "instituciones" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Instituciones Registradas</h3>
                  <p className="text-sm text-gray-500">Gestiona clínicas y centros médicos</p>
                </div>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <Icons.Shield className="w-4 h-4 mr-2" />
                  Nueva Institución
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {instituciones.map((inst) => (
                  <Card key={inst.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{inst.nombre}</CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                            <Icons.MapPin className="w-4 h-4" />
                            {inst.ubicacion}
                          </div>
                        </div>
                        <Badge
                          className={
                            inst.plan === "Enterprise"
                              ? "bg-purple-100 text-purple-700"
                              : inst.plan === "Profesional"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }
                        >
                          {inst.plan}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{inst.ensayos}</div>
                          <div className="text-xs text-gray-600">Ensayos</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{inst.pacientes}</div>
                          <div className="text-xs text-gray-600">Pacientes</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                          Ver Detalles
                        </Button>
                        <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600" size="sm">
                          Contactar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Médicos */}
          {activeSection === "medicos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Médicos Investigadores</h3>
                  <p className="text-sm text-gray-500">Red de profesionales de la salud</p>
                </div>
                <Button className="bg-gradient-to-r from-teal-600 to-cyan-600">
                  <Icons.User className="w-4 h-4 mr-2" />
                  Invitar Médico
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {medicos.map((medico) => (
                  <Card key={medico.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="text-lg">
                            {medico.nombre
                              .split(" ")
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{medico.nombre}</CardTitle>
                          <p className="text-sm text-gray-600">{medico.especialidad}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Icons.Star className="w-4 h-4 text-yellow-400" filled={true} />
                            <span className="text-sm font-medium">{medico.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Icons.Shield className="w-4 h-4 text-teal-500" />
                          <span className="truncate">{medico.institucion}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="text-center p-2 bg-teal-50 rounded-lg">
                          <div className="text-xl font-bold text-teal-600">{medico.ensayos}</div>
                          <div className="text-xs text-gray-600">Ensayos</div>
                        </div>
                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                          <div className="text-xl font-bold text-blue-600">{medico.pacientes}</div>
                          <div className="text-xs text-gray-600">Pacientes</div>
                        </div>
                      </div>
                      <Button variant="outline" className="w-full bg-transparent" size="sm">
                        Ver Perfil
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Ensayos */}
          {activeSection === "ensayos" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Ensayos Clínicos</h3>
                  <p className="text-sm text-gray-500">Gestiona todos los estudios activos</p>
                </div>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
                  <Icons.Microscope className="w-4 h-4 mr-2" />
                  Nuevo Ensayo
                </Button>
              </div>

              <div className="grid gap-6">
                {ensayos.map((ensayo) => (
                  <Card key={ensayo.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle>{ensayo.titulo}</CardTitle>
                            <Badge
                              className={
                                ensayo.estado === "Reclutando"
                                  ? "bg-green-100 text-green-700"
                                  : ensayo.estado === "En Curso"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {ensayo.estado}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Icons.Shield className="w-4 h-4" />
                              {ensayo.institucion}
                            </div>
                            <div className="flex items-center gap-1">
                              <Icons.Clock className="w-4 h-4" />
                              Inicio: {ensayo.inicio}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">
                              Participantes: {ensayo.participantes}/{ensayo.objetivo}
                            </span>
                            <span className="font-medium text-blue-600">
                              {Math.round((ensayo.participantes / ensayo.objetivo) * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${(ensayo.participantes / ensayo.objetivo) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                            Ver Detalles
                          </Button>
                          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600" size="sm">
                            Gestionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setShowMobileMenu(false)} />
      )}
    </div>
  )
}

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
} from "../lib/api"
import { Icons } from "./ui/icons"
import { Input } from "./ui/input"
import { useEffect, useMemo, useState } from "react"
import type { PatientIntake, Trial } from "../lib/api"

type Section = "overview" | "pacientes" | "ensayos"

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

  const INACTIVITY_LIMIT_MS = 15 * 60 * 1000

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
        const [trialsResponse, intakesResponse] = await Promise.allSettled([
          getTrials(),
          getPatientIntakes(),
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
    if (!searchQuery.trim()) {
      return patientIntakes
    }

    const lowerQuery = searchQuery.toLowerCase()
    return patientIntakes.filter((intake) =>
      [
        `${intake.nombres} ${intake.apellidos}`,
        intake.email,
        intake.rut,
        intake.condicionPrincipal,
        intake.region,
        intake.comuna,
        intake.trial?.title ?? "",
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowerQuery)),
    )
  }, [patientIntakes, searchQuery])

  const statsOverview = useMemo(
    () => [
      {
        label: "Total Postulaciones",
        value: patientIntakes.length.toString(),
        change: `+${patientIntakes.filter((intake) => intake.status === "RECEIVED").length}`,
        icon: Icons.Users,
        color: "text-blue-600",
        bg: "bg-blue-100",
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
        value: trials.length.toString(),
        change: `+${trials.filter((trial) => trial.status === "RECRUITING").length}`,
        icon: Icons.Microscope,
        color: "text-green-600",
        bg: "bg-green-100",
      },
    ],
    [patientIntakes, trials],
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
                      {patientIntakes.map((intake, index) => (
                        <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
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
                                        : "bg-blue-100 text-blue-700"
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
              {loading && <p>Cargando ensayos...</p>}
              {error && <p className="text-red-500">{error}</p>}
              {!loading && !error && (
                <div className="grid gap-6">
                  {trials.map((ensayo) => (
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
                                      ? "bg-blue-100 text-blue-700"
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
                          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600" size="sm">
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
    </div>
  )
}

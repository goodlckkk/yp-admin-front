import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getUsers,
  getPatientIntakes,
  getTrials,
} from "@/lib/api"
import type { PatientIntake, Trial, User } from "@/lib/api"
import { Icons } from "./ui/icons"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [patientIntakes, setPatientIntakes] = useState<PatientIntake[]>([])
  const [trials, setTrials] = useState<Trial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [usersData, intakesData, trialsData] = await Promise.all([
        getUsers(),
        getPatientIntakes(),
        getTrials({ page: 1, limit: 100 }),
      ])
      setUsers(usersData)
      setPatientIntakes(intakesData)
      setTrials(trialsData.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener los datos")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleExternalRefresh = () => {
      void fetchData()
    }

    window.addEventListener("patient-intake-created", handleExternalRefresh)
    return () => {
      window.removeEventListener("patient-intake-created", handleExternalRefresh)
    }
  }, [fetchData])

  const roleStyles = useMemo(
    () => ({
      ADMIN: "bg-red-500 hover:bg-red-600",
      DOCTOR: "bg-blue-500 hover:bg-blue-600",
      PATIENT: "bg-gray-500 hover:bg-gray-600",
    }),
    [],
  )

  const getRoleBadge = (role: string) => {
    const className = roleStyles[role as keyof typeof roleStyles] ?? "bg-slate-500 hover:bg-slate-600"
    return <Badge className={className}>{role}</Badge>
  }

  const intakeStatusStyles: Record<string, string> = {
    RECEIVED: "bg-blue-100 text-blue-700",
    REVIEWING: "bg-amber-100 text-amber-700",
    CONTACTED: "bg-emerald-100 text-emerald-700",
    DISCARDED: "bg-rose-100 text-rose-700",
  }

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

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex justify-center items-center h-64">
        <Icons.Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center text-red-500">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="flex items-center gap-2">
            <Icons.RefreshCw className="w-4 h-4" />
            Refrescar datos
          </Button>
          <Button>Crear Usuario</Button>
        </div>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Icons.Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Postulaciones</CardTitle>
            <Icons.FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientIntakes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ensayos Clínicos</CardTitle>
            <Icons.Microscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trials.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Postulaciones Recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Postulaciones Recientes</CardTitle>
          <CardDescription>
            Pacientes que han enviado su información para postular a ensayos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre completo</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Condición Principal</TableHead>
                <TableHead>Ensayo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientIntakes.map((intake) => (
                <TableRow key={intake.id}>
                  <TableCell className="font-medium">
                    {intake.nombres} {intake.apellidos}
                  </TableCell>
                  <TableCell>{intake.rut}</TableCell>
                  <TableCell>{intake.email}</TableCell>
                  <TableCell>{intake.telefono}</TableCell>
                  <TableCell>
                    {intake.region}, {intake.comuna}
                  </TableCell>
                  <TableCell>{intake.condicionPrincipal}</TableCell>
                  <TableCell>{intake.trial?.title ?? "Sin asignar"}</TableCell>
                  <TableCell>
                    <Badge className={intake.status ? intakeStatusStyles[intake.status] ?? "bg-slate-100 text-slate-700" : "bg-slate-100 text-slate-700"}>
                      {intake.status ?? "SIN ESTADO"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(intake.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios del Sistema</CardTitle>
          <CardDescription>
            Gestiona los usuarios y sus permisos en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

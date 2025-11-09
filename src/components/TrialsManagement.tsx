"use client"

import { useEffect, useState } from "react"
import { createTrial, deleteTrial, getSponsors, getTrials, updateTrial } from "@/lib/api"
import type { CreateTrialPayload, Sponsor, Trial, UpdateTrialPayload } from "@/lib/api"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Icons } from "./ui/icons"

export default function TrialsManagement() {
  const [trials, setTrials] = useState<Trial[]>([])
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTrial, setEditingTrial] = useState<Trial | null>(null)
  const [formState, setFormState] = useState<CreateTrialPayload>({
    title: "",
    public_description: "",
    inclusion_criteria: {},
    clinic_city: "",
    sponsor_id: "",
  })
  const [inclusionCriteriaInput, setInclusionCriteriaInput] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [trialsData, sponsorsData] = await Promise.all([getTrials({}), getSponsors()])
      setTrials(trialsData.data)
      setSponsors(sponsorsData)
      setError(null)
    } catch (err) {
      setError("Error al cargar los datos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (trial: Trial | null = null) => {
    setEditingTrial(trial)
    setFormError(null)
    if (trial) {
      setFormState({
        title: trial.title,
        public_description: trial.public_description,
        inclusion_criteria: trial.inclusion_criteria ?? {},
        clinic_city: trial.clinic_city,
        sponsor_id: trial.sponsor.id,
      })
      const criteriaString = trial.inclusion_criteria ? JSON.stringify(trial.inclusion_criteria, null, 2) : ""
      setInclusionCriteriaInput(criteriaString)
    } else {
      setFormState({
        title: "",
        public_description: "",
        inclusion_criteria: {},
        clinic_city: "",
        sponsor_id: "",
      })
      setInclusionCriteriaInput("")
    }
    setIsDialogOpen(true)
  }

  const handleDelete = async (trialId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este ensayo?")) {
      try {
        await deleteTrial(trialId)
        fetchData() // Refresh data
      } catch (error) {
        console.error("Error deleting trial:", error)
        alert("No se pudo eliminar el ensayo.")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setFormError(null)
      if (!formState.sponsor_id) {
        setFormError("Debes seleccionar un sponsor para el ensayo.")
        return
      }

      let inclusionCriteria: Record<string, unknown> = {}
      const trimmedCriteria = inclusionCriteriaInput.trim()
      if (trimmedCriteria.length > 0) {
        try {
          inclusionCriteria = JSON.parse(trimmedCriteria)
        } catch (jsonError) {
          setFormError("Los criterios de inclusión deben ser un JSON válido.")
          return
        }
      }

      const payload: CreateTrialPayload = {
        title: formState.title,
        public_description: formState.public_description,
        inclusion_criteria: inclusionCriteria,
        clinic_city: formState.clinic_city,
        sponsor_id: formState.sponsor_id,
      }

      if (editingTrial) {
        await updateTrial(editingTrial.id, payload as UpdateTrialPayload)
      } else {
        await createTrial(payload)
      }
      setIsDialogOpen(false)
      fetchData() // Refresh data
    } catch (error) {
      console.error("Error saving trial:", error)
      alert("No se pudo guardar el ensayo.")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSponsorChange = (sponsorId: string) => {
    setFormState((prev) => ({ ...prev, sponsor_id: sponsorId }))
  }

  if (loading) return <p>Cargando ensayos...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestión de Ensayos Clínicos</h3>
          <p className="text-sm text-gray-500">Crea, edita y gestiona los ensayos de la plataforma.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-gradient-to-r from-blue-600 to-purple-600">
          <Icons.Plus className="w-4 h-4 mr-2" />
          Crear Ensayo
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Ciudad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trials.map((trial) => (
                <TableRow key={trial.id}>
                  <TableCell className="font-medium">{trial.title}</TableCell>
                  <TableCell>{trial.sponsor.name}</TableCell>
                  <TableCell>{trial.clinic_city}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        trial.status === "RECRUITING"
                          ? "bg-green-100 text-green-700"
                          : trial.status === "ACTIVE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {trial.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(trial)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(trial.id)}>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTrial ? "Editar Ensayo" : "Crear Nuevo Ensayo"}</DialogTitle>
            <DialogDescription>
              {editingTrial ? "Modifica los detalles del ensayo." : "Completa la información para crear un nuevo ensayo."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input id="title" name="title" value={formState.title} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="public_description" className="text-right">
                Descripción
              </Label>
              <Textarea id="public_description" name="public_description" value={formState.public_description} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inclusion_criteria" className="text-right">
                Criterios de Inclusión
              </Label>
              <Textarea
                id="inclusion_criteria"
                value={inclusionCriteriaInput}
                onChange={(event) => setInclusionCriteriaInput(event.target.value)}
                className="col-span-3"
                placeholder={'Ej: {\n  "edad": { "min": 18, "max": 65 },\n  "condiciones": ["diabetes"]\n}'}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clinic_city" className="text-right">
                Ciudad
              </Label>
              <Input id="clinic_city" name="clinic_city" value={formState.clinic_city} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sponsor_id" className="text-right">
                Sponsor
              </Label>
              <Select onValueChange={handleSponsorChange} value={formState.sponsor_id}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un sponsor" />
                </SelectTrigger>
                <SelectContent>
                  {sponsors.map((sponsor) => (
                    <SelectItem key={sponsor.id} value={sponsor.id}>
                      {sponsor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError && <p className="col-span-4 text-sm text-red-500 text-right md:text-left">{formError}</p>}
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

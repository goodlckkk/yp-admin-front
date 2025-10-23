import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AdminDashboard() {
  const users = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'María García', email: 'maria@example.com', role: 'user', status: 'inactive' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com', role: 'moderator', status: 'active' },
  ];

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge className="bg-green-500 hover:bg-green-600">Activo</Badge>
    ) : (
      <Badge variant="secondary">Inactivo</Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500 hover:bg-red-600',
      moderator: 'bg-blue-500 hover:bg-blue-600',
      user: 'bg-gray-500 hover:bg-gray-600'
    };
    return <Badge className={colors[role as keyof typeof colors]}>{role}</Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <Button>Crear Usuario</Button>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% del mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,123</div>
            <p className="text-xs text-muted-foreground">+15.2% del mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nuevos este mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">111</div>
            <p className="text-xs text-muted-foreground">+5.3% del mes pasado</p>
          </CardContent>
        </Card>
      </div>

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
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
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

      {/* Formulario de Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role-filter">Filtrar por Rol</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status-filter">Filtrar por Estado</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="flex space-x-2">
                <Input
                  id="search"
                  type="text"
                  placeholder="Buscar usuarios..."
                />
                <Button size="sm">Buscar</Button>
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

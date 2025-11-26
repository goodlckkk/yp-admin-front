import { useState, useEffect } from "react";
import * as React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Tipos para los componentes de Popover
interface PopoverTriggerProps {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  [key: string]: any;
}

// Implementación simplificada de Popover
const PopoverTrigger = ({ 
  children, 
  className = '',
  asChild = false,
  ...props 
}: PopoverTriggerProps) => {
  return asChild ? (
    React.Children.only(children) as React.ReactElement
  ) : (
    <button 
      type="button"
      className={cn("outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary", className)}
      {...props}
    >
      {children}
    </button>
  );
};

const PopoverContent = ({ 
  children, 
  className = '',
  align = 'center',
  ...props 
}: PopoverContentProps) => {
  const alignment = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  }[align];
  
  return (
    <div 
      className={cn(
        "absolute z-50 mt-2 w-56 rounded-md border bg-white p-4 shadow-lg",
        alignment,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface PopoverProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Popover = ({ 
  children, 
  open: isOpen, 
  onOpenChange 
}: PopoverProps) => {
  const [open, setOpen] = useState(false);
  const isControlled = isOpen !== undefined;
  
  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  
  const shouldShowContent = isControlled ? isOpen : open;
  
  return (
    <div className="relative inline-block">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;
        
        if (child.type === PopoverTrigger) {
          const childElement = child as React.ReactElement<{onClick?: (e: React.MouseEvent) => void}>;
          const existingOnClick = childElement.props.onClick;
          
          return React.cloneElement(childElement, {
            ...childElement.props,
            onClick: (e: React.MouseEvent) => {
              handleOpenChange(!(isControlled ? isOpen : open));
              existingOnClick?.(e);
            }
          });
        }
        
        if (child.type === PopoverContent && shouldShowContent) {
          return child;
        }
        
        return null;
      })}
    </div>
  );
};
import { cn } from "../../lib/utils";
import type { TrialsFilterParams } from "../../lib/api";

// Componente de icono personalizado
interface IconProps {
  className?: string;
  children: React.ReactNode;
}

const Icon = ({ className = '', children }: IconProps) => (
  <span className={`inline-block ${className}`}>{children}</span>
);

// Iconos personalizados con soporte para className
const CalendarIcon = (props: { className?: string }) => (
  <Icon className={cn("h-4 w-4", props.className)}>📅</Icon>
);

const FilterIcon = (props: { className?: string }) => (
  <Icon className={cn("h-4 w-4", props.className)}>🔍</Icon>
);

const SearchIcon = (props: { className?: string }) => (
  <Icon className={cn("h-4 w-4", props.className)}>🔎</Icon>
);

const XIcon = (props: { className?: string }) => (
  <Icon className={cn("h-4 w-4", props.className)}>✕</Icon>
);

const MapPinIcon = (props: { className?: string }) => (
  <Icon className={cn("h-4 w-4", props.className)}>📍</Icon>
);

interface TrialFiltersProps {
  filters: TrialsFilterParams;
  onFilterChange: (filters: TrialsFilterParams) => void;
  onReset: () => void;
  cities: string[];
}

export function TrialFilters({ filters, onFilterChange, onReset, cities }: TrialFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleStatusChange = (status: string) => {
    const newStatus = status === 'all' ? undefined : status as TrialsFilterParams['status'];
    onFilterChange({ ...filters, status: newStatus, page: 1 });
  };

  const handleCityChange = (city: string) => {
    const newCity = city === 'all' ? undefined : city;
    onFilterChange({ ...filters, city: newCity, page: 1 });
  };

  const handleDateChange = (
    date: Date | undefined, 
    field: 'startDateFrom' | 'startDateTo'
  ) => {
    if (!date) {
      // Si no hay fecha, eliminamos el filtro
      const newFilters = { ...filters };
      delete newFilters[field];
      onFilterChange({ ...newFilters, page: 1 });
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      onFilterChange({ 
        ...filters, 
        [field]: `${year}-${month}-${day}`,
      });
    }
  };

  const formatDisplayDate = (dateString?: string | Date) => {
    if (!dateString) return '';
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formateando fecha:', e);
      return '';
    }
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => 
      value !== undefined && 
      value !== '' &&
      !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o descripción..."
            className="pl-9 w-full"
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <FilterIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="RECRUITING">Reclutando</SelectItem>
              <SelectItem value="ACTIVE">Activo</SelectItem>
              <SelectItem value="CLOSED">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.city || 'all'}
            onValueChange={handleCityChange}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <MapPinIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Ciudad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ciudades</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="h-10 px-3 lg:px-4"
            >
              <XIcon className="mr-2 h-4 w-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !filters.startDateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2" />
              {filters.startDateFrom ? (
                formatDisplayDate(filters.startDateFrom)
              ) : (
                <span>Fecha de inicio desde</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4">
              <Input
                type="date"
                value={filters.startDateFrom || ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  handleDateChange(date, 'startDateFrom');
                }}
              />
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-[240px] justify-start text-left font-normal",
                !filters.startDateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2" />
              {filters.startDateTo ? (
                formatDisplayDate(filters.startDateTo)
              ) : (
                <span>Fecha de inicio hasta</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4">
              <Input
                type="date"
                value={filters.startDateTo || ''}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : undefined;
                  handleDateChange(date, 'startDateTo');
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

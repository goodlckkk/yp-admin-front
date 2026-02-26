// Iconos personalizados como componentes de React
export const PlusIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block ${className}`}>+</span>
);

export const SearchIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block ${className}`}>🔍</span>
);

export const FilterIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block ${className}`}>⚙️</span>
);

export const FolderOpenIcon = ({ className = '' }: { className?: string }) => (
  <span className={`inline-block ${className}`}>📂</span>
);

// Exportar un objeto con todos los iconos para mantener la compatibilidad
export const CustomIcons = {
  Plus: PlusIcon,
  Search: SearchIcon,
  Filter: FilterIcon,
  FolderOpen: FolderOpenIcon,
  // Agregar más iconos según sea necesario
};

export default CustomIcons;

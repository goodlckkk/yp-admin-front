import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function SelectExample() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Ejemplo de Select Component</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Elige una opción:
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una opción" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Opción 1</SelectItem>
              <SelectItem value="option2">Opción 2</SelectItem>
              <SelectItem value="option3">Opción 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Tamaño pequeño:
          </label>
          <Select>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="Opción pequeña" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small1">Pequeña 1</SelectItem>
              <SelectItem value="small2">Pequeña 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

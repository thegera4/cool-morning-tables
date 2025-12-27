import { LocationGrid } from "@/components/LocationGrid";

interface ProductSelectionProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
}

export function ProductSelection({ selectedLocationId, onSelectLocation }: ProductSelectionProps) {
  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <h3 className="text-teal-500 font-bold text-lg">Selecciona tu lugar:</h3>
      </div>
      <LocationGrid selectedLocationId={selectedLocationId} onSelectLocation={onSelectLocation} />
    </>
  );
}
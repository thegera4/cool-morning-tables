import { LocationGrid } from "@/components/LocationGrid";
import { Location } from "@/lib/data";

interface ProductSelectionProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
  products: Location[];
}

export function ProductSelection({ selectedLocationId, onSelectLocation, products }: ProductSelectionProps) {
  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <h3 className="text-teal-500 font-bold text-lg">Selecciona tu lugar:</h3>
      </div>
      <LocationGrid
        selectedLocationId={selectedLocationId}
        onSelectLocation={onSelectLocation}
        products={products}
      />
    </>
  );
}
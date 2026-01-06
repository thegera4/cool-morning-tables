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
        <h3 className="text-brand-teal font-bold text-lg">Selecciona tu lugar:</h3>
      </div>
      {products.length > 0 ? (
        <LocationGrid
          selectedLocationId={selectedLocationId}
          onSelectLocation={onSelectLocation}
          products={products}
        />
      ) : (
        <div className="p-12 text-center bg-gray-50 border border-gray-100 rounded-lg">
          <p className="text-gray-500 font-medium italic">Lo sentimos, no existen mesas disponible por el momento.</p>
        </div>
      )}
    </>
  );
}
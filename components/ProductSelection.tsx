import { LocationGrid } from "@/components/LocationGrid";
import { Location } from "@/lib/data";

interface ProductSelectionProps {
  selectedLocationId: string | null;
  onSelectLocation: (id: string) => void;
  products: Location[];
  title?: string;
  description?: string;
}

export function ProductSelection({ selectedLocationId, onSelectLocation, products, title, description }: ProductSelectionProps) {
  return (
    <>
      <div className="mb-8">
        <h3 className="text-brand-teal font-bold text-lg mb-2">{title || "Selecciona tu lugar:"}</h3>
        <p className="text-sm text-gray-500 font-medium">{description || "Da click sobre tu locacion preferida para continuar con tu compra."}</p>
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
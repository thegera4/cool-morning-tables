import { Heart, AtSign, Phone } from "lucide-react";

export function Features() {
  return (
    <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {/* Feature 1 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><Heart className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold mb-2">Personalizado</h3>
          {/* Description */}
          <p className="text-xs text-gray-800 font-medium leading-relaxed max-w-xs">
            Revisa nuestro catalogo y complementa tu renta para hacerlo unico y especial.
          </p>
        </div>
        {/* Feature 2 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><AtSign className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold mb-2">En linea</h3>
          {/* Description */}
          <p className="text-xs text-gray-800 font-medium leading-relaxed max-w-xs">
            Nuestro sistema de reservas en linea esta disponible 24/7 para ti.
          </p>
        </div>
        {/* Feature 3 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><Phone className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold mb-2">¿Dudas?</h3>
          {/* Description */}
          <p className="text-xs text-gray-800 font-medium leading-relaxed max-w-xs">
            Si tienes alguna duda o problema, contactanos, estamos para ti.
          </p>
        </div>
      </div>
    </section>
  );
}
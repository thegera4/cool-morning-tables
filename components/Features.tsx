import { HandHeart, Clock8, Hourglass, Sparkles, UsersRound, Mail } from "lucide-react";

export function Features() {
  return (
    <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {/* Feature 1 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><HandHeart className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold text-lg mb-2">Personalizado</h3>
          {/* Description */}
          <p className="text-sm text-gray-800 font-medium leading-relaxed max-w-xs">
            Antes de realizar tu reserva, te sugerimos revisar nuestro catálogo para cualquier duda o para complementar tu experiencia y hacerla especial.
          </p>
        </div>
        {/* Feature 2 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><Clock8 className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold text-lg mb-2">Horarios</h3>
          {/* Description */}
          <div className="text-sm text-gray-800 font-medium leading-relaxed max-w-xs">
            <p>Todas las reservaciones son en los siguientes horarios:</p>
            <p>Martes - Sábado: 8:15 p.m a 10:45 pm.</p>
            <p>Domingo: 7:00 p.m a 8:45 pm.</p>
          </div>
        </div>
        {/* Feature 3 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><Hourglass className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold text-lg mb-2">Flexibilidad</h3>
          {/* Description */}
          <p className="text-sm text-gray-800 font-medium leading-relaxed max-w-xs">
            Puedes llegar tarde a tu reserva, pero el servicio finaliza en el horario establecido (Martes - Sábado: 10:45 pm y Domingo: 8:45 pm).
          </p>
        </div>
        {/* Feature 4 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><Sparkles className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold text-lg mb-2">Elementos externos</h3>
          {/* Description */}
          <p className="text-sm text-gray-800 font-medium leading-relaxed max-w-xs">
            Si quieres llevar mariachis, fotógrafos u otros elementos externos, comunicate al restaurante "La Trattoria" para gestionar el espacio 87-19-77-51-50.
          </p>
        </div>
        {/* Feature 5 */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><UsersRound className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold text-lg mb-2">Parejas</h3>
          {/* Description */}
          <p className="text-sm text-gray-800 font-medium leading-relaxed max-w-xs">
            Recuerda que nuestros precios son por pareja. Para hacer tu momento especial e inolvidable, tenemos una politica de no niños.
          </p>
        </div>
        {/* Feature 6  */}
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 text-brand-brown"><Mail className="h-10 w-10 stroke-[1.5]" /></div>
          {/* Title */}
          <h3 className="text-brand-teal font-bold text-lg mb-2">Seguimiento</h3>
          {/* Description */}
          <p className="text-sm text-gray-800 font-medium leading-relaxed max-w-xs">
            Al realizar tu reserva, recibirás un correo de confirmación con los detalles de tu reservación. Si tienes mas dudas puedes contactarnos en las redes de Cool Morning.
          </p>
        </div>
      </div>
    </section>
  );
}
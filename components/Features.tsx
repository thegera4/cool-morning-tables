import { HandHeart, Clock8, Hourglass, Sparkles, UsersRound, Mail, Heart, Gift, Music, Utensils, Wine, Cake, Camera, Calendar, MapPin, CreditCard, Info, ShieldCheck, Star, Phone, Car, Moon, Sun, Flower, Gem, PartyPopper } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  HandHeart,
  Clock8,
  Hourglass,
  Sparkles,
  UsersRound,
  Mail,
  Heart,
  Gift,
  Music,
  Utensils,
  Wine,
  Cake,
  Camera,
  Calendar,
  MapPin,
  CreditCard,
  Info,
  ShieldCheck,
  Star,
  Phone,
  Car,
  Moon,
  Sun,
  Flower,
  Gem,
  PartyPopper,
};

interface FeaturesProps {
  features?: {
    title: string;
    description: string;
    icon: string;
  }[];
}

export function Features({ features }: FeaturesProps) {
  // Default features if none provided from Sanity
  const displayFeatures = features && features.length > 0 ? features : [
    { title: "Personalizado", description: "Antes de realizar tu reserva, te sugerimos revisar nuestro catálogo para cualquier duda o para complementar tu experiencia y hacerla especial.", icon: "HandHeart" },
    { title: "Horarios", description: "Todas las reservaciones son en los siguientes horarios:\nMartes - Sábado: 8:15 p.m a 10:45 pm.\nDomingo: 7:00 p.m a 8:45 pm.", icon: "Clock8" },
    { title: "Flexibilidad", description: "Puedes llegar tarde a tu reserva, pero el servicio finaliza en el horario establecido (Martes - Sábado: 10:45 pm y Domingo: 8:45 pm).", icon: "Hourglass" },
    { title: "Elementos externos", description: 'Si quieres llevar mariachis, fotógrafos u otros elementos externos, comunicate al restaurante "La Trattoria" para gestionar el espacio 87-19-77-51-50.', icon: "Sparkles" },
    { title: "Parejas", description: "Recuerda que nuestros precios son por pareja. Para hacer tu momento especial e inolvidable, tenemos una politica de no niños.", icon: "UsersRound" },
    { title: "Seguimiento", description: "Al realizar tu reserva, recibirás un correo de confirmación con los detalles de tu reservación. Si tienes mas dudas puedes contactarnos en las redes de Cool Morning.", icon: "Mail" },
  ];

  return (
    <section className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
      <h2 className="sr-only">Nuestras Características y Servicios</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {displayFeatures.map((feature, index) => {
          const IconComponent = ICON_MAP[feature.icon] || Sparkles;
          return (
            <div key={index} className="flex flex-col items-center">
              {/* Icon */}
              <div className="mb-4 text-brand-brown"><IconComponent className="h-10 w-10 stroke-[1.5]" /></div>
              {/* Title */}
              <h3 className="text-brand-teal font-bold text-lg mb-2">{feature.title}</h3>
              {/* Description */}
              <div className="text-sm text-gray-800 font-medium leading-relaxed max-w-xs whitespace-pre-line">
                {feature.description}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
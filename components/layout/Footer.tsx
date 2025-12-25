import Link from "next/link";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

export function Footer() {
    return (
        <footer className="w-full bg-teal-500 text-white py-8 px-6 md:px-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-300 to-white/90">
                        coolmorning
                    </Link>
                    <p className="text-[10px] mt-1 text-teal-100">
                        © Copyright Cool Morning.
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <span className="text-xs font-bold tracking-widest text-teal-100">CONTACTO:</span>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="hover:text-teal-200 transition-colors">
                            <MessageCircle className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="hover:text-teal-200 transition-colors">
                            <Facebook className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="hover:text-teal-200 transition-colors">
                            <Instagram className="h-5 w-5" />
                        </Link>
                    </div>
                    <span className="text-xs font-bold tracking-widest text-teal-100">COOLMORNING.COM.MX</span>
                </div>
            </div>
        </footer>
    );
}

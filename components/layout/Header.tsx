import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


export function Header() {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12">
            <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-teal-400">
                    coolmorning
                </Link>
            </div>
            <div className="flex items-center gap-6">
                <Link href="/reservas" className="text-white text-xs md:text-sm font-medium tracking-wider uppercase hover:underline underline-offset-4">
                    MIS RESERVAS
                </Link>
                <Avatar className="h-8 w-8 cursor-pointer border-2 border-white/20">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>
        </header>
    );
}

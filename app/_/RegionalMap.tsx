"use client";
import { useState } from 'react';
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";
import Image from 'next/image';
import FooterSpring from "@/components/ui/FooterSpring";

const countries = [
    { name: "México", left: "33%", top: "32%" },
    { name: "Guatemala", left: "34.5%", top: "42%" },
    { name: "Honduras", left: "41%", top: "35.5%" },
    { name: "El Salvador", left: "41%", top: "39%" },
    { name: "República Dominicana", left: "54%", top: "39%" },
    { name: "Nicaragua", left: "47.5%", top: "43.5%" },
    { name: "Costa Rica", left: "53%", top: "46.5%" },
    { name: "Panamá", left: "44.5%", top: "49.5%" },
    { name: "Colombia", left: "59.5%", top: "51.5%" },
    { name: "Ecuador", left: "54.5%", top: "57%" },
    { name: "Perú", left: "56.5%", top: "64%" },
    { name: "Chile", left: "55.5%", top: "76%" },
];

export default function RegionalMap() {
    const [content, setContent] = useState("");

    return (
        <section className="relative w-full bg-white font-sans overflow-hidden">
            {/* Background Sweeping Lines (Right Side) */}
            <div className="absolute inset-0 -right-[100px] pointer-events-none overflow-hidden z-0">
                <Image src={"/assets/png/vector-right.png"} alt="Líneas y figuras decorativas del mapa regional Shift Latam" fill className="object-contain max-w-[521px] ml-auto h-full left-auto" />
            </div>

            <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center relative h-screen">
                {/* Left Column - Text Content */}
                <div className="flex flex-col justify-center w-full lg:w-[40%] z-10 relative mb-12 lg:mb-0 lg:pr-10">
                    <h2 className="text-4xl md:text-[50px] font-extrabold text-[#0E1745] leading-[1.1] mb-6 tracking-tight">
                        Capacidades<br />Regionales
                    </h2>
                    <p className="text-slate-600 text-[15px] md:text-[16px] mb-10 leading-relaxed font-medium max-w-[443px]">
                        Con presencia en Centroamérica, Caribe y Sudamérica, activamos campañas, reputación y performance en múltiples mercados con coherencia y gobernanza regional.
                    </p>
                    <div className="w-full flex justify-start mt-6">
                        <OutlineArrowButton label="Ver más" />
                    </div>
                </div>

                {/* Right Column - Figma Map Overlay */}
                <div className="absolute right-[-30%] md:right-[-10%] lg:right-[-150px] top-1/2 -translate-y-1/2 w-[800px] lg:w-[1027px] h-[800px] lg:h-[1269px] z-0 flex items-center justify-center pointer-events-auto">
                    {/* The Background SVG Map */}
                    <div className="relative w-full h-full">
                        <Image
                            src="/assets/images/regional/map.svg"
                            alt="Mapa de Latinoamérica con países de operación de Shift Latam"
                            fill
                            className="object-contain"
                            priority
                        />

                        {/* The Overlay Interactive Markers */}
                        {countries.map(({ name, left, top }) => {
                            const isHovered = content === name;
                            
                            return (
                                <div
                                    key={name}
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                                    style={{ left, top }}
                                >
                                    {/* Fixed size anchor wrapper to prevent transform flicker */}
                                    <div 
                                        className="relative w-[34px] h-[34px]"
                                        onMouseEnter={() => setContent(name)}
                                        onMouseLeave={() => setContent("")}
                                    >
                                        {/* Expanding pill anchored to the left */}
                                        <div
                                            className={`absolute left-0 top-0 transition-all duration-300 ease-out flex items-center justify-center whitespace-nowrap overflow-hidden shadow-sm cursor-pointer
                                                ${isHovered ? 'bg-[#F540FF] h-[34px] max-w-[250px] px-[17px] rounded-[10px]' : 'bg-[#1534DC] h-[34px] max-w-[34px] px-[17px] rounded-[10px]'}
                                            `}
                                        >
                                            <span 
                                                className={`text-white font-bold text-[13px] transition-all duration-300 block
                                                    ${isHovered ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'}
                                                `}
                                            >
                                                {name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="block leading-0 absolute right-0 bottom-0 z-10 pointer-events-none">
                <FooterSpring />
            </div>
        </section>
    );
}
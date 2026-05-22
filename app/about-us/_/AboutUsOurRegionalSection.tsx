"use client";

import Image from "next/image";
import { useState } from "react";

const regionalOffices = [
  {
    name: "Costa Rica",
    title: "Costa Rica",
    description: "San José",
    location: "Centro Empresarial Vía Lindora, 3er Piso",
    phone: "+506 4110-6000",
    email: "gpiedra@shiftpn.co.cr",
    mapSrc: "/assets/images/aboutus/Costa Rica.svg",
  },
  {
    name: "Colombia",
    title: "Colombia",
    description: "Bogotá",
    location: "CRA 15 # 88- 21 Of. 403",
    phone: "+57 3014360416",
    email: "gonzalo.pineros@shiftpn.co",
    mapSrc: "/assets/images/aboutus/Colombia.svg",
  },
  {
    name: "Ecuador",
    title: "Ecuador",
    description: "Quito",
    location: "Italia n32118 Avenida Mariana de Jesús",
    phone: "+593 995373108",
    email: "angelica.moreno@shiftpn.ec",
    mapSrc: "/assets/images/aboutus/Ecuador.svg",
  },
  {
    name: "El Salvador",
    title: "El Salvador",
    description: "San Salvador",
    location: "85 Avenida Nte., #619 San Salvador",
    phone: "+503 7069-0896",
    email: "cferreiro@shiftpn.sv",
    mapSrc: "/assets/images/aboutus/El Salvador.svg",
  },
  {
    name: "Guatemala",
    title: "Guatemala",
    description: "Ciudad de Guatemala",
    location: "5 avenida 5-55 zona 14, Edificio Europlaza, Torre 2, Nivel 10, Oficina",
    phone: "+502 2388-5100",
    email: "andreagan@shiftpn.gt",
    mapSrc: "/assets/images/aboutus/Guatemala.svg",
  },
  {
    name: "Honduras",
    title: "Honduras",
    description: "Tegucigalpa",
    location: "Blvd. Suyapa, Torre Metropolis II, piso 23",
    phone: "+504 9453-8228",
    email: "maria.calvo@shift-pn.hn",
    mapSrc: "/assets/images/aboutus/Honduras.svg",
  },
  {
    name: "Nicaragua",
    title: "Nicaragua",
    description: "Managua",
    location: "Ofiplaza El Retiro Edificio 6, Piso 1, Suite 614, Managua",
    phone: "+505 2254-7627",
    email: "rmontenegro@shiftpn.com.ni",
    mapSrc: "/assets/images/aboutus/Nicaragua.svg",
  },
  {
    name: "Panamá",
    title: "Panamá",
    description: "Lugar lugar lugar",
    location: "Financial Park, Piso 6. Costa del este, Juan Díaz, ciudad de Panamá",
    phone: "+507 269 3835",
    email: "jjaltmann@omgcr.com",
    mapSrc: "/assets/images/aboutus/Honduras.svg",
  },
  {
    name: "Rep. Dominicana",
    title: "Rep. Dominicana",
    description: "Santo Domingo",
    location: "Av. Abraham Lincoln 1061, Piantini. Santo Domingo, Rep. Dominicana",
    phone: "809-274-6813",
    email: "andrea.ramirez@caribbeanpn.com",
    mapSrc: "/assets/images/aboutus/Rep. Dominicana.svg",
  },
  {
    name: "Venezuela",
    title: "Venezuela",
    description: "Caracas",
    location: "Dirección por confirmar",
    phone: "+34 663 20 83 20",
    email: "holahola@shiftpn.com",
    mapSrc: "/assets/images/aboutus/Costa Rica.svg",
  },
  {
    name: "Miami",
    title: "Miami (Shift US)",
    description: "Coral Gables, Florida",
    location: "Oficina afiliada para mercado hispano US",
    phone: "+1 786 973 6648",
    email: "holahola@shiftpn.com",
    mapSrc: "/assets/images/aboutus/Costa Rica.svg",
  },
];

export default function HomeIntroSection() {
  const [activeOffice, setActiveOffice] = useState<number | null>(null);
  const [activeMobileOffice, setActiveMobileOffice] = useState<number | null>(null);

  return (
    <section className="relative  mb-10 w-full max-w-full overflow-x-hidden bg-white md:my-12">
      <div className="relative z-10 mx-auto w-full max-w-[1815px] overflow-x-hidden px-5 py-8 md:px-12 md:py-16 lg:px-20">
        <div className="w-full">
          <div className="sm:flex-row sm:justify-between gap-[70px] sm:gap-0">

            <h2 className="max-w-[632px] mt-4 sm:mt-6 text-3xl sm:text-[50px] [font-family:var(--font-glitz-local)] font-normal leading-[1.08] text-[#0E1745]">
              Nuestra presencia regional
            </h2>

            <p className="mt-2 sm:mt-4 max-w-[770px] sm:max-w-[565px] text-sm sm:text-lg leading-tight text-[#111A31] [font-family:var(--font-fira-sans)]">
              Esta estructura nos permite activar estrategias con coherencia global y ejecución local.
            </p>

            <div
              className="mt-10 hidden w-full min-w-0 overflow-hidden pb-2 lg:flex lg:gap-4"
              onMouseLeave={() => setActiveOffice(null)}
            >
              {regionalOffices.map((item, index) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveOffice(index)}
                  className={`group relative flex h-[425px] min-w-0 basis-0 overflow-hidden rounded-[20px] transition-all duration-500 ease-out ${activeOffice === index
                    ? "grow-[2.5] lg:grow-2.1 border border-[#1534DC] bg-white"
                    : "grow bg-[#1534DC]"
                    }`}
                >
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${activeOffice === index ? "opacity-0" : "opacity-100"
                      }`}
                  >
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-center text-[44px]  leading-none text-white [font-family:var(--font-glitz-local)]">
                      {item.name}<span className="text-[#F540FF] relative top-0.5">.</span>
                    </span>
                  </div>

                  <div
                    className={`absolute inset-0 flex flex-col bg-white p-5 transition-all duration-300 ${activeOffice === index
                      ? "opacity-100"
                      : "pointer-events-none translate-x-4 opacity-0"
                      }`}
                  >
                    <div>
                      <h3 className="text-[#E93CFF] text-3xl xl-text-[35px] leading-[0.95] [font-family:var(--font-glitz-local)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-[#E93CFF] text-[18px] font-semibold leading-[1.1] [font-family:var(--font-fira-sans)]">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-auto space-y-4 text-[13px] max-w-[233px] font-semibold leading-[1.2] text-[#0E1745] [font-family:var(--font-fira-sans)]">
                      <p className="flex items-center gap-2">
                        <Image
                          src="/assets/images/aboutus/location.png"
                          alt={`Icono de ubicación — oficina ${item.title}`}
                          aria-hidden
                          width={16}
                          height={16}
                          className="shrink-0"
                        />
                        <span className="text-[#1534DC] text-[13px] font-semibold leading-tight [font-family:var(--font-fira-sans)]">{item.location}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Image
                          src="/assets/images/aboutus/phone.png"
                          alt={`Icono de teléfono — oficina ${item.title}`}
                          aria-hidden
                          width={16}
                          height={16}
                          className="shrink-0"
                        />
                        <span className="text-[#1534DC] text-[13px] font-semibold [font-family:var(--font-fira-sans)]">{item.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Image
                          src="/assets/images/aboutus/mail.png"
                          alt={`Icono de correo — oficina ${item.title}`}
                          aria-hidden
                          width={16}
                          height={16}
                          className="shrink-0"
                        />
                        <span className="text-[#1534DC] text-[13px] font-semibold truncate [font-family:var(--font-fira-sans)]">{item.email}</span>
                      </p>
                    </div>

                    <div className="mt-6 overflow-hidden">
                      <Image
                        src={item.mapSrc}
                        alt={`Mapa de ubicación de la oficina ${item.title}`}
                        width={280}
                        height={140}
                        className="h-[120px] w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid w-full grid-cols-3 gap-2.5 min-[500px]:grid-cols-4 lg:hidden">
              {regionalOffices.map((item, index) => (
                <button
                  key={`mobile-${item.name}`}
                  type="button"
                  onClick={() =>
                    setActiveMobileOffice((current) => (current === index ? null : index))
                  }
                  className={`relative min-h-[250px] overflow-hidden rounded-[14px] transition-all duration-300 ${activeMobileOffice === index
                    ? "col-span-2 h-[250px] border border-[#E5E7EB] bg-white p-3 text-left"
                    : "flex h-[250px] items-center justify-center bg-[#1534DC] px-1"
                    }`}
                >
                  {activeMobileOffice === index ? (
                    <div className="flex h-full flex-col">
                      <div>
                        <h3 className="text-[#E93CFF] text-[22px] font-bold leading-[0.95] [font-family:var(--font-glitz-local)]">
                          {item.title}xx
                        </h3>
                        <p className="mt-1 text-[#E93CFF] text-[12px] leading-[1.1] [font-family:var(--font-fira-sans)]">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-auto space-y-1 text-[10px] leading-[1.15] text-[#0E1745] [font-family:var(--font-fira-sans)]">
                        <p className="flex items-center gap-1.5">
                          <Image
                            src="/assets/images/aboutus/location.png"
                            alt={`Icono de ubicación — oficina ${item.title}`}
                            aria-hidden
                            width={12}
                            height={12}
                            className="h-3 w-3 shrink-0"
                          />
                          <span className="text-[#1534DC]">{item.location}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Image
                            src="/assets/images/aboutus/phone.png"
                            alt={`Icono de teléfono — oficina ${item.title}`}
                            aria-hidden
                            width={12}
                            height={12}
                            className="h-3 w-3 shrink-0"
                          />
                          <span className="text-[#1534DC]">{item.phone}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Image
                            src="/assets/images/aboutus/mail.png"
                            alt={`Icono de correo — oficina ${item.title}`}
                            aria-hidden
                            width={12}
                            height={12}
                            className="h-3 w-3 shrink-0"
                          />
                          <span className="text-[#1534DC]">{item.email}</span>
                        </p>
                      </div>

                      <div className="mt-2 overflow-hidden rounded-[12px] border border-[#E5E7EB] bg-[#F8FAFF]">
                        <Image
                          src={item.mapSrc}
                          alt={`Mapa de ubicación de la oficina ${item.title}`}
                          width={280}
                          height={120}
                          className="h-[86px] w-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap text-[20px] font-bold leading-none text-white [font-family:var(--font-glitz-local)]">
                      {item.name}
                    </span>
                  )}
                </button>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect } from "react";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";

const MAP_SRC = "/assets/images/regional/Vector.svg";
const MAP_VEC_SRC = "/assets/images/regional/vec.svg";

type RegionalPoint = {
  id: string;
  label: string;
  top: string;
  left: string;
};

const REGIONAL_POINTS: RegionalPoint[] = [
  { id: "mexico", label: "México", top: "35%", left: "28%" },
  { id: "El Salvador", label: "El Salvador", top: "39%", left: "34%" },
  { id: "honduras", label: "Honduras", top: "43.8%", left: "34%" },
  { id: "guatemala", label: "Guatemala", top: "48.5%", left: "28%" },
  { id: "republica-dominicana", label: "República Dominicana", top: "42.8%", left: "47.5%", },
  { id: "nicaragua", label: "Nicaragua", top: "48%", left: "40.3%" },
  { id: "panama", label: "Panamá", top: "51.6%", left: "46.3%" },
  { id: "costa-rica", label: "Costa Rica", top: "55.2%", left: "38.6%" },
  { id: "colombia", label: "Colombia", top: "57.6%", left: "55.3%" },
  { id: "ecuador", label: "Ecuador", top: "64.8%", left: "46.8%" },
  { id: "peru", label: "Perú", top: "72.3%", left: "52.4%" },
  { id: "chile", label: "Chile", top: "82.3%", left: "52.4%" },
];

function RegionalCapabilitiesMarkers({
  activeId,
  onActivate,
  onDeactivate,
  isTiny320,
}: {
  activeId: string | null;
  onActivate: (id: string) => void;
  onDeactivate: () => void;
  isTiny320: boolean;
}) {
  const [isBelowMobile, setIsBelowMobile] = useState(false);
  const [isBelow600, setIsBelow600] = useState(false);
  const [isBelow300, setIsBelow300] = useState(false);
  /** 768px–1200px: shift markers right on the map (+20 to left %). */
  const [isTabletWideMap, setIsTabletWideMap] = useState(false);

  const below300Overrides: Record<string, { top: string; left: string }> = {
    mexico: { top: "35.5%", left: "21.5%" },
    "El Salvador": { top: "39.5%", left: "36.5%" },
    honduras: { top: "44.5%", left: "36.5%" },
    guatemala: { top: "48%", left: "31.2%" },
  };

  const below600Overrides: Record<string, { top: string; left: string }> = {
    ecuador: { top: "58.8%", left: "60.2%" },
    peru: { top: "64.2%", left: "70.8%" },
    chile: { top: "70.8%", left: "66%" },
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const w = window.innerWidth;
      setIsBelowMobile(w < 650);
      setIsBelow600(w < 600 && w >= 350);
      setIsBelow300(w < 350);
      setIsTabletWideMap(w >= 768 && w <= 1200);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const getAdjustedPoint = (point: RegionalPoint) => {
    let adjusted: RegionalPoint = { ...point };

    if (isBelow300 && below300Overrides[point.id]) {
      adjusted = { ...adjusted, ...below300Overrides[point.id] };
    } else if (isBelow600 && below600Overrides[point.id]) {
      adjusted = { ...adjusted, ...below600Overrides[point.id] };
    } else if (isTiny320) {
      const topValue = parseFloat(adjusted.top);
      const leftValue = parseFloat(adjusted.left);
      adjusted = {
        ...adjusted,
        top: `${Math.max(0, topValue - 10)}%`,
        left: `${Math.max(0, leftValue + 20)}%`,
      };
    } else if (isBelowMobile) {
      const topValue = parseFloat(adjusted.top);
      const leftValue = parseFloat(adjusted.left);
      adjusted = {
        ...adjusted,
        top: `${Math.max(0, topValue + 2)}%`,
        left: `${Math.max(0, leftValue + 10)}%`,
      };
    }

    if (isTabletWideMap) {
      const leftValue = parseFloat(adjusted.left);
      adjusted = {
        ...adjusted,
        left: `${Math.min(100, leftValue + 10)}%`,
      };
    }

    return adjusted;
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {REGIONAL_POINTS.map((point) => {
        const adjustedPoint = getAdjustedPoint(point);
        const isActive = activeId === point.id;
        return (
          <div
            key={point.id}
            className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 ${isActive ? "z-[100]" : "z-10"}`}
            style={{ top: adjustedPoint.top, left: adjustedPoint.left }}
          >
            <button
              type="button"
              onMouseEnter={() => onActivate(point.id)}
              onMouseLeave={onDeactivate}
              onFocus={() => onActivate(point.id)}
              onBlur={onDeactivate}
              onClick={() => onActivate(point.id)}
              className={`relative z-10 h-4 w-4 rounded-[5px] bg-[#1D4ED8] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E93CFF] focus-visible:ring-offset-2 sm:h-7 sm:w-7 sm:rounded-[7px] md:h-6 md:w-6 md:rounded-[6px] lg:h-[34px] lg:w-[34px] lg:rounded-[8px] ${activeId === point.id
                ? "scale-90 opacity-0"
                : "scale-100 opacity-100"
                }`}
              aria-label={point.label}
              aria-pressed={activeId === point.id}
            />
            <div
              className={`pointer-events-none absolute left-0 top-1/2 flex h-4 -translate-y-1/2 items-center whitespace-nowrap rounded-[5px] bg-[#E93CFF] px-1.5 text-[9px] font-bold leading-none text-white shadow-[0_10px_22px_rgba(233,60,255,0.35)] transition-all duration-300 ease-out sm:h-7 sm:rounded-[7px] sm:px-3 sm:text-[12px] md:h-6 md:rounded-[6px] md:px-2.5 md:text-[11px] lg:h-[34px] lg:rounded-[8px] lg:px-4 lg:text-[14px] ${isActive ? "z-50 scale-100 opacity-100" : "z-20 scale-95 opacity-0"
                }`}
            >
              {point.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HomeRegionalCapabilitiesSection() {
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [isTiny320, setIsTiny320] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsTiny320(window.innerWidth < 375);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto w-full max-w-[1380px] px-5 sm:px-8 lg:px-16">
        <div className="relative pb-12 sm:pb-14 lg:pb-20">
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:gap-0">
            <div className="relative z-10  w-full h-[640px] lg:h-[1010px] lg:w-[90%]">
              <div className="absolute inset-[0%_2%_0%_0%] overflow-hidden lg:inset-[0%_1%_0%_8%]">
                <div className="absolute top-0 inset-x-0 bottom-0">
                  <div
                    className="absolute inset-0 left-0 md:left-[14%] lg:left[40%] top-0 lg:left-0 bg-cover bg-top bg-no-repeat sm:bg-contain sm:bg-top-left lg:bg-contain lg:bg-top-left"
                    style={{
                      backgroundImage: `url(${MAP_SRC})`,
                      backgroundPosition: isTiny320 ? "50% top" : undefined,
                    }}
                  />
                  <RegionalCapabilitiesMarkers
                    activeId={activePointId}
                    onActivate={setActivePointId}
                    onDeactivate={() => setActivePointId(null)}
                    isTiny320={isTiny320}
                  />
                </div>
              </div>

              <div className="absolute bottom-2 left-0 z-20 w-full max-w-[360px] sm:bottom-6 lg:bottom-8 lg:left-1 lg:block">
                <h2 className="font-glitz text-[1.75rem]  leading-[1.04] text-[#111F5C] sm:text-[2rem] lg:text-[50px]">
                  Capacidades
                  <br />
                  Regionales
                </h2>
                <p className="mt-4 max-w-[28ch] font-sans text-[13px] font-normal leading-snug text-[#1F2A44] sm:max-w-[36ch] sm:text-[14px] lg:text-[18px] lg:leading-[20px]">
                  Con presencia en Centroamérica, Caribe y Sudamérica, activamos campañas,
                  reputación y performance en múltiples mercados con coherencia y gobernanza
                  regional.
                </p>
                <div className="pt-6">
                  <OutlineArrowButton
                    label="Ver más"
                    href="/about-us"
                    buttonClassName="sm:gap-[42.5px]!"
                  />
                </div>
              </div>
            </div>
            {/* <div className="mt-6 max-w-[360px] lg:hidden">
              <h2 className="font-sans text-[1.75rem] font-bold leading-[1.04] tracking-tight text-[#111F5C] sm:text-[2rem]">
                Capacidades
                <br />
                Regionales
              </h2>
              <p className="mt-3 max-w-[36ch] font-sans text-[13px] font-normal leading-snug text-[#1F2A44] sm:mt-4 sm:text-[14px]">
                Con presencia en Centroamérica, Caribe y Sudamérica, activamos campañas,
                reputación y performance en múltiples mercados con coherencia y gobernanza
                regional.
              </p>
              <div className="pt-6">
                <OutlineArrowButton
                  label="Ver más"
                  buttonClassName="!gap-3 !border-[#1D4ED8] !bg-transparent !py-1.5 !pl-4 !pr-2 !text-[14px] !font-semibold !text-[#1D4ED8] hover:!pr-8 sm:!gap-8 sm:!py-2 sm:!pl-5 sm:!pr-2.5 sm:!text-[16px] sm:hover:!pr-12"
                  iconWrapperClassName="!h-7 !w-7 !border-[#1D4ED8] sm:!h-9 sm:!w-9 sm:group-hover:!translate-x-10 !group-hover:!translate-x-7"
                  iconClassName="!w-3 sm:!w-4"
                />
              </div>
            </div> */}
          </div>
        </div>

        <div
          className="relative hidden lg:block lg:h-[710px] lg:w-[28%]"
          style={{ position: "absolute", top: "0px", right: "0px" }}
        >
          <img
            src={MAP_VEC_SRC}
            alt="Ilustración vectorial complementaria del mapa regional de Shift Latam"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-contain object-right"
          />
        </div>
      </div>
      <div className="h-10 md:h-20"></div>
    </section>
  );
}

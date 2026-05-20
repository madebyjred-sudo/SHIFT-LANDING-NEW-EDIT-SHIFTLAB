"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import FooterSpring from "@/components/ui/FooterSpring";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";
import { HUB_OPTIONS, type HubOption } from "@/app/contact/hubs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPrimaryFormSectionProps = {
  showFooterSpring?: boolean;
};

export default function ContactPrimaryFormSection({
  showFooterSpring = true,
}: ContactPrimaryFormSectionProps) {
  const botTrapRef = useRef<HTMLInputElement | null>(null);
  const hubMenuContainerRef = useRef<HTMLSpanElement | null>(null);
  const [isHubMenuOpen, setIsHubMenuOpen] = useState(false);
  const [isDesktopHover, setIsDesktopHover] = useState(false);
  const [selectedHub, setSelectedHub] = useState<HubOption>("Costa Rica (Hub)");
  const [formValues, setFormValues] = useState({
    idea: "",
    email: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    idea: "",
    email: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const getIdeaError = (value: string) =>
    !value.trim() ? "Contanos brevemente tu proyecto." : "";

  const getEmailError = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "El correo es obligatorio.";
    if (!EMAIL_REGEX.test(trimmed)) return "Ingresá un correo válido.";
    return "";
  };

  const validateField = (field: "idea" | "email", value: string) => {
    const error = field === "idea" ? getIdeaError(value) : getEmailError(value);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleInputChange = (field: "idea" | "email", value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (hasSubmitted) {
      validateField(field, value);
    }
  };

  const handleHubSelect = (hub: HubOption) => {
    setSelectedHub(hub);
    setIsHubMenuOpen(false);
  };

  const validateForm = () => {
    const nextErrors = {
      idea: getIdeaError(formValues.idea),
      email: getEmailError(formValues.email),
    };
    setFieldErrors(nextErrors);
    return !nextErrors.idea && !nextErrors.email;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setHasSubmitted(true);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hub: selectedHub,
          idea: formValues.idea.trim(),
          email: formValues.email.trim(),
          bot_trap: botTrapRef.current?.value ?? "",
        }),
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };

      if (response.status === 429) {
        setSubmitError(data.message || "Demasiados intentos. Probá más tarde.");
        return;
      }

      if (!response.ok || !data.ok) {
        setSubmitError(data.message || "No se pudo enviar el mensaje.");
        return;
      }

      setSubmitSuccess("Mensaje enviado con éxito. Te contactaremos pronto.");
      setHasSubmitted(false);
      setFormValues({ idea: "", email: "" });
      setFieldErrors({ idea: "", email: "" });
    } catch {
      setSubmitError("Ocurrió un error de conexión. Intentalo nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitError) {
      setTimeout(() => {
        setSubmitError("");
      }, 5000)
    }
    if (submitSuccess) {
      setTimeout(() => {
        setSubmitSuccess("");
      }, 5000)
    }
  }, [submitError, submitSuccess])

  useEffect(() => {
    const hoverMediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const syncHoverCapability = () => {
      setIsDesktopHover(hoverMediaQuery.matches);
    };

    syncHoverCapability();
    hoverMediaQuery.addEventListener("change", syncHoverCapability);

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node | null;
      if (!targetNode) return;

      if (!hubMenuContainerRef.current?.contains(targetNode)) {
        setIsHubMenuOpen(false);
      }
    };


    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      hoverMediaQuery.removeEventListener("change", syncHoverCapability);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#E7EAF8]">
      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-[980px]">
          <h2 className="text-center text-2xl font-semibold leading-[0.95] text-[#1534DC] sm:text-5xl md:text-[50px]">
            <span className="hidden text-center sm:inline [font-family:Glitz] [font-style:normal] [leading-trim:none] font-normal leading-[100%] tracking-[0]">
              Tenés un proyecto en mente?
              <br />
              Arranquemos en  {" "}
            </span>
            <span className="inline sm:hidden font-glitz font-normal">
              Tenés un proyecto
              <br />
              en mente? Arranquemos en  {" "}
              <br />
            </span>
            <span
              ref={hubMenuContainerRef}
              className="relative inline-flex items-center"
              onMouseEnter={() => {
                if (isDesktopHover) setIsHubMenuOpen(true);
              }}
              onMouseLeave={() => {
                if (isDesktopHover) setIsHubMenuOpen(false);
              }}
            >
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isHubMenuOpen}
                onClick={() => setIsHubMenuOpen((prev) => !prev)}
                className={`group inline-flex items-center gap-3 hover:text-[#111A31] ${isHubMenuOpen ? "text-[#111A31]" : "text-[#F540FF]"
                  }`}
              >
                <span className="[font-family:Glitz] [font-style:normal] [leading-trim:none]  font-normal leading-[44px] tracking-[0]">
                  {selectedHub}
                </span>
                <Image
                  src="/assets/svg/chevron-down.svg"
                  alt="Icono para abrir la lista de sedes"
                  aria-hidden
                  width={28}
                  height={16}
                  className={`group-hover:brightness-0 scale-50 relative top-0 right-1 sm:scale-100 sm:top-0 sm:right-0 ${isHubMenuOpen ? "rotate-180 brightness-0" : ""}`}
                />
              </button>

              {isHubMenuOpen && (
                <ul
                  role="listbox"
                  className="[font-family:Glitz] [font-style:normal] [leading-trim:none] absolute left-1/2 top-full z-20 mt-0 w-[80vw] max-w-[300px] -translate-x-1/2 transform rounded-sm bg-white p-5 text-left text-xl leading-[1.35] text-[#1534DC] sm:left-0 sm:translate-x-0 sm:min-w-[320px] sm:text-2xl"
                >
                  {HUB_OPTIONS.filter((hub) => hub !== selectedHub).map((hub) => (
                    <li key={hub}>
                      <button
                        type="button"
                        onClick={() => handleHubSelect(hub)}
                        className="block w-full text-left hover:opacity-70 font-light"
                      >
                        {hub}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </span>
          </h2>

          <form className="mt-10 sm:mt-12" onSubmit={handleSubmit} noValidate>
            <input
              ref={botTrapRef}
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              defaultValue=""
              className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <label className={`relative block ${hasSubmitted ? fieldErrors.idea ? "mb-4 sm:mb-0" : "" : ""}`}>
              <span className="sr-only [font-family:font/family/sub-title] [font-style:normal] [leading-trim:none] text-2xl font-normal leading-[40px] tracking-[0]">
                ¿Qué estás pensando?
              </span>
              <textarea
                name="idea"
                placeholder="¿Qué estás pensando?"
                rows={6}
                maxLength={8000}
                value={formValues.idea}
                onChange={(event) => handleInputChange("idea", event.target.value)}
                className="w-full rounded-[20px] border border-[#1534DC] bg-transparent px-5 py-4  text-md sm:text-2xl text-[#1534DC] outline-none placeholder:text-[#1534DC] placeholder:opacity-90"
              />
              {hasSubmitted ? (
                <p
                  className={`absolute left-5 top-full -mt-1.5 text-sm ${fieldErrors.idea ? "text-red-600" : "invisible"}`}
                  role={fieldErrors.idea ? "alert" : undefined}
                  aria-live="polite"
                >
                  {fieldErrors.idea || "\u00a0"}
                </p>
              ) : null}
            </label>

            <div className="relative mt-1 sm:mt-4">
              <div className="flex flex-col gap-4 md:flex-row md:gap-20 md:items-center">
                <label className="block min-w-0 flex-1">
                  <span className="sr-only">Email</span>
                  <div className={`relative ${hasSubmitted ? fieldErrors.email ? "mb-2 sm:mb-0" : "" : ""}`}>
                    <span className="pointer-events-none font-medium absolute left-5 top-1/2 -translate-y-1/2 text-md sm:text-2xl text-[#1534DC]">
                      Email:
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="asuntoemail@gmail.com"
                      maxLength={254}
                      value={formValues.email}
                      onChange={(event) => handleInputChange("email", event.target.value)}
                      className="h-14 w-full rounded-[20px] border border-[#1534DC] bg-transparent pl-18 sm:pl-24 pr-5 text-md sm:text-2xl text-[#1534DC] outline-none placeholder:text-[#A3ABD0]"
                    />
                    {hasSubmitted ? (
                      <p
                        className={`absolute left-5 top-full  text-sm ${fieldErrors.email ? "text-red-600" : "invisible"}`}
                        role={fieldErrors.email ? "alert" : undefined}
                        aria-live="polite"
                      >
                        {fieldErrors.email || "\u00a0"}
                      </p>
                    ) : null}
                  </div>
                </label>
                <div className="mx-auto flex w-full justify-center md:justify-start md:mx-0 md:w-[336px] md:min-w-[336px] md:max-w-[336px] md:shrink-0">
                  <OutlineArrowButton
                    type="submit"
                    disabled={isSubmitting}
                    label={isSubmitting ? <span className="relative"><span className="opacity-0">Hablemos</span><span className="absolute top-0 left-0">Enviando...</span></span> : "Hablemos"}
                    iconClassName="group-hover:brightness-0 group-hover:invert group-active:brightness-0 group-active:invert"
                    iconWrapperClassName="ml-5 sm:ml-0 sm:h-10! sm:w-10! group-hover:border-white group-active:border-white"
                    buttonClassName="py-2! sm:py-2! hover:text-white hover:bg-[#1534DC]! active:text-white active:bg-[#1534DC]! disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
            <div className="relative mt-4 min-h-5">
              <p
                className={`absolute inset-x-0 top-0 text-sm ${submitError ? "text-red-600" : "invisible"}`}
                role={submitError ? "alert" : undefined}
                aria-live="polite"
              >
                {submitError || "\u00a0"}
              </p>
              <p
                className={`absolute inset-x-0 top-0 text-sm ${submitSuccess ? "text-green-700" : "invisible"}`}
                role={submitSuccess ? "status" : undefined}
                aria-live="polite"
              >
                {submitSuccess || "\u00a0"}
              </p>
            </div>
          </form>
        </div>
        {showFooterSpring && (
          <div className="absolute  bottom-[-5px] left-[10%] md:left-[0%] flex w-full justify-start lg:mt-10">
            <div className="block leading-0">
              <FooterSpring />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

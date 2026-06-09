"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";
import SocialLinks from "@/components/ui/SocialLinks";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/cacporternovelli/?locale=es_LA",
    icon: "/assets/svg/footer/facebook-blue.svg",
    hoverIcon: "/assets/svg/footer/facebook-white.svg",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/shiftlatampn/",
    icon: "/assets/svg/footer/instagram-blue.svg",
    hoverIcon: "/assets/svg/footer/instagram-white.svg",
  },
  {
    name: "LinkedIn",
    href: "https://cr.linkedin.com/company/shiftlatamporternovelli",
    icon: "/assets/svg/footer/linkedIn-blue.svg",
    hoverIcon: "/assets/svg/footer/linkedIn-white.svg",
  },
];

type FormFieldKey =
  | "formInfoUno"
  | "formInfoDos"
  | "formInfoTres"
  | "formInfoCuatro"
  | "formInfoCinco";

const FORM_FIELDS: { key: FormFieldKey; label: string }[] = [
  { key: "formInfoUno", label: "Nombre completo" },
  { key: "formInfoDos", label: "Correo electrónico" },
  { key: "formInfoTres", label: "Contacto móvil" },
  { key: "formInfoCuatro", label: "Servicio requerido" },
  { key: "formInfoCinco", label: "Briefing adicional" },
];

function ContactInput({
  label,
  name,
  value,
  onChange,
  error,
  showErrorSlot,
  className,
  labelClassName,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showErrorSlot: boolean;
  className?: string;
  labelClassName?: string;
}) {
  return (
    <label className={`relative block ${showErrorSlot ? "" : ""} ${className ?? ""}`}>
      <span
        className={`font-[Figtree] font-bold not-italic [leading-trim:none] tracking-normal mb-2 block pl-5 md:pl-8 text-base leading-none text-[#1534DC] md:text-2xl ${labelClassName ?? ""}`}
      >
        {label}
      </span>
      <input
        type="text"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Respuesta"
        maxLength={500}
        className="h-[42px] md:h-14 w-full md:pl-8 rounded-[15px] border border-[#1534DC] bg-[#E7EAF8] px-5 text-lg sm:text-2xl text-[#1534DC] outline-none placeholder:text-[#1534DC] placeholder:opacity-80"
      />
      {showErrorSlot ? (
        <p
          className={`absolute left-5 top-full mt-0 text-sm md:left-8 ${error ? "text-red-600" : "invisible"}`}
          role={error ? "alert" : undefined}
          aria-live="polite"
        >
          {error || "\u00a0"}
        </p>
      ) : null}
    </label>
  );
}

export default function ContactDetailsSection() {
  const botTrapRef = useRef<HTMLInputElement | null>(null);
  const [formValues, setFormValues] = useState<Record<FormFieldKey, string>>({
    formInfoUno: "",
    formInfoDos: "",
    formInfoTres: "",
    formInfoCuatro: "",
    formInfoCinco: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<FormFieldKey, string>>({
    formInfoUno: "",
    formInfoDos: "",
    formInfoTres: "",
    formInfoCuatro: "",
    formInfoCinco: "",
  });
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const getFieldError = (value: string) =>
    !value.trim() ? "Este campo es obligatorio." : "";

  const validateField = (field: FormFieldKey, value: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: getFieldError(value) }));
  };

  const validateForm = (values: Record<FormFieldKey, string>) => {
    const nextErrors = {} as Record<FormFieldKey, string>;
    let isValid = true;

    for (const { key } of FORM_FIELDS) {
      const error = getFieldError(values[key]);
      nextErrors[key] = error;
      if (error) isValid = false;
    }

    setFieldErrors(nextErrors);
    return isValid;
  };

  const handleInputChange = (field: FormFieldKey, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (hasSubmitted) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    setHasSubmitted(true);

    if (!validateForm(formValues)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact/hubspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formInfoUno: formValues.formInfoUno.trim(),
          formInfoDos: formValues.formInfoDos.trim(),
          formInfoTres: formValues.formInfoTres.trim(),
          formInfoCuatro: formValues.formInfoCuatro.trim(),
          formInfoCinco: formValues.formInfoCinco.trim(),
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
      setFormValues({
        formInfoUno: "",
        formInfoDos: "",
        formInfoTres: "",
        formInfoCuatro: "",
        formInfoCinco: "",
      });
      setFieldErrors({
        formInfoUno: "",
        formInfoDos: "",
        formInfoTres: "",
        formInfoCuatro: "",
        formInfoCinco: "",
      });
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

  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-16 sm:px-10 sm:py-20 lg:py-28 lg:px-16">
        <form className="mx-auto max-w-[980px]" onSubmit={handleSubmit} noValidate>
          <input
            ref={botTrapRef}
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            defaultValue=""
            className="pointer-events-none absolute left-[-9999px] h-0 w-0 opacity-0"
          />
          <div className="flex flex-col min-[400px]:flex-row gap-4">
            <ContactInput
              label={FORM_FIELDS[0].label}
              name={FORM_FIELDS[0].key}
              value={formValues.formInfoUno}
              onChange={(value) => handleInputChange("formInfoUno", value)}
              error={fieldErrors.formInfoUno}
              showErrorSlot={hasSubmitted}
              className="sm:flex-[55%] w-full"
            />
            <ContactInput
              label={FORM_FIELDS[1].label}
              name={FORM_FIELDS[1].key}
              value={formValues.formInfoDos}
              onChange={(value) => handleInputChange("formInfoDos", value)}
              error={fieldErrors.formInfoDos}
              showErrorSlot={hasSubmitted}
              className="sm:flex-[45%] w-full"
            />
          </div>
          <div className="flex flex-col min-[400px]:flex-row gap-4 mt-4 sm:mt-6">
            <ContactInput
              label={FORM_FIELDS[2].label}
              name={FORM_FIELDS[2].key}
              value={formValues.formInfoTres}
              onChange={(value) => handleInputChange("formInfoTres", value)}
              error={fieldErrors.formInfoTres}
              showErrorSlot={hasSubmitted}
              className="sm:flex-[45%] w-full"
            />
            <ContactInput
              label={FORM_FIELDS[3].label}
              name={FORM_FIELDS[3].key}
              value={formValues.formInfoCuatro}
              onChange={(value) => handleInputChange("formInfoCuatro", value)}
              error={fieldErrors.formInfoCuatro}
              showErrorSlot={hasSubmitted}
              className="sm:flex-[55%] w-full"
            />
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col items-end gap-4 sm:gap-14 min-[400px]:flex-row">
            <div className="min-w-0 flex-1 w-full">
              <ContactInput
                label={FORM_FIELDS[4].label}
                name={FORM_FIELDS[4].key}
                value={formValues.formInfoCinco}
                onChange={(value) => handleInputChange("formInfoCinco", value)}
                error={fieldErrors.formInfoCinco}
                showErrorSlot={hasSubmitted}
              />
            </div>
            <div className="mr-auto mt-3 flex flex-1 justify-start md:mx-0 md:mt-0 md:w-[336px] md:min-w-[336px] md:max-w-[336px] md:shrink-0 sm:mt-0 md:flex-none">
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

        <div className="mx-auto mt-16 sm:mt-20 lg:mt-28 max-w-[1380px] rounded-3xl border border-[#1534DC] px-6 py-8 sm:px-12 sm:py-12">
          <div className="grid grid-cols-1 gap-7 sm:gap-13 lg:gap-10 lg:grid-cols-2">
            <div className="space-y-6 sm:space-y-12">
              <div>
                <p className="text-md sm:text-2xl leading-none text-[#1534DC]">Consultas</p>
                <Link
                  href="mailto:fmartinez@shiftpn.co.cr"
                  className="mt-3 font-glitz font-normal block text-lg sm:text-[32px] leading-none text-[#1534DC]"
                >
                  fmartinez@shiftpn.co.cr
                </Link>
              </div>
              <div className="lg:pb-10">
                <p className="text-md sm:text-2xl leading-none text-[#1534DC]">New Business</p>
                <Link
                  href="mailto:rcastro@shiftpn.co.cr"
                  className="mt-3 font-glitz font-normal block text-lg sm:text-[32px]  leading-none text-[#1534DC]"
                >
                  rcastro@shiftpn.co.cr
                </Link>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <p className="text-md sm:text-2xl leading-none text-[#1534DC]">RRSS</p>
              <div className="mt-5 items-center gap-3 hidden sm:flex">
                <SocialLinks socialLinks={socialLinks} size="lg" containerClassName="border-[#1534DC]! hover:border-[#1534DC]!" />
              </div>
              <div className="mt-3 flex items-center gap-2 sm:hidden">
                <SocialLinks socialLinks={socialLinks} size="sm" containerClassName="border-[#1534DC]! hover:border-[#1534DC]!" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
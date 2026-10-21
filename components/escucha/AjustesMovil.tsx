/* Ajustes globales solo para las landings de escucha en teléfono: la burbuja
 * rotativa de Shifty («Hablemos.», «¿Necesitas ayuda?») flota sobre el formulario
 * y las escenas. En pantallas chicas se oculta; el botón de Shifty sigue ahí. */
export default function AjustesMovil() {
  return <style>{`@media (max-width: 639px){.shifty-agent-island > :not(:last-child){display:none !important}}`}</style>;
}

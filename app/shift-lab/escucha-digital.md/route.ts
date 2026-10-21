import { SITE_URL } from "@/app/seo";
import { escuchaMd, respuestaMd } from "@/lib/md/sitio";

export const dynamic = "force-static";

export function GET() {
  return respuestaMd(escuchaMd("escucha-digital"), `${SITE_URL}/shift-lab/escucha-digital`);
}

import { SITE_URL } from "@/app/seo";
import { guiaMd, respuestaMd } from "@/lib/md/sitio";

export const dynamic = "force-static";

export async function GET() {
  return respuestaMd(await guiaMd(), `${SITE_URL}/shift-lab/guia-ia`);
}

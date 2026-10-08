// ----------------------------------------------------------------------
// Pathway de embeds del Newsroom.
// Convención: pegá un link de YouTube o LinkedIn SOLO en su propio párrafo
// dentro del contenido del artículo y se transforma en un embed responsivo.
// Siempre se hace igual — no hay que armar iframes a mano.
//
//   <p>https://www.youtube.com/watch?v=ID</p>              → video embebido 16:9
//   <p>https://www.linkedin.com/posts/...activity-ID...</p> → post embebido
//
// Solo transforma párrafos cuyo ÚNICO contenido es el link (bare o <a>).
// El resto del HTML queda intacto; los links dentro de un texto siguen siendo links.
// ----------------------------------------------------------------------

function youtubeEmbed(id: string): string {
  return (
    `<div style="position:relative;width:100%;max-width:720px;margin:2rem auto;aspect-ratio:16/9;overflow:hidden;border-radius:12px;">` +
    `<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="Video de YouTube" loading="lazy" ` +
    `style="position:absolute;inset:0;width:100%;height:100%;border:0;" ` +
    `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>` +
    `</div>`
  );
}

function linkedinEmbed(activityId: string): string {
  return (
    `<div style="max-width:552px;margin:2rem auto;">` +
    `<iframe src="https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityId}" ` +
    `style="width:100%;height:600px;border:1px solid #e5e7eb;border-radius:12px;" frameborder="0" allowfullscreen title="Publicación en LinkedIn"></iframe>` +
    `</div>`
  );
}

const YT_ID = "(?:youtube\\.com/watch\\?v=|youtu\\.be/|youtube\\.com/embed/)([A-Za-z0-9_-]{11})";
const LI_ID = "(?:[a-z]{2,3}\\.)?linkedin\\.com/posts/[^\\s\"'<]*?activity-(\\d+)";

export function embedMedia(html: string): string {
  if (!html) return html;
  let out = html;

  // YouTube — link solo en su párrafo, suelto o envuelto en <a>.
  out = out
    .replace(
      new RegExp(`<p>\\s*https?://(?:www\\.)?${YT_ID}[^\\s"'<]*\\s*</p>`, "gi"),
      (_m, id) => youtubeEmbed(id),
    )
    .replace(
      new RegExp(`<p>\\s*<a\\b[^>]*href="https?://(?:www\\.)?${YT_ID}[^"]*"[^>]*>[^<]*</a>\\s*</p>`, "gi"),
      (_m, id) => youtubeEmbed(id),
    );

  // LinkedIn — post solo en su párrafo, suelto o envuelto en <a>.
  out = out
    .replace(
      new RegExp(`<p>\\s*https?://${LI_ID}[^\\s"'<]*\\s*</p>`, "gi"),
      (_m, id) => linkedinEmbed(id),
    )
    .replace(
      new RegExp(`<p>\\s*<a\\b[^>]*href="https?://${LI_ID}[^"]*"[^>]*>[^<]*</a>\\s*</p>`, "gi"),
      (_m, id) => linkedinEmbed(id),
    );

  return out;
}

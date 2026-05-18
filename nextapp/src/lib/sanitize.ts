export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<(iframe|object|embed|form|base)(\s[^>]*)?>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(iframe|object|embed|form|base)(\s[^>]*)?\/?>/gi, "")
    .replace(/\s+on\w+="[^"]*"/gi, "")
    .replace(/\s+on\w+='[^']*'/gi, "")
    .replace(/(href|src)="javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)='javascript:[^']*'/gi, "$1='#'");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

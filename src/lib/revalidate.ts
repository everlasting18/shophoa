export async function revalidatePage(path = "/") {
  try {
    await fetch("/api/revalidate", { method: "POST", body: JSON.stringify({ path }) });
  } catch {}
}

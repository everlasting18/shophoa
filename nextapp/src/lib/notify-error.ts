export async function notifyError(title: string, detail: string) {
  const url = process.env.DISCORD_ERROR_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: `🚨 ${title}`,
          description: detail,
          color: 0xef4444,
          timestamp: new Date().toISOString(),
          footer: { text: "shophoa · auto alert" },
        }],
      }),
    });
  } catch {
    // silent — error notifier không được throw
  }
}

interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
  WALLETWALLET_API_KEY?: string;
}

interface WalletRequest {
  name?: string;
  memberId?: string;
  grade?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/wallet/membership") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }

      if (!env.WALLETWALLET_API_KEY) {
        return json({ error: "Wallet service is not configured." }, 503);
      }

      let body: WalletRequest;
      try {
        body = await request.json<WalletRequest>();
      } catch {
        return json({ error: "Invalid JSON request." }, 400);
      }

      const name = body.name?.trim();
      const memberId = body.memberId?.trim();
      const grade = body.grade?.trim();

      if (!name || !memberId || !grade) {
        return json({ error: "Name, member ID, and grade are required." }, 400);
      }

      const walletResponse = await fetch("https://api.walletwallet.dev/api/passes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.WALLETWALLET_API_KEY}`,
        },
        body: JSON.stringify({
          barcodeValue: memberId,
          barcodeFormat: "QR",
          barcodeAltText: memberId,
          logoText: "DTPBC",
          organizationName: "David Thompson Pickleball Club",
          description: `DTPBC membership card for ${name}`,
          primaryFields: [
            { label: "MEMBER", value: name },
          ],
          secondaryFields: [
            { label: "CLUB ID", value: memberId },
            { label: "GRADE", value: grade },
            { label: "STATUS", value: "Active Member" },
          ],
          colorPreset: "green",
          expirationDays: 365,
          sharingProhibited: true,
        }),
      });

      const responseText = await walletResponse.text();

      if (!walletResponse.ok) {
        let details: unknown = responseText;
        try {
          details = JSON.parse(responseText);
        } catch {
          // Keep the upstream text as a fallback.
        }
        return json(
          { error: "Wallet pass could not be created.", details },
          walletResponse.status
        );
      }

      try {
        const data = JSON.parse(responseText);
        return json({
          serialNumber: data.serialNumber,
          googleSaveUrl: data.googleSaveUrl,
          shareUrl: data.shareUrl,
          applePass: data.applePass,
        });
      } catch {
        return json({ error: "Wallet service returned an invalid response." }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  },
};

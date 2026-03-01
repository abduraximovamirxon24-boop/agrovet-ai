export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { type, age, temp, appetite, symptoms, note } = req.body || {};

    const prompt = `
Hayvon turi: ${type}
Yoshi (oy): ${age}
Harorat (°C): ${temp}
Ishtaha: ${appetite}
Alomatlar: ${symptoms}
Qo'shimcha izoh: ${note}

Vazifa:
1) Ehtimoliy tashxis(lar)ni ehtimol bo‘yicha tartiblab ber.
2) Xavf darajasini ber: Past / O‘rta / Yuqori.
3) Shoshilinch holat belgilari bo‘lsa alohida ogohlantir.
4) Umumiy xavfsiz tavsiyalar (dori dozasiz).
5) Qaysi qo‘shimcha ma’lumot/tekshiruv kerakligini ayt.
Eslatma: Bu AI tavsiyasi, yakuniy tashxis emas.
`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a veterinary assistant. Be cautious, safety-focused, and concise." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || "OpenAI error" });
    }

    const text = data.choices?.[0]?.message?.content || "Natija topilmadi.";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}

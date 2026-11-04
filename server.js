import "dotenv/config";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateWorld } from "./src/generator.js";
import { buildPlaceXml } from "./src/rbxlx.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "Robx Studio", version: "1.0.0" }));

app.post("/api/generate", (req, res) => {
  const prompt = String(req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "Добавь описание игры." });
  if (prompt.length > 4000) return res.status(413).json({ error: "Описание слишком длинное (максимум 4000 символов)." });
  try {
    const world = generateWorld(prompt);
    res.json(world);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Не удалось сформировать проект." });
  }
});

app.post("/api/export", (req, res) => {
  try {
    const world = req.body?.world;
    if (!world || !Array.isArray(world.objects)) return res.status(400).json({ error: "Сначала создай проект." });
    const xml = buildPlaceXml(world);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="Robx-Experience.rbxlx"');
    res.send(xml);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка экспорта RBXLX." });
  }
});

app.post("/api/publish", async (req, res) => {
  const apiKey = process.env.ROBLOX_API_KEY;
  const universeId = process.env.ROBLOX_UNIVERSE_ID;
  const placeId = process.env.ROBLOX_PLACE_ID;
  if (!apiKey || !universeId || !placeId) {
    return res.status(400).json({ error: "Публикация не настроена. Добавь ROBLOX_API_KEY, ROBLOX_UNIVERSE_ID и ROBLOX_PLACE_ID в переменные окружения сервера." });
  }
  try {
    const world = req.body?.world;
    if (!world || !Array.isArray(world.objects)) return res.status(400).json({ error: "Сначала создай проект." });
    const xml = buildPlaceXml(world);
    const response = await fetch(`https://apis.roblox.com/universes/v1/${encodeURIComponent(universeId)}/places/${encodeURIComponent(placeId)}/versions?versionType=Published`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/xml" },
      body: xml
    });
    const body = await response.text();
    if (!response.ok) return res.status(response.status).json({ error: "Roblox отклонил публикацию.", details: body });
    res.json({ ok: true, result: body });
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: "Не удалось связаться с Roblox Open Cloud." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`Robx Studio listening on ${port}`));

import express from "express";
import cors from "cors";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// --- Config de base ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const DOWNLOAD_DIR = path.join(__dirname, "downloads");
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

// --- Route principale ---
app.post("/download", async (req, res) => {
  const { url, format } = req.body;
  if (!url) return res.status(400).json({ error: "URL manquante" });

  console.log("🛰️ Format reçu du frontend:", format);
  console.log("🔗 URL:", url);

  const output = path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s");
  let cmd;

  // ✅ Commande corrigée pour les vidéos MP4 de haute qualité
  if (format === "mp4") {
    cmd = `yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]" --merge-output-format mp4 -o "${output}" "${url}"`;
  } else {
    // 🎵 Extraction audio MP3
    cmd = `yt-dlp -x --audio-format mp3 --audio-quality 192K -o "${output}" "${url}"`;
  }

  console.log("▶️ Commande exécutée :", cmd);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Erreur yt-dlp:", stderr);
      return res.status(500).json({ error: "Erreur pendant la conversion." });
    }

    const ext = format === "mp4" ? ".mp4" : ".mp3";
    const files = fs.readdirSync(DOWNLOAD_DIR).filter(f => f.endsWith(ext));
    if (!files.length) return res.status(404).json({ error: `Aucun fichier ${ext} trouvé.` });

    const latest = files
      .map(f => ({
        name: f,
        time: fs.statSync(path.join(DOWNLOAD_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time)[0].name;

    console.log("✅ Fichier prêt :", latest);
    res.json({ file: `/downloads/${latest}` });
  });
});

// --- Dossier des téléchargements ---
app.use("/downloads", express.static(DOWNLOAD_DIR));

// --- Lancement du serveur ---
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`));

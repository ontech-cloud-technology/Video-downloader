document.getElementById("downloadBtn").addEventListener("click", async () => {
  const url = document.getElementById("videoUrl").value.trim();
  const status = document.getElementById("status");
  const bar = document.getElementById("progressBar");
  const format = document.querySelector('input[name="format"]:checked').value;

  if (!url) {
    status.textContent = "⚠️ Entre une URL valide !";
    return;
  }

  status.textContent = `Téléchargement en ${format.toUpperCase()}...`;
  bar.style.width = "10%";

  try {
    const res = await fetch("/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format }),
    });

    bar.style.width = "70%";

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    bar.style.width = "100%";
    status.innerHTML = `✅ Fichier prêt : <a href="${data.file}" download>Télécharger le ${format.toUpperCase()}</a>`;
  } catch (err) {
    console.error(err);
    status.textContent = "❌ Erreur : " + err.message;
    bar.style.width = "0";
  }
});

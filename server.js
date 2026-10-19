const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 3016;

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/temp', express.static(path.join(__dirname, 'temp')));

if (!fs.existsSync('./temp')) {
    fs.mkdirSync('./temp');
}

app.post('/api/upscale', async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ success: false, message: "Nenhuma imagem enviada." });

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    const inputPath = path.join(__dirname, 'temp', `input_${Date.now()}.png`);
    const outputPath = path.join(__dirname, 'temp', `output_${Date.now()}.png`);

    fs.writeFileSync(inputPath, buffer);

    console.log("Executando IA Real-ESRGAN localmente (pode demorar na CPU)...");

    // Chama o python com timeout de 5 minutos
    exec(`python upscale.py "${inputPath}" "${outputPath}"`, { timeout: 300000 }, (error, stdout) => {
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);

      if (error || stdout.includes("ERRO_IA")) {
        console.error("Erro na IA:", error || stdout);
        return res.status(500).json({ success: false, message: "Falha no processamento da IA pesada local." });
      }

      if (fs.existsSync(outputPath)) {
        const relativeUrl = `/temp/${path.basename(outputPath)}`;
        console.log("Sucesso! Imagem gerada com IA Real:", relativeUrl);
        return res.json({ success: true, outputUrl: relativeUrl });
      } else {
        return res.status(500).json({ success: false, message: "Arquivo de saída não gerado." });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando com IA Real local em http://localhost:${PORT}`);
});
/**
 * Client-side Canvas Verse Card Generator ("Carry It With You")
 * Generates lock-screen friendly 1080x1920 PNG cards with verbatim scripture only.
 */

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

export async function generateVerseCardBlob(
  reference: string,
  verseText: string
): Promise<Blob> {
  const width = 1080;
  const height = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // 1. Background: Obsidian / deep night gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#12151c');
  bgGrad.addColorStop(0.5, '#0b0d13');
  bgGrad.addColorStop(1, '#181b24');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient subtle warm amber central glow
  const radialGlow = ctx.createRadialGradient(
    width / 2,
    height * 0.45,
    50,
    width / 2,
    height * 0.45,
    width * 0.7
  );
  radialGlow.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
  radialGlow.addColorStop(0.6, 'rgba(217, 119, 6, 0.04)');
  radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, width, height);

  // 3. Delicate inner border
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
  ctx.lineWidth = 2;
  const margin = 60;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Inner corner notches
  const cornerSize = 24;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin - 4, margin + cornerSize);
  ctx.lineTo(margin - 4, margin - 4);
  ctx.lineTo(margin + cornerSize, margin - 4);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - margin + 4 - cornerSize, margin - 4);
  ctx.lineTo(width - margin + 4, margin - 4);
  ctx.lineTo(width - margin + 4, margin + cornerSize);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin - 4, height - margin - cornerSize);
  ctx.lineTo(margin - 4, height - margin + 4);
  ctx.lineTo(margin + cornerSize, height - margin + 4);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - margin + 4 - cornerSize, height - margin + 4);
  ctx.lineTo(width - margin + 4, height - margin + 4);
  ctx.lineTo(width - margin + 4, height - margin - cornerSize);
  ctx.stroke();

  // 4. Subtle Top Ornament
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  const topY = height * 0.22;
  ctx.arc(width / 2, topY, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, topY);
  ctx.lineTo(width / 2 - 20, topY);
  ctx.moveTo(width / 2 + 20, topY);
  ctx.lineTo(width / 2 + 80, topY);
  ctx.stroke();

  // 5. Verse Text (Verbatim Scripture Only)
  const maxTextWidth = width - 240;
  // Calculate dynamic font size based on text length
  let fontSize = 48;
  if (verseText.length < 80) fontSize = 56;
  else if (verseText.length > 200) fontSize = 40;

  ctx.font = `italic ${fontSize}px Lora, "Times New Roman", Georgia, serif`;
  ctx.fillStyle = '#fefce8'; // soft parchment white
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cleanedText = `“${verseText.replace(/^["“]|["”]$/g, '').trim()}”`;
  const lines = wrapText(ctx, cleanedText, maxTextWidth);
  const lineHeight = fontSize * 1.6;
  const totalTextHeight = lines.length * lineHeight;

  const startY = height * 0.46 - totalTextHeight / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  // 6. Scripture Reference
  const refY = startY + totalTextHeight + 70;
  ctx.font = `bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#f59e0b'; // amber-500
  ctx.textAlign = 'center';
  ctx.fillText(reference.toUpperCase(), width / 2, refY);

  // 7. Tasteful Brand Mark (Bottom)
  const brandY = height - margin - 80;
  ctx.font = `bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = 'rgba(214, 211, 209, 0.8)'; // stone-300
  ctx.letterSpacing = '6px';
  ctx.fillText('TESTAMENT', width / 2, brandY);

  ctx.font = `14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = 'rgba(168, 162, 158, 0.6)'; // stone-400
  ctx.letterSpacing = '2px';
  ctx.fillText('THE LIVING WORD', width / 2, brandY + 30);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to export canvas to PNG blob'));
    }, 'image/png');
  });
}

/**
 * Downloads the card as a PNG or opens the native share sheet on mobile.
 */
export async function saveOrShareVerseCard(
  reference: string,
  verseText: string
): Promise<'shared' | 'downloaded'> {
  const blob = await generateVerseCardBlob(reference, verseText);
  const safeFilename = `Testament-${reference.replace(/[^a-zA-Z0-9]/g, '_')}.png`;

  // Check if Web Share API with files is available
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare
  ) {
    try {
      const file = new File([blob], safeFilename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${reference} • Testament`,
          text: `${reference} — “${verseText}”`
        });
        return 'shared';
      }
    } catch (err: unknown) {
      // User cancelled share or share failed; proceed to download fallback if not user abort
      if (err instanceof Error && err.name === 'AbortError') {
        return 'shared';
      }
    }
  }

  // Fallback: Direct PNG download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return 'downloaded';
}

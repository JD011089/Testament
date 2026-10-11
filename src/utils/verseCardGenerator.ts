/**
 * Client-side Canvas Verse Card Generator ("Carry It With You")
 * Generates lock-screen friendly 1080x1920 PNG cards with verbatim scripture only.
 * Always renders in Daybreak palette regardless of the user's current theme preference.
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

  // 1. Daybreak Background: Warm parchment gradient (#FFFAEE -> #F8F1E0)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#FFFAEE');
  bgGrad.addColorStop(1, '#F8F1E0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Daybreak Sky Wash at Top: #A4BDC7 at ~35% opacity fading out smoothly
  const skyWash = ctx.createRadialGradient(
    width / 2,
    -100,
    100,
    width / 2,
    400,
    width * 0.95
  );
  skyWash.addColorStop(0, 'rgba(164, 189, 199, 0.45)');
  skyWash.addColorStop(0.5, 'rgba(164, 189, 199, 0.20)');
  skyWash.addColorStop(1, 'rgba(164, 189, 199, 0)');
  ctx.fillStyle = skyWash;
  ctx.fillRect(0, 0, width, height);

  // 3. Delicate inner border & gold rules in #B27B3F
  const margin = 60;
  ctx.strokeStyle = 'rgba(178, 123, 63, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Inner corner notches
  const cornerSize = 24;
  ctx.strokeStyle = '#B27B3F';
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

  // 4. Subtle Top Gold Ornament
  ctx.fillStyle = '#B27B3F';
  ctx.beginPath();
  const topY = height * 0.22;
  ctx.arc(width / 2, topY, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(178, 123, 63, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, topY);
  ctx.lineTo(width / 2 - 20, topY);
  ctx.moveTo(width / 2 + 20, topY);
  ctx.lineTo(width / 2 + 80, topY);
  ctx.stroke();

  // 5. Verse Text (Verbatim Scripture in Daybreak textPrimary #1F2330)
  const maxTextWidth = width - 240;
  let fontSize = 48;
  if (verseText.length < 80) fontSize = 56;
  else if (verseText.length > 200) fontSize = 40;

  ctx.font = `italic ${fontSize}px Lora, "Times New Roman", Georgia, serif`;
  ctx.fillStyle = '#1F2330'; // Daybreak textPrimary
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

  // 6. Scripture Reference in Daybreak accent-text #8A5424
  const refY = startY + totalTextHeight + 70;
  ctx.font = `bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#8A5424'; // Daybreak accent-text
  ctx.textAlign = 'center';
  ctx.fillText(reference.toUpperCase(), width / 2, refY);

  // 7. Tasteful Brand Mark in Daybreak secondary / muted tones
  const brandY = height - margin - 80;
  ctx.font = `bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#584E42'; // Daybreak textSecondary
  ctx.letterSpacing = '6px';
  ctx.fillText('TESTAMENT', width / 2, brandY);

  ctx.font = `14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = '#76695A'; // Daybreak textMuted
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

/**
 * Share a verse as a Daybreak image card with a deep link to its story.
 * Never includes private notes — only the public verse text and reference.
 */

export interface ShareVerseInput {
  ref: string;
  text: string;
  translation: string;
  storyId?: string;
}

export const SHARE_BASE_URL = 'https://testament-bible-learning.vercel.app';

export function shareDeepLink(storyId?: string): string {
  return storyId ? `${SHARE_BASE_URL}/story/${storyId}` : SHARE_BASE_URL;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Render the card to a PNG blob. */
export async function renderShareCard(input: ShareVerseInput): Promise<Blob> {
  const width = 1080;
  const height = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Daybreak background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#F8F1E0');
  gradient.addColorStop(1, '#EFE3CB');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Gold frame
  ctx.strokeStyle = '#D49D5F';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.fillStyle = '#2B241C';
  ctx.font = '600 40px Georgia, serif';
  ctx.fillText('Testament', 90, 130);

  ctx.font = 'italic 58px Georgia, serif';
  const lines = wrapText(ctx, `“${input.text}”`, width - 220);
  let y = 360;
  for (const line of lines.slice(0, 14)) {
    ctx.fillText(line, 110, y);
    y += 78;
  }

  ctx.fillStyle = '#8A5424';
  ctx.font = '700 44px Georgia, serif';
  ctx.fillText(`${input.ref} • ${input.translation}`, 110, height - 180);

  ctx.fillStyle = '#7A6A55';
  ctx.font = '32px system-ui, sans-serif';
  ctx.fillText(shareDeepLink(input.storyId), 110, height - 110);

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not render card'))), 'image/png');
  });
}

export async function shareVerseCard(input: ShareVerseInput): Promise<'shared' | 'downloaded'> {
  const blob = await renderShareCard(input);
  const file = new File([blob], `testament-${input.ref.replace(/[^a-z0-9]+/gi, '-')}.png`, { type: 'image/png' });
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    await nav.share({ files: [file], title: input.ref, text: shareDeepLink(input.storyId) });
    return 'shared';
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
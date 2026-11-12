import { PDFDocument } from "pdf-lib";

export interface PdfPageInput {
  file: File;
  rotation: number; // 0, 90, 180, 270
}

/**
 * Converts an image File (JPG, PNG, WebP) with optional 90-degree rotation
 * into a normalized JPEG ArrayBuffer via HTML5 Canvas.
 */
async function normalizeImageToJpegBytes(
  file: File,
  rotation: number = 0
): Promise<{
  bytes: Uint8Array;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const normalizedRot = ((rotation % 360) + 360) % 360;
      const swapDims = normalizedRot === 90 || normalizedRot === 270;

      const canvas = document.createElement("canvas");
      canvas.width = swapDims ? img.naturalHeight : img.naturalWidth;
      canvas.height = swapDims ? img.naturalWidth : img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }

      // Fill crisp white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((normalizedRot * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();

      canvas.toBlob(
        async (blob) => {
          URL.revokeObjectURL(objectUrl);
          if (!blob) {
            reject(new Error("Failed to encode image"));
            return;
          }
          const arrayBuffer = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(arrayBuffer),
            width: canvas.width,
            height: canvas.height,
          });
        },
        "image/jpeg",
        0.92
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Combines multiple image files (or PdfPageInputs with rotation) into a single A4 PDF File.
 */
export async function convertImagesToPdf(
  inputs: (File | PdfPageInput)[],
  outputFileName: string,
  onProgress?: (current: number, total: number) => void
): Promise<File> {
  if (inputs.length === 0) {
    throw new Error("Please select at least one image.");
  }

  const pdfDoc = await PDFDocument.create();
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;
  const MARGIN = 24;

  for (let i = 0; i < inputs.length; i++) {
    onProgress?.(i + 1, inputs.length);
    const item = inputs[i];
    const file = item instanceof File ? item : item.file;
    const rotation = item instanceof File ? 0 : item.rotation;

    const { bytes, width, height } = await normalizeImageToJpegBytes(
      file,
      rotation
    );
    const embeddedImage = await pdfDoc.embedJpg(bytes);

    const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);
    const maxWidth = A4_WIDTH - MARGIN * 2;
    const maxHeight = A4_HEIGHT - MARGIN * 2;

    const scale = Math.min(maxWidth / width, maxHeight / height, 1);
    const drawWidth = width * scale;
    const drawHeight = height * scale;

    const x = (A4_WIDTH - drawWidth) / 2;
    const y = (A4_HEIGHT - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  const cleanName = outputFileName.trim().replace(/\.pdf$/i, "") || "Notes";
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });
  return new File([pdfBlob], `${cleanName}.pdf`, {
    type: "application/pdf",
  });
}

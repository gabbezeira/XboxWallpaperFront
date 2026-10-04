export async function optimizeImageForUpload(file, options = {}) {
  if (!file) return file;

  const maxRawSize = options.maxRawSize || 3.5 * 1024 * 1024;
  if (file.size <= maxRawSize) {
    return file;
  }

  const isImage =
    file.type?.startsWith('image/') ||
    /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isImage) {
    return file;
  }

  const maxDim = options.maxDimension || 3840;
  const initialQuality = options.quality || 0.90;

  try {
    let sourceImage;
    let width;
    let height;

    if (typeof createImageBitmap === 'function') {
      try {
        sourceImage = await createImageBitmap(file);
        width = sourceImage.width;
        height = sourceImage.height;
      } catch {
        sourceImage = null;
      }
    }

    if (!sourceImage) {
      sourceImage = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Falha ao carregar imagem'));
        };
        img.src = url;
      });
      width = sourceImage.naturalWidth || sourceImage.width;
      height = sourceImage.naturalHeight || sourceImage.height;
    }

    if (!width || !height) {
      if (sourceImage && typeof sourceImage.close === 'function') {
        sourceImage.close();
      }
      return file;
    }

    let targetWidth = width;
    let targetHeight = height;

    if (targetWidth > maxDim || targetHeight > maxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
        targetHeight = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      if (sourceImage && typeof sourceImage.close === 'function') {
        sourceImage.close();
      }
      return file;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);

    if (sourceImage && typeof sourceImage.close === 'function') {
      sourceImage.close();
    }

    const getBlob = (type, q) =>
      new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), type, q);
      });

    let blob = await getBlob('image/webp', initialQuality);

    if (!blob) {
      blob = await getBlob('image/jpeg', initialQuality);
    }

    if (blob && blob.size > 3.8 * 1024 * 1024) {
      const smallerBlob = await getBlob('image/webp', 0.82);
      if (smallerBlob && smallerBlob.size < blob.size) {
        blob = smallerBlob;
      }
    }

    if (blob && blob.size < file.size) {
      const ext = blob.type === 'image/webp' ? '.webp' : '.jpg';
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const newName = `${baseName}${ext}`;
      return new File([blob], newName, { type: blob.type });
    }

    return file;
  } catch {
    return file;
  }
}

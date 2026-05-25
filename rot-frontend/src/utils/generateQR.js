// Use Google Chart QR API as a lightweight fallback so we don't need a
// bundler-installed `qrcode` package for simple data-URL generation.
// This returns an image URL which we draw to canvas when an overlay is needed.

const buildGoogleChartQRUrl = (data, size = 256) => {
  const encoded = encodeURIComponent(data);
  return `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encoded}&chld=L|1`;
};

export const generateQRCode = async (data, size = 256) => {
  try {
    // Return the image URL — components that need a data URL can draw it to canvas.
    return buildGoogleChartQRUrl(data, size);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};

export const generateQRCodeWithInactiveOverlay = async (data, isInactive = false, size = 256) => {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const qrUrl = buildGoogleChartQRUrl(data, size);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = qrUrl;

    return await new Promise((resolve, reject) => {
      img.onerror = (e) => reject(e);
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (isInactive) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('INACTIVE', canvas.width / 2, canvas.height / 2 - 15);

          ctx.strokeStyle = '#DC2626';
          ctx.lineWidth = 4;
          const padding = 20;
          ctx.beginPath();
          ctx.moveTo(padding, padding);
          ctx.lineTo(canvas.width - padding, canvas.height - padding);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(canvas.width - padding, padding);
          ctx.lineTo(padding, canvas.height - padding);
          ctx.stroke();
        }

        resolve(canvas.toDataURL());
      };
    });
  } catch (error) {
    console.error('Error generating QR code with overlay:', error);
    return null;
  }
};

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const toBase64Image = async (file) => {
  const dataUrl = await fileToBase64(file);
  if (dataUrl.length > 700000) {
    throw new Error("File too large. Maximum size is ~500KB.");
  }
  return dataUrl;
};

export const toBase64ImageWithProgress = (file, onProgress) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 70));
    };
    reader.onload = () => {
      onProgress(75);
      const dataUrl = reader.result;
      if (dataUrl.length > 700000) {
        reject(new Error("File too large. Maximum size is ~500KB."));
        return;
      }
      onProgress(100);
      resolve(dataUrl);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

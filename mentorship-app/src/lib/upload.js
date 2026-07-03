import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

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

export const uploadSubmissionFile = async (file, submissionId) => {
  const storageRef = ref(storage, `submissions/${submissionId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadBookFile = async (file, bookId) => {
  const storageRef = ref(storage, `library/${bookId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const uploadBookCover = async (file, bookId) => {
  const ext = file.name.split(".").pop();
  const storageRef = ref(storage, `library/${bookId}/cover.${ext}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

export const downloadFromUrl = async (url, fileName) => {
  window.open(url, "_blank");
};

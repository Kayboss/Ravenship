import { storage } from "./config";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

export const uploadProfilePic = (uid, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `profile-pics/${uid}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) onProgress(snap.bytesTransferred / snap.totalBytes);
      },
      reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve)
    );
  });
};

export const deleteProfilePic = async (uid) => {
  try {
    await deleteObject(ref(storage, `profile-pics/${uid}`));
  } catch {}
};

export const uploadAssignmentFile = (path, file, onProgress) => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `assignments/${path}`);
    const task = uploadBytesResumable(storageRef, file);
    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) onProgress(snap.bytesTransferred / snap.totalBytes);
      },
      reject,
      () => getDownloadURL(task.snapshot.ref).then(resolve)
    );
  });
};

export const isEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? ""));

export const isPhoneVN = (value) =>
  /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(String(value ?? "").replace(/\s/g, ""));

export const isUrl = (value) => {
  try {
    new URL(String(value));
    return true;
  } catch {
    return false;
  }
};

export const containsSpecialChars = (value) =>
  /[!@#$%^&*(),.?":{}|<>]/.test(String(value ?? ""));

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

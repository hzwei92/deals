export function Uint8ArrayFromBase64(base64: string) {
  return Uint8Array.from(window.atob(base64), (v) => v.charCodeAt(0));
}

export const openMediaDevices = (constraints: MediaStreamConstraints) => {
  return navigator.mediaDevices.getUserMedia(constraints);
}
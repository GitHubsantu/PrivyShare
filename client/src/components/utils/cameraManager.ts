// Created by DevOps
// GitHub: https://github.com/githubsantu

let activeStream: MediaStream | null = null;

export const setCameraStream = (stream: MediaStream) => {
  activeStream = stream;
};

export const stopCamera = () => {
  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
  }
};

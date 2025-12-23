// Created by DevOps
// GitHub: https://github.com/githubsantu

import { useEffect } from "react";
import { stopCamera } from "../utils/cameraManager";

export const useCameraGuard = () => {
  useEffect(() => {
    return () => {
      stopCamera(); // page leave hote hi camera off
    };
  }, []);
};

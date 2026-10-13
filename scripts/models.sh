#!/usr/bin/env bash
# Baixa els models locals a ./models (fora de git). Tots dos venen de llançaments públics de GitHub.
set -euo pipefail
mkdir -p models && cd models
if [ ! -d sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 ]; then
  curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2 | tar xj
fi
if [ ! -f yunet.onnx ]; then
  curl -L -o yunet.onnx https://media.githubusercontent.com/media/opencv/opencv_zoo/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx
fi
ls -la

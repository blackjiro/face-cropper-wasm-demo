import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";
import useWasm from "../lib/useWasm.ts";

declare global {
  interface Window {
    cv: any;
    Utils: any;
  }
}

const { cv, Utils } = window;
interface FaceInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}
const faceCascadeFile = "haarcascade_frontalface_alt.xml";

export default function FileUploaderOpenCV() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>();
  const [faceInfo, setFaceInfo] = useState<FaceInfo>();
  const [base64Png, setBase64Png] = useState<string>();
  const wasm = useWasm();

  useEffect(() => {
    const utils = new Utils("errorMessage");
    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {});
  }, []);

  useEffect(() => {
    if (!file || !IS_BROWSER) return;

    setImageSrc(URL.createObjectURL(file!));
  }, [file]);

  const loadImage = () => {
    if (!file) return;

    // https://docs.opencv.org/3.4/d2/d99/tutorial_js_face_detection.html
    const imgElement = document.getElementById("imageSrc");
    const src = cv.imread(imgElement);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    const faces = new cv.RectVector();
    const faceCascade = new cv.CascadeClassifier();
    // load pre-trained classifiers
    faceCascade.load(faceCascadeFile);
    // detect faces
    const msize = new cv.Size(0, 0);
    faceCascade.detectMultiScale(gray, faces, 1.2, 3, 0, msize, msize);
    if (faces.size() > 0) {
      const { x, y, width, height } = faces.get(0);
      const point1 = new cv.Point(x, y);
      const point2 = new cv.Point(x + width, y + height);
      cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
      setFaceInfo({ x, y, width, height });
    }
    cv.imshow("canvasOutput", src);
    src.delete();
    gray.delete();
    faceCascade.delete();
    faces.delete();
  };

  const cropImage = () => {
    if (!file || !wasm) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) return;
      const uint8Array = new Uint8Array(reader.result);
      const result = wasm.load_image(
        uint8Array,
        faceInfo!.x,
        faceInfo!.y,
        faceInfo!.width,
        faceInfo!.height,
      );
      setBase64Png(result);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div class="flex flex-col">
      <input
        type="file"
        className="file-input w-full border border-black"
        onInput={(e) => setFile((e.target as HTMLInputElement).files![0])}
        accept="image/*"
      />
      <div class="flex mt-3 gap-2">
        <button class="btn btn-primary flex-1" onClick={loadImage}>
          顔検知
        </button>
      </div>
      <div class="flex justify-around gap-3">
        <div class="flex justify-center mt-6">
          {imageSrc && (
            <img
              src={imageSrc}
              alt="face"
              width="300"
              id="imageSrc"
            />
          )}
        </div>
        <div class="flex justify-center mt-6">
          <canvas id="canvasOutput"></canvas>
        </div>
      </div>
      <div id="errorMessage"></div>
      {faceInfo && (
        <div class="flex mt-3 gap-2">
          <button class="btn btn-info flex-1" onClick={cropImage}>
            ブラウザで切り抜き
          </button>
          <button class="btn flex-1">
            APIで切り抜き(TBU)
          </button>
        </div>
      )}
      {base64Png && (
        <div class="flex justify-center mt-6">
          <img src={base64Png} />
        </div>
      )}
    </div>
  );
}

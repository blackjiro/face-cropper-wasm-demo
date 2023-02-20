import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";

declare global {
  interface Window {
    cv: any;
    Utils: any;
  }
}

const { cv, Utils } = window;

export default function FileUploaderOpenCV() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>();

  useEffect(() => {
    const utils = new Utils("errorMessage");
    const faceCascadeFile = "haarcascade_frontalface_default.xml";
    utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => {});
  }, []);

  useEffect(() => {
    if (!file || !IS_BROWSER) return;

    setImageSrc(URL.createObjectURL(file!));
  }, [file]);

  const loadImage = () => {
    if (!file) return;

    const imgElement = document.getElementById("imageSrc");
    const src = cv.imread(imgElement);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    const faces = new cv.RectVector();
    const faceCascade = new cv.CascadeClassifier();
    // load pre-trained classifiers
    faceCascade.load("haarcascade_frontalface_default.xml");
    // detect faces
    const msize = new cv.Size(0, 0);
    faceCascade.detectMultiScale(gray, faces, 1.2, 3, 0, msize, msize);
    for (let i = 0; i < faces.size(); ++i) {
      const point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
      const point2 = new cv.Point(
        faces.get(i).x + faces.get(i).width,
        faces.get(i).y + faces.get(i).height,
      );
      cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
    }
    cv.imshow("canvasOutput", src);
    src.delete();
    gray.delete();
    faceCascade.delete();
    faces.delete();
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
    </div>
  );
}

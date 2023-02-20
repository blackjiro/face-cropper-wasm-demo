import { IS_BROWSER } from "$fresh/runtime.ts";
import { useState, useEffect } from "preact/hooks";


declare global {
  interface Window {
    cv: any;
  }
}


export default function FileUploaderOpenCV() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>();

  useEffect(() => {
    if(!file || !IS_BROWSER) return;

    setImageSrc(URL.createObjectURL(file!))
  },[file])

  const loadImage = () => {
    if (!file) return;

    // この辺が動かない
    let utils = new Utils('errorMessage');
    let faceCascadeFile = 'haarcascade_frontalface_default.xml';
    utils.loadOpenCv(() => {
      utils.createFileFromUrl(faceCascadeFile, faceCascadeFile, () => { });
    })

    // https://docs.opencv.org/3.4/d2/d99/tutorial_js_face_detection.html
    const imgElement = document.getElementById("imageSrc")
    let src= cv.imread(imgElement);
    let gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    let faces = new cv.RectVector();
    let eyes = new cv.RectVector();
    let faceCascade = new cv.CascadeClassifier();
    let eyeCascade = new cv.CascadeClassifier();
    // load pre-trained classifiers
    faceCascade.load('haarcascade_frontalface_default.xml');
    eyeCascade.load('haarcascade_eye.xml');
    // detect faces
    let msize = new cv.Size(0, 0);
    faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
    for (let i = 0; i < faces.size(); ++i) {
        let roiGray = gray.roi(faces.get(i));
        let roiSrc = src.roi(faces.get(i));
        let point1 = new cv.Point(faces.get(i).x, faces.get(i).y);
        let point2 = new cv.Point(faces.get(i).x + faces.get(i).width,
                                  faces.get(i).y + faces.get(i).height);
        cv.rectangle(src, point1, point2, [255, 0, 0, 255]);
        // detect eyes in face ROI
        eyeCascade.detectMultiScale(roiGray, eyes);
        for (let j = 0; j < eyes.size(); ++j) {
            let point1 = new cv.Point(eyes.get(j).x, eyes.get(j).y);
            let point2 = new cv.Point(eyes.get(j).x + eyes.get(j).width,
                                      eyes.get(j).y + eyes.get(j).height);
            cv.rectangle(roiSrc, point1, point2, [0, 0, 255, 255]);
        }
        roiGray.delete(); roiSrc.delete();
    }
    cv.imshow('canvasOutput', src);
    src.delete(); gray.delete(); faceCascade.delete();
    eyeCascade.delete(); faces.delete(); eyes.delete();
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
          ブラウザ上で切り抜き
        </button>
        <button class="btn btn-primary flex-1">APIで切り抜き</button>
      </div>
      <div class="flex justify-center mt-6">
        {imageSrc && <img src={imageSrc} alt="face" width="300" id="imageSrc"/>}
      </div>
      <div class="flex justify-center mt-6">
        <canvas id="outputCanvas"></canvas>
      </div>
    </div>
  );
}

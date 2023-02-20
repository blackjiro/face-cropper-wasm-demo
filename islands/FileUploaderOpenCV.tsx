import { IS_BROWSER } from "$fresh/runtime.ts";
import { useState, useEffect } from "preact/hooks";

export default function FileUploaderOpenCV() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>();

  useEffect(() => {
    if(!file) return;

    setImageSrc(URL.createObjectURL(file!))
  },[file])

  const loadImage = () => {
    if (!file) return;
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
        {imageSrc && <img src={imageSrc} alt="face" width="300"/>}
      </div>
    </div>
  );
}

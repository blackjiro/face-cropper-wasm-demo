import { useEffect, useState } from "preact/hooks";
import useWasm from "../lib/useWasm.ts";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const wasm = useWasm();

  const loadImage = () => {
    if (!file || !wasm) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (!(reader.result instanceof ArrayBuffer)) return;
      const uint8Array = new Uint8Array(reader.result);
      const result = wasm.load_image(uint8Array);
      console.log(result);
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
          ブラウザ上で切り抜き
        </button>
        <button class="btn btn-primary flex-1">APIで切り抜き</button>
      </div>
    </div>
  );
}

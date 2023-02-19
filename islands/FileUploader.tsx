import { IS_BROWSER, } from "$fresh/runtime.ts";
import { instantiate } from "../lib/rs_lib.generated.js";
import { instantiate as browserInstantiate } from "../lib/rs_lib.browser.js";
import {useState, useEffect} from "preact/hooks";

const loadWasm = async () => {
  let wasm
  if(IS_BROWSER) {
    wasm = await browserInstantiate();
  } else {
    wasm = await instantiate();
  }
  console.log('add', wasm.add(1,2))
  return wasm
}

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [wasm, setWasm] = useState<any>()
  useEffect(() => loadWasm().then(wasm=>setWasm(wasm)), [])

  const loadImage = () => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const uint8Array = new Uint8Array(reader.result);
      const result = wasm.load_image(uint8Array)
      console.log(result)
    }
    reader.readAsArrayBuffer(file);
  }

  return (
    <div class="flex flex-col">
      <input type="file" 
        className="file-input w-full border border-black" 
        onChange={e => setFile(e.target.files?.item(0) ?? null)}
        accept="image/*" />
      <div class="flex mt-3 gap-2">
        <button class="btn btn-primary flex-1" onClick={loadImage}>ブラウザ上で切り抜き</button>
        <button class="btn btn-primary flex-1">APIで切り抜き</button>
      </div>
    </div>
  );
}
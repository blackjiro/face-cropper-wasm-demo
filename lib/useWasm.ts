import { loadWasm } from "./wasm_loader.ts";
import { useEffect, useState } from "preact/hooks";

export interface Wasm {
  add: (a: number, b: number) => number;
  load_image: (
    data: Uint8Array,
    x: number,
    y: number,
    face_width: number,
    face_height: number,
  ) => string;
  crop_face: (data: Uint8Array) => number;
}

export const useWasm = () => {
  const [wasm, setWasm] = useState<Wasm>();
  useEffect(() => {
    (async () => {
      const customWasm = await loadWasm();
      setWasm(customWasm as Wasm);
      console.log("add", customWasm.add(1, 2));
    })();
  }, []);
  return wasm;
};

export default useWasm;

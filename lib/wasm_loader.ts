import { IS_BROWSER } from "$fresh/runtime.ts";
import { instantiate } from "./rs_lib.generated.js";

export const loadWasm = async () => {
  let wasm;
  if (IS_BROWSER) {
    const url = new URL("/rs_lib_bg.wasm", import.meta.url);
    wasm = await instantiate({ url });
  } else {
    wasm = await instantiate();
  }
  console.log("add", wasm.add(1, 2));
  return wasm;
};

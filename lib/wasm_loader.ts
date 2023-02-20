import { IS_BROWSER } from "$fresh/runtime.ts";
import { instantiate } from "./rs_lib.generated.js";
import { instantiate as browserInstantiate } from "./rs_lib.browser.js";

export const loadWasm = async () => {
  let wasm;
  if (IS_BROWSER) {
    wasm = await browserInstantiate();
  } else {
    wasm = await instantiate();
  }
  console.log("add", wasm.add(1, 2));
  return wasm;
};

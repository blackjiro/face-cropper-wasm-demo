// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file
// source-hash: 5337e0d794cf75f9ab72e54c8b7014f39f2d6abe
let wasm;
let cachedInt32Memory0;

const cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});

cachedTextDecoder.decode();

let cachedUint8Memory0;
function getUint8Memory0() {
  if (cachedUint8Memory0.byteLength === 0) {
    cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function add(a, b) {
  const ret = wasm.add(a, b);
  return ret;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}
/**
 * @param {Uint8Array} data
 * @param {number} x
 * @param {number} y
 * @param {number} face_width
 * @param {number} face_height
 * @returns {number}
 */
export function load_image(data, x, y, face_width, face_height) {
  const ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.load_image(ptr0, len0, x, y, face_width, face_height);
  return ret >>> 0;
}

const imports = {
  __wbindgen_placeholder__: {
    __wbindgen_throw: function (arg0, arg1) {
      throw new Error(getStringFromWasm0(arg0, arg1));
    },
  },
};

const wasm_url = new URL("rs_lib_bg.wasm", import.meta.url);

/**
 * Decompression callback
 *
 * @callback decompressCallback
 * @param {Uint8Array} compressed
 * @return {Uint8Array} decompressed
 */

/** Instantiates an instance of the Wasm module returning its functions.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {decompressCallback=} transform
 */
export async function instantiate(transform) {
  return (await instantiateWithInstance(transform)).exports;
}

let instanceWithExports;
let lastLoadPromise;

/** Instantiates an instance of the Wasm module along with its exports.
 * @remarks It is safe to call this multiple times and once successfully
 * loaded it will always return a reference to the same object.
 * @param {decompressCallback=} transform
 * @returns {Promise<{
 *   instance: WebAssembly.Instance;
 *   exports: { add: typeof add; load_image: typeof load_image }
 * }>}
 */
export function instantiateWithInstance(transform) {
  if (instanceWithExports != null) {
    return Promise.resolve(instanceWithExports);
  }
  if (lastLoadPromise == null) {
    lastLoadPromise = (async () => {
      try {
        const instance = (await instantiateModule(transform)).instance;
        wasm = instance.exports;
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
        instanceWithExports = {
          instance,
          exports: getWasmInstanceExports(),
        };
        return instanceWithExports;
      } finally {
        lastLoadPromise = null;
      }
    })();
  }
  return lastLoadPromise;
}

function getWasmInstanceExports() {
  return { add, load_image };
}

/** Gets if the Wasm module has been instantiated. */
export function isInstantiated() {
  return instanceWithExports != null;
}

async function instantiateModule(transform) {
  switch (wasm_url.protocol) {
    case "file:": {
      if (typeof Deno !== "object") {
        throw new Error("file urls are not supported in this environment");
      }

      if ("permissions" in Deno) {
        await Deno.permissions.request({ name: "read", path: wasm_url });
      }
      const wasmCode = await Deno.readFile(wasm_url);
      return WebAssembly.instantiate(
        !transform ? wasmCode : transform(wasmCode),
        imports,
      );
    }
    case "https:":
    case "http:": {
      if (typeof Deno === "object" && "permissions" in Deno) {
        await Deno.permissions.request({ name: "net", host: wasm_url.host });
      }
      const wasmResponse = await fetch(wasm_url);
      if (transform) {
        const wasmCode = new Uint8Array(await wasmResponse.arrayBuffer());
        return WebAssembly.instantiate(transform(wasmCode), imports);
      }
      if (
        wasmResponse.headers.get("content-type")?.toLowerCase().startsWith(
          "application/wasm",
        )
      ) {
        return WebAssembly.instantiateStreaming(wasmResponse, imports);
      } else {
        return WebAssembly.instantiate(
          await wasmResponse.arrayBuffer(),
          imports,
        );
      }
    }
    default:
      throw new Error(`Unsupported protocol: ${wasm_url.protocol}`);
  }
}

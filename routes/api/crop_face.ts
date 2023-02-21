import { HandlerContext } from "$fresh/server.ts";
import { loadWasm } from "../../lib/wasm_loader.ts";

const wasm = await loadWasm();

export const handler = async (
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> => {
  const formData = await req.formData();
  const imageBlob = formData.get("image") as Blob;
  const uint8Array = new Uint8Array(await imageBlob.arrayBuffer());
  const center_x = Number(formData.get("center_x"));
  const center_y = Number(formData.get("center_y"));
  const radius_on_x = Number(formData.get("radius_on_x"));
  const base64Img = wasm.load_image2(
    uint8Array,
    center_x,
    center_y,
    radius_on_x,
  );
  const body = JSON.stringify({ image: base64Img });
  return new Response(body);
};

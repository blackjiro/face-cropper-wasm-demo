import { Head } from "$fresh/runtime.ts";
import FileUploader from "../islands/FileUploader.tsx"

export default function Home() {
  return (
    <>
      <Head>
        <title>顔切り抜き</title>
        <link href="https://cdn.jsdelivr.net/npm/daisyui@2.50.1/dist/full.css" rel="stylesheet" type="text/css" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <div class="flex items-center justify-center mb-6">
          <img
            src="/logo.svg"
            class="w-20 h-20"
            alt="the fresh logo: a sliced lemon dripping with juice"
          />
          <span class="align-middle">顔切り抜きくん</span>
        </div>
        <FileUploader/>
      </div>
    </>
  );
}

import sharp from "sharp";

const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";

export async function POST(request: Request) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return new Response("Missing REMOVE_BG_API_KEY", { status: 500 });
  }

  const formData = await request.formData();
  const image = formData.get("image");
  if (!image || !(image instanceof File)) {
    return new Response("Image file is required", { status: 400 });
  }

  const arrayBuffer = await image.arrayBuffer();
  const inputBuffer = Buffer.from(arrayBuffer);

  const removeBgResponse = await fetch(REMOVE_BG_ENDPOINT, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey
    },
    body: (() => {
      const payload = new FormData();
      payload.append("image_file", new Blob([inputBuffer]), image.name);
      payload.append("size", "auto");
      payload.append("format", "png");
      return payload;
    })()
  });

  if (!removeBgResponse.ok) {
    const errorText = await removeBgResponse.text();
    return new Response(`Background removal failed: ${errorText}`, {
      status: 502
    });
  }

  const removedBuffer = Buffer.from(await removeBgResponse.arrayBuffer());

  const outputBuffer = await sharp(removedBuffer)
    .resize(2000, 2000, {
      fit: "contain",
      position: "centre",
      background: "#ffffff"
    })
    .flatten({ background: "#ffffff" })
    .png({ compressionLevel: 6 })
    .toBuffer();

  return new Response(outputBuffer, {
    status: 200,
    headers: {
      "Content-Type": "image/png"
    }
  });
}

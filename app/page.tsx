"use client";

import { useMemo, useState } from "react";

type CopyResponse = {
  title_short: string;
  title_long: string;
  description: string;
  tags: string;
};

const initialFormState = {
  productName: "",
  materials: "",
  size: "",
  techniques: "",
  notes: "",
  useCases: ""
};

export default function HomePage() {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [copyResult, setCopyResult] = useState<CopyResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => Boolean(imageFile), [imageFile]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setImageFile(file);
    setProcessedImage(null);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageFile) {
      setErrorMessage("Please upload an image before processing.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProcessedImage(null);
    setCopyResult(null);

    try {
      const imagePayload = new FormData();
      imagePayload.append("image", imageFile);
      const imageResponse = await fetch("/api/white-bg", {
        method: "POST",
        body: imagePayload
      });

      if (!imageResponse.ok) {
        throw new Error(await imageResponse.text());
      }

      const imageBlob = await imageResponse.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      setProcessedImage(imageUrl);

      const copyResponse = await fetch("/api/listing-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: formData.productName,
          materials: formData.materials,
          size: formData.size,
          techniques: formData.techniques,
          notes: formData.notes,
          useCases: formData.useCases
        })
      });

      if (!copyResponse.ok) {
        throw new Error(await copyResponse.text());
      }

      const copyData = (await copyResponse.json()) as CopyResponse;
      setCopyResult(copyData);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyText = async () => {
    if (!copyResult) return;
    const fullText = `Title (short): ${copyResult.title_short}\n\nTitle (long): ${copyResult.title_long}\n\nDescription:\n${copyResult.description}\n\nTags: ${copyResult.tags}`;
    await navigator.clipboard.writeText(fullText);
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
          Internal tool
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Etsy listing helper
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Upload a single product photo to generate a white background square
          image and British English listing copy.
        </p>
      </header>

      <form
        className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Product photo
              </label>
              <input
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="mt-2 text-xs text-slate-500">
                Upload one image. The output will be 2000×2000, centred on a
                #FFFFFF background.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Product name
                </label>
                <input
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Hand-thrown stoneware mug"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Materials
                </label>
                <input
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Stoneware clay, glaze"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Size
                </label>
                <input
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. 9cm tall, 300ml"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Techniques
                </label>
                <input
                  name="techniques"
                  value={formData.techniques}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Wheel-thrown, hand-glazed"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Notes to include
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="mt-2 min-h-[90px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                placeholder="Any key details you want to highlight."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Use cases or gifting ideas
              </label>
              <textarea
                name="useCases"
                value={formData.useCases}
                onChange={handleInputChange}
                className="mt-2 min-h-[90px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                placeholder="e.g. Birthday gift, new home present"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Preview</p>
              <div className="mt-3 grid gap-4">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Original
                  </p>
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Original upload preview"
                      className="mt-2 h-48 w-full rounded-md object-contain"
                    />
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      No image uploaded yet.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-500">
                    Processed
                  </p>
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt="Processed with white background"
                      className="mt-2 h-48 w-full rounded-md object-contain"
                    />
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">
                      Processed image will appear here.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={!canSubmit || isProcessing}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isProcessing ? "Processing…" : "Generate image + copy"}
              </button>
              {processedImage ? (
                <a
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  href={processedImage}
                  download="etsy-white-bg.png"
                >
                  Download image
                </a>
              ) : null}
            </div>

            {errorMessage ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
          </div>
        </div>
      </form>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Listing copy
            </h2>
            <p className="text-sm text-slate-500">
              British English, clear and neutral. Copy text once ready.
            </p>
          </div>
          <button
            onClick={handleCopyText}
            disabled={!copyResult}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            Copy text
          </button>
        </div>

        {copyResult ? (
          <div className="grid gap-4 text-sm text-slate-700">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Short title
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {copyResult.title_short}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Long title
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {copyResult.title_long}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Description
              </p>
              <pre className="mt-1 whitespace-pre-wrap rounded-md bg-slate-50 p-3 text-sm">
                {copyResult.description}
              </pre>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">
                Tags
              </p>
              <p className="mt-1 rounded-md bg-slate-50 p-3 text-sm">
                {copyResult.tags}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Generated copy will appear here after processing.
          </p>
        )}
      </section>
    </main>
  );
}

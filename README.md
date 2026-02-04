# Etsy Listing Helper

A minimal internal tool for creating Etsy-ready product images and listing copy. Upload a single product photo, generate a pure white 2000×2000 image, and produce British English listing copy with structured sections and tags.

## Features
- Upload one product photo and remove the background.
- Composite the subject onto a #FFFFFF square canvas (2000×2000).
- Generate Etsy listing copy (short title, long title, structured description, 13 tags).
- Download the processed image and copy the generated text.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- remove.bg API for background removal
- OpenAI API for listing copy generation

## Environment Variables
Create a `.env.local` file based on `.env.example`:

```
REMOVE_BG_API_KEY=your_remove_bg_key
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini
```

## Run Locally
```bash
npm install
npm run dev
```
Then open `http://localhost:3000`.

## API Routes
### POST /api/white-bg
- Input: `multipart/form-data` with `image` file
- Output: `image/png` (2000×2000 with white background)

### POST /api/listing-copy
- Input: JSON with optional fields: `productName`, `materials`, `size`, `techniques`, `notes`, `useCases`
- Output: JSON with `title_short`, `title_long`, `description`, `tags`

## Deploy on Vercel
1. Push this repository to GitHub.
2. In Vercel, import the repo and set the environment variables.
3. Deploy with the default Next.js settings.

## Notes
- This tool does not include authentication, payments, or a database.
- Background removal uses a single external API (remove.bg).

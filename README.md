# DRIFT-SENSE

### Navigation Error Recovery System

DRIFT-SENSE is an interactive front-end prototype designed to simulate how a navigation error recovery system could detect and correct tiny beam-drift errors during Scanning Electron Microscope (SEM) wafer imaging.

The idea is simple: upload a SEM wafer image, choose a matching algorithm, and let DRIFT-SENSE run through a simulated inspection process. The dashboard shows confidence levels, estimated drift, correction vectors, and a visual heatmap — all inside a real-time instrument-style interface.

> **Note:** DRIFT-SENSE is currently a front-end prototype. There is no backend or real image-processing pipeline. The analysis results are deterministically simulated in the browser using properties of the uploaded file. Your image never leaves the browser.

---

## ✨ What You Can Do

### 🔬 Try Different Matching Algorithms

DRIFT-SENSE provides three simulated matching approaches:

* **NCC** — Fast and lightweight, suitable when speed matters.
* **Feature-Based** — A balanced approach between speed and accuracy.
* **Hybrid AI** — The most accurate simulated method, designed for more challenging images.

Each algorithm has its own characteristics, recommended parameters, and performance profile.

### 🤖 Automatic Parameter Suggestions

The system automatically suggests parameters based on the uploaded image, including:

* Patch size
* Search radius
* Matching threshold
* Recommended matching method

The suggestions are generated from properties such as image resolution, compression, and aspect ratio.

### 📊 Drift Visualization

After a simulation is run, the dashboard visualizes the estimated drift through:

* Confidence heatmaps
* Animated bounding boxes
* Drift direction compass
* Correction vectors
* Confidence scores
* Noise and drift indicators

This makes the simulated inspection process easier to understand at a glance.

### 🕒 Session History

Every analysis can be saved in the session history.

The dashboard supports up to **16 previous runs**, including:

* Run thumbnails
* Confidence trends
* Drift measurements
* Comparison tables
* Mini trend charts

This makes it easy to compare different algorithms or images.

### 🧠 Algorithm Intelligence

DRIFT-SENSE also includes an algorithm guide where you can compare the three matching methods using:

* Radar charts
* Benchmark bars
* Strengths and weaknesses
* Recommended use cases
* Parameter guidance

### 🌍 Multiple Languages

The interface currently supports:

* English
* हिन्दी
* தமிழ்
* Français

### 🔍 Zoom & Pan

The SEM image viewer supports mouse-wheel zooming and click-and-drag panning so you can inspect different parts of the image more easily.

---

## 🛠️ Tech Stack

DRIFT-SENSE is built entirely on the front end using:

* **React 18** — UI and application logic
* **TypeScript** — Type-safe development
* **Vite 6** — Development and production builds
* **Tailwind CSS 4** — Styling
* **Recharts** — Radar and benchmark charts
* **Lucide React** — Icons
* **HTML Canvas** — Heatmap, bounding box, and drift visualization

---

## 🚀 Getting Started

### Requirements

You'll need:

* Node.js 18 or newer
* npm or pnpm

### Installation

Clone the project and install the dependencies:

```bash
npm i
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173/
```

Open that URL in your browser and you're ready to go.

---

## 📦 Production Build

To create a production build:

```bash
npm run build
```

The optimized files will be generated inside:

```text
dist/
```

Because DRIFT-SENSE is completely client-side, the generated `dist` folder can be deployed to any static hosting platform.

---

## ☁️ Deployment

You can deploy the project using platforms such as:

* Netlify
* Vercel
* GitHub Pages
* Cloudflare Pages
* Amazon S3 + CloudFront

For platforms that support Vite directly, use:

**Build command**

```bash
npm run build
```

**Output directory**

```text
dist
```

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── App.tsx
│   └── components/
│       ├── ui/
│       └── figma/
│
├── imports/
│   └── Background video assets
│
├── styles/
│   └── Global styles and Tailwind entry
│
└── main.tsx

index.html
vite.config.ts
```

Most of the application logic, simulation behaviour, screens, and dashboard UI are handled inside `App.tsx`.

---

## 🎥 Background Video

The dashboard uses a background video stored inside:

```text
src/imports/
```

If you replace the video, make sure the filename in the import inside `App.tsx` exactly matches the file on disk.

File names are case-sensitive, so even a small difference can cause the video to stop loading during the Vite build.

---

## 🔐 Privacy

DRIFT-SENSE does not upload your images to a server.

There is currently:

* No backend
* No database
* No external image-processing API
* No cloud image storage

The simulation runs entirely in the browser.

The analysis values are generated deterministically from the uploaded file's properties, which means the same file will produce consistent simulated results.

---

## ⚠️ Prototype Disclaimer

DRIFT-SENSE is a **conceptual front-end prototype**, not a production SEM navigation or metrology system.

The drift detection, confidence scores, correction vectors, heatmaps, and algorithm benchmarks are simulated for demonstration purposes.

They should **not** be interpreted as measurements from a real SEM instrument or as actual wafer-inspection results.

---



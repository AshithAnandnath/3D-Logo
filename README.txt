
  3D LOGO VIEWER — PROJECT README


A interactive 3D logo built in Blender and rendered live in
the browser using Three.js. Drag to spin, fully lit with a
6-spotlight stage, works on desktop and mobile, and can be
embedded in any website.

----------------------------------------------------------------
  FILES IN THIS PROJECT


  index.html                  — Main HTML entry point
  main.js                     — Three.js scene, lights, controls
  logo_frontlook_model.glb    — 3D model exported from Blender
  README.txt                  — This file

  IMPORTANT: All three files (index.html, main.js, .glb)
  must stay in the SAME folder for the project to work.

----------------------------------------------------------------
  PROJECT DESCRIPTION


  THE 3D MODEL (Blender)
  
  - Shape: A zigzag waveform made of 6 rounded cylindrical
    strokes arranged in a diagonal wave pattern
  - Gradient: Pink-to-purple-to-blue gradient texture baked
    onto all meshes using Blenders UV and material system
  - Export: .glb format (binary glTF) with textures embedded
    inside the single file — no external image files needed
  - 6 mesh pieces: path8_1 through path8_6

  THREE.JS FEATURES (main.js)
 
  Camera:
  - Top-down perspective camera (FOV 50) looking straight down
  - Shows the zigzag wave pattern from above, matching the
    original logo design view

  Materials:
  - MeshStandardMaterial with roughness 0.10, metalness 0.35
  - Very shiny surface catches all spotlight reflections boldly
  - Original gradient texture preserved with correct SRGB color

  6-Spotlight Stage (full surround lighting):
  - TOP spotlight      — Magenta,    fires down from above
  - BOTTOM spotlight   — Electric Blue, fires up from below
  - LEFT spotlight     — Cyan,       fires from the left side
  - RIGHT spotlight    — Violet,     fires from the right side
  - FRONT spotlight    — White-Pink, fires from the front
  - BACK spotlight     — Deep Blue,  fires from behind
  - Every spotlight slowly orbits the model and pulses gently

  Additional Lights:
  - Key light     — Warm white directional, main illumination
  - Fill light    — Cool lavender, lifts the shadow side
  - Rim light     — Hot pink from behind, glowing edges, pulses
  - Ambient light — Deep purple, no face is ever pitch black
  - Spin glow     — Point light that brightens as you spin faster

  Interaction:
  - Drag left/right (mouse or touch) to spin the logo on Z-axis
  - Smooth acceleration while dragging
  - Smooth coast and deceleration after release
  - Grab cursor on desktop, touch drag on mobile

  Mobile Optimizations:
  - Antialiasing disabled on mobile (GPU performance)
  - Pixel ratio capped at 1.5x on phones
  - Shadows disabled on mobile (biggest GPU saving)
  - touch-action: none prevents page scroll while spinning
  - Handles phone interruptions (calls, notifications) cleanly

----------------------------------------------------------------
  HOW TO RUN LOCALLY (on your computer)


    — VS Code Live Server (easiest, recommended)
  ------------------------------------------------------
  1. Open the project folder in VS Code
  2. Install "Live Server" extension by Ritwick Dey if needed
  3. Right-click index.html in the file explorer
  4. Click "Open with Live Server"
  5. Browser opens at http://127.0.0.1:5500


----------------------------------------------------------------
  HOW TO EMBED IN ANOTHER WEBSITE

  STEP 1 — HOST YOUR FILES

  Upload all three files to a web hosting service, keeping
  them in the same folder:

    your-server/
    └── 3d-logo/
        ├── index.html
        ├── main.js
        └── logo_frontlook_model.glb

  Works with: Netlify, Vercel, GitHub Pages, AWS S3, or any
  regular web server (Apache / Nginx). No backend needed.

  STEP 2 — EMBED WITH AN IFRAME
 
  Paste this code wherever you want the logo on your website:

    <iframe
      src="https://YOUR-DOMAIN.com/3d-logo/index.html"
      width="100%"
      height="500px"
      style="border: none; border-radius: 12px; display: block;"
      allow="accelerometer; gyroscope"
      loading="lazy"
      title="3D Logo"
    ></iframe>

  Replace https://YOUR-DOMAIN.com/3d-logo/ with your real URL.

  FOR DESKTOP WEBSITES (fixed or responsive size):

    <!-- Fixed 600x600 box -->
    <iframe
      src="https://YOUR-DOMAIN.com/3d-logo/index.html"
      width="600" height="600"
      style="border: none;"
      title="3D Logo"
    ></iframe>

    <!-- Full-width responsive -->
    <div style="position:relative; width:100%; padding-bottom:56.25%;">
      <iframe
        src="https://YOUR-DOMAIN.com/3d-logo/index.html"
        style="position:absolute; inset:0; width:100%; height:100%;
               border:none;"
        title="3D Logo"
      ></iframe>
    </div>

  FOR MOBILE-FRIENDLY WEBSITES (works on all screen sizes):

    <div style="width:100%; max-width:800px; margin:0 auto;
                aspect-ratio: 1 / 1;">
      <iframe
        src="https://YOUR-DOMAIN.com/3d-logo/index.html"
        style="width:100%; height:100%; border:none;
               border-radius:16px;"
        allow="accelerometer; gyroscope"
        loading="lazy"
        title="3D Logo"
      ></iframe>
    </div>

  STEP 3 — CROSS-ORIGIN HEADERS (if website is on different domain)
 
  If your main website domain is different from where the 3D
  viewer is hosted, add this header to your hosting config:

  Netlify — create a file called "_headers" in the 3d-logo folder:
    /*
      Access-Control-Allow-Origin: *

  Vercel — add to vercel.json:
    {
      "headers": [
        {
          "source": "/(.*)",
          "headers": [
            { "key": "Access-Control-Allow-Origin", "value": "*" }
          ]
        }
      ]
    }

  Apache — add to .htaccess in the folder:
    Header set Access-Control-Allow-Origin "*"

  Nginx — add inside your server block:
    add_header Access-Control-Allow-Origin "*";

----------------------------------------------------------------

  TECHNOLOGY STACK


  Blender        3D modelling and texture baking
  Three.js r161  WebGL 3D rendering in the browser
  GLTFLoader     Loads the .glb model file
  JavaScript     Scene logic, lighting, animation, interaction
  jsDelivr CDN   Serves Three.js — no npm or build step needed





================================================================
  END OF README
================================================================

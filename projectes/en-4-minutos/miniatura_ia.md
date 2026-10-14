# Miniatura: foto amb una pose nova feta amb IA d'imatges

L'usuari vol sortir **al centre**, amb una pose com les de les referències, i sentir-se més cridaner:
- **A, mans juntes sota la barbeta:** com «It's So F*cking Simple.».
- **B, dit aixecat:** l'equivalent a assenyalar la pissarra.

En aquest entorn no hi ha cap model que generi imatges. La foto amb la pose es fa amb una eina externa (Gemini, ChatGPT o una altra que accepti fotos de referència) i, després, la composició es fa aquí: retall, llum fosca, text i fletxa.

## Què has de passar a l'eina
1. **La teva foto**, `input/foto_miniatura.jpg`: és la referència de la cara.
2. **El boceto de la pose**: `out/miniatura_ia/pose_manos.png` (A) o `pose_dedo.png` (B).
3. **El prompt d'aquí sota.** En anglès funciona millor.

**No li demanis text, logos ni fletxes.** Les IA escriuen malament, i el text el poso jo amb la font i els colors de la marca. Demana la imatge **sense text** i com més gran millor (mínim 1920 px d'ample).

## Prompt A: mans juntes sota la barbeta
```
Edit the first photo: keep this exact person (same face, eyes, nose, mouth, eyebrows, black rectangular glasses, dark messy fringe, skin tone and light stubble), same plain white crew-neck t-shirt. Use the second image only as a pose and framing guide.

New pose: sitting at a desk, elbows on the desk, both hands clasped together just below the chin, fingers interlaced, looking straight into the camera with a calm, serious, confident expression. Centered in the frame, chest-up, horizontal 16:9, eye-level camera, empty space on both sides of the head.

Same bedroom (light walls, wooden shelf on the left, window on the right) but in the evening: dim room, one soft warm light from the front-left lighting the face, the background falls off into darkness, natural soft shadows on the right side of the face.

It must look like a real, unedited photo taken with a good phone or mirrorless camera: natural muted colors, low saturation, real skin texture with pores and small imperfections, no beauty retouching, no HDR, no glow, no oversharpening, slight natural noise, background slightly out of focus. Anatomically correct hands: five fingers each, natural knuckles and nails.

No text, no logos, no graphics, no watermark.
```

## Prompt B: dit aixecat
Igual que el prompt A, però canvia el paràgraf de la pose per aquest:
```
New pose: sitting at a desk, right hand raised next to the face with the index finger pointing up (the "listen, one thing" gesture), the other forearm resting on the desk, looking straight into the camera with a confident, slightly intense expression, mouth closed. Centered in the frame, chest-up, horizontal 16:9, eye-level camera, empty space on both sides of the head.
```

## Si vols afegir-ho com a «coses a evitar» (negative prompt)
```
oversaturated, plastic skin, airbrushed, CGI, 3D render, cartoon, extra fingers, fused fingers, deformed hands, distorted glasses, different face, text, letters, logo, watermark, HDR, glow, perfect symmetry
```

## Comprovacions abans de passar-me-la
- **La cara ha de ser la teva:** mira els ulls, el nas i les ulleres. Si no, torna a generar.
- **Les mans:** compta els dits i mira que no n'hi hagi d'enganxats.
- **La llum:** que no sigui saturada ni de «pell de plàstic». Si ho sembla, afegeix «make it look like a real photo, more natural and muted».

## Composició final (la faig jo)
`out/miniatura_ia/boceto_miniatura_*.png`:
- tu al centre, amb fons fosc i el focus a la cara;
- «**3 MIN**» en groc a l'esquerra i «**VIDA NUEVA**» en blanc a la dreta;
- una fletxa feta a mà per sobre del cap;
- la cantonada de baix a la dreta lliure, perquè YouTube hi posa la durada.

La forma més ràpida i natural, però, és fer-te tu mateix una foto amb la pose:
- al vespre, amb un sol llum de costat i el mòbil en horitzontal a l'altura dels ulls;
- tu al centre, del pit amunt.

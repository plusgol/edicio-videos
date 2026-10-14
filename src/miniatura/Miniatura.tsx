import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {ALEX, MANUAL, MINIATURA} from '../../brand/estil';
import {DISPLAY} from '../alex/fonts';

const {fontFamily: HAND} = loadCaveat('normal', {weights: ['700'], subsets: ['latin', 'latin-ext']});

// Miniatura de YouTube (1280×720). Tres variants per provar amb «Test & Compare» de YouTube (docs/MINIATURES.md):
// oro   — fons negre, xifra gegant en or i frase a mà (estil Alex);
// logos — la foto original desenfocada i fosca, «3 IAs» en or i els logos de les eines;
// mano  — gris clar i lletra a mà en negre amb la paraula clau en blau (la mostra «Me gusta la IA»).
export type MiniaturaProps = {
  variant: 'oro' | 'logos' | 'mano';
  // Rutes dins de --public-dir: foto original (input/) i persona retallada (work/, de scripts/retalla_foto.py).
  photo: string;
  person: string;
  // Mida de la foto i posició de la cara a la foto, en píxels (YuNet): centre x, alçada dels ulls i alçada de la cara.
  photoW: number;
  photoH: number;
  face: {x: number; eyesY: number; h: number};
  // Text gran (Anton daurat) i frase a mà; entre *asteriscs*, la paraula en color.
  big?: string;
  hand?: string;
  logos?: string[];
};

const Hand: React.FC<{text: string; size: number; ink: string; accent: string; shadow?: string}> = ({text, size, ink, accent, shadow}) => (
  <div style={{fontFamily: HAND, fontWeight: MINIATURA.handWeight, fontSize: size, lineHeight: 1.0, color: ink, textShadow: shadow}}>
    {text.split(/(\*[^*]+\*)/).filter(Boolean).map((t, i) =>
      t.startsWith('*') ? (
        <span key={i} style={{color: accent}}>
          {t.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{t}</span>
      ),
    )}
  </div>
);

const Gold: React.FC<{text: string; size: number}> = ({text, size}) => (
  // Sense majúscules forçades: «3 IAs» s'ha d'escriure així, no «3 IAS».
  <div style={{fontFamily: DISPLAY, fontSize: size, lineHeight: 0.92, filter: ALEX.goldGlow}}>
    <span style={{backgroundImage: ALEX.gold, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', padding: ALEX.goldClipPad}}>{text}</span>
  </div>
);

const Stickers: React.FC<{logos: string[]}> = ({logos}) => (
  <div style={{display: 'flex', gap: MINIATURA.stickerPad}}>
    {logos.map((l, i) => (
      <div
        key={l}
        style={{
          padding: MINIATURA.stickerPad,
          borderRadius: MINIATURA.stickerRadius,
          background: ALEX.white,
          boxShadow: MINIATURA.stickerShadow,
          transform: `rotate(${(i - (logos.length - 1) / 2) * MINIATURA.stickerTiltDeg}deg)`,
        }}
      >
        <Img src={staticFile(l)} style={{width: MINIATURA.stickerPx, height: MINIATURA.stickerPx, objectFit: 'contain', display: 'block'}} />
      </div>
    ))}
  </div>
);

export const Miniatura: React.FC<MiniaturaProps> = ({variant, photo, person, photoW, photoH, face, big, hand, logos = []}) => {
  // La foto (i el retall, que té la mateixa mida) s'escala i es mou perquè la cara quedi on mana el disseny.
  const k = MINIATURA.faceH[variant] / face.h;
  const eyes = MINIATURA.eyes[variant];
  const place = {position: 'absolute', left: eyes.x - face.x * k, top: eyes.y - face.eyesY * k, width: photoW * k, height: photoH * k} as const;
  const background =
    variant === 'oro' ? ALEX.stageDark : variant === 'mano' ? MANUAL.stage : ALEX.ink;
  const onDark = variant !== 'mano';
  return (
    <AbsoluteFill style={{background, overflow: 'hidden'}}>
      {variant === 'logos' ? (
        <Img
          src={staticFile(photo)}
          style={{...place, filter: `blur(${MINIATURA.photoBlurPx}px) brightness(${MINIATURA.photoBrightness})`}}
        />
      ) : null}
      {variant === 'oro' ? <AbsoluteFill style={{background: MINIATURA.rim}} /> : null}
      <Img src={staticFile(person)} style={{...place, filter: MINIATURA.personShadow}} />
      <div
        style={{
          position: 'absolute',
          left: MINIATURA.textLeft,
          width: MINIATURA.textWidth,
          top: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: MINIATURA.textGap,
        }}
      >
        {variant === 'mano' ? (
          <>
            {hand ? <Hand text={hand} size={MINIATURA.handBigPx} ink={MANUAL.ink} accent={MANUAL.accent} /> : null}
            {logos.length ? <Stickers logos={logos} /> : null}
          </>
        ) : (
          <>
            {big ? <Gold text={big} size={variant === 'oro' ? MINIATURA.goldPx : MINIATURA.goldLinePx} /> : null}
            {variant === 'logos' && logos.length ? <Stickers logos={logos} /> : null}
            {hand ? (
              <Hand text={hand} size={MINIATURA.handPx} ink={onDark ? MANUAL.inkOnCamera : MANUAL.ink} accent={MANUAL.accentOnCamera} shadow={MINIATURA.textShadow} />
            ) : null}
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

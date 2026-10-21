#!/usr/bin/env bash
# Genera los assets web a partir del material original (no modifica originales).
# Uso: desde la carpeta "La Curva":  bash web/scripts/assets.sh
# Las fotos de referencia (web/public/img/ref) vienen de Unsplash; ver web/README.md.
set -e
R="$(pwd)"; O="$R/web/public"; V1="$R/Video 1/Multimedia"
F="ffmpeg -v error -y"
img() { # img <src> <segundo> <salida> <ancho>
  $F -ss "$2" -i "$1" -frames:v 1 -vf "scale=$4:-2" -q:v 4 "$O/img/$3.jpg"
  $F -ss "$2" -i "$1" -frames:v 1 -vf "scale=$4:-2" -c:v libwebp -quality 72 "$O/img/$3.webp"
}
heic() { $F -i "$1" -frames:v 1 -update 1 "$O/img/_tmp.png"; $F -i "$O/img/_tmp.png" -vf "scale=$3:-2" -q:v 4 "$O/img/$2.jpg"; $F -i "$O/img/_tmp.png" -vf "scale=$3:-2" -c:v libwebp -quality 72 "$O/img/$2.webp"; rm -f "$O/img/_tmp.png"; }

# Fachadas
heic "$V1/IMG_3190.HEIC" sede-kennedy 720
img "$V1/IMG_3199.MOV" 2.5 sede-maria-eugenia 720
img "$V1/IMG_3209.MOV" 1.5 sede-la-pina-madura 720

# Reels (con audio, se reproducen al tocar)
reel() { $F -i "$1" -vf "scale=720:1280" -c:v libx264 -crf 29 -preset slow -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart "$O/video/$2.mp4"
         $F -ss "$3" -i "$1" -frames:v 1 -vf scale=540:-2 -q:v 5 "$O/img/$2.jpg"; }
reel "$R/Video 1/VIDEO 1 LA CURVA EDITADO v2.mp4" reel-sedes 1.2
reel "$R/Video 2/VIDEO 2 LA CURVA EDITADO v6.mp4" reel-humedad 9
reel "$R/Video 3/VIDEO 3 LA CURVA EDITADO.mp4" reel-marmol 11

# Logo circular sin las esquinas negras (máscara elíptica sobre el aro rojo)
$F -i "$R/Logo/1.png" -vf "format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip((1-hypot((X-617)/598,(Y-603)/580))*300,0,1)',crop=1200:1164:17:21" -frames:v 1 "$O/img/_logo.png"
$F -i "$O/img/_logo.png" -vf scale=512:-2 "$O/img/logo-circulo.png"
$F -i "$O/img/_logo.png" -vf scale=512:-2 -c:v libwebp -quality 88 "$O/img/logo-circulo.webp"
$F -i "$O/img/_logo.png" -vf scale=160:-2 "$O/img/logo-circulo-sm.png"
$F -i "$O/img/_logo.png" -vf scale=160:-2 -c:v libwebp -quality 90 "$O/img/logo-circulo-sm.webp"
$F -i "$O/img/_logo.png" -vf scale=64:-2 "$O/favicon.png"
$F -i "$O/img/_logo.png" -vf "scale=180:180:force_original_aspect_ratio=decrease,pad=180:180:(ow-iw)/2:(oh-ih)/2:color=0x0A0A0A" "$O/apple-touch-icon.png"
$F -i "$O/img/_logo.png" -vf "scale=600:-2,pad=1200:630:(ow-iw)/2:(oh-ih)/2:color=0x0A0A0A" -q:v 3 "$O/img/og.jpg"
rm -f "$O/img/_logo.png"
echo listo

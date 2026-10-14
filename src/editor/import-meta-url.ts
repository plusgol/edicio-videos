// esbuild (format iife) deixa import.meta buit; tegaki hi resol la seva font (new URL('./caveat-….ttf', import.meta.url)).
// Amb --inject i --define, import.meta.url apunta a la pàgina, i scripts/editor.sh hi copia la font al costat.
export const import_meta_url = document.baseURI;

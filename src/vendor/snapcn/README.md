# snapcn (còpia local)

Còpia dels components gratuïts de [snapcn](https://snapcn.dev) — https://github.com/snapcndev/snapcn, commit `afce9f0aa8c9d464409efd1e4d4f227ca4809c04`, llicència MIT (vegeu `LICENSE`).

Es copien en lloc d'instal·lar-los amb `npx shadcn add @snapcn/...` perquè el projecte no depengui de la xarxa i les versions quedin fixades.
Els imports `@/lib/snap-cn-ui`, `@/components/snap-cn/*` i `@/lib/utils` es resolen amb àlies a `remotion.config.ts` i `tsconfig.json`.
Els components Pro no hi són (no són públics).

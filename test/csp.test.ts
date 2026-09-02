import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { buildContentSecurityPolicy } from "@/config/csp";
import { MAP_TILES_ORIGIN } from "@/config/mapTiles";

/**
 * La cabecera de seguridad frente a lo que la web carga de verdad.
 *
 * Es la clase de fallo que no se ve nunca en desarrollo: la CSP **solo se manda en producción**, así que un
 * origen que falte aquí funciona perfectamente en local y solo rompe una vez desplegado — y lo hace en
 * silencio, con el recurso bloqueado y un error en la consola del navegador que nadie está mirando. Pasó
 * exactamente eso con las teselas del mapa: la cabecera abría un proveedor y uno de los tres mapas pedía
 * las suyas a otro.
 */
const RAIZ = path.resolve(__dirname, "..");

/** Los tres mapas de la web. Si aparece un cuarto, va aquí. */
const MAPAS = [
  "src/components/ui/contact/ContactMapCanvas.tsx",
  "src/components/ui/services/ServiceDetailZonesCanvas.tsx",
  "src/components/ui/maps/LocationMapCanvas.tsx",
];

describe("content security policy", () => {
  const csp = buildContentSecurityPolicy("un-nonce-cualquiera");

  it("deja pasar las teselas de los mapas", () => {
    const imgSrc = csp.split("; ").find((d) => d.startsWith("img-src"));

    expect(imgSrc).toContain(MAP_TILES_ORIGIN);
  });

  it("no le quedan orígenes de mapas que ya no se usan", () => {
    // Un origen de más no rompe nada, pero deja creer que se sigue cargando de ahí.
    for (const abandonado of ["cartocdn", "tile.openstreetmap.org", "openfreemap"]) {
      expect(csp).not.toContain(abandonado);
    }
  });

  it("todos los mapas montan el mismo fondo", () => {
    /*
     * La comprobación que de verdad importa: que no haya un mapa montando el suyo por su cuenta.
     *
     * El fallo original fue justo ese —un componente con su propia URL escrita a mano que nadie cruzó con
     * la CSP—, y con un único ayudante compartido no puede repetirse: quien copie uno de estos componentes
     * para un mapa nuevo se lleva el fondo correcto, la atribución y la capa de nombres.
     */
    for (const mapa of MAPAS) {
      const fuente = fs.readFileSync(path.join(RAIZ, mapa), "utf8");

      expect(fuente, mapa).toContain("addMapBaseLayer(map)");

      // Ninguna URL de mapa escrita a mano: el único sitio donde se declara es `config/mapTiles`.
      expect(fuente, mapa).not.toMatch(
        /https:\/\/[^"']*(cartocdn|arcgisonline|tile\.openstreetmap|openfreemap)/,
      );
    }
  });
});

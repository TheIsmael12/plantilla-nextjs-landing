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
 * exactamente eso con las teselas del mapa: la cabecera abría CARTO y uno de los tres mapas pedía las suyas
 * a OpenStreetMap.
 */
const RAIZ = path.resolve(__dirname, "..");

describe("content security policy", () => {
  const csp = buildContentSecurityPolicy("un-nonce-cualquiera");

  it("deja pasar las teselas de los mapas", () => {
    expect(csp).toContain(MAP_TILES_ORIGIN);
  });

  it("no le quedan orígenes de mapas que ya no se usan", () => {
    // Un origen de más no rompe nada, pero deja creer que se sigue cargando de ahí.
    expect(csp).not.toContain("cartocdn");
  });

  it("todos los mapas piden las teselas al origen que la cabecera abre", () => {
    /*
     * La comprobación que de verdad importa: que no haya un mapa pidiéndoselas a otro sitio.
     *
     * Se mira el código, no la configuración, porque el fallo original fue justo ese — un componente con su
     * propia URL escrita a mano que nadie cruzó con la CSP.
     */
    const mapas = [
      "src/components/ui/contact/ContactMapCanvas.tsx",
      "src/components/ui/services/ServiceDetailZonesCanvas.tsx",
      "src/components/ui/maps/LocationMapCanvas.tsx",
    ];

    for (const mapa of mapas) {
      const fuente = fs.readFileSync(path.join(RAIZ, mapa), "utf8");

      expect(fuente, mapa).toContain("MAP_TILE_URL");
      expect(fuente, mapa).not.toMatch(/https:\/\/[^"']*\.(png|jpg)/);
    }
  });
});

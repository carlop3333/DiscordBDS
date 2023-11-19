import { debug } from "./main.ts";
class CustomLog {
  #getDate() {
    const u = new Date();
    return u.toUTCString();
  }
  info(text: string) {
    console.log(`[${this.#getDate()} INFO] ${text}`);
  }
  error(text:string, code: number) {
    console.error(
      `[${this.#getDate()} ERROR status ${
        code == 0
          ? "VERY LOW"
          : code == 1
          ? "LOW"
          : code == 2
          ? "NORMAL"
          : code == 3
          ? "HIGH"
          : code == 4
          ? "VERY HIGH"
          : "UNKNOWN"
      }] ${text}`
    );
  }
  debug(text: string) {
    if (debug) console.log(`[${this.#getDate()} DEBUG] ${text}`);
  }
}

class ColorConvertor {
  COLOR_LIST = new Map();

  #compareRBG(rgb1: Array<number>, rgb2: Array<number>) {
    return Math.sqrt(Math.pow(rgb2[0] - rgb1[0], 2) + Math.pow(rgb2[1] - rgb1[1], 2) + Math.pow(rgb2[2] - rgb1[2], 2));
  }
  #decimalToRGB(decToConvert: number) {
    const r = Math.floor(decToConvert / (256 * 256));
    const g = Math.floor(decToConvert / 256) % 256;
    const b = decToConvert % 256;
    return [r, g, b];
  }
  #sortCodesInMap() {
    this.COLOR_LIST.set("BLACK_§0", [0, 0, 0]);
    this.COLOR_LIST.set("DARK_BLUE_§1", [0, 0, 170]);
    this.COLOR_LIST.set("DARK_GREEN_§2", [0, 170, 0]);
    this.COLOR_LIST.set("DARK_AQUA_§3", [0, 170, 170]);
    this.COLOR_LIST.set("DARK_RED_§4", [170, 0, 0]);
    this.COLOR_LIST.set("DARK_PURPLE_§5", [170, 0, 170]);
    this.COLOR_LIST.set("GOLD_§6", [255, 170, 0]);
    this.COLOR_LIST.set("GRAY_§7", [170, 170, 170]);
    this.COLOR_LIST.set("DARK_GRAY_§8", [85, 85, 85]);
    this.COLOR_LIST.set("BLUE_§9", [85, 85, 255]);
    this.COLOR_LIST.set("GREEN_§a", [85, 255, 85]);
    this.COLOR_LIST.set("AQUA_§b", [85, 255, 255]);
    this.COLOR_LIST.set("RED_§c", [255, 85, 85]);
    this.COLOR_LIST.set("LIGHT_PURPLE_§d", [255, 85, 255]);
    this.COLOR_LIST.set("YELLOW_§e", [255, 255, 85]);
    this.COLOR_LIST.set("WHITE_§f", [255, 255, 255]);
    this.COLOR_LIST.set("MINECOIN_GOLD_§g", [221, 214, 5]);
    this.COLOR_LIST.set("MATERIAL_QUARTZ_§h", [227, 212, 209]);
    this.COLOR_LIST.set("MATERIAL_IRON_§i", [206, 202, 202]);
    this.COLOR_LIST.set("MATERIAL_NETHERITE_§j", [68, 58, 59]);
    this.COLOR_LIST.set("MATERIAL_REDSTONE_§m", [151, 22, 7]);
    this.COLOR_LIST.set("MATERIAL_COPPER_§m", [180, 104, 77]);
    this.COLOR_LIST.set("MATERIAL_GOLD_§p", [222, 177, 45]);
    this.COLOR_LIST.set("MATERIAL_EMERALD_§q", [17, 160, 54]);
    this.COLOR_LIST.set("MATERIAL_DIAMOND_§s", [44, 186, 168]);
    this.COLOR_LIST.set("MATERIAL_LAPIS_§t", [33, 73, 123]);
    this.COLOR_LIST.set("MATERIAL_AMETHYST_§u", [154, 92, 198]);
  }
  /**
   * @description Returns the estimate decimal color in minecraft
   * 
   * @param {Number} rgb1 The rgb to compare
   */
  estimateMCDecimal(decimalToCompare: number) {
    let total: Array<number> = [];
    let minTotal = 0;
    let keyName = "";
    const dec = this.#decimalToRGB(decimalToCompare);
    this.#sortCodesInMap();
    this.COLOR_LIST.forEach((color) => {
        total.push(Math.floor(this.#compareRBG(color, dec)));
    });
    minTotal = Math.min(...total);
    this.COLOR_LIST.forEach((color, key) => {
        if (minTotal == Math.floor(this.#compareRBG(color, dec))) {
          keyName = key;
        }
    });
    return keyName;
  }
}

export const clog = new CustomLog();
export const colorComp = new ColorConvertor();

const math = require("mathjs");
const { useRedmean } = require("./config.json");


class CustomLog {
  #getDate() {
    var u = new Date();
    return u.toUTCString();
  }
  info(text) {
    console.log(`[${this.#getDate()} INFO] ${text}`);
  }
  error(text, code) {
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
  debug(text, debug) {
    if (debug) console.log(`[${this.#getDate()} DEBUG] ${text}`);
  }
}

class ColorConvertor {
  COLOR_LIST = new Map();

  #compareRedmean(rgb1, rgb2) {
    const dR = Math.floor(rgb1[0] - rgb2[0]);
    const dG = Math.floor(rgb1[1] - rgb2[1]);
    const dB = Math.floor(rgb1[2] - rgb2[2]);
    const aR = Math.floor((1 / 2 + (rgb1[0] + rgb2[0])) / 2);
    return math.sqrt(
      (math.number(2) + math.fraction(math.fraction(aR, 256))) * math.pow(math.number(dR), 2) +
        math.number(4) * math.pow(math.number(dG), 2) +
        (math.number(2) + math.fraction(255 - aR, 256)) * math.pow(math.number(dB), 2)
    );
  }

  #compareRBG(rgb1, rgb2) {
    return Math.sqrt(Math.pow(rgb2[0] - rgb1[0], 2) + Math.pow(rgb2[1] - rgb1[1], 2) + Math.pow(rgb2[2] - rgb1[2], 2));
  }
  #decimalToRGB(decToConvert) {
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
   * @param {Number} rgb1 The rgb to compare
   */
  estimateMCDecimal(decimalToCompare) {
    var total = [];
    var minTotal = 0;
    var keyName = "";
    var dec = this.#decimalToRGB(decimalToCompare);
    this.#sortCodesInMap();
    this.COLOR_LIST.forEach((color) => {
      if (useRedmean) total.push(Math.floor(this.#compareRedmean(color, dec)));
      else total.push(Math.floor(this.#compareRBG(color, dec)));
    });
    minTotal = Math.min(...total);
    this.COLOR_LIST.forEach((color, key) => {
      if (useRedmean) {
        if (minTotal == Math.floor(this.#compareRedmean(color, dec))) {
          keyName = key;
        }
      } else {
        if (minTotal == Math.floor(this.#compareRBG(color, dec))) {
          keyName = key;
        }
      }
    });
    return keyName;
  }
}

var clog = new CustomLog();
var colorComp = new ColorConvertor();
exports.colorComp = colorComp;
exports.clog = clog;


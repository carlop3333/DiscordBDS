var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CustomLog_instances, _CustomLog_getDate;
import { debug } from "./main";
class CustomLog {
    constructor() {
        _CustomLog_instances.add(this);
    }
    info(text) {
        console.log(`[${__classPrivateFieldGet(this, _CustomLog_instances, "m", _CustomLog_getDate).call(this)} INFO] ${text}`);
    }
    error(text, code) {
        console.error(`[${__classPrivateFieldGet(this, _CustomLog_instances, "m", _CustomLog_getDate).call(this)} ERROR status ${code == 0
            ? "VERY LOW"
            : code == 1
                ? "LOW"
                : code == 2
                    ? "NORMAL"
                    : code == 3
                        ? "HIGH"
                        : code == 4
                            ? "VERY HIGH"
                            : "UNKNOWN"}] ${text}`);
    }
    debug(text) {
        if (debug)
            console.log(`[${__classPrivateFieldGet(this, _CustomLog_instances, "m", _CustomLog_getDate).call(this)} DEBUG] ${text}`);
    }
}
_CustomLog_instances = new WeakSet(), _CustomLog_getDate = function _CustomLog_getDate() {
    var u = new Date();
    return u.toUTCString();
};
export var clog = new CustomLog();

//# sourceMappingURL=../../_discordbdsDebug/utils.js.map

/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./wwwroot/vendor/libs/formvalidation/dist/js/locales/no_NO.js":
/*!*********************************************************************!*\
  !*** ./wwwroot/vendor/libs/formvalidation/dist/js/locales/no_NO.js ***!
  \*********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\n(function (global, factory) {\n  ( false ? 0 : _typeof(exports)) === 'object' && \"object\" !== 'undefined' ? module.exports = factory() :  true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :\n\t\t__WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : (0);\n})(this, function () {\n  'use strict';\n\n  /**\n   * Norwegian language package\n   * Translated by @trondulseth\n   */\n  var no_NO = {\n    base64: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig base64-kodet verdi'\n    },\n    between: {\n      default: 'Vennligst fyll ut dette feltet med en verdi mellom %s og %s',\n      notInclusive: 'Vennligst tast inn kun en verdi mellom %s og %s'\n    },\n    bic: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig BIC-nummer'\n    },\n    callback: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig verdi'\n    },\n    choice: {\n      between: 'Vennligst velg %s - %s valgmuligheter',\n      default: 'Vennligst fyll ut dette feltet med en gyldig verdi',\n      less: 'Vennligst velg minst %s valgmuligheter',\n      more: 'Vennligst velg maks %s valgmuligheter'\n    },\n    color: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig'\n    },\n    creditCard: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig kreditkortnummer'\n    },\n    cusip: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig CUSIP-nummer'\n    },\n    date: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig dato',\n      max: 'Vennligst fyll ut dette feltet med en gyldig dato før %s',\n      min: 'Vennligst fyll ut dette feltet med en gyldig dato etter %s',\n      range: 'Vennligst fyll ut dette feltet med en gyldig dato mellom %s - %s'\n    },\n    different: {\n      default: 'Vennligst fyll ut dette feltet med en annen verdi'\n    },\n    digits: {\n      default: 'Vennligst tast inn kun sifre'\n    },\n    ean: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig EAN-nummer'\n    },\n    ein: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig EIN-nummer'\n    },\n    emailAddress: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig epostadresse'\n    },\n    file: {\n      default: 'Velg vennligst en gyldig fil'\n    },\n    greaterThan: {\n      default: 'Vennligst fyll ut dette feltet med en verdi større eller lik %s',\n      notInclusive: 'Vennligst fyll ut dette feltet med en verdi større enn %s'\n    },\n    grid: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig GRIDnummer'\n    },\n    hex: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig hexadecimalt nummer'\n    },\n    iban: {\n      countries: {\n        AD: 'Andorra',\n        AE: 'De Forente Arabiske Emirater',\n        AL: 'Albania',\n        AO: 'Angola',\n        AT: 'Østerrike',\n        AZ: 'Aserbajdsjan',\n        BA: 'Bosnia-Hercegovina',\n        BE: 'Belgia',\n        BF: 'Burkina Faso',\n        BG: 'Bulgaria',\n        BH: 'Bahrain',\n        BI: 'Burundi',\n        BJ: 'Benin',\n        BR: 'Brasil',\n        CH: 'Sveits',\n        CI: 'Elfenbenskysten',\n        CM: 'Kamerun',\n        CR: 'Costa Rica',\n        CV: 'Kapp Verde',\n        CY: 'Kypros',\n        CZ: 'Tsjekkia',\n        DE: 'Tyskland',\n        DK: 'Danmark',\n        DO: 'Den dominikanske republikk',\n        DZ: 'Algerie',\n        EE: 'Estland',\n        ES: 'Spania',\n        FI: 'Finland',\n        FO: 'Færøyene',\n        FR: 'Frankrike',\n        GB: 'Storbritannia',\n        GE: 'Georgia',\n        GI: 'Gibraltar',\n        GL: 'Grønland',\n        GR: 'Hellas',\n        GT: 'Guatemala',\n        HR: 'Kroatia',\n        HU: 'Ungarn',\n        IE: 'Irland',\n        IL: 'Israel',\n        IR: 'Iran',\n        IS: 'Island',\n        IT: 'Italia',\n        JO: 'Jordan',\n        KW: 'Kuwait',\n        KZ: 'Kasakhstan',\n        LB: 'Libanon',\n        LI: 'Liechtenstein',\n        LT: 'Litauen',\n        LU: 'Luxembourg',\n        LV: 'Latvia',\n        MC: 'Monaco',\n        MD: 'Moldova',\n        ME: 'Montenegro',\n        MG: 'Madagaskar',\n        MK: 'Makedonia',\n        ML: 'Mali',\n        MR: 'Mauritania',\n        MT: 'Malta',\n        MU: 'Mauritius',\n        MZ: 'Mosambik',\n        NL: 'Nederland',\n        NO: 'Norge',\n        PK: 'Pakistan',\n        PL: 'Polen',\n        PS: 'Palestina',\n        PT: 'Portugal',\n        QA: 'Qatar',\n        RO: 'Romania',\n        RS: 'Serbia',\n        SA: 'Saudi-Arabia',\n        SE: 'Sverige',\n        SI: 'Slovenia',\n        SK: 'Slovakia',\n        SM: 'San Marino',\n        SN: 'Senegal',\n        TL: 'øst-Timor',\n        TN: 'Tunisia',\n        TR: 'Tyrkia',\n        VG: 'De Britiske Jomfruøyene',\n        XK: 'Republikken Kosovo'\n      },\n      country: 'Vennligst fyll ut dette feltet med et gyldig IBAN-nummer i %s',\n      default: 'Vennligst fyll ut dette feltet med et gyldig IBAN-nummer'\n    },\n    id: {\n      countries: {\n        BA: 'Bosnien-Hercegovina',\n        BG: 'Bulgaria',\n        BR: 'Brasil',\n        CH: 'Sveits',\n        CL: 'Chile',\n        CN: 'Kina',\n        CZ: 'Tsjekkia',\n        DK: 'Danmark',\n        EE: 'Estland',\n        ES: 'Spania',\n        FI: 'Finland',\n        HR: 'Kroatia',\n        IE: 'Irland',\n        IS: 'Island',\n        LT: 'Litauen',\n        LV: 'Latvia',\n        ME: 'Montenegro',\n        MK: 'Makedonia',\n        NL: 'Nederland',\n        PL: 'Polen',\n        RO: 'Romania',\n        RS: 'Serbia',\n        SE: 'Sverige',\n        SI: 'Slovenia',\n        SK: 'Slovakia',\n        SM: 'San Marino',\n        TH: 'Thailand',\n        TR: 'Tyrkia',\n        ZA: 'Sør-Afrika'\n      },\n      country: 'Vennligst fyll ut dette feltet med et gyldig identifikasjons-nummer i %s',\n      default: 'Vennligst fyll ut dette feltet med et gyldig identifikasjons-nummer'\n    },\n    identical: {\n      default: 'Vennligst fyll ut dette feltet med den samme verdi'\n    },\n    imei: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig IMEI-nummer'\n    },\n    imo: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig IMO-nummer'\n    },\n    integer: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig tall'\n    },\n    ip: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig IP adresse',\n      ipv4: 'Vennligst fyll ut dette feltet med en gyldig IPv4 adresse',\n      ipv6: 'Vennligst fyll ut dette feltet med en gyldig IPv6 adresse'\n    },\n    isbn: {\n      default: 'Vennligst fyll ut dette feltet med ett gyldig ISBN-nummer'\n    },\n    isin: {\n      default: 'Vennligst fyll ut dette feltet med ett gyldig ISIN-nummer'\n    },\n    ismn: {\n      default: 'Vennligst fyll ut dette feltet med ett gyldig ISMN-nummer'\n    },\n    issn: {\n      default: 'Vennligst fyll ut dette feltet med ett gyldig ISSN-nummer'\n    },\n    lessThan: {\n      default: 'Vennligst fyll ut dette feltet med en verdi mindre eller lik %s',\n      notInclusive: 'Vennligst fyll ut dette feltet med en verdi mindre enn %s'\n    },\n    mac: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig MAC adresse'\n    },\n    meid: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig MEID-nummer'\n    },\n    notEmpty: {\n      default: 'Vennligst fyll ut dette feltet'\n    },\n    numeric: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig flytende desimaltall'\n    },\n    phone: {\n      countries: {\n        AE: 'De Forente Arabiske Emirater',\n        BG: 'Bulgaria',\n        BR: 'Brasil',\n        CN: 'Kina',\n        CZ: 'Tsjekkia',\n        DE: 'Tyskland',\n        DK: 'Danmark',\n        ES: 'Spania',\n        FR: 'Frankrike',\n        GB: 'Storbritannia',\n        IN: 'India',\n        MA: 'Marokko',\n        NL: 'Nederland',\n        PK: 'Pakistan',\n        RO: 'Rumenia',\n        RU: 'Russland',\n        SK: 'Slovakia',\n        TH: 'Thailand',\n        US: 'USA',\n        VE: 'Venezuela'\n      },\n      country: 'Vennligst fyll ut dette feltet med et gyldig telefonnummer i %s',\n      default: 'Vennligst fyll ut dette feltet med et gyldig telefonnummer'\n    },\n    promise: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig verdi'\n    },\n    regexp: {\n      default: 'Vennligst fyll ut dette feltet med en verdi som matcher mønsteret'\n    },\n    remote: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig verdi'\n    },\n    rtn: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig RTN-nummer'\n    },\n    sedol: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig SEDOL-nummer'\n    },\n    siren: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig SIREN-nummer'\n    },\n    siret: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig SIRET-nummer'\n    },\n    step: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig trinn av %s'\n    },\n    stringCase: {\n      default: 'Venligst fyll inn dette feltet kun med små bokstaver',\n      upper: 'Venligst fyll inn dette feltet kun med store bokstaver'\n    },\n    stringLength: {\n      between: 'Vennligst fyll ut dette feltet med en verdi mellom %s og %s tegn',\n      default: 'Vennligst fyll ut dette feltet med en verdi av gyldig lengde',\n      less: 'Vennligst fyll ut dette feltet med mindre enn %s tegn',\n      more: 'Vennligst fyll ut dette feltet med mer enn %s tegn'\n    },\n    uri: {\n      default: 'Vennligst fyll ut dette feltet med en gyldig URI'\n    },\n    uuid: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig UUID-nummer',\n      version: 'Vennligst fyll ut dette feltet med en gyldig UUID version %s-nummer'\n    },\n    vat: {\n      countries: {\n        AT: 'Østerrike',\n        BE: 'Belgia',\n        BG: 'Bulgaria',\n        BR: 'Brasil',\n        CH: 'Schweiz',\n        CY: 'Cypern',\n        CZ: 'Tsjekkia',\n        DE: 'Tyskland',\n        DK: 'Danmark',\n        EE: 'Estland',\n        EL: 'Hellas',\n        ES: 'Spania',\n        FI: 'Finland',\n        FR: 'Frankrike',\n        GB: 'Storbritania',\n        GR: 'Hellas',\n        HR: 'Kroatia',\n        HU: 'Ungarn',\n        IE: 'Irland',\n        IS: 'Island',\n        IT: 'Italia',\n        LT: 'Litauen',\n        LU: 'Luxembourg',\n        LV: 'Latvia',\n        MT: 'Malta',\n        NL: 'Nederland',\n        NO: 'Norge',\n        PL: 'Polen',\n        PT: 'Portugal',\n        RO: 'Romania',\n        RS: 'Serbia',\n        RU: 'Russland',\n        SE: 'Sverige',\n        SI: 'Slovenia',\n        SK: 'Slovakia',\n        VE: 'Venezuela',\n        ZA: 'Sør-Afrika'\n      },\n      country: 'Vennligst fyll ut dette feltet med et gyldig MVA nummer i %s',\n      default: 'Vennligst fyll ut dette feltet med et gyldig MVA nummer'\n    },\n    vin: {\n      default: 'Vennligst fyll ut dette feltet med et gyldig VIN-nummer'\n    },\n    zipCode: {\n      countries: {\n        AT: 'Østerrike',\n        BG: 'Bulgaria',\n        BR: 'Brasil',\n        CA: 'Canada',\n        CH: 'Schweiz',\n        CZ: 'Tsjekkia',\n        DE: 'Tyskland',\n        DK: 'Danmark',\n        ES: 'Spania',\n        FR: 'Frankrike',\n        GB: 'Storbritannia',\n        IE: 'Irland',\n        IN: 'India',\n        IT: 'Italia',\n        MA: 'Marokko',\n        NL: 'Nederland',\n        PL: 'Polen',\n        PT: 'Portugal',\n        RO: 'Romania',\n        RU: 'Russland',\n        SE: 'Sverige',\n        SG: 'Singapore',\n        SK: 'Slovakia',\n        US: 'USA'\n      },\n      country: 'Vennligst fyll ut dette feltet med et gyldig postnummer i %s',\n      default: 'Vennligst fyll ut dette feltet med et gyldig postnummer'\n    }\n  };\n  return no_NO;\n});\n\n//# sourceURL=webpack://frest/./wwwroot/vendor/libs/formvalidation/dist/js/locales/no_NO.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./wwwroot/vendor/libs/formvalidation/dist/js/locales/no_NO.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
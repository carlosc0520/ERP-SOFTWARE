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

/***/ "./wwwroot/vendor/libs/formvalidation/dist/js/locales/fr_BE.js":
/*!*********************************************************************!*\
  !*** ./wwwroot/vendor/libs/formvalidation/dist/js/locales/fr_BE.js ***!
  \*********************************************************************/
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\n(function (global, factory) {\n  ( false ? 0 : _typeof(exports)) === 'object' && \"object\" !== 'undefined' ? module.exports = factory() :  true ? !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :\n\t\t__WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : (0);\n})(this, function () {\n  'use strict';\n\n  /**\n   * Belgium (French) language package\n   * Translated by @neilime\n   */\n  var fr_BE = {\n    base64: {\n      default: 'Veuillez fournir une donnée correctement encodée en Base64'\n    },\n    between: {\n      default: 'Veuillez fournir une valeur comprise entre %s et %s',\n      notInclusive: 'Veuillez fournir une valeur strictement comprise entre %s et %s'\n    },\n    bic: {\n      default: 'Veuillez fournir un code-barre BIC valide'\n    },\n    callback: {\n      default: 'Veuillez fournir une valeur valide'\n    },\n    choice: {\n      between: 'Veuillez choisir de %s à %s options',\n      default: 'Veuillez fournir une valeur valide',\n      less: 'Veuillez choisir au minimum %s options',\n      more: 'Veuillez choisir au maximum %s options'\n    },\n    color: {\n      default: 'Veuillez fournir une couleur valide'\n    },\n    creditCard: {\n      default: 'Veuillez fournir un numéro de carte de crédit valide'\n    },\n    cusip: {\n      default: 'Veuillez fournir un code CUSIP valide'\n    },\n    date: {\n      default: 'Veuillez fournir une date valide',\n      max: 'Veuillez fournir une date inférieure à %s',\n      min: 'Veuillez fournir une date supérieure à %s',\n      range: 'Veuillez fournir une date comprise entre %s et %s'\n    },\n    different: {\n      default: 'Veuillez fournir une valeur différente'\n    },\n    digits: {\n      default: 'Veuillez ne fournir que des chiffres'\n    },\n    ean: {\n      default: 'Veuillez fournir un code-barre EAN valide'\n    },\n    ein: {\n      default: 'Veuillez fournir un code-barre EIN valide'\n    },\n    emailAddress: {\n      default: 'Veuillez fournir une adresse e-mail valide'\n    },\n    file: {\n      default: 'Veuillez choisir un fichier valide'\n    },\n    greaterThan: {\n      default: 'Veuillez fournir une valeur supérieure ou égale à %s',\n      notInclusive: 'Veuillez fournir une valeur supérieure à %s'\n    },\n    grid: {\n      default: 'Veuillez fournir un code GRId valide'\n    },\n    hex: {\n      default: 'Veuillez fournir un nombre hexadécimal valide'\n    },\n    iban: {\n      countries: {\n        AD: 'Andorre',\n        AE: 'Émirats Arabes Unis',\n        AL: 'Albanie',\n        AO: 'Angola',\n        AT: 'Autriche',\n        AZ: 'Azerbaïdjan',\n        BA: 'Bosnie-Herzégovine',\n        BE: 'Belgique',\n        BF: 'Burkina Faso',\n        BG: 'Bulgarie',\n        BH: 'Bahrein',\n        BI: 'Burundi',\n        BJ: 'Bénin',\n        BR: 'Brésil',\n        CH: 'Suisse',\n        CI: \"Côte d'ivoire\",\n        CM: 'Cameroun',\n        CR: 'Costa Rica',\n        CV: 'Cap Vert',\n        CY: 'Chypre',\n        CZ: 'Tchèque',\n        DE: 'Allemagne',\n        DK: 'Danemark',\n        DO: 'République Dominicaine',\n        DZ: 'Algérie',\n        EE: 'Estonie',\n        ES: 'Espagne',\n        FI: 'Finlande',\n        FO: 'Îles Féroé',\n        FR: 'France',\n        GB: 'Royaume Uni',\n        GE: 'Géorgie',\n        GI: 'Gibraltar',\n        GL: 'Groënland',\n        GR: 'Gréce',\n        GT: 'Guatemala',\n        HR: 'Croatie',\n        HU: 'Hongrie',\n        IE: 'Irlande',\n        IL: 'Israël',\n        IR: 'Iran',\n        IS: 'Islande',\n        IT: 'Italie',\n        JO: 'Jordanie',\n        KW: 'Koweït',\n        KZ: 'Kazakhstan',\n        LB: 'Liban',\n        LI: 'Liechtenstein',\n        LT: 'Lithuanie',\n        LU: 'Luxembourg',\n        LV: 'Lettonie',\n        MC: 'Monaco',\n        MD: 'Moldavie',\n        ME: 'Monténégro',\n        MG: 'Madagascar',\n        MK: 'Macédoine',\n        ML: 'Mali',\n        MR: 'Mauritanie',\n        MT: 'Malte',\n        MU: 'Maurice',\n        MZ: 'Mozambique',\n        NL: 'Pays-Bas',\n        NO: 'Norvège',\n        PK: 'Pakistan',\n        PL: 'Pologne',\n        PS: 'Palestine',\n        PT: 'Portugal',\n        QA: 'Quatar',\n        RO: 'Roumanie',\n        RS: 'Serbie',\n        SA: 'Arabie Saoudite',\n        SE: 'Suède',\n        SI: 'Slovènie',\n        SK: 'Slovaquie',\n        SM: 'Saint-Marin',\n        SN: 'Sénégal',\n        TL: 'Timor oriental',\n        TN: 'Tunisie',\n        TR: 'Turquie',\n        VG: 'Îles Vierges britanniques',\n        XK: 'République du Kosovo'\n      },\n      country: 'Veuillez fournir un code IBAN valide pour %s',\n      default: 'Veuillez fournir un code IBAN valide'\n    },\n    id: {\n      countries: {\n        BA: 'Bosnie-Herzégovine',\n        BG: 'Bulgarie',\n        BR: 'Brésil',\n        CH: 'Suisse',\n        CL: 'Chili',\n        CN: 'Chine',\n        CZ: 'Tchèque',\n        DK: 'Danemark',\n        EE: 'Estonie',\n        ES: 'Espagne',\n        FI: 'Finlande',\n        HR: 'Croatie',\n        IE: 'Irlande',\n        IS: 'Islande',\n        LT: 'Lituanie',\n        LV: 'Lettonie',\n        ME: 'Monténégro',\n        MK: 'Macédoine',\n        NL: 'Pays-Bas',\n        PL: 'Pologne',\n        RO: 'Roumanie',\n        RS: 'Serbie',\n        SE: 'Suède',\n        SI: 'Slovénie',\n        SK: 'Slovaquie',\n        SM: 'Saint-Marin',\n        TH: 'Thaïlande',\n        TR: 'Turquie',\n        ZA: 'Afrique du Sud'\n      },\n      country: \"Veuillez fournir un numéro d'identification valide pour %s\",\n      default: \"Veuillez fournir un numéro d'identification valide\"\n    },\n    identical: {\n      default: 'Veuillez fournir la même valeur'\n    },\n    imei: {\n      default: 'Veuillez fournir un code IMEI valide'\n    },\n    imo: {\n      default: 'Veuillez fournir un code IMO valide'\n    },\n    integer: {\n      default: 'Veuillez fournir un nombre valide'\n    },\n    ip: {\n      default: 'Veuillez fournir une adresse IP valide',\n      ipv4: 'Veuillez fournir une adresse IPv4 valide',\n      ipv6: 'Veuillez fournir une adresse IPv6 valide'\n    },\n    isbn: {\n      default: 'Veuillez fournir un code ISBN valide'\n    },\n    isin: {\n      default: 'Veuillez fournir un code ISIN valide'\n    },\n    ismn: {\n      default: 'Veuillez fournir un code ISMN valide'\n    },\n    issn: {\n      default: 'Veuillez fournir un code ISSN valide'\n    },\n    lessThan: {\n      default: 'Veuillez fournir une valeur inférieure ou égale à %s',\n      notInclusive: 'Veuillez fournir une valeur inférieure à %s'\n    },\n    mac: {\n      default: 'Veuillez fournir une adresse MAC valide'\n    },\n    meid: {\n      default: 'Veuillez fournir un code MEID valide'\n    },\n    notEmpty: {\n      default: 'Veuillez fournir une valeur'\n    },\n    numeric: {\n      default: 'Veuillez fournir une valeur décimale valide'\n    },\n    phone: {\n      countries: {\n        AE: 'Émirats Arabes Unis',\n        BG: 'Bulgarie',\n        BR: 'Brésil',\n        CN: 'Chine',\n        CZ: 'Tchèque',\n        DE: 'Allemagne',\n        DK: 'Danemark',\n        ES: 'Espagne',\n        FR: 'France',\n        GB: 'Royaume-Uni',\n        IN: 'Inde',\n        MA: 'Maroc',\n        NL: 'Pays-Bas',\n        PK: 'Pakistan',\n        RO: 'Roumanie',\n        RU: 'Russie',\n        SK: 'Slovaquie',\n        TH: 'Thaïlande',\n        US: 'USA',\n        VE: 'Venezuela'\n      },\n      country: 'Veuillez fournir un numéro de téléphone valide pour %s',\n      default: 'Veuillez fournir un numéro de téléphone valide'\n    },\n    promise: {\n      default: 'Veuillez fournir une valeur valide'\n    },\n    regexp: {\n      default: 'Veuillez fournir une valeur correspondant au modèle'\n    },\n    remote: {\n      default: 'Veuillez fournir une valeur valide'\n    },\n    rtn: {\n      default: 'Veuillez fournir un code RTN valide'\n    },\n    sedol: {\n      default: 'Veuillez fournir a valid SEDOL number'\n    },\n    siren: {\n      default: 'Veuillez fournir un numéro SIREN valide'\n    },\n    siret: {\n      default: 'Veuillez fournir un numéro SIRET valide'\n    },\n    step: {\n      default: 'Veuillez fournir un écart valide de %s'\n    },\n    stringCase: {\n      default: 'Veuillez ne fournir que des caractères minuscules',\n      upper: 'Veuillez ne fournir que des caractères majuscules'\n    },\n    stringLength: {\n      between: 'Veuillez fournir entre %s et %s caractères',\n      default: 'Veuillez fournir une valeur de longueur valide',\n      less: 'Veuillez fournir moins de %s caractères',\n      more: 'Veuillez fournir plus de %s caractères'\n    },\n    uri: {\n      default: 'Veuillez fournir un URI valide'\n    },\n    uuid: {\n      default: 'Veuillez fournir un UUID valide',\n      version: 'Veuillez fournir un UUID version %s number'\n    },\n    vat: {\n      countries: {\n        AT: 'Autriche',\n        BE: 'Belgique',\n        BG: 'Bulgarie',\n        BR: 'Brésil',\n        CH: 'Suisse',\n        CY: 'Chypre',\n        CZ: 'Tchèque',\n        DE: 'Allemagne',\n        DK: 'Danemark',\n        EE: 'Estonie',\n        EL: 'Grèce',\n        ES: 'Espagne',\n        FI: 'Finlande',\n        FR: 'France',\n        GB: 'Royaume-Uni',\n        GR: 'Grèce',\n        HR: 'Croatie',\n        HU: 'Hongrie',\n        IE: 'Irlande',\n        IS: 'Islande',\n        IT: 'Italie',\n        LT: 'Lituanie',\n        LU: 'Luxembourg',\n        LV: 'Lettonie',\n        MT: 'Malte',\n        NL: 'Pays-Bas',\n        NO: 'Norvège',\n        PL: 'Pologne',\n        PT: 'Portugal',\n        RO: 'Roumanie',\n        RS: 'Serbie',\n        RU: 'Russie',\n        SE: 'Suède',\n        SI: 'Slovénie',\n        SK: 'Slovaquie',\n        VE: 'Venezuela',\n        ZA: 'Afrique du Sud'\n      },\n      country: 'Veuillez fournir un code VAT valide pour %s',\n      default: 'Veuillez fournir un code VAT valide'\n    },\n    vin: {\n      default: 'Veuillez fournir un code VIN valide'\n    },\n    zipCode: {\n      countries: {\n        AT: 'Autriche',\n        BG: 'Bulgarie',\n        BR: 'Brésil',\n        CA: 'Canada',\n        CH: 'Suisse',\n        CZ: 'Tchèque',\n        DE: 'Allemagne',\n        DK: 'Danemark',\n        ES: 'Espagne',\n        FR: 'France',\n        GB: 'Royaume-Uni',\n        IE: 'Irlande',\n        IN: 'Inde',\n        IT: 'Italie',\n        MA: 'Maroc',\n        NL: 'Pays-Bas',\n        PL: 'Pologne',\n        PT: 'Portugal',\n        RO: 'Roumanie',\n        RU: 'Russie',\n        SE: 'Suède',\n        SG: 'Singapour',\n        SK: 'Slovaquie',\n        US: 'USA'\n      },\n      country: 'Veuillez fournir un code postal valide pour %s',\n      default: 'Veuillez fournir un code postal valide'\n    }\n  };\n  return fr_BE;\n});\n\n//# sourceURL=webpack://frest/./wwwroot/vendor/libs/formvalidation/dist/js/locales/fr_BE.js?");

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
/******/ 	var __webpack_exports__ = __webpack_require__("./wwwroot/vendor/libs/formvalidation/dist/js/locales/fr_BE.js");
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});
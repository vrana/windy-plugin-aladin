"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * This is main plugin loading function
 * Feel free to write your own compiler
 */
W.loadPlugin(
/* Mounting options */
{
  "name": "windy-plugin-aladin",
  "version": "0.2.0",
  "author": "Jakub Vrana",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vrana/windy-plugin-aladin"
  },
  "description": "Windy plugin for Aladin.",
  "displayName": "Aladin",
  "hook": "menu",
  "className": "plugin-lhpane plugin-mobile-fullscreen",
  "exclusive": "lhpane"
},
/* HTML */
'<div class="plugin-content"> <h2>Aladin</h2> <div id="aladin-forecast">Otevřete picker.</div> <p>Zdroj dat: <a href="https://aladinonline.androworks.org/" target="_blank">Aladin</a></p> </div>',
/* CSS */
'.onwindy-plugin-aladin .left-border{left:400px}.onwindy-plugin-aladin #search{display:none}#windy-plugin-aladin{width:400px;height:100%}#windy-plugin-aladin .plugin-content{padding:20px 15px 15px 15px;font-size:14px;line-height:1.6}#windy-plugin-aladin a{color:navy}#windy-plugin-aladin td{text-align:left;padding-right:5px}',
/* Constructor */
function () {
  var store = W.require('store');

  var picker = W.require('picker');

  var aladin;
  picker.on('pickerOpened', loadAladin);
  picker.on('pickerMoved', loadAladin);
  picker.on('pickerClosed', function () {
    return document.getElementById('aladin-forecast').innerHTML = 'Otevřete picker.';
  });
  store.on('timestamp', updateAladin);

  function loadAladin(coord) {
    aladin = undefined;
    fetch('https://pg.vrana.cz/aladin/get_data.php?latitude=' + coord.lat + '&longitude=' + coord.lon).then(function (response) {
      return response.json();
    }).then(function (data) {
      aladin = data;
      updateAladin();
    }, function () {
      return document.getElementById('aladin-forecast').innerHTML = 'Pro vybrané místo není předpověď.';
    });
  }

  function updateAladin() {
    if (!aladin) {
      return;
    }

    var div = document.getElementById('aladin-forecast');
    var windyTime = new Date(store.get('timestamp'));
    var aladinTime = new Date(aladin.forecastTimeIso);

    if (windyTime >= aladinTime) {
      var _loop = function _loop(i) {
        if (aladinTime >= windyTime) {
          var values = {};
          Object.entries(aladin.parameterValues).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                key = _ref2[0],
                value = _ref2[1];

            return values[key] = value[i];
          });
          console.log(values);
          div.innerHTML = '<table>' + '<tr><td>Vítr:<td><b>' + Math.round(values.WIND_SPEED * 10) / 10 + ' m/s</b>' + '<tr><td>Nárazy:<td><b>' + Math.round(values.WIND_GUST_SPEED * 10) / 10 + ' m/s</b>' + '<tr><td>Směr:<td><span style="display: inline-block; transform: rotate(' + values.WIND_DIRECTION + 'deg)">↑</span> <b>' + Math.round((values.WIND_DIRECTION + 180) % 360) + '°</b>' + '<tr><td>Teplota:<td><b>' + Math.round(values.TEMPERATURE) + ' °C</b>' + '<tr><td>Srážky:<td><b>' + Math.round(values.PRECIPITATION_TOTAL) + ' mm/h</b>' + '</table>';
          return {
            v: void 0
          };
        }

        aladinTime.setHours(aladinTime.getHours() + 1);
      };

      for (var i = 0; i < aladin.parameterValues.WIND_SPEED.length; i++) {
        var _ret = _loop(i);

        if (_typeof(_ret) === "object") return _ret.v;
      }
    }

    div.innerHTML = 'Pro vybraný čas není předpověď.';
  }
});
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
  "version": "0.3.1",
  "author": "Jakub Vrana",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/vrana/windy-plugin-aladin"
  },
  "description": "Windy plugin for Aladin.",
  "displayName": "Aladin"
},
/* HTML */
'',
/* CSS */
'',
/* Constructor */
function () {
  var $ = W.require('$');

  var store = W.require('store');

  var picker = W.require('picker');

  var aladin;
  var aladinDiv;
  picker.on('pickerOpened', loadAladin);
  picker.on('pickerMoved', loadAladin);
  store.on('timestamp', updateAladin);
  store.on('overlay', updateAladin);

  function loadAladin(coord) {
    aladin = undefined;
    updateAladin();
    fetch('https://pg.vrana.cz/aladin/get_data.php?latitude=' + coord.lat + '&longitude=' + coord.lon).then(function (response) {
      return response.json();
    }).then(function (data) {
      aladin = data;
      updateAladin();
    }, function () {
      return updateAladin('Neplatné místo.');
    });
  }

  function updateAladin(error) {
    if (!aladinDiv) {
      var _picker = document.querySelector('.picker-content');

      aladinDiv = document.createElement('div');

      _picker.appendChild(aladinDiv);
    }

    if (!aladin) {
      aladinDiv.innerHTML = error || 'Nahrávám.';
      return;
    }

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
          var content = '';

          switch (store.get('overlay')) {
            case 'wind':
              var dir = Math.round((values.WIND_DIRECTION + 180) % 360);
              content = '<i><div class="iconfont" style="transform: rotate(' + dir + 'deg)">"</div>' + dir + '°</i> ' + values.WIND_SPEED.toFixed(1) + ' m/s';
              break;

            case 'gust':
              content = values.WIND_GUST_SPEED.toFixed(1) + ' m/s';
              break;

            case 'temp':
              content = Math.round(values.TEMPERATURE) + '°C';
              break;

            case 'pressure':
              content = Math.round(values.PRESSURE / 100) + 'hPa';
              break;

            case 'rain':
              content = Math.round(values.PRECIPITATION_TOTAL) + 'mm';
              break;

            case 'rh':
              content = Math.round(100 * values.HUMIDITY) + '%';
              break;

            case 'clouds':
              content = Math.round(100 * values.CLOUDS_TOTAL) + '%';
              break;

            case 'lclouds':
              content = Math.round(100 * values.CLOUDS_LOW) + '%';
              break;

            case 'mclouds':
              content = Math.round(100 * values.CLOUDS_MEDIUM) + '%';
              break;

            case 'hclouds':
              content = Math.round(100 * values.CLOUDS_HIGH) + '%';
              break;
          }

          aladinDiv.innerHTML = '<span><big title="Aladin">' + content + '</big></span>';
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

    aladinDiv.innerHTML = 'Neplatný čas.';
  }
});
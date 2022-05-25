console.log(window.mapboxgl)

/* Return true if text is a URI, false otherwise.
 */
function isUri(text) {
  const re = /^http/;
  return re.test(text.toLowerCase());
}
/* Return true if text is an e-mail address, false otherwise.
 */
function isEmail(text) {
  /* http://emailregex.com/ */
  const re = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
  return re.test(text.toLowerCase());
}
/* Return array of text and trailing punctuation [.,;:!], if any.
 */
function splitPunctuation(text) {
  /* https://returnstring.com/snippets/js-remove-trailing-punctuation */
  const match = text.match(/[.,;:!]+$/);
  if (match) {
    return [ text.slice(0, match.index), text.slice(match.index), ];
  }
  return [ text, '', ];
}
/* Return text formatted as a "no-focus" class anchor link w/:
 * - prefix added to the href;
 * - extra (attributes) added to the anchor;
 * - anchor text interspersed w/ &ZeroWidthSpace;s for wrapping; and 
 * - any trailing punctuation added after the anchor link.
 */
function formatAnchor(prefix, text, extra) {
  [ href, punctuation, ] = splitPunctuation(text);
  const wrapped = href.replace(/\//g, '/&#8203;').replace(/-/g, '-&#8203;');
  return `<a class="no-focus" href="${prefix}${href}"${extra}>${wrapped}</a>${punctuation}`;
}
/* Return text w/ all whitespace-delimited words formatted for URIs, 
 * e-mail addresses, or nothing.
 */
function format(text) {
  if (text == undefined) return '';
  return text.split(/\s/).map(function (element) {
    if (isUri(element)) {
      return formatAnchor('', `${element}`, ` target="_blank"`);
    }
    if (isEmail(element)) {
      return formatAnchor('mailto:', `${element}`, '');
    }
    return element;
    }).join(' ');
}
/** Return x as a string rounded to d decimal places. */
function rounded(x, d=0) {
  // https://developer.mozilla.org/en-US/docs/web/javascript/reference/global_objects/number/tofixed
  return Number.parseFloat(x).toFixed(d);
}
/** Return zoom level based on viewport width and height.
 */
function zoom() {
  // https://docs.mapbox.com/help/glossary/zoom-level/
  const levels = {
     0: 59959.436,
     1: 29979.718,
     2: 14989.859,
     3: 7494.929,
     4: 3747.465,
     5: 1873.732,
     6: 936.866,
     7: 468.433,
     8: 234.217,
     9: 117.108,
    10: 58.554,
    11: 29.277,
    12: 14.639,
    13: 7.319,
    14: 3.660,
    15: 1.830,
    16: 0.915,
    17: 0.457,
    18: 0.229,
    19: 0.114,
    20: 0.057,
    21: 0.029,
    22: 0.014,
  };
  console.log(levels);
  /* Cambridge dimensions:
   * 
   * top: 42.4038, -71.1339
   * right: 42.3691, -71.0642
   * bottom: 42.3528, -71.1200
   * left: 42.3866, -71.1605
   * 
   * width: 42.3783, -71.1605 to 42.3783, -71.0642 = 7910m
   * height: 42.4038, -71.1124 to 42.3528, -71.1124 = 5671m
   */
  const [ wm, hm, ] = [ 7910, 5671, ];
  const viewport = document.getElementById('map').getBoundingClientRect();
  const [ wp, hp, ] = [ viewport.width, viewport.height, ];
  const scale = 1.0
  console.log(`${wm}x${hm} m`);
  console.log(`${wp}x${hp} px`);
  console.log(`${rounded(wm / wp, 2)}x${rounded(hm / hp, 2)} m/px`);
  let level = 0;
  for (let i = 0; i < Object.keys(levels).length; i++) {
    let [ key, val, ] = [i, levels[i], ]
    console.log(`${key}:${rounded(val, 3)} ${rounded(wm / val, 2)}x${rounded(hm / val, 2)}`)
    if (wp < hp && wm / val < wp * scale || wp >= hp && hm / val < hp * scale)
        level = i;
  }
  let [ key, val, ] = [level, levels[level], ]
  console.log(`zoom: ${level} `
    + `(${wp < hp ? 'W' : 'H'}: `
    + `${rounded(wp < hp ? wm / val : hm / val)}px`
    + ` < ${wp < hp ? wp : hp}px)`);
  return level;
}

/* Initialize all map and marker data on window loading.
 */
function load() {
  const images = {
    'Public':            './images/lightbluemarker.png',
    'Family Child Care': './images/darkbluemarker.png',
    'Head Start':        './images/redmarker.png',
    'Independent':       './images/mauvemarker.png',
    'default':           './images/bluemarker.png',
  };
  
  window.mapboxgl.accessToken =
    "pk.eyJ1IjoiY2hwZXR0eSIsImEiOiJjbDJqc2NlNHEwM2JsM2puZHY0YWxvN29oIn0.U2yUIr4_Ci-EyEdW6l4guQ";

  const map = new window.mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/chpetty/cl2r2rdru001y14p7luef1oha",
    // center: [-71.1099081, 42.3751374],
    center: [-71.1124, 42.3783],
    zoom: zoom(),
  });

  // add markers to map
  for (const feature of geojson.features) {
    // create a HTML element for each feature
    const el = document.createElement("div");
    el.className = "marker";
    el.title = feature.properties.Name;

    el.style.backgroundImage = `url(${images.default})`;
    if (images[feature.properties.Type] != undefined) {
      el.style.backgroundImage = `url(${images[feature.properties.Type]})`;
    }
    el.style.backgroundImage = `url('./images/favicon.ico')`; /* NRGL! */

    // create popup HTML
    popup = `
      <h3>${feature.properties.Name}</h3>
      <p>${feature.properties.Type}</p>
      <p>${feature.properties.Subtype}</p>
      <p>${feature.properties.Phone}</p>
      <p>${format(feature.properties.Email)}</p>
      <p>${feature.properties.Address}</p>
      <p>${feature.properties.Capacity}</p>
      <p>${feature.properties.Age}</p>
      <p>${format(feature.properties.Website)}</p>
      <p>${feature.properties.Notes}</p>
      <p>${feature.properties.Hours}</p>
      <p>${feature.properties.Enrollment}</p>
      <p>${format(feature.properties.Cost)}</p>
      <p>${format(feature.properties.Finaid)}</p>`;
    console.log(popup)

    // make a marker for each feature and add to the map
    const marker = new window.mapboxgl.Marker(el)
      .setLngLat(feature.geometry.coordinates)
      .setPopup(
        new window.mapboxgl.Popup({ offset: 15 }) // add popups
          .setHTML(popup)
      )
      .addTo(map);
  }
  zoom();
  console.log(rounded(1234.5679, 0));
  return false;
}

window.onload = load;
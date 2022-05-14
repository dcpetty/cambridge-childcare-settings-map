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
      return formatAnchor('mailto:', `${element}`, ``);
    }
    return element;
    }).join(' ');
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
    center: [-71.1099081, 42.3751374],
    zoom: 12,
  });

  // add markers to map
  for (const feature of geojson.features) {
    // create a HTML element for each feature
    const el = document.createElement("div");
    el.className = "marker";

    el.style.backgroundImage = `url(${images.default})`;
    if (images[feature.properties.Type] != undefined) {
      el.style.backgroundImage = `url(${images[feature.properties.Type]})`;
    }
    el.style.backgroundImage = `url('./images/favicon.ico')`; /* NRGL! */

    // create popup
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
  return false;
}

window.onload = load;
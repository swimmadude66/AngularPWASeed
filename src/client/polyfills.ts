/*
* BROWSER POLYFILLS
*/

import 'classlist';

/** IE9, IE10 and IE11 requires all of the following polyfills. **/
import 'core-js';

// Fix IE matches error
if (!Element.prototype['matches']) {
    Element.prototype['matches'] = Element.prototype['msMatchesSelector'];
}

// Changed URLMapping structure: varient -> variants
// removed old cookie extraction function
// added trim() calls to current cookie extraction function
// added more log statements (should we use a logger instead of console log and set those to debug?)
// renamed functions/variables to reflect the variantSelectionNumber vs. variant
// factored out the variation selection based on the number into a method
// changed the variation selection to a single formula instead of switch case
 
 
const URLMapping = {
    "/recht-und-eigentum/privat-haftpflichtversicherung/": {'variants':["/recht-und-eigentum/privat-haftpflichtversicherung/","/recht-und-eigentum/privat-haftpflichtversicherung-a/","/recht-und-eigentum/privat-haftpflichtversicherung-b/"], 'ticket':'TFU901'},
    "/recht-und-eigentum/privat-haftpflichtversicherung/rechner/":{'variants':["/recht-und-eigentum/privat-haftpflichtversicherung/rechner/", "/recht-und-eigentum/privat-haftpflichtversicherung-a/rechner/","/recht-und-eigentum/privat-haftpflichtversicherung-b/rechner/"], 'ticket':'TFU901'},
    "/angebot/auto/motorradversicherung/": {'variants':["/angebot/auto/motorradversicherung/","/angebot/auto/motorradversicherung-b/"], 'ticket':'TFU797'},
    "/angebot/auto/anhaengerversicherung/": {'variants':["/angebot/auto/anhaengerversicherung/","/angebot/auto/anhaengerversicherung-b/"], 'ticket':'TFU797'},
  };
const COOKIE_KEY = "tgtvariant";
 
// returns the value of the cookie identified by cookieKey
let getCookieValue = function(headers, cookieKey) {
  if (headers.cookie) {
      for (let cookieHeader of headers.cookie) {
          if (cookieHeader.value) {
              const cookies = cookieHeader.value.split(';');
              for (let cookie of cookies) {
                  const [key, val] = cookie.split('=');
                  if (key.trim() === cookieKey) {
                      console.log("Found cookie [" + key + "] with value [" + val + "]");
                      return val.trim();
                  }
              }    
          }
      }
  }
  console.log("No value found for cookie [" + cookieKey + "]");
  return false;
};
 
// checks if the tgtVariant is a valid cookie and returns it
// or null otherwise (invalid cookies are treated as no
// cookie at all.
let getTgtVariantCookieValue = function(headers) {
    let cookie = getCookieValue(headers, COOKIE_KEY);
    if (isNaN(cookie) || cookie < 0 || cookie > 999) {
        return null;
    }
    return cookie;
};
 
 
// select the number used for selecting the variant,
// either taking the cookie value if set, otherwise
// choosing one by random.
let getVariantSelectionNumber = function (cookieVal) {
  if (cookieVal) {
      return cookieVal;
  }
  return Math.round(Math.random() * 1000);
};
 
// returns the correct variant based on a variant
// selection number and the request issued.
let getVariant = function(request, variantSelectionNumber) {
    let variationArr = URLMapping[request.uri].variants;
    let ticket = URLMapping[request.uri].ticket;
    console.log('Variation sizes: [' + variationArr.length + "]");
    if (variationArr.length == 0) {
        console.log("WARN: No variations found.");
        return false;
    }
    let variationIndex = variantSelectionNumber %  variationArr.length;
    console.log("Selected [" + variationArr[variationIndex] +":variationIndex-" + variationIndex+ "] as variation to be shown.");
    let VarientValue = ticket+'_'+String.fromCharCode(variationIndex.toString().charCodeAt(0)+17)
    let querystring = request.querystring.length>0? request.querystring+'&'+COOKIE_KEY+"="+VarientValue:COOKIE_KEY+"="+VarientValue;
    return variationArr[variationIndex]+'?'+querystring;
};
 
exports.handler = async (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  console.log("Header value [" + JSON.stringify(request) + "]");
   // If no A/B testing is defined, deliver page directly
  if (URLMapping[request.uri] == null) {
      return request;
  }
  try {
                // get the number used for selecting the proper variant
                let cookieVariant = getTgtVariantCookieValue(headers);
    let variantSelectionNumber = getVariantSelectionNumber(cookieVariant);
                console.log('Variant Selection Number: [' + variantSelectionNumber + "]");
                let redirect_url = getVariant(request, variantSelectionNumber);
                if(!redirect_url || request.querystring.indexOf(COOKIE_KEY)>-1) {
                    return request;
                } else {
                   const response = {
            status: 302,
            headers: {
                "set-cookie": [
                    {
                        key: "Set-Cookie",
                        value: `${COOKIE_KEY}=${variantSelectionNumber};  Path=/; Max-age=${60*60*24*365*2};SameSite=Lax;`,
                    },
                ],
                'cache-control': [{
                    key: 'Cache-Control',
                    value: 'private, no-cache, must-revalidate'
                }],
                location: [
                    {
                        key: "Location",
                        value: redirect_url,
                    },
                ],
            },
        };
        return response;
                }
  } catch (_error) {
      console.error(_error);
    return request;
  }
};
 

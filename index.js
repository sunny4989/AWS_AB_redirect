const URLMapping = {
    "/auto/kfz-versicherung/": "/auto/kfz-versicherung/schutzbrief/"
  };
const COOKIE_KEY = "tgtvariant";

// return teh value of the cookie identified by COOKIE_KEY
let getCookieValue = function(headers, cookieKey) {
    if (headers.cookie) {
        headers.cookie[0].value.split(';').forEach((cookie) => {
            if (cookie) {
                const parts = cookie.split('=');
                if (parts[0].trim() == COOKIE_KEY) {
                    return parts[1].trim();
                }
            }
        })
    }
    return null;
}

// returns the value of the cookie identified by cookieKey
let getCookieValueOld = function(headers, cookieKey) {
  if (headers.cookie) {
      for (let cookieHeader of headers.cookie) {
          if (cookieHeader.value) {
              const cookies = cookieHeader.value.split(';');
              for (let cookie of cookies) {
                  const [key, val] = cookie.split('=');
                  if (key === cookieKey) {
                      console.log("Found cookie [" + key + "] with value [" + val + "]");
                      return val;
                  }
              }     
          }
      }
  }
  return null;
};

// select the applicable variant, either taking the cookie
// value if set, otherwise choosing one by random.
let getApplicableVariant = function (cookieVal) {
  if (cookieVal) {
      return cookieVal;
  }
  return Math.random() < 0.5 ? 'A' : 'B';
};

exports.handler = async (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
   // If no A/B testing is defined, deliver page directly
  let variationUrl = URLMapping[request.uri];
  if (variationUrl == null) {
     callback(null, request);
  }
  try {
    // If cookie points to variation A, deliver variation A directly
    const cookieVal = getCookieValue(headers, COOKIE_KEY);
    console.log("Cookie defined variant equals ",cookieVal);
    if (cookieVal == 'A') {
      callback(null, request);
    } else {
        // get proper variant and redirect incl. setting of cookie
        let variant = getApplicableVariant(cookieVal);
        let redirect_url = (variant === 'A')? request.uri : variationUrl;
        const response = {
            status: 302,
            headers: {
                "cache-control": [
                    {
                        key: "Cache-Control",
                        value: "no-store",
                    },
                ],
                "set-cookie": [
                    {
                        key: "Set-Cookie",
                        value: `${COOKIE_KEY}=${variant};  Path=/; Max-age=${60*60*24*365*2}; Secure: true; HttpOnly: true; SameSite:lax;`,
                    },
                ],
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

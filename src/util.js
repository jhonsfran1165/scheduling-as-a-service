import moment from "moment-timezone";
import querystring from "query-string";

const isValidDate = (date) =>
  Object.prototype.toString.call(date) === "[object Date]" &&
  !isNaN(date.getTime());

// http://example.com:8888/foo/:param1/:param2
// =>
// http://example.com:8888/foo/value1/value2
const buildUrlWithParams = ({ url, params }) => {
  if (url?.indexOf("/:") && url.indexOf("/:") > 0 && params) {
    const protoDomain = url.slice(0, url.indexOf("/:"));
    let path = url.slice(url.indexOf("/:"));

    for (const key of Object.keys(params)) {
      path = path.replace(`:${key}`, params[key]);
    }

    return `${protoDomain}${path}`;
  }

  return url;
};

// http://example.com/foo
// =>
// http://example.com/foo?query1=value1&query2=value2
const buildUrlWithQuery = ({ url, query }) => {
  if (query) {
    // TODO: use urlSearchParams.entries()
    query = querystring.stringify(query);
    if (query !== "") {
      url += `?${query}`;
    }
  }

  return url;
};

const toTimeZone = (time, zone) => {
  return moment(time).tz(zone).format("YYYY-MM-DD[T]HH:mm:ss.SSS[Z]");
};

export { isValidDate, buildUrlWithParams, buildUrlWithQuery, toTimeZone };

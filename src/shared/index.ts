import noFavicon from "./../assets/imgs/no-favicon.jpeg";

const faviconURL = (u: string, size = "48"): string => {
  if (!chrome?.runtime?.getURL) {
    return noFavicon;
  }

  const url = new URL(chrome.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u); // this encodes the URL as well
  url.searchParams.set("size", size);
  return url.toString();
};

export { faviconURL };

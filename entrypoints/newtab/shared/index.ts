import type { Engine } from "../views/home/type";
import noFavicon from "./../assets/imgs/no-favicon.jpeg";

import baidu from "./../assets/search/logo-baidu.png";
import bing from "./../assets/search/logo-bing.png";
import npm from "./../assets/search/logo-npm.png";
import github from "./../assets/search/logo-github.png";
import toutiao from "./../assets/search/logo-toutiao.png";
import douban from "./../assets/search/logo-douban.png";
import movie from "./../assets/search/logo-douban-movie.png";
import cargo from "./../assets/search/logo-cargo.png";
import pypi from "./../assets/search/logo-pypi.png";
import swift from "./../assets/search/logo-swift.png";

import { browser } from 'wxt/browser';



const faviconURL = (u: string, size = "48"): string => {
  if (!browser?.runtime?.getURL) {
    return noFavicon;
  }

  const url = new URL(browser.runtime.getURL("/_favicon/"));
  url.searchParams.set("pageUrl", u); // this encodes the URL as well
  url.searchParams.set("size", size);
  return url.toString();
};

const SEARCH_ENGINE_LIST: Engine[] = [
  {
    name: "百度",
    img: baidu,
    target: `https://www.baidu.com/s?wd=`,
    id: "baidu",
  },
  {
    name: "必应",
    img: bing,
    target: `https://cn.bing.com/search?q=`,
    id: "bing",
  },
  {
    name: "NPM",
    img: npm,
    target: `https://www.npmjs.com/search?q=`,
    id: "npm",
  },
  {
    name: "github",
    img: github,
    target: `https://github.com/search?q=`,
    id: "github",
  },
  {
    name: "头条",
    img: toutiao,
    target: `https://so.toutiao.com/search?dvpf=pc&source=input&keyword=`,
    id: "toutiao",
  },
  {
    name: "豆瓣",
    img: douban,
    target: `https://search.douban.com/book/subject_search?search_text=`,
    id: "douban",
  },
  {
    name: "电影",
    img: movie,
    target: `https://search.douban.com/movie/subject_search?search_text=`,
    id: "movie",
  },
  {
    name: "Cargo",
    img: cargo,
    target: `https://crates.io/search?q=`,
    id: "cargo",
  },
  {
    name: "PyPi",
    img: pypi,
    target: `https://pypi.org/search/?q=`,
    id: "pypi",
  },
  {
    name: "SwiftPM",
    img: swift,
    target: `https://swiftpackageindex.com/search?query=`,
    id: "swift",
  },
]

export { faviconURL, SEARCH_ENGINE_LIST };

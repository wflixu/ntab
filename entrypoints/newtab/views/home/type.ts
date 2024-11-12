export interface Engine {
  name: string;
  id: string;
  target: string;
  img: string;
}

export interface ISite {
  href: string;
  title: string;
  src: string;
}

export interface ISiteFormState {
  href: string;
  title: string;
}

export interface IBookmarkNode {
  url: string;
  title: string;
  children?: IBookmarkNode[];
  parentId: string;
  id: string;
  dateAdded: number;
  dateGroupModified?: number;
  dateLastUsed?: number;
}

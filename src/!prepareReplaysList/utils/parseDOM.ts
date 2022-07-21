import { JSDOM } from 'jsdom';

const parseDOM = (stringifyDom: string) => new JSDOM(stringifyDom).window.document;

export default parseDOM;

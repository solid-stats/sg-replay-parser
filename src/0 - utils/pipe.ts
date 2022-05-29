// got this from here: https://www.oreilly.com/library/view/hands-on-functional-programming/9781788831437/d3234c19-df94-49e3-ab09-f0da9fbb71f7.xhtml
// more about what is pipe function: https://medium.com/@venomnert/pipe-function-in-javascript-8a22097a538e

// eslint-disable-next-line id-length
const pipe = <T>(...fns: Array<(arg: T) => T>) => (
  (value: T) => fns.reduce((acc, fn) => fn(acc), value)
);

export default pipe;

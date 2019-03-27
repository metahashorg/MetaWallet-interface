const shorten = str => {
  let newstr;
  str = str || '';
  if (str.length < 31) {
    newstr = str;
  } else {
    newstr =
      [str.substr(0, 4), str.substr(4, 4)].join(' ') +
      ' ... ' +
      [
        str.substr(str.length - 12, 4),
        str.substr(str.length - 8, 4),
        str.substr(str.length - 4),
      ].join(' ');
  }
  return newstr;
};

export default shorten;

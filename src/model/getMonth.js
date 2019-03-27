const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getMonth = () => {
  let d = new Date();
  return month[d.getMonth()];
};

const isInMonth = ts => {
  let date = new Date();
  let cDate = new Date(ts);
  return date.getMonth() === cDate.getMonth();
};

export { getMonth, isInMonth };

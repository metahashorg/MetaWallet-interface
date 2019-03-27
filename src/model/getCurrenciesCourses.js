const API_URL = 'https://wallet.metahash.org/api/';

const getCurrenciesCourses = () => {
  let body = {
    id: 1,
    version: '1.0.0',
    method: 'currency.stat',
    token: '',
    params: [
      {
        type: 'time24',
      },
    ],
  };
  let params = {
    method: 'post',
    headers: {
      'Content-Type': 'text/plain;charset=UTF-8',
    },
    body: JSON.stringify(body),
  };
  return window.fetch(API_URL, params).then(resp => resp.json());
};

export default getCurrenciesCourses;

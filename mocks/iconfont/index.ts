import { http, HttpResponse } from 'msw';

export const restHandlers = [
  http.get('http://at.alicdn.com/t/c/font_2406373_y1qirr71rlo.js', () => {
    return HttpResponse.text('111');
  }),
  http.get('http://at.alicdn.com/t/c/font_2406373_y1qirr71rlo.json', () => {
    return HttpResponse.text('111');
  })
];

export default [...restHandlers];

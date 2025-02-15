import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },   // Ramp up
    { duration: '1m', target: 100 },    // Stay at peak
    { duration: '30s', target: 0 },     // Ramp down
  ],
};

export default function () {
  const payload = JSON.stringify({
    character: 'Iron Man',
    movie: 'Avengers',
    user_message: 'Tell me about your suit'
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3000/chat', payload, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
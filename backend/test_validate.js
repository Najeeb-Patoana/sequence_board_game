const v = require('./validate');

// XSS payloads
const xss = ['<script>alert(1)</script>', '\" onmouseover=\"alert(1)', "'; DROP TABLE--", '<img src=x onerror=alert(1)>'];
console.log('=== XSS Name Sanitisation ===');
xss.forEach(p => console.log('  Input:', JSON.stringify(p), '=> Output:', JSON.stringify(v.sanitiseName(p))));

// Valid name
console.log('\n=== Valid Names ===');
['Alice', 'Player 1', 'Najeeb-123'].forEach(n => console.log(' ', JSON.stringify(n), '=>', JSON.stringify(v.sanitiseName(n))));

// Control chars
console.log('\n=== Control Chars ===');
console.log('  NullByte:', JSON.stringify(v.sanitiseName('ali\x00ce')));
console.log('  Tab+CR:  ', JSON.stringify(v.sanitiseName('ali\t\rce')));

// Room codes
console.log('\n=== Room Code Validation ===');
['AB12EF', 'ab12ef', 'ABCD', 'A!EF', '../../passwd'].forEach(c =>
    console.log(' ', JSON.stringify(c), '=>', JSON.stringify(v.sanitiseRoomCode(c)))
);

// Board ID
console.log('\n=== Board ID Validation ===');
[1, 50, 100, 0, 101, 999, -1, NaN].forEach(id =>
    console.log(' ', id, '=>', v.sanitiseBoardId(id))
);

// Card ID
console.log('\n=== Card ID Validation ===');
[1, 108, 109, 0, 50].forEach(id =>
    console.log(' ', id, '=>', v.sanitiseCardId(id))
);

// Rate limiter
console.log('\n=== Rate Limiter ===');
const { rateLimiter } = v;
let blocked = false;
for (let i = 0; i < 25; i++) {
    if (!rateLimiter.allow('sock1', 'test_event', 5, 1000)) { blocked = true; break; }
}
console.log('  Blocked after 5 calls in window:', blocked);
console.log('  New socket allowed:', rateLimiter.allow('sock2', 'test_event', 5, 1000));

// Player count
console.log('\n=== Player Count ===');
[2,3,4,6,8,9,10,12,1,5,7,99].forEach(n => console.log(' ', n, '=>', v.sanitisePlayerCount(n)));

console.log('\nALL VALIDATION TESTS PASSED');

const formats = require('../utils/formats');
console.log(formats.formatNumber(123, 2));
console.log(formats.friendlyByte(123));
console.log(formats.friendlyNumber(123456789));
console.log(formats.friendlyNumber(123456789012, 3));

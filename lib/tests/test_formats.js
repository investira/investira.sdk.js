const formats = require('../utils/formats');
console.log(formats.formatNumber(123, 2));
console.log(formats.friendlyByte(123));
console.log(formats.friendlyNumber(123456789));
console.log(formats.friendlyNumber(123456789012, 3));
console.log(formats.friendlyNumber(0, 2));
console.log(formats.friendlyNumber(100, 2)); // R$100
console.log(formats.friendlyNumber(1200, 2)); // R$ 1,2mil
console.log(formats.friendlyNumber(71200, 2)); // R$71,2mil
console.log(formats.friendlyNumber(113000, 2)); // R$113mil

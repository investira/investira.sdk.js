const formats = require('../utils/formats');
formats.LOCALE = 'pt-BR';
formats.CURRENCY = 'BRL'; //'EUR';
console.log(formats.formatNumber(123, 2));
console.log(formats.friendlyByte(123));
console.log(formats.friendlyNumber(123456789));
console.log(formats.friendlyNumber(123456789012, 3));
console.log(formats.friendlyNumber(0, 2));
console.log(formats.friendlyNumber(100, 0, true)); // R$100
console.log(formats.friendlyNumber(1200, 0, true)); // R$ 1,2 mil
console.log(formats.friendlyNumber(71200, 0, true)); // R$71,2 mil
console.log(formats.friendlyNumber(123456, 2, true)); // R$123,46 mil
console.log(formats.friendlyNumber(123456, 5, true)); // R$123,45600 mil
console.log(formats.friendlyNumber(123450, 2, true)); // R$123,45 mil
console.log(formats.friendlyNumber(123450, 0, true)); // R$123,45 mil
console.log(formats.friendlyNumber(123400, 2, true)); // R$123,40 mil
console.log(formats.friendlyNumber(123400, 0, true)); // R$123,4 mil
//

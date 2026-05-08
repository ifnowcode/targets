// Globals

var onoff = {true: 'on', false: 'off'};

function randomColorHex() {
  let letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const genRanHexString = size => "0x" + [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function randomFloat(min, max, decimals) {
  return parseFloat((Math.random() * (min - max) + max).toFixed(decimals));
}

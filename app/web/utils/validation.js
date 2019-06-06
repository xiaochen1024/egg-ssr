export function isIdentity(value) {
  let ret = false;
  const idCard = value;
  const w = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  if (idCard.length === 18) {
    // 身份证号码长度必须为18，只要校验位正确就算合法
    const crc = idCard.substring(17);
    const a = [];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      a.push(idCard.substring(i, i + 1));
      sum += parseInt(a[i], 10) * parseInt(w[i], 10);
    }
    sum %= 11;
    let res = '-1';
    switch (sum) {
      case 0: {
        res = '1';
        break;
      }
      case 1: {
        res = '0';
        break;
      }
      case 2: {
        res = 'X';
        break;
      }
      case 3: {
        res = '9';
        break;
      }
      case 4: {
        res = '8';
        break;
      }
      case 5: {
        res = '7';
        break;
      }
      case 6: {
        res = '6';
        break;
      }
      case 7: {
        res = '5';
        break;
      }
      case 8: {
        res = '4';
        break;
      }
      case 9: {
        res = '3';
        break;
      }
      case 10: {
        res = '2';
        break;
      }
      default:
        break;
    }

    if (crc.toLowerCase() === res.toLowerCase()) {
      ret = true;
    }
  }
  return ret;
}

export function isMobile(value) {
  return /^1\d{10}$/g.test(value);
}

export function isEmail(value) {
  // 正则由后端提供
  // eslint-disable-next-line
  return /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+(com|edu|gov|int|mil|net|org|biz|info|pro|name|museum|coop|aero|xxx|idv|cn)$/.test(
    value,
  );
}

export function isExpectAmount(value) {
  if (value < 3000 || value > 100000) {
    return false;
  }
  return value % 100 === 0;
}

export function lessMillion(value) {
  return value > 0 && value <= 1000000;
}

export function isCarNumber(value) {
  return !value || /^.[A-Z](\w{5,6})$/g.test(value);
}

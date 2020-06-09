/**
 * 深拷贝
 *
 * @param obj - 目标对象
 * @returns {*}
 */
const clone = (obj) => {
  if (obj === null || typeof (obj) !== 'object') {
    return obj;
  }

  if ('isActiveClone' in obj) {
    throw new Error('循环引用警告⚠️');
  }

  let temp;
  if (obj instanceof Date) {
    temp = new obj.constructor(obj);
  } else {
    temp = obj.constructor();
  }

  Object.keys(obj).forEach((key) => {
    obj.isActiveClone = null;
    temp[key] = clone(obj[key]);
    delete obj.isActiveClone;
  });
  return temp;
};

export default clone;

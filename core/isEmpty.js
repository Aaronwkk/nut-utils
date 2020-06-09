/**
 * 是否无意义的空值
 * 例如：null, undefined, NaN, empty string('')
 *
 * @param val - 目标值
 */
export default val => !(val || val === false || val === 0);

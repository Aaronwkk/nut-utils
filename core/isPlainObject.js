/**
 * 是否纯对象
 * @param obj - 目标变量
 */
export default (obj) => obj && typeof obj === 'object' && obj.constructor === Object;

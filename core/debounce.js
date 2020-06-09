/**
 * 该函数为高阶函数，接收一个普通函数，返回一个新的匿名函数
 * 调用该匿名函数需要等待给定的"等待时间"才会生效，
 * 而多次调用该匿名函数时会刷新"等待时间"，只有当超时时才会真正执行最后一次调用。
 *
 * @param func - 需要执行的函数
 * @param wait - 等待时间
 * @returns {Function}
 */
const debounce = (func, wait) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);

    return new Promise((resolve, reject) => {
      timeout = setTimeout(async () => {
        timeout = null;

        try {
          resolve(await func.apply(this, args));
        } catch (ex) {
          reject(ex);
        }
      }, wait);
    });
  };
};

export default debounce;

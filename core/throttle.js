/**
 * 该函数为高阶函数，接收一个普通函数，返回一个新的匿名函数
 * 间隔时间内调用多次该匿名函数，只触发一次。
 *
 * @param fun - 需要执行的函数
 * @param delay - 间隔时间
 * @return {Function}
 */

export default function throttle(fun, delay) {
  let time;

  return async (...args) => {
    const now = +new Date();

    if (time && now - time > delay) {
      await fun.apply(this, args);
      time = now;
    } else if (!time) {
      await fun.apply(this, args);
      time = now;
    }
  };
}

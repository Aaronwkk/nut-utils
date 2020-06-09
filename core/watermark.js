const size = 30;
const MAX_AREA = 536848900;

const rotate = (target, text = 'test', width, height) => {
  const context = target.getContext('2d');
  const metrics = context.measureText(text);

  context.globalAlpha = 0.5;
  context.fillStyle = '#ccc';
  context.font = `${size}px Josefin Slab`;
  context.rotate((-45 * Math.PI) / 180);

  const rows = Math.ceil(height / size);
  const cols = Math.ceil(width / metrics.width);

  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols * 2; j += 1) {
      context.fillText(
        text,
        (metrics.width * 3 * j) - (100 * i),
        size * i * 3,
      );
    }
  }
  return target;
};

const needRelative = position =>
  ['relative', 'absolute', 'sticky', 'fixed'].indexOf(position) < 0;

const changePosition = (target) => {
  if (needRelative(target.style.position)) {
    target.style.position = 'relative';
  }
};

class WaterMark {
  constructor (){
    this.userInfo = {
      email: 'email',
      name: 'name'
    }
  }

  initWater({name, email}){
    this.userInfo = {
      email,
      name
    }
  }

    /**
   * 将文本转换为ImageData
   * 其中文本会重复充满整个给定的宽高范围
   *
   * @param text - 文本
   * @param width - 目标宽度
   * @param height - 目标高度
   * @param size - 字体大小
   * @returns {ImageData}
   */
  textToImageData(text, width, height, textSize = 24) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.height = height;
    canvas.width = width;
    ctx.font = `${textSize}px Microsoft Yahei`;

    const measure = ctx.measureText(text);

    const rows = Math.ceil(height / textSize);
    const cols = Math.ceil(width / measure.width);

    for (let i = 0; i < rows; i += 1) {
      for (let j = 0; j < cols; j += 1) {
        ctx.fillText(text, measure.width * j, textSize * i);
      }
    }

    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  /**
   * 将文本的ImageData压缩入源ImageData中
   *
   * @param originalData - 目标ImageData
   * @param textData - 文本ImageData
   * @param color - 压缩通道
   */
  mergeData(originalData, textData, color = 'R') {
    const oData = originalData.data;
    const newData = textData.data;
    let bit;
    let offset;

    switch (color) {
      case 'R':
        bit = 0;
        offset = 3;
        break;
      case 'G':
        bit = 1;
        offset = 2;
        break;
      case 'B':
      default:
        bit = 2;
        offset = 1;
        break;
    }

    for (let i = 0; i < oData.length; i += 1) {
      if (i % 4 === bit) {
        // 只处理目标通道
        if (newData[i + offset] === 0 && (oData[i] % 2 === 1)) {
          // 没有信息的像素，该通道最低位置0，但不要越界
          if (oData[i] === 255) {
            oData[i] -= 1;
          } else {
            oData[i] += 1;
          }
        } else if (newData[i + offset] !== 0 && (oData[i] % 2 === 0)) {
          // // 有信息的像素，该通道最低位置1，可以想想上面的斑点效果是怎么实现的
          if (oData[i] === 255) {
            oData[i] -= 1;
          } else {
            oData[i] += 1;
          }
        }
      }
    }
  },

  /**
   * 还原压缩数据
   *
   * @param sourceData - 需要被还原的ImageData
   * @param color - 压缩通道
   */
  processData(sourceData, color = 'R') {
    const { data } = sourceData;

    let bit;
    let offset;
    switch (color) {
      case 'R':
        bit = 0;
        offset = 3;
        break;
      case 'G':
        bit = 1;
        offset = 2;
        break;
      case 'B':
      default:
        bit = 2;
        offset = 1;
        break;
    }

    for (let i = 0; i < data.length; i += 1) {
      if (i % 4 === bit) {
        // 红色分量
        if (data[i] % offset === 0) {
          data[i] = 0;
        } else {
          data[i] = 255;
        }
      } else if (i % 4 !== 3) {
        // 关闭其他分量，不关闭也不影响答案，甚至更美观 o(^▽^)o
        data[i] = 0;
      }
    }
  },

  /**
   * 获取水印图片的url
   *
   * @param text - 水印文本
   * @param width - 水印总宽度
   * @param height - 水印总高度
   * @returns {string}
   */
  getWaterMarkMaskUrl(text, width, height) {
    const area = width * height;
    let newWidth = width;
    let newHeight = height;
    if (area > MAX_AREA) {
      const k = width / height;
      newWidth = Math.sqrt(MAX_AREA * k);
      newHeight = Math.sqrt(MAX_AREA / k);
    }
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    const image = ctx.getImageData(0, 0, newWidth, newHeight);
    const imageData = image.data;
    const { length } = imageData;
    for (let i = 3; i < length; i += 4) {
      imageData[i] = 0;
    }
    ctx.putImageData(image, 0, 0);
    rotate(canvas, text, width, height);

    return canvas.toDataURL();
  },

  /**
   * 根据宽高和水印文本，生成水印图片
   *
   * @param target - 目标元素
   * @param text - 水印文本
   * @param width - 水印图片宽度
   * @param height - 水印图片高度
   */
  getWaterMarkMask(text, width, height) {
    const img = new Image();
    img.style.position = 'absolute';
    img.style.top = 0;
    img.style.left = 0;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.zIndex = 1050;
    img.style.pointerEvents = 'none';
    img.src = WM.getWaterMarkMaskUrl(text, width, height);
    return img;
  },

  /**
   * 为目标元素增加一个水印图片做为子元素
   *
   * @param target - 目标元素
   * @param id - 唯一ID
   * @param position - 水印图片的插入位置, after|in|before
   */
  addWaterMark(target, id, position = 'after') {
    if (!this.userInfo || !id || !target) {
      return;
    }

    const width = target.clientWidth;
    const height = target.clientHeight;
    if (!width || !height) {
      return;
    }

    const parent = target.parentNode;

    const text = [];
    if (this.userInfo.email) {
      text.push(this.userInfo.email.split('@')[0]);
    }
    if (this.userInfo.name) {
      text.push(this.userInfo.name);
    }

    const markText = text.join('-');

    // 已存在的水印图片
    let img = parent.querySelector(`#${id}`);
    if (!img) {
      img = WM.getWaterMarkMask(
        markText,
        width,
        height
      );
      img.id = id;
    } else {
      img.src = WM.getWaterMarkMaskUrl(
        markText,
        width,
        height,
      );
    }

    if (position === 'in') {
      target.appendChild(img);
      changePosition(target);
    } else if (position === 'after') {
      target.parentNode.insertBefore(img, target.nextSibling);
      changePosition(parent);
    } else if (position === 'before') {
      target.insertBefore(img);
      changePosition(parent);
    }
  }
}

export default WaterMark;

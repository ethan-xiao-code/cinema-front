export default {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 10,
      propList: ['*'], // 需要转换的属性，*表示全部
      selectorBlackList: [
        // 忽略 UI 框架，防止 Element Plus 组件变小
        '.el-', 
        '.ignore-',
        '.no-rem',
      ],
      minPixelValue: 12,    // 小于12px不转换
      mediaQuery: false,    // 是否转换媒体查询中的px
    }
  }
}
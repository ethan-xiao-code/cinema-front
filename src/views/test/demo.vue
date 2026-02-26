<template>
  <!-- 开启 autoresize 实现响应式 -->
  <v-chart class="box-office-chart" :option="chartOption" autoresize />
</template>

<script setup>
// 导入 ECharts 核心模块
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
// 导入柱状图模块（替换之前的饼图）
import { BarChart } from "echarts/charts";
// 保留需要的功能组件
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent // 网格组件，用于调整柱状图布局
} from "echarts/components";
import VChart, { THEME_KEY } from "vue-echarts";
import { ref, provide } from "vue";

// 注册柱状图所需的模块
use([
  CanvasRenderer,
  BarChart, // 核心：注册柱状图模块
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent // 注册网格组件，优化布局
]);

// 提供暗黑主题（也可改为 light 亮色主题）
provide(THEME_KEY, "dark");

// 定义柱状图配置项
const chartOption = ref({
  // 标题配置
  title: {
    text: "2024年度热门影片票房排行",
    left: "center",
    textStyle: {
      fontSize: 18,
      fontWeight: "bold"
    }
  },
  // 提示框配置：鼠标悬浮显示详细信息
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow" // 阴影指示器，更贴合柱状图
    },
    // 自定义提示框内容格式
    formatter: "{b}<br/>票房：{c} 亿元"
  },
  // 网格布局：调整图表位置，避免边缘裁剪
  grid: {
    left: "5%",
    right: "5%",
    bottom: "10%",
    top: "15%",
    containLabel: true
  },
  // x轴配置：影片名称
  xAxis: {
    type: "category", // 分类轴（对应影片名称）
    data: ["哪吒2", "流浪地球3", "唐探4", "飞驰人生3", "熊出没·重启"],
    // 文字旋转，避免影片名过长重叠
    axisLabel: {
      rotate: 15,
      fontSize: 12
    }
  },
  // y轴配置：票房（亿元）
  yAxis: {
    type: "value", // 数值轴（对应票房）
    name: "票房（亿元）", // 轴名称
    nameTextStyle: {
      fontSize: 12
    },
    // 格式化y轴数值，保留1位小数
    axisLabel: {
      formatter: "{value}"
    }
  },
  // 系列数据：柱状图核心数据
  series: [
    {
      name: "票房",
      type: "bar", // 图表类型为柱状图
      barWidth: "60%", // 柱子宽度
      // 模拟票房数据（顺序对应x轴的影片名称）
      data: [128.5, 98.2, 65.8, 52.3, 38.6],
      // 柱子样式：渐变颜色 + 圆角
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "#409eff" },
            { offset: 1, color: "#67c23a" }
          ]
        }
      },
      // 鼠标悬浮高亮效果
      emphasis: {
        itemStyle: {
          color: "#e6a23c"
        }
      }
    }
  ]
});
</script>

<style scoped>
/* 图表容器样式，适配不同屏幕 */
.box-office-chart {
  height: 500px;
  width: 100%;
  min-width: 300px;
  /* 适配小屏幕，减少高度 */
  @media (max-width: 768px) {
    height: 400px;
  }
}
</style>
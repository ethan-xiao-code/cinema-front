<template>
  <div class="film-header">
    <div class="header-box">
      <img :src="film.poster" alt="电影海报" />

      <div class="film-info-box">
        <div class="title">
          <span class="name">{{ film.title }}</span>
          <div class="average-score">
            <template v-if="film.averageScore">
              <el-rate v-model="film.averageScore" disabled text-color="#ff9900" score-template="{value}"></el-rate>
              <span class="score">{{ film.averageScore * 2 }}</span>
            </template>
            <template v-else>
              <span class="empty-text">暂无评分</span>
            </template>
          </div>
        </div>

        <div>导演：{{ film.director }}</div>
        <div>主演：{{ film.actors }}</div>
        <div>电影类型：{{ film.types.split(',').join('，') }}</div>
        <div>上映地区：{{ film.regions.split(',').join('，') }}</div>
        <div>时长：{{ film.duration }} 分钟</div>
        <div>上映日期：{{ film.releaseDate }} 上映</div>

        <div class="btn-box">
          <template v-if="shopType == ShopEnum.Detail">
            <el-button type="danger" class="btn" :icon="ShoppingCart" @click="$emit('buy')">
              特惠购票
            </el-button>
            <el-button type="danger" class="btn" v-if="film.status === 2" :icon="Star" @click="$emit('rate')">
              评分
            </el-button>
            <div class="no-release" v-else>即将上映</div>
          </template>

          <el-button v-if="shopType == ShopEnum.Buy" type="info" class="btn detail-btn" :icon="Reading"
            @click="$emit('detail')">
            查看影片详情
          </el-button>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
// import { defineProps } from 'vue';
import { Reading, ShoppingCart, Star } from '@element-plus/icons-vue';
import { FilmType, ShopEnum, } from '@/api/film/type';

const props = defineProps<{
  film: FilmType,
  shopType: ShopEnum
}>();
</script>

<style scoped lang="scss">
.film-header {
  background: rgb(99, 134, 247);
  padding: 20px;

  .header-box {
    display: flex;
    max-width: 900px;
    margin: auto;

    img {
      width: 160px;
      object-fit: cover;
      margin-right: 24px;
      margin-top: 20px;
    }

    .film-info-box {
      color: white;
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 20px;
      font-size: 13px;

      .title {
        display: flex;
        align-items: center;
        gap: 20px;

        .name {
          font-size: 24px;
          font-weight: 600;
        }

        .average-score {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 20px;

          :deep(.el-rate__icon) {
            font-size: 26px;
          }

          .score {
            color: rgb(238, 188, 74);
          }
        }

        .empty-text {
          margin-left: 40px;
          color: rgb(201, 199, 199);
          font-size: 20px;
        }
      }

      .btn-box {
        display: flex;
        margin-top: 10px;
        gap: 10px;

        .no-release {
          font-size: 16px;
          color: #f5f5f5;
        }
      }
    }
  }
}
</style>

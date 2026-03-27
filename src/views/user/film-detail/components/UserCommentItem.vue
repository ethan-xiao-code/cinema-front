<template>
  <!-- 单个评论/回复项组件：展示头像、用户信息、评论内容、点赞、回复 -->
  <div class="comment-info">
    <!-- 头像区域 -->
    <div class="avatar-section">
      <!-- 有头像则显示头像，无头像则展示用户名首字母 -->
      <el-avatar
        v-if="commentItem.avatar"
        :src="commentItem.avatar"
        :size="props.avatarSize || 45"
      ></el-avatar>
      <el-avatar v-else :size="props.avatarSize || 45">
        {{ commentItem.username?.charAt(0)?.toUpperCase() || '' }}
      </el-avatar>
    </div>

    <!-- 评论主体内容区 -->
    <div class="commentItem-body">
      <!-- 用户信息：用户名 + 回复对象 + 时间 + 评分 -->
      <div class="user-info">
        <div class="usernameText">
          <!-- 评论用户名 -->
          <span>{{ commentItem.username }}</span>
          <!-- 如果是回复评论，显示“回复 @xxx” -->
          <span class="replyText" v-if="commentItem.replyId">
            回复
            <span>@{{ props.getUsernameByCommentId(commentItem.replyId) }}</span>
          </span>
        </div>
        <div class="user-meta">
          <!-- 评论发布时间格式化 -->
          <span class="time">{{ dayjs(commentItem.createdTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          <!-- 电影评分（有评分才显示） -->
          <el-rate
            v-if="commentItem.score"
            :model-value="commentItem.score"
            disabled
            text-color="#ff9900"
            size="small"
            class="commentItem-rating"
          />
        </div>
      </div>

      <!-- 评论正文内容 -->
      <div class="commentItem-content">
        <p>{{ commentItem.content }}</p>
      </div>

      <!-- 评论操作栏：点赞、点踩、回复 -->
      <div class="commentItem-actions">
        <!-- 点赞按钮 -->
        <div class="like-btn" :class="{ liked: commentItem.liked }" @click="handleLike(commentItem)">
          <LikedIcon :size="18" :liked="commentItem.liked" />
          <span class="like-count">{{ commentItem.likes || 0 }}</span>
        </div>

        <!-- 点踩按钮 -->
        <div class="like-btn" :class="{ liked: commentItem.unLiked }" @click="handleUnLike(commentItem)">
          <UnLikedIcon :size="18" :unliked="commentItem.unLiked" />
          <span class="like-count">{{ commentItem.unLikes || 0 }}</span>
        </div>

        <!-- 回复按钮 -->
        <span class="reply-btn" @click="toggleReply(commentItem.id)"> 回复 </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import LikedIcon from "@/components/icons/LikedIcon.vue";
import UnLikedIcon from "@/components/icons/UnLikedIcon.vue";
import { CommentItemType, ReactionEnum } from "@/api/comment/type";
import dayjs from "dayjs";

// 组件参数定义
type PropsType = {
  commentItem: CommentItemType;  // 单条评论数据
  avatarSize?: number;           // 头像大小（可选）
  getUsernameByCommentId: (commentId: number) => string;  // 根据评论ID查用户名
};
const props = defineProps<PropsType>();

// 向外触发事件：显示回复框、点赞/点踩
const emit = defineEmits(["showReplyInput", "likeOrUnLike"]);

// 点赞操作：向父组件发送点赞事件
const handleLike = (commentItem: CommentItemType) => {
  emit("likeOrUnLike", commentItem, ReactionEnum.Like);
};

// 点踩操作：向父组件发送点踩事件
const handleUnLike = (commentItem: CommentItemType) => {
  emit("likeOrUnLike", commentItem, ReactionEnum.UnLike);
};

// 点击回复：通知父组件显示回复输入框
const toggleReply = (commentId: number) => {
  emit("showReplyInput", commentId);
};
</script>

<style lang="scss" scoped>
.comment-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  width: 100%;
  margin-bottom: 16px;
  font-size: 14px;

  // 头像区域（固定宽度，不挤压）
  .avatar-section {
    flex-shrink: 0;

    ::v-deep .el-avatar {
      font-size: 20px;
    }
  }

  // 评论主体内容
  .commentItem-body {
    flex: 1;
    font-size: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .user-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;

      .usernameText {
        color: #666;
        display: flex;
        gap: 8px;

        .replyText {
          color: #333;

          & > span {
            color: #409eff;
            font-weight: 500;
          }
        }
      }

      .user-meta {
        display: flex;
        align-items: center;
        gap: 12px;

        .time {
          color: #999;
          font-size: 13px;
        }

        .commentItem-rating :deep(.el-rate__icon) {
          font-size: 16px;
        }
      }
    }

    // 评论内容样式
    .commentItem-content {
      color: #333;
    }

    // 操作栏：点赞、点踩、回复
    .commentItem-actions {
      display: flex;
      align-items: center;
      gap: 20px;

      .like-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #999;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover,
        &.liked {
          color: #f56c6c;
        }

        &.liked-animation {
          animation: like-pop 0.3s ease;
        }

        .like-count {
          font-size: 14px;
        }
      }

      .reply-btn {
        color: #409eff;
        cursor: pointer;
        font-size: 14px;

        &:hover {
          color: #79bbff;
        }
      }
    }
  }
}
</style>
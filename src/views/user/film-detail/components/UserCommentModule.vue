<template>
  <div class="static-comment">
    <!-- 评论列表 -->
    <div v-if="commentsData.length" class="comment-list">
      <div
        v-for="comment in sortedComments(commentsData)"
        :key="comment.id"
        class="comment-item"
      >
        <!-- 根评论 -->
        <UserCommentItem
          :commentItem="comment"
          :getUsernameByCommentId="getUsernameByCommentId"
          @likeOrUnLike="handleLikeOrUnLike"
          @showReplyInput="showReplyText"
        />

        <!-- 回复列表 -->
        <div v-if="comment.replies.length" class="comment-row-2">
          <div class="replies-container">
            <div class="replies-header" @click="toggleReplies(comment)">
              <span class="replies-count">
                共 {{ comment.replies.length }} 条回复
                <el-icon
                  class="replies-expand-icon"
                  :class="{ expanded: comment.showAllReplies }"
                >
                  <ArrowDown />
                </el-icon>
              </span>
            </div>

            <div class="replies-content">
              <!-- 折叠 -->
              <div v-if="!comment.showAllReplies" class="view-more" @click="comment.showAllReplies = true">
                展开回复
              </div>

              <!-- 展开 -->
              <div v-else class="replies-expanded">
                <UserCommentItem
                  v-for="reply in sortedComments(comment.replies).slice(0, comment.showCount)"
                  :key="reply.id"
                  :commentItem="reply"
                  :avatarSize="30"
                  :getUsernameByCommentId="getUsernameByCommentId"
                  @likeOrUnLike="handleLikeOrUnLike"
                  @showReplyInput="showReplyText"
                />

                <el-button
                  v-if="comment.showCount < comment.replies.length"
                  type="primary"
                  link
                  @click="comment.showCount += 3"
                >
                  展开更多回复
                </el-button>

                <div class="view-less" @click="toggleReplies(comment)">
                  <el-icon><ArrowUp /></el-icon>
                  收起回复
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 回复框 -->
        <div v-if="isShowReplyInput(comment)" class="reply-box">
          <div class="reply-input">
            <el-avatar
              v-if="userStore.userInfo?.avatar"
              :src="userStore.userInfo.avatar"
              :size="45"
            />
            <el-avatar v-else :size="45">
              {{ userStore.userInfo?.username?.charAt(0).toUpperCase() }}
            </el-avatar>

            <el-input
              type="textarea"
              v-model="replyContent"
              :placeholder="`回复 @${replyUsername}`"
              :rows="2"
              class="reply-textarea"
            />
          </div>

          <div class="reply-actions">
            <button class="cancel-btn" @click="cancelReply">取消</button>
            <button class="submit-btn" @click="submitReply(comment.id)">
              回复
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-comment">
      <el-empty :image-size="200" description="暂无用户评论" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import UserCommentItem from "./UserCommentItem.vue";
import { useUserStore } from "@/stores";
import { getCommentByFilmIdApi } from "@/api/comment";
import {
  CommentItemType,
  CommentReactionResType,
  CommentWsEnum,
  ReactionEnum,
  ReplyCommentType,
} from "@/api/comment/type";
import { useWebSocket } from "@/utils/useWebSocket";
import { useRoute } from "vue-router";

/* store */
const userStore = useUserStore();
const route = useRoute();
const curFilmId = ref(Number(route.params.filmId));

/* 评论树（reactive 管理） */
const commentsData = reactive<CommentItemType[]>([]);

/* 回复状态 */
const activeReplyTargetId = ref<number | null>(null);
const replyContent = ref("");
const replyUsername = ref("");

// WebSocket 消息处理
const handleWsMessage = (msg: any) => {
  const { type, data } = msg;

  if (type === CommentWsEnum.FirstComment) handleFirstComment(data);
  if (type === CommentWsEnum.Reply) handleReplyMsg(data);
  if (type === CommentWsEnum.CommentLike) handleLikeMsg(data);
};

// const { initWebSocket, send, close } = useWebSocket(
//   "/ws/comment",
//   handleWsMessage,
//   {
//     token: userStore.token
//   }
// );

const { initWebSocket, send, close } = useWebSocket({
  path: "/ws/comment",
  onMessage: handleWsMessage,
  params: {
    token: userStore.token
  }
});

onMounted(async () => {
  await getCommentList(curFilmId.value);
  initWebSocket();
});

onUnmounted(() => {
  close?.();
});

// 按时间倒序排列
const sortedComments = (data: CommentItemType[]) => {
  return [...data].sort(
    (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
  );
};

// 初始化 UI 状态
const initCommentUIState = (c: CommentItemType) => {
  return {
    ...c,
    replies: c.replies || [],
    showAllReplies: false,
    showCount: 3,
  };
};

// 获取评论列表
const getCommentList = async (filmId: number) => {
  // 注意：这里获取的后端数据一定要按创建时间升序排序，这样能保证一级评论先在commentsData中
  const res = await getCommentByFilmIdApi(filmId);
  commentsData.length = 0;

  res.forEach((c: CommentItemType) => {
    const comment = initCommentUIState(c);
    if (comment.parentId === -1) {
      commentsData.push(comment);
    } else {
      const parent = commentsData.find(p => p.id === comment.parentId);
      parent?.replies?.push(comment);
    }
  });
};

// 新增一级评论
const handleFirstComment = (comment: CommentItemType) => {
  if (comment.filmId !== curFilmId.value) return;
  const newComment = initCommentUIState(comment);
  commentsData.unshift(newComment);
};

// 新增回复
const handleReplyMsg = (reply: CommentItemType) => {
  if (reply.filmId !== curFilmId.value) return;

  // 避免重复
  const exist = commentsData.some(c => c.id === reply.id || c.replies.some(r => r.id === reply.id));
  if (exist) return;

  const newReply = initCommentUIState(reply);
  const parent = commentsData.find(c => c.id === reply.parentId);
  if (parent) {
    parent.replies.push(newReply);

    // 当前用户评论则展开
    if (reply.userId === userStore.userId) parent.showAllReplies = true;
  }
};

// 点赞消息
const handleLikeMsg = (data: CommentReactionResType) => {
  const allComments = commentsData.flatMap(c => [c, ...c.replies]);
  const item = allComments.find(c => c.id === data.commentId);
  if (!item) return;

  item.likes = data.likes;
  item.unLikes = data.unLikes;

  if (data.userId === userStore.userId) {
    item.liked = data.liked;
    item.unLiked = data.unLiked;
  }
};

/* UI 行为 */
const toggleReplies = (comment: CommentItemType) => {
  comment.showAllReplies = !comment.showAllReplies;
  comment.showCount = 3;
};

const showReplyText = (commentId: number) => {
  activeReplyTargetId.value = commentId;
  replyUsername.value = getUsernameByCommentId(commentId);
};

const cancelReply = () => {
  activeReplyTargetId.value = null;
  replyContent.value = "";
};

const getUsernameByCommentId = (id: number) => {
  const allComments = commentsData.flatMap(c => [c, ...c.replies]);
  return allComments.find(c => c.id === id)?.username || "";
};

// 点赞操作
const handleLikeOrUnLike = (comment: CommentItemType, reactionType: ReactionEnum) => {
  send({
    type: CommentWsEnum.CommentLike,
    data: {
      commentId: comment.id,
      reactionType,
      userId: userStore.userId,
    },
  });
};

// 提交回复
const submitReply = (parentId: number) => {
  if (!replyContent.value.trim()) {
    return ElMessage.warning("回复内容不能为空");
  }

  const params: ReplyCommentType = {
    type: CommentWsEnum.Reply,
    data: {
      userId: userStore.userId,
      filmId: curFilmId.value,
      parentId,
      replyId: activeReplyTargetId.value,
      content: replyContent.value,
    },
  };

  send(params);
  replyContent.value = "";
  activeReplyTargetId.value = null;
};

// 是否显示回复框
const isShowReplyInput = (comment: CommentItemType) => {
  if (activeReplyTargetId.value === null) return false;
  if (comment.id === activeReplyTargetId.value) return true;
  return comment.replies.some(r => r.id === activeReplyTargetId.value);
};
</script>

<style scoped lang="scss">
.static-comment {
  font-size: 14px;
  color: #303133;

  .comment-list {
    .comment-item {
      padding: 16px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      /* 二级评论区域 */
      .comment-row-2 {
        margin-top: 12px;

        .replies-container {
          margin-left: 66px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 12px;
          position: relative;

          &::before {
            content: "";
            position: absolute;
            left: 0;
            top: 12px;
            bottom: 12px;
            width: 3px;
            background: #e5eaf3;
            border-radius: 2px;
          }
        }

        .replies-header {
          margin-bottom: 6px;
          cursor: pointer;

          .replies-count {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: #409eff;

            .replies-expand-icon {
              font-size: 12px;
              transition: transform 0.25s;

              &.expanded {
                transform: rotate(180deg);
              }
            }
          }
        }

        .replies-content {
          .replies-expanded {
            margin-top: 8px;
          }

          .view-more,
          .view-less {
            margin-top: 8px;
            padding: 6px 0;
            text-align: center;
            font-size: 13px;
            color: #409eff;
            cursor: pointer;
            border-radius: 4px;

            &:hover {
              background: rgba(64, 158, 255, 0.08);
            }
          }

          .view-less {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
        }
      }

      /* 回复输入框 */
      .reply-box {
        margin-left: 66px;
        margin-top: 10px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        font-size: 24px;
        .reply-input {
          display: flex;
          align-items: center;
          gap: 10px;
          ::v-deep .el-avatar {
            font-size: 24px;
          }
          .reply-textarea {
            font-size: 14px;
            flex: 1;
          }
        }

        .reply-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 8px;

          .cancel-btn,
          .submit-btn {
            padding: 5px 14px;
            border-radius: 4px;
            font-size: 13px;
            cursor: pointer;
            border: none;
          }

          .cancel-btn {
            background: #e4e7ed;
            color: #606266;
          }

          .submit-btn {
            background: #409eff;
            color: #fff;
          }
        }
      }
    }
  }

  .empty-comment {
    padding: 40px 0;
  }
}
</style>

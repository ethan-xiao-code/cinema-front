<template>
  <el-dialog
    title="评分"
    v-model="props.dialogVisible"
    width="500px"
    @close="handleClose"
    class="no-rem-score-dialog"
  >
    <!-- 已评论提示 -->
    <div class="already-commented">
      注意：请慎重评论，每个用户仅可评分一次噢~
    </div>

    <!-- 显示评分 -->
    <div class="scoreText" v-if="commentForm.score">
      <span>{{ commentForm.score * 2 }}</span>分
    </div>

    <!-- 表单 -->
    <el-form :model="commentForm" ref="formRef" class="comment-form">
      <el-form-item label="" prop="score">
        <el-rate
          v-model="commentForm.score"
          show-text
          :texts="textArr"
          allow-half
          text-color="rgb(238, 188, 74)"
          :style="{ margin: 'auto' }"
          :disabled="hasCommented"
        />
      </el-form-item>

      <el-form-item label="" prop="content">
        <el-input
          class="no-scrollbar-textarea"
          type="textarea"
          :autosize="{minRows: 2}"
          placeholder="说说你的看法"
          v-model="commentForm.content"
          :disabled="hasCommented"
        />
      </el-form-item>
    </el-form>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button
          :disabled="isDisabledSubmit || hasCommented"
          type="primary"
          @click="submitForm"
        >提 交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage, type FormInstance } from "element-plus";

import { useUserStore } from "@/stores";
import { CommentFormType } from "@/api/comment/type";

// 父组件传递的控制弹窗显示的 props
interface Props {
  dialogVisible: boolean;
  commentValue: CommentFormType | null;
}

// 表单数据
const commentForm = ref<CommentFormType>({
  score: 0,
  content: "",
});

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:dialogVisible", value: boolean): void;
  (e: "submit", formData: { score: number; content: string }): void;
}>();

const textArr = ["很差", "较差", "一般", "良好", "优秀"];

onMounted(() => {
  if (props.commentValue) {
    commentForm.value = props.commentValue;
  }
});

// 父组件传来的已经评论标志
const hasCommented = computed(() => !!props.commentValue);

// 关闭弹窗
const handleClose = () => {
  emit("update:dialogVisible", false);
};

// 提交按钮是否禁用
const isDisabledSubmit = computed(() => {
  return !(commentForm.value.score && commentForm.value.content);
});

// 提交表单
const submitForm = async () => {
  if(hasCommented.value){
    ElMessage.warning("你已经评论过，无法再次提交");
    return;
  }
  emit("submit", { ...props.commentValue, ...commentForm.value });
};
</script>

<style scoped lang="scss">
.no-rem-score-dialog {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .already-commented {
    width: 100%;
    color: #f56c6c;
    font-size: 14px;
    text-align: center;
    margin-bottom: 10px;
  }

  .scoreText {
    text-align: center;
    color: #edbc48;
    font-size: 14px;
    & > span {
      font-size: 24px;
    }
  }

  .no-scrollbar-textarea {
    :deep(.el-textarea) {
      overflow-y: hidden; 
      resize: none; 
    }
  }

  .comment-form {
    width: 100%;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
  }
}
</style>

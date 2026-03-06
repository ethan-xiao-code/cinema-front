<template>
  <el-upload class="avatar-uploader" action="" :show-file-list="false" :before-upload="beforeAvatarUpload"
    v-loading="isUploading">
    <img v-if="modelValue" :style="imageStyle" :src="modelValue" alt="上传预览" class="upload-image" />
    <el-icon v-else :style="imageStyle" class="avatar-uploader-icon">
      <Plus />
    </el-icon>
  </el-upload>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import { upload } from "@/api/common";
import { useRequest } from "@/utils/useRequest";

// ========== Props ==========
interface Props {
  modelValue: string; // 图片src的值
  width?: number; // 图片宽
  height?: number; // 图片高
}

// 默认值
const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  width: 160,
  height: 220,
});

const imageStyle = {
  width: `${props.width / 10}rem`,
  height: `${props.height / 10}rem`,
};

// ========== Emits ==========
const emit = defineEmits<{
  "update:modelValue": [value: string];
  "upload-error": [error: unknown];
}>();

// // ========== 上传状态 ==========
// const isUploading = ref(false);

const { loading: isUploading, runFn: handleUpload } = useRequest(upload, {
  onSuccess: (res) => {
    emit("update:modelValue", res);
    ElMessage.success("上传成功");
  }
})

// ========== 上传前校验 ==========
const beforeAvatarUpload = (file: File): boolean => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("请上传图片格式文件（JPG、PNG等）");
    return false;
  }

  if (isUploading.value) {
    ElMessage.warning("正在上传中，请稍候...");
    return false;
  }

  const maxSize = 1 * 1024 * 1024; // 1MB
  const formData = new FormData();

  if (file.size > maxSize) {
    // 超过1MB，转 WebP
    convertToWebP(file).then((webpFile) => {
      formData.append("file", webpFile);
      handleUpload(formData);
    });

  } else {
    // 小于阈值，直接上传
    formData.append("file", file);
    handleUpload(formData);
  }

  return false; // 阻止默认上传行为
};

/**
 * 将上传的图片文件转换为 WebP 格式（带压缩）
 * @param {File} file - 原始图片文件（支持 jpg/png 等常见格式）
 * @returns {Promise<File>} 转换后的 WebP 格式 File 对象
 * @throws {string} 转换过程中出现的错误信息（如 Canvas 上下文获取失败、Blob 生成失败等）
 */
const convertToWebP = (file: File): Promise<File> => {
  // 返回 Promise 封装异步转换过程，成功 resolve 转换后的文件，失败 reject 错误信息
  return new Promise((resolve, reject) => {
    // 创建 Image 对象用于加载原始图片
    const img = new Image();
    // 创建 FileReader 对象用于读取文件内容为 DataURL
    const reader = new FileReader();

    // FileReader 读取文件成功的回调
    reader.onload = (e) => {
      // 将读取到的 DataURL 赋值给 Image 对象的 src，触发图片加载
      img.src = e.target?.result as string;
    };

    // 图片加载完成后的处理逻辑（核心转换步骤）
    img.onload = () => {
      // 创建 Canvas 元素，用于绘制图片并转换格式
      const canvas = document.createElement("canvas");
      // 设置 Canvas 宽高与原始图片一致，保证尺寸不变
      canvas.width = img.width;
      canvas.height = img.height;
      // 获取 Canvas 2D 绘图上下文（转换图片的核心对象）
      const ctx = canvas.getContext("2d");
      // 校验上下文是否获取成功，失败则终止并返回错误
      if (!ctx) return reject("Canvas 2D Context not available");

      // 将原始图片绘制到 Canvas 画布上（0,0 为起始坐标，宽高与画布一致）
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // 将 Canvas 内容转换为 WebP 格式的 Blob 对象
      canvas.toBlob(
        (blob) => {
          // 校验 Blob 是否生成成功，失败则终止并返回错误
          if (!blob) return reject("转换失败：未生成有效 Blob 对象");
          // 将 Blob 转换为 File 对象，并重命名文件后缀为 .webp
          const webpFile = new File(
            [blob], // Blob 数据作为文件内容
            file.name.replace(/\.\w+$/, ".webp"), // 替换原始文件名后缀为 .webp
            { type: "image/webp" } // 指定文件 MIME 类型为 WebP
          );
          // 转换成功，返回新的 WebP 文件对象
          resolve(webpFile);
        },
        "image/webp", // 目标转换格式
        1 // 压缩质量（0-1，1 为无损，0.8 兼顾质量和体积）
      );
    };

    // FileReader 读取文件失败的回调（如文件损坏、权限问题）
    reader.onerror = () => reject(`文件读取失败：${reader.error?.message || '未知错误'}`);
    // 开始读取文件为 DataURL 格式（触发 onload 回调）
    reader.readAsDataURL(file);
  });
};


</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

/* 上传图标容器基础样式 */
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

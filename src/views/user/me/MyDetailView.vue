<template>
  <div id="set">
    <div class="setting-container">
      <h2 class="page-title">基本设置</h2>
      
      <el-form
        :model="userForm"
        :rules="rules"
        ref="userFormRef"
        label-width="100px"
        class="user-form"
      >
        <div class="form-main">
          <!-- 基础信息表单区域 -->
          <div class="form-left">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" class="form-input"></el-input>
            </el-form-item>

            <el-form-item label="真实姓名" prop="name">
              <el-input v-model="userForm.name" class="form-input"></el-input>
            </el-form-item>

            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="userForm.sex" class="radio-group">
                <el-radio :label="1" class="radio-item">男</el-radio>
                <el-radio :label="0" class="radio-item">女</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="userForm.phone" class="form-input"></el-input>
            </el-form-item>

            <el-form-item label="余额" class="info-item">
              <span class="info-value">{{ userForm.balance }} 元</span>
            </el-form-item>

            <el-form-item label="优惠" class="info-item">
              <span v-if="userForm.discount !== 1" class="info-value discount-value">
                {{ userForm.discount * 10 }}折
              </span>
              <span v-else class="info-value no-discount">暂无优惠</span>
            </el-form-item>

            <!-- 操作按钮 -->
            <el-form-item class="form-actions">
              <el-button type="primary" @click="submitForm()" class="btn-primary">
                更新基本信息
              </el-button>
              <el-button type="warning" @click="passwordDialog()" class="btn-warning">
                修改密码
              </el-button>
            </el-form-item>
          </div>

          <!-- 头像上传区域 -->
          <div class="form-right">
            <el-form-item label="头像" prop="avatar">
              <upload-image
                show-type="user"
                v-model="userForm.avatar"
                class="avatar-upload"
              ></upload-image>
            </el-form-item>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog
      title="修改密码"
      v-model="dialogPasswordVisible"
      width="500px"
      @close="resetPasswordForm"
      class="password-dialog"
    >
      <el-form
        :model="pwdForm"
        :rules="pwdRules"
        ref="pwdFormRef"
        class="password-form"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="pwdForm.oldPassword"
            placeholder="请输入原密码"
            autocomplete="off"
            class="pwd-input"
          ></el-input>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="pwdForm.newPassword"
            autocomplete="off"
            placeholder="请输入新密码"
            class="pwd-input"
          ></el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogPasswordVisible = false" class="btn-cancel">取 消</el-button>
          <el-button type="primary" @click="updateEmployeePassword()" class="btn-confirm">
            修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import UploadImage from "@/components/UploadImage.vue";
import { useUserStore } from '@/stores'
import { updateUserApi } from "@/api/user";
import { updatePassword } from "@/api/common";

// ========== 类型定义 ==========
interface UserForm {
  username: string;
  avatar: string;
  name: string;
  sex: number | string;
  phone: string;
  balance: string | number;
  discount: number;
}

interface PwdForm {
  oldPassword: string;
  newPassword: string;
  roleId?: number;
}

// ========== 响应式变量 ==========
// 获取用户仓库
const userStore = useUserStore()

// 表单引用
const userFormRef = ref<InstanceType<typeof ElForm>>()
const pwdFormRef = ref<InstanceType<typeof ElForm>>()

// 用户表单数据
const userForm = ref<UserForm>({
  username: "",
  avatar: "",
  name: "",
  sex: "",
  phone: "",
  balance: "",
  discount: 1,
})

// 密码表单数据
const pwdForm = ref<PwdForm>({
  oldPassword: "",
  newPassword: "",
})

// 弹窗控制
const dialogPasswordVisible = ref(false)

// ========== 表单校验规则 ==========
const rules = ref({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 4, max: 8, message: "长度在 4 到 8 个字符", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入电话号码", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号码格式不正确", trigger: "blur" },
  ],
})

const pwdRules = ref({
  oldPassword: [
    { required: true, message: "请输入原密码", trigger: "blur" },
    { min: 3, max: 10, message: "原密码的位数在3到10之间", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 3, max: 10, message: "新密码的位数在3到10之间", trigger: "blur" },
  ],
})

// ========== 生命周期 ==========
onMounted(() => {
  // 初始化用户信息
  const userId = userStore.userId
  if (userId && userStore.userInfo) {
    userForm.value = { ...userStore.userInfo }
  }
})

// ========== 方法定义 ==========
/** 提交用户信息修改 */
const submitForm = async () => {
  if (!userFormRef.value) return
  
  try {
    const valid = await userFormRef.value.validate()
    if (valid) {
      const id = userStore.userId
      await updateUserApi(id, userForm.value)
      ElMessage.success("修改成功")
      // 刷新用户信息
      window.location.reload()
    }
  } catch (error) {
    ElMessage.error("表单验证失败，请检查输入内容")
    console.error(error)
  }
}

/** 打开修改密码弹窗 */
const passwordDialog = () => {
  dialogPasswordVisible.value = true
}

/** 修改密码 */
const updateEmployeePassword = async () => {
  if (!pwdFormRef.value) return
  
  try {
    const valid = await pwdFormRef.value.validate()
    if (valid) {
      pwdForm.value.roleId = userStore.roleId
      await updatePassword(pwdForm.value)
      ElMessage.success("密码修改成功")
      dialogPasswordVisible.value = false
    }
  } catch (error) {
    ElMessage.error("表单验证失败，请检查输入内容")
    console.error(error)
  }
}

/** 重置密码表单 */
const resetPasswordForm = () => {
  if (pwdFormRef.value) {
    pwdFormRef.value.resetFields()
  }
}
</script>

<style lang="scss" scoped>
#set {
  background-color: #f5f7fa;
  padding: 30px 50px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;

  .setting-container {
    max-width: 1000px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  }

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #212529;
    margin-bottom: 30px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e9ecef;
  }

  .user-form {
    width: 100%;

    .form-main {
      display: flex;
      align-items: flex-start;
      gap: 80px;
    }

    .form-left {
      flex: 1;
      width: 100%;

      .form-input {
        width: 400px;
        height: 40px;
        border-radius: 6px;
      }

      .radio-group {
        display: flex;
        gap: 20px;

        .radio-item {
          font-size: 14px;
          color: #495057;
        }
      }

      .info-item {
        margin-bottom: 15px;

        .info-value {
          font-size: 16px;
          color: #495057;

          &.discount-value {
            color: #e67700;
            font-size: 18px;
            font-weight: 500;
          }

          &.no-discount {
            color: #868e96;
          }
        }
      }

      .form-actions {
        margin-top: 30px;

        .btn-primary {
          padding: 10px 24px;
          font-size: 14px;
          border-radius: 6px;
          margin-right: 15px;
        }

        .btn-warning {
          padding: 10px 24px;
          font-size: 14px;
          border-radius: 6px;
        }
      }
    }

    .form-right {
      flex-shrink: 0;
      margin-top: 5px;

      .avatar-upload {
        width: 180px;

        :deep(.avatar-uploader) {
          .el-upload {
            border: 1px dashed #dee2e6;
            border-radius: 8px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            width: 180px;
            height: 180px;
            transition: all 0.2s ease;

            &:hover {
              border-color: #409eff;
            }
          }

          .avatar-uploader-icon {
            font-size: 32px;
            color: #8c939d;
            width: 180px;
            height: 180px;
            line-height: 180px;
            text-align: center;
          }

          .avatar {
            width: 180px;
            height: 180px;
            display: block;
            object-fit: cover;
            border-radius: 8px;
          }
        }
      }
    }
  }

  // 密码弹窗样式
  .password-dialog {
    :deep(.el-dialog__header) {
      border-bottom: 1px solid #e9ecef;
      padding-bottom: 10px;

      .el-dialog__title {
        font-size: 18px;
        font-weight: 600;
        color: #212529;
      }
    }

    :deep(.el-dialog__body) {
      padding: 20px 20px 10px;
    }

    .password-form {
      .pwd-input {
        width: 350px;
        height: 40px;
        border-radius: 6px;
      }
    }

    .dialog-footer {
      text-align: right;
      padding: 15px 20px;
      border-top: 1px solid #e9ecef;
      margin: 0 -20px -15px;

      .btn-cancel {
        margin-right: 10px;
        padding: 8px 16px;
        border-radius: 6px;
      }

      .btn-confirm {
        padding: 8px 16px;
        border-radius: 6px;
      }
    }
  }
}

// 重置Element默认样式
:deep(.el-form-item) {
  margin-bottom: 20px;

  .el-form-item__label {
    font-size: 14px;
    color: #495057;
    font-weight: 500;
  }

  .el-form-item__error {
    font-size: 12px;
  }
}

:deep(.el-radio) {
  font-size: 14px;
}
</style>
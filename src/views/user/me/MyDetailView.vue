<template>
  <div id="set">
    <div class="setting-container">
      <h2 class="page-title">我的信息</h2>

      <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="120px" class="user-form">
        <div class="form-main">
          <!-- 左侧 -->
          <div class="form-left">

            <!-- 可编辑信息 -->
            <div class="form-section">
              <!-- <h3 class="section-title">个人信息</h3> -->

              <el-form-item label="用户名" prop="username">
                <el-input v-model="userForm.username" />
              </el-form-item>

              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="userForm.phone" />
              </el-form-item>
            </div>

            <!-- 只读信息 -->
            <div class="form-section readonly">
              <h3 class="section-title">账号信息</h3>

              <el-form-item label="用户角色">
                <span class="info-value">
                  {{ getLabelByValue(userRoleOptions, userForm.roleId) }}
                </span>
              </el-form-item>

              <el-form-item label="账号状态" >
                <span class="info-value">
                  {{ getLabelByValue(accountStatusOptions, userForm.status) }}
                </span>
              </el-form-item>

              <el-form-item label="账号创建时间" >
                <span class="info-value">{{ userForm.createTime }}</span>
              </el-form-item>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <el-button type="primary" @click="submitForm">
                更新基本信息
              </el-button>
              <el-button type="warning" @click="passwordDialog">
                修改密码
              </el-button>
            </div>
          </div>

          <!-- 右侧头像 -->
          <div class="form-right">
            <div class="avatar-card">
              <div class="avatar-title">头像</div>
              <upload-image :width="180" :height="180" v-model="userForm.avatar" />
              <p class="avatar-tip">支持 JPG / PNG，建议 1:1</p>
            </div>
          </div>
        </div>
      </el-form>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog title="修改密码" v-model="dialogPasswordVisible" width="500px" @close="resetPasswordForm"
      class="password-dialog">
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" class="password-form">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogPasswordVisible = false">取消</el-button>
          <el-button type="primary" @click="updateEmployeePassword">
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
import { accountStatusOptions, getLabelByValue, userRoleOptions } from '@/utils/constant';
import { UserType } from '@/api/user/type';

// ========== 类型定义 ==========

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
const userForm = ref<UserType>({
  username: "",
  phone: "",
  avatar: ""
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

  const valid = await userFormRef.value.validate()
  if (valid) {
    const id = userStore.userId
    await updateUserApi({
      ...userForm.value,
      id
    })
    ElMessage.success("修改成功")
    // 刷新用户信息
    window.location.reload()
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

<style scoped lang="scss">
#set {
  font-size: 14px;

  .setting-container {
    // max-width: 1000px;
    // margin: auto;
    // background: #fff;
    // border-radius: 14px;
    // padding: 40px;
    // box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
  }

  .page-title {
    font-size: 22px;
    font-weight: 600;
    padding-bottom: 24px;
  }

  .form-main {
    display: flex;
    gap: 60px;
  }

  .form-left {
    flex: 1;
  }

  .form-section {
    margin-bottom: 30px;

    .section-title {
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #333;
    
    }
  }

  .readonly {
    background: #f8fafc;
    padding: 20px;
    border-radius: 10px;
    border: 1px dashed #e5e7eb;
  }

  .form-actions {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
  }

  .form-right {
    
    .avatar-card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      border: 1px solid #e9ecef;

      .avatar-title {
        font-weight: 600;
        margin-bottom: 16px;
      }

      .avatar-tip {
        margin-top: 10px;
        font-size: 12px;
        color: #999;
      }
    }
  }


}
</style>

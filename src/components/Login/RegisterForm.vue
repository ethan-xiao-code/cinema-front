<template>
  <el-form label-width="auto" :model="registerForm" :rules="rules" ref="formRef" class="registerForm">
    <el-form-item label="账号" prop="username">
      <el-input type="text" v-model.trim="registerForm.username" placeholder="请输入用户名"></el-input>
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input type="password" v-model.trim="registerForm.password" placeholder="请输入密码" show-password></el-input>
    </el-form-item>
    <el-form-item label="确认密码" prop="checkPass">
      <el-input type="password" v-model.trim="registerForm.checkPass" placeholder="请再次输入密码" show-password></el-input>
    </el-form-item>
    <el-form-item label="电话号码" prop="phone">
      <el-input v-model.trim="registerForm.phone" placeholder="请输入手机号"></el-input>
    </el-form-item>
  </el-form>
  <div class="button-group">
    <el-button :loading="loading" type="primary" @click="handleRegister">注册</el-button>
    <el-button @click="emit('onCancel')">取消</el-button>
  </div>

</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { registerApi } from "@/api/user";
import { useRequest } from "@/utils/useRequest";
import BaseLoading from "@/components/BaseLoading.vue";

const router = useRouter();
const formRef = ref();
const emit = defineEmits(["onSuccess", "onCancel"])

// 响应式数据
const registerForm = reactive({
  password: "",
  checkPass: "",
  username: "",
  phone: "",
});

// 验证规则
const validatePass = (_rule: any, value: string, callback: (val?: any) => void) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else {
    if (registerForm.checkPass !== "") {
      formRef.value.validateField("checkPass");
    }
    callback();
  }
};

const validatePass2 = (_rule: any, value: string, callback: (val?: any) => void) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== registerForm.password) {
    callback(new Error("两次输入密码不一致!"));
  } else {
    callback();
  }
};

const rules = reactive({
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { validator: validatePass, trigger: "blur" }
  ],
  checkPass: [
    { required: true, message: "请输入确认密码", trigger: "blur" },
    { validator: validatePass2, trigger: "blur" }
  ],
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 4, max: 8, message: "长度在 4 到 8 个字符", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入电话号码", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "手机号码格式不正确", trigger: "blur" },
  ],
});

const handleRegister = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;
  submitRegister({ ...registerForm })
};

const { runFn: submitRegister, loading } = useRequest(registerApi, {
  onSuccess: () => {
    formRef.value.resetFields();
    ElMessage.success("注册成功");
  },
})
</script>

<style scoped lang="scss">
.registerForm {
  width: 100%;

}

.button-group {
  display: flex;
  justify-content: center;
}
</style>

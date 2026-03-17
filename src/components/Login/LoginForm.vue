<template>
  <el-form :model="userForm" :rules="rules" ref="formRef" label-width="auto" class="loginForm">
    <el-form-item label="账号" prop="username">
      <el-input type="text" v-model.trim="userForm.username" placeholder="请输入用户名"></el-input>
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input type="password" v-model.trim="userForm.password" show-password placeholder="请输入密码"></el-input>
    </el-form-item>

    <el-form-item label="身份">
      <el-radio-group v-model="userForm.roleId">
        <el-radio :label="0">用户</el-radio>
        <el-radio :label="1">管理员</el-radio>
      </el-radio-group>
    </el-form-item>
  </el-form>
  <div class="button-group">
    <el-button :loading="loading" type="primary" class="login-btn" @click="handleLogin">
      登录
    </el-button>
    <el-button @click="emit('onCancel')">取消</el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores";
import { ElMessage, type FormRules } from "element-plus";
import { useRequest } from "@/utils/useRequest";

const router = useRouter();
const route = useRoute();
const store = useUserStore();
const emit = defineEmits(["onSuccess", "onCancel"])
const formRef = ref();

// 表单数据
const userForm = reactive({
  username: "xzzz",
  password: "123",
  roleId: 0,
});

// 表单校验规则
const rules: FormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 4, max: 8, message: "长度在 4 到 8 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  const valid = await formRef.value.validate();
  if (!valid) return;
  onLogin({ ...userForm })
  // await store.loginAction({ ...userForm });
  // ElMessage.success("登录成功");
  // emit("onSuccess")
  // const redirect = route.query.redirect as string;
  // router.replace(redirect || "/user/home");
};

const { runFn: onLogin, loading } = useRequest(store.loginAction, {
  onSuccess: () => {
    ElMessage.success("登录成功");
    emit("onSuccess")
  }
})
</script>

<style lang="scss" scoped>
.loginForm {
  width: 100%;

}

.button-group {
  display: flex;
  justify-content: center;
}
</style>

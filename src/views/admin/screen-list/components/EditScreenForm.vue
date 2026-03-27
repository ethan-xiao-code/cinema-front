<template>
  <el-dialog width="800px" :title="title" :model-value="showEditDialog" @close="handleClose" modal :close-on-click-modal="false">
    <el-form label-width="120px" :model="screenForm" :rules="rules" ref="screenFormRef">

      <el-form-item label="名称" prop="name" class="w80">
        <el-input v-model="screenForm.name" autocomplete="off" placeholder="请输入名称"></el-input>
      </el-form-item>
      <el-form-item label="座位数" prop="seatCount" class="w80">
        <el-input v-model.number="screenForm.seatCount" autocomplete="off" placeholder="请填写座位数"></el-input>
      </el-form-item>
      <el-form-item label="类型" prop="screeningType" class="w80">
        <el-select v-model="screenForm.screeningType" placeholder="请选择放映类型">
          <el-option v-for="item in screenTypeOptions" :label="item.label" :value="item.value"
            :key="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="简介" prop="description" class="w80">
        <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="screenForm.description"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">{{
          actionType === "add" ? "添 加" : "修 改"
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { ElMessage, ElForm } from "element-plus";
import { FormInstance } from "element-plus";
import { addScreenApi, updateScreenApi } from "@/api/screen";
import { screenTypeOptions } from "@/utils/constant";

export interface ScreenFormType {
  id?: number;
  name: string;
  seatCount: string;
  screeningType: string;
  description: string;
}

export type ActionType = "add" | "update";

interface Props {
  showEditDialog: boolean;
  formData?: ScreenFormType;
  actionType: ActionType;
  title: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["update:showEditDialog", "success"]);

const screenFormRef = ref<FormInstance>();

const screenForm = reactive<ScreenFormType>({} as any);

onMounted(() => {
  if (props.formData) {
    Object.assign(screenForm, props.formData);
  }
});

// 自定义验证规则
const validateValue = (rule: any, value: any, callback: any) => {
  if (value < 20) {
    callback(new Error("座位数不能低于20"));
  } else if (value > 200) {
    callback(new Error("座位数不能高于200"));
  } else {
    callback();
  }
};

// 表单规则
const rules = {
  name: [{ required: true, message: "请填写名称" }],
  seatCount: [
    { required: true, message: "请填写座位数" },
    { type: "number", message: "座位数必须为整数" },
    { pattern: /^[0-9]*$/, message: "只能输入正整数" },
    { validator: validateValue },
  ],
  screeningType: [{ required: true, message: "请选择类型", trigger: "change" }],
};

// 方法
const handleClose = () => {
  emit("update:showEditDialog", false);
};

const handleSubmit = async () => {
  if (!screenFormRef.value) return;

  try {
    await screenFormRef.value.validate();
    handleAddOrUpdate({ ...screenForm }, props.actionType);
  } catch (error) {
    console.error("表单验证失败:", error);
  }
};

const handleAddOrUpdate = async (
  formData: ScreenFormType,
  type: ActionType
) => {
  if (type === "add") {
    await addScreenApi(formData);
    ElMessage.success("添加放映厅成功");
  } else {
    await updateScreenApi(formData);
    ElMessage.success("修改放映厅成功");
  }
  emit("success");
  handleClose();
};
</script>

<style scoped>
.w80 {
  width: 80%;
}
</style>

<template>
  <div id="addSchedule">
    <!-- 新增或修改排片弹框 -->
    <el-dialog
      :title="actionType === 'add' ? '新增排片' : '编辑排片'"
      :model-value="modelValue"
      @close="handleCancel"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-form
        :model="scheduleForm"
        :rules="rules"
        ref="scheduleFormRef"
        label-width="120px"
      >
       
        <el-form-item label="放映厅" prop="screenRoomId" class="w80">
          <el-select
            v-model="scheduleForm.screenRoomId"
            placeholder="请选择放映厅"
            filterable
            clearable
          >
            <el-option
              v-for="item in screenRoomOptions"
              :key="item"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="影片" prop="filmId" class="w80">
          <el-select
            v-model="scheduleForm.filmId"
            placeholder="请选择影片"
            filterable
            clearable
            @change="handleFilmChange"
          >
            <el-option
              v-for="item in filmOptions"
              :key="item"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="语言" prop="language" class="w80">
          <el-select
            v-model="scheduleForm.language"
            placeholder="请选择语言类型"
          >
            <el-option
              v-for="name in languageList"
              :key="name"
              :label="name"
              :value="name"
            />
          </el-select>
        </el-form-item>

        <el-form-item class="w80" label="价格" prop="price">
          <el-input
            v-model="scheduleForm.price"
            @input="handlePrice"
            type="number"
            placeholder="请输入影片售卖价格(单位：元)"
          ></el-input>
        </el-form-item>

        <el-form-item label="开始日期" prop="startTime" class="w80">
          <el-date-picker
            v-model="scheduleForm.startTime"
            type="datetime"
            placeholder="选择开始日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="handleAddSchedule">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  watch,
  nextTick,
  onMounted,
} from "vue";
import { ElMessage, FormInstance } from "element-plus";
import { languageList } from "@/utils/constant";
import { ScheduleActionType } from "../index.vue";
import { ScheduleFormType, type OptionsType } from "@/api/schedule/type";
import { FilmResultType } from "@/api/film/type";
import dayjs from "dayjs";
import { addScheduleApi, updateScheduleApi } from "@/api/schedule";

interface Props {
  modelValue: boolean;
  actionType?: ScheduleActionType;
  schedule?: ScheduleFormType | null;
  filmOptions: OptionsType[];
  screenRoomOptions: OptionsType[];
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  actionType: "add",
  schedule: null,
});

// Emits 定义
const emit = defineEmits(["handleSuccess", "update:modelValue"]);

const scheduleFormRef = ref<FormInstance>();
const filmItem = ref<FilmResultType | null>(null);
const scheduleForm = reactive<ScheduleFormType>({} as any);
const validateDateTime = (rule: any, value: any, callback: any) => {
  console.log(value,
  filmItem.value,
    'value'
  )
  const curTimestamp = new Date(value).getTime();
  const releaseDateTimestamp = new Date(filmItem.value!.releaseDate).getTime();
  console.log(curTimestamp, releaseDateTimestamp, "releaseDateTimestamp");
  if (releaseDateTimestamp >= curTimestamp) {
    callback(new Error("影片开始时间不能早于上映时间"));
    return;
  }

  callback();
};
const rules = {
  screenRoomId: [
    { required: true, message: "请选择放映厅", trigger: "change" },
  ],
  filmId: [{ required: true, message: "请选择影片", trigger: "change" }],
  language: [{ required: true, message: "请选择语言", trigger: "change" }],
  price: [
    { required: true, message: "请输入价格" },
    {
      validator: (rule: any, value: any, callback: any) => {
        // 验证数字格式：正整数或1位小数
        if (!/^\d+(\.\d{0,1})?$/.test(value)) {
          callback(new Error("请输入正整数或保留1位小数"));
          return;
        }

        callback();
      },
    },
  ],
  startTime: [
    { required: true, message: "请选择时间" },
    { validator: validateDateTime },
  ],
};

onMounted(() => {
  initEditData();
});
const initEditData = () => {
  console.log(props.schedule, "props.schedule");
  Object.assign(scheduleForm, props.schedule);
  const {filmId } = { ...props.schedule };
  filmId && handleFilmChange(filmId);
};
const handleFilmChange = (id: number) => {
  console.log(id, "film id");
  filmItem.value = props.filmOptions.find(
    (item: any) => item.id === id
  ) as any;
  console.log(filmItem.value, "filmItem.value");
};
const handlePrice = (val: string) => {
  if (!val) return;
  scheduleForm.price = Number(val);
};


const handleAddSchedule = async (): Promise<void> => {
  if (!scheduleFormRef.value) return;

  await scheduleFormRef.value.validate();
  const { startTime } = scheduleForm;
  const { duration } = filmItem.value!;
  const startDate = dayjs(startTime);
  console.log(duration, "duration");
  const formatStr = "YYYY-MM-DD HH:mm:ss"
  const newValues = {
    ...scheduleForm,
    screeningDate: startDate.format("YYYY-MM-DD"),
    startTime: startDate.format(formatStr),
    endTime: startDate.add(duration, "minute").format(formatStr),
  };
  if (props.actionType === "add") {
    await addScheduleApi(newValues);
    ElMessage.success("添加排片成功");
  } else {
    await updateScheduleApi(newValues);
    ElMessage.success("修改排片成功");
  }
  emit("handleSuccess");
  handleCancel();
};

const handleCancel = (): void => {
  emit("update:modelValue", false);
};

// 暴露方法给父组件
defineExpose({});
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>

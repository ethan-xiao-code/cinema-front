<template>
  <el-dialog
    width="800px"
    :title="handelType === 'add' ? '新增影片' : '修改影片'"
    :model-value="visible"
    @close="handleClose"
  >
    <el-form
      :model="filmForm"
      :rules="rules"
      ref="filmFormRef"
      label-width="120px"
      class="form"
    >
      <el-form-item class="w80" label="影片标题" prop="title">
        <el-input
          v-model="filmForm.title"
          placeholder="请填写影片标题"
        ></el-input>
      </el-form-item>

      <el-form-item class="w80" label="导演名" prop="director">
        <el-input
          v-model="filmForm.director"
          placeholder="请填写导演名(多个用逗号分隔)"
        ></el-input>
      </el-form-item>

      <el-form-item class="w80" label="主演名" prop="actors">
        <el-input
          v-model="filmForm.actors"
          placeholder="请填写主演名(多个用逗号分隔)"
        ></el-input>
      </el-form-item>

      <el-form-item class="w80" label="上映日期" prop="releaseDate">
        <!-- <el-date-picker v-model="filmForm.releaseDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" /> -->
        <el-date-picker
          v-model="filmForm.dateList"
          type="daterange"
          range-separator="-"
          start-placeholder="上映日期"
          end-placeholder="下线日期"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
        />
      </el-form-item>

      <el-form-item class="w80" label="影片类型" prop="types">
        <el-select multiple v-model="filmForm.types" placeholder="请选择类型">
          <el-option
            v-for="typeName in filmTypeList"
            :key="typeName"
            :label="typeName"
            :value="typeName"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="w80" label="上映地区" prop="regions">
        <el-select multiple v-model="filmForm.regions" placeholder="请选择地区">
          <el-option
            v-for="regionName in filmRegionList"
            :key="regionName"
            :label="regionName"
            :value="regionName"
          />
        </el-select>
      </el-form-item>

      <el-form-item class="w80" label="时长" prop="duration">
        <el-input
          type="number"
          v-model.number="filmForm.duration"
          placeholder="请填写影片时长(单位：分钟)"
        />
      </el-form-item>

      <el-form-item label="图片" prop="poster">
        <UploadImage v-model="filmForm.poster" />
      </el-form-item>

      <el-form-item class="w80" label="简介" prop="plot">
        <el-input
          type="textarea"
          v-model="filmForm.plot"
          placeholder="请输入剧情简介"
          :autosize="{ minRows: 2, maxRows: 30 }"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm">
        {{ handelType === "add" ? "添加" : "修改" }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getFilmById, addFilm, updateFilm } from "@/api/film";
import UploadImage from "@/components/UploadImage.vue";
import { filmTypeList, filmRegionList } from "@/utils/constant";
import { FilmFormType } from "@/api/film/type";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  filmItem: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["update:visible", "handleSuccess"]);

// 响应式数据
const filmFormRef = ref();
const handelType = ref("add");
const filmForm = reactive<FilmFormType>({
  id: "",
  title: "",
  poster: "",
  director: "", // 导演姓名
  actors: "", // 主演姓名
  releaseDate: "", // 上映日期
  endDate: "", // 下线日期
  types: "", // 影片类型
  regions: "", // 地区
  duration: "", // 时长
  plot: "", // 简介
  dateList: [],
});

const validateDate = (rule, value, callback) => {
  if (new Date(value) < new Date()) {
    callback(new Error("上映日期不能早于当前日期"));
  } else {
    callback();
  }
};

const rules = reactive({
  title: [{ required: true, message: "请填写影片标题" }],
  poster: [
    {
      required: true,
      message: "请上传图片",
      trigger: "blur",
    },
  ],
  director: [{ required: true, message: "请填写导演姓名" }],
  actors: [{ required: true, message: "请填写主演姓名" }],
  dateList: [
    { required: true, message: "请选择上映日期和下线日期", trigger: "change" },
  ],
  types: [{ required: true, message: "请选择影片类型" }],
  regions: [{ required: true, message: "请选择上映地区" }],
  duration: [
    { required: true, message: "请填写影片时长" },
    { pattern: /^[0-9]*$/, message: "只能输入正整数" },
  ],
  plot: [{ required: true, message: "请填写剧情简介" }],
});
const resetForm = () => {
  if (filmFormRef.value) {
    filmFormRef.value.resetFields();
  }
};

// 方法
const getFilmByIdData = async (id: number) => {
  try {
    const data = (await getFilmById(id)) || {};
    const { releaseDate, endDate, types, regions } = data;
    Object.assign(filmForm, {
      ...data,
      dateList: [releaseDate, endDate],
      types: types.split(","),
      regions: regions.split(","),
    });
  } catch (error) {
    console.error("获取影片详情失败:", error);
  }
};

// 监听 props 变化
watch(
  () => props.filmItem,
  (newVal: FilmFormType) => {
    if (newVal && newVal.id) {
      handelType.value = "update";
      getFilmByIdData(newVal.id);
    } else {
      handelType.value = "add";
      resetForm();
    }
  },
  { immediate: true }
);

const submitForm = () => {
  filmFormRef.value.validate(async (valid: any) => {
    if (valid) {
      const { dateList = [], types = [], regions = [] } = filmForm;
      const [releaseDate, endDate] = dateList;
      const values = {
        ...filmForm,
        releaseDate,
        endDate,
        types: types.join(","),
        regions: regions.join(","),
      } as FilmFormType;
      if (handelType.value === "add") {
        await addFilmData(values);
      } else {
        await updateFilmData(values);
      }
      handleClose();
      emit("handleSuccess");
    }
  });
};

const addFilmData = async (values: FilmFormType) => {
  await addFilm({ ...values });
  ElMessage.success("添加影片成功");
};

const updateFilmData = async (values: FilmFormType) => {
  await updateFilm({ ...values });
  ElMessage.success("修改影片成功");
};

const handleClose = () => {
  emit("update:visible", false);
  resetForm();
};
</script>

<style lang="scss" scoped>
.el-textarea__inner {
  /* 去除文本框的滚动条 */
  overflow: hidden;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

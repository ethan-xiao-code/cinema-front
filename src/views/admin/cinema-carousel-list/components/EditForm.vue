<template>
  <!-- 新增/编辑影院弹框 -->
  <el-dialog
    :title="isAdd ? '新增影片轮播图' : '修改影片轮播图'"
    :model-value="showEditDialog"
    @close="handleClose"
    modal
    :close-on-click-modal="false"
  >
    <el-form
      label-width="120px"
      :model="cinemaCarouselForm"
      :rules="rules"
      ref="cinemaCarouselRef"
    >
      <el-form-item label="影片" prop="filmId" class="w80">
        <el-select
          v-model="cinemaCarouselForm.filmId"
          placeholder="请选择影片"
          filterable
          clearable
        >
          <el-option
            v-for="item in filmOptions"
            :key="item"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="轮播图片" prop="imgUrl">
        <UploadImage :width="400" v-model="cinemaCarouselForm.imgUrl" />
      </el-form-item>

      <el-form-item class="w80" label="排序" prop="sort">
        <el-input
          type="number"
          v-model.number="cinemaCarouselForm.sort"
          placeholder="请填写轮播图展示优先级(数字越小越靠前展示)"
        />
      </el-form-item>

      <el-form-item label="备注" prop="description" class="w80">
        <el-input
          type="textarea"
          :rows="2"
          placeholder="请输入内容"
          v-model="cinemaCarouselForm.remark"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleAddOrUpdate">{{
          isAdd ? "添 加" : "修 改"
        }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { provinceOptions } from "@/utils/area";
import { ElMessage } from "element-plus";
import { CinemaCarouselFormType } from "@/api/cinema-carousel/type";
import { addCinemaCarouselApi } from "@/api/cinema-carousel";
import { OptionsType } from "@/api/schedule/type";
import UploadImage from "@/components/UploadImage.vue";
type PropsType = {
  showEditDialog: boolean;
  currentRow: any;
  isAdd: boolean;
  filmOptions: OptionsType[];
};
const props = defineProps<PropsType>();

console.log(provinceOptions, "provinceList");
const emit = defineEmits(["update:showEditDialog", "reloadData"]);
const cinemaCarouselForm = reactive<CinemaCarouselFormType>({
  filmId: undefined,
  imgUrl: "",
  sort: undefined,
});
const cinemaCarouselRef = ref(null);

// 表单规则
const rules = {
  name: [
    { required: true, message: "请输入名称", trigger: "blur" },
    { min: 1, max: 50, message: "名称长度在1-50个字符之间", trigger: "blur" },
  ],
  filmId: [{ required: true, message: "请选择影片", trigger: "change" }],
  imgUrl: [{ required: true, message: "请上传轮播图片" }],
  sort: [
    { required: true, message: "请填写排序值" },
    { pattern: /^[0-9]*$/, message: "只能输入0或正整数" },
  ],
};

const handleClose = () => {
  emit("update:showEditDialog", false);
};

onMounted(() => {
  const id = props.currentRow?.id;
  if(id){
    Object.assign(cinemaCarouselForm,{...props.currentRow})
    console.log(cinemaCarouselForm,'cinemaCarouselForm')
  }
});

const handleAddOrUpdate = async () => {
  if (!cinemaCarouselRef.value) return;

  const success = await cinemaCarouselRef.value.validate();
  if (!success) return;

  await addCinemaCarouselApi({ ...cinemaCarouselForm });

  if (props.isAdd) {
    ElMessage.success("添加轮播图成功");
  } else {
    ElMessage.success("修改轮播图成功");
  }
  emit("reloadData");
  handleClose();
};
</script>

<style lang="scss" scoped></style>

import mitt from 'mitt';

type ShowLoginDialogPayload = {
  redirectPath?: string;  // 登录成功后跳转的路径
  title?: string;         // 弹框标题，可选
};

type Events = {
  showLoginDialog: ShowLoginDialogPayload;
};

export const eventBus = mitt<Events>();
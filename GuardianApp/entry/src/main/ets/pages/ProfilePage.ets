import { Elderly, ActivityStatus, DeviceInfo } from '../model/Types';
import { ElderlyLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';
import router from '@ohos.router';
import { MockData } from '../utils/MockData';

interface ApiResponse {
  success: boolean;
  message?: string;
}

interface UserProfile {
  name: string;
  phone: string;
  isVibrationEnabled: boolean;
  isSmsEnabled: boolean;
}

interface NotificationSetting {
  isVibrationEnabled: boolean;
  isSmsEnabled: boolean;
}

@CustomDialog
struct InputDialog {
  controller: CustomDialogController
  title: string = ''
  placeholder: string = ''
  @State inputValue: string = ''
  onConfirm: (value: string) => void = () => {}

  build() {
    Column() {
      // 标题
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor('#1E293B')
        .width('100%')
        .margin({ bottom: 24 })

      // 输入框（与登录界面保持一致）
      TextInput({ placeholder: this.placeholder, text: this.inputValue })
        .height(56)
        .width('100%')
        .backgroundColor('#F4F6F8')
        .placeholderColor('#A0AAB7')
        .borderRadius(12)
        .padding({ left: 20 })
        .fontSize(16)
        .onChange((value: string) => { this.inputValue = value })
        .margin({ bottom: 28 })

      // 按钮组
      Row() {
        Button('取消')
          .height(48)
          .layoutWeight(1)
          .backgroundColor('#F1F5F9')
          .fontColor('#64748B')
          .fontSize(16)
          .borderRadius(12)
          .onClick(() => this.controller.close())
        Blank().width(12)
        Button('确定')
          .height(48)
          .layoutWeight(1)
          .backgroundColor('#2563EB')
          .fontColor(Color.White)
          .fontSize(16)
          .borderRadius(12)
          .onClick(() => {
            this.onConfirm(this.inputValue)
            this.controller.close()
          })
      }.width('100%')
    }
    .padding(28)
    .backgroundColor(Color.White)
    .borderRadius(20)
    .width('88%')
  }
}

@CustomDialog
struct DualInputDialog {
  controller: CustomDialogController
  title: string = ''
  label1: string = ''
  placeholder1: string = ''
  label2: string = ''
  placeholder2: string = ''
  @State value1: string = ''
  @State value2: string = ''
  onConfirm: (val1: string, val2: string) => void = () => {}

  build() {
    Column() {
      // 标题
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor('#1E293B')
        .width('100%')
        .margin({ bottom: 24 })

      // 第一个输入框
      Text(this.label1)
        .fontSize(14)
        .fontColor('#64748B')
        .width('100%')
        .margin({ bottom: 8 })
      TextInput({ placeholder: this.placeholder1, text: this.value1 })
        .height(56)
        .width('100%')
        .backgroundColor('#F4F6F8')
        .placeholderColor('#A0AAB7')
        .borderRadius(12)
        .padding({ left: 20 })
        .fontSize(16)
        .onChange((value: string) => { this.value1 = value })
        .margin({ bottom: 20 })

      // 第二个输入框
      Text(this.label2)
        .fontSize(14)
        .fontColor('#64748B')
        .width('100%')
        .margin({ bottom: 8 })
      TextInput({ placeholder: this.placeholder2, text: this.value2 })
        .height(56)
        .width('100%')
        .backgroundColor('#F4F6F8')
        .placeholderColor('#A0AAB7')
        .borderRadius(12)
        .padding({ left: 20 })
        .fontSize(16)
        .onChange((value: string) => { this.value2 = value })
        .margin({ bottom: 28 })

      // 按钮组
      Row() {
        Button('取消')
          .height(48)
          .layoutWeight(1)
          .backgroundColor('#F1F5F9')
          .fontColor('#64748B')
          .fontSize(16)
          .borderRadius(12)
          .onClick(() => this.controller.close())
        Blank().width(12)
        Button('确定')
          .height(48)
          .layoutWeight(1)
          .backgroundColor('#2563EB')
          .fontColor(Color.White)
          .fontSize(16)
          .borderRadius(12)
          .onClick(() => {
            this.onConfirm(this.value1, this.value2)
            this.controller.close()
          })
      }.width('100%')
    }
    .padding(28)
    .backgroundColor(Color.White)
    .borderRadius(20)
    .width('88%')
  }
}

@Component
export struct ProfilePage {
  @State userName: string = '';
  @State userPhone: string = '';
  @State elderlyList: ElderlyLocal[] = [];
  @State isLoading: boolean = true;
  @State isVibrationEnabled: boolean = true;
  @State isSmsEnabled: boolean = true;
  @State isEditing: boolean = false;
  @State isManagingElderly: boolean = false;
  @State editName: string = '';
  @State editPhone: string = '';

  private isGuest: boolean = false;

  addElderlyDialog: CustomDialogController = new CustomDialogController({
    builder: InputDialog({
      title: '添加家属',
      placeholder: '请输入长辈手机号',
      onConfirm: (value: string): void => { this.bindElderly(value) }
    }),
    alignment: DialogAlignment.Center
  })

  @State currentEditElderlyId: string = '';
  editRelationDialog: CustomDialogController = new CustomDialogController({
    builder: DualInputDialog({
      title: '修改关系称呼',
      label1: '我的界面显示 (如: 父亲)',
      placeholder1: '请输入您的称呼',
      label2: '长辈界面显示 (如: 儿子)',
      placeholder2: '请输入长辈对您的称呼',
      onConfirm: (v1: string, v2: string): void => { this.updateRelation(this.currentEditElderlyId, v1, v2) }
    }),
    alignment: DialogAlignment.Center
  })

  aboutToAppear() {
    const guest = AppStorage.Get('isGuest') as boolean | undefined;
    this.isGuest = guest === true;
    if (this.isGuest) {
      this.loadMockData();
    } else {
      // 修复5：先 fetch 完成后再赋值 editName/editPhone，放在 fetchProfile 内部
      this.fetchProfile();
      this.fetchElderlyList();
    }
  }

  loadMockData() {
    this.userName = MockData.userProfile.name;
    this.userPhone = MockData.userProfile.phone;
    this.isVibrationEnabled = MockData.userProfile.isVibrationEnabled;
    this.isSmsEnabled = MockData.userProfile.isSmsEnabled;
    this.editName = this.userName;
    this.editPhone = this.userPhone;

    // 通过 relations 表关联长辈信息，构建带称呼的列表
    const result: ElderlyLocal[] = [];
    for (const r of MockData.relations) {
      // 在 elderlyList 中找到匹配的长辈
      let matched: ElderlyLocal | null = null;
      for (const e of MockData.elderlyList) {
        if (e.id === r.elderlyId) {
          matched = new ElderlyLocal(e);
          break;
        }
      }
      if (matched !== null && matched.id !== '') {
        matched.relation = r.guardianAlias;
        result.push(matched);
      }
    }
    this.elderlyList = result;
    this.isLoading = false;
    promptAction.showToast({ message: '已加载模拟用户及家属数据' });
  }

  // 修复1：新增 fetchProfile，从后端加载用户信息和通知设置
  async fetchProfile() {
    try {
      const result = await HttpUtil.get<UserProfile>('/guardian/profile');
      if (result) {
        this.userName = result.name || '';
        this.userPhone = result.phone || '';
        this.isVibrationEnabled = result.isVibrationEnabled ?? true;
        this.isSmsEnabled = result.isSmsEnabled ?? true;
        // 修复5：fetch 完成后才赋值编辑字段
        this.editName = this.userName;
        this.editPhone = this.userPhone;
      }
    } catch (err) {
      console.error('Fetch profile failed:', JSON.stringify(err));
    }
  }

  async fetchElderlyList() {
    try {
      const result = await HttpUtil.get<Object[]>('/guardian/elderly');
      if (Array.isArray(result)) {
        this.elderlyList = result.map((item: Object): ElderlyLocal => new ElderlyLocal(item));
      }
    } catch (err) {
      console.error('Fetch elderly list failed:', JSON.stringify(err));
      this.elderlyList = [];
    } finally {
      this.isLoading = false;
    }
  }

  // 修复2：保存个人资料时调用后端接口
  async handleSaveProfile() {
    if (this.editName.trim() === '' || this.editPhone.trim() === '') {
      promptAction.showToast({ message: '姓名和电话不能为空' });
      return;
    }
    if (this.isGuest) {
      // guest 模式只更新本地
      this.userName = this.editName;
      this.userPhone = this.editPhone;
      this.isEditing = false;
      promptAction.showToast({ message: '个人资料已更新' });
      return;
    }
    try {
      const res = await HttpUtil.put<ApiResponse>('/guardian/profile', {
        name: this.editName,
        phone: this.editPhone
      });
      if (res.success) {
        this.userName = this.editName;
        this.userPhone = this.editPhone;
        this.isEditing = false;
        promptAction.showToast({ message: '个人资料已更新' });
      } else {
        promptAction.showToast({ message: res.message || '保存失败' });
      }
    } catch (err) {
      promptAction.showToast({ message: '请求失败，请重试' });
    }
  }

  // 修复3：通知开关变更时同步后端
  async updateNotificationSetting(key: string, value: boolean) {
    if (this.isGuest) return;
    try {
      // ArkTS 不支持计算属性名，用两字段对象传参，后端按实际变化的字段更新
      const setting: NotificationSetting = {
        isVibrationEnabled: key === 'isVibrationEnabled' ? value : this.isVibrationEnabled,
        isSmsEnabled: key === 'isSmsEnabled' ? value : this.isSmsEnabled
      };
      await HttpUtil.put<ApiResponse>('/guardian/profile/notification', setting as Object);
    } catch (err) {
      console.error('Update notification setting failed:', JSON.stringify(err));
      // 失败时回滚开关
      if (key === 'isVibrationEnabled') {
        this.isVibrationEnabled = !value;
      } else {
        this.isSmsEnabled = !value;
      }
      promptAction.showToast({ message: '设置失败，请重试' });
    }
  }

  async bindElderly(phone: string) {
    if (!phone) return;
    try {
      const res = await HttpUtil.post<ApiResponse>('/guardian/bind', { phone });
      if (res.success) {
        promptAction.showToast({ message: '添加成功' });
        this.fetchElderlyList();
      } else {
        promptAction.showToast({ message: res.message || '添加失败' });
      }
    } catch (err) {
      promptAction.showToast({ message: '请求失败，请检查手机号是否正确' });
    }
  }

  async unbindElderly(elderlyId: string) {
    try {
      const res = await HttpUtil.post<ApiResponse>('/guardian/unbind', { elderlyId });
      if (res.success) {
        promptAction.showToast({ message: '已删除' });
        this.fetchElderlyList();
      } else {
        promptAction.showToast({ message: res.message || '删除失败' });
      }
    } catch (err) {
      promptAction.showToast({ message: '请求失败' });
    }
  }

  async updateRelation(elderlyId: string, guardianAlias: string, elderlyAlias: string) {
    if (!guardianAlias) return;
    try {
      const res = await HttpUtil.post<ApiResponse>('/guardian/update_relation', { elderlyId, guardianAlias, elderlyAlias });
      if (res.success) {
        promptAction.showToast({ message: '修改成功' });
        this.fetchElderlyList();
      } else {
        promptAction.showToast({ message: res.message || '修改失败' });
      }
    } catch (err) {
      promptAction.showToast({ message: '请求失败' });
    }
  }

  handleCall(phone: string) {
    promptAction.showDialog({
      title: '拨打电话',
      message: `确定拨打 ${phone} 吗？`,
      buttons: [
        { text: '取消', color: '#64748B' },
        { text: '拨叫', color: '#2563EB' }
      ]
    });
  }

  // 修复4：退出登录实际执行跳转
  handleLogout() {
    promptAction.showDialog({
      title: '提示',
      message: '确定要退出登录吗？',
      buttons: [
        { text: '取消', color: '#64748B' },
        { text: '退出', color: '#EF4444' }
      ]
    }).then(result => {
      if (result.index === 1) {
        AppStorage.SetOrCreate('isGuest', false);
        router.replaceUrl({ url: 'pages/LoginPage' });
      }
    });
  }

  handleDeleteConfirm(elder: ElderlyLocal) {
    promptAction.showDialog({
      title: '确认删除',
      message: `确定要移除与 ${elder.name} 的绑定关系吗？`,
      buttons: [
        { text: '取消', color: '#64748B' },
        { text: '删除', color: '#EF4444' }
      ]
    }).then(result => {
      if (result.index === 1) {
        this.unbindElderly(elder.id);
      }
    });
  }

  build() {
    Scroll() {
      Column() {
        Row() {
          Text('个人信息')
            .fontSize(24).fontWeight(FontWeight.Bold).fontColor('#1a1a1a')
          Blank()
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 10, bottom: 10 })

        // 1. 个人资料卡片
        if (this.isEditing) {
          Column() {
            Text('编辑个人资料')
              .fontSize(18).fontWeight(FontWeight.Bold).fontColor('#1E293B')
              .margin({ bottom: 16 }).width('100%')
            Text('姓名').fontSize(14).fontColor('#64748B').width('100%').margin({ bottom: 8 })
            TextInput({ text: this.editName, placeholder: '请输入姓名' })
              .width('100%').height(48).backgroundColor('#F8FAFC').borderRadius(8)
              .onChange((value: string) => { this.editName = value })
              .margin({ bottom: 16 })
            Text('电话').fontSize(14).fontColor('#64748B').width('100%').margin({ bottom: 8 })
            TextInput({ text: this.editPhone, placeholder: '请输入电话' })
              .width('100%').height(48).backgroundColor('#F8FAFC').borderRadius(8)
              .type(InputType.PhoneNumber)
              .onChange((value: string) => { this.editPhone = value })
              .margin({ bottom: 24 })
            Row() {
              Button('取消')
                .backgroundColor('#F1F5F9').fontColor('#64748B').width('45%')
                .onClick(() => {
                  this.isEditing = false;
                  this.editName = this.userName;
                  this.editPhone = this.userPhone;
                })
              Blank()
              Button('保存')
                .backgroundColor('#2563EB').fontColor(Color.White).width('45%')
                .onClick(() => { this.handleSaveProfile(); })
            }.width('100%')
          }
          .padding(24).backgroundColor(Color.White).margin({ bottom: 12 })
        } else {
          Row() {
            Stack() {
              Circle({ width: 72, height: 72 }).fill('#EFF6FF')
              Text(this.userName.substring(0, 1))
                .fontSize(28).fontWeight(FontWeight.Bold).fontColor('#2563EB')
            }.margin({ right: 16 })
            Column() {
              Text(this.userName).fontSize(22).fontWeight(FontWeight.Bold).fontColor('#1E293B')
              Text(this.userPhone).fontSize(14).fontColor('#64748B').margin({ top: 4 })
            }.alignItems(HorizontalAlign.Start)
            Blank()
            Text('编辑').fontSize(14).fontColor('#2563EB')
              .onClick(() => {
                this.editName = this.userName;
                this.editPhone = this.userPhone;
                this.isEditing = true;
              })
          }
          .width('100%').padding(24).backgroundColor(Color.White).margin({ bottom: 12 })
        }

        // 2. 我的家属
        Column() {
          this.SectionHeader('我的家属', true)
          if (this.elderlyList.length > 0) {
            ForEach(this.elderlyList, (elder: ElderlyLocal, index: number) => {
              Column() {
                if (index > 0) {
                  Divider().color('#F1F5F9').padding({ left: 16, right: 16 })
                }
                Row() {
                  Column() {
                    Row() {
                      Text(elder.name)
                        .fontSize(18).fontColor('#1E293B').fontWeight(FontWeight.Medium)
                      if (!this.isManagingElderly) {
                        Text(elder.relation || '家属')
                          .fontSize(14).fontColor('#64748B')
                          .backgroundColor('#F1F5F9')
                          .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                          .borderRadius(4).margin({ left: 8 })
                      }
                    }
                  }.alignItems(HorizontalAlign.Start)
                  Blank()
                  if (this.isManagingElderly) {
                    Row({ space: 16 }) {
                      Text('修改').fontColor('#2563EB').fontSize(14)
                        .onClick(() => {
                          this.currentEditElderlyId = elder.id;
                          this.editRelationDialog.open();
                        })
                      Text('删除').fontColor('#EF4444').fontSize(14)
                        .onClick(() => { this.handleDeleteConfirm(elder); })
                    }
                  } else {
                    Text(elder.phone).fontSize(16).fontColor('#2563EB')
                      .onClick(() => this.handleCall(elder.phone))
                  }
                }
                .width('100%').padding(16)
              }
            })
          } else {
            Text('暂无守护长辈')
              .fontSize(16).fontColor('#94A3B8').padding(24)
              .width('100%').textAlign(TextAlign.Center)
          }
          if (this.isManagingElderly) {
            Divider().color('#F1F5F9')
            Row() {
              Text('+ 添加家属')
                .fontSize(16).fontColor('#2563EB').fontWeight(FontWeight.Medium)
            }
            .width('100%').justifyContent(FlexAlign.Center).padding(16)
            .onClick(() => { this.addElderlyDialog.open(); })
          }
        }
        .backgroundColor(Color.White).margin({ bottom: 12, left: 16, right: 16 }).borderRadius(12)

        // 3. 通知策略
        Column() {
          this.SectionHeader('通知策略')
          Row() {
            Column() {
              Text('手机强力震动提醒')
                .fontSize(16).fontColor('#1E293B').fontWeight(FontWeight.Medium)
              Text('检测到异常时，监护人手机产生持续震动')
                .fontSize(12).fontColor('#64748B').margin({ top: 4 })
            }.alignItems(HorizontalAlign.Start).layoutWeight(1)
            Toggle({ type: ToggleType.Switch, isOn: this.isVibrationEnabled })
              .selectedColor('#2563EB')
              .onChange((isOn: boolean) => {
                this.isVibrationEnabled = isOn;
                this.updateNotificationSetting('isVibrationEnabled', isOn);
              })
          }.width('100%').padding(16)

          Divider().color('#F1F5F9').padding({ left: 16 })

          Row() {
            Column() {
              Text('跌倒短信紧急报警')
                .fontSize(16).fontColor('#1E293B').fontWeight(FontWeight.Medium)
              Text('检测到异常跌倒后，自动发送告警短信')
                .fontSize(12).fontColor('#64748B').margin({ top: 4 })
            }.alignItems(HorizontalAlign.Start).layoutWeight(1)
            Toggle({ type: ToggleType.Switch, isOn: this.isSmsEnabled })
              .selectedColor('#2563EB')
              .onChange((isOn: boolean) => {
                this.isSmsEnabled = isOn;
                this.updateNotificationSetting('isSmsEnabled', isOn);
              })
          }.width('100%').padding(16)
        }
        .backgroundColor(Color.White).margin({ bottom: 12, left: 16, right: 16 }).borderRadius(12)

        // 4. 退出登录
        Button('退出登录')
          .width('90%').height(48)
          .backgroundColor('#FEE').fontColor('#EF4444')
          .fontSize(16).fontWeight(FontWeight.Medium)
          .margin({ top: 12, bottom: 40 })
          .onClick(() => { this.handleLogout(); })
      }
      .width('100%')
    }
    .width('100%').height('100%')
    .backgroundColor('#F8FAFC')
    .align(Alignment.Top)
  }

  @Builder SectionHeader(title: string, showManage: boolean = false) {
    Row() {
      Text(title).fontSize(20).fontWeight(600)
      Blank()
      if (showManage) {
        Text(this.isManagingElderly ? '完成' : '管理')
          .fontSize(16).fontColor('#2563EB')
          .onClick(() => { this.isManagingElderly = !this.isManagingElderly; })
      }
    }
    .width('100%').padding({ left: 16, right: 16, top: 16, bottom: 8 })
  }
}

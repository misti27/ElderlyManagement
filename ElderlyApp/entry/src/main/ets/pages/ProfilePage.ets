
import { Guardian, User } from '../model/Types';
import { MockData } from '../utils/MockData';
import promptAction from '@ohos.promptAction';
import router from '@ohos.router';
import { HttpUtil } from '../utils/HttpUtil';

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: Object;
}

@CustomDialog
struct InputDialog {
  controller: CustomDialogController
  title: string = ''
  placeholder: string = ''
  @State value: string = ''
  onConfirm: (value: string) => void = () => {}

  build() {
    Column() {
      Text(this.title).fontSize(20).fontWeight(FontWeight.Bold).margin({ bottom: 16 })
      TextInput({ placeholder: this.placeholder, text: this.value })
        .onChange((value: string) => { this.value = value })
        .margin({ bottom: 24 })
        .height(48)
      Row() {
        Button('取消')
          .onClick(() => this.controller.close())
          .backgroundColor('#F1F5F9')
          .fontColor('#64748B')
          .width('45%')
        Blank()
        Button('确定')
          .onClick(() => {
            this.onConfirm(this.value)
            this.controller.close()
          })
          .backgroundColor('#2563EB')
          .width('45%')
      }.width('100%')
    }
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .width('80%')
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
      Text(this.title).fontSize(20).fontWeight(FontWeight.Bold).margin({ bottom: 16 })
      
      Text(this.label1).fontSize(14).fontColor('#64748B').width('100%').margin({ bottom: 8 })
      TextInput({ placeholder: this.placeholder1, text: this.value1 })
        .onChange((value: string) => { this.value1 = value })
        .margin({ bottom: 16 })
        .height(48)

      Text(this.label2).fontSize(14).fontColor('#64748B').width('100%').margin({ bottom: 8 })
      TextInput({ placeholder: this.placeholder2, text: this.value2 })
        .onChange((value: string) => { this.value2 = value })
        .margin({ bottom: 24 })
        .height(48)

      Row() {
        Button('取消')
          .onClick(() => this.controller.close())
          .backgroundColor('#F1F5F9')
          .fontColor('#64748B')
          .width('45%')
        Blank()
        Button('确定')
          .onClick(() => {
            this.onConfirm(this.value1, this.value2)
            this.controller.close()
          })
          .backgroundColor('#2563EB')
          .width('45%')
      }.width('100%')
    }
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(12)
    .width('90%')
  }
}

@Component
export struct ProfilePage {
  @State currentUser: User = MockData.currentUser;
  @State guardians: Guardian[] = [];
  @State isVibrationEnabled: boolean = true;
  @State isSmsEnabled: boolean = true;
  @State isEditing: boolean = false;
  @State editName: string = '';
  @State editPhone: string = '';
  @State isManagingGuardians: boolean = false;
  @State currentEditGuardianId: string = '';
  @State isLoadingGuardians: boolean = false;
  @State guardiansError: string = '';

  addGuardianDialog: CustomDialogController = new CustomDialogController({
    builder: InputDialog({
      title: '添加监护人',
      placeholder: '请输入监护人手机号',
      onConfirm: (value: string): void => { this.bindGuardian(value) }
    }),
    alignment: DialogAlignment.Center
  })

  editRelationDialog: CustomDialogController = new CustomDialogController({
    builder: DualInputDialog({
      title: '修改关系称呼',
      label1: '我的界面显示 (如: 儿子)',
      placeholder1: '请输入您的称呼',
      label2: '监护人界面显示 (如: 父亲)',
      placeholder2: '请输入监护人对您的称呼',
      onConfirm: (v1: string, v2: string): void => { this.updateRelation(this.currentEditGuardianId, v1, v2) }
    }),
    alignment: DialogAlignment.Center
  })

  aboutToAppear() {
    this.editName = this.currentUser.name;
    this.editPhone = this.currentUser.phone;
    this.fetchGuardians();
  }

  async fetchGuardians() {
    this.isLoadingGuardians = true;
    this.guardiansError = '';
    try {
      console.info('[ProfilePage] Fetching guardians...');
      const res = await HttpUtil.get<Guardian[]>('/elderly/guardians');
      console.info('[ProfilePage] Fetched guardians:', JSON.stringify(res));
      this.guardians = res;
    } catch (err) {
      console.error('[ProfilePage] Fetch guardians failed', JSON.stringify(err));
      this.guardiansError = '加载失败，请检查网络';
    } finally {
      this.isLoadingGuardians = false;
    }
  }

  async bindGuardian(phone: string) {
    if (!phone) return;
    try {
      const res = await HttpUtil.post<ApiResponse>('/elderly/bind', { phone });
      if (res.success) {
        promptAction.showToast({ message: '添加成功' });
        this.fetchGuardians();
      } else {
        promptAction.showToast({ message: res.message || '添加失败' });
      }
    } catch (err) {
      promptAction.showToast({ message: '请求失败，请检查手机号是否正确' });
    }
  }

  async unbindGuardian(guardianId: string) {
    try {
      const res = await HttpUtil.post<ApiResponse>('/elderly/unbind', { guardianId });
      if (res.success) {
        promptAction.showToast({ message: '已删除' });
        this.fetchGuardians();
      } else {
        promptAction.showToast({ message: res.message || '删除失败' });
      }
    } catch (err) {
      promptAction.showToast({ message: '请求失败' });
    }
  }

  async updateRelation(guardianId: string, elderlyAlias: string, guardianAlias: string) {
    if (!elderlyAlias) return;
    try {
      const res = await HttpUtil.post<ApiResponse>('/elderly/update_relation', { guardianId, guardianAlias, elderlyAlias });
      if (res.success) {
        promptAction.showToast({ message: '修改成功' });
        this.fetchGuardians();
      } else {
        promptAction.showToast({ message: res.message || '修改失败' });
      }
    } catch (err) {
      promptAction.showToast({ message: '请求失败' });
    }
  }

  handleDeleteConfirm(guardian: Guardian) {
    promptAction.showDialog({
      title: '删除监护人',
      message: `确定要删除 ${guardian.name} 吗？`,
      buttons: [
        { text: '取消', color: '#64748B' },
        { text: '删除', color: '#EF4444' }
      ]
    }).then(result => {
      if (result.index === 1) {
        this.unbindGuardian(guardian.id);
      }
    });
  }

  handleSaveProfile() {
    if (this.editName.trim() === '' || this.editPhone.trim() === '') {
      promptAction.showToast({ message: '姓名和电话不能为空' });
      return;
    }
    // 更新用户信息 (模拟)
    this.currentUser.name = this.editName;
    this.currentUser.phone = this.editPhone;
    this.isEditing = false;
    promptAction.showToast({ message: '个人资料已更新' });
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
        router.replaceUrl({ url: 'pages/LoginPage' });
      }
    });
  }

  build() {
    Scroll() {
      Column() {
        // 顶部标题栏
        Row() {
          Text('个人信息')
            .fontSize(24)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1a1a1a')
          Blank()
        }
        .width('100%')
        .padding({ left: 20, right: 20, top: 10, bottom: 10 })

        // 1. 个人资料卡片 (支持编辑)
        if (this.isEditing) {
          Column() {
            Text('编辑个人资料')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#1E293B')
              .margin({ bottom: 16 })
              .width('100%')

            Text('姓名')
              .fontSize(14)
              .fontColor('#64748B')
              .width('100%')
              .margin({ bottom: 8 })
            TextInput({ text: this.editName, placeholder: '请输入姓名' })
              .width('100%')
              .height(48)
              .backgroundColor('#F8FAFC')
              .borderRadius(8)
              .onChange((value: string) => {
                this.editName = value;
              })
              .margin({ bottom: 16 })

            Text('电话')
              .fontSize(14)
              .fontColor('#64748B')
              .width('100%')
              .margin({ bottom: 8 })
            TextInput({ text: this.editPhone, placeholder: '请输入电话' })
              .width('100%')
              .height(48)
              .backgroundColor('#F8FAFC')
              .borderRadius(8)
              .type(InputType.PhoneNumber)
              .onChange((value: string) => {
                this.editPhone = value;
              })
              .margin({ bottom: 24 })

            Row() {
              Button('取消')
                .backgroundColor('#F1F5F9')
                .fontColor('#64748B')
                .width('45%')
                .onClick(() => {
                  this.isEditing = false;
                  this.editName = this.currentUser.name;
                  this.editPhone = this.currentUser.phone;
                })
              
              Blank()
              
              Button('保存')
                .backgroundColor('#2563EB')
                .fontColor(Color.White)
                .width('45%')
                .onClick(() => {
                  this.handleSaveProfile();
                })
            }
            .width('100%')
          }
          .padding(24)
          .backgroundColor(Color.White)
          .margin({ bottom: 12 })
        } else {
          Row() {
            Stack() {
              Circle({ width: 72, height: 72 })
                .fill('#EFF6FF')
              Text(this.currentUser.name.substring(0, 1))
                .fontSize(28)
                .fontWeight(FontWeight.Bold)
                .fontColor('#2563EB')
            }
            .margin({ right: 16 })
  
            Column() {
              Text(this.currentUser.name)
                .fontSize(22)
                .fontWeight(FontWeight.Bold)
                .fontColor('#1E293B')
              Text(this.currentUser.phone)
                .fontSize(14)
                .fontColor('#64748B')
                .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            
            Blank()
            
            // 编辑按钮
            Text('编辑')
              .fontSize(14)
              .fontColor('#2563EB')
              .onClick(() => {
                this.isEditing = true;
              })
          }
          .width('100%')
          .padding(24)
          .backgroundColor(Color.White)
          .margin({ bottom: 12 })
        }

        // 2. 我的家属
        Column() {
          // 标题栏，带管理按钮
          this.SectionHeader('我的家属', true)
          
          if (this.isLoadingGuardians) {
            Text('加载中...')
              .fontSize(16)
              .fontColor('#94A3B8')
              .padding(16)
          } else if (this.guardiansError) {
             Row() {
               Text(this.guardiansError)
                 .fontSize(16)
                 .fontColor('#EF4444')
               Text('重试')
                 .fontSize(16)
                 .fontColor('#2563EB')
                 .margin({ left: 8 })
                 .onClick(() => this.fetchGuardians())
             }
             .padding(16)
          } else if (this.guardians.length > 0) {
            ForEach(this.guardians, (guardian: Guardian, index: number) => {
              Column() {
                if (index > 0) {
                  Divider().color('#F1F5F9').padding({ left: 16, right: 16 })
                }
                Row() {
                  // 姓名 & 关系
                  Column() {
                    Row() {
                        Text(guardian.name)
                            .fontSize(18)
                            .fontColor('#1E293B')
                            .fontWeight(FontWeight.Medium)
                        
                        if (!this.isManagingGuardians) {
                            Text(guardian.relation)
                                .fontSize(14)
                                .fontColor('#64748B')
                                .backgroundColor('#F1F5F9')
                                .padding({ left: 6, right: 6, top: 2, bottom: 2 })
                                .borderRadius(4)
                                .margin({ left: 8 })
                        }
                    }
                  }
                  .alignItems(HorizontalAlign.Start)
                  
                  Blank()
                  
                  if (this.isManagingGuardians) {
                    // 管理模式：显示编辑和删除
                    Row({ space: 16 }) {
                        // 修改备注
                        Text('修改')
                            .fontColor('#2563EB')
                            .fontSize(14)
                            .onClick(() => {
                                this.currentEditGuardianId = guardian.id;
                                this.editRelationDialog.open();
                            })

                        // 删除
                        Text('删除')
                            .fontColor('#EF4444')
                            .fontSize(14)
                            .onClick(() => {
                                this.handleDeleteConfirm(guardian);
                            })
                    }
                  } else {
                    // 普通模式：显示电话拨打
                    Text(guardian.phone)
                        .fontSize(16)
                        .fontColor('#2563EB')
                        .onClick(() => this.handleCall(guardian.phone))
                  }
                }
                .width('100%')
                .padding(16)
              }
            })
          } else {
            Text('暂无关联家属')
              .fontSize(18)
              .fontColor('#94A3B8')
              .padding(16)
          }
        }
        .backgroundColor(Color.White)
        .margin({ bottom: 12, left: 16, right: 16 })
        .borderRadius(12)

        // 3. 通知策略 (参考 Web 端)
        Column() {
          this.SectionHeader('通知策略')
          
          // 震动提醒
          Row() {
            Column() {
              Text('手机强力震动提醒')
                .fontSize(16)
                .fontColor('#1E293B')
                .fontWeight(FontWeight.Medium)
              Text('检测到异常时，监护人手机产生持续震动')
                .fontSize(12)
                .fontColor('#64748B')
                .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
            
            Toggle({ type: ToggleType.Switch, isOn: this.isVibrationEnabled })
              .selectedColor('#2563EB')
              .onChange((isOn: boolean) => {
                this.isVibrationEnabled = isOn;
              })
          }
          .width('100%')
          .padding(16)

          Divider().color('#F1F5F9').padding({ left: 16 })

          // 短信提醒
          Row() {
            Column() {
              Text('跌倒短信紧急报警')
                .fontSize(16)
                .fontColor('#1E293B')
                .fontWeight(FontWeight.Medium)
              Text('检测到异常跌倒后，自动发送告警短信')
                .fontSize(12)
                .fontColor('#64748B')
                .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
            
            Toggle({ type: ToggleType.Switch, isOn: this.isSmsEnabled })
              .selectedColor('#2563EB')
              .onChange((isOn: boolean) => {
                this.isSmsEnabled = isOn;
              })
          }
          .width('100%')
          .padding(16)
        }
        .backgroundColor(Color.White)
        .margin({ bottom: 12, left: 16, right: 16 })
        .borderRadius(12)


        // 4. 退出登录
        Button('退出登录')
          .width('90%')
          .height(48)
          .backgroundColor('#FEE')
          .fontColor('#EF4444')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ top: 12, bottom: 40 })
          .onClick(() => {
             this.handleLogout();
          })
      }
      .width('100%')
      . justifyContent(FlexAlign. Start)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
    .align(Alignment. Top)
  }

  @Builder SectionHeader(title: string, showManage: boolean = false) {
    Row() {
      Text(title)
        .fontSize(20)
        .fontWeight(600)
      
      Blank()

      if (showManage) {
        if (this.isManagingGuardians) {
          Row() {
            // 添加按钮
            Text('添加家属')
              .fontSize(14)
              .fontColor('#2563EB')
              .backgroundColor('#EFF6FF')
              .padding({ left: 12, right: 12, top: 6, bottom: 6 })
              .borderRadius(16)
              .margin({ right: 12 })
              .onClick(() => {
                this.addGuardianDialog.open()
              })

            // 完成按钮
            Text('完成')
              .fontSize(14)
              .fontColor('#2563EB')
              .onClick(() => {
                this.isManagingGuardians = false;
              })
          }
        } else {
          // 管理按钮
          Text('管理')
            .fontSize(14)
            .fontColor('#64748B')
            .onClick(() => {
              this.isManagingGuardians = true;
            })
        }
      }
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 16, bottom: 8 })
    .alignItems(VerticalAlign.Center)
  }
}

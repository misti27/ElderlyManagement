
import { Guardian, User } from '../model/Types';
import { MockData } from '../utils/MockData';
import promptAction from '@ohos.promptAction';
import router from '@ohos.router';

@Component
export struct ProfilePage {
  @State currentUser: User = MockData.currentUser;
  @State guardians: Guardian[] = MockData.guardians;
  @State isVibrationEnabled: boolean = true;
  @State isSmsEnabled: boolean = true;
  @State isEditing: boolean = false;
  @State editName: string = '';
  @State editPhone: string = '';

  aboutToAppear() {
    this.editName = this.currentUser.name;
    this.editPhone = this.currentUser.phone;
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

        // 2. 我的家属 (直接展示列表)
        Column() {
          this.SectionHeader('我的家属')
          
          if (this.guardians.length > 0) {
            ForEach(this.guardians, (guardian: Guardian, index: number) => {
              Column() {
                if (index > 0) {
                  Divider().color('#F1F5F9').padding({ left: 16, right: 16 })
                }
                Row() {
                  Text(guardian.name)
                    .fontSize(18)
                    .fontColor('#1E293B')
                    .fontWeight(FontWeight.Medium)
                  Text(guardian.relation)
                    .fontSize(16)
                    .fontColor('#64748B')
                    .margin({ top: 2, left:10 })
                  
                  Blank()
                  
                  Text(guardian.phone)
                    .fontSize(18)
                    .fontColor('#2563EB')
                    .onClick(() => {
                      this.handleCall(guardian.phone);
                    })
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
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
  }

  @Builder SectionHeader(title: string) {
    Text(title)
      .fontSize(20)
      .width('100%')
      .padding({ left: 16, top: 16, bottom: 8 })
      .fontWeight(600)
  }
}

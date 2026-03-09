import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import { AuthService } from '../services/AuthService';

@Entry
@Component
struct ForgotPasswordPage {
  @State phone: string = '';
  @State code: string = '';
  @State newPassword: string = '';
  @State confirmPassword: string = '';
  @State countdown: number = 0;
  private timer: number = -1;

  // 步骤: 1-输入手机号, 2-输入验证码和新密码
  @State step: number = 1;

  // 页面销毁前清理定时器
  aboutToDisappear() {
    this.stopTimer();
  }

  stopTimer() {
    if (this.timer !== -1) {
      clearInterval(this.timer);
      this.timer = -1;
    }
  }

  // 统一的 Toast 提示，避免重复写 try-catch
  showToast(msg: string) {
    try {
      promptAction.showToast({ message: msg });
    } catch (e) {
      console.error('Toast error');
    }
  }

  async handleRequestCode() {
    if (this.phone.length !== 11) {
      this.showToast('请输入有效的11位手机号');
      return;
    }

    try {
      // 调用后台接口
      const success = await AuthService.requestPasswordResetCode(this.phone);
      if (!success) {
        this.showToast('发送失败，请稍后重试');
        return;
      }

      this.showToast('验证码已发送');
      this.step = 2; // 进入下一步

      // 开始倒计时
      this.stopTimer();
      this.countdown = 60;
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.stopTimer();
        }
      }, 1000);
    } catch (err) {
      console.error('Request code failed:', JSON.stringify(err));
      this.showToast('网络请求失败');
    }
  }

  async handleResetPassword() {
    if (this.code.length !== 6) {
      this.showToast('请输入6位验证码');
      return;
    }
    if (this.newPassword.length < 6) {
      this.showToast('新密码长度不能少于6位');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.showToast('两次输入的密码不一致');
      return;
    }

    try {
      const success = await AuthService.resetPassword(this.phone, this.code, this.newPassword);
      if (success) {
        this.showToast('密码重置成功，请重新登录');
        router.back();
      } else {
        this.showToast('重置失败，验证码可能已过期');
      }
    } catch (err) {
      console.error('Reset password failed:', JSON.stringify(err));
      this.showToast('操作失败，请重试');
    }
  }

  build() {
    Column() {
      // 1. 顶部导航栏
      Row() {
        Image($r('app.media.icon_back'))
          .width(24).height(24)
          .onClick(() => {
            try {
              if (this.step === 2) {
                this.step = 1; //如果在第2步，点击返回先回到第1步
              } else {
                router.back();
              }
            } catch (err) {}
          })
      }
      .width('100%')
      .padding({ left: 20, top: 20, bottom: 10 })

      // 2. 动态标题区域 (左对齐 Hero Title)
      Column() {
        Text('重置密码')
          .fontSize(30)
          .fontWeight(FontWeight.Bolder)
          .fontColor('#1A1A1A')

        // 根据步骤显示不同的副标题
        Text(this.step === 1 ? '请输入注册手机号以获取验证码' : `验证码已发送至 ${this.phone}`)
          .fontSize(15)
          .fontColor('#888888')
          .margin({ top: 10 })
      }
      .width('100%')
      .alignItems(HorizontalAlign.Start)
      .padding({ left: 24, right: 24, top: 10, bottom: 35 })

      // 3. 内容区 (根据步骤切换)
      Column() {
        if (this.step === 1) {
          this.StepOneLayout()
        } else {
          this.StepTwoLayout()
        }
      }
      .width('100%')
      .padding({ left: 24, right: 24 })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF') // 纯白背景
  }

  // 第一步布局：输入手机号
  @Builder StepOneLayout() {
    Column({ space: 16 }) {
      TextInput({ placeholder: '请输入11位手机号', text: this.phone })
        .type(InputType.PhoneNumber)
        .maxLength(11)
        .height(56)
        .width('100%')
        .backgroundColor('#F4F6F8') // 浅蓝灰
        .placeholderColor('#A0AAB7')
        .borderRadius(12)
        .padding({ left: 20 })
        .onChange((v) => this.phone = v)

      Button('获取验证码')
        .width('100%')
        .height(54)
        .backgroundColor('#2A64E8') // 品牌蓝
        .fontColor(Color.White)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .borderRadius(27) // 胶囊圆角
        .shadow({ radius: 10, color: '#332A64E8', offsetX: 0, offsetY: 4 }) // 蓝色光影
        .margin({ top: 20 })
        .onClick(() => this.handleRequestCode())
    }
  }

  // 第二步布局：验证码 + 新密码
  @Builder StepTwoLayout() {
    Column({ space: 16 }) {
      // 验证码行
      Row({ space: 12 }) {
        TextInput({ placeholder: '6位验证码', text: this.code })
          .type(InputType.Number)
          .maxLength(6)
          .layoutWeight(1)
          .height(56)
          .backgroundColor('#F4F6F8')
          .placeholderColor('#A0AAB7')
          .borderRadius(12)
          .padding({ left: 20 })
          .onChange((v) => this.code = v)

        Button(this.countdown > 0 ? `${this.countdown}s` : '重新获取')
          .width(110)
          .height(56)
          .fontSize(14)
          .backgroundColor(this.countdown > 0 ? '#E2E8F0' : '#2A64E8') // 倒计时灰色，可点击蓝色
          .fontColor(this.countdown > 0 ? '#94A3B8' : Color.White)
          .borderRadius(12)
          .enabled(this.countdown === 0)
          .onClick(() => this.handleRequestCode())
      }
      .width('100%')

      // 密码输入框 (带小眼睛)
      TextInput({ placeholder: '请输入新密码 (不少于6位)', text: this.newPassword })
        .type(InputType.Password)
        .showPasswordIcon(true)
        .height(56)
        .width('100%')
        .backgroundColor('#F4F6F8')
        .placeholderColor('#A0AAB7')
        .borderRadius(12)
        .padding({ left: 20 })
        .onChange((v) => this.newPassword = v)

      TextInput({ placeholder: '请确认新密码', text: this.confirmPassword })
        .type(InputType.Password)
        .showPasswordIcon(true)
        .height(56)
        .width('100%')
        .backgroundColor('#F4F6F8')
        .placeholderColor('#A0AAB7')
        .borderRadius(12)
        .padding({ left: 20 })
        .onChange((v) => this.confirmPassword = v)

      Button('确认重置')
        .width('100%')
        .height(54)
        .backgroundColor('#2A64E8')
        .fontColor(Color.White)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .borderRadius(27)
        .shadow({ radius: 10, color: '#332A64E8', offsetX: 0, offsetY: 4 })
        .margin({ top: 20 })
        .onClick(() => this.handleResetPassword())
    }
  }
}

import router from '@ohos.router';
import promptAction from '@ohos.promptAction';

@Entry
@Component
export struct LoginPage {
  @State phone: string = '';
  @State code: string = '';
  @State countdown: number = 0;
  private timer: number = -1;

  startCountdown() {
    if (this.phone.length !== 11) {
      promptAction.showToast({ message: '请输入11位手机号' });
      return;
    }
    this.countdown = 60;
    this.timer = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.timer);
      }
    }, 1000);
    promptAction.showToast({ message: '验证码已发送: 123456' });
  }

  handleLogin() {
    if (this.phone.length !== 11) {
      promptAction.showToast({ message: '请输入正确手机号' });
      return;
    }
    if (this.code.length !== 6) {
      promptAction.showToast({ message: '请输入6位验证码' });
      return;
    }
    
    // 模拟登录成功
    promptAction.showToast({ message: '登录成功' });
    router.replaceUrl({ url: 'pages/Index' });
  }

  build() {
    Column() {
      // 顶部标题
      Text('老年卫士')
        .fontSize(36)
        .fontWeight(FontWeight.Bold)
        .fontColor('#2563EB') // Blue-600
        .margin({ top: 100, bottom: 10 })

      Text('时刻守护您的安全')
        .fontSize(16)
        .fontColor('#64748B') // Slate-500
        .margin({ bottom: 60 })

      // 表单区域
      Column({ space: 20 }) {
        // 手机号输入
        TextInput({ placeholder: '请输入手机号' })
          .type(InputType.PhoneNumber)
          .maxLength(11)
          .height(50)
          .borderRadius(12)
          .backgroundColor('#F1F5F9') // Slate-100
          .onChange((value: string) => {
            this.phone = value;
          })

        // 验证码区域
        Row({ space: 10 }) {
          TextInput({ placeholder: '验证码' })
            .type(InputType.Number)
            .maxLength(6)
            .height(50)
            .layoutWeight(1)
            .borderRadius(12)
            .backgroundColor('#F1F5F9')
            .onChange((value: string) => {
              this.code = value;
            })

          Button(this.countdown > 0 ? `${this.countdown}s` : '获取验证码')
            .height(50)
            .width(120)
            .fontSize(14)
            .backgroundColor(this.countdown > 0 ? '#CBD5E1' : '#2563EB') // Slate-300 or Blue-600
            .fontColor(Color.White)
            .borderRadius(12)
            .enabled(this.countdown === 0)
            .onClick(() => {
              this.startCountdown();
            })
        }
        .width('100%')

        // 登录按钮
        Button('登录 / 注册')
          .width('100%')
          .height(50)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .backgroundColor('#2563EB')
          .fontColor(Color.White)
          .borderRadius(12)
          .margin({ top: 20 })
          .onClick(() => {
            this.handleLogin();
          })
      }
      .width('90%')
      .padding(20)
      .backgroundColor(Color.White)
      .borderRadius(16)
      .shadow({ radius: 10, color: '#10000000', offsetY: 5 })

    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC') // Slate-50
  }
}

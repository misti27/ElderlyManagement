import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import storage from '@ohos.data.storage';
import { HttpUtil } from '../utils/HttpUtil';

interface LoginResponse {
  token: string;
  user: object;
  message?: string;
}

@Entry
@Component
struct LoginPage {
  @State account: string = '';
  @State password: string = '';
  @State code: string = '';
  @State isPasswordLogin: boolean = true;
  @State countdown: number = 0;
  private timer: number = -1;

  // 增加页面销毁时的清理逻辑，防止倒计时引起的内存泄漏
  aboutToDisappear() {
    if (this.timer !== -1) {
      clearInterval(this.timer);
    }
  }

  startCountdown() {
    if (this.account.length !== 11) {
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
    promptAction.showToast({ message: '验证码已发送' });
  }

  async handleLogin() {
    if (!this.account) {
      promptAction.showToast({ message: '请输入账号' });
      return;
    }

    if (this.isPasswordLogin && !this.password) {
      promptAction.showToast({ message: '请输入密码' });
      return;
    }

    if (!this.isPasswordLogin && this.code.length !== 6) {
      promptAction.showToast({ message: '请输入正确的验证码' });
      return;
    }

    try {
      const res = await HttpUtil.post<LoginResponse>('/login', {
        phone: this.account,
        password: this.password,
        code: this.code
      });

      if (res && res.token) {
        const appStorage = await storage.getStorage(getContext(this).filesDir + '/ElderlyAppStorage');
        await appStorage.put('token', res.token);
        HttpUtil.setToken(res.token);

        promptAction.showToast({ message: '登录成功' });
        router.replaceUrl({ url: 'pages/HomePage' });
      } else {
        promptAction.showToast({ message: res?.message || '登录失败: 无效的响应' });
      }
    } catch (err) {
      console.error('Login failed:', JSON.stringify(err));
    }
  }

  build() {
    Column() {
      // 1. 顶部图标区域 (改为渐变色，更有现代感)
      Column() {
        Stack() {
          // 底层：蓝色的渐变背景框
          Column()
            .width(90)
            .height(90)
            .linearGradient({
              direction: GradientDirection.RightBottom,
              colors: [['#6895FF', 0.0],['#2A64E8', 1.0]]
            })
            .borderRadius(24)
            .shadow({ radius: 15, color: '#332A64E8', offsetX: 0, offsetY: 8 })

          // 顶层：守护盾 Icon (新加的这部分)
          Image($r('app.media.icon_shield'))
            .width(44)
            .height(44)
            .fillColor(Color.White)
        }
        .margin({ top: 80, bottom: 25 })

        // 2. 标题和副标题 (颜色调柔和)
        Text('智慧守护')
          .fontSize(28)
          .fontWeight(FontWeight.Bolder)
          .fontColor('#1A1A1A') // 柔和的黑
          .margin({ bottom: 10 })

        Text('守护每一份牵挂')
          .fontSize(15)
          .fontColor('#888888') // 更有质感的灰
          .margin({ bottom: 45 })
      }
      .width('100%')
      .alignItems(HorizontalAlign.Center)

      // 3. 登录方式切换 Tab
      Row() {
        Column() {
          Text('账号登录')
            .fontSize(17)
            .fontWeight(this.isPasswordLogin ? FontWeight.Bold : FontWeight.Medium)
            .fontColor(this.isPasswordLogin ? '#2A64E8' : '#888888')
            .onClick(() => this.isPasswordLogin = true)

          if (this.isPasswordLogin) {
            Rect()
              .width(24)
              .height(3)
              .fill('#2A64E8')
              .radius(2)
              .margin({ top: 6 })
          }
        }
        .margin({ right: 40 })

        Column() {
          Text('验证码登录')
            .fontSize(17)
            .fontWeight(!this.isPasswordLogin ? FontWeight.Bold : FontWeight.Medium)
            .fontColor(!this.isPasswordLogin ? '#2A64E8' : '#888888')
            .onClick(() => this.isPasswordLogin = false)

          if (!this.isPasswordLogin) {
            Rect()
              .width(24)
              .height(3)
              .fill('#2A64E8')
              .radius(2)
              .margin({ top: 6 })
          }
        }
      }
      .margin({ bottom: 30 })

      // 4. 输入框区域 (提亮背景色)
      Column({ space: 16 }) {
        TextInput({ placeholder: '请输入手机号/账号', text: this.account })
          .height(56)
          .width('90%')
          .backgroundColor('#F4F6F8') // 清爽的极浅蓝灰色
          .placeholderColor('#A0AAB7')
          .borderRadius(12)
          .padding({ left: 20 })
          .onChange((value: string) => {
            this.account = value;
          })

        if (this.isPasswordLogin) {
          TextInput({ placeholder: '请输入密码', text: this.password })
            .height(56)
            .width('90%')
            .type(InputType.Password)
            .showPasswordIcon(true) // ✨ 增加自带的密码可见小眼睛
            .backgroundColor('#F4F6F8')
            .placeholderColor('#A0AAB7')
            .borderRadius(12)
            .padding({ left: 20 })
            .onChange((value: string) => {
              this.password = value;
            })
        } else {
          Row({ space: 12 }) {
            TextInput({ placeholder: '验证码', text: this.code })
              .height(56)
              .layoutWeight(1)
              .type(InputType.Number)
              .backgroundColor('#F4F6F8')
              .placeholderColor('#A0AAB7')
              .borderRadius(12)
              .padding({ left: 20 })
              .onChange((value: string) => {
                this.code = value;
              })

            Button(this.countdown > 0 ? `${this.countdown}s` : '获取验证码')
              .height(56)
              .width(110)
              .fontSize(14)
              .backgroundColor(this.countdown > 0 ? '#E2E8F0' : '#2A64E8')
              .fontColor(this.countdown > 0 ? '#94A3B8' : Color.White)
              .borderRadius(12)
              .enabled(this.countdown === 0)
              .onClick(() => {
                this.startCountdown();
              })
          }
          .width('90%')
        }
      }
      .width('100%')
      .margin({ bottom: 35 })

      // 5. 登录按钮 (圆角增大，更饱满)
      Button('立即登录')
        .width('90%')
        .height(54)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.White)
        .backgroundColor('#2A64E8') // 更靓丽的蓝
        .borderRadius(27) // 药丸型圆角
        .shadow({ radius: 10, color: '#332A64E8', offsetX: 0, offsetY: 4 }) // 增加淡淡的蓝色发光阴影
        .onClick(() => {
          this.handleLogin();
        })

      // 6. 新用户注册 和 忘记密码
      Row() {
        Text('新用户注册')
          .fontSize(14)
          .fontColor('#2A64E8')
          .padding(10) // 增加点击区域
          .onClick(() => {
            router.pushUrl({ url: 'pages/RegisterPage' })
          })

        Text('忘记密码')
          .fontSize(14)
          .fontColor('#888888')
          .padding(10)
          .onClick(() => {
            router.pushUrl({ url: 'pages/ForgotPasswordPage' });
          })
      }
      .width('90%')
      .justifyContent(FlexAlign.SpaceBetween)
      .margin({ top: 10 })

      Blank() // 将底部的跳过按钮推到最下面

      // 7. 跳过登录 (游客模式)
      Button('跳过登录 (测试用)')
        .width(180)
        .height(40)
        .fontSize(13)
        .fontColor('#B0BEC5')
        .backgroundColor('transparent')
        .margin({ bottom: 40 })
        .onClick(async () => {
          try {
            AppStorage.SetOrCreate('isGuest', true);
            const appStorage = await storage.getStorage(getContext(this).filesDir + '/ElderlyAppStorage');
            await appStorage.delete('token');
            HttpUtil.setToken('');
            await router.replaceUrl({ url: 'pages/Index' });
            promptAction.showToast({ message: '已进入游客模式' });
          } catch (err) {
            promptAction.showToast({ message: '跳转失败' });
          }
        })

    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF') // ✨ 将整个页面背景改为纯白，瞬间通透
  }
}
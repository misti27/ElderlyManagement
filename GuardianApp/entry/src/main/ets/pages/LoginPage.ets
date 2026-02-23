
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
        password: this.password, // 后端暂未校验
        code: this.code // 后端暂未校验
      });

      if (res && res.token) {
        // 获取应用的持久化存储实例
        const appStorage = await storage.getStorage(getContext(this).filesDir + '/ElderlyAppStorage');
        // 保存 Token
        await appStorage.put('token', res.token);
        // 更新 HttpUtil 中的 Token
        HttpUtil.setToken(res.token);

        promptAction.showToast({ message: '登录成功' });
        // 跳转到主页
        router.replaceUrl({ url: 'pages/HomePage' });
      } else {
        promptAction.showToast({ message: res?.message || '登录失败: 无效的响应' });
      }
    } catch (err) {
      console.error('Login failed:', JSON.stringify(err));
      // 错误处理已在 HttpUtil 中统一处理，这里无需额外全局提示
    }
  }

  build() {
    Column() {
      // 1. 顶部图标区域
      Column() {
        Stack() {
          // 蓝色背景框
          Column()
            .width(100)
            .height(100)
            .backgroundColor('#3b64cc') // 这里的蓝色根据图片取色
            .borderRadius(25)
            .shadow({ radius: 10, color: '#20000000', offsetX: 0, offsetY: 5 })

        }
        .margin({ top: 80, bottom: 20 })

        // 2. 标题和副标题
        Text('智慧守护')
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor('#000000')
          .margin({ bottom: 8 })

        Text('守护每一份牵挂')
          .fontSize(16)
          .fontColor('#666666')
          .margin({ bottom: 40 })
      }
      .width('100%')
      .alignItems(HorizontalAlign.Center)

      // 3. 登录方式切换 Tab
      Row() {
        Column() {
          Text('账号登录')
            .fontSize(16)
            .fontWeight(this.isPasswordLogin ? FontWeight.Bold : FontWeight.Normal)
            .fontColor(this.isPasswordLogin ? '#3258c8' : '#666666')
            .onClick(() => this.isPasswordLogin = true)

          if (this.isPasswordLogin) {
            Rect()
              .width(20)
              .height(3)
              .fill('#3258c8')
              .radius(2)
              .margin({ top: 4 })
          }
        }
        .margin({ right: 40 })

        Column() {
          Text('验证码登录')
            .fontSize(16)
            .fontWeight(!this.isPasswordLogin ? FontWeight.Bold : FontWeight.Normal)
            .fontColor(!this.isPasswordLogin ? '#3258c8' : '#666666')
            .onClick(() => this.isPasswordLogin = false)

          if (!this.isPasswordLogin) {
            Rect()
              .width(20)
              .height(3)
              .fill('#3258c8')
              .radius(2)
              .margin({ top: 4 })
          }
        }
      }
      .margin({ bottom: 20 })

      // 4. 输入框区域
      Column({ space: 15 }) {
        TextInput({ placeholder: '请输入手机号/账号', text: this.account })
          .height(55)
          .width('90%')
          .backgroundColor('#DCDCDC') // 浅灰色背景
          .placeholderColor('#999999')
          .borderRadius(12)
          .padding({ left: 20 })
          .onChange((value: string) => {
            this.account = value;
          })

        if (this.isPasswordLogin) {
          TextInput({ placeholder: '请输入密码', text: this.password })
            .height(55)
            .width('90%')
            .type(InputType.Password)
            .backgroundColor('#DCDCDC')
            .placeholderColor('#999999')
            .borderRadius(12)
            .padding({ left: 20 })
            .onChange((value: string) => {
              this.password = value;
            })
        } else {
          Row({ space: 10 }) {
            TextInput({ placeholder: '验证码', text: this.code })
              .height(55)
              .layoutWeight(1)
              .backgroundColor('#DCDCDC')
              .placeholderColor('#999999')
              .borderRadius(12)
              .padding({ left: 20 })
              .onChange((value: string) => {
                this.code = value;
              })

            Button(this.countdown > 0 ? `${this.countdown}s` : '获取验证码')
              .height(45)
              .width(120)
              .fontSize(14)
              .backgroundColor(this.countdown > 0 ? '#CBD5E1' : '#3258c8')
              .fontColor(Color.White)
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
      .margin({ bottom: 30 })

      // 5. 登录按钮
      Button('立即登录')
        .width('90%')
        .height(55)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.White)
        .backgroundColor('#3258c8') // 按钮蓝色
        .borderRadius(12)
        .onClick(() => {
          this.handleLogin();
        })

      // 7. 跳过登录 (游客模式)
      Button('跳过登录 (测试用)')
        .width(180)
        .height(30)
        .fontSize(12)
        .fontColor('#94A3B8')
        .backgroundColor('transparent')
        .margin({ top: 32 })
        .onClick(async () => {
          try {
            // 设置游客模式标志
            AppStorage.SetOrCreate('isGuest', true);

            // 清除持久化存储中的 token
            const appStorage = await storage.getStorage(getContext(this).filesDir + '/ElderlyAppStorage');
            await appStorage.delete('token');
            HttpUtil.setToken(''); // 同时清除 HttpUtil 中的 token

            // 跳转到 Index 页面重新进行登录检查
            await router.replaceUrl({ url: 'pages/Index' });
            promptAction.showToast({ message: '已进入游客模式' });
          } catch (err) {
            let error = err as Error;
            console.error('Guest mode navigation failed:', JSON.stringify(err));
            promptAction.showToast({ message: '跳转失败: ' + (err.message || '未知错误') });
          }
        })

    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F5F7FA') // 页面整体背景颜色
  }
}

class Authorize {

	// 设置全局默认配置
	setConfig(customConfig) {
		// 合并对象
		this.config = {
			...this.config,
			...customConfig
		}
	}

	constructor() {
		this.config = {
			//公众号的唯一标识
			appid: "",
			//应用授权作用域，snsapi_base （不弹出授权页面，直接跳转，只能获取用户openid）
			scope: "snsapi_base",
			//下一次授权间隔时间，避免每次进入公众就需要进行一次授权，此处是12个小时
			interval: 12 * 60 * 60
		}
	}
	/**
	 * 判断是否是微信公众号
	 */
	isWeixinMP() {
		//判断当前浏览器环境
		return String(navigator.userAgent.toLowerCase().match(/MicroMessenger/i)) === "micromessenger";
	}
	/**
	 * 获取URL中指定参数的值
	 * @param {Object} key 指定参数名
	 */
	getValueBuyKeyInUrl(key) {
		return decodeURIComponent((new RegExp('[?|&]' + key + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || [,
				''
			])[1]
			.replace(/\+/g, '%20')) || null
	}
	/**
	 * 获取公众号授权code
	 */
	getAuthorizeCode(options = {}) {
		//是否在授权时间间隔内
		let within_interval = false
		//获取当前页面地址作为回调地址
		const redirect_uri = encodeURIComponent(window.location.href);
		//获取本地缓存的code
		const CODE = uni.getStorageSync('CODE');
		//获取授权回调中返回的code
		const auth_code = this.getValueBuyKeyInUrl('code')
		//获取本地换车的state值
		const STATE = uni.getStorageSync('STATE')
		//获取授权回调中返回的state值
		const auth_state = this.getValueBuyKeyInUrl('state')
		//获取code的时间戳
		const timestamp = new Date().getTime();
		//进行时间授权时间差计算
		if (STATE) {
			console.log(STATE)
			//如果是秒换算为毫秒
			if (STATE.toString().length == 10) STATE *= 1000;
			//获取上一次授权的时间
			let timestamp = +new Date(Number(STATE));
			//计算当前授权时间与上一次授权的时间差（单位秒）
			let timer = (Number(new Date()) - timestamp) / 1000;
			//时间间隔大于了指定得时间间隔需要重新授权
			console.log(Number(new Date()))
			console.log(timestamp)
			console.log(timer)
			console.log(timer < this.config.interval)
			if (timer < this.config.interval) {
				within_interval = true
			}
		}
		console.log('within_interval',within_interval)
		//没有缓存CODE没有授权回调code也不在授权间隔时间内，进入授权调用
		if (!CODE && !auth_code && !within_interval) {
			//缓存当前访问的页面地址，授权回调成功过后进行重定向，重定向的作用在于去掉链接地址中的code和state
			uni.setStorageSync("replace_url", window.location.href);
			//获取code
			document.location.replace(
				`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${this.config.appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${this.config.scope}&state=${timestamp}#wechat_redirect`
			);
		} //处理授权回调 授权回调会获取到授权code、state，此处程序没有还有缓存授权时间，可以进行页面重定向
		else if (auth_code && auth_state && !within_interval) {
			//缓存授权code
			uni.setStorageSync('CODE', auth_code);
			//缓存授权时间
			uni.setStorageSync('STATE', auth_state);
			//获取重定向地址
			const replace_url = uni.getStorageSync("replace_url");
			//进行重定向
			document.location.replace(replace_url)
		} //当页面重定向后获取缓存中存储的授权code进行授权的后续操作
		else if (CODE) {
			//获取到缓存授权code后删除
			uni.removeStorageSync('CODE');
			//删除授权时间，此处删除授权时间的目的是为了防止在后续的授权逻辑程序除了问题无法重新在时间间隔内重新授权
			uni.removeStorageSync('STATE');
			//请求后端接口获取用户的信息
			options.success({
				code: CODE,
				finsh: () => {
					uni.setStorageSync('STATE', STATE);
				}
			})
		}
	}
}

export default new Authorize

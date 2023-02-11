import weixinMPAuthorize from "@/common/weixin/weixinMPAuthorize/index.js"
const install = (Vue, vm) => {
	Vue.prototype.$weixinMPAuthorize = weixinMPAuthorize
	Vue.prototype.$weixinMPAuthorize.setConfig({
		appid: 'wx13d8f6e8fd970951',
	});
}
export default {
	install
}
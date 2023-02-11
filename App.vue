<script>
	export default {
		onLaunch: function() {
			this.$weixinMPAuthorize.getAuthorizeCode({
				success:res=>{
					//返回的授权code
					console.log(res.code)
					//授权逻辑处理完需要调用finsh函数
					res.finsh()
				}
			})
		}
	}
</script>
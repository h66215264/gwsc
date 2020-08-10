/*
1 输入框绑定 值改变事件 input事件
  1 获取输入框的值
  2 合法性判断
  3 检验通过 把输入框的值发送到后台
  4 返回的数据打印到页面上
2 防抖 （防止抖动） 定时器
  1 定义全局的定时器id
*/
import { request } from "../../request/index.js"
Page({
  data:{
    goods:[],
    //取消按钮是否现实
    isFocus:false,
    //输入框的值
    inpValue:""
  },
  TimeId:-1,
  //输入框的值改变 触发该事件
 handleInput(e){
    // 获取输入框的值
    const {value}=e.detail;
    //合法性判断
    clearTimeout(this.TimeId);
    if(!value.trim()){
      this.setData({
        goods:[],
        isFocus:false
      })
      //值不合法
      return;
    }
    
    // 准备发送请求获取数据
    this.setData({
      isFocus:true
    })
    
    this.TimeId=setTimeout(()=>{
      this.qsearch(value);
    },1000)
    
  },
  //点击取消按钮
  handleCancel(){
    this.setData({
      inpValue:"",
      isFocus:false,
      goods:[]
    })
  },
  //发送请求 获取搜索数据
  async qsearch(query){
    const res=await request({url:"/goods/search",data:{query}});
    this.setData({
      goods:res.goods
    })
  }
})
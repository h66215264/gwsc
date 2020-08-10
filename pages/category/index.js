//引入 用来发送请求的方法
import { request } from "../../request/index.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //左侧大菜单
    leftMenuList:[],
    //右侧商品
    rightContent:[],
    //被点击的左侧菜单
    currentIndex:0,
    //右侧内容的滚动条距离顶部的距离
    scrollTop:0
  },
  //接口的返回数据
  Cates:[],

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    /*
      web中的本地存储和小程序中的本地存储的区别
        1 写代码的方式不一样了
            web：localStorage.setItem("key","value")  localSTorage.getItem("key")
          小程序： wx.setStorageSync("key","value")   wx.getStorageSync("key","value");
        2 存的时候有没有做类型转换
            web：不管存入的是什么类型的数据 最终都会先调用toString() 吧数据变成字符串再存入进去
          小程序：不存在类型转换 存什么类型的数据进去 获取的就是什么类型
    1 先判断本地存储中有没有旧的数据
    {time:Date.now(),data:[...]}
    2 没有旧数据 直接发送新请求
    3 有旧数据 同时 旧的数据也没有过期 就使用本地存储中的旧数据即可    
    */

    //1 获取本地存储中的数据
        const Cates = wx.getStorageSync("cates");
    //2 判断
        if(!Cates){
          //不存在 发送新请求
          this.getCates();
        }else{
          //有旧数据 定义过期时间 
          if(Date.now() - Cates.time > 1000*10){
            //重新发送请求
            this.getCates();
          }else{
            //没有过期 可以使用旧数据
            this.Cates = Cates.data;
             //构造左侧大菜单数据
            let leftMenuList=this.Cates.map(v=>v.cat_name);
            //构造右侧商品数据
            let rightContent=this.Cates[0].children;
            //赋值到data中
            this.setData({
              leftMenuList,
              rightContent
            })
          }
        }
          
  },
  //获取分类数据
  async getCates(){
  //  request({
  //    url:"/categories"
  //  })
  //  .then(res=>{
  //    this.Cates=res.data.message;
  //    //吧接口的数据存入到本地存储中
  //    wx.setStorageSync("cates", {time:Date.now(),data:this.Cates});
  //      
  //    //构造左侧大菜单数据
  //    let leftMenuList=this.Cates.map(v=>v.cat_name);
  //    //构造右侧商品数据
  //    let rightContent=this.Cates[0].children;
  //    //赋值到data中
  //    this.setData({
  //      leftMenuList,
  //      rightContent
  //    })
  //  })

      // 使用es7的async await来发送异步请求
      const res=await request({url:"/categories"})
      this.Cates=res;
     //吧接口的数据存入到本地存储中
      wx.setStorageSync("cates", {time:Date.now(),data:this.Cates});
        
      //构造左侧大菜单数据
      let leftMenuList=this.Cates.map(v=>v.cat_name);
      //构造右侧商品数据
      let rightContent=this.Cates[0].children;
      //赋值到data中
      this.setData({
        leftMenuList,
        rightContent
      })
  },
  //左侧菜单的点击事件
  handleItemTap(e){
    /*
    1 获取被点击标题的索引
    2 给data中的currentIndex赋值
    3 根据不同索引渲染对应页面
    */
   const {index}=e.currentTarget.dataset;
   let rightContent=this.Cates[index].children;
   this.setData({
    currentIndex:index,
    rightContent,
    //重新设置右侧内容的scroll-view标签距离顶部的距离
    scrollTop:0
   })
  }
  
})
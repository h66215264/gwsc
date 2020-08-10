/**
 * 1 页面被打开的时候 触发onShow  onShow 不同于onLoad 无法在形参上接收options参数
 *    1 判断缓存中有没有token
 *    2 获取url上的参数type
 *    2 根据type来决定页面标题的数组元素 那个被激活选中
 *    3 根据type 去发送请求获取订单数据
 *    4 渲染页面
 * 2 点击不同的标题 重新发送请求来获取和渲染数据
 * 
 */


import { request } from "../../request/index.js"

Page({

  data:{
    orders:[],
    tabs:[
      {
        id:0,
        value:'全部',
        isActive:true
      },
      {
        id:1,
        value:'待付款',
        isActive:false
      },
      {
        id:2,
        value:'代发货',
        isActive:false
      },
      {
        id:3,
        value:'退款/退货',
        isActive:false
      }
    ],
  },
  onShow(){
    // 判断缓存中有没有token
    const token=wx.getStorageSync("token");
    if(!token){
      wx.navigateTo({
        url: '/pages/auth/index',
      });
        return;
    }

    //  获取当前小程序的页面栈--数组 长度最大是10页面 
    let pages =  getCurrentPages();
    //  数组中 索引最大的页面就是当前页面
    let currentPages=pages[pages.length-1];
    //  获取url上的type参数
    const {type}=currentPages.options;
    //  激活选中页面标题 当type=1 index=0
    this.changeTitleByIndex(type-1);
    this.getOrders(type);
    },
  async getOrders(type){
    const  res=await request({url:"/my/orders/all",data:{type}});
    this.setData({
      orders:res.orders.map(v=>({...v,create_time_cn:(new Date(v.create_time*1000).toLocaleString())}))
    })
  },
  changeTitleByIndex(index){
    //修改原数组
    let {tabs}=this.data;
    tabs.forEach((v,i)=>i===index?v.isActive=true:v.isActive=false);
    this.setData({
      tabs
    })
  },
  handleTabsItemChange(e){
    //获取被点击的标题索引
    const {index} = e.detail;
    this.changeTitleByIndex(index);
    // 重新发送请求 type=1 index=0
    this.getOrders(index+1);
  }
})
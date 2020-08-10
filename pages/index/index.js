//引入 用来发送请求的方法
import { request } from "../../request/index.js"

//Page Object
Page({
  data: {
    //轮播图数组
    swiperList:[],
    //导航数组
    catesList:[],
    //楼层数据
    floorList:[]
  },
  //options(Object)
  onLoad: function(options) {
  // wx.request({
  //   url: 'https://api-hmugo-web.itheima.net/api/public/v1/home/swiperdata',
  //   success: (result) => {
  //     this.setData({
  //       swiperList:result.data.message
  //     })
  //   }
  // });
    this.getSwiperList();
    this.getCatesList();
    this.getfloorList();
  },
  //获取轮播图数据
  getSwiperList(){
    request( {url: "/home/swiperdata"})
    .then(result => {
       this.setData({
         swiperList:result
       })
    })
  },
  getCatesList(){
    request( {url: "/home/catitems"})
    .then(result => {
       this.setData({
        catesList:result
       })
    })
  },
  getfloorList(){
    request( {url: "/home/floordata"})
    .then(result => {
       this.setData({
        floorList:result
       })
    })
  }
});
  
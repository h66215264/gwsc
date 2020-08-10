/*
  1 页面加载的时候
    1 从缓存中获取购物车数据 渲染到页面 这些数据checked=true
  2 支付按钮
    1 先判断缓存中有没有token
    2 没有就跳转到授权页面 获取token  
    3 有token 创建订单 获取订单编号
    4 完成是支付后 手动删除缓存中 已经被选中的商品
    5 删除后的购物车数据 填充回缓存
    6 在跳转页面
*/  
  
  
  import {getSetting,chooseAddress,openSetting,showModal,showToast,requestPayment} from '../../utils/asyncWx.js'
  import { request } from "../../request/index.js"
  Page({
    data:{
      address:{},
      cart:[],
      totalPricce:0,
      totalNum:0
    },
    onShow(){
      // 获取地址数据
      const address=wx.getStorageSync("address"); 
      // 获取缓存中的购物车数据
      let cart=wx.getStorageSync("cart")||[];
      //过滤后的购物车数据
      cart=cart.filter(v=>v.checked);
        //总价格 总数量
        let totalPricce=0;
        let totalNum=0;
        cart.forEach(v => {
            totalPricce+=v.num*v.goods_price;
            totalNum+=v.num;
        });
        this.setData({
          cart,
          totalPricce,
          totalNum,
          address
        })
    },
    //点击支付
  async handleOrdderPay(){
     try {
        //判断缓存中有没有token
      const token=wx.getStorageSync("token");
      //判断
      if(!token){
        wx.navigateTo({
          url: '/pages/auth/index'
        });
        return;
      }
      //创建订单
        // 准备请求头参数
        //const header={Authorization:token};
        // 准备 请求体参数
        const order_price=this.data.totalPricce;
        const consignee_addr=this.data.address.all;
        const cart= this.data.cart;
        let goods=[];
        cart.forEach(v=>goods.push({
          goods_id:v.goods_id,
          goods_number:v.goods_number,
          goods_price:v.goods_price 
        }))
        //准备发送请求 创建订单 获取订单编号
        const orderParams={order_price,consignee_addr,goods};
        const {order_number}=await request({url:"/my/orders/create",method:"post",data:orderParams});
        //发起 预支付接口
        const {pay}=await request({url:"/my/orders/req_unifiedorder",method:"post",data:{order_number}});
        //发起微信支付
        await requestPayment(pay);
        // 查询后台 订单状态
        const res=await  request({url:"/my/orders/chkOrder",method:"post",data:{order_number}});
        await showToast({title:"支付成功"});
        //手动删除缓存中 已经支付的商品
        let newCart=wx.getStorageSync("cart");
         newCart=newCart.filter(v=>!v.checked);
         wx.setStorageSync("cart", newCart);
        //支付成功 跳转到订单页面
        wx.navigateTo({
          url: '/pages/order/index'
        });
          
     } catch (error) {
       await showToast({title:"支付失败"});
       console.log(error);
     }
    }

  })
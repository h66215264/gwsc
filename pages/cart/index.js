  /*
    1 获取用户的收货地址
      1 绑定点击事件
      2 获取用户对小程序所授予获取地址的权限状态 scope  authSetting scope.address
        1 假设 用户点击确定 
          scope值 true 直接调用获取收货地址api
        2 假设 用户点击取消
          scope值 false
            1 诱导用户自己打开授权页面（wx.openSetting） 当用户重新给与收货地址权限时
            2 获取收货地址 
        3 假设用户从来没有调用过收货地址的api
          scope值 undefined 直接调用获取收货地址api
        4 把获取到的收货地址存入本地存储中  

    2 页面加载完毕
      1 onshow 
      2 获取本地存储中的地址数据
      3 把数据设置给data中的一个变量
    3  onShow
      回到商品详情页面 第一次添加商品时 手动添加属性
      num=1 checked=true
      1 获取缓存中的购物车数组
      2 把购物车数据填充到data中
    4 全选功能的实现
      1 onShow 获取缓存中的购物车数组
      2 根据购物车中的商品数据 所有商品都被选中 checked=true  全选按钮就被选中
    5 总价格和总数量
      1 都需要商品被选中 在计算
      2 获取购物车数组
      3 遍历
      4 判断商品是否被选中
      5 总价格+=商品单价 * 商品数量 总数量 +=商品的数量
      6 计算后的价格和数量 设置回data中即可
    6 商品的选中
      1 绑定change事件
      2 获取被修改的商品对象
      3 商品对象的选中状态取反
      4 重新填充回data中和缓存中
      5 重新计算全选 总价格 总数量  
    7 全选和反选
      1 全选复选框绑定事件 change
      2 获取data中的全选变量   allChecked
      3 取反 allChecked=！allChecked
      4 遍历购物车数组 让里面商品选中状态跟随 allChecked 改变而改变
      5 把购物车数组和allChecked重新设置回data 和缓存中
    8 商品的加减
      1 + - 按钮 绑定同一个点击事件 区分的关键 ：自定义属性
      2 传递被点击的商品id goods_id
      3 获取data中的购物车数组 来获取需要被修改的商品对象
      4 直接修改商品对象的数量 num
      5 重新设置回 data和缓存中
      6 当购物车数量=1时 用户点击 -
        1 弹窗提示（showModal） 询问用户是否删除 
        2 确定 直接删除
        3 取消 什么都不做
    9 点击结算
      1 判断有没有收货地址
      2 判断用户有没有选购商品
      3 经过以上的验证 跳转到支付页面      
   */


import {getSetting,chooseAddress,openSetting,showModal,showToast} from '../../utils/asyncWx.js'
Page({
  data:{
    address:{},
    cart:[],
    allChecked:false,
    totalPricce:0,
    totalNum:0
  },
  onShow(){
    // 获取地址数据
    const address=wx.getStorageSync("address"); 
    // 获取缓存中的购物车数据
    const cart=wx.getStorageSync("cart")||[];
    // 计算全选
    // every 数组方法 会遍历 接受一个回调函数  当每一个函数返回值都为true 那么every方法的返回值为true
    // 只要有一个回调函数返回了false 那么就不在循环执行 直接返回false
   // const allChecked=cart.length?cart.every(v=>v.checked):false;
    
    this.setData({address});
    this.setCart(cart);

  },
   //点击获取收货地址
  async handleChooseAddress(){
   /*
    //1 获取 权限状态
    wx.getSetting({
      success: (result) => {
        //2 获取权限状态 属性名很怪异时  都要使用[]来获取属性值
        const scopeAddress=result.authSetting["scope.address"];
        if(scopeAddress===true||scopeAddress==undefined){
          //直接调用获取收货地址
          wx.chooseAddress({
            success: (result1) => {
              console.log(result1)
            }
          });
        }else{
          //3 scope 值为false时  先诱导用户自己打开授权页面 
          wx.openSetting({
            success: (result2) => {
              //直接调用获取收货地址
              wx.chooseAddress({
                success: (result3) => {
                  console.log(result3)
                }
              });
            }
          });
            
        }
      },
      fail: () => {},
      complete: () => {}
    });
    */

    
    //代码优化
    /*
    //1 获取权限状态
    const res1=await getSetting();
    const scopeAddress=res1.authSetting["scope.address"];
    //2 判断权限状态
    if(scopeAddress===true||scopeAddress==undefined){
      //3 调用获取收货地址的api
      const res2=await chooseAddress();
      console.log(res2);
    }else{
      //4 诱导用户打开授权界面
      await openSetting();
      //5 调用获取地址的api
      const res2=await chooseAddress();
      console.log(res2);
    }*/

    // 代码优化
   try {
    //1 获取权限状态
      const res1=await getSetting();
      const scopeAddress=res1.authSetting["scope.address"];
    if(scopeAddress===false){
       // 诱导用户打开授权界面
       await openSetting();
    }    
    // 调用获取地址的api
      let address=await chooseAddress();
      address.all=address.provinceName+address.cityName+address.countyName+address.detailInfo;  
      wx.setStorageSync("address", address);
        
   } catch (error) {
      console.log(error);
   }
  },
  //商品的选中
  handleItemChange(e){
    //获取被修改的商品id
    const goods_id=e.currentTarget.dataset.id;
    //获取购物车数组
    let {cart}=this.data;
    //找到被修改的商品对象
    let index=cart.findIndex(v=>v.goods_id===goods_id);
    //选中状态取反
    cart[index].checked=!cart[index].checked;
    
    this.setCart(cart);
  },
  //设置购物车状态同时， 重新计算 全选 总价格总数量
  setCart(cart){
    let allChecked=true;
    //总价格 总数量
    let totalPricce=0;
    let totalNum=0;
    cart.forEach(v => {
      if(v.checked){
        totalPricce+=v.num*v.goods_price;
        totalNum+=v.num;
      }else{
        allChecked=false;
      }
    });
    //判断数组是否为空
    allChecked=cart.length!=0?allChecked:false;
    wx.setStorageSync("cart",cart);
    this.setData({
      cart,
      totalPricce,
      totalNum,
      allChecked
    })
    
  },
  // 商品全选功能
  handleItemALLCheck(){
    //获取data中的数据
    let {cart,allChecked}=this.data;
    //修改allChecked值
    allChecked=!allChecked;
    //循环修改cart数组中商品的选中状态
    cart.forEach(v=>v.checked=allChecked);
    //设置回data和缓存中
    this.setCart(cart);
  },
  // 数量加减
  async handleItemNumEdit(e){
    //获取传来过来的参数
    const {operation,id}=e.currentTarget.dataset;
    //获取购物车数组
    let {cart}=this.data;
    //找到被修改的商品对象
    let index=cart.findIndex(v=>v.goods_id===id);
    //判单是否要执行删除
    if(cart[index].num===1&&operation===-1){
      //弹窗提示
      const res=await showModal({content:"您是否要删除"});
      if (res.confirm) {
        cart.splice(index,1);
        this.setCart(cart);
       } 
    }else{
      // 修改数量
      cart[index].num+=operation;
      //设置回data和缓存中
     this.setCart(cart);
    }

  },
  //点击结算
  async handlePay(){
    //判断收货地址
    const {address,totalNum} = this.data;
    if(!address.userName){
      await showToast({title:"您还没有选择收货地址"});
      return;
    }
    // 判断有没有选购商品
    if(totalNum===0){
      await showToast({title:"您还没有选购商品"});
      return;
    }
    //跳转到支付页面
    wx.navigateTo({
      url: '/pages/pay/index'
    });
      
  }
})
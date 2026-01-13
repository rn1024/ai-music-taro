export default defineAppConfig({
  pages: [
    'pages/discovery/index',
    'pages/create/index',
    'pages/history/index',
    'pages/me/index',
    'pages/redeem/index',
    'pages/generating/index',
    'pages/result/index',
    'pages/hot-samples/index'
  ],
  tabBar: {
    color: 'rgba(255,255,255,0.4)',
    selectedColor: '#fd429c',
    backgroundColor: '#0a0a0a',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/discovery/index',
        text: '发现',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/create/index',
        text: '创作',
        iconPath: 'assets/icons/create.png',
        selectedIconPath: 'assets/icons/create-active.png'
      },
      {
        pagePath: 'pages/history/index',
        text: '历史',
        iconPath: 'assets/icons/history.png',
        selectedIconPath: 'assets/icons/history-active.png'
      },
      {
        pagePath: 'pages/me/index',
        text: '我的',
        iconPath: 'assets/icons/me.png',
        selectedIconPath: 'assets/icons/me-active.png'
      }
    ]
  },
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#050505',
    navigationBarTitleText: 'AI Music',
    navigationBarTextStyle: 'white',
    backgroundColor: '#050505'
  }
})

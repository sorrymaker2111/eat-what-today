// 食物列表
const foodItems = [
  '火锅', '烤肉', '麻辣烫', '炒饭', '炸鸡', 
  '寿司', '披萨', '汉堡', '面条', '拉面', 
  '饺子', '煎饼', '盖浇饭', '沙拉', '三明治', 
  '烧烤'
];

// 转盘颜色数组，与CSS中的conic-gradient颜色完全保持一致
// 每个颜色对应1个食物，一一对应
const wheelColors = [
  '#ff6b6b',  // 0:火锅
  '#4ecdc4',  // 1:烤肉
  '#ffe66d',  // 2:麻辣烫
  '#fd79a8',  // 3:炒饭
  '#a29bfe',  // 4:炸鸡
  '#55efc4',  // 5:寿司
  '#fdcb6e',  // 6:披萨
  '#74b9ff',  // 7:汉堡
  '#ff7675',  // 8:面条
  '#00cec9',  // 9:拉面
  '#ffeaa7',  // 10:饺子
  '#fab1a0',  // 11:煎饼
  '#81ecec',  // 12:盖浇饭
  '#b2bec3',  // 13:沙拉
  '#e17055',  // 14:三明治
  '#6c5ce7'   // 15:烧烤
];

// 创建Vue应用
const app = Vue.createApp({
  data() {
    return {
      isSpinning: false,
      selectedFood: '',
      showResult: false,
      foodItems: foodItems,
      currentRotation: 0, // 当前转盘旋转角度
      selectedIndex: -1, // 当前选中的食物索引
      testMode: false,  // 测试模式
      showFireworks: false, // 控制烟花显示
      fireworksTimer: null, // 存储烟花计时器
      fireworks: null // 存储烟花实例
    };
  },
  mounted() {
    // 当组件挂载完成后，初始化烟花实例
    this.initFireworks();
  },
  computed: {
    // 为每个食物计算角度和样式
    foodItemsWithAngles() {
      const anglePer = 360 / this.foodItems.length;
      const radius = 110; // 距离中心的半径
      
      return this.foodItems.map((item, index) => {
        // 计算每个扇区的中心角度
        const centerAngle = index * anglePer + (anglePer / 2);
        
        return {
          name: item,
          angle: centerAngle,
          style: {
            position: 'absolute',
            left: '50%',
            top: '50%',
            // 改进：使文字完全沿着径向方向摆放，修正不同角度的文字方向
            transform: `rotate(${centerAngle}deg) translateY(-${radius}px) rotate(-${centerAngle}deg)`,
            transformOrigin: 'center bottom',
            width: 'auto',
            maxWidth: '70px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'center'
          }
        };
      });
    }
  },
  methods: {
    // 初始化烟花实例
    initFireworks() {
      // 获取烟花容器
      const container = document.getElementById('fireworks-container');
      
      if (!container || typeof Fireworks !== 'function') return;
      
      // 创建烟花实例
      this.fireworks = new Fireworks(container, {
        autoresize: true,
        opacity: 0.5,
        acceleration: 1.05,
        friction: 0.97,
        gravity: 1.5,
        particles: 150,
        traceLength: 3,
        traceSpeed: 10,
        explosion: 5,
        intensity: 30,
        flickering: 50,
        lineStyle: 'round',
        hue: {
          min: 0,
          max: 360
        },
        delay: {
          min: 30,
          max: 60
        },
        rocketsPoint: {
          min: 0,
          max: 100
        },
        lineWidth: {
          explosion: {
            min: 1,
            max: 3
          },
          trace: {
            min: 1,
            max: 2
          }
        },
        brightness: {
          min: 50,
          max: 80
        },
        decay: {
          min: 0.015,
          max: 0.03
        },
        mouse: {
          click: false,
          move: false,
          max: 1
        }
      });
      
      // 默认不启动烟花
      this.fireworks.stop();
    },
    
    // 获取食物对应的颜色
    getFoodColor(index) {
      // 确保颜色数组与食物数组长度一致
      return wheelColors[index % wheelColors.length];
    },
    
    // 开始播放烟花动画 - 使用fireworks.js库
    playFireworks() {
      // 显示烟花容器
      this.showFireworks = true;
      
      // 如果烟花实例存在则启动烟花
      if (this.fireworks) {
        // 启动烟花
        this.fireworks.start();
      }
      
      // 清除之前的计时器
      if (this.fireworksTimer) {
        clearTimeout(this.fireworksTimer);
      }
      
      // 设置烟花持续时间
      this.fireworksTimer = setTimeout(() => {
        // 停止烟花
        if (this.fireworks) {
          this.fireworks.stop();
        }
        
        // 隐藏烟花容器
        this.showFireworks = false;
      }, 7000); // 烟花显示7秒后消失
    },
    
    // 旋转转盘的方法 - 全新实现
    spinWheel() {
      if (this.isSpinning) return;
      
      this.showResult = false;
      this.isSpinning = true;
      this.selectedIndex = -1; // 重置选中状态
      this.showFireworks = false; // 重置烟花状态
      
      // 如果烟花实例存在，先停止烟花
      if (this.fireworks) {
        this.fireworks.stop();
      }
      
      // ---------- 基本参数定义 ----------
      // 每个食物扇区的角度
      const sectorAngle = 360 / this.foodItems.length;
      
      // 随机选择食物索引
      const selectedFoodIndex = Math.floor(Math.random() * this.foodItems.length);
      
      // 测试模式下强制选择第一个食物（火锅）
      const finalFoodIndex = this.testMode ? 0 : selectedFoodIndex;
      
      // ---------- 旋转角度计算 ----------
      // 旋转转盘，每次旋转都需要额外的圈数确保有足够的旋转效果
      const minSpins = 5; // 最少旋转5圈
      const maxSpins = 8; // 最多旋转8圈
      const extraSpins = minSpins + Math.floor(Math.random() * (maxSpins - minSpins + 1));
      
      // 计算目标食物的角度位置
      const targetFoodStartAngle = finalFoodIndex * sectorAngle;
      
      // 随机偏移，确保指针不总是指向扇区边界
      // 将偏移控制在扇区角度的10%-90%之间
      const offsetPercent = 0.1 + Math.random() * 0.8;
      const randomOffset = parseFloat((sectorAngle * offsetPercent).toFixed(1));
      
      // 最终指针指向的角度位置
      const targetAngle = targetFoodStartAngle + randomOffset;
      
      // 为了让指针指向目标角度，转盘需要顺时针旋转的角度
      // 这里使用360-targetAngle，因为转盘顺时针旋转相当于食物逆时针移动
      const angleToTarget = 360 - targetAngle;
      
      // 考虑当前转盘的旋转状态
      // 1. 将当前旋转角度模360，得到当前的实际角度位置
      // 2. 计算从当前位置到目标位置需要旋转的角度
      const currentAngleModulo = this.currentRotation % 360;
      
      // 计算从当前位置顺时针旋转到目标位置需要的最短角度
      // 这确保了每次旋转都是基于当前状态的最短路径
      let angleFromCurrent = angleToTarget - currentAngleModulo;
      
      // 确保始终是顺时针旋转，如果计算结果为负值，则加上360度
      if (angleFromCurrent < 0) {
        angleFromCurrent += 360;
      }
      
      // 添加额外的整圈旋转
      const totalRotation = angleFromCurrent + (extraSpins * 360);
      
      // 计算新的绝对旋转角度
      const newRotation = this.currentRotation + totalRotation;
      
      // ---------- 执行旋转 ----------
      // 将旋转角度设置到CSS变量
      document.documentElement.style.setProperty('--rotate-degree', `${newRotation}deg`);
      
      // 更新当前转盘角度状态
      this.currentRotation = newRotation;
      
      // 测试模式下输出详细信息
      if (this.testMode) {
        console.log(`选中食物索引: ${finalFoodIndex}, 食物: ${this.foodItems[finalFoodIndex]}`);
        console.log(`目标食物起始角度: ${targetFoodStartAngle}度`);
        console.log(`随机偏移百分比: ${offsetPercent.toFixed(2)}`);
        console.log(`随机角度偏移: ${randomOffset}度`);
        console.log(`最终目标角度: ${targetAngle}度`);
        console.log(`需要旋转到的角度: ${angleToTarget}度`);
        console.log(`当前转盘角度: ${currentAngleModulo}度`);
        console.log(`从当前位置旋转角度: ${angleFromCurrent}度`);
        console.log(`额外旋转圈数: ${extraSpins}圈`);
        console.log(`总旋转角度: ${totalRotation}度`);
        console.log(`新的绝对旋转角度: ${newRotation}度`);
      }
      
      // ---------- 设置结果 ----------
      // 确保在转盘开始旋转后设置选中的食物
      setTimeout(() => {
        // 保存选中的食物
        this.selectedFood = this.foodItems[finalFoodIndex];
        
        // 等待动画结束后显示结果
        setTimeout(() => {
          this.isSpinning = false;
          this.showResult = true;
          this.selectedIndex = finalFoodIndex; // 设置选中的索引，用于高亮显示
          
          // 播放烟花动画
          this.playFireworks();
        }, 4000); // 与CSS中的transition时间匹配
      }, 100);
    }
  }
});

// 挂载Vue应用
app.mount('#app'); 
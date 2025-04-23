// 默认食物列表 - 作为初始值和重置时使用
const defaultFoodItems = [
  '火锅', '烤肉', '麻辣烫', '炒饭', '炸鸡', 
  '寿司', '披萨', '汉堡', '面条', '拉面', 
  '饺子', '煎饼', '盖浇饭', '沙拉', '三明治', 
  '烧烤'
];

// 获取存储的食物列表或使用默认值
const getSavedFoodItems = () => {
  const savedItems = localStorage.getItem('foodItems');
  return savedItems ? JSON.parse(savedItems) : [...defaultFoodItems];
};

// 食物列表
const foodItems = getSavedFoodItems();

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
      defaultFoodItems: defaultFoodItems, // 添加默认食物列表引用
      currentRotation: 0, // 当前转盘旋转角度
      selectedIndex: -1, // 当前选中的食物索引
      testMode: false,  // 测试模式
      showFireworks: false, // 控制烟花显示
      fireworksTimer: null, // 存储烟花计时器
      leftFireworksCanvas: null, // 存储左侧烟花Canvas元素
      rightFireworksCanvas: null, // 存储右侧烟花Canvas元素
      leftContext: null, // 存储左侧烟花Canvas上下文
      rightContext: null, // 存储右侧烟花Canvas上下文
      leftFireworks: [], // 左侧烟花数组
      leftParticles: [], // 左侧粒子数组
      rightFireworks: [], // 右侧烟花数组
      rightParticles: [], // 右侧粒子数组
      animationId: null, // 动画ID
      isEditMode: false, // 是否处于编辑模式
      tempFoodItems: [] // 临时存储编辑中的食物列表
    };
  },
  mounted() {
    // 当组件挂载完成后，初始化烟花实例
    this.initFireworks();
    
    // 从localStorage加载保存的食物列表
    this.loadSavedFoods();
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
    // 切换编辑模式
    toggleEditMode() {
      if (!this.isEditMode) {
        // 进入编辑模式前，保存当前食物列表的副本
        this.tempFoodItems = [...this.foodItems];
        this.isEditMode = true;
      } else {
        // 离开编辑模式，恢复到编辑前的状态（如果未保存）
        this.isEditMode = false;
      }
    },
    
    // 更新某个食物项
    updateFood(index, newValue) {
      // 直接修改foodItems中的对应项，不再自动填充默认值
      this.$set(this.foodItems, index, newValue);
    },
    
    // 重置单个食物到默认值
    resetFood(index) {
      this.$set(this.foodItems, index, this.defaultFoodItems[index]);
    },
    
    // 重置所有食物
    resetAllFoods() {
      if (confirm('确定要重置所有食物到默认值吗？')) {
        // 复制默认食物列表
        this.foodItems = [...this.defaultFoodItems];
        
        // 保存更改但不显示保存成功提示
        this.saveChangesQuietly();
      }
    },
    
    // 保存更改但不显示提示
    saveChangesQuietly() {
      // 在保存前检查并处理空值
      for (let i = 0; i < this.foodItems.length; i++) {
        if (!this.foodItems[i] || this.foodItems[i].trim() === '') {
          // 如果为空，则使用默认值
          this.$set(this.foodItems, i, `食物${i + 1}`);
        }
      }
      
      // 将当前食物列表保存到localStorage
      localStorage.setItem('foodItems', JSON.stringify(this.foodItems));
      
      // 退出编辑模式
      this.isEditMode = false;
    },
    
    // 保存更改
    saveChanges() {
      // 调用安静保存方法
      this.saveChangesQuietly();
      
      // 提示保存成功
      alert('食物列表已保存！');
    },
    
    // 加载保存的食物列表
    loadSavedFoods() {
      const savedItems = localStorage.getItem('foodItems');
      if (savedItems) {
        try {
          const parsed = JSON.parse(savedItems);
          if (Array.isArray(parsed) && parsed.length === this.defaultFoodItems.length) {
            this.foodItems = parsed;
          }
        } catch (e) {
          console.error('加载保存的食物列表失败:', e);
        }
      }
    },
    
    // 初始化烟花Canvas
    initFireworks() {
      // 获取烟花容器
      const container = document.getElementById('fireworks-container');
      if (!container) {
        console.error('找不到烟花容器！');
        return;
      }
      
      // 清空容器
      container.innerHTML = '';
      
      // 创建左侧烟花Canvas
      this.leftFireworksCanvas = document.createElement('canvas');
      this.leftFireworksCanvas.className = 'side-fireworks left-fireworks';
      this.leftFireworksCanvas.width = window.innerWidth / 4; // 屏幕宽度的1/4
      this.leftFireworksCanvas.height = window.innerHeight;
      this.leftFireworksCanvas.style.position = 'absolute';
      this.leftFireworksCanvas.style.left = '0';
      this.leftFireworksCanvas.style.top = '0';
      
      // 创建右侧烟花Canvas
      this.rightFireworksCanvas = document.createElement('canvas');
      this.rightFireworksCanvas.className = 'side-fireworks right-fireworks';
      this.rightFireworksCanvas.width = window.innerWidth / 4; // 屏幕宽度的1/4
      this.rightFireworksCanvas.height = window.innerHeight;
      this.rightFireworksCanvas.style.position = 'absolute';
      this.rightFireworksCanvas.style.right = '0';
      this.rightFireworksCanvas.style.top = '0';
      
      // 将Canvas添加到容器中
      container.appendChild(this.leftFireworksCanvas);
      container.appendChild(this.rightFireworksCanvas);
      
      // 获取Canvas上下文
      this.leftContext = this.leftFireworksCanvas.getContext('2d', { alpha: true });
      this.rightContext = this.rightFireworksCanvas.getContext('2d', { alpha: true });
      
      // 确保使用alpha合成
      this.leftContext.globalCompositeOperation = 'lighter';
      this.rightContext.globalCompositeOperation = 'lighter';
      
      // 监听窗口大小变化
      window.addEventListener('resize', () => {
        this.leftFireworksCanvas.width = window.innerWidth / 4;
        this.leftFireworksCanvas.height = window.innerHeight;
        this.leftContext.globalCompositeOperation = 'lighter';
        
        this.rightFireworksCanvas.width = window.innerWidth / 4;
        this.rightFireworksCanvas.height = window.innerHeight;
        this.rightContext.globalCompositeOperation = 'lighter';
      });
      
      console.log('两侧烟花Canvas初始化成功！');
    },
    
    // 获取食物对应的颜色
    getFoodColor(index) {
      // 确保颜色数组与食物数组长度一致
      return wheelColors[index % wheelColors.length];
    },
    
    // 开始播放烟花动画 - 使用Canvas实现
    playFireworks() {
      console.log('开始播放烟花动画...');
      
      // 显示烟花容器
      this.showFireworks = true;
      
      // 清除之前的计时器和动画
      if (this.fireworksTimer) {
        clearTimeout(this.fireworksTimer);
      }
      
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      
      // 清空烟花和粒子数组
      this.leftFireworks = [];
      this.leftParticles = [];
      this.rightFireworks = [];
      this.rightParticles = [];
      
      // 创建初始烟花
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          this.createFirework('left');
          this.createFirework('right');
        }, i * 300); // 每300ms创建一对烟花
      }
      
      // 开始动画循环
      this.animateFireworks();
      
      // 设置烟花持续时间
      this.fireworksTimer = setTimeout(() => {
        // 停止动画
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
        
        // 隐藏烟花容器
        this.showFireworks = false;
      }, 7000); // 烟花显示7秒后消失
    },
    
    // 创建一个烟花
    createFirework(side) {
      const canvas = side === 'left' ? this.leftFireworksCanvas : this.rightFireworksCanvas;
      const fireworksArray = side === 'left' ? this.leftFireworks : this.rightFireworks;
      
      // 随机位置和颜色
      const x = Math.random() * canvas.width;
      const y = canvas.height;
      const targetX = Math.random() * canvas.width;
      const targetY = canvas.height * (0.2 + Math.random() * 0.5); // 在屏幕20%-70%的高度
      
      // 明亮的颜色
      const hue = Math.random() * 360;
      const color = `hsl(${hue}, 100%, 60%)`; // 增加亮度
      const trailColor = `hsl(${hue}, 100%, 80%)`; // 尾迹颜色更亮
      
      // 添加到烟花数组
      fireworksArray.push({
        x, y, targetX, targetY, color, trailColor,
        velocity: {
          x: (targetX - x) * 0.01,
          y: (targetY - y) * 0.01 - 2
        },
        radius: 3, // 增大半径使其更明显
        alpha: 1,
        // 添加尾迹数组
        trail: []
      });
    },
    
    // 创建爆炸粒子
    createParticles(x, y, hue, side) {
      const particlesArray = side === 'left' ? this.leftParticles : this.rightParticles;
      const particleCount = 40 + Math.floor(Math.random() * 30); // 增加粒子数量
      
      // 使用类似的色调但有变化的颜色
      for (let i = 0; i < particleCount; i++) {
        // 随机角度和速度
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        
        // 在基础色调上随机变化
        const colorHue = hue + Math.random() * 30 - 15;
        const saturation = 90 + Math.random() * 10; // 90%-100%
        const lightness = 50 + Math.random() * 20; // 50%-70%
        
        const color = `hsl(${colorHue}, ${saturation}%, ${lightness}%)`;
        
        particlesArray.push({
          x, y, 
          color,
          velocity: {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
          },
          radius: 2 + Math.random() * 1.5, // 增大粒子尺寸
          alpha: 1,
          // 添加尾迹数组
          trail: [],
          // 添加闪烁效果
          flicker: Math.random() > 0.5,
          flickerRate: 0.05 + Math.random() * 0.1
        });
      }
    },
    
    // 动画循环
    animateFireworks() {
      // 清除左侧画布 - 使用完全透明的背景
      this.leftContext.clearRect(0, 0, this.leftFireworksCanvas.width, this.leftFireworksCanvas.height);
      
      // 清除右侧画布 - 使用完全透明的背景
      this.rightContext.clearRect(0, 0, this.rightFireworksCanvas.width, this.rightFireworksCanvas.height);
      
      // 更新和绘制左侧烟花
      this.updateFireworks(this.leftFireworks, this.leftParticles, this.leftContext, 'left');
      
      // 更新和绘制右侧烟花
      this.updateFireworks(this.rightFireworks, this.rightParticles, this.rightContext, 'right');
      
      // 继续动画循环
      this.animationId = requestAnimationFrame(() => this.animateFireworks());
    },
    
    // 更新和绘制烟花
    updateFireworks(fireworks, particles, context, side) {
      // 更新和绘制烟花
      for (let i = 0; i < fireworks.length; i++) {
        const firework = fireworks[i];
        
        // 保存旧位置到尾迹数组
        firework.trail.push({
          x: firework.x,
          y: firework.y,
          alpha: 1
        });
        
        // 限制尾迹长度
        if (firework.trail.length > 5) {
          firework.trail.shift();
        }
        
        // 更新位置
        firework.x += firework.velocity.x;
        firework.y += firework.velocity.y;
        
        // 添加重力
        firework.velocity.y += 0.05;
        
        // 绘制尾迹
        for (let j = 0; j < firework.trail.length; j++) {
          const trailPoint = firework.trail[j];
          const trailAlpha = trailPoint.alpha * (j / firework.trail.length);
          
          context.beginPath();
          context.arc(trailPoint.x, trailPoint.y, firework.radius * 0.7, 0, Math.PI * 2);
          context.fillStyle = firework.trailColor.replace(')', `, ${trailAlpha})`).replace('hsl', 'hsla');
          context.fill();
          
          // 随时间减少透明度
          trailPoint.alpha *= 0.8;
        }
        
        // 绘制烟花
        context.beginPath();
        context.arc(firework.x, firework.y, firework.radius, 0, Math.PI * 2);
        context.fillStyle = firework.color;
        context.fill();
        
        // 检查是否到达目标位置
        if (firework.velocity.y >= 0) {
          // 获取色调值
          const hue = parseInt(firework.color.match(/\d+/)[0]);
          
          // 创建爆炸粒子
          this.createParticles(firework.x, firework.y, hue, side);
          
          // 从数组中移除烟花
          fireworks.splice(i, 1);
          i--;
          
          // 随机创建新的烟花
          if (Math.random() < 0.3) {
            this.createFirework(side);
          }
        }
      }
      
      // 更新和绘制粒子
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        
        // 保存旧位置到尾迹数组
        particle.trail.push({
          x: particle.x,
          y: particle.y,
          alpha: particle.alpha * 0.7
        });
        
        // 限制尾迹长度
        if (particle.trail.length > 3) {
          particle.trail.shift();
        }
        
        // 更新位置
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        
        // 添加重力和阻力
        particle.velocity.y += 0.1;
        particle.velocity.x *= 0.99;
        particle.velocity.y *= 0.99;
        
        // 减小透明度和半径
        particle.alpha -= 0.02; // 加快消失速度
        particle.radius *= 0.97;
        
        // 处理闪烁效果
        if (particle.flicker) {
          particle.alpha = Math.max(0, particle.alpha * (0.9 + Math.random() * 0.2));
        }
        
        // 绘制尾迹
        for (let j = 0; j < particle.trail.length; j++) {
          const trailPoint = particle.trail[j];
          const trailAlpha = trailPoint.alpha * (j / particle.trail.length);
          
          if (trailAlpha > 0.01) {
            context.beginPath();
            context.arc(trailPoint.x, trailPoint.y, particle.radius * 0.6, 0, Math.PI * 2);
            context.fillStyle = particle.color.replace(')', `, ${trailAlpha})`).replace('hsl', 'hsla');
            context.fill();
          }
        }
        
        // 绘制粒子
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.color.replace(')', `, ${particle.alpha})`).replace('hsl', 'hsla');
        context.fill();
        
        // 如果粒子消失，从数组中移除
        if (particle.alpha <= 0.01 || particle.radius <= 0.1) {
          particles.splice(i, 1);
          i--;
        }
      }
    },
    
    // hexToRgb方法
    hexToRgb(hex) {
      // 处理hsl格式的颜色
      if (hex.startsWith('hsl')) {
        return '255, 255, 255'; // 简化处理，返回白色
      }
      
      // 将#去掉
      hex = hex.replace('#', '');
      
      // 处理简写的hex
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      return `${r}, ${g}, ${b}`;
    },
    
    // 旋转转盘的方法 - 保持不变
    spinWheel() {
      if (this.isSpinning) return;
      
      this.showResult = false;
      this.isSpinning = true;
      this.selectedIndex = -1; // 重置选中状态
      this.showFireworks = false; // 重置烟花状态
      
      // 停止任何现有的烟花动画
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
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
          
          console.log('转盘旋转结束，准备显示烟花...');
          // 播放烟花动画
          this.playFireworks();
        }, 4000); // 与CSS中的transition时间匹配
      }, 100);
    }
  }
});

// Vue 3的全局API改变，需要添加一个对$set的替代实现
app.config.globalProperties.$set = function(obj, key, value) {
  // 由于Vue 3的响应式系统不再需要$set，直接赋值即可
  if (Array.isArray(obj)) {
    obj.splice(key, 1, value);
  } else {
    obj[key] = value;
  }
};

// 挂载Vue应用
app.mount('#app');
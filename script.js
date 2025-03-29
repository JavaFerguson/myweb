// 获取DOM元素
const newTaskInput = document.getElementById('new-task');
const addTaskBtn = document.getElementById('add-task');
const clearAllBtn = document.getElementById('clear-all');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');// 获取所有类名为filter-btn的元素
const currentDateEl = document.getElementById('current-date');
const totalCountEl = document.getElementById('total-count');
const completedCountEl = document.getElementById('completed-count');
const activeCountEl = document.getElementById('active-count');

// 任务数组
// 这段代码的作用是从浏览器的 localStorage 中读取任务列表数据，并将其解析为 JavaScript 数组。
// 如果 localStorage 中没有数据，则使用空数组 [] 作为默认值。
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 初始化应用
function init() {
    // 设置当前日期
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    currentDateEl.textContent += now.toLocaleDateString('zh-CN', options);


    // 渲染任务列表
    renderTaskList();

    // 更新统计
    updateStats();

    // 添加事件监听器
    addEventListeners();
}

// 添加事件监听器
function addEventListeners() {
    // 添加任务
    // 为任务添加功能绑定了两个事件监听器：​点击按钮和按回车键
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // 清空所有任务
    clearAllBtn.addEventListener('click', clearAllTasks);

    // 过滤器按钮
    // 这段代码确实主要是操作按钮的交互逻辑，但它与CSS紧密相关的原因在于 ​通过CSS类（active）来控制按钮的视觉状态。
    // 点击按钮时切换active类并过滤任务
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 重置所有按钮状态
            filterBtns.forEach(b => b.classList.remove('active'));
            // 设置当前按钮为选中状态
            btn.classList.add('active');
            // 过滤任务
            renderTaskList(btn.dataset.filter);
        });
    });
}

// 添加新任务
function addTask() {
    // 获取输入框内容并去除首尾空格
    const taskText = newTaskInput.value.trim();
    // 检查内容是否为空
    if (taskText === '') return;
    // 创建新任务对象
    const newTask = {
        id: Date.now(),                 // 使用时间戳作为唯一ID
        text: taskText,                 // 任务文本
        completed: false,               // 默认未完成
        createdAt: new Date().toISOString() // 创建时间（ISO格式）
    };

    tasks.push(newTask); // 将新任务添加到任务数组中
    saveTasks();         // 保存任务到本地存储
    renderTaskList();    // 重新渲染任务列表
    updateStats();       // 更新统计信息

    // 清空输入框
    newTaskInput.value = '';   // 清空输入框
    newTaskInput.focus();      // 输入框获取焦点
}

// 根据不同的过滤条件渲染任务列表
function renderTaskList(filter = 'all') {   // filter = 'all' 作为函数参数的默认值，可以简化后续 switch 的逻辑处理。
    taskList.innerHTML = '';

    let filteredTasks = [];  // 用于存储过滤后的任务

    // 根据不同的过滤条件，过滤出对应的任务
    switch (filter) {
        case 'active':
            filteredTasks = tasks.filter(task => !task.completed); // 过滤未完成的任务
            break;
        case 'completed':
            filteredTasks = tasks.filter(task => task.completed);  // 过滤已完成的任务
            break;
        default:
            filteredTasks = [...tasks];  // 相当于filteredTasks = tasks.slice(); 创建新数组（不修改原数组）
    }

    // 如果过滤后的任务为空，则显示提示信息
    if (filteredTasks.length === 0) {
        taskList.innerHTML = '<p class="no-tasks">😴暂无任务</p>';
        return;
    }


    // ​动态生成任务列表的核心逻辑
    // 遍历过滤后的任务列表，为每个任务创建一个列表项元素（DOM元素）
    filteredTasks.forEach(task => {
        // 创建一个新的列表项元素
        const taskItem = document.createElement('li');
        // 设置列表项的类名，根据任务是否完成来决定是否添加 'completed' 类
        taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
        // 将任务 ID 存储在 DOM 元素的 data-id 属性中，等效于：taskItem.setAttribute('data-id', task.id)
        taskItem.dataset.id = task.id;
        // 设置列表项的 HTML 内容，包括复选框、任务文本和删除按钮
        // 复选框是否选中取决于任务是否完成，使用 ${} 插值语法来动态设置属性和文本内容
        taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text}</span>
            <button class="task-delete">删除</button>
        `;
        // 将创建的列表项添加到任务列表中
        taskList.appendChild(taskItem);
    });

    // 添加任务项事件监听器
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTaskStatus);
    }); 

    document.querySelectorAll('.task-delete').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    }); 
}

// 切换任务状态
function toggleTaskStatus(e) {
    // 获取触发事件元素的最近的父级元素中带有.data-id属性的元素的id值
    const taskId = parseInt(e.target.closest('.task-item').dataset.id);
    // 根据id找到对应的任务对象
    const task = tasks.find(task => task.id === taskId);
    // 如果找到了对应的任务对象，则更新其完成状态
    if (task) {
        task.completed = e.target.checked;  // 将任务的完成状态更新为触发事件元素的checked值
        saveTasks();
        renderTaskList(document.querySelector('.filter-btn.active').dataset.filter);
        updateStats();
    }
}

// 删除任务
function deleteTask(e) {
    // 先获取要删除的任务元素和ID
    const taskItem = e.target.closest('.task-item');
    const taskId = parseInt(taskItem.dataset.id);
    
    // 显示确认对话框
    const isConfirmed = confirm('您确定要删除这个任务吗？');
    
    // 只有用户确认后才执行删除
    if (isConfirmed) {
        tasks = tasks.filter(task => task.id !== taskId); 
        saveTasks();
        renderTaskList(document.querySelector('.filter-btn.active').dataset.filter);
        updateStats();
    }
}

// 清空所有任务
function clearAllTasks() {
    // 检查是否需要终止清空操作，弹出确认对话框，用户点击"取消"返回false，加上!变成true
    if (tasks.length === 0 || !confirm('确定要删除所有任务吗？')) return;
    tasks = [];
    saveTasks();
    renderTaskList();
    updateStats();
}

// 更新统计信息
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const active = total - completed;

    totalCountEl.textContent = total;
    completedCountEl.textContent = completed;
    activeCountEl.textContent = active;
}

// 保存任务到本地存储
function saveTasks() {
    // 使用JSON.stringify()将任务数组转换为字符串
    localStorage.setItem('tasks', JSON.stringify(tasks)); 
}

// 初始化应用
init();

const scenarios = {
  clarify: {
    chat: [
      ["user", "帮我处理一下前台的物品。"],
      ["agent", "当前指令缺少物品类型、目标位置和配送数量。请问需要配送哪些物品，送到哪里？"],
      ["user", "找两本热门科幻书，送到 1 号桌。"],
      ["agent", "需求已明确，开始检索图书、定位书架并分配机器人。"]
    ],
    steps: [
      ["Thought", "用户意图不完整，需要先澄清配送对象和目标位置。"],
      ["Action", "clarify(q='请确认物品、数量和目标桌位')"],
      ["Observation", "用户补充：两本热门科幻书，送到 1 号桌。"],
      ["Action", "call(search_books, {genre:'科幻', sort:'hot', count:2})"],
      ["Action", "call(get_target_location, {items:['book_a','book_b']})"]
    ],
    robots: [["R1", "前往 A 架"], ["R2", "待命"]]
  },
  delivery: {
    chat: [
      ["user", "找 2 本热门科幻书送到 1 号桌。"],
      ["agent", "已识别为多目标配送任务，正在计算机器人状态与最优任务分配。"]
    ],
    steps: [
      ["Action", "call(get_robots_state, {})"],
      ["Observation", "R1 空闲，R2 空闲，R3 执行中，R4 充电中。"],
      ["Action", "call(calculate_optimal_allocation, {targets:['A架','B架']})"],
      ["Thought", "基于 A* 路径代价选择总成本最低的机器人-任务匹配。"],
      ["Action", "call(send_agvs_task_workflow, {R1:'A架->1号桌', R2:'B架->1号桌'})"]
    ],
    robots: [["R1", "配送中"], ["R2", "配送中"]]
  },
  replan: {
    chat: [
      ["user", "把刚才的书改送到 2 号桌。"],
      ["agent", "检测到目标变化，结合机器人当前位置重新规划配送路径。"],
      ["agent", "R2 路径发生冲突，已通过 CBS 添加时空约束并重规划。"]
    ],
    steps: [
      ["Observation", "用户修改目标：1 号桌 -> 2 号桌。"],
      ["Action", "revise(context, new_goal='2号桌', feedback='target_changed')"],
      ["Action", "call(get_robots_state, {})"],
      ["Thought", "当前路径存在顶点冲突，需要 CBS 重新生成无冲突路径。"],
      ["Observation", "新路径已下发，任务继续执行。"]
    ],
    robots: [["R1", "改送 2 号桌"], ["R2", "避让后继续配送"]]
  }
};

const chatLog = document.querySelector("#chatLog");
const timeline = document.querySelector("#timeline");
const robotStatus = document.querySelector("#robotStatus");
const select = document.querySelector("#scenarioSelect");
const runDemo = document.querySelector("#runDemo");
const robotOne = document.querySelector(".robot-1");
const robotTwo = document.querySelector(".robot-2");

function renderScenario(name) {
  const data = scenarios[name];
  chatLog.innerHTML = data.chat
    .map(([role, text]) => `<div class="message ${role}">${text}</div>`)
    .join("");

  timeline.innerHTML = data.steps
    .map(([label, text]) => `<div class="step"><b>${label}</b>${text}</div>`)
    .join("");

  robotStatus.innerHTML = data.robots
    .map(([id, state]) => `<div class="status-line"><strong>${id}</strong><span>${state}</span></div>`)
    .join("");

  const offsets = {
    clarify: ["translate(-60px, -54px)", "translate(0, 0)"],
    delivery: ["translate(-130px, 84px)", "translate(96px, -92px)"],
    replan: ["translate(110px, 94px)", "translate(-84px, 62px)"]
  };

  robotOne.style.transform = offsets[name][0];
  robotTwo.style.transform = offsets[name][1];
}

runDemo.addEventListener("click", () => renderScenario(select.value));
select.addEventListener("change", () => renderScenario(select.value));

renderScenario("clarify");


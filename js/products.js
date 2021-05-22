const api = "https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin";
const apiPath = "finalhwww";
const uuid = "QlucHPc504QE5mumbADzXgvHuAd2";
axios.defaults.headers["Authorization"] = `${uuid}`;

const orderPageList = document.querySelector(".orderPage-list");
const sectionTitle = document.querySelector(".section-title");

let orders = [];

function init() {
  getOrderList();
}
init();

function getOrderList() {
  axios
    .get(`${api}/${apiPath}/orders`)
    .then((res) => {
      orders = res.data.orders;
      displayChart();
      displayOrderList();
    })
    .catch((err) => {
      Swal.fire({
        title: "資料讀取失敗",
        icon: "error",
        showConfirmButton: false,
        timer: 2500
      });
    });
}

function changeOrder(e) {
  let orderId = e.target.dataset.id;
  let isPaid = "";
  orders.forEach((item) => {
    if (item.id === orderId) {
      isPaid = item.paid ? "已處理" : "未處理";
    }
  });
  if (e.target.dataset.action === "paid") {
    paidOrder(orderId, isPaid);
    return;
  } else if (e.target.dataset.action === "del") {
    delOrder(orderId);
    return;
  } else if (e.target.dataset.action === "delAll") {
    delAllOrder();
    return;
  }
}

function paidOrder(orderId, isPaid) {
  let id = `${orderId}`;
  let paid = isPaid === "未處理" ? true : false;
  let data = { data: { id, paid } };
  axios
    .put(`${api}/${apiPath}/orders`, data)
    .then((res) => {
      getOrderList();
    })
    .catch((err) => {
      Swal.fire({
        title: "找不到該筆訂單，因此無法修改訂單狀態 RRR ((((；゜Д゜)))",
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
    });
}

function delOrder(orderId) {
  axios
    .delete(`${api}/${apiPath}/orders/${orderId}`)
    .then((res) => {
      Swal.fire({
        title: "已刪除",
        icon: "error",
        showConfirmButton: false,
        timer: 2500
      });
      getOrderList();
    })
    .catch((err) => {
      Swal.fire({
        title: "找不到該筆訂單，因此無法刪除 RRR ((((；゜Д゜)))",
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
    });
}

function delAllOrder() {
  axios
    .delete(`${api}/${apiPath}/orders`)
    .then((res) => {
      Swal.fire({
        title: `${res.data.message}`,
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
      getOrderList();
    })
    .catch((err) => {
      Swal.fire({
        title: "目前訂單列表沒有任何東西 RRR ((((；゜Д゜)))",
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
    });
}

function displayChart() {
  let productObj = {};
  let chartData = [];
  let columns = [];
  let revenue = 0;
  orders.forEach((order) => {
    order.products.forEach((product) => {
      productObj[product.title] = productObj[product.title] || [];
      productObj[product.title].push(product);
    });
    revenue += order.total;
  });
  Object.entries(productObj).forEach((item) => {
    let totalAmount = 0;
    item[1].forEach((item) => {
      totalAmount += item.price * item.quantity;
    });
    const revenueRatio = Math.round((totalAmount / revenue) * 100);
    chartData.push({
      title: item[0],
      revenueRatio
    });
  });
  chartData.sort((a, b) => b.revenueRatio - a.revenueRatio);
  let totalRate = 0;
  let firstData = chartData.slice(0, 3);
  firstData.forEach((item) => {
    columns.push([item.title, item.revenueRatio]);
  });
  if (chartData.length > 3) {
    let otherData = chartData.slice(3);
    otherData.forEach((item) => {
      totalRate += item.revenueRatio;
    });
    columns.push(["其他", totalRate]);
  }
  const chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: [...columns],
      type: "pie"
    },
    color: {
      pattern: ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFD"]
    }
  });
}

function displayOrderList() {
  if (orders.length > 0) {
    let list = "";
    orders.forEach((item) => {
      let productList = "";
      item.products.forEach((product) => {
        productList += `<p class="mb-0">${product.title}</p>`;
      });
      let date = new Date(item.createdAt * 1000);
      let createdTime = date.toLocaleString().split(" ")[0];
      let orderStatus = item.paid ? "已處理" : "未處理";
      let status = item.paid ? "processed" : "untreated";
      list += `
      <tr>
        <td>${item.id}</td>
        <td>
          <p class="mb-0">${item.user.name}</p>
          <p>${item.user.tel}</p>
        </td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td >${productList}</td>
        <td>${createdTime}</td>
        <td class="${status}" data-action="paid" data-id="${item.id}" style="cursor: pointer">${orderStatus}</td>
        <td class="align-middle">
          <button type="button" class="btn btn-danger btn-sm" data-action="del" data-id="${item.id}">刪除</button>
        </td>
      </tr>
    `;
    });
    orderPageList.innerHTML = `
    <a href="#" class="discardAllBtn" data-action="delAll">清除全部訂單</a>
      <div class="orderTableWrap">
        <table class="orderPage-table">
          <thead>
            <tr>
              <th>訂單編號</th>
               <th>聯絡人</th>
               <th>聯絡地址</th>
               <th>電子郵件</th>
               <th>訂單品項</th>
               <th>訂單日期</th>
               <th>訂單狀態</th>
               <th>操作</th>
              </tr>
             </thead>
             ${list}
          </table>
        </div>
      `;
  } else {
    sectionTitle.textContent = "尚未有資料";
    orderPageList.innerHTML = "";
  }
}

orderPageList.addEventListener("click", changeOrder);


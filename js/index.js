const api = "https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer";
const apiPath = "finalhwww";

const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const shoppingCartTable = document.querySelector(".shoppingCart-table");
const orderInfoForm = document.querySelector(".orderInfo-form");
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");
const orderInfoBtn = document.querySelector(".orderInfo-btn");
const inputs = document.querySelectorAll("input,select.payment");

const constraints = {
  姓名: {
    presence: {
      message: "必填"
    }
  },
  電話: {
    presence: {
      message: "必填"
    },
    length: { is: 10, message: "必須輸入10碼" }
  },
  Email: {
    presence: {
      message: "必填"
    },
    email: true,
    email: {
      message: "格式錯誤"
    }
  },
  寄送地址: {
    presence: {
      message: "必填"
    }
  }
};

let products = [];
let carts = [];
let finalTotal = 0;
let isCheck = false;

function init() {
  getProducts();
  getCarts();
}
init();

function getProducts() {
  axios
    .get(`${api}/${apiPath}/products`)
    .then((res) => {
      products = res.data.products;
      displayProducts(products);
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

function getCarts() {
  axios
    .get(`${api}/${apiPath}/carts`)
    .then((res) => {
      carts = res.data.carts;
      finalTotal = res.data.finalTotal;
      displayCartsList();
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

function addToCart(e) {
  e.preventDefault();
  if (e.target.dataset.action === "addToCart") {
    const productId = e.target.dataset.id;
    const quantity = 1;
    let checkId = [];
    carts.forEach((item) => {
      checkId.push(item.product.id);
    });
    if (checkId.indexOf(productId) >= 0) {
      Swal.fire({
        title: "商品已在購物車",
        icon: "error",
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }
    let data = { data: { productId, quantity } };
    axios.post(`${api}/${apiPath}/carts`, data).then((res) => {
      Swal.fire({
        title: "已加入購物車",
        icon: "success",
        showConfirmButton: false,
        timer: 2500
      });
      getCarts();
    });
  }
}

function changeCarts(e) {
  e.preventDefault();
  let cartId = e.target.dataset.id;
  let num = 0;
  carts.forEach((item) => {
    if (item.id === cartId) {
      num = item.quantity;
    }
  });
  if (e.target.dataset.action === "remove") {
    removeItem(cartId);
    return;
  } else if (e.target.dataset.action === "removeAll") {
    removeAll();
    return;
  } else if (e.target.dataset.action === "add") {
    num += 1;
    updateQuantity(cartId, num);
    return;
  } else if (e.target.dataset.action === "minus") {
    if (num <= 1) {
      Swal.fire({
        title: "產品數量不可為 0 RRR ((((；゜Д゜)))",
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
      return;
    } else {
      num -= 1;
      updateQuantity(cartId, num);
      return;
    }
  }
}
function updateQuantity(cartId, num) {
  let id = `${cartId}`;
  let quantity = num;
  let data = { data: { id, quantity } };
  axios
    .patch(`${api}/${apiPath}/carts`, data)
    .then((res) => {
      getCarts();
    })
    .catch((err) => {
      console.log(err.message);
    });
}

function removeItem(cartId) {
  axios
    .delete(`${api}/${apiPath}/carts/${cartId}`)
    .then((res) => {
      Swal.fire({
        title: "已刪除",
        icon: "error",
        showConfirmButton: false,
        timer: 2500
      });
      quantity = 0;
      getCarts();
    })
    .catch((err) => {
      Swal.fire({
        title: "您輸入的購物車 ID 不存在 ((((；゜Д゜)))",
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
    });
}

function removeAll() {
  axios
    .delete(`${api}/${apiPath}/carts`)
    .then((res) => {
      Swal.fire({
        title: `${res.data.message}`,
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
      quantity = 0;
      getCarts();
    })
    .catch((err) => {
      Swal.fire({
        title: "購物車內已經沒有商品了 RRR ((((；゜Д゜)))",
        icon: "error",
        showConfirmButton: false,
        timer: 2500,
        width: "800px"
      });
    });
}

function creatOrder(e) {
  e.preventDefault();
  let data = {
    data: {
      user: {
        name: customerName.value,
        tel: customerPhone.value,
        email: customerEmail.value,
        address: customerAddress.value,
        payment: tradeWay.value
      }
    }
  };
  if (carts.length <= 0) {
    Swal.fire({
      title: "購物車無商品",
      icon: "error",
      showConfirmButton: false,
      timer: 2500
    });
    return;
  } else if (!isCheck) {
    Swal.fire({
      title: "所有欄位必填",
      icon: "error",
      showConfirmButton: false,
      timer: 2500
    });
    return;
  } else if (isCheck && carts.length > 0) {
    axios.post(`${api}/${apiPath}/orders`, data).then((res) => {
      Swal.fire({
        title: "感謝訂購！",
        icon: "success",
        showConfirmButton: false,
        timer: 2500
      });
      getCarts();
    });
    orderInfoForm.reset();
    return;
  }
}

function categorySearch() {
  if (this.value !== "") {
    let filterDate = products.filter((item) => item.category === this.value);
    displayProducts(filterDate);
  } else {
    displayProducts(products);
  }
}

function filterCurrency(num) {
  const n = Number(num);
  return "$ " + n.toLocaleString();
}

function displayProducts(products) {
  let card = "";
  products.forEach((product) => {
    card += `
      <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${product.images}" alt="">
         <a href="#" id="addCardBtn" data-id="${product.id
      }" data-action="addToCart">加入購物車</a>
         <h3>${product.title}</h3>
         <del class="originPrice">${filterCurrency(product.origin_price)}</del>
          <p class="nowPrice">NT${filterCurrency(product.price)}</p>
      </li>
    `;
  });
  productWrap.innerHTML = card;
}

function displayCartsList() {
  if (carts.length > 0) {
    let list = "";
    carts.forEach((item) => {
      list += `
				<tr>
					<td>
						<div class="cardItem-title">
						<img src="${item.product.images}" alt="">
						<p>${item.product.title}</p>
						</div>
					</td>
					<td>NT$ ${filterCurrency(item.product.price)}</td>
					<td>
						<span class="material-icons minus" data-action="minus" data-id="${item.id
        }">remove</span>
						<input type="text" value="${item.quantity
        }" style="width: 30px" readonly="readonly">
						<span class="material-icons add" data-action="add" data-id="${item.id
        }">add</span>
					</td>
					<td>NT$ ${filterCurrency(item.product.price * item.quantity)}</td>
					<td class="discardBtn">
						<a class="material-icons remove" data-id="${item.id
        }" data-action="remove">clear</a>
					</td>
				</tr>
				`;
    });
    shoppingCartTable.innerHTML = `
			<tr>
				<th width="40%">品項</th>
				<th width="15%">單價</th>
				<th width="15%">數量</th>
				<th width="15%">金額</th>
				<th width="15%"></th>
       </tr>
       ${list}
       <tr>
					<td>
						 <a href="#" class="discardAllBtn" data-action="removeAll">刪除所有品項</a>
					 </td>
					 <td></td>
					 <td></td>
					 <td>
						<p>總金額</p>
					 </td>
					 <td>${filterCurrency(finalTotal)}</td>
				</tr>
				`;
  } else {
    shoppingCartTable.innerHTML = `<h4>購物車無商品</h4>`;
  }
}

productWrap.addEventListener("click", addToCart);
productSelect.addEventListener("change", categorySearch);
shoppingCartTable.addEventListener("click", changeCarts);
orderInfoBtn.addEventListener("click", creatOrder);
inputs.forEach((item) => {
  item.addEventListener("keyup", () => {
    item.nextElementSibling.textContent = "";
    let errors = validate(orderInfoForm, constraints);
    if (errors) {
      Object.keys(errors).forEach((keys) => {
        document.querySelector(`[data-message="${keys}"]`).textContent =
          errors[keys];
      });
    } else {
      isCheck = true;
    }
  });
});

import products from './produtcs.js';
import { estabelecimento, cores } from './dados.js';

// Cookie Helpers
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/`;
}

function getCookie(name) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(name) === 0) {
      return JSON.parse(cookie.substring(name.length + 1));
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

// Render Products
function renderProducts() {
  const productList = document.getElementById("products-list");
  productList.innerHTML = "";

  products.forEach((product) => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    productDiv.innerHTML = `
      <img src=${product.img} alt=${product.name}>
      <h3>${product.name} - ${product.unid}</h3>
      <p>R$ ${product.price.toFixed(2)}</p>
      <button class="add-to-cart" data-id="${product.id}">Adicionar ao Carrinho</button>
    `;
    productList.appendChild(productDiv);
  });
}

// Carrinho
function addToCart(productId) {
  const cart = loadCart();
  const product = products.find((p) => p.id === productId);

  if (product) {
    const cartItem = cart.find((item) => item.id === productId);
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
  }

  saveCart(cart);
  renderCart();
}

function saveCart(cart) {
  setCookie("cart", cart, 7);
}

function loadCart() {
  return getCookie("cart") || [];
}

function renderCart() {
  const cart = loadCart();
  const cartItems = document.getElementById("cart-items");
  const totalPrice = document.getElementById("total-price");

  cartItems.innerHTML = "";

  let total = 0;

  cart.forEach((item) => {
    const cartItem = document.createElement("li");
    cartItem.innerHTML = `${item.name} - ${item.unid} - ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`;
    cartItems.appendChild(cartItem);
    total += item.price * item.quantity;
  });

  totalPrice.innerText = total.toFixed(2);
}

function clearCart() {
  deleteCookie("cart");
  renderCart();
}

// Banner de Cookies
function handleCookieConsent() {
  const cookieConsent = getCookie("cookieConsent");
  const cookieBanner = document.getElementById("cookie-banner");

  if (!cookieConsent) {
    cookieBanner.style.display = "block";
  }

  document.getElementById("accept-cookies").addEventListener("click", () => {
    setCookie("cookieConsent", "true", 365);
    cookieBanner.style.display = "none";
  });

  document.getElementById("decline-cookies").addEventListener("click", () => {
    cookieBanner.style.display = "none";
  });
}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
  handleCookieConsent();

  document.getElementById("products-list").addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart")) {
      const productId = parseInt(e.target.getAttribute("data-id"));
      addToCart(productId);
    }
  });

  document.getElementById("clear-cart").addEventListener("click", clearCart);
});

// Modal Pedido + Confirmação com produtos
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("pedido-modal");
  const btnAbrir = document.getElementById("fazer-pedido");
  const btnFechar = document.querySelector(".close");
  const btnConfirmar = document.getElementById("confirmar-pedido");
  const btnCancelar = document.getElementById("cancelar-pedido");

  if (modal && btnAbrir && btnFechar && btnConfirmar && btnCancelar) {

    // MODIFICAÇÃO AQUI 👇
    btnAbrir.addEventListener("click", function () {
      const cartItems = loadCart();

      if (cartItems.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
      }

      const itensTexto = cartItems
        .map(item => `${item.quantity} ${item.unid} ${item.name} - R$ ${(item.quantity * item.price).toFixed(2)}`)
        .join('\n');

      const confirmar = confirm(`🛒 Seu carrinho contém:\n\n${itensTexto}\n\nDeseja finalizar o pedido?`);

      if (confirmar) {
        modal.style.display = "flex";
      }
    });

    function fecharModal() {
      modal.style.display = "none";
    }

    btnFechar.addEventListener("click", fecharModal);
    btnCancelar.addEventListener("click", fecharModal);

    window.addEventListener("click", function (event) {
      if (event.target === modal) {
        fecharModal();
      }
    });

    function isMobile() {
      return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
    }

    function getWhatsAppLink(numeroWhatsApp, mensagem) {
      const encodedMessage = encodeURIComponent(mensagem);
      return isMobile()
        ? `https://api.whatsapp.com/send/?phone=${numeroWhatsApp}&text=${encodedMessage}&type=phone_number&app_absent=0`
        : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodedMessage}`;
    }

    btnConfirmar.addEventListener("click", function () {
      let nome = document.getElementById("nome").value;
      let endereco = document.getElementById("endereco").value;
      let pagamento = document.getElementById("pagamento").value;
      let total = document.getElementById("total-price").textContent.trim();

      if (!nome || !endereco) {
        alert("Por favor, preencha todos os campos!");
        return;
      }

      let itens = [];
      document.querySelectorAll("#cart-items li").forEach((item) => {
        const itemText = item.textContent.split(" - ");
        if (itemText.length !== 4) return;

        const [name, unid, quantity, price] = itemText;
        const itemQuantity = parseInt(quantity) || 0;
        const itemPrice = parseFloat(price.replace("R$", "").trim()) || 0;
        const itemTotal = (itemPrice * itemQuantity).toFixed(2);

        itens.push(`${itemQuantity} ${unid} ${name} - R$ ${itemTotal}`);
      });

      let mensagem = `📦 *Pedido Realizado!*\n\n👤 *Nome:* ${nome}\n🏠 *Endereço:* ${endereco}\n💳 *Forma de Pagamento:* ${pagamento}\n\n🛒 *Itens:* \n- ${itens.join("\n- ")}\n\n💰 *Total:* R$ ${total}\n\nObrigado pela compra!`;

      let numeroWhatsApp = "5532984130717";
      let linkWhatsApp = getWhatsAppLink(numeroWhatsApp, mensagem);
      let fallbackLink = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

      window.open(linkWhatsApp, "_blank") || window.open(fallbackLink, "_blank");
      fecharModal();
    });

  } else {
    console.error("Erro: Um ou mais elementos do modal não foram encontrados.");
  }
});

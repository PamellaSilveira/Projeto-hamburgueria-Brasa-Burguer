
// mostra/esconde o texto ao clicar no logo
const brandLogo = document.getElementById("brandLogo");
const brandText = brandLogo.querySelector(".brand-text");

brandLogo.addEventListener("click", function (e) {
    e.preventDefault(); // impede o link de recarregar a página
    brandText.classList.toggle("show");
});


async function buscarEndereco(cep) {
    const url = `https://viacep.com.br/ws/${cep}/json/`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.erro) {
            console.log("CEP não encontrado");
            return null;
        }

        return data;
    } catch (error) {
        console.error("Erro ao buscar CEP:", error);
        return null;
    }
}

const listaPedidos = document.getElementById("listaPedidos");
const totalSpan = document.getElementById("total");
let total = 0;
let frete = 0;
let endereco;
let pedidos = [];
const tabelaFrete = {
    "Moinhos de Vento": 0,
    "Rio Branco": 5,
    "Outros": 10
}

document.getElementById("abrePedidos").addEventListener("click", () => {
    const carrinho = new bootstrap.Offcanvas(document.getElementById("carrinhoPedidos"));
    carrinho.show();
});

document.getElementById("cep").addEventListener("blur", () => {
    buscarEndereco(document.getElementById("cep").value.replaceAll("-", "")).then((resultado) => {
        if (!resultado) {
            alert("CEP não encontrado")
        } else if (resultado.uf != "RS" || resultado.localidade != "Porto Alegre") {
            alert("Endereço fora da area de entrega")
        } else {
            document.getElementById("cidade").value = resultado.localidade
            document.getElementById("bairro").value = resultado.bairro
            document.getElementById("rua").value = resultado.logradouro
        }
    })
});

document.getElementById("formEndereco").addEventListener("submit", (event) => {
    event.preventDefault();

    endereco = {
        "telefone": document.getElementById("telefone").value,
        "cep": document.getElementById("cep").value,
        "cidade": document.getElementById("cidade").value,
        "bairro": document.getElementById("bairro").value,
        "rua": document.getElementById("rua").value,
        "numero": document.getElementById("numero").value,
        "complemento": document.getElementById("complemento").value
    }
    document.getElementById("enderecoInformado").textContent = endereco.rua + " " + endereco.numero + ", " + endereco.cidade + ", " + endereco.cidade + " - RS, " + endereco.cep
    total -= frete;
    if (endereco.bairro in tabelaFrete) {
        frete = tabelaFrete[endereco.bairro]
    } else {
        frete = tabelaFrete["Outros"]
    }
    total += frete;
    document.getElementById("precoFrete").textContent = "R$ " + frete.toFixed(2);
    totalSpan.textContent = "R$ " + total.toFixed(2);
    document.getElementById("finalizarPedido").disabled = !(endereco && pedidos.length > 0);
    bootstrap.Modal.getInstance(document.getElementById('modalEndereco')).hide();
})

document.querySelectorAll(".btn-comprar").forEach(botao => {
    botao.addEventListener("click", () => {
        const nome = botao.getAttribute("data-nome");
        const preco = parseFloat(botao.getAttribute("data-preco"));

        // cria item na lista
        const item = document.createElement("li");
        item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        item.innerHTML = `${nome} <span>R$ ${preco.toFixed(2)}  <i class="bi bi-trash"></i></span>`;
        listaPedidos.appendChild(item);
        pedidos.push(nome);

        item.querySelector(".bi-trash").addEventListener("click", () => {
            listaPedidos.removeChild(item);
            total -= preco;
            if (total <= 0) {
                total = 0;
                carrinho.hide();
            }
            totalSpan.textContent = "R$ " + total.toFixed(2);
            pedidos.pop(pedidos);
        });

        // atualiza total
        total += preco;
        totalSpan.textContent = "R$ " + total.toFixed(2);
        document.getElementById("finalizarPedido").disabled = !(endereco && pedidos.length > 0);

        // abre a aba lateral
        const carrinho = new bootstrap.Offcanvas(document.getElementById("carrinhoPedidos"));
        carrinho.show();
    });
});
function finalizarPedido() {
    const telefone = '5551991985614';

    const endereco = document.getElementById("enderecoInformado").textContent;
    const valor = totalSpan.textContent;
    const texto = `Olá! Gostaria de pedir os seguintes itens:\n${pedidos.join("\n")} \nEndereço: ${endereco}\nValor: ${valor}`;
    const msgFormatada = encodeURI(texto);


    const url = `https://wa.me/${telefone}?text=${msgFormatada}`;

    window.open(url, '_blank');

    pedidos = [];
    listaPedidos.innerHTML = '';
    total = frete;
    totalSpan.textContent = "R$ " + total.toFixed(2);
    document.getElementById("finalizarPedido").disabled = true;
}

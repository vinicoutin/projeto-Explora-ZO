(function () {
    const CHAVE = "tema-explorazo";
    const raiz = document.documentElement;

    function lerSalvo() {
        try {
            return localStorage.getItem(CHAVE);
        } catch (e) {
            return null;
        }
    }

    function salvar(valor) {
        try {
            localStorage.setItem(CHAVE, valor);
        } catch (e) {}
    }

    const ehHome = /(^|\/)(index\.html)?$/.test(window.location.pathname);
    const salvo = lerSalvo();
    let escuro;

    if (salvo === "escuro") {
        escuro = true;
    } else if (salvo === "claro") {
        escuro = false;
    } else {
        escuro = ehHome;
    }

    raiz.classList.toggle("modo-escuro", escuro);

    document.addEventListener("DOMContentLoaded", function () {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.id = "botao-tema";

        const cabecalho = document.querySelector("header");
        if (cabecalho) {
            cabecalho.appendChild(botao);
        } else {
            botao.classList.add("flutuante");
            document.body.appendChild(botao);
        }

        function atualizarBotao() {
            const ativo = raiz.classList.contains("modo-escuro");
            botao.textContent = ativo ? "☀️" : "🌙";
            botao.setAttribute("aria-label", ativo ? "Ativar modo claro" : "Ativar modo escuro");
            botao.title = ativo ? "Ativar modo claro" : "Ativar modo escuro";
        }

        botao.addEventListener("click", function () {
            const ficouEscuro = raiz.classList.toggle("modo-escuro");
            salvar(ficouEscuro ? "escuro" : "claro");
            atualizarBotao();
        });

        atualizarBotao();
    });
})();
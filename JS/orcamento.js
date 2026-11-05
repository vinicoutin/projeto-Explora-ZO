document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#orcamento form");
    if (!form) return;

    const WHATSAPP = "5521934542234";
    const EMAIL = "contatosexplorazo@gmail.com";

    const campoData = document.getElementById("data");

    function hojeISO() {
        const d = new Date();
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const dia = String(d.getDate()).padStart(2, "0");
        return d.getFullYear() + "-" + mes + "-" + dia;
    }

    function formatarData(iso) {
        const [ano, mes, dia] = iso.split("-");
        return dia + "/" + mes + "/" + ano;
    }

    function mostrarErro(elemento, mensagem) {
        const pai = elemento.closest(".campo") || elemento.closest("fieldset");
        let aviso = pai.querySelector(".erro");
        if (!aviso) {
            aviso = document.createElement("span");
            aviso.className = "erro";
            aviso.setAttribute("role", "alert");
            pai.appendChild(aviso);
        }
        aviso.textContent = mensagem;
    }

    function limparErro(elemento) {
        const pai = elemento.closest(".campo") || elemento.closest("fieldset");
        const aviso = pai && pai.querySelector(".erro");
        if (aviso) aviso.remove();
    }

    campoData.min = hojeISO();

    function validar() {
        let primeiroErro = null;

        function falhou(elemento, mensagem) {
            mostrarErro(elemento, mensagem);
            if (!primeiroErro) primeiroErro = elemento;
        }

        const nome = document.getElementById("nome");
        const email = document.getElementById("email");
        const destino = document.getElementById("destino");
        const quantidade = form.querySelector('input[name="quantidade"]');

        [nome, email, destino, campoData, quantidade].forEach(limparErro);

        if (nome.value.trim().length < 3) {
            falhou(nome, "Digite seu nome completo (mínimo de 3 letras).");
        }

        const padraoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!padraoEmail.test(email.value.trim())) {
            falhou(email, "Digite um e-mail válido, como nome@exemplo.com.");
        }

        if (!destino.value) {
            falhou(destino, "Escolha um destino.");
        }

        if (!campoData.value) {
            falhou(campoData, "Escolha uma data.");
        } else if (campoData.value < hojeISO()) {
            falhou(campoData, "A data não pode ser anterior a hoje.");
        }

        if (!form.querySelector('input[name="quantidade"]:checked')) {
            falhou(quantidade, "Informe a quantidade de pessoas.");
        }

        if (primeiroErro) {
            primeiroErro.focus();
            return false;
        }
        return true;
    }

    form.addEventListener("input", function (e) {
        limparErro(e.target);
    });
    form.addEventListener("change", function (e) {
        limparErro(e.target);
    });

    function coletarDados() {
        const servicos = Array.from(
            form.querySelectorAll('input[name="servicos[]"]:checked')
        ).map((c) => c.value);

        const destinoSelect = document.getElementById("destino");
        const destinoTexto =
            destinoSelect.value === "ajuda"
                ? "Quero ajuda para escolher o destino"
                : destinoSelect.value;

        return {
            nome: document.getElementById("nome").value.trim(),
            email: document.getElementById("email").value.trim(),
            destino: destinoTexto,
            data: formatarData(campoData.value),
            quantidade: form.querySelector('input[name="quantidade"]:checked').value,
            servicos: servicos.length ? servicos.join(", ") : "Nenhum serviço selecionado",
            mensagem: document.getElementById("mensagem").value.trim() || "Sem observações",
        };
    }

    function montarTexto(d) {
        return [
            "Olá! Gostaria de solicitar um orçamento no ExploraZO.",
            "",
            "Nome: " + d.nome,
            "E-mail: " + d.email,
            "Destino: " + d.destino,
            "Data: " + d.data,
            "Quantidade de pessoas: " + d.quantidade,
            "Serviços: " + d.servicos,
            "Observações: " + d.mensagem,
        ].join("\n");
    }

    function criarBotao(texto, classe, aoClicar) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = texto;
        if (classe) b.className = classe;
        b.addEventListener("click", aoClicar);
        return b;
    }

    function mostrarResumo(d) {
        const antigo = document.getElementById("resumo");
        if (antigo) antigo.remove();

        const caixa = document.createElement("div");
        caixa.id = "resumo";

        const titulo = document.createElement("h3");
        titulo.textContent = "Confira seu pedido";
        caixa.appendChild(titulo);

        const itens = [
            ["Nome", d.nome],
            ["E-mail", d.email],
            ["Destino", d.destino],
            ["Data", d.data],
            ["Pessoas", d.quantidade],
            ["Serviços", d.servicos],
            ["Observações", d.mensagem],
        ];

        const lista = document.createElement("dl");
        itens.forEach(function (item) {
            const dt = document.createElement("dt");
            dt.textContent = item[0];
            const dd = document.createElement("dd");
            dd.textContent = item[1];
            lista.appendChild(dt);
            lista.appendChild(dd);
        });
        caixa.appendChild(lista);

        const texto = montarTexto(d);

        caixa.appendChild(
            criarBotao("Enviar por WhatsApp", "", function () {
                window.open(
                    "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto),
                    "_blank",
                    "noopener"
                );
            })
        );

        caixa.appendChild(
            criarBotao("Enviar por e-mail", "", function () {
                window.open(
                    "https://mail.google.com/mail/?view=cm&fs=1" +
                    "&to=" + encodeURIComponent(EMAIL) +
                    "&su=" + encodeURIComponent("Orçamento ExploraZO - " + d.destino) +
                    "&body=" + encodeURIComponent(texto),
                    "_blank",
                    "noopener"
                );
            })
        );

        caixa.appendChild(
            criarBotao("Editar pedido", "secundario", function () {
                caixa.remove();
                form.hidden = false;
                form.scrollIntoView({ behavior: "smooth" });
            })
        );

        form.hidden = true;
        form.parentNode.appendChild(caixa);
        caixa.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    form.noValidate = true;
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!validar()) return;
        mostrarResumo(coletarDados());
    });

    const detalhes = {
        "Guias de trilha": {
            valor: "Guia de trilha",
            texto: "Um guia acompanha você na trilha para tornar o passeio mais seguro e tranquilo.",
            itens: [
                "Orientação durante o percurso",
                "Dicas de segurança e equipamentos",
                "Informações sobre a trilha e a natureza local",
            ],
        },
        "Consultoria de passeios": {
            valor: "Consultoria para escolher o passeio",
            texto: "Ajuda para escolher o destino ideal de acordo com o seu perfil e o seu tempo.",
            itens: [
                "Sugestão de destinos da Zona Oeste",
                "Ajuda para montar o roteiro",
                "Indicação conforme nível de dificuldade",
            ],
        },
        "Registro fotográfico": {
            valor: "Registro fotográfico",
            texto: "Possibilidade de registrar momentos especiais durante o seu passeio.",
            itens: [
                "Fotos dos melhores pontos do passeio",
                "Registro de grupos e momentos em família",
                "Sujeito à disponibilidade dos profissionais",
            ],
        },
        "Agências de turismo": {
            valor: "Agência de turismo",
            texto: "Opções de roteiros e passeios já organizados por empresas de turismo parceiras.",
            itens: [
                "Roteiros prontos para diferentes perfis",
                "Passeios organizados em grupo",
                "Sujeito à disponibilidade dos parceiros",
            ],
        },
    };

    const fundo = document.createElement("div");
    fundo.id = "modal-servico";
    fundo.className = "modal-fundo";
    fundo.hidden = true;
    fundo.innerHTML =
        '<div class="modal-caixa" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">' +
        '<button type="button" class="modal-fechar" aria-label="Fechar">&times;</button>' +
        '<h3 id="modal-titulo"></h3>' +
        '<p id="modal-texto"></p>' +
        '<ul id="modal-itens"></ul>' +
        '<button type="button" id="modal-adicionar"></button>' +
        "</div>";
    document.body.appendChild(fundo);

    const modalTitulo = fundo.querySelector("#modal-titulo");
    const modalTexto = fundo.querySelector("#modal-texto");
    const modalItens = fundo.querySelector("#modal-itens");
    const modalAdicionar = fundo.querySelector("#modal-adicionar");
    const modalFechar = fundo.querySelector(".modal-fechar");

    let cardAtual = null;
    let checkboxAtual = null;

    function atualizarBotao() {
        modalAdicionar.textContent = checkboxAtual.checked
            ? "Remover do orçamento"
            : "Adicionar ao orçamento";
    }

    function atualizarCard(card, checkbox) {
        card.classList.toggle("selecionado", checkbox.checked);
    }

    function abrirModal(card, titulo, info, checkbox) {
        cardAtual = card;
        checkboxAtual = checkbox;

        modalTitulo.textContent = titulo;
        modalTexto.textContent = info.texto;
        modalItens.innerHTML = "";
        info.itens.forEach(function (item) {
            const li = document.createElement("li");
            li.textContent = item;
            modalItens.appendChild(li);
        });

        atualizarBotao();
        fundo.hidden = false;
        document.body.style.overflow = "hidden";
        modalFechar.focus();
    }

    function fecharModal() {
        fundo.hidden = true;
        document.body.style.overflow = "";
        if (cardAtual) cardAtual.focus();
    }

    modalFechar.addEventListener("click", fecharModal);

    fundo.addEventListener("click", function (e) {
        if (e.target === fundo) fecharModal();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !fundo.hidden) fecharModal();
    });

    modalAdicionar.addEventListener("click", function () {
        checkboxAtual.checked = !checkboxAtual.checked;
        atualizarCard(cardAtual, checkboxAtual);
        const adicionou = checkboxAtual.checked;
        fecharModal();
        if (adicionou) {
            document.getElementById("orcamento").scrollIntoView({ behavior: "smooth" });
        }
    });

    document.querySelectorAll("#experiencias .servico").forEach(function (card) {
        const titulo = card.querySelector("h3").textContent.trim();
        const info = detalhes[titulo];
        if (!info) return;

        const checkbox = form.querySelector('input[name="servicos[]"][value="' + info.valor + '"]');
        if (!checkbox) return;

        card.tabIndex = 0;
        card.setAttribute("role", "button");

        card.addEventListener("click", function () {
            abrirModal(card, titulo, info, checkbox);
        });

        card.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                card.click();
            }
        });

        checkbox.addEventListener("change", function () {
            atualizarCard(card, checkbox);
        });

        atualizarCard(card, checkbox);
    });

    const mapasDestinos = {
        "Pedra do Telégrafo": "Pedra do Telégrafo Rio de Janeiro",
        "Cachoeira do Mendanha": "Cachoeira do Mendanha Rio de Janeiro",
        "Mirante do Caeté": "Mirante do Caeté Rio de Janeiro",
    };

    const fundoDestino = document.createElement("div");
    fundoDestino.className = "modal-fundo";
    fundoDestino.hidden = true;
    fundoDestino.innerHTML =
        '<div class="modal-caixa" role="dialog" aria-modal="true" aria-labelledby="destino-titulo">' +
        '<button type="button" class="modal-fechar" aria-label="Fechar">&times;</button>' +
        '<h3 id="destino-titulo"></h3>' +
        '<img id="destino-foto" alt="">' +
        '<a id="destino-mapa" class="botao-link" target="_blank" rel="noopener noreferrer">Ver no Google Maps</a>' +
        '<button type="button" id="destino-escolher">Escolher este destino</button>' +
        "</div>";
    document.body.appendChild(fundoDestino);

    const destinoTitulo = fundoDestino.querySelector("#destino-titulo");
    const destinoFoto = fundoDestino.querySelector("#destino-foto");
    const destinoMapa = fundoDestino.querySelector("#destino-mapa");
    const destinoEscolher = fundoDestino.querySelector("#destino-escolher");
    const destinoFechar = fundoDestino.querySelector(".modal-fechar");

    let figuraAtual = null;
    let nomeAtual = "";

    function abrirDestino(figura, nome) {
        figuraAtual = figura;
        nomeAtual = nome;

        const imagem = figura.querySelector("img");
        destinoTitulo.textContent = nome;
        destinoFoto.src = imagem.src;
        destinoFoto.alt = imagem.alt;
        destinoMapa.href =
            "https://www.google.com/maps/search/?api=1&query=" +
            encodeURIComponent(mapasDestinos[nome]);

        fundoDestino.hidden = false;
        document.body.style.overflow = "hidden";
        destinoFechar.focus();
    }

    function fecharDestino() {
        fundoDestino.hidden = true;
        document.body.style.overflow = "";
        if (figuraAtual) figuraAtual.focus();
    }

    destinoFechar.addEventListener("click", fecharDestino);

    fundoDestino.addEventListener("click", function (e) {
        if (e.target === fundoDestino) fecharDestino();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && !fundoDestino.hidden) fecharDestino();
    });

    destinoEscolher.addEventListener("click", function () {
        const select = document.getElementById("destino");
        select.value = nomeAtual;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        fecharDestino();
        document.getElementById("orcamento").scrollIntoView({ behavior: "smooth" });
    });

    document.querySelectorAll("#destinos .destinos").forEach(function (figura) {
        const nome = figura.querySelector("figcaption").textContent.trim();
        if (!mapasDestinos[nome]) return;

        figura.tabIndex = 0;
        figura.setAttribute("role", "button");

        figura.addEventListener("click", function () {
            abrirDestino(figura, nome);
        });

        figura.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                figura.click();
            }
        });
    });
});
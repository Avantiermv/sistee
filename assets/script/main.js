document.addEventListener('DOMContentLoaded', () => {
        const getDb = (key) => JSON.parse(localStorage.getItem(key)) || [];
        const saveDb = (key, data) => localStorage.setItem(key, JSON.stringify(data));
        const showToast = (message, type = 'success') => {
            Toastify({
                text: message,
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                backgroundColor: type === 'success' ? 'linear-gradient(to right, #00b09b, #96c93d)' : 'linear-gradient(to right, #ff5f6d, #ffc371)',
            }).showToast();
        };

        const initialData = {
            servicos: [
                { id: 1, nome: 'Banho', preco: 50.00, icone: 'fa-shower' },
                { id: 2, nome: 'Tosa', preco: 70.00, icone: 'fa-cut' }
            ],
            carrinho: { itens: [], desconto: 0 }
        };

        // --- """"Banco de Dados"""""---
        let db = {
            clientes: getDb('clientes'),
            animais: getDb('animais'),
            funcionarios: getDb('funcionarios'),
            produtos: getDb('produtos'),
            vendas: getDb('vendas'),
            agenda: getDb('agenda'),
            servicos: initialData.servicos,
            carrinho: getDb('carrinho').itens ? getDb('carrinho') : initialData.carrinho,
        };
        
        const renderAll = () => {
            renderClientes();
            renderAnimais();
            renderServicos();
            renderFuncionarios();
            renderProdutos();
            renderEstoque();
            renderVendas();
            renderAgenda();
            renderAtendimentos();
            renderRelatorios();
        };


        const formCliente = document.getElementById('form-cliente');
        const tabelaClientes = document.getElementById('tabela-clientes');
        
        const renderClientes = (filter = '') => {
            tabelaClientes.innerHTML = '';
            const filteredClientes = db.clientes.filter(c => c.nome.toLowerCase().includes(filter.toLowerCase()));
            
            filteredClientes.forEach(cliente => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cliente.nome}</td>
                    <td>${cliente.telefone}</td>
                    <td>${cliente.email}</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" onclick="editCliente('${cliente.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCliente('${cliente.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tabelaClientes.appendChild(tr);
            });
            updateTutorSelect();
        };

        formCliente.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('cliente-id').value;
            const cliente = {
                id: id || Date.now().toString(),
                nome: document.getElementById('cliente-nome').value,
                telefone: document.getElementById('cliente-telefone').value,
                email: document.getElementById('cliente-email').value,
                endereco: document.getElementById('cliente-endereco').value,
            };

            if (id) {
                db.clientes = db.clientes.map(c => c.id === id ? cliente : c);
                showToast('Cliente atualizado com sucesso!');
            } else {
                db.clientes.push(cliente);
                showToast('Cliente salvo com sucesso!');
            }
            saveDb('clientes', db.clientes);
            formCliente.reset();
            document.getElementById('cliente-id').value = '';
            renderClientes();
        });

        window.editCliente = (id) => {
            const cliente = db.clientes.find(c => c.id === id);
            if (cliente) {
                document.getElementById('cliente-id').value = cliente.id;
                document.getElementById('cliente-nome').value = cliente.nome;
                document.getElementById('cliente-telefone').value = cliente.telefone;
                document.getElementById('cliente-email').value = cliente.email;
                document.getElementById('cliente-endereco').value = cliente.endereco;
            }
        };

        window.deleteCliente = (id) => {
            if (confirm('Tem certeza que deseja excluir este cliente?')) {
                db.clientes = db.clientes.filter(c => c.id !== id);
                db.animais = db.animais.filter(a => a.tutorId !== id); // Remove pets of deleted client
                saveDb('clientes', db.clientes);
                saveDb('animais', db.animais);
                showToast('Cliente excluído!', 'error');
                renderAll();
            }
        };
        
        document.getElementById('btn-limpar-cliente').addEventListener('click', () => {
            formCliente.reset();
            document.getElementById('cliente-id').value = '';
        });
        
        document.getElementById('busca-cliente').addEventListener('input', (e) => renderClientes(e.target.value));

        const formAnimal = document.getElementById('form-animal');
        const tabelaAnimais = document.getElementById('tabela-animais');
        const selectTutor = document.getElementById('animal-tutor');

        const updateTutorSelect = () => {
            selectTutor.innerHTML = '<option value="">Selecione um Tutor</option>';
            db.clientes.forEach(cliente => {
                const option = document.createElement('option');
                option.value = cliente.id;
                option.textContent = cliente.nome;
                selectTutor.appendChild(option);
            });
        };

        const renderAnimais = () => {
            tabelaAnimais.innerHTML = '';
            db.animais.forEach(animal => {
                const tutor = db.clientes.find(c => c.id === animal.tutorId);
                const vacinaPendente = !animal.ultimaVacina || (new Date() - new Date(animal.ultimaVacina)) / (1000 * 60 * 60 * 24) > 365;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${animal.nome}</td>
                    <td>${animal.especie}</td>
                    <td>${tutor ? tutor.nome : 'Não encontrado'}</td>
                    <td>${vacinaPendente ? '<span class="badge bg-warning text-dark">Pendente <i class="fas fa-exclamation-triangle"></i></span>' : '<span class="badge bg-success">Em dia</span>'}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteAnimal('${animal.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                `;
                tabelaAnimais.appendChild(tr);
            });
            updateAgendaAnimalSelect();
        };

        formAnimal.addEventListener('submit', (e) => {
            e.preventDefault();
            const animal = {
                id: Date.now().toString(),
                nome: document.getElementById('animal-nome').value,
                especie: document.getElementById('animal-especie').value,
                raca: document.getElementById('animal-raca').value,
                nascimento: document.getElementById('animal-nascimento').value,
                tutorId: document.getElementById('animal-tutor').value,
                ultimaVacina: document.getElementById('animal-vacina').value,
            };
            db.animais.push(animal);
            saveDb('animais', db.animais);
            showToast('Animal salvo com sucesso!');
            formAnimal.reset();
            renderAnimais();
        });

        window.deleteAnimal = (id) => {
            if (confirm('Tem certeza?')) {
                db.animais = db.animais.filter(a => a.id !== id);
                saveDb('animais', db.animais);
                showToast('Animal excluído!', 'error');
                renderAnimais();
            }
        };

        const renderServicos = () => {
            const container = document.getElementById('cards-servicos');
            container.innerHTML = '';
            db.servicos.forEach(servico => {
                container.innerHTML += `
                    <div class="col-md-3 mb-4">
                        <div class="card text-center h-100 card-service">
                            <div class="card-body">
                                <i class="fas ${servico.icone} mb-3"></i>
                                <h5 class="card-title">${servico.nome}</h5>
                                <p class="card-text fs-4 fw-bold">R$ ${servico.preco.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
        };


        const formFuncionario = document.getElementById('form-funcionario');
        const tabelaFuncionarios = document.getElementById('tabela-funcionarios');

        const renderFuncionarios = () => {
            tabelaFuncionarios.innerHTML = '';
            db.funcionarios.forEach(func => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${func.nome}</td>
                    <td>${func.cargo}</td>
                    <td>${func.telefone}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="deleteFuncionario('${func.id}')"><i class="fas fa-trash"></i></button></td>
                `;
                tabelaFuncionarios.appendChild(tr);
            });
            updateAgendaFuncionarioSelect();
        };

        formFuncionario.addEventListener('submit', (e) => {
            e.preventDefault();
            const funcionario = {
                id: Date.now().toString(),
                nome: document.getElementById('funcionario-nome').value,
                cargo: document.getElementById('funcionario-cargo').value,
                telefone: document.getElementById('funcionario-telefone').value,
            };
            db.funcionarios.push(funcionario);
            saveDb('funcionarios', db.funcionarios);
            showToast('Funcionário salvo!');
            formFuncionario.reset();
            renderFuncionarios();
        });

        window.deleteFuncionario = (id) => {
            if (confirm('Tem certeza?')) {
                db.funcionarios = db.funcionarios.filter(f => f.id !== id);
                saveDb('funcionarios', db.funcionarios);
                showToast('Funcionário excluído!', 'error');
                renderFuncionarios();
            }
        };

    
        const formProduto = document.getElementById('form-produto');
        const listaProdutos = document.getElementById('lista-produtos');

        const renderProdutos = () => {
            listaProdutos.innerHTML = '';
            db.produtos.forEach(produto => {
                listaProdutos.innerHTML += `
                    <div class="col-md-3">
                        <div class="card">
                            <img src="https://placehold.co/300x200/2ecc71/ffffff?text=${produto.nome}" class="card-img-top" alt="${produto.nome}">
                            <div class="card-body">
                                <h5 class="card-title">${produto.nome}</h5>
                                <p class="card-text">${produto.categoria}</p>
                                <p class="card-text fw-bold fs-5">R$ ${produto.preco.toFixed(2)}</p>
                                <p class="card-text text-muted">Estoque: ${produto.estoque || 0}</p>
                                <button class="btn btn-sm btn-danger" onclick="deleteProduto('${produto.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            });
            updateVendasSelects();
        };

        formProduto.addEventListener('submit', (e) => {
            e.preventDefault();
            const produto = {
                id: Date.now().toString(),
                nome: document.getElementById('produto-nome').value,
                categoria: document.getElementById('produto-categoria').value,
                preco: parseFloat(document.getElementById('produto-preco').value),
                codigo: document.getElementById('produto-codigo').value,
                estoque: 0, 
            };
            db.produtos.push(produto);
            saveDb('produtos', db.produtos);
            showToast('Produto salvo!');
            formProduto.reset();
            renderProdutos();
            renderEstoque();
        });

        window.deleteProduto = (id) => {
            if (confirm('Tem certeza?')) {
                db.produtos = db.produtos.filter(p => p.id !== id);
                saveDb('produtos', db.produtos);
                showToast('Produto excluído!', 'error');
                renderProdutos();
                renderEstoque();
            }
        };

        const tabelaEstoque = document.getElementById('tabela-estoque');

        const renderEstoque = () => {
            tabelaEstoque.innerHTML = '';
            db.produtos.forEach(produto => {
                const tr = document.createElement('tr');
                if (produto.estoque < 5) tr.classList.add('stock-low');
                tr.innerHTML = `
                    <td>${produto.nome}</td>
                    <td>${produto.categoria}</td>
                    <td class="text-center">${produto.estoque || 0}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-success" onclick="updateEstoque('${produto.id}', 1)"><i class="fas fa-plus"></i></button>
                        <button class="btn btn-sm btn-warning" onclick="updateEstoque('${produto.id}', -1)"><i class="fas fa-minus"></i></button>
                    </td>
                `;
                tabelaEstoque.appendChild(tr);
            });
        };

        window.updateEstoque = (id, amount) => {
            const produto = db.produtos.find(p => p.id === id);
            if (produto) {
                produto.estoque = (produto.estoque || 0) + amount;
                if (produto.estoque < 0) produto.estoque = 0;
                saveDb('produtos', db.produtos);
                renderEstoque();
                renderProdutos();
            }
        };

        const selectVendaServicos = document.getElementById('venda-servicos');
        const selectVendaProdutos = document.getElementById('venda-produtos');

        const updateVendasSelects = () => {
            selectVendaServicos.innerHTML = '<option value="">Selecione um serviço</option>';
            db.servicos.forEach(s => selectVendaServicos.innerHTML += `<option value="${s.id}">${s.nome} - R$ ${s.preco.toFixed(2)}</option>`);

            selectVendaProdutos.innerHTML = '<option value="">Selecione um produto</option>';
            db.produtos.forEach(p => selectVendaProdutos.innerHTML += `<option value="${p.id}">${p.nome} - R$ ${p.preco.toFixed(2)}</option>`);
        };

        const renderCarrinho = () => {
            const corpoTabela = document.getElementById('corpo-tabela-carrinho');
            corpoTabela.innerHTML = '';
            
            const carrinhoVazioEl = document.getElementById('carrinho-vazio');
            const tabelaCarrinhoEl = document.getElementById('tabela-carrinho');
            const carrinhoTotalEl = document.getElementById('carrinho-total');

            if(db.carrinho.itens.length === 0) {
                carrinhoVazioEl.style.display = 'block';
                tabelaCarrinhoEl.style.display = 'none';
                carrinhoTotalEl.style.display = 'none';
                return;
            }

            carrinhoVazioEl.style.display = 'none';
            tabelaCarrinhoEl.style.display = 'table';
            carrinhoTotalEl.style.display = 'block';

            db.carrinho.itens.forEach((item, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.nome}</td>
                    <td>R$ ${item.preco.toFixed(2)}</td>
                    <td>${item.quantidade}</td>
                    <td>R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
                    <td><button class="btn btn-sm btn-danger" onclick="removerDoCarrinho(${index})"><i class="fas fa-times"></i></button></td>
                `;
                corpoTabela.appendChild(tr);
            });

            const subtotal = db.carrinho.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
            const desconto = parseFloat(document.getElementById('carrinho-desconto').value) || 0;
            const total = subtotal * (1 - desconto / 100);

            document.getElementById('carrinho-subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
            document.getElementById('carrinho-total-final').textContent = `R$ ${total.toFixed(2)}`;
            
            saveDb('carrinho', db.carrinho);
        };

        document.getElementById('btn-add-servico-carrinho').addEventListener('click', () => {
            const servicoId = selectVendaServicos.value;
            if (!servicoId) return;
            const servico = db.servicos.find(s => s.id == servicoId);
            const item = { ...servico, quantidade: 1, tipo: 'servico' };
            db.carrinho.itens.push(item);
            renderCarrinho();
        });

        document.getElementById('btn-add-produto-carrinho').addEventListener('click', () => {
            const produtoId = selectVendaProdutos.value;
            if (!produtoId) return;
            const produto = db.produtos.find(p => p.id === produtoId);
            if (produto.estoque > 0) {
                const item = { ...produto, quantidade: 1, tipo: 'produto' };
                db.carrinho.itens.push(item);
                renderCarrinho();
            } else {
                showToast('Produto fora de estoque!', 'error');
            }
        });

        window.removerDoCarrinho = (index) => {
            db.carrinho.itens.splice(index, 1);
            renderCarrinho();
        };

        document.getElementById('carrinho-desconto').addEventListener('input', renderCarrinho);

        document.getElementById('btn-finalizar-venda').addEventListener('click', () => {
            if (db.carrinho.itens.length === 0) {
                showToast('Carrinho está vazio!', 'error');
                return;
            }

            const subtotal = db.carrinho.itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
            const desconto = parseFloat(document.getElementById('carrinho-desconto').value) || 0;
            const total = subtotal * (1 - desconto / 100);

            const venda = {
                id: Date.now().toString(),
                data: new Date().toISOString(),
                itens: db.carrinho.itens,
                subtotal,
                desconto,
                total
            };

            venda.itens.forEach(item => {
                if (item.tipo === 'produto') {
                    updateEstoque(item.id, -item.quantidade);
                }
            });

            db.vendas.push(venda);
            saveDb('vendas', db.vendas);
            
            gerarRecibo(venda);

            db.carrinho = { itens: [], desconto: 0 };
            saveDb('carrinho', db.carrinho);
            renderCarrinho();
            showToast('Venda finalizada com sucesso!');
            renderRelatorios();
        });
        
        const gerarRecibo = (venda) => {
            const receiptContent = document.getElementById('receipt-content');
            let itemsHtml = '';
            venda.itens.forEach(item => {
                itemsHtml += `
                    <tr>
                        <td>${item.nome}</td>
                        <td>${item.quantidade}</td>
                        <td>R$ ${item.preco.toFixed(2)}</td>
                        <td class="text-end">R$ ${(item.preco * item.quantidade).toFixed(2)}</td>
                    </tr>
                `;
            });

            receiptContent.innerHTML = `
                <div class="text-center mb-4">
                    <h3>PetShop System</h3>
                    <p>Recibo de Venda - #${venda.id}</p>
                    <p>Data: ${new Date(venda.data).toLocaleString('pt-BR')}</p>
                </div>
                <table class="table">
                    <thead><tr><th>Item</th><th>Qtd.</th><th>Preço Unit.</th><th class="text-end">Subtotal</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
                <hr>
                <div class="row">
                    <div class="col-6">Subtotal</div>
                    <div class="col-6 text-end">R$ ${venda.subtotal.toFixed(2)}</div>
                </div>
                <div class="row">
                    <div class="col-6">Desconto</div>
                    <div class="col-6 text-end">${venda.desconto}%</div>
                </div>
                <div class="row fs-4 fw-bold mt-2">
                    <div class="col-6">Total</div>
                    <div class="col-6 text-end">R$ ${venda.total.toFixed(2)}</div>
                </div>
            `;
            const receiptModal = new bootstrap.Modal(document.getElementById('receipt-modal'));
            receiptModal.show();
        };

        const renderVendas = () => {
            updateVendasSelects();
            renderCarrinho();
        };

        const formAgenda = document.getElementById('form-agenda');
        
        const updateAgendaSelects = () => {
            updateAgendaAnimalSelect();
            updateAgendaServicoSelect();
            updateAgendaFuncionarioSelect();
        };

        const updateAgendaAnimalSelect = () => {
            const select = document.getElementById('agenda-animal');
            select.innerHTML = '<option value="">Selecione o Animal</option>';
            db.animais.forEach(a => {
                const tutor = db.clientes.find(c => c.id === a.tutorId);
                select.innerHTML += `<option value="${a.id}">${a.nome} (${tutor.nome})</option>`;
            });
        };
        const updateAgendaServicoSelect = () => {
            const select = document.getElementById('agenda-servico');
            select.innerHTML = '<option value="">Selecione o Serviço</option>';
            db.servicos.forEach(s => select.innerHTML += `<option value="${s.id}">${s.nome}</option>`);
        };
        const updateAgendaFuncionarioSelect = () => {
            const select = document.getElementById('agenda-funcionario');
            select.innerHTML = '<option value="">Selecione o Funcionário</option>';
            db.funcionarios.forEach(f => select.innerHTML += `<option value="${f.id}">${f.nome} (${f.cargo})</option>`);
        };

        const renderAgenda = () => {
            const calendarioEl = document.getElementById('calendario-semanal');
            calendarioEl.innerHTML = '';
            const today = new Date();
            const week = [];
            for(let i=0; i<7; i++) {
                const day = new Date(today);
                day.setDate(today.getDate() + i);
                week.push(day);
            }

            document.getElementById('agenda-mes-ano').textContent = today.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

            const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            week.forEach(day => {
                const dayEl = document.createElement('div');
                dayEl.classList.add('calendar-day');
                dayEl.innerHTML = `<div class="calendar-day-header">${diasSemana[day.getDay()]} ${day.getDate()}</div>`;
                
                const agendamentosDoDia = db.agenda.filter(ag => {
                    const agDate = new Date(ag.data);
                    return agDate.getFullYear() === day.getFullYear() &&
                           agDate.getMonth() === day.getMonth() &&
                           agDate.getDate() === day.getDate();
                });

                agendamentosDoDia.forEach(ag => {
                    const animal = db.animais.find(a => a.id === ag.animalId);
                    const servico = db.servicos.find(s => s.id == ag.servicoId);
                    if(animal && servico) {
                        const agBlock = document.createElement('div');
                        agBlock.classList.add('appointment-block');
                        agBlock.innerHTML = `
                            <strong>${new Date(ag.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</strong><br>
                            ${animal.nome} - ${servico.nome}
                        `;
                        dayEl.appendChild(agBlock);
                    }
                });

                calendarioEl.appendChild(dayEl);
            });
            updateAgendaSelects();
            renderAtendimentos();
        };

        formAgenda.addEventListener('submit', (e) => {
            e.preventDefault();
            const agendamento = {
                id: Date.now().toString(),
                animalId: document.getElementById('agenda-animal').value,
                servicoId: document.getElementById('agenda-servico').value,
                funcionarioId: document.getElementById('agenda-funcionario').value,
                data: document.getElementById('agenda-data').value,
                status: 'agendado' // agendado, em-atendimento, finalizado
            };
            db.agenda.push(agendamento);
            saveDb('agenda', db.agenda);
            showToast('Agendamento realizado!');
            formAgenda.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('agendaModal'));
            modal.hide();
            renderAgenda();
        });

        
        const renderAtendimentos = () => {
            const container = document.getElementById('lista-atendimentos-dia');
            container.innerHTML = '';
            const today = new Date();
            const agendamentosHoje = db.agenda.filter(ag => {
                const agDate = new Date(ag.data);
                return agDate.getFullYear() === today.getFullYear() &&
                       agDate.getMonth() === today.getMonth() &&
                       agDate.getDate() === today.getDate() &&
                       ag.status !== 'finalizado';
            });

            if (agendamentosHoje.length === 0) {
                container.innerHTML = '<div class="alert alert-info">Nenhum atendimento pendente para hoje.</div>';
                return;
            }

            agendamentosHoje.forEach(ag => {
                const animal = db.animais.find(a => a.id === ag.animalId);
                const servico = db.servicos.find(s => s.id == ag.servicoId);
                const funcionario = db.funcionarios.find(f => f.id === ag.funcionarioId);

                const card = document.createElement('div');
                card.className = 'card mb-3';
                card.innerHTML = `
                    <div class="card-header d-flex justify-content-between">
                        <strong>${animal.nome} - ${servico.nome}</strong>
                        <span>${new Date(ag.data).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>Funcionário:</strong> ${funcionario.nome}</p>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="check-${ag.id}" ${ag.status === 'finalizado' ? 'checked' : ''}>
                            <label class="form-check-label" for="check-${ag.id}">Serviço Realizado</label>
                        </div>
                        <textarea class="form-control mt-2" placeholder="Observações..." id="obs-${ag.id}"></textarea>
                        <button class="btn btn-primary mt-2" onclick="finalizarAtendimento('${ag.id}')">Finalizar Atendimento</button>
                    </div>
                `;
                container.appendChild(card);
            });
        };

        window.finalizarAtendimento = (id) => {
            const agendamento = db.agenda.find(ag => ag.id === id);
            if(agendamento) {
                agendamento.status = 'finalizado';
                agendamento.observacoes = document.getElementById(`obs-${id}`).value;
                saveDb('agenda', db.agenda);
                showToast('Atendimento finalizado com sucesso!');
                renderAtendimentos();
            }
        };

        let faturamentoChart, servicosChart;

        const renderRelatorios = () => {
            // Faturamento Mensal
            const faturamentoData = {
                labels: [],
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: [],
                    backgroundColor: 'rgba(46, 204, 113, 0.5)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                }]
            };

            const monthlySales = {};
            for(let i=5; i>=0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
                const monthLabel = d.toLocaleString('pt-BR', { month: 'short' });
                monthlySales[monthKey] = { total: 0, label: monthLabel };
            }

            db.vendas.forEach(venda => {
                const d = new Date(venda.data);
                const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
                if(monthlySales[monthKey]) {
                    monthlySales[monthKey].total += venda.total;
                }
            });

            Object.values(monthlySales).forEach(month => {
                faturamentoData.labels.push(month.label);
                faturamentoData.datasets[0].data.push(month.total);
            });

            const ctxFaturamento = document.getElementById('grafico-faturamento').getContext('2d');
            if (faturamentoChart) faturamentoChart.destroy();
            faturamentoChart = new Chart(ctxFaturamento, { type: 'bar', data: faturamentoData });

            // Serviços mais vendidos
            const servicosCount = {};
            db.vendas.forEach(venda => {
                venda.itens.forEach(item => {
                    if (item.tipo === 'servico') {
                        servicosCount[item.nome] = (servicosCount[item.nome] || 0) + 1;
                    }
                });
            });

            const servicosData = {
                labels: Object.keys(servicosCount),
                datasets: [{
                    data: Object.values(servicosCount),
                    backgroundColor: ['#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e74c3c'],
                }]
            };

            const ctxServicos = document.getElementById('grafico-servicos').getContext('2d');
            if (servicosChart) servicosChart.destroy();
            servicosChart = new Chart(ctxServicos, { type: 'pie', data: servicosData });
        };
        
        document.getElementById('btn-exportar-pdf-clientes').addEventListener('click', () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.text("Lista de Clientes - PetShop System", 14, 16);
            
            const tableColumn = ["ID", "Nome", "Telefone", "Email"];
            const tableRows = [];

            db.clientes.forEach(cliente => {
                const clienteData = [
                    cliente.id.substring(0, 6),
                    cliente.nome,
                    cliente.telefone,
                    cliente.email
                ];
                tableRows.push(clienteData);
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 20,
            });
            
            doc.save("relatorio_clientes.pdf");
            showToast('Relatório PDF gerado!');
        });

        
        renderAll();
    });
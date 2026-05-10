/**
 * Controla as ações da tela de usuários.
 *
 * Esta classe concentra a comunicação entre os formulários, a tabela HTML e o
 * armazenamento local do navegador. Ela é responsável por cadastrar, editar,
 * listar e remover usuários, além de atualizar os indicadores da interface.
 */
class UserController {

    /**
     * Inicializa os elementos principais da tela e registra os eventos.
     *
      @param {string} formIdCreate ID do formulário de criação.
      @param {string} formIdUpdate ID do formulário de edição.
      @param {string} tableId ID do corpo da tabela de usuários.
     */
    constructor (formIdCreate, formIdUpdate, tableId){

        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    /**
     * Registra os eventos do painel de edição de usuários.
     */
    onEdit(){

        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e => {

            this.showPanelCreate();

        });

        this.formUpdateEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]")

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            if (!values) {
                btn.disabled = false;
                return false;
            }

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            result._id = userOld._id;
            result._register = userOld._register;

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if (!values.photo){ 
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save();

                    this.getTr(user, tr);

                    this.updateCount();

                    this.formUpdateEl.reset();
            
                    this.showPanelCreate();

                    btn.disabled = false;

                }, 
                (e) => {
                    console.error(e);
                    btn.disabled = false;
                }
            );

        });

    }

    /**
     * Registra o envio do formulário de criação de usuários.
     */
    onSubmit(){

        this.formEl.addEventListener("submit", event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            if (!values) {
                btn.disabled = false;
                return false;
            }

            this.getPhoto(this.formEl).then(
                (content) => {

                    values.photo = content;

                    values.save();

                    this.addLine(values);

                    this.formEl.reset();

                    btn.disabled = false;

                }, 
                (e) => {
                    console.error(e);
                    btn.disabled = false;
                }
            );
        
        });

    }

    /**
     * Lê a foto selecionada no formulário e retorna seu conteúdo em Base64.
     * Caso nenhum arquivo seja selecionado, utiliza uma imagem padrão.
     
      @param {HTMLFormElement} formEl Formulário de origem.
      @returns {Promise<string>} Caminho ou conteúdo Base64 da imagem.
     */
    getPhoto(formEl){

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {

                if (item.name === 'photo') {
                    return item;
                }

            });

            let file = elements[0].files[0];

            fileReader.onload = () => {

                resolve(fileReader.result);

            };

            fileReader.onerror = (e) => {

                reject(e);

            };

            if(file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }

        });

    }

    /**
     * Extrai e valida os campos de um formulário, retornando uma instância de User.
     *
      @param {HTMLFormElement} formEl Formulário que será processado.
      @returns {User|boolean} Usuário montado ou false em caso de validação inválida.
     */
    getValues(formEl){

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach(function(field, index){

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {

                field.parentElement.classList.add("has-error");
                isValid = false

            } else if (field.parentElement) {

                field.parentElement.classList.remove("has-error");

            }

            if (field.name === "gender") {
    
                if (field.checked) {
                    user[field.name] = field.value
                }
    
            } else if(field.name == "admin") {

                user[field.name] = field.checked;

            } else {
    
                user[field.name] = field.value
    
            }
    
        });

        if (!isValid) {
            return false;
        }
    
        return new User(
            user.name, 
            user.gender, 
            user.birth, 
            user.country, 
            user.email, 
            user.password, 
            user.photo, 
            user.admin
        );

    }

    /**
     * Carrega os usuários salvos e adiciona cada um deles à tabela.
     */
    selectAll() {
       
        let users = User.getUsersStorage();
        
        users.forEach(dataUser => {

            let user = new User();

            user.loadFromJSON(dataUser);
        
            this.addLine(user);

        })

    }

    /**
     * Adiciona uma nova linha à tabela e atualiza os contadores.
     *
      @param {User} dataUser Usuário que será exibido.
     */
    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();

    }

    /**
     * Monta ou atualiza uma linha da tabela com os dados de um usuário.
     *
      @param {User} dataUser Usuário que será renderizado.
      @param {HTMLTableRowElement|null} tr Linha existente, quando for edição.
      @returns {HTMLTableRowElement} Linha criada ou atualizada.
     */
    getTr(dataUser, tr = null) {

        if (tr === null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-xs btn-flat btn-edit">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat btn-delete">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        return tr;

    }

    /**
     * Registra os eventos dos botões de editar e excluir de uma linha da tabela.
     *
      @param {HTMLTableRowElement} tr Linha que receberá os eventos.
     */
    addEventsTr(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir este usuário?")) {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateCount();

            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {

                let field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                        case 'radio':
                            field = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "][value=" + json[name] + "]");
                            field.checked = true;
                        break;
                        case 'checkbox':
                            field.checked = json[name];
                        break;
                        default:
                            field.value = json[name];
                    }

                }

            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();

        });

    }

    /**
     * Atualiza os cards com a quantidade total de usuários e administradores.
     */
    updateCount() {

        let numberUsers = 0;
        let numberUsersAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if (user._admin) numberUsersAdmin++;

        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberUsersAdmin;

    }

    /**
     * Exibe o painel de criação e oculta o painel de edição.
     */
    showPanelCreate() {

        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";

    }

    /**
     * Exibe o painel de edição e oculta o painel de criação.
     */
    showPanelUpdate() {

        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";

    }

}

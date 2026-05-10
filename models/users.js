/**
 * Representa um usuário do sistema.
 *
 * A classe mantém os dados informados nos formulários e padroniza o formato
 * usado pelo controlador, pela tabela e pelo localStorage.
 */
class User {

    /**
     * Cria uma nova instância de usuário.
     
      @param {string} name Nome completo.
      @param {string} gender Gênero informado no formulário.
      @param {string} birth Data de nascimento.
      @param {string} country País.
      @param {string} email E-mail de acesso/contato.
      @param {string} password Senha informada.
      @param {string} photo Foto do usuário em Base64 ou caminho de imagem.
      @param {boolean} admin Indica se o usuário é administrador.
     */
    constructor (name, gender, birth, country, email, password, photo, admin){

        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();

    }

    get id() {
        return this._id;
    }

    get register() {
        return this._register;
    }

    get name() {
        return this._name;
    }

    get gender() {
        return this._gender;
    }

    get country() {
        return this._country;
    }

    get email() {
        return this._email;
    }

    get password() {
        return this._password;
    }

    get photo() {
        return this._photo;
    }

    get admin() {
        return this._admin;
    }

    set photo(value) {
        this._photo = value;
    }

    /**
     * Carrega dados vindos de um objeto JSON para a instância atual.
     
     Usado principalmente ao recuperar registros do localStorage, convertendo
     novamente o campo de cadastro para Date quando necessário.
      
      @param {Object} json Objeto com os dados do usuário.
     */
    loadFromJSON(json) {

        for (let name in json) {

            switch(name) {
                case '_register':
                    this[name] = new Date(json[name])
                break;
                default:
                    this[name] = json[name];

            }

        }

    }

    /**
     * Recupera todos os usuários gravados no localStorage.
     
     @returns {Array<Object>} Lista de usuários armazenados.
     */
    static getUsersStorage () {

        let users = [];

        if (localStorage.getItem("users")) {

            users = JSON.parse(localStorage.getItem("users"));

        }

        let usersID = parseInt(localStorage.getItem("usersID")) || 0;
        let hasChanges = false;

        users.forEach(user => {

            if (!user._id) {

                usersID++;
                user._id = usersID;
                hasChanges = true;

            } else if (user._id > usersID) {

                usersID = user._id;
                hasChanges = true;

            }

        });

        if (hasChanges) {

            localStorage.setItem("usersID", usersID);
            localStorage.setItem("users", JSON.stringify(users));

        }

        return users

    }

    /**
     * Gera o próximo ID sequencial usado no cadastro de usuários.
     *
      @returns {number} Novo ID do usuário.
     */
    getNewID() {

        let usersID = parseInt(localStorage.getItem("usersID"));

        if (!usersID) usersID = 0;

        usersID++;

        localStorage.setItem("usersID", usersID);

        return usersID;

    }

    /**
     * Salva o usuário atual no localStorage.
     *
     * Quando o usuário já possui ID, atualiza o registro existente. Caso
     * contrário, gera um novo ID e adiciona o usuário na lista armazenada.
     */
    save() {

        let users = User.getUsersStorage();

        if (this.id > 0) {

            users.map(u => {

                if (u._id == this._id) {

                    Object.assign(u, this)

                }

                return u;

            });

        } else {

            this._id = this.getNewID();

            users.push(this);

        }

        localStorage.setItem("users", JSON.stringify(users));

    }

    /**
     * Remove o usuário atual do localStorage usando seu ID.
     */
    remove() {

        let users = User.getUsersStorage();

        users.forEach((userData, index) => {

            if (this._id == userData._id) {

                users.splice(index, 1)

            }

        });

        localStorage.setItem("users", JSON.stringify(users));

    }

}
